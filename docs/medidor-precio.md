# Medidor de precio histórico recuperado

Hallazgo #23 de la revisión #12: el propietario probó la Preview desde iPhone y echó en falta el gráfico del TFM que indicaba Buen precio, Promedio o Caro. Se recupera el medidor tipo velocímetro en la tarjeta de estimación, adaptado a móvil y escritorio; sustituye la barra discreta de referencia.

## Criterio original y significado

La referencia Flutter está en `radial_gauge_widget.dart` y `price_classifier.dart`. Compara la **predicción** con los extremos de los comparables del mismo modelo, dentro de la ventana histórica de ±5.000 €. No solicita un precio de anuncio. Se conserva la regla:

- Por debajo del primer 25 % del intervalo: **Buen precio**.
- Desde ese corte hasta antes de `mínimo + (máximo − mínimo) / 1,33`: **Promedio**.
- Desde ese segundo corte (aprox. 75,19 %) hasta el extremo superior: **Caro**.

El corte inferior pertenece a Promedio y el superior a Caro. Es una regla visual orientativa entre referencias de 2023; no estima la precisión del modelo, un intervalo de confianza o la conveniencia de una oferta actual. Los textos del resultado y la explicación desplegable lo aclaran.

Si falta cualquiera de las dos listas de comparables, o no hay un intervalo positivo válido, el medidor queda neutro y sin aguja: «Sin referencias suficientes». La API usa la predicción como extremo cuando falta un lado; clasificar ese caso como Caro o Buen precio produciría una conclusión engañosa. Se siguen mostrando las referencias disponibles y la estimación.

## Diseño y accesibilidad

SVG ligero decorativo, con aguja, tres zonas y separadores. El nombre, estado, leyenda y explicación son HTML accesible; la información no depende solo del color ni de pasar el ratón. El gráfico escala al ancho del resultado y conserva la estimación enviada cuando se edita el formulario, junto al aviso existente de resultado anterior. No hay bibliotecas gráficas nuevas, fuentes externas, campos nuevos o solicitudes adicionales.

100 pruebas unitarias pasadas, con límites/casos incompletos de la regla, build y 96 casos locales de navegador. Las pruebas nuevas cubren las tres zonas mediante fixtures identificados, lados ausentes, intervalo colapsado y la predicción real de referencia de 20.155 € (Promedio), sin otra solicitud por mostrar el medidor. Capturas [móvil](evidence/ux/price-gauge-mobile.jpg), [escritorio](evidence/ux/price-gauge-desktop.jpg) y [evidencia local](evidence/ux/price-gauge-local.json), con seis anchos de 320 a 1440 px.

Paquete completo: **504.608 bytes públicos / 289.202 bytes gzip**, dentro del presupuesto vigente. Los 16 archivos de backend/configuración/recursos coinciden con la publicación anterior; la función materializada mantiene 115,50 MiB y el resultado 20.155 €. Se verificará la entrega estática en Vercel, sin nuevas invocaciones de la API de aplicación. Modelo, datos, DNS y `main` intactos.

La prueba en iPhone está informada por el propietario, sin inventar navegador o versión de iOS. La corrección debe revisarse en la nueva Preview; la cobertura física de lector de pantalla, teclado y zoom nativo continúa abierta en #12. El ajuste fino del DeLorean y el modo transparente mantienen su planificación previa.
