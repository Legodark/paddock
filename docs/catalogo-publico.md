# Alcance público del catálogo histórico

Actualizado el 17-11-2026. Seguimiento: [#17](https://github.com/Legodark/paddock/issues/17), alcance de la release #14.

El propietario confirma que el scraping de 2023 se realizó sin permiso específico y con finalidad de demostrar el entrenamiento de modelos en el TFM. No se ha aportado una autorización de reutilización pública de terceros. El 17-11-2026 el propietario eligió expresamente **conservar el catálogo completo**: «Ok, pues vamos con el catalogo completo». Esta decisión fija el alcance funcional solicitado; no acredita derechos o una licencia de terceros sobre los datos.

La interfaz puede centrarse en el TFM, el año y la finalidad educativa sin mencionar el portal. Omitir su nombre no acredita derechos sobre los datos. Se conserva la trazabilidad técnica ya documentada; no se presenta el catálogo como propio, autorizado o libremente licenciado.

## Qué conserva la candidata elegida

El SQLite contiene 179.502 filas históricas y permanece fuera del directorio público. Eso evita descargar el archivo como estático, pero no elimina la exposición de registros a través de la API:

| Ruta | Salida actual | Impacto de una posible minimización |
| --- | --- | --- |
| `/api/v1/predict` | Predicción, extremos de referencia y hasta cinco comparables a cada lado, con modelo, kilometraje, precio y año | Mantener la inferencia congelada y estudiar referencias agregadas; retirar filas individuales cambiaría la presentación de comparables |
| `/api/v1/cars` | Hasta diez filas por petición con once características, incluida provincia, filtrables | El límite por respuesta no impide consultas sucesivas; un modo educativo agregado cambiaría el contrato del chatbot y sus resultados |
| `/api/v1/catalog` y `/api/v1/search-catalog` | Categorías, etiquetas e IDs para los selectores y provincias del snapshot | Son metadatos, no fichas de anuncios; evaluar su necesidad dentro del alcance elegido |
| `/api/v1/message` | Clasificación del texto mediante el modelo histórico | No devuelve por sí sola filas del catálogo |

La API no devuelve vendedor, contacto, dirección detallada ni URL del anuncio. La ausencia de esos campos y el límite por petición no equivalen a una autorización de reutilización. Fuente de esta inspección: `deploy/vercel/paddock_service/app.py`; no se invocó la API ni se volvió a consultar la web original.

## Decisión registrada y efectos sobre la entrega

- La release conservará las 179.502 filas del catálogo histórico de 2023 y sus funciones actuales: filtros, búsqueda del chatbot y comparables de la predicción. No se solicita una versión agregada ni retirar fichas individuales.
- El SQLite continúa como recurso privado de la función, consultado por la API con sus límites actuales; «catálogo completo» no significa publicar el archivo como descarga estática o eliminar límites de respuesta/firewall.
- El medidor conserva sus referencias históricas. No sustituir datos por cifras inventadas, ni presentar el snapshot como anuncios vigentes o precios actuales.
- Conservar modelos, CSV y tag originales; sin nuevo scraping ni entrenamiento. La decisión no requiere cambios de código, dependencias, recursos o contratos de API.
- Las dos versiones mantenidas del ensayo privado de rollback ya contienen ese mismo alcance completo; no es necesario crear otra baseline por un cambio de alcance. La referencia/build definitivos de la release y las restantes comprobaciones técnicas siguen pendientes en #14.

Esta revisión registra el alcance solicitado y la información disponible de procedencia y reutilización; no emite una conclusión jurídica ni añade una licencia global a los datos. No añade código, servicios, invocaciones o costes. El acceso continúa autenticado hasta completar la entrega de #14.
