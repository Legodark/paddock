# Revisión de UX, accesibilidad y navegadores

15 de noviembre de 2026. Seguimiento: [#12](https://github.com/Legodark/paddock/issues/12); diagramas en [#13](https://github.com/Legodark/paddock/issues/13). No se ha desplegado la aplicación ni modificado DNS. Las pruebas usan el modelo y catálogo congelados.

## Cambios encontrados en la revisión

| Hallazgo | Evidencia | Corrección |
| --- | --- | --- |
| UX-01: navegación fuera de la pantalla al ampliar el texto en móvil | En una ventana de 390 px, el contenido alcanzaba 568 px al duplicar los tamaños de texto | Cabecera con altura mínima y crecimiento vertical, y navegación que permite varias filas. Después: 390 px de contenido en 390 px de ventana; [captura](evidence/ux/header-text-200-mobile-after.jpg) |
| UX-02: «Estimar» seguía marcado al navegar a Consulta/Proyecto | La clase activa estaba fijada al primer enlace | El enlace activo y `aria-current="location"` siguen el ancla seleccionada y el historial Atrás/Adelante. Se conservan los datos del vehículo |
| QA-01: las capturas de Firefox/WebKit generaban infracciones CSP ajenas a la app | Playwright 1.65 inserta un `<style>` para sincronizar su captura; los tests detectaban `style-src-elem` | Capturas opcionales de esos casos en Chromium; todas las aserciones funcionales/CSP siguen en los tres motores. La política de la aplicación no se amplía |

La ampliación de texto es una prueba instrumentada que duplica tamaños calculados de los elementos existentes. No se presenta como una sesión con el zoom nativo del navegador, un lector de pantalla o un teclado móvil físico.

## Recorridos y cobertura

La revisión cubre selección de marca/modelo, ejemplo, validación, predicción real de **20.155 €**, comparables, cambios que dejan una estimación desactualizada, clasificación y filtros del chat, resultados vacíos, errores y recuperación, 429 con respuesta HTML, cancelación y prevención de envíos duplicados. También se comprueban navegación por anclas, cambio de orientación y conservación de formularios/consulta.

La matriz ampliada comprende Chrome de escritorio, Chrome con perfil Pixel 7, Firefox de escritorio y WebKit de escritorio/con perfil iPhone 13. **WebKit emulado no es Safari/iOS físico**. Firefox usa el motor suministrado por Playwright; las versiones efectivas se publican en las anotaciones de cada job. El resumen falla ante casos omitidos, inestables o resultados incompletos, sin reintentos automáticos.

La [ejecución 43726037867](https://github.com/Legodark/paddock/actions/runs/43726037867) ejecutó **130 casos de navegador: 127 pasados, tres fallidos y ninguno omitido o inestable**. Dos fallos son cierres de página en Firefox 159.0 durante los análisis axe de chat y estimación; el tercero es un desbordamiento con texto duplicado en el perfil móvil de WebKit 27.2. Chrome 157.0.8103.50 y el resto de casos completaron sus recorridos. **La CI ampliada no está aprobada** y estos fallos no se convierten en casos omitidos o reintentos.

Para continuar el diagnóstico se ha preparado una fixture que ejecuta cada caso axe en un proceso de navegador nuevo, conservando opciones del perfil, CSP y cero reintentos. Sus seis comprobaciones enfocadas pasan en Chromium local; queda repetir Firefox/WebKit. El test de texto ampliado registra ahora los elementos que exceden la ventana para localizar el desbordamiento de WebKit antes de aplicar otra corrección. No se atribuyen los cierres de Firefox a la aplicación o a una biblioteca sin esa comprobación.

En Chromium local se ejecutaron los doce casos nuevos de UX, incluyendo la regresión móvil de texto y la navegación por historial. Se inspeccionaron las capturas de [estimador de escritorio](evidence/ux/estimate-desktop.jpg), [móvil](evidence/ux/estimate-mobile.jpg), [chat de escritorio](evidence/ux/chat-desktop.jpg), [móvil](evidence/ux/chat-mobile.jpg) y [texto ampliado en escritorio](evidence/ux/text-200-desktop.jpg). La [evidencia visual](evidence/ux/visual-review.json) conserva medidas, navegador y hashes.

Se comprobaron anchos de 320, 360, 390, 768, 1.024 y 1.440 px sin scroll horizontal en los recorridos observados; orientación vertical/horizontal; botones y etiquetas de radio visibles con mínimo de 24 px CSS; foco del enlace de salto y del primer campo; estados inicial/resultado con axe y etiquetas WCAG 2 A/AA, 2.1 AA y 2.2 AA. Las capturas muestran una jerarquía legible, formularios y resultados completos y las notas históricas junto a la estimación. Con texto ampliado, el importe puede ocupar varias líneas sin perder información.

La reducción instrumentada de la ventana móvil a 390×480 verifica el espacio disponible del formulario, pero no abre un teclado virtual real. El texto sobre datos de 2023 y autoría compartida se mantiene y se comprueba en las pruebas. No se anuncian tasaciones del mercado actual.

## Límites pendientes antes de cerrar #12

- Ejecutar una sesión real con lector de pantalla: VoiceOver, TalkBack o NVDA, identificando versión y plataforma. Comprobar orden de lectura, controles, errores, cambios de foco y anuncios del resultado/chat.
- Probar Safari/iPhone y Chrome/Android físicos cuando estén disponibles: teclado virtual, orientación y gestos, además de zoom nativo del navegador. La emulación no acredita estas pruebas.
- Repetir smoke sobre la preview Vercel de #10 para verificar tiempos y respuestas reales de plataforma. Los 429 de esta revisión son escenarios controlados, no evidencia de enforcement del firewall.

La issue #12 permanece abierta para estas comprobaciones. No se declara conformidad WCAG completa por el resultado de axe. Los [diagramas](diagramas.md) sí tienen sus gates originales y revisión visual completados por un procedimiento separado.
