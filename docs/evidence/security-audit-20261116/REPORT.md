# Auditoría de fuentes de Paddock · Cloudflare security-audit

**Pasada parcial por alcance**, perfil `standard`, finalizada el 16-11-2026 sobre `5e8091b6fb8a88ec4c4550b9356dd7026d44b42e`. Alcance: `web/`, `deploy/vercel/`, `tools/`, `ci/`, `.github/workflows/` y `security/`. Las fuentes revisadas no cambiaron durante la ejecución. El código de producción de la Preview pertenece a una referencia anterior; este informe no identifica por sí solo qué artefacto ejecuta el proveedor.

Se usaron 13 de un máximo de 32 invocaciones de agentes: cuatro reconocimientos, cinco búsquedas por frontera, dos turnos administrativos para materializar sus JSON sin reescribirlos y dos críticos de cobertura distintos. No hubo candidatos supervivientes: las fases de validación y verificación por registro tuvieron conjunto vacío. No se inventaron revisiones por hallazgo inexistentes. Los dos críticos independientes terminaron sin unidades omitidas aceptadas o reasignaciones pendientes.

Política `sandboxed-source-and-local-only`; esta pasada fue **solo de fuentes**, sin ejecutar código del objetivo, pruebas, navegador, modelos, fixtures o builds, sin consultas de red/proveedor dentro de la auditoría y sin instalaciones. Todos los checks son `method: source`, con `artifact: null`. La prueba básica anterior de namespaces no se presenta como un perfil completo de ejecución ni como cobertura dinámica. No hubo ficheros producidos por el objetivo que promover. Una reproducción futura requiere verificar todos los controles de aislamiento y promoción antes de ejecutarse.

No existía un ledger/findings compatible previo de este proyecto. Los informes anteriores orientaron el alcance; no se heredó cobertura ni un hallazgo confirmado por su mera existencia. Las pruebas históricas de CI y Vercel permanecen como evidencia separada.

## Resultado

**Cero vulnerabilidades confirmadas y cero candidatos `needs_validation` retenidos en esta pasada.** No es una garantía de ausencia de vulnerabilidades o de seguridad completa de producción. `findings.json` contiene una lista vacía validada, no avisos sin fundamento o severidades artificiales.

| Veredicto | Registros |
| --- | ---: |
| Confirmed | 0 |
| Needs validation | 0 |
| Rejected tras validación formal | 0 |

No hubo candidato con una frontera fallida, impacto concreto y evidencia suficientes para pasar a validación formal. Las cuestiones de publicación/consumo ajenas al código no se convirtieron en vulnerabilidades especulativas.

## Cobertura y patrones comprobados

El ledger registra **47 unidades cubiertas por lectura de fuentes** y dos fuera de alcance; cero unidades candidatas, bloqueadas o aplazadas. Tiene propietarios, rutas revisadas, invariantes, resultados y mapas de clases por unidad. Los validadores prueban consistencia de formato/estado, no verdad empírica o exhaustividad.

- API: seis rutas, schemas exactos, límites de cuerpo/query/texto/resultados, tipos/rangos finitos, coherencia marca-modelo, SQL fijo con parámetros y SQLite inmutable. Las lecturas del catálogo común son una función prevista; no se atribuye un sistema de usuarios/tenants que no existe.
- Runtime: selección de assets por operador, conjunto de archivos fijo, tamaños/hashes y digest independiente de modelos antes de lectores no-pickle. Estructuras acotadas, hijos hacia delante, limpieza de mmap/conexiones y fallos de inicialización controlados.
- Navegador: validación de respuestas, texto escapado por React, imágenes y enlaces de origen fijado, ausencia de sinks ejecutables/mezclas profundas, navegación fija, cancelación y estado/confirmación coherentes. No se ejecutó un navegador en esta pasada.
- Entrega/CI: dependencias bloqueadas y con integridad, acciones/artefactos fijados, permisos declarados de lectura, sin credenciales persistidas o publicación en el workflow, separación public/assets, salidas nuevas y consumo controlado de reportes.
- Recursos/configuración: parsing e inferencia acotados, snapshot fijo, ausencia de colas o reintentos autónomos, límites por petición y separación explícita entre declaraciones locales y controles efectivos de proveedor.

## Mejoras de mantenimiento, no vulnerabilidades

1. La futura promoción debe vincular aprobación, commit, hashes y despliegue final; un nombre de directorio no identifica un artefacto probado. El procedimiento de release lo incorpora por separado.
2. Revisar el contenido de nuevos archivos públicos: una extensión permitida no clasifica secretos automáticamente. No se identificó una credencial o modelo privado actualmente expuesto.
3. Si crece el snapshot, considerar índice por precio/año/id o deadline SQLite tras medir el coste. No se demostró agotamiento de recursos con el catálogo congelado actual.
4. El abort del navegador no garantiza cancelación del trabajo WSGI síncrono ya iniciado; la fuente no muestra trabajo de fondo persistente o ilimitado. No se probó una caída compartida ni se infirió esa garantía.
5. La declaración local del firewall no acredita su aplicación remota. Sus pruebas de Vercel y su estado real están documentados en #11, fuera de este informe de fuentes.

## Límites y trabajo de entrega separado

Fuera de alcance: aplicación Flutter/backend original archivada y notebooks/entrenamiento histórico (dos unidades explícitas), pruebas de infraestructura compartida, revisión del código de cada dependencia o imagen gestionada, dispositivos físicos/lector de pantalla y evaluación de derechos del catálogo. No hay una pasada previa compatible, y una pasada no agota el proyecto.

Permanecen #10 (consumo real y margen mensual), #11 (variantes bajo bloqueo/destino del 308, con simultaneidad estática no probada), #12 (revisión manual), #17 (alcance público del catálogo) y #14 (producción, rollback y dominio). No son nuevos registros de vulnerabilidad Cloudflare. Las pruebas previas acreditan el umbral canónico del firewall y otros hechos, pero este informe no los reproduce ni autoriza tráfico adicional.

Si cambia una ruta, contrato, interpretación, salida pública o entrega, revalidar sus unidades contra la nueva fuente. Este resultado permite cerrar la auditoría de fuentes #24 con sus límites; no autoriza publicar, cambiar DNS o contratar servicios.

## Procedencia

Metodología MIT de Cloudflare `security-audit-skill`, commit `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`. Informes derivados de `findings.json`, `coverage-ledger.json`, notas de mantenimiento y críticos de cobertura; fuente y hashes en `source-snapshot.json`. Los detalles de candidatos de severidad media o superior están vacíos porque no hay tales registros.
