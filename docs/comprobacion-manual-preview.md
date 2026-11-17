# Sesión manual antes de publicar

Preparada el 16-11-2026 para [#12](https://github.com/Legodark/paddock/issues/12). [Abrir la Preview privada](https://paddock-jd7a8siqc-legodarks-projects.vercel.app), fuente `2b8b7608341663fc5852220d3460cd33d2195cc2`. Requiere la cuenta autorizada de Vercel.

La prueba inicial del propietario desde iPhone detectó el medidor ausente; [#23](medidor-precio.md) lo recupera. El 17-11-2026 confirmó en la [candidata privada B](https://paddock-l9io99hnr-legodarks-projects.vercel.app): «Sí, funcionan el medidor y el chatbot», respondiendo sobre ver el medidor tras calcular el ejemplo y escribir/cerrar el chat con el teclado abierto. Esos dos controles quedan comprobados por el propietario; no hace falta repetirlos. No se han aportado modelo exacto, versión de iOS o navegador. Orientación, zoom, VoiceOver y otros pasos no se dan por probados por esa respuesta o por CI.

## Un recorrido breve en el iPhone

Anotar modelo de dispositivo, versión de iOS, navegador y versión aproximada, fecha y orientación. No incluir credenciales ni capturas del inicio de sesión.

1. Abrir la página en vertical. Leer la nota histórica de 2023 y comprobar que cabecera, formulario y botón de chat caben sin desplazamiento horizontal.
2. Cargar el ejemplo y estimar una sola vez. Deben aparecer **20.155 €**, marca del vehículo, comparables y el medidor en **Promedio**. Sus etiquetas deben leerse sin depender del color. La valoración corresponde a referencias de 2023, no al mercado actual.
3. Editar un dato sin volver a estimar. El resultado anterior debe conservar su vehículo y referencias y advertir que hay cambios pendientes. No debe asociar la nueva selección con la estimación anterior.
4. Abrir el botón flotante de abajo a la derecha. Tocar el campo para abrir el teclado, escribir un borrador, desplazar el interior del chat y comprobar que siguen accesibles el campo, el botón de envío y el cierre. Cerrar y abrir: el borrador debe seguir ahí. No hace falta enviar mensajes para esta comprobación.
5. Girar a horizontal y volver a vertical, con y sin el chat abierto. Comprobar que ninguna acción necesaria queda fuera de la ventana visible.
6. Ampliar con el control nativo de tamaño/zoom del navegador al 200 %. Leer resultado, etiquetas del medidor y botones; comprobar que se puede navegar y cerrar el chat. Restaurar el ajuste al terminar.
7. Con VoiceOver activado, recorrer formulario, errores, resultado y chat. Comprobar nombres de campos/botones, orden de lectura, anuncio del estado del medidor y conservación de foco al cerrar el chat. Registrar lo observado; no certificar conformidad WCAG completa con un único recorrido.

Si aparece un fallo, anotar paso, resultado esperado/observado y si sucede de nuevo. Detener ese recorrido si la aplicación deja de responder. No enviar decenas de peticiones para provocar un 429: esa comprobación tiene [procedimiento separado](proteccion-vercel.md).

## Escritorio y otras plataformas

En escritorio: recorrer con Tab/Mayús+Tab/Enter, comprobar foco visible y enlace de salto; abrir/cerrar el chat con teclado y Escape; repetir con zoom nativo al 200 %. Registrar sistema y navegador. Una sesión con NVDA o VoiceOver se identifica por separado.

Chrome/Android físico sigue pendiente cuando haya dispositivo disponible. Los perfiles Pixel/iPhone de Playwright y WebKit de CI son cobertura automatizada y no acreditan esos dispositivos físicos.

## Cómo registrar el resultado

Usar en #12 una respuesta breve: **dispositivo / sistema / navegador; pasos comprobados; fallos o limitaciones**. No pedir una captura para cada paso. Los logs de Vercel permiten confirmar rutas y respuestas, pero no observan la lectura, los gestos, el zoom ni el foco percibido.

Última CI de la rama comprobada: [43883101524](https://github.com/Legodark/paddock/actions/runs/43883101524), 100 pruebas unitarias, 17 de API, siete guardas y 240 casos de navegador (48 por perfil; Chrome escritorio/móvil, Firefox escritorio, WebKit escritorio/móvil), todos pasados. Es evidencia de CI, no de esta sesión manual ni del firewall remoto.

El ajuste pequeño del DeLorean (#20) permanece aplazado por decisión del propietario. El modo transparente (#21/#22) se mantiene después del despliegue.
