# Asistente del catálogo desplegable (referencia anterior)

**Sustituido por el [chatbot flotante](chatbot-flotante.md)** tras aclarar el propietario la disposición esperada. Este documento conserva la evidencia de la sección plegable anterior.

16-11-2026. Implementación de [#19](https://github.com/Legodark/paddock/issues/19) en [PR #6](https://github.com/Legodark/paddock/pull/6). Revisión conjunta en #12.

El asistente empieza plegado y se abre con «Abrir asistente» o el enlace «Consultar». El control principal cambia a «Plegar asistente» y el panel ofrece «Cerrar asistente». Se recupera la apertura/cierre de la referencia de 2023 con un panel en el flujo de la página: queda espacio para el estimador y el teclado móvil. No es un diálogo modal ni bloquea la navegación.

## Estado, red y foco

El componente permanece montado y se oculta con `hidden`. Se conservan el borrador, historial, filtros interpretados, confirmaciones, resultados y errores al cerrar y reabrir, durante la misma sesión de página. Limpiar conversación sigue siendo una acción explícita; recargar la página no conserva esos datos.

El catálogo de consulta se carga al primer uso. Cerrar/reabrir no lo aborta, recarga ni reintenta un fallo automáticamente. Tampoco repite el clasificador o la búsqueda. Las solicitudes ya iniciadas pueden terminar mientras el panel está plegado; su resultado queda disponible al abrirlo. La cancelación explícita y los límites de timeout/red existentes se conservan.

El botón tiene estado `aria-expanded` y `aria-controls` hacia la región del panel. Abrir enfoca su encabezado, evitando activar automáticamente el teclado móvil. Cerrar o pulsar Escape dentro del panel devuelve el foco al control principal. Escape fuera del panel o durante composición IME no lo pliega. Una respuesta o error tardío con el panel oculto no mueve foco o scroll. La entrada directa a `#consultar`, el historial y pulsar de nuevo «Consultar» con el mismo hash mantienen el comportamiento.

El texto y controles se adaptan a móvil y escritorio; el desplazamiento respeta la preferencia de movimiento reducido. Se conserva el clasificador original, el intérprete de filtros, búsqueda real, confirmaciones, cancelación, errores y 429. No hay LLM ni servicios de pago nuevos.

## Comprobaciones

Las pruebas nuevas cubren apertura por teclado y carga única; conservación de borrador, resultados, historial, filtros y confirmaciones; cierre con consultas en curso y resultado/error tardíos sin robo de foco/scroll; carga inicial mientras se cierra/reabre; enlaces y navegación repetida. Las pruebas anteriores de chat y UX ahora abren el asistente explícitamente.

El paquete local mide **497.376 bytes públicos / 287.216 bytes gzip**, dentro de los presupuestos de 1.000.000/300.000. Sus 16 archivos de backend, requisitos, modelos, SQLite y routing coinciden byte a byte con la publicación de marcas. El smoke de la función oficial ya materializada sigue listo y devuelve 20.155 €. Estas verificaciones son locales; no son llamadas a la API de Vercel.

La implementación se ha repartido entre tres agentes de esta sesión: código y validación integrada, pruebas de comportamiento, y revisión independiente de accesibilidad/lifecycle. Los cambios se reúnen en la misma rama y PR. No se han delegado publicaciones o cambios de infraestructura.

Los dispositivos físicos, lector de pantalla y zoom nativo siguen pendientes en #12. El ajuste fino del DeLorean permanece aplazado por el propietario en #20; no se cambia en esta fase.

**Resultado local:** 82 pruebas unitarias, build TypeScript/Vite y 76 casos de navegador Chromium pasados. Doce comprobaciones de geometría (abierto/cerrado en seis anchos de 320 a 1440 px) sin scroll horizontal. [Evidencia](evidence/ux/chat-disclosure-local.json) y capturas [plegado escritorio](evidence/ux/chat-collapsed-desktop.jpg), [abierto escritorio](evidence/ux/chat-expanded-desktop.jpg), [plegado móvil](evidence/ux/chat-collapsed-mobile.jpg) y [abierto móvil](evidence/ux/chat-expanded-mobile.jpg).

## Preview privada verificada

[Abrir el asistente desplegable](https://paddock-bzdg112ii-legodarks-projects.vercel.app). Fuente `184ef4b36903f3eea9f250e43e2f4afca1f219d3`, despliegue `dpl_7s2kqzArGGnR29WLmZD3pRoVeX2A`, READY. Se comprobaron seis recursos estáticos (HTML, JS, CSS, Citroën, DeLorean y avisos de terceros), sus hashes y cabeceras; todos coinciden con el build. Raíz anónima →302 de autenticación. [Evidencia de entrega](evidence/ux/chat-disclosure-provider.json). Cero nuevas llamadas a la API de aplicación en Vercel; sin cambios de DNS o `main`.

## Diagnóstico de automatización entre navegadores

La primera CI ampliada del código desplegado ejecutó 190 casos: 188 pasados, un cierre nativo de Firefox 159 en la prueba de composición y un timeout de WebKit al crear la página. La ejecución de push del mismo SHA pasó 189 casos y repitió el cierre de Firefox. Se conserva la [evidencia inicial](evidence/ux/chat-disclosure-ci-first.json); no se presenta ese intento como aprobado. Se canceló la repetición redundante al confirmar que Firefox repetía el mismo fallo.

Playwright 1.65.1 resuelve el selector de `dispatchEvent` en el contexto principal. La búsqueda por etiqueta lee allí `ariaLabelledByElements`, el getter nativo relacionado con el diagnóstico de Firefox 159 ya documentado en la compatibilidad de axe. Un [fixture aislado en Chromium](evidence/ux/chat-disclosure-selector-world.json) confirmó cinco accesos al getter al usar la etiqueta y ninguno adicional al usar CSS; ambos eventos conservan `Escape` e `isComposing: true`. No reproduce el cierre nativo de Firefox: su instalación local oficial fue rechazada con 403 por la red.

Se cambia únicamente el selector de ese dispatch a `#chat-message`. Se mantienen el evento, las búsquedas accesibles del resto del caso y todas las aserciones; sin omisiones, reintentos automáticos o cambios en el código servido. La [nueva CI](https://github.com/Legodark/paddock/actions/runs/43836207667) ha confirmado la corrección: todos los casos pasan, sin omisiones ni reintentos automáticos. Los archivos de producción y el paquete publicado permanecen idénticos al SHA `184ef4b36903f3eea9f250e43e2f4afca1f219d3`.

## CI ampliada completada

[Validación final](https://github.com/Legodark/paddock/actions/runs/43836207667), commit `84ca0c18f214ba82386e1d1c23a70528567cba7c`: web/API/modelos/paquete y Archify en verde. Los archivos de producción son idénticos a los del despliegue `184ef4b36903f3eea9f250e43e2f4afca1f219d3`; solo cambian pruebas y documentación. [Evidencia completa](evidence/ux/chat-disclosure-ci.json). Se conserva el intento fallido previo para explicar la corrección de automatización.
