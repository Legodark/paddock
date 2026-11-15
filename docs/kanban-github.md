# Kanban de Paddock

La autorización OAuth de GitHub CLI se completó el 15 de noviembre de 2026, pero las peticiones de esta máquina siguen llegando a GitHub como la integración de Codex. Projects devuelve `Resource not accessible by integration`. El panel **todavía no está creado** y [#16](https://github.com/Legodark/paddock/issues/16) permanece abierta. No hacen falta nuevos dominios de red ni ampliar la selección de repositorios.

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

1. Abrir la URL que devuelve el script y comprobar que Kanban agrupa por `Status`.
2. En **Settings → Workflows**, habilitar **Auto-add to project** con filtro `repo:Legodark/paddock`, para nuevas issues y PRs. Si el plan permite un solo flujo de incorporación, este filtro cubre ambos tipos.
3. Activar **Pull request merged** para enviar a `Hecho`. Usar **Item closed** solo si permite limitarlo a issues; si no permite excluir PRs cerrados sin merge, dejarlo desactivado y mover las issues cerradas manualmente o al repetir el script. No tratar automáticamente un PR cerrado sin merge como trabajo entregado.
4. Compartir la URL del panel y el resumen de salida. Verificar las tarjetas, vincular el panel desde #7 y cerrar #16 solo cuando sus criterios estén acreditados.

La API disponible permite crear vistas y modificar estados, pero no ofrece mutaciones para crear o configurar los workflows de Projects. Estos ajustes requieren la interfaz de GitHub; el script enumera los workflows y su estado real. No se añade un token a Actions para eludir esa limitación. No se han activado servicios de pago.

## Validación del script

Se comprobó la sintaxis con PowerShell 7.4.6 y se ejecutó contra una API simulada con estado: modo de consulta sin escrituras, creación y repetición sin duplicados, conservación del progreso manual y de identificadores de columnas, PR abierto, borrador y PR cerrado sin merge, y rechazo de cuenta incorrecta, falta de permisos o panel compartido con otro repositorio. La muestra simulada contenía 14 tarjetas; el milestone real contiene 12 al preparar esta herramienta. No son pruebas contra un panel real ni una ejecución en Windows. La consulta real desde la nube sigue rechazando Projects, por lo que queda pendiente la ejecución local y la comprobación del resultado.
