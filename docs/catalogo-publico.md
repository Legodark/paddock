# Alcance público del catálogo histórico

16-11-2026. Seguimiento: [#17](https://github.com/Legodark/paddock/issues/17), dependencia de la release #14.

El propietario confirma que el scraping de 2023 se realizó sin permiso específico y con finalidad de demostrar el entrenamiento de modelos en el TFM. No se ha aportado una autorización de reutilización pública. Este dato aclara la procedencia; no constituye una decisión de publicar el catálogo completo ni una conclusión jurídica sobre su uso.

La interfaz puede centrarse en el TFM, el año y la finalidad educativa sin mencionar el portal. Omitir su nombre no acredita derechos sobre los datos. Se conserva la trazabilidad técnica ya documentada; no se presenta el catálogo como propio, autorizado o libremente licenciado.

## Qué expondría la candidata actual

El SQLite contiene 179.502 filas históricas y permanece fuera del directorio público. Eso evita descargar el archivo como estático, pero no elimina la exposición de registros a través de la API:

| Ruta | Salida actual | Impacto de una posible minimización |
| --- | --- | --- |
| `/api/v1/predict` | Predicción, extremos de referencia y hasta cinco comparables a cada lado, con modelo, kilometraje, precio y año | Mantener la inferencia congelada y estudiar referencias agregadas; retirar filas individuales cambiaría la presentación de comparables |
| `/api/v1/cars` | Hasta diez filas por petición con once características, incluida provincia, filtrables | El límite por respuesta no impide consultas sucesivas; un modo educativo agregado cambiaría el contrato del chatbot y sus resultados |
| `/api/v1/catalog` y `/api/v1/search-catalog` | Categorías, etiquetas e IDs para los selectores y provincias del snapshot | Son metadatos, no fichas de anuncios; evaluar su necesidad dentro del alcance elegido |
| `/api/v1/message` | Clasificación del texto mediante el modelo histórico | No devuelve por sí sola filas del catálogo |

La API no devuelve vendedor, contacto, dirección detallada ni URL del anuncio. La ausencia de esos campos y el límite por petición no equivalen a una autorización de reutilización. Fuente de esta inspección: `deploy/vercel/paddock_service/app.py`; no se invocó la API ni se volvió a consultar la web original.

## Decisión pendiente antes de abrir acceso

- La Preview autenticada conserva la aplicación completa para revisión. No se cambia silenciosamente su comportamiento ni se cierra #17 por retirar un nombre.
- Preparar una decisión de alcance: mantener el catálogo privado o estudiar una versión pública centrada en inferencia y resultados agregados. La agregación reduce exposición; no se declara por sí sola una garantía sobre los derechos de reutilización.
- Si se elige cambiar el alcance público, definir expresamente qué verá el usuario en comparables y chatbot y validar esos contratos antes de implementar. El medidor utiliza actualmente extremos de referencia del snapshot; no sustituirlos por cifras inventadas.
- Conservar modelos, CSV y tag originales; sin nuevo scraping ni entrenamiento. No generar datos sintéticos y presentarlos como coches históricos reales.

Esta revisión no añade código, servicios, invocaciones o costes. La decisión final de publicación sigue pendiente en #17/#14; las comprobaciones técnicas de firewall, plataforma y UX pueden continuar en paralelo.
