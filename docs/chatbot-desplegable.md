# Asistente del catálogo desplegable

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
