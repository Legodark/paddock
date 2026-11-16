# Chatbot flotante en la esquina derecha

16-11-2026. Corrección de [#19](https://github.com/Legodark/paddock/issues/19), en [PR #6](https://github.com/Legodark/paddock/pull/6).

El propietario aclaró que quería el botón flotante habitual, abajo a la derecha, que abre una ventana de chat sobre la misma página. La sección plegable anterior no correspondía a esa disposición. Esta versión la sustituye: el botón permanece anclado al recorrer la página y abre el popup encima, junto al borde derecho. En móvil, el launcher es una burbuja compacta; en escritorio muestra también «Asistente».

## Comportamiento

El popup es un diálogo no modal con encabezado y cierre siempre accesibles; la conversación se desplaza dentro de su propio panel. Abrir, cerrar o recibir un resultado no desplaza la página de fondo. El resto de la aplicación sigue disponible; mover el foco a un control de la página pliega el popup conservando ese foco. Escape dentro del diálogo y el botón de cierre devuelven el foco al launcher. Abrir enfoca el encabezado sin activar automáticamente el teclado móvil.

Se conservan borrador, conversación, filtros, confirmaciones y resultados al plegar/reabrir, además del desplazamiento de la conversación. El catálogo se carga al primer uso; alternar no repite solicitudes. Los resultados/error tardíos con el popup cerrado siguen sin robar foco o desplazar la página. Consultar abre el popup sin saltar al antiguo emplazamiento de la sección y respeta los clics modificados del navegador.

## Espacio visible en móvil

El tamaño y posición usan ancho/alto y desplazamientos de `visualViewport`, con márgenes de seguridad. Con poca altura visible, el modo compacto aprovecha el espacio del launcher mientras el popup está abierto; reduce la cabecera y el textarea, manteniendo el cierre de 44×44 y un cuerpo desplazable. Al cerrar, el launcher reaparece antes de devolverle el foco.

Las pruebas simulan alturas de 240 y 180 px y desplazamientos laterales/superiores. No acreditan teclado físico de iPhone, zoom nativo o lector de pantalla; esas comprobaciones siguen en #12. El borde del textarea admite una tolerancia geométrica de 2 px por redondeo/bordes, manteniendo estrictos los límites del viewport y tamaño del cierre.

## Validación y alcance

Se verifican posición fija, apertura sin alterar la altura/scroll del documento, wheel sobre la conversación sin desplazar el fondo, cabecera/cierre visibles y modo compacto. Se mantienen los recorridos de estimación, marcas, consultas, errores/429, cancelación, accesibilidad y conservación de estado. La adaptación de la prueba IME de Firefox 159 mantiene el selector CSS ya validado; no se omiten reglas o casos.

Las capturas muestran el contexto de la página: [cerrado escritorio](evidence/ux/chat-floating-closed-desktop.jpg), [abierto escritorio](evidence/ux/chat-floating-open-desktop.jpg), [cerrado móvil](evidence/ux/chat-floating-closed-mobile.jpg) y [abierto móvil](evidence/ux/chat-floating-open-mobile.jpg).

Backend, requisitos, modelos, SQLite y routing permanecen idénticos a la publicación anterior. El modelo histórico y los logos no cambian; el ajuste fino del DeLorean continúa aplazado en #20. La verificación de Vercel se limita a estáticos/autenticación, sin nuevas invocaciones de la API de aplicación, cambios de DNS o fusión de `main`.
