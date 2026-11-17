# Entrega pública de Paddock · 17-11-2026

**[https://paddock.juancerezo.com](https://paddock.juancerezo.com)** sirve la aplicación histórica completa del TFM. El proyecto conserva la autoría compartida de Juan Cerezo Serrano y Oscar Pörtner Ostos. React/TypeScript/Vite sustituye al frontend Flutter/Firebase; la API Python/Flask usa los mismos modelos congelados y el catálogo SQLite de 179.502 filas de 2023. No se ha vuelto a scrapear ni reentrenar. Las estimaciones son históricas, no tasaciones del mercado actual.

## Versión y despliegue

- [PR #6 integrado](https://github.com/Legodark/paddock/pull/6); fuente desplegada `9a38be8848cbf601988614b01381758c99ae86f6` y [tag/release `v2026.11.17`](https://github.com/Legodark/paddock/releases/tag/v2026.11.17).
- [CI de esa fuente](https://github.com/Legodark/paddock/actions/runs/44102161297) en verde: aplicación/modelos/paquete y diagramas Archify. La cobertura mantenida comprende 100 unitarias, 17 de API, siete guardas de CI y 240 casos de navegador.
- Tag anotado `tfm-original-2023` conservado, apuntando al original `d43ea99461ab8d2457f4ccf8552822d34d6dfd52`.
- Production activa: `dpl_5G9aPw9k49MnFN79VAPsVbKz1S1y`. Respaldo con límite explícito de rutas: `dpl_Gbw7hDo9r6u71J8Cz1K1rFQ6auLt`, fuente `ecf9177`, con diez comprobaciones previas y historial de alias Production. No se ejecutó otro rollback durante esta entrega. El ensayo anterior B → A → B acredita el mecanismo con el código de aquella fase, no una nueva transición de esta versión.

## Comprobación pública

La [evidencia saneada](evidence/preview/public-release-20261117.json) registra **16 HTTP de un techo propio de 18**, secuenciales, sin bypass/cookies, ráfagas, reintentos de API ni seguimiento de redirecciones. Ese presupuesto es independiente de los ensayos anteriores ya cerrados.

- HTML, JavaScript y CSS públicos coinciden con sus hashes del paquete canónico y conservan las cabeceras de seguridad comprobadas. No se afirma haber medido todos los bytes remotos.
- Health devuelve modelo listo/congelado; la predicción de referencia devuelve **20.155 €**, cinco comparables baratos y cinco caros; clasificación devuelve contexto 1 y la búsqueda limitada devuelve una fila histórica.
- Diez respuestas públicas están correlacionadas con registros del proveedor. Las rutas `/api/index.py` y `/%61pi/v1/health` son 404 `not_found`, sin seleccionar Python. No es una nueva prueba desde una IP limitada ni una prueba exhaustiva de normalización.
- DNS reconocido como correcto, dominio verificado y HTTPS validado. Solo se asoció el subdominio solicitado; no se escribieron registros DNS, ni se cambió el apex o los nameservers.
- `juancerezo.com` devuelve 200 antes y después y conserva el mismo proyecto y deployment `dpl_CGA2uRWtQkjdoMqgX3ymm36Rabig`. No se modificó ni desplegó el portfolio.

La política es Standard `all_except_custom_domains`, incluida en Hobby. El subdominio y el alias canónico Production `paddock-phi-hazel.vercel.app` son públicos; el alias sirve el mismo HTML/hash y destino. Las tres URLs únicas ensayadas —Production, Preview y baseline— devuelven 302 de autenticación. No debe deducirse privacidad de todos los `*.vercel.app` por su sufijo. El [protocolo](publicacion-subdominio.md) distingue estos tipos de dirección.

La instantánea JSON se tomó después del smoke público y antes de publicar la release de GitHub. Su campo `release_published: false` describe ese instante y se conserva sin reescribir la evidencia histórica. La release se publicó después por la API oficial, como registra el [recibo saneado](evidence/release-20261117/github-release-safe.json). Los adjuntos no se subieron porque `uploads.github.com` estaba bloqueado; las capturas y metadatos se versionan aquí y se enlazan desde sus notas, sin cambiar la política de red.

## Material de interfaz y diagramas

Capturas **LOCAL**, obtenidas con la API/modelo real y los mismos bytes de frontend de la release; no se presentan como capturas del despliegue público, Safari o hardware iOS:

- [Escritorio, estimación y medidor](evidence/release-20261117/LOCAL-desktop-1440-estimation.png).
- [Viewport móvil emulado, estimación y medidor](evidence/release-20261117/LOCAL-mobile-390-estimation.png).
- [Escritorio, chatbot flotante desplegado](evidence/release-20261117/LOCAL-desktop-1440-chat-popup.png).
- [Metadatos curados y hashes](evidence/release-20261117/LOCAL-captures-metadata.json).

Los [tres diagramas Archify](diagramas.md) mantienen la propuesta congelada del 14-11-2026 y sus gates de CI; no se han alterado para representar retrospectivamente la publicación. Los diagramas dinámicos integrados de entrenamiento e inferencia solicitados para la aplicación siguen como trabajo posterior en #21/#22.

## Operación y trabajo restante

**0 € de servicios adicionales dentro de Hobby y sus recursos incluidos**, más la renovación del dominio que ya pagaba el propietario. No se activó Pro, Blob, bases gestionadas, Observability Plus, pruebas de pago ni otros extras. Modelo y catálogo caben empaquetados en Functions. [Costes y fuentes](costes-y-diagramas.md).

El saldo mensual compartido, CPU/RAM facturados y arranque frío confirmado siguen sin medir en #10. Agotar compute puede pausar también el portfolio; no se promete disponibilidad ilimitada ni se confunde el presupuesto HTTP de pruebas con un límite financiero automático.

#12 conserva las comprobaciones físicas restantes: el propietario confirmó medidor y escritura/cierre del chat con teclado abierto en iPhone, sin extenderlo a otras pruebas de accesibilidad. #17 conserva las condiciones de reutilización pública de terceros no acreditadas; la elección explícita del catálogo completo no acredita una licencia. #16 conserva los ajustes visuales/automatización del Kanban. El ajuste fino del DeLorean (#20) y los modos transparentes (#21/#22) quedan después de la publicación.

La [issue AI-Portfolio #61](https://github.com/Legodark/AI-Portfolio/issues/61) ya entrega el proyecto a otra sesión, enlazada desde [Paddock #15](https://github.com/Legodark/paddock/issues/15). Su implementación debe respetar el `AGENTS.md` de ese repositorio, la autoría compartida, el carácter histórico, `safeExternalHref` y `npm run validate`; esta sesión no cambia ni despliega el portfolio. [Recibo saneado de la issue](evidence/release-20261117/portfolio-issue-safe.json).
