# Chatbot histórico integrado en React

Fecha: 15-11-2026. Estado: implementado y probado localmente; sin despliegue ni cambios DNS. [Informe de seguridad](seguridad-reactivacion.md).

Actualización posterior: la [CI reproducible](../ci/README.md) añade una prueba de respuestas 429 HTML del firewall. El conjunto actual pasa 80 pruebas unitarias, 17 de API, 40 de navegador y seis controles de CI. La evidencia de este informe conserva la validación inicial del chatbot; la [evidencia CI](evidence/ci/summary.md) recoge el estado más reciente.

## Comportamiento

La sección «Consultar» recupera a Eistein con el clasificador original y un intérprete TypeScript de las reglas Dart. Consulta los mismos datos congelados; no utiliza un LLM, scraping, reentrenamiento, Blob ni servicios nuevos. La conversación no depende de Firebase.

Un mensaje se transforma para el clasificador, se clasifica con `POST /api/v1/message` y se convierte en filtros explícitos. Si la clasificación y la interpretación son válidas, se consulta `/api/v1/cars` y se muestran hasta diez registros ordenados por precio. Los filtros interpretados aparecen junto al resultado. El texto completo del mensaje no se coloca en una URL.

Ejemplos comprobados contra el modelo y SQLite reales:

- «Busco coches Citroën de menos de 20.000 euros en Málaga»: marca canónica `10`, provincia `Málaga`, `price_lt=20000`.
- «Quiero coches diésel con menos de 50.000 km y más de 100 CV»: `fuel_id=1`, `km_lt=50000`, `horses_gt=100`.
- «Seat León en León del año 2019»: modelo `586`, marca `58`, provincia `León` y año exacto; el nombre del modelo no consume la provincia.

El clasificador congelado no reconoce algunas consultas cortas. «Málaga» devuelve clase 0 aunque la provincia sea válida: la interfaz lo explica y ofrece confirmar los filtros antes de buscar. Una consulta reconocida sin filtros requiere confirmar que se desea ver el catálogo sin restricciones. El resto de mensajes ajenos a coches reciben una respuesta acotada, sin consultar datos.

Los errores de red conservan la consulta y permiten repetirla; no se convierten en resultados vacíos ni en respuestas «fuera de tema». Hay cancelación, timeout y protección frente al doble envío. La edición elimina confirmaciones anteriores y vuelve a interpretar el texto. Cada mensaje es una consulta independiente; no se heredan condiciones de mensajes previos.

El historial mantiene las seis últimas consultas en memoria de esta página. «Limpiar conversación» elimina ese estado; no se usa almacenamiento local, cookies propias, analítica ni persistencia de mensajes. El backend recibe el mensaje normalizado para clasificarlo, pero el código no lo registra. Esta descripción no sustituye la revisión de logs/retención del proveedor antes de publicar.

## Paridad y correcciones

| Función histórica | Comportamiento de la candidata |
| --- | --- |
| Sustituir marcas y sinónimos de vehículo | Conservado, con palabras completas y variantes como Citroën; `auto` no modifica `automático` |
| Marca/modelo, combustible, cambio y provincia | IDs canónicos, normalización de tildes y guiones, coincidencias más específicas primero |
| Año, km, CV, precio, cilindrada y marchas | Igualdad y límites; rangos como «entre 10.000 y 20.000 euros» y miles con puntos/espacios |
| «Menos de» / «más de» | Comparación estricta `<` / `>`; «hasta» / «desde» son inclusivas |
| Potencia extraída pero omitida en Mongo | Corregido: llega al filtro SQL y se verifica en resultados reales |
| Kilómetros exactos tomados del año | Corregido y comprobado contra un kilometraje existente del snapshot |
| Comparación de marchas ignorada | Se respeta el comparador |
| Híbrido sin especificar tipo | Pide gasolina o diésel; no elige un combustible silenciosamente |
| Condiciones no interpretadas | No realiza una búsqueda parcial; pide reformular |
| Muestra aleatoria sin filtros | Requiere confirmación y muestra un máximo de diez por precio; no se presenta como selección aleatoria |

El intérprete admite **un valor categórico por filtro**, y límites numéricos compatibles. Las exclusiones, alternativas entre varias marcas/provincias y atributos como color o puertas requieren reformular; no se ignoran para ampliar la búsqueda. No es un intérprete general de lenguaje natural ni proporciona agregados o recomendaciones generadas.

El nuevo `GET /api/v1/search-catalog` expone los **719 modelos, ocho combustibles y 50 provincias** del snapshot para búsqueda. El catálogo de predicción mantiene sus **542 modelos y siete combustibles** del selector histórico, con los mismos IDs; esta ampliación de consultas no cambia el dominio de inferencia ni los árboles.

## UX, accesibilidad y validación

Se mantiene la identidad visual de la nueva web. La consulta está integrada en la página, con formulario antes de los resultados y un botón «Editar consulta» que recupera el texto y el foco. Las tarjetas muestran precio, provincia, combustible, cambio y características, con diseño de dos columnas en escritorio y una en móvil.

- [Captura de escritorio](evidence/chatbot/desktop-results.png).
- [Captura móvil](evidence/chatbot/mobile-results.png).
- [Evidencia de pruebas](evidence/chatbot/verification.json).
- [Paquete y prueba WSGI](evidence/chatbot/package-smoke.json).

Pasaron **79 pruebas unitarias**, **17 de API** y **40 de navegador**: 20 casos por perfil Chromium de escritorio y móvil emulado, incluyendo el recorrido previo de predicción. Las pruebas cubren filtros, límites estrictos, falsos negativos reales del clasificador, confirmación, edición, resultados vacíos reales, errores y reintentos, cancelación, doble envío, texto con markup y borrado del historial.

axe no detectó infracciones en los estados inicial y de resultados probados con etiquetas WCAG 2 A/AA, 2.1 AA y 2.2 AA. Los anchos 320, 360, 390, 768, 1.024 y 1.440 px pasaron la comprobación de desbordamiento. Se corrigió la semántica de la conversación para mantener una lista dentro del contenedor de anuncios. Se inspeccionaron capturas de ambos perfiles. No se han validado Firefox, Safari/iOS, dispositivos físicos ni lectores de pantalla.

Para reproducir: [instrucciones web](../web/README.md) y [contrato API](../deploy/vercel/README.md). Los binarios, el snapshot, las herramientas y los informes completos temporales permanecen fuera del checkout, bajo `/workspace/.paddock`.

El paquete final del constructor oficial conserva **115,50 MiB** de función Python y 369 archivos. Los cuatro archivos públicos suman **290.036 bytes**, aproximadamente **87,6 kB gzip** medidos localmente, sin respuestas API ni cabeceras. La prueba WSGI del bundle comprueba readiness, búsqueda real, clasificación, rutas privadas inaccesibles y la predicción de regresión de **20.155 €**. No hay modelos o bases en `public/`, ni frontend dentro de la función; no se necesita Blob. Estas medidas no representan una ejecución, transferencia o facturación real de Vercel.

## Pendiente antes de publicar

La revisión de código local y dependencias tiene [resultado documentado](seguridad-reactivacion.md). Falta verificar la protección gratuita de plataforma frente a abuso, consumo compartido, cabeceras/routing/TLS en una preview autorizada y la cobertura manual de navegadores/accesibilidad. El tag original sigue siendo local y no se ha creado la issue del portfolio: se hará cuando existan versión y URL públicas verificadas, como establece el plan.
