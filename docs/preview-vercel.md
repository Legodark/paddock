# Preview privada verificada en Vercel

15-11-2026. Seguimiento: [#10](https://github.com/Legodark/paddock/issues/10); candidata: [PR #6](https://github.com/Legodark/paddock/pull/6).

**[Abrir la Preview privada](https://paddock-ba93thzc9-legodarks-projects.vercel.app)** con la cuenta de Vercel autorizada. La app está disponible para revisión; el acceso anónimo redirige a autenticación. El dominio propio y `main` permanecen intactos.

## Actualización visual · 16-11-2026

La revisión vigente es **[Paddock con el DeLorean original](https://paddock-obmoyab24-legodarks-projects.vercel.app)**, despliegue `dpl_78UW4KyJQ5LCGK3W3YPvKjhzSZVH`, fuente `ebc9b7b17b05eb61d4c2a298c5ee52227b6aff08`. El propietario autorizó modernizar las letras conservando el coche; el PNG original permanece intacto y local. El backend, routing, modelos y datos coinciden byte a byte con la versión anterior (16 archivos comparados). La web mide **331.141 bytes**, 125.054 bytes gzip, dentro del presupuesto. No se hicieron nuevas llamadas a la API de aplicación: se verificaron HTML, JS, CSS, PNG y acceso anónimo a la raíz. La CI del código desplegado pasó; ver [evidencia](evidence/ux/delorean-provider.json).

Las mediciones de API y la tabla siguientes conservan la publicación anterior como referencia; las limitaciones de #10/#11/#12/#17 siguen vigentes.

## Estado publicado

| Campo | Resultado |
| --- | --- |
| Equipo y plan | `legodarks-projects`, Hobby activo |
| Proyecto | [`paddock`](https://vercel.com/legodarks-projects/paddock), separado del portfolio |
| Despliegue vigente para revisión | `dpl_ys9CpWow2Hx4x8aAAQEWb3WqKU2G`, READY, Preview |
| Fuente desplegada | `fbb6082ec7454bc39a0d2e4d6695ffbb57a2e32e` |
| Protección | Vercel Authentication en todas las URLs (`all`) |
| Firewall | Una regla activa: prefijo `/api`, 60 solicitudes/60 s/IP, ventana fija, rechazo 429 |
| Función local con constructor oficial | **121.114.317 bytes = 115,50 MiB**, Python 3.12 |
| Web pública del paquete | **292.855 bytes**, cinco archivos; sin modelos o SQLite |
| Dominio propio | Sin asociar `paddock.juancerezo.com`; DNS sin cambios |
| Extras de pago | Ninguno; sin Blob, Redis, base gestionada ni Observability Plus |

La [evidencia saneada](evidence/preview/verified.json) contiene las respuestas observadas, hashes, cuenta, presupuesto y límites. No incluye credenciales ni respuestas completas del catálogo. Las cuotas siguen compartidas con el portfolio; el margen mensual de compute no está certificado.

## Publicación y correcciones

El propietario aprobó expresamente la regla de firewall y el primer despliegue privado. La CLI publicó exactamente el cambio revisado de Paddock con el digest de efectos y confirmó después la regla en configuración **live**. La activación no acredita todavía el umbral real, la recuperación o la exclusión de invocaciones de #11.

Vercel obliga a que el primer despliegue de un proyecto tenga destino Production. Se creó con `--prod --skip-domain`, autenticación obligatoria y cero alias promovidos. Esa primera versión de `ad60e5b` se conserva como diagnóstico: no usarla para rollback porque contiene el defecto de consultas descrito debajo. Las versiones posteriores se publicaron como Preview; no se fusionó el PR ni se conectó Git para desplegar automáticamente.

La primera comprobación real detectó que `/api/:path*` compila a `/api/index.py?path=$1`. El parámetro añadido por Vercel hacía que `/cars` rechazase incluso consultas válidas. Se corrigió el rewrite a `/api(/.*)?`, conservando la validación estricta del backend. El control de CI usa `@vercel/routing-utils@6.6.1` y rechaza una reversión al patrón defectuoso. Se fija `path-to-regexp` a 6.3.0 en esa herramienta de CI para evitar la dependencia vulnerable 6.1.0; la auditoría ampliada vuelve a dar cero avisos conocidos.

También se detectó que el documento principal no recibía tres cabeceras generales. Se incluyeron explícitamente en su regla específica y se verificaron en Vercel. Se desactivó la Toolbar del proyecto para conservar la CSP de la aplicación; la Preview final no contiene el script inyectado de `vercel.live`.

## Comprobaciones realizadas

- **20 peticiones de API en total**, incluyendo el diagnóstico inicial: concurrencia máxima uno, sin reintentos automáticos. No son veinte éxitos: las dos consultas rechazadas de la primera versión permitieron localizar el defecto y quedaron corregidas.
- En la Preview con el rewrite corregido: readiness, predicción de **20.155 €** con comparables, clasificador, catálogo de 719 modelos/50 provincias y tres coches Citroën de Málaga por debajo de 20.000 €, con filtros reales.
- Contrato inválido → 400; cuerpo superior al límite → 413; entrada directa, raíz API y ruta desconocida → 404. La ruta codificada ensayada se rechaza con 404 y no se interpreta como otro endpoint válido.
- API con `Cache-Control: no-store`, cabeceras de seguridad y sin CORS abierto. Acceso anónimo a la API → 302 de autenticación.
- La última publicación cambia únicamente `vercel.json` para las cabeceras del documento. Código Python, requisitos, modelos, SQLite y web son **idénticos byte a byte** a la versión cuya API se probó. No se volvió a invocar la API tras agotar el presupuesto.
- En la publicación final: **13 comprobaciones estáticas**, incluyendo documento/JS/CSS idénticos al build, licencias, robots, cabeceras y autenticación anónima. CSP restrictiva, `nosniff`, `DENY` y `no-referrer` efectivos.
- Modelos, SQLite, manifest privado, requirements, fuente Python, source map y `.env` → 404. Se usaron rangos y límite de descarga al comprobar recursos privados.
- El CDN puede devolver CORS `*` en archivos estáticos: se distingue de la ausencia de CORS abierto en la API, que no cambió.
- Localmente: 17 pruebas de API y siete guardas pasadas; dos regresiones de compilación de rutas/cabeceras comprobadas; función oficial materializada lista, con la misma predicción, clasificación y consultas.

El primer health observado en la Preview corregida tardó 3,706 s; las respuestas funcionales siguientes estuvieron aproximadamente entre 0,21 y 0,38 s. Son tiempos HTTP del cliente y no prueban un arranque frío real, CPU facturada o memoria consumida. Los logs gratuitos consultados no aportaron esas métricas. No se contrató otro producto para obtenerlas.

## Acceso de herramientas y reproducibilidad

La red `*.vercel.app` ya está aplicada y comprobada. El paquete completo y sus assets se generan fuera de Git y se suben con `--archive=tgz`; el proveedor aceptó upload y build en Hobby. La integración Git del proyecto permanece desactivada: no basta con conectar `deploy/vercel` sin generar los assets.

La CLI creó y gestionó un secreto de **Protection Bypass for Automation** para las pruebas autorizadas del proyecto. Sus valores no se leyeron ni publicaron; el acceso anónimo se comprobó por separado y continúa protegido. No se modificaron los bypass del firewall.

La CLI 65.16.0 reenviaba `--global-config` a curl como argumento no reconocido. Se seleccionó el perfil existente mediante `XDG_DATA_HOME=/workspace/.paddock/vercel-curl-data`, con un enlace de directorio hacia su ubicación original; no se copiaron ni inspeccionaron credenciales. El mecanismo usa el cliente oficial y conserva proxy, certificados y verificación TLS.

Directorios de trabajo: `/workspace/.paddock/preview-preparation-20261115` (primera publicación), `preview-routing-fix-20261115` (pruebas de API) y `preview-headers-fix-20261115` (publicación y estáticos finales), bajo `/workspace/.paddock`.

## Pendientes antes de acceso público

- **#11:** probar umbral 60/min/IP, 429, recuperación y exclusión de invocaciones con otro presupuesto acotado. No certificar seguridad completa por la configuración activa.
- **#10:** documentar o medir, si las opciones gratuitas lo permiten, arranque frío y memoria/CPU efectivos; permanecen desconocidos. No realizar más llamadas de API dentro del presupuesto agotado.
- **#12:** interacción real en navegador, móvil, teclado, zoom nativo y lector de pantalla. No se ha ejecutado la matriz de CI contra Vercel.
- **#17:** decidir y documentar las condiciones de reutilización pública del catálogo histórico.
- **#14/#15:** release, rollback y subdominio; después, issue en AI-Portfolio con URL/release públicas verificadas.

Si es necesario retirar una versión, identificar el ID exacto de Paddock, usar la retirada normal de Vercel con la aprobación que solicite y verificarla. No se ha ejecutado una retirada o rollback como parte de este smoke. Ninguna de las pruebas autoriza por sí sola el acceso público al catálogo.
