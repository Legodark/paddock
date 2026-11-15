# CI reproducible de Paddock

La [workflow](../.github/workflows/ci.yml) comprueba la candidata sin desplegar, crear proyectos, modificar DNS ni usar credenciales de Vercel. Los mismos pasos se ejecutan localmente con [check.sh](check.sh). El original y el tag histórico no se modifican.

## Ejecución

Requisitos: Linux x86_64, Git, Bash, Node **24.22.1**, npm **11.9.0**, Python **3.12.14** y acceso a los registros de paquetes y las descargas públicas de GitHub. El punto de entrada exige esas versiones y un directorio nuevo fuera del checkout.

En este entorno, con Chromium ya instalado:

```bash
PADDOCK_CI_WORK=/workspace/.paddock/ci-new-run \
PADDOCK_CI_PYTHON=/workspace/.paddock/vercel-venv/bin/python \
PADDOCK_CHROMIUM=/usr/bin/chromium \
bash ci/check.sh
```

Cada repetición requiere otra ruta. El script instala dependencias con hashes y `npm ci`, y genera sus propios modelos y snapshot. No depende de `/workspace/.paddock/current-vercel-package`, de los artefactos ya preparados ni de una sesión autenticada.

En GitHub, `setup-python` y `setup-node` proporcionan las versiones declaradas; el paso de npm fija 11.9.0. La ruta absoluta de Python se conserva antes de instalar el intérprete de conversión para que `uv` no seleccione ese Python por el alias `python3`. La API verifica además Python 3.12.14 y obtiene de ese intérprete su directorio real de paquetes para la auditoría.

Si `PADDOCK_CHROMIUM` no está definido, se busca primero el Chrome/Chromium instalado en el runner. La imagen oficial `ubuntu-24.04` incluye Google Chrome; así se usa su integración con el sandbox del sistema. Solo si no hay navegador instalado se descarga el correspondiente a Playwright. El sandbox permanece habilitado y se registra la versión utilizada en `browser-environment.json`. La ejecución local verificada usó el Chromium del entorno; las primeras ejecuciones alojadas detectaron estas diferencias de selección de Python y arranque del Chromium descargado.

## Controles

1. Verifica los SHA-256 de ambos pickle y del tokenizer antes de importar código histórico o deserializar modelos. Los cambios o enlaces simbólicos no pasan el control.
2. Valida la workflow con `actionlint 1.7.12`, cuyo binario se descarga de su release oficial y se verifica por SHA-256; ejecuta también `bash -n`. No se ejecutan ShellCheck/Pyflakes en ese paso.
3. Prueba siete controles de CI: rechazo de modelos cambiados/symlinks, protección de la ruta directa de la función, equipo/alcance/algoritmo del firewall, rechazo de resultados incompletos u omitidos y diagnóstico seguro de fallos del navegador.
4. Convierte los modelos desde los archivos originales en un entorno mínimo Python **3.10.22** separado, con NumPy/SciPy/scikit-learn/joblib/threadpoolctl fijados y hashes. Ambos resultados deben coincidir exactamente con los SHA-256 compactos ya revisados. No genera de nuevo el gzip grande del regresor ni entrena o scrapea.
5. Audita npm de la web y las herramientas de construcción. Ejecuta pruebas unitarias, TypeScript y build. Prepara su paquete propio con SQLite inmutable y datos fuente verificados.
6. Ejecuta las pruebas de API y navegador contra esos recursos. Un fallo, test omitido o caso inestable no permite un resultado verde.
7. Construye con el runtime oficial y prueba la función materializada con `python -I -S`, usando exclusivamente sus dependencias. Comprueba la predicción de **20.155 €**, catálogo, clasificación, consulta real y aislamiento de archivos.
8. Audita las dependencias Python de la API y del bundle en modo estricto. Verifica los [presupuestos locales](budgets.json) de tamaño y genera un resumen de resultados reales.

El entorno de conversión utiliza scikit-learn 1.2.1 para reproducir archivos conocidos, con el [aviso acotado de TfidfVectorizer documentado](../docs/seguridad-reactivacion.md). Solo se usa el CountVectorizer congelado; esos paquetes no se sirven ni se incorporan a la función. No se ignoran avisos en las auditorías de producción. No se importa la aplicación antigua ni se instalan MongoDB/dnspython para exportar.

## Herramientas de construcción

[vercel-tooling/package.json](vercel-tooling/package.json) fija `@vercel/python 32.0.0` y `@vercel/build-utils 15.4.0`, con lockfile. La auditoría ampliada detectó seis paquetes marcados en el árbol del constructor; la API Python y la web continuaban sin avisos. El último constructor oficial consultado todavía fijaba versiones antiguas en `@vercel/python-analysis 0.15.3`.

Se actualizan explícitamente estas dependencias de análisis:

| Dependencia | Versión anterior | Versión fijada |
| --- | --- | --- |
| js-yaml | 4.1.1 | 4.3.2 |
| minimatch | 10.1.1 | 11.0.8 |
| smol-toml | 1.5.2 | 1.9.1 |
| zod | 3.22.4 | 4.6.7 |

Después, la auditoría npm del constructor devuelve cero vulnerabilidades conocidas. Hay cambios de versión mayor en minimatch/Zod: su compatibilidad se valida para **el proyecto Paddock basado en requirements.txt**, con empaquetado oficial, inventario y prueba WSGI. No se certifican otros formatos de manifiesto admitidos por Vercel. Cualquier modificación de ese flujo debe volver a pasar estas pruebas.

## Workflow, permisos y coste

Se ejecuta en push a `main` o a la rama de revisión `codex/paddock-reactivacion`, pull requests, petición manual y una vez a la semana para detectar avisos nuevos. Tiene 25 minutos de timeout y cancela ejecuciones anteriores de la misma referencia. Usa `pull_request`, permisos `contents: read` y checkout sin credenciales persistentes. No solicita secretos, permisos de escritura o acceso OIDC.

Las tres acciones oficiales están fijadas a commits, verificados mediante Git y sus `action.yml`; usan Node 24. El binario de actionlint también está fijado y verificado. Los informes se publican como resumen, anotaciones y logs del job; no hay subida de binarios, artefactos de Actions ni cachés persistentes configuradas. Se usan runners estándar de este repositorio público. La [ejecución alojada verificada](../docs/entrega-github.md) pasó 144 pruebas. No se han contratado servicios.

Los informes completos locales quedan bajo `PADDOCK_CI_WORK/reports`; las capturas/trazas temporales de Playwright, en `web/test-results/`, ignorado en Git. La evidencia pequeña revisable está en [docs/evidence/ci](../docs/evidence/ci/summary.json). Preparar este archivo no activa protección de ramas ni publica código: esos ajustes no se han modificado.

## Firewall

La CI comprueba la forma y las rutas de la [propuesta local de firewall](../security/vercel-firewall.json). No prueba un contador real ni publica reglas. El [informe de protección gratuita](../docs/proteccion-vercel.md) explica inclusión Hobby, límites y las pruebas pendientes de plataforma.
