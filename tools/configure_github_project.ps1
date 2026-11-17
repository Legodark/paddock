#Requires -Version 5.1
<#
Creates the Paddock board using the local GitHub CLI identity.
Run with -InspectOnly to check access without writing to GitHub.
No credential is read by this script; gh handles authentication.
#>
[CmdletBinding()]
param([switch]$InspectOnly)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$owner = 'Legodark'
$repo = 'paddock'
$title = 'Paddock - Reactivacion del TFM'

function Invoke-GhJson {
    param([string[]]$GhArguments, [object]$Payload)
    $inputFile = $null
    try {
        if ($null -ne $Payload) {
            $inputFile = [IO.Path]::GetTempFileName()
            $json = ConvertTo-Json -InputObject $Payload -Depth 30 -Compress
            [IO.File]::WriteAllText($inputFile, $json, (New-Object Text.UTF8Encoding($false)))
            $GhArguments += @('--input', $inputFile)
        }
        $result = & gh @GhArguments
        if ($LASTEXITCODE -ne 0) {
            throw 'GitHub CLI failed. Check the error above; no successful completion is assumed.'
        }
        return (($result -join "`n") | ConvertFrom-Json)
    }
    finally {
        if ($inputFile) { Remove-Item -LiteralPath $inputFile -Force }
    }
}

function Invoke-Graph {
    param([string]$Query, [hashtable]$Variables = @{})
    $response = Invoke-GhJson -GhArguments @('api', 'graphql') -Payload @{query=$Query; variables=$Variables}
    if ($response.PSObject.Properties['errors']) {
        throw ($response.errors | ConvertTo-Json -Depth 8)
    }
    return $response.data
}

function Get-Project {
    param([string]$Id)
    $data = Invoke-Graph @'
query($id:ID!) {
  node(id:$id) { ... on ProjectV2 {
    id number title url viewerCanUpdate
    repositories(first:100) { nodes { nameWithOwner } }
    fields(first:100) { nodes {
      ... on ProjectV2Field { id name }
      ... on ProjectV2SingleSelectField { id name options { id name color description } }
    } }
    views(first:100) { nodes { id name layout } }
    workflows(first:100) { nodes { name enabled } }
    items(first:100) { pageInfo { hasNextPage } nodes {
      id isArchived
      content { ... on Issue { id number state } ... on PullRequest { id number state isDraft } }
      status:fieldValueByName(name:"Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
    } }
  } }
}
'@ @{id=$Id}
    return $data.node
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'Install GitHub CLI: winget install --id GitHub.cli --exact ; then open a new PowerShell.'
}
$viewer = Invoke-GhJson -GhArguments @('api', 'user')
if ($viewer.login -cne $owner) { throw "Expected account $owner; got $($viewer.login). Switch accounts in gh first." }

# Read other boards for reference; never change or copy their contents.
$discovery = Invoke-Graph @'
query($owner:String!) {
  user(login:$owner) { projectsV2(first:100) { pageInfo { hasNextPage } nodes {
    id number title url closed
    views(first:20) { nodes { name layout } }
    fields(first:30) { nodes { ... on ProjectV2SingleSelectField { name options { name } } } }
  } } }
  repository(owner:$owner,name:"paddock") { id nameWithOwner }
}
'@ @{owner=$owner}
if ($discovery.user.projectsV2.pageInfo.hasNextPage) {
    throw 'More than 100 projects: stop rather than risk creating a duplicate.'
}
foreach ($reference in $discovery.user.projectsV2.nodes) {
    $statusReference = @($reference.fields.nodes | Where-Object { $_.PSObject.Properties['name'] -and $_.name -eq 'Status' })
    $names = @($statusReference | ForEach-Object { $_.options.name }) -join ', '
    Write-Host "Existing project: $($reference.title) | Status: $names"
}
$matches = @($discovery.user.projectsV2.nodes | Where-Object { $_.title -ceq $title })
if ($matches.Count -gt 1) { throw 'Multiple matching Paddock projects. Resolve the duplicate before continuing.' }
if ($matches.Count -eq 1 -and $matches[0].closed) { throw 'The matching project is closed; review it before continuing.' }
if ($InspectOnly) { Write-Host 'Read-only check passed. No changes made.'; return }

if ($matches.Count -eq 0) {
    $created = Invoke-Graph @'
mutation($input:CreateProjectV2Input!) {
  createProjectV2(input:$input) { projectV2 { id } }
}
'@ @{input=@{ownerId=$viewer.node_id; title=$title; repositoryId=$discovery.repository.id}}
    $projectId = $created.createProjectV2.projectV2.id
}
else { $projectId = $matches[0].id }
$project = Get-Project $projectId
if (-not $project.viewerCanUpdate) { throw 'The current account cannot update this project.' }
if ($project.items.pageInfo.hasNextPage) { throw 'More than 100 board items. Stop before changing existing work.' }
$otherRepos = @($project.repositories.nodes | Where-Object { $_.nameWithOwner -cne "$owner/$repo" })
if ($otherRepos.Count) { throw 'The matching project is shared with another repository. Stop to preserve it.' }

$null = Invoke-Graph @'
mutation($input:LinkProjectV2ToRepositoryInput!) {
  linkProjectV2ToRepository(input:$input) { repository { id } }
}
'@ @{input=@{projectId=$projectId; repositoryId=$discovery.repository.id}}
$null = Invoke-Graph @'
mutation($input:UpdateProjectV2Input!) {
  updateProjectV2(input:$input) { projectV2 { id } }
}
'@ @{input=@{projectId=$projectId; shortDescription='TFM historico de 2023. Objetivo: paddock.juancerezo.com, 0 EUR adicionales. Seguimiento #7; PR #6 abierto.'}}

$statusFields = @($project.fields.nodes | Where-Object { $_.PSObject.Properties['name'] -and $_.name -eq 'Status' })
if ($statusFields.Count -ne 1) { throw 'Expected exactly one Status field.' }
$status = $statusFields[0]
$desired = @(
    @{name='Backlog'; color='GRAY'; description='Trabajo pendiente o con dependencias.'},
    @{name='Listo'; color='BLUE'; description='Preparado para empezar.'},
    @{name='En curso'; color='YELLOW'; description='Trabajo iniciado con tareas pendientes.'},
    @{name='En revision'; color='PURPLE'; description='PR listo para revisar; no implica merge ni despliegue.'},
    @{name='Hecho'; color='GREEN'; description='Criterios de la tarea verificados y tarea cerrada.'}
)
$aliases = @{'Backlog'='Todo|To do'; 'En curso'='In Progress|In progress'; 'Hecho'='Done'}
$usedIds = @()
$options = @()
foreach ($definition in $desired) {
    $existing = @($status.options | Where-Object { $_.name -ceq $definition.name })
    if (-not $existing.Count -and $aliases.ContainsKey($definition.name)) {
        $pattern = '^(' + $aliases[$definition.name] + ')$'
        $existing = @($status.options | Where-Object { $_.name -match $pattern })
    }
    if ($existing.Count -gt 1) { throw 'Ambiguous status mapping. Review the board before changing its options.' }
    $option = @{name=$definition.name; color=$definition.color; description=$definition.description}
    if ($existing.Count) { $option.id=$existing[0].id; $usedIds += $existing[0].id }
    $options += $option
}
# Preserve every unrelated option and its ID; no existing column is deleted.
foreach ($extra in @($status.options | Where-Object { $_.id -notin $usedIds })) {
    $options += @{id=$extra.id; name=$extra.name; color=$extra.color; description=$extra.description}
}
$null = Invoke-Graph @'
mutation($input:UpdateProjectV2FieldInput!) {
  updateProjectV2Field(input:$input) { projectV2Field { ... on ProjectV2SingleSelectField { id } } }
}
'@ @{input=@{fieldId=$status.id; singleSelectOptions=$options}}

$board = @($project.views.nodes | Where-Object { $_.name -ceq 'Kanban' })
if ($board.Count -gt 1) { throw 'Multiple Kanban views found. Review them before continuing.' }
if (-not $board.Count) {
    $null = Invoke-Graph @'
mutation($input:CreateProjectV2ViewInput!) {
  createProjectV2View(input:$input) { projectV2View { id } }
}
'@ @{input=@{projectId=$projectId; name='Kanban'; layout='BOARD_LAYOUT'}}
}
elseif ($board[0].layout -ne 'BOARD_LAYOUT') {
    $null = Invoke-Graph @'
mutation($input:UpdateProjectV2ViewInput!) {
  updateProjectV2View(input:$input) { projectV2View { id } }
}
'@ @{input=@{viewId=$board[0].id; layout='BOARD_LAYOUT'}}
}

$project = Get-Project $projectId
$status = @($project.fields.nodes | Where-Object { $_.PSObject.Properties['name'] -and $_.name -eq 'Status' })[0]
# Include all issues and PRs currently assigned to the delivery milestone.
$tasks = @(Invoke-GhJson -GhArguments @('api', "repos/$owner/$repo/issues?milestone=1&state=all&per_page=100"))
if ($tasks.Count -ge 100) { throw 'Milestone reached the page limit. Stop to avoid silently omitting tasks.' }
foreach ($task in $tasks) {
    $existingItem = @($project.items.nodes | Where-Object { $null -ne $_.content -and $_.content.id -eq $task.node_id })
    if ($existingItem.Count -gt 1) { throw "Duplicate card for #$($task.number)." }
    if ($existingItem.Count -and $existingItem[0].isArchived) { continue }
    if ($existingItem.Count) { $itemId = $existingItem[0].id }
    else {
        $added = Invoke-Graph @'
mutation($input:AddProjectV2ItemByIdInput!) {
  addProjectV2ItemById(input:$input) { item { id } }
}
'@ @{input=@{projectId=$projectId; contentId=$task.node_id}}
        $itemId = $added.addProjectV2ItemById.item.id
    }
    # Preserve manual progress when rerun. A closed issue/merged PR can advance.
    if ($task.state -eq 'open' -and $existingItem.Count -and $null -ne $existingItem[0].status) { continue }
    $state = 'Backlog'
    if ($task.PSObject.Properties['pull_request']) {
        $pr = Invoke-GhJson -GhArguments @('api', "repos/$owner/$repo/pulls/$($task.number)")
        if ($pr.merged) { $state = 'Hecho' }
        elseif ($pr.state -eq 'open' -and -not $pr.draft) { $state = 'En revision' }
        elseif ($pr.state -eq 'open') { $state = 'Listo' }
    }
    elseif ($task.state -eq 'closed') { $state = 'Hecho' }
    elseif ($task.number -in @(7,12,16)) { $state = 'En curso' }
    elseif ($task.number -eq 17) { $state = 'Listo' }
    $selected = @($status.options | Where-Object { $_.name -ceq $state })
    if ($selected.Count -ne 1) { throw "Missing status: $state" }
    $null = Invoke-Graph @'
mutation($input:UpdateProjectV2ItemFieldValueInput!) {
  updateProjectV2ItemFieldValue(input:$input) { projectV2Item { id } }
}
'@ @{input=@{projectId=$projectId; itemId=$itemId; fieldId=$status.id; value=@{singleSelectOptionId=$selected[0].id}}}
}

$verified = Get-Project $projectId
$missing = @($tasks | Where-Object { $_.node_id -notin @($verified.items.nodes | Where-Object { $null -ne $_.content } | ForEach-Object { $_.content.id }) })
if ($missing.Count) { throw "Verification failed: missing cards $($missing.number -join ', ')." }
if (-not @($verified.views.nodes | Where-Object { $_.name -ceq 'Kanban' -and $_.layout -eq 'BOARD_LAYOUT' }).Count) {
    throw 'Board view verification failed.'
}
Write-Host "`nVerified: $($tasks.Count) milestone cards. $($verified.url)"
foreach ($card in $verified.items.nodes) {
    if ($null -ne $card.content) {
        $label = '(no status)'
        if ($null -ne $card.status) { $label = $card.status.name }
        Write-Host "#$($card.content.number): $label"
    }
}
Write-Host '`nWorkflows reported by GitHub (these have NOT been configured by the script):'
$verified.workflows.nodes | Format-Table name, enabled | Out-Host
Write-Host 'Open the board: group Kanban by Status and confirm these workflows in Settings > Workflows:'
Write-Host 'Auto-add: repo:Legodark/paddock ; Pull request merged: Hecho.'
Write-Host 'Item closed: Hecho only for issues; leave it disabled if the UI cannot exclude unmerged PRs.'
Write-Host 'Issue #16 stays open until the actual board and remaining UI settings are checked.'
Write-Host 'Send only the project URL and the result summary, never credentials.'
