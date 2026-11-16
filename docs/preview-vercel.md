# Preview privada verificada en Vercel

16-11-2026. Seguimiento: [#10](https://github.com/Legodark/paddock/issues/10); candidata: [PR #6](https://github.com/Legodark/paddock/pull/6).

**[Abrir la Preview privada](https://paddock-jd7a8siqc-legodarks-projects.vercel.app)** con la cuenta de Vercel autorizada. La app está disponible para revisión; el acceso anónimo redirige a autenticación. El dominio propio y `main` permanecen intactos.

## Revisión gratuita de plataforma · 16-11-2026

La segunda prueba de firewall autorizada terminó con **98 de 127 HTTP**: ráfaga de 88 health 200 y el primero 429, parada automática; cuatro variantes, un estático y comprobación posterior de recuperación. El proveedor acredita 60 health permitidos y el siguiente rechazado para la misma IP/región, atribución a la regla y rechazo anterior a función según su clasificación. El primer 200 posterior salió por la otra IP; al reanudar la sesión se añadieron tres health identificados dentro del mismo techo y dos respondieron 200 desde la IP limitada, sin cambiar la regla. No se mide el instante exacto del desbloqueo. Variantes y entrega estática positiva siguen pendientes: `/robots.txt` devolvió 404 y no existe en el paquete vigente. [98 casos y límites](evidence/preview/firewall-recheck-20261116.json). Ninguna publicación, cambio DNS o servicio contratado.

Después de esta consulta, el propietario autorizó el procedimiento de firewall de hasta 67 HTTP. Se enviaron **61 health**, todos 200, y se detuvo la ejecución: el proveedor contó dos IP de origen con 40 y 21 solicitudes, sin alcanzar 60/IP. Cero variantes, estático, recuperación o reintentos. Los 61 casos corresponden a registros `allow`/`streaming_func`; configuración idéntica antes/después. Resultado inconcluso para #11, sin nuevas mediciones de CPU/memoria o arranque frío. [Procedimiento y siguiente propuesta sin ejecutar](prueba-firewall-preview.md) · [evidencia saneada](evidence/preview/firewall-experiment-20261116.json). Son adicionales a las veinte solicitudes del smoke funcional histórico.

Nueva consulta de solo lectura, sin llamadas a la API de aplicación: Hobby activo, Fluid compute y autenticación para todos los despliegues confirmados. Los logs gratuitos de los últimos 30 minutos muestran dos cargas de catálogo y una predicción con HTTP 200, entre las 14:58 y 14:59 UTC, en `cdg1`, con acción WAF `allow`. Su agente de usuario declara iPhone/iOS 18.7/Safari 27.2; se registra como dato HTTP y no como certificación del dispositivo o aprobación del medidor.

Los logs de peticiones están disponibles sin contratar Observability Plus. Los de runtime no aportan aquí CPU, memoria o arranque frío; la consulta de 24 horas es rechazada por la retención Hobby. `billing usage` tampoco devuelve datos del 1–16 de noviembre. **El consumo y margen mensual siguen desconocidos; no equivalen a cero.** #10 permanece abierta. [Evidencia saneada](evidence/preview/free-platform-review-20261116.json).

Para #12 se ha preparado un [recorrido manual breve](comprobacion-manual-preview.md). Los logs confirman respuestas, pero no observan teclado virtual, gestos, zoom, lectura o foco. Las peticiones existentes no son una prueba de umbral/recuperación de #11.

## Medidor de precio recuperado · #23

La revisión vigente es **[Paddock con medidor de precio](https://paddock-jd7a8siqc-legodarks-projects.vercel.app)**, despliegue `dpl_9PXY5N878VVNqdJBj2JD9kF5fVxw`, fuente `2b8b7608341663fc5852220d3460cd33d2195cc2`. Recupera el indicador original solicitado tras probar desde iPhone, adaptado al diseño y a móvil/escritorio. [Informe y capturas](medidor-precio.md).

100 unitarias y 96 casos locales de navegador pasados. La [CI ampliada del código desplegado](https://github.com/Legodark/paddock/actions/runs/43881880027) está en verde. Web **504.608 bytes / 289.202 gzip**, dentro del presupuesto; 16 archivos de backend/configuración/recursos idénticos a la versión anterior. Seis recursos estáticos, cabeceras y autenticación (raíz anónima 302) verificados, sin nuevas invocaciones de la API de aplicación. [Evidencia](evidence/ux/price-gauge-provider.json). La revisión física/manual sigue en #12; modelo, DNS y `main` no cambian.

## Chatbot flotante · corrección de #19

La revisión anterior del chatbot fue **[Paddock con botón flotante abajo a la derecha](https://paddock-mehm2xkbx-legodarks-projects.vercel.app)**, despliegue `dpl_4PADSnX3JsMfywyM4N3dn3r7w7Za`, fuente `861d41bec36cea9d8c15091dc31648d0e9f3720a`. Abre un popup sobre la página con cierre visible y scroll interno; corrige la sección en flujo que no correspondía a la disposición solicitada. [Informe y capturas](chatbot-flotante.md).

82 pruebas unitarias y 80 casos locales de navegador pasados. La [CI ampliada del código desplegado](https://github.com/Legodark/paddock/actions/runs/43870309044) también está en verde. Web completa **500.457 bytes / 288.055 gzip**, dentro del presupuesto. Backend/recursos idénticos en 16 archivos; se verificaron seis estáticos y raíz anónima protegida (302), sin nuevas llamadas a la API de aplicación. [Evidencia](evidence/ux/chat-floating-provider.json). El ajuste fino del DeLorean sigue aplazado en #20 y la sesión física/manual sigue en #12.

## Chatbot desplegable · 16-11-2026

La revisión anterior en flujo fue **[Paddock con asistente plegable](https://paddock-bzdg112ii-legodarks-projects.vercel.app)**, despliegue `dpl_7s2kqzArGGnR29WLmZD3pRoVeX2A`, fuente `184ef4b36903f3eea9f250e43e2f4afca1f219d3`. El asistente empieza cerrado, se abre desde su control o Consultar y conserva la conversación al cerrarlo. Catálogo de consulta al primer uso, sin solicitudes nuevas al alternar. Respuestas tardías sin cambios de foco/scroll con el panel oculto. [Informe y capturas](chatbot-desplegable.md).

Web completa: **497.376 bytes**, **287.216 bytes gzip**, dentro del presupuesto. 82 pruebas unitarias y 76 casos locales de navegador pasados. La [CI ampliada final](https://github.com/Legodark/paddock/actions/runs/43836207667) está en verde; se verificó que los archivos de producción son idénticos al despliegue. Backend/recursos idénticos en los 16 archivos comparados. Verificación en Vercel exclusivamente estática y de autenticación, sin nuevas llamadas a la API de aplicación; [evidencia](evidence/ux/chat-disclosure-provider.json). El ajuste fino del DeLorean permanece aplazado en #20. La revisión manual conjunta sigue en #12.

## Logos de fabricantes · 16-11-2026

La revisión anterior de marcas fue **[Paddock con logos de las marcas](https://paddock-ni6uimkps-legodarks-projects.vercel.app)**, despliegue `dpl_9x9NRjfco3FiKRGYbMLGabsuSFaT`, fuente `4f7b6543c0f301967262c25ee9f7a2a7862f14f0`. Los logos aparecen junto al selector y al vehículo calculado. Las 70 marcas canónicas usan derivados locales del archivo de 2023; sus recursos pesan 157.644 bytes. El [informe](logos-marcas.md) registra correspondencias, respaldo, procedencia y pruebas.

Web completa: **495.019 bytes**, **286.669 bytes gzip**, dentro de los presupuestos existentes. Pasan 82 pruebas unitarias y 60 casos locales de navegador. La [CI del código desplegado](https://github.com/Legodark/paddock/actions/runs/43831661810) también ha terminado en verde. Se han decodificado todos los logos y revisado seis anchos. En Vercel se verificaron **siete recursos estáticos**: HTML, JS, CSS, tres logos representativos y avisos de terceros, idénticos al build y con sus cabeceras. La raíz anónima devuelve 302 de autenticación. [Evidencia de entrega](evidence/ux/brands-provider.json).

Backend, requisitos, modelos, SQLite, routing y CSP siguen idénticos en los 16 archivos comparados; **cero nuevas llamadas a la API de aplicación en Vercel**. El DeLorean no cambia en esta iteración. Su ajuste de tamaño/unión queda aplazado en #20; el siguiente paso es #19.

## Actualización visual · 16-11-2026

La revisión anterior de identidad fue **[Paddock con la K unida a la estela del DeLorean](https://paddock-g4updlcd1-legodarks-projects.vercel.app)**, despliegue `dpl_GBfCQ2LKio1khpnm8y7WzB1vDYFi`, fuente `ae7072388432f7107407e604ff4107630b3ca2b4`. A petición del propietario, PADDOCK va primero y el coche a la derecha, solapando la estela con la K. El PNG original permanece intacto y local. El backend, routing, modelos y datos coinciden byte a byte con la versión anterior (16 archivos comparados). La web mide **331.057 bytes**, 125.006 bytes gzip, dentro del presupuesto. Se han pasado 28 pruebas locales de navegador, incluidos accesibilidad, teclado y texto ampliado, y comprobado seis anchos. No se hicieron nuevas llamadas a la API de aplicación en Vercel: se verificaron HTML, JS, CSS, PNG y acceso anónimo a la raíz. Ver [evidencia](evidence/ux/delorean-provider.json). El propietario ha revisado el logo y autoriza continuar con #18/#19; queda aplazado hacerlo un poco más pequeño y pegar las líneas azules a la K.

Las mediciones de API conservan la publicación anterior como referencia; las limitaciones de #10/#11/#12/#17 siguen vigentes.

## Estado publicado

| Campo | Resultado |
| --- | --- |
| Equipo y plan | `legodarks-projects`, Hobby activo |
| Proyecto | [`paddock`](https://vercel.com/legodarks-projects/paddock), separado del portfolio |
| Despliegue vigente para revisión | `dpl_9PXY5N878VVNqdJBj2JD9kF5fVxw`, READY, Preview |
| Fuente desplegada | `2b8b7608341663fc5852220d3460cd33d2195cc2` |
| Protección | Vercel Authentication en todas las URLs (`all`) |
| Firewall | Una regla activa: prefijo `/api`, 60 solicitudes/60 s/IP, ventana fija, rechazo 429 |
| Función local con constructor oficial | **121.114.317 bytes = 115,50 MiB**, Python 3.12 |
| Web pública del paquete | **504.608 bytes**, 76 archivos; sin modelos o SQLite |
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
- La publicación de cabeceras cambió únicamente `vercel.json` para las cabeceras del documento. Código Python, requisitos, modelos, SQLite y web son **idénticos byte a byte** a la versión cuya API se probó. No se volvió a invocar la API tras agotar el presupuesto.
- En la publicación de cabeceras: **13 comprobaciones estáticas**, incluyendo documento/JS/CSS idénticos al build, licencias, robots, cabeceras y autenticación anónima. CSP restrictiva, `nosniff`, `DENY` y `no-referrer` efectivos.
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
