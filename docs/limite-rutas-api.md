# Límite explícito de rutas hacia la función

17-11-2026. Seguimiento: [#11](https://github.com/Legodark/paddock/issues/11), [PR #6](https://github.com/Legodark/paddock/pull/6).

## Motivo y cambio

El ensayo anterior observó 404 de función para algunas rutas no canónicas. No demostró evasión funcional ni su comportamiento desde IP limitada. El compilador oficial situaba la búsqueda de filesystem antes del rewrite amplio: limitar solo ese rewrite no impediría acceder a la entrada directa de la función.

Se reemplaza esa resolución por rutas explícitas. Solo `/api/v1/health`, `/api/v1/catalog`, `/api/v1/search-catalog`, `/api/v1/predict`, `/api/v1/message` y `/api/v1/cars` pueden seleccionar `/api/index.py`. La coincidencia distingue mayúsculas con `(?-i:...)`, comprobado incluso bajo un matcher externo insensible a mayúsculas. No se restringen métodos en routing: Flask conserva HEAD/OPTIONS y la validación de métodos de cada endpoint. Las queries se mantienen separadas del pathname, sin añadir capturas como parámetros a la API.

La raíz, `index.html`, avisos de terceros, DeLorean y los directorios de assets/logos tienen destinos estáticos explícitos. No hay búsqueda implícita de filesystem. Lo demás termina en 404 sin seleccionar una función. Las cabeceras comunes se conservan y la CSP del documento también se aplica al acceso directo a `index.html`. Los errores de rutas desconocidas pasan a ser del router, no JSON de Flask; los errores de rutas canónicas siguen en la API.

La regla WAF existente no cambia. Esta defensa evita resolver entradas desconocidas hacia Python independientemente de su contador por IP; no se presenta como una nueva prueba del rate limit desde una IP bloqueada, como cobertura exhaustiva de normalizaciones o como un límite global de cuota.

## Validación local y revisión

[Revisión acotada independiente](evidence/preview/routing-boundary-review-20261117.json): configuración, guard y etapa de CI. Esquema y compilación oficiales `routing-utils@6.6.1`, cobertura de las seis rutas, mayúsculas, rutas codificadas, traversal, destinos privados y controles negativos. Los **75 archivos públicos reales** quedan cubiertos; el guard se ejecuta también sobre el paquete recién preparado en CI para detectar futuros archivos sin ruta.

La aplicación, frontend, modelos y SQLite permanecen idénticos: 87 de los 88 archivos seleccionados del paquete anterior conservan sus hashes; solo cambia `vercel.json`. Los estáticos pesan 504.608 bytes. La auditoría Cloudflare del 16-11 y sus artefactos no se modifican ni se presentan como una auditoría completa de este commit nuevo.

## Comprobación en proveedor preparada

Una Preview privada, sin cambiar Production, DNS, autenticación o plan. Techo propio de **seis HTTP**, concurrencia uno, cero reintentos/redirecciones seguidas y ninguna ráfaga:

| Ruta | Resultado esperado | Comprobación |
| --- | --- | --- |
| `/api/v1/health` | 200 | API lista, modelo congelado |
| `/` | 200 | HTML idéntico y cabeceras/CSP |
| `/assets/index-TX-N8QC5.js` | 200 | JavaScript idéntico |
| `/api/index.py` | 404 | Entrada directa rechazada sin función |
| `/%61pi/v1/health` | 404 | Prefijo codificado no alcanza una API legítima |
| `/API/v1/health` | 404 | Mayúsculas no alcanzan Python |

Un 404 por sí solo no demuestra ausencia de función: correlacionar los identificadores en privado con los registros del proveedor y publicar solo el resultado saneado. Las variantes restantes mantienen evidencia histórica y controles locales; no se inventa observación simultánea desde una IP limitada.

Contabilidad conservadora previa: 121 frente a 127. El plan suma hasta seis, sin utilizar otra ráfaga de 66 ni reasignar el margen del primer ensayo de 67. Si falla una comprobación, detener el smoke sin repetirlo automáticamente. La consulta de metadatos y las pruebas locales no invocan Paddock.

Estado al preparar este documento: revisión y guardas locales pasados; smoke remoto todavía sin ejecutar. El acceso público continúa pendiente.

### Adaptación del servidor local de pruebas

La primera CI de este cambio detectó que `web/vite.config.ts` todavía leía el formato anterior de cabeceras. Se corrigió para seleccionar las reglas que alcanzan la raíz y detenerse en su destino terminal, sin aplicar la CSP restrictiva del fallback 404 al documento. [Revisión y prueba local](evidence/preview/routing-preview-header-review-20261117.json): 100 unitarias, TypeScript/build y los 75 archivos públicos reconstruidos idénticos al paquete de la Preview. Es una corrección de infraestructura de pruebas; no modifica el contenido web o el runtime ya preparado. La CI alojada debe volver a pasar antes de completar la entrega.
