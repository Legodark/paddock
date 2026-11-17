# API candidata para Vercel

Paquete de los modelos congelados de Paddock, ya publicado como [Preview privada verificada en Hobby](../../docs/preview-vercel.md). El frontend React está en [web](../../web/README.md) y se incorpora con `--web-dist web/dist`. La release pública y el dominio propio siguen pendientes. El backend y Flutter históricos permanecen intactos en `padook/`.

Usa Python 3.12, Flask con dependencias fijadas y hashes, los bosques compactos y SQLite inmutable. No requiere MongoDB, Blob, NumPy, SciPy, scikit-learn, joblib ni APIs de IA de pago en producción. No hace scraping ni entrenamiento.

## Preparar y ejecutar localmente

Desde la raíz del repositorio, con los artefactos compactos ya generados según `experiments/model-compact/README.md`:

```bash
export UV_CACHE_DIR=/workspace/.paddock/uv-cache
uv venv --python 3.12 /workspace/.paddock/vercel-venv
uv pip install --python /workspace/.paddock/vercel-venv/bin/python --require-hashes -r deploy/vercel/requirements.txt
python3 tools/prepare_vercel_package.py --output /workspace/.paddock/vercel-package
PADDOCK_ASSET_DIR=/workspace/.paddock/vercel-package/assets PYTHONDONTWRITEBYTECODE=1 /workspace/.paddock/vercel-venv/bin/python -m unittest discover -s deploy/vercel/tests -v
```

El preparador exige un directorio de salida nuevo para preservar archivos existentes. Usar otra ruta en ejecuciones posteriores. Las fuentes y datos se verifican por SHA-256 antes de generar el paquete. Los binarios y el SQLite quedan fuera del checkout.

Desde `deploy/vercel`, con esa salida:

```bash
PADDOCK_ASSET_DIR=/workspace/.paddock/vercel-package/assets PYTHONDONTWRITEBYTECODE=1 /workspace/.paddock/vercel-venv/bin/python -m flask --app api.index run --host=127.0.0.1 --port=5051 --no-reload
```

Este servidor es solo para desarrollo interno; el despliegue usa el handler WSGI del runtime oficial. En la configuración del entorno se guarda una ruta actualizada en `/workspace/.paddock/current-vercel-package` cuando se ejecuta el instalador.

## Contrato HTTP

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/v1/health` | Readiness: checksums, formato, modelos y recuento SQLite |
| GET | `/api/v1/catalog` | Catálogo con IDs originales: 542 modelos del selector y siete combustibles |
| GET | `/api/v1/search-catalog` | Catálogo completo para consultas: 719 modelos, ocho combustibles y 50 provincias |
| POST | `/api/v1/predict` | Predicción y hasta cinco comparables baratos y cinco caros |
| POST | `/api/v1/message` | Clasificación del mensaje; no genera respuestas ni interpreta todos los filtros del chatbot |
| GET | `/api/v1/cars` | Consulta acotada, con filtros numéricos y categóricos |

Ejemplo de regresión comprobado: Citroen C3 aircross con `model_id=118` canónico. Desde otra terminal:

```bash
curl --fail --silent --show-error http://127.0.0.1:5051/api/v1/health
curl --fail --silent --show-error http://127.0.0.1:5051/api/v1/predict \
  -H 'Content-Type: application/json' \
  --data '{"catalog_version":"tfm-original-csv-v1","year":2022,"horses":110,"km":7119,"displ_engine":1199,"marches":6,"brand_id":"10","model_id":"118","fuel_id":"3","gearbox_id":"1"}'
```

Esperado: `ready=true` en health y `prediccion=20155.0` con comparables reales en predict. Son resultados históricos, no tasaciones del mercado actual.

Predicción exige exactamente los campos del ejemplo, con `catalog_version` explícito. Los IDs pueden ser strings canónicos o enteros; no se aceptan floats, booleanos ni IDs inferidos como «antiguos». El par marca/modelo se verifica con el contrato auditado. No existe un adapter público automático para IDs heredados.

El sobre de entrada actual admite año entero 1993–2023, CV 1–887, km 0–499.999, cilindrada 0–8.300 y marchas enteras 0–10. Permite cilindrada/marchas cero para no excluir eléctricos. Son límites de servicio elegidos para esta demo histórica, no una certificación de cobertura del entrenamiento. Pedir valores fuera del sobre devuelve 400.

`message` acepta `{"message":"Muestrame Citroen C3"}` y devuelve `contexto=0`. Máximo 2.000 caracteres; cuerpo HTTP máximo de 16 KiB. Los mensajes no se colocan en query strings.

`cars` acepta IDs `brand_id`, `model_id`, `fuel_id`, `gearbox_id`; `location` exactamente como aparece en `search-catalog`; `limit` entre 1 y 10; y sufijos `_min`/`_max` inclusivos y `_gt`/`_lt` estrictos para `year`, `horses`, `km`, `engine`, `marches` y `price`. Un valor exacto se expresa con mínimo y máximo iguales. Ejemplo: `?brand_id=10&location=M%C3%A1laga&price_lt=20000&limit=3`. Se rechazan filtros desconocidos/duplicados, pares marca/modelo incompatibles, límites contradictorios, años/marchas fraccionarios, números no finitos y query strings de más de 2.048 bytes. SQL usa parámetros y columnas de una lista fija. Los resultados usan nombres ingleses y valores numéricos; React consume este contrato, no las URLs antiguas de Flutter.

El [chatbot React](../../docs/chatbot-react.md) ya incluye el intérprete de filtros. El clasificador sigue siendo el mismo bosque congelado; los mensajes se envían por POST. La [revisión de seguridad local](../../docs/seguridad-reactivacion.md) no sustituye la validación del despliegue y protección de plataforma.

## Empaquetar con Vercel, sin desplegar

Se verificó `@vercel/python@32.0.0`, con su peer `@vercel/build-utils@15.4.0`. La herramienta está fuera de la aplicación y no añade dependencias al runtime del modelo.

```bash
npm --cache /workspace/.paddock/npm-cache install --prefix /workspace/.paddock/vercel-tooling --ignore-scripts --save-exact @vercel/python@32.0.0
UV_CACHE_DIR=/workspace/.paddock/uv-cache UV_PYTHON_INSTALL_DIR=/workspace/.paddock/python UV_PYTHON_BIN_DIR=/workspace/.paddock/bin XDG_CACHE_HOME=/workspace/.paddock/cache PYTHONDONTWRITEBYTECODE=1 node tools/build_vercel_package.cjs /workspace/.paddock/vercel-package /workspace/.paddock/vercel-build-new
```

También aquí se exige una salida nueva. El builder oficial puede generar pyproject/lock/cachés en el directorio externo de construcción; no modifica la aplicación histórica ni las fuentes del paquete. Se guardan el inventario, el tamaño real y una copia materializada de los archivos de la función.

Resultado medido: **115,50 MiB sin comprimir**, 369 archivos, runtime `python3.12`. La función materializada se probó con `python3 -S`, usando sus dependencias `_vendor` y sus propios assets: readiness, predicción dorada, comparables, catálogo y clasificación correctos. Ver [evidencias](../../docs/paquete-vercel.md).

## Alcance de la configuración y publicación pendiente

- `vercel.json` incluye los assets en la función y reescribe `/api/*` al entrypoint WSGI. `outputDirectory` limita los archivos estáticos a `public/`; `public/` se excluye de la función Python. Sin `--web-dist`, el paquete contiene solo robots de no indexación y no tiene página de inicio; con esa opción incluye la distribución React ya compilada.
- Las cabeceras restrictivas del documento React se configuran en `vercel.json` y se prueban en la preview local de Vite. La comprobación de sus valores efectivos y del routing en Vercel sigue pendiente.
- Modelos, contrato y SQLite viven bajo `assets/`, fuera de `public/`. No debe añadirse un rewrite que los exponga.
- `maxDuration: 10` limita una petición; **no es un límite de gasto de la cuenta**. No se fija memoria ni se activan servicios o funcionalidades de pago.
- La API aplica límites de entradas/resultados, SQLite de solo lectura, comprobaciones de formato y hashes, errores JSON sin rutas internas y ausencia de CORS abierto. Sigue pendiente una revisión completa de seguridad y control de abuso a nivel de plataforma.
- Los assets generados no están en Git. No basta con enlazar `deploy/vercel` directamente a Vercel: health devolvería 503 si no se genera/incluye el paquete. Para una preview se usará el directorio generado completo; antes de automatizar desde Git hay que fijar el paso de generación/publicación de artefactos con la misma revisión y presupuesto.
- No ejecutar `vercel deploy --temporary`, crear proyectos sin dueño, activar planes de pago ni asociar el dominio como forma de saltar el acceso pendiente. Una preview real necesita cuenta autenticada, plan/cuotas verificados y las pruebas de routing en la plataforma.

El presupuesto es 0 € adicionales. Empaquetar localmente no crea recursos, no aplica cuotas, no publica y no confirma gratuidad en la cuenta del usuario.
