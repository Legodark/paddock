# Revisión de la candidata y presupuesto Hobby

15 de noviembre de 2026. Seguimiento: [#8](https://github.com/Legodark/paddock/issues/8), [#9](https://github.com/Legodark/paddock/issues/9) y [PR #6](https://github.com/Legodark/paddock/pull/6). Esta fase revisa código y documentación y consulta la cuenta en modo lectura. No crea proyectos, publica aplicaciones, aplica firewall ni cambia DNS.

## Revisión técnica

Se inspeccionaron la inicialización y verificación de recursos, lectores compactos, validadores, consultas SQL, cliente HTTP, interpretación de filtros y preparador del paquete. Los IDs y modelos congelados conservan su contrato; la API usa parámetros SQL, SQLite inmutable, entradas acotadas y respuestas sin trazas. Los modelos permanecen fuera del directorio público. La CI alojada de la revisión anterior pasó 144 pruebas; la última ejecución del PR debe permanecer verde después de estas correcciones.

La revisión detectó dos cambios de entrega: documentos que todavía describían tag/CI pendientes y falta de un archivo público con los avisos completos de licencia del JavaScript distribuido. Se actualizan los estados y se añade `web/public/THIRD_PARTY_NOTICES.txt`, que Vite copia al paquete público. Incluye las licencias MIT de React, React DOM, Scheduler y la atribución de Feather para los trazados coincidentes de los iconos inline. La licencia Apache-2.0 de Archify se conserva junto a los diagramas, obtenida de su commit fijado. No se aplica una licencia global nueva al TFM, sus modelos o sus datos.

Esta revisión de la candidata no sustituye las comprobaciones de plataforma ni la revisión manual de UX. Los estados SEC-01/SEC-08 y las issues de preview siguen abiertos.

## Barrido del historial

Gitleaks **8.30.1**, con archivo oficial verificado por SHA-256, examinó los **116 commits alcanzables por las referencias locales**, en un checkout no shallow, usando sus reglas predeterminadas y redacción del 100 %. No se comprobaron valores contra servicios externos.

| Coincidencias brutas | Clasificación |
| ---: | --- |
| 2 | Falsos positivos: SHA-256 del tokenizer congelado en el exportador y su evidencia; se contrastaron con el código |
| 5 | Entradas `apiKey` de la configuración Firebase del SDK cliente Flutter archivado, en Android y las plataformas Dart |

Las cinco entradas Firebase no son claves privadas de una cuenta de servicio y no se usan en React ni en el runtime nuevo. No se ha comprobado su actividad ni sus restricciones en Google/Firebase; no se afirma que estén revocadas o que permitan acceso a datos. Si el proyecto Firebase sigue activo, su propietario deberá revisar restricciones y servicios habilitados desde la consola. No se reescribe el historial ni el tag para ocultar configuración pública del SDK.

La [evidencia revisada](evidence/revision-pr/history-scan.json) contiene únicamente regla, ubicación, commit y clasificación, sin valores. Se mantienen las siete coincidencias brutas; no se presenta el resultado como «cero secretos» ni como una garantía sobre referencias remotas no disponibles o patrones no detectables.

## Recursos, licencias y catálogo

- El nuevo frontend no distribuye imágenes, fuentes, Syncfusion ni Firebase del cliente antiguo. Los avisos de sus bibliotecas se incluyen en el archivo público; las licencias Python se conservan en el bundle del constructor.
- Los notebooks identifican **Autocasión** como origen del scraping histórico. El repositorio no aporta una licencia del catálogo o una autorización de reutilización pública. Se ha solicitado al usuario cualquier evidencia que conserve, sin acceder de nuevo a esa web.
- La API expone características de vehículos y provincia, sin vendedor, contacto ni dirección detallada. Esto no demuestra una autorización de reutilización ni una revisión exhaustiva de todos los cuadernos originales.
- No se añade una licencia genérica que atribuya derechos sobre el catálogo o modifique la autoría compartida. La cuestión de reutilización pública permanece abierta en [#17](https://github.com/Legodark/paddock/issues/17), vinculada a la revisión #8; no se declara cerrada la preparación de la release por el resultado de las pruebas.

Inventario y hashes: [licencias](evidence/revision-pr/licenses.json).

## Coste y riesgo operativo comprobados

La CLI autenticada confirma `legodarks-projects`, plan **Hobby activo**, sin trial declarado. Siguen existiendo tres proyectos y Paddock todavía no está creado. No se han habilitado compras o funciones de pago. La [consulta saneada](evidence/revision-pr/hobby.json) conserva solo los campos necesarios.

Las fuentes oficiales mantienen 4 CPU-h, 360 GB-h de memoria provisionada, un millón de invocaciones, 100 GB de Fast Data Transfer, 10 GB de Fast Origin Transfer y un millón de CDN Requests incluidos. Python admite 500 MB de bundle; la candidata medida ocupa 115,50 MiB. Hobby asigna 2 GB/1 vCPU con Fluid compute. Se mantienen modelos y SQLite empaquetados, sin Blob, Redis ni una base gestionada.

La tabla oficial de Functions no ofrece consumo bajo demanda en Hobby; ese modelo de facturación corresponde a Pro. El coste incremental previsto sigue siendo **0 €/mes mientras se conserve Hobby sin extras**. No se ha demostrado una capacidad mensual ni una disponibilidad continua para la aplicación.

`vercel billing usage --scope legodarks-projects --json` volvió a indicar que no dispone de datos de costes para el 1–15 de noviembre. No significa consumo cero. Las capturas antiguas de transferencia/CDN siguen siendo históricas; no se trasladan a este periodo. El margen compartido actual de compute sigue sin certificar.

La [documentación de Functions](https://vercel.com/docs/functions/usage-and-pricing#what-happens-when-a-hobby-team-exceeds-its-fluid-compute-allowance) advierte que una pausa del equipo puede afectar a **todos sus despliegues**, devolver `503 DEPLOYMENT_PAUSED` y mantenerse hasta que se tome una acción. No se debe prometer que esperar 30 días lo reactivará automáticamente. Este riesgo incluye a los otros proyectos del equipo y no se elimina creando un proyecto Paddock separado.

## Condiciones de la siguiente prueba

La issue #9 conserva el margen de compute como dato desconocido. La comprobación financiera no equivale a certificar que el portfolio esté aislado frente a una pausa por cuota. La preview de #10 sigue pendiente de resolver sus dependencias y de una decisión de publicación informada.

Para una primera prueba, preparar como máximo **20 peticiones de API**, sin reintentos automáticos ni carga volumétrica, con concurrencia máxima de dos y `maxDuration: 10`. Registrar arranque, rutas, consumo disponible y forma de retirar la preview; detenerse ante cuotas agotadas, 429/503 de plataforma o un requisito de pago. Esa cifra limita el procedimiento de prueba: no es un límite de gasto o cuota implementado en Vercel. Las pruebas completas de CI se mantienen en GitHub/local, sin invocar esa preview repetidamente.

Antes de producción deben quedar verificadas la protección de abuso, la plataforma, los recorridos de UX y la decisión sobre el catálogo. Las fuentes, sus hashes y las limitaciones están en [sources.json](evidence/revision-pr/sources.json). No se contrata Observability Plus ni se requieren nuevas capturas para documentar este resultado.
