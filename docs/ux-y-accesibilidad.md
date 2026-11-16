# Revisión de UX, accesibilidad y navegadores

Revisión inicial del 15 de noviembre de 2026. Seguimiento: [#12](https://github.com/Legodark/paddock/issues/12); diagramas en [#13](https://github.com/Legodark/paddock/issues/13). Posteriormente se publicó la [Preview privada verificada](preview-vercel.md); el DNS sigue intacto. Las pruebas usan el modelo y catálogo congelados.

## Feedback del propietario · 16-11-2026

Estado de las recuperaciones solicitadas antes de cerrar la revisión visual:

- **#18, implementada:** logos de los 70 fabricantes canónicos en el selector y la estimación, derivados de los PNG históricos. Carga a demanda, espacio reservado, nombre textual y respaldo ante fallo/ID desconocido. Se conserva la identidad del resultado anterior al editar el formulario. [Preview](https://paddock-ni6uimkps-legodarks-projects.vercel.app), [revisión](logos-marcas.md) y [evidencia local](evidence/ux/brands-local.json): 82 pruebas unitarias, 60 casos locales de navegador y seis anchos comprobados.
- **#19, corregido a flotante:** botón fijo abajo a la derecha y popup de chat sobre la página. El cierre y encabezado permanecen visibles, con scroll interno independiente del fondo; el modo compacto mantiene el formulario accesible en viewport visual de 240/180 px instrumentado. Conserva conversación, filtros, confirmaciones, carga única y guardas de foco. [Preview](https://paddock-mehm2xkbx-legodarks-projects.vercel.app) y [revisión](chatbot-flotante.md); 82 unitarias y 80 casos locales de navegador pasados. Se corrige la interpretación anterior de sección plegable en flujo.

- **#20, implementada, composición ajustada:** PADDOCK precede al DeLorean y la K se une a su estela mediante un solapamiento de 8 px. El PNG original permanece intacto; se conserva el enlace accesible. Sin desbordamiento en seis anchos de 320 a 1440 px y 28 casos de navegador locales pasados, incluidos axe, teclado y texto ampliado; el coche puede reducirse al ampliar el texto para conservar PADDOCK completo. [Preview](https://paddock-g4updlcd1-legodarks-projects.vercel.app); capturas [escritorio](evidence/ux/delorean-desktop.jpg) y [móvil](evidence/ux/delorean-mobile.jpg). [Evidencia local](evidence/ux/delorean-logo.json) y [entrega autenticada](evidence/ux/delorean-provider.json). El propietario ha revisado la composición y autoriza continuar con #18/#19; aplaza reducir un poco el DeLorean y pegar las líneas azules a la K.

#18/#19 están implementadas; el ajuste fino de #20 está aplazado. Esto no sustituye la revisión conjunta ni las pruebas con dispositivos físicos, lector de pantalla o zoom nativo de #12.

## Medidor de precio informado desde iPhone · #23

El propietario ha probado la Preview desde su iPhone y echaba en falta el gráfico original de Buen precio/Promedio/Caro. Se recupera el velocímetro SVG, con etiquetas en HTML y referencias explícitas de 2023. La clasificación es una regla orientativa de posición entre comparables; los datos incompletos quedan neutros y sin aguja. No se añade un precio de anuncio ni se cambia el modelo/API.

[Preview de la corrección](https://paddock-jd7a8siqc-legodarks-projects.vercel.app) · [Criterio, pruebas y capturas](medidor-precio.md). 100 pruebas unitarias y 96 casos locales de navegador pasados. Se registra la prueba aportada por el propietario sin atribuir navegador o versión de iOS no indicados; falta confirmar este ajuste en el teléfono y completar el resto de #12.

## Cambios encontrados en la revisión

| Hallazgo | Evidencia | Corrección |
| --- | --- | --- |
| UX-01: navegación fuera de la pantalla al ampliar el texto en móvil | En una ventana de 390 px, el contenido alcanzaba 568 px al duplicar los tamaños de texto | Cabecera con altura mínima y crecimiento vertical, y navegación que permite varias filas. Después: 390 px de contenido en 390 px de ventana; [captura](evidence/ux/header-text-200-mobile-after.jpg) |
| UX-02: «Estimar» seguía marcado al navegar a Consulta/Proyecto | La clase activa estaba fijada al primer enlace | El enlace activo y `aria-current="location"` siguen el ancla seleccionada y el historial Atrás/Adelante. Se conservan los datos del vehículo |
| UX-03: titular fuera de la pantalla en WebKit móvil con texto ampliado | El texto «detalles.» llegaba a 459 px en una ventana de 390 px | El título permite partir palabras cuando sea necesario; no se oculta el contenido ni se reduce el tamaño elegido |
| QA-01: las capturas de Firefox/WebKit generaban infracciones CSP ajenas a la app | Playwright 1.65 inserta un `<style>` para sincronizar su captura; los tests detectaban `style-src-elem` | Capturas opcionales de esos casos en Chromium; todas las aserciones funcionales/CSP siguen en los tres motores. La política de la aplicación no se amplía |

La ampliación de texto es una prueba instrumentada que duplica tamaños calculados de los elementos existentes. No se presenta como una sesión con el zoom nativo del navegador, un lector de pantalla o un teclado móvil físico.

## Recorridos y cobertura

La revisión cubre selección de marca/modelo, ejemplo, validación, predicción real de **20.155 €**, comparables, cambios que dejan una estimación desactualizada, clasificación y filtros del chat, resultados vacíos, errores y recuperación, 429 con respuesta HTML, cancelación y prevención de envíos duplicados. También se comprueban navegación por anclas, cambio de orientación y conservación de formularios/consulta.

La matriz ampliada comprende Chrome de escritorio, Chrome con perfil Pixel 7, Firefox de escritorio y WebKit de escritorio/con perfil iPhone 13. **WebKit emulado no es Safari/iOS físico**. Firefox usa el motor suministrado por Playwright; las versiones efectivas se publican en las anotaciones de cada job. El resumen falla ante casos omitidos, inestables o resultados incompletos, sin reintentos automáticos.

La [ejecución corregida 43730435190](https://github.com/Legodark/paddock/actions/runs/43730435190) pasó en GitHub. La matriz comprende **135 casos de navegador**, 27 en cada perfil, incluidos los seis nuevos recorridos de UX y la regresión del analizador. Junto con las 80 pruebas unitarias, 17 de API y siete guardas, son **239 pruebas**. Las auditorías de las dependencias evaluadas de web, API, bundle y constructor siguen sin avisos conocidos. La [evidencia de esa ejecución](evidence/ux/browser-matrix-success.json) conserva sus anotaciones originales.

Las versiones efectivas fueron Chrome 157.0.8103.50, Firefox 159.0 y WebKit 27.2. La [ejecución anterior](https://github.com/Legodark/paddock/actions/runs/43726037867), 127/130 casos, se conserva como diagnóstico histórico: sus dos cierres de Firefox y su desbordamiento de WebKit se resolvieron sin convertir casos en omitidos o añadir reintentos.

## Compatibilidad del analizador en Firefox

Los cierres coinciden con el [fallo reportado por axe-core #5549](https://github.com/dequelabs/axe-core/issues/5549): Firefox 159 puede cerrar el proceso al leer `ariaLabelledByElements`. Se mantiene axe 4.14.0, última versión publicada consultada, con una adaptación **solo del código de análisis de las pruebas Firefox**, siguiendo el [parche propuesto #5561](https://github.com/dequelabs/axe-core/pull/5561). Ese parche aún no está publicado ni fusionado por el proveedor.

La adaptación resuelve una referencia desde el atributo cuando no está vacío y conserva la lectura de la propiedad para los demás casos. Exige versión y SHA-256 exactos de la función original; una actualización obliga a revisar o retirar la adaptación. No se modifica el DOM o los getters de la aplicación, no se desactiva ninguna regla y Chrome/WebKit usan el analizador original. La regresión verifica referencias válidas, referencias rotas que deben seguir fallando y propiedades válidas con atributo vacío, en todos los perfiles.

El [registro de compatibilidad](evidence/ux/axe-compatibility.json), el [código acotado](../web/tests/axe-compat.ts) y la licencia MPL-2.0 acompañan la entrega. Al existir una versión oficial correctora, habrá que retirar esta adaptación y repetir la matriz. No forma parte del JavaScript servido al usuario.

En Chromium local se ejecutaron los doce casos nuevos de UX, incluyendo la regresión móvil de texto y la navegación por historial. Se inspeccionaron las capturas de [estimador de escritorio](evidence/ux/estimate-desktop.jpg), [móvil](evidence/ux/estimate-mobile.jpg), [chat de escritorio](evidence/ux/chat-desktop.jpg), [móvil](evidence/ux/chat-mobile.jpg) y [texto ampliado en escritorio](evidence/ux/text-200-desktop.jpg). La [evidencia visual](evidence/ux/visual-review.json) conserva medidas, navegador y hashes.

Se comprobaron anchos de 320, 360, 390, 768, 1.024 y 1.440 px sin scroll horizontal en los recorridos observados; orientación vertical/horizontal; botones y etiquetas de radio visibles con mínimo de 24 px CSS; foco del enlace de salto y del primer campo; estados inicial/resultado con axe y etiquetas WCAG 2 A/AA, 2.1 AA y 2.2 AA. Las capturas muestran una jerarquía legible, formularios y resultados completos y las notas históricas junto a la estimación. Con texto ampliado, el importe puede ocupar varias líneas sin perder información.

La reducción instrumentada de la ventana móvil a 390×480 verifica el espacio disponible del formulario, pero no abre un teclado virtual real. El texto sobre datos de 2023 y autoría compartida se mantiene y se comprueba en las pruebas. No se anuncian tasaciones del mercado actual.

## Límites pendientes antes de cerrar #12

- Ejecutar una sesión real con lector de pantalla: VoiceOver, TalkBack o NVDA, identificando versión y plataforma. Comprobar orden de lectura, controles, errores, cambios de foco y anuncios del resultado/chat.
- Probar Safari/iPhone y Chrome/Android físicos cuando estén disponibles: teclado virtual, orientación y gestos, además de zoom nativo del navegador. La emulación no acredita estas pruebas.
- Repetir smoke sobre la preview Vercel de #10 para verificar tiempos y respuestas reales de plataforma. Los 429 de esta revisión son escenarios controlados, no evidencia de enforcement del firewall.

La issue #12 permanece abierta para estas comprobaciones. No se declara conformidad WCAG completa por el resultado de axe. Los [diagramas](diagramas.md) sí tienen sus gates originales y revisión visual completados por un procedimiento separado.
