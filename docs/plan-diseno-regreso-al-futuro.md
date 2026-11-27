# Plan de diseño de Paddock · Regreso al futuro

27 de noviembre de 2026. Propuesta para la siguiente iteración de la aplicación pública. La fuente de partida es `9a38be8` en producción y `b8c05b2` en `main`, que añade el registro de entrega. [Aplicación](https://paddock.juancerezo.com) · [Release](https://github.com/Legodark/paddock/releases/tag/v2026.11.17) · [Issue #20](https://github.com/Legodark/paddock/issues/20).

## 1. Componer la cabecera como una sola marca

En la cabecera actual, PADDOCK se dibuja con texto en cursiva y el DeLorean se obtiene de un recorte del PNG original. El coche ocupa 104 px de ancho y su caja entra 8 px en la palabra. El ajuste horizontal y el centrado vertical dependen de cajas que cambian de proporción con la tipografía y la escala. [Composición](../web/src/App.tsx#L118) · [Estilos actuales](../web/src/styles.css#L39) · [Escritorio](evidence/ux/delorean-desktop.jpg) · [Móvil](evidence/ux/delorean-mobile.jpg).

- Mantener PADDOCK a la izquierda y el DeLorean original a la derecha. Reducir el coche aproximadamente un 10 % como punto de partida y ajustar la altura por referencia visual. El centro de las líneas azules debe caer en el encuentro de los brazos de la K.
- Recortar el espacio transparente antes de la estela y ajustar posición y tamaño juntos. Definir el empalme, la altura del coche y el tamaño de texto en el mismo bloque de estilos. En móvil, mantener palabra y coche juntos y dar a la navegación su propia fila cuando haga falta.
- Revisar el conjunto sobre fondo oscuro con capturas comparables a 320, 390, 768, 1024 y 1440 px. Criterio visual: la estela toca la K, se distinguen los brazos de la letra y queda espacio antes de la navegación. El enlace conserva el nombre accesible «Paddock, inicio», foco visible y altura mínima de 44 px.

## 2. Llevar la referencia a la portada y a Proyecto

| Zona | Propuesta | Función |
| --- | --- | --- |
| Aviso histórico de portada | 🕰️ junto a «Una mirada a 2023» y un pequeño detalle en ámbar inspirado en un panel de fecha | Sitúa la estimación en el año del catálogo. |
| Sección Proyecto | ⚡ junto a «De vuelta a la carretera» y un guiño tipográfico discreto a `88 mph` | Conecta el DeLorean con la historia del TFM y deja la referencia cinematográfica fuera del medidor. |
| Avatar del asistente, como segundo ajuste | 🐾 como guiño a Einstein. Revisar la grafía de «Eistein» y, si se corrige, hacerlo en todos los textos visibles y accesibles | Da personalidad al asistente del catálogo y mantiene explícita su función. |

🕰️, ⚡ y 🐾 son emojis Unicode nativos. El listado también incluye 🚘 como coche genérico. Para representar de forma reconocible al DeLorean, reutilizar el dibujo del TFM. Un pack oficial o un sticker de la película solo entraría en una iteración si se identifica una fuente con licencia para alojarlo y redistribuirlo en web. Registrar la procedencia de cualquier recurso que se incorpore. [Listado oficial de Unicode Emoji 17.0](https://github.com/unicode-org/unicodetools/blob/main/unicodetools/data/emoji/17.0/emoji-test.txt).

Usar un emoji como máximo en cada uno de esos lugares y colocarlo junto a texto visible. Marcar el emoji como decorativo para el lector de pantalla cuando el texto ya comunica la idea. Comprobar los glifos con iOS, Chromium y WebKit, porque cada plataforma los dibuja de forma distinta. Los acentos cian y ámbar pueden unir cabecera y portada con poco peso. Mantener los colores semánticos y las etiquetas del medidor. Si se añade transición a la estela, respetar `prefers-reduced-motion`.

## 3. Orden de implementación y revisión

1. **Cabecera.** Primera entrega de #20 con comparación antes/después en móvil y escritorio. Validar legibilidad, zoom al 200 %, teclado y que los enlaces no se corten al ampliar texto.
2. **Portada y Proyecto.** Integrar el reloj y el rayo en texto existente, con cian para la estela y ámbar para el contexto de 2023. Revisar luego si la huella mejora el avatar del asistente en tamaños pequeños.
3. **Pruebas.** Ejecutar build y pruebas del frontend, recorrer ejemplo → estimación → comparables y abrir/cerrar el chat con teclado. Revisar contraste, foco y movimiento reducido. Pasar los controles de paquete, rutas y CSP de CI. Los límites actuales son 1.000.000 bytes públicos y 300.000 bytes gzip. El paquete de referencia mide 289.248 bytes gzip, así que el objetivo inicial es añadir como máximo 5 KB gzip entre estilos, textos y recursos visuales. Documentar el peso medido. [Presupuesto](../ci/budgets.json) · [Revisión de seguridad](revision-seguridad-20261127.md).
4. **Entrega.** Mostrar capturas en el PR y verificar una Preview protegida en Vercel Hobby antes de publicar. Usar recursos del mismo origen y la política de contenido existente. Si hay un archivo nuevo, comprobar que se sirve dentro de las rutas estáticas autorizadas. Los diagramas interactivos de #21 y #22 pueden usar después el mismo lenguaje visual para explicar el entrenamiento y la predicción. [Reglas de entrega](../deploy/vercel/vercel.json) · [Modo transparente](modo-transparente.md).

La revisión del punto de partida detectó dos mejoras. Incorporar al PR de diseño la comprobación de que la política efectiva y la carga de recursos se limitan al origen propio. Evaluar el coste de las consultas amplias del catálogo en una tarea aparte, con mediciones locales. [Informe del agente de seguridad](revision-seguridad-20261127.md).

## Implementación y comparación

La cabecera final escala la palabra, el coche y su empalme de forma conjunta. El coche mide 94 px en la prueba de escritorio y 79 px en móvil, frente a los 104 px de partida. La estela queda detrás de la K. El aviso histórico usa 🕰️ y el año en ámbar. Proyecto incorpora ⚡ y la referencia a las 88 mph. El chat usa 🐾 y la grafía «Einstein», también en su nombre accesible.

| Vista local en Chromium | Antes | Después |
| --- | --- | --- |
| Escritorio, 1440 px | [Cabecera y portada](evidence/ux/regreso-al-futuro/antes-1440.jpg) | [Cabecera y portada](evidence/ux/regreso-al-futuro/despues-1440.jpg) |
| Móvil emulado, 390 px | [Cabecera y portada](evidence/ux/regreso-al-futuro/antes-390.jpg) | [Cabecera y portada](evidence/ux/regreso-al-futuro/despues-390.jpg) |

[Chat en móvil emulado](evidence/ux/regreso-al-futuro/einstein-390.jpg). A 320, 390, 768, 1024 y 1440 px se comprobó la geometría de la cabecera, el foco del enlace y la ausencia de desbordamiento horizontal. La sesión de navegador local no observó solicitudes externas ni infracciones de CSP. El paquete preparado tiene 505.037 bytes públicos y 289.441 bytes gzip, 193 bytes gzip más que la referencia. La guarda de CI compara ahora las directivas completas de la política del documento y comprueba el rechazo de un origen de imágenes adicional.

## Ajuste tras la revisión de la Preview

El recorte del DeLorean quedaba entre 6,7 y 8,6 px por debajo de la línea base de PADDOCK. Ahora el borde inferior coincide con esa línea a los cinco anchos comprobados. La escala toma como referencia el PNG del TFM. El techo del coche queda por debajo de la parte alta de la K y la primera estela entra en el hueco entre sus brazos. [Logo del TFM](../images/logo.png) · [Cabecera anterior](evidence/ux/regreso-al-futuro/antes-marca-1440.png) · [Escritorio ajustado](evidence/ux/regreso-al-futuro/despues-marca-1440.png) · [Móvil ajustado](evidence/ux/regreso-al-futuro/despues-marca-390.png).

El botón cerrado y el avatar del chat usan la silueta de la ilustración adjunta. Se recuperó el trazo con una edición de color guiada por la imagen y se exportó su máscara a un PNG de 104 px. La interfaz muestra esa máscara a 28 px y la tiñe con el color de cada superficie. El botón conserva el nombre accesible, el área táctil de 52 px y la devolución del foco al cerrar con Escape. [Botón del asistente](evidence/ux/regreso-al-futuro/einstein-boton.png) · [Avatar](evidence/ux/regreso-al-futuro/einstein-avatar.png).
