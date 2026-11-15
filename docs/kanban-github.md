# Kanban de Paddock

El [Kanban de Paddock](https://github.com/users/Legodark/projects/3) está creado. El 15 de noviembre de 2026, el propietario ejecutó el script desde Windows PowerShell 5.1 con la cuenta `Legodark` y aportó la salida: `Verified: 12 milestone cards`. La carga incluye las 11 issues del seguimiento y el PR #6, con los estados previstos. El script también consultó los otros dos paneles sin modificar sus tareas.

Quedan pendientes la confirmación visual de la agrupación por `Status` y los ajustes de automatización de [#16](https://github.com/Legodark/paddock/issues/16). La integración de esta nube sigue rechazando Projects con `Resource not accessible by integration`, incluida una nueva consulta del panel 3. Esto limita su gestión desde la nube; la creación y el acceso local ya están acreditados. No hace falta repetir la autorización ni crear otro panel.

| Estado en la ejecución aportada | Tarjetas |
| --- | --- |
| Backlog | #10, #11, #14, #15 |
| Listo | #17 |
| En curso | #7, #12, #16 |
| En revision | PR #6 |
| Hecho | #8, #9, #13 |

## Ejecución desde Windows

Usar PowerShell y la cuenta `Legodark`. Si falta GitHub CLI:

```powershell
winget install --id GitHub.cli --exact
```

Abrir otra terminal después de instalar. Autenticar GitHub CLI localmente; ninguna credencial se envía al chat:

```powershell
gh auth login --hostname github.com --git-protocol https --web --scopes project
```

Si ya se usa GitHub CLI con la cuenta correcta, basta `gh auth refresh --hostname github.com --scopes project`. Una variable local `GH_TOKEN` o `GITHUB_TOKEN` tiene preferencia sobre esta sesión; si el acceso vuelve a fallar, comprobar la identidad efectiva con `gh auth status`, sin copiar sus credenciales.

Desde una copia del repositorio en `codex/paddock-reactivacion`:

```powershell
git pull --ff-only
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\configure_github_project.ps1 -InspectOnly
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\configure_github_project.ps1
```

`ExecutionPolicy Bypass` se limita al proceso que ejecuta este archivo revisable; no cambia la política de Windows. El script exige `Legodark`, consulta los otros paneles sin modificarlos, crea o reutiliza por título `Paddock - Reactivacion del TFM`, lo vincula al repositorio y crea una vista Kanban. Mantiene las columnas existentes y sus identificadores, añade los cinco estados del plan e incorpora las issues y PRs del milestone 1. Conserva el progreso manual al repetirlo y verifica el resultado. No fusiona PRs, no cierra issues, no publica la aplicación y no cambia DNS. No declara la automatización configurada.

La primera carga refleja las tres issues cerradas (#8, #9 y #13) como Hecho, el PR abierto #6 como En revisión, #7/#12/#16 como En curso, #17 como Listo y las tareas bloqueadas en Backlog. Un PR cerrado sin merge no se presenta como entrega completada.

## Ajustes finales en GitHub

1. Abrir el [panel 3](https://github.com/users/Legodark/projects/3) y comprobar que Kanban agrupa por `Status`.
2. En **Settings → Workflows**, añadir/habilitar **Auto-add to project** con filtro `repo:Legodark/paddock`, para nuevas issues y PRs. Si el plan permite un solo flujo de incorporación, este filtro cubre ambos tipos. La salida aportada muestra **Auto-add sub-issues to project** activo: ese flujo incorpora subtareas y no acredita la incorporación de cualquier nueva issue o PR del repositorio.
3. **Pull request merged** e **Item closed** aparecen activos, pero la salida no indica sus estados de destino ni sus filtros. Confirmar que el primero envía a `Hecho`. Usar **Item closed** solo si permite limitarlo a issues; si no permite excluir PRs cerrados sin merge, dejarlo desactivado y mover las issues cerradas manualmente o al repetir el script. No tratar automáticamente un PR cerrado sin merge como trabajo entregado.
4. Registrar la comprobación de estos ajustes en #16 y cerrar la issue solo cuando sus criterios estén acreditados. La URL y la carga inicial ya se han aportado.

La API disponible permite crear vistas y modificar estados, pero no ofrece mutaciones para crear o configurar los workflows de Projects. Estos ajustes requieren la interfaz de GitHub; el script enumera los workflows y su estado real. No se añade un token a Actions para eludir esa limitación. No se han activado servicios de pago.

## Validación del script

Antes de la ejecución del propietario, se comprobó la sintaxis con PowerShell 7.4.6 y se ejecutó contra una API simulada con estado: modo de consulta sin escrituras, creación y repetición sin duplicados, conservación del progreso manual y de identificadores de columnas, PR abierto, borrador y PR cerrado sin merge, y rechazo de cuenta incorrecta, falta de permisos o panel compartido con otro repositorio. La muestra simulada contenía 14 tarjetas. La ejecución real posterior en Windows PowerShell 5.1 acreditó las 12 tarjetas del milestone y sus estados, según la salida aportada por el propietario. La agrupación visual y los destinos/filtros de los workflows no se infieren de esa salida.
