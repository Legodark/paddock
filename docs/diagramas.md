# Diagramas interactivos de Paddock

Generados con [Archify](https://github.com/tt-a1i/archify), versión 3.2.0, desde el commit `e37848822238e3a61b12739185cdadd49843a620`. No requieren instalar Archify para abrir sus HTML autónomos. Se utilizó una copia local del repositorio, sin instalar habilidades globales ni servicios externos.

1. [Arquitectura propuesta a coste cero](../.archify/architecture-paddock-propuesta-20261114-171724/paddock-propuesta.html): React, API Python con modelos compactos y catálogo SQLite bajo `paddock.juancerezo.com`.
2. [Flujo de una predicción sin Blob](../.archify/sequence-paddock-prediccion-20261114-171724/paddock-prediccion.html): validación de entradas, inferencia local y consulta de comparables.
3. [Evaluación y pasos previos a publicación](../.archify/workflow-paddock-validacion-20261114-171724/paddock-validacion.html): pruebas ya ejecutadas y condiciones pendientes de IDs, cuotas, preview y dominio.

Los tres describen la arquitectura propuesta. La API y el primer recorrido React ya están integrados localmente, pero no hay aplicación desplegada. El [estudio de costes](costes-y-diagramas.md) contiene las cuotas Hobby consultadas; el consumo compartido de compute sigue pendiente. Los modelos y el catálogo no se entregan al navegador en esta arquitectura.

## Comprobaciones realizadas

En los tres HTML pasaron los gates `validate`, `deliver` y `check` con perfil showcase. El primer gate de navegador falló por el sandbox de Chromium del entorno anterior. Tras publicar el entorno se repitió `finalize` con evidencia nueva en `review-2/`: el sandbox ya funciona y permite probar React por HTTP, pero la navegación de Archify a sus HTML locales falla con `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No se ha desactivado el sandbox ni alterado el transporte de Archify para obtener un resultado aparente.

Por ello, **no se consideran completamente finalizados por Archify ni revisados visualmente**. Los HTML sí se han generado y sus comprobaciones de estructura/procedencia han pasado. Los recibos JSON contiguos a cada HTML conservan el fallo de navegador; no se afirma un `finalize` exitoso.

Cuando haya un navegador compatible con esa navegación, repetir el `finalize` completo sobre cada `candidate.json` con un directorio de evidencia nuevo, por ejemplo `--out-dir <carpeta-del-diagrama>/review-3`, y verificar el resultado. El reintento mantuvo los candidatos y los mismos bytes de los HTML; los recibos de ambos intentos quedan preservados.
