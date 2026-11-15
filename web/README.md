# Paddock web

Migración React: selección de coche → predicción del modelo original → comparables reales del catálogo congelado, y chatbot Eistein con clasificación y búsqueda histórica. Se presenta expresamente como una demo de 2023. No inicializa Firebase ni requiere servicios de IA, almacenamiento o fuentes externas.

React 19.3.1, TypeScript 7.0.2 y Vite 8.3.8, con versiones exactas y `package-lock.json`. Node 24.22.1 LTS y npm 11.9.0. El backend histórico y Flutter se conservan en `padook/`; esta interfaz usa exclusivamente el nuevo contrato `/api/v1`.

## Arranque local

Preparar primero la API y sus artefactos siguiendo [deploy/vercel/README.md](../deploy/vercel/README.md). En esta máquina, desde `deploy/vercel`:

```bash
PADDOCK_ASSET_DIR=/workspace/.paddock/vercel-web-package/assets PYTHONDONTWRITEBYTECODE=1 /workspace/.paddock/vercel-venv/bin/python -m flask --app api.index run --host=127.0.0.1 --port=5051 --no-reload
```

En otra terminal, desde `web`, con Node de `.node-version`:

```bash
npm ci
npm run dev
```

Vite escucha en `127.0.0.1:5173` y envía `/api` a `127.0.0.1:5051`. No se publica ningún recurso ni se necesita una URL de API externa. El botón «Rellenar un ejemplo» rellena el formulario; «Estimar valor histórico» consulta el modelo real.

## Comprobaciones

```bash
npm run check
npm audit
npm run test:e2e
```

`check` ejecuta los tests unitarios, el chequeo estricto de TypeScript y el build de producción. Playwright arranca y detiene la API local y `vite preview` en el puerto 4173, usa Chromium con sandbox y prueba escritorio y emulación móvil. La preview aplica las cabeceras de seguridad del documento configuradas en `deploy/vercel/vercel.json`. Vite de desarrollo necesita una política distinta para su recarga; no se considera servidor de producción.

Por defecto, los tests leen la ruta del paquete en `../../.paddock/current-vercel-package`, o usan `../../.paddock/vercel-package` si no existe ese puntero. Admiten `PADDOCK_PACKAGE_DIR`, `PADDOCK_ASSET_DIR`, `PADDOCK_PYTHON` y `PADDOCK_CHROMIUM` para otras máquinas. El ejecutable predeterminado de Chromium es `/usr/bin/chromium`; no se desactiva su sandbox. Se requieren puertos 5051 y 4173 libres; `CI=1` evita reutilizar servidores anteriores.

Resultados y alcance medidos: [primer recorrido](../docs/frontend-react.md), [chatbot](../docs/chatbot-react.md) y [seguridad](../docs/seguridad-reactivacion.md). Los informes completos de Playwright quedan en `test-results/`, ignorado en Git.

La [CI reproducible](../ci/README.md) instala entornos limpios, genera sus propios modelos/datos y ejecuta estas pruebas junto con auditorías, empaquetado y validación de la propuesta de firewall. El workflow preparado no despliega ni usa credenciales del proveedor.

## Paquete conjunto local

Desde la raíz, después de `npm --prefix web run build`:

```bash
python3 tools/prepare_vercel_package.py --web-dist web/dist --output /workspace/.paddock/vercel-web-package-new
```

Se exige una salida nueva. Solo la distribución estática entra en `public/`; los modelos y SQLite entran en `assets/` de la función. El preparador rechaza enlaces simbólicos y extensiones ajenas al contenido web esperado. El constructor oficial se ejecuta según las instrucciones de la API; no ejecuta un despliegue.

El documento y `robots.txt` conservan la no indexación mientras sean una candidata sin publicar. Se revisará antes del lanzamiento. La portabilidad y las correcciones del parser Dart se documentan en el informe del chatbot; no se presenta como un intérprete general de lenguaje natural. El original Flutter permanece como referencia histórica.
