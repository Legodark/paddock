# Contrato del modelo histórico de Paddock

Fecha: 14-11-2026. Estado: auditoría completada; contrato canónico integrado posteriormente en la API candidata local de [deploy/vercel](../deploy/vercel/README.md). Sin despliegues; aplicación histórica intacta.

## Decisión del usuario

Se conservarán el modelo y los datos obtenidos durante el TFM. No se volverá a scrapear la web de origen ni se reentrenará el modelo por ahora. La representación compacta cambia el formato de almacenamiento/ejecución, conservando los árboles y sus resultados.

El futuro producto debe explicar que es una demo del TFM con datos históricos publicados en el proyecto en 2023. No se ha verificado la fecha exacta de cada anuncio ni del scraping. Las predicciones no se presentarán como tasaciones del mercado actual.

## Qué se ha reconstruido

La auditoría de las **179.502 filas** confirma una correspondencia única entre cada ID y su etiqueta en:

| Categoría | Valores del CSV | Situación de la interfaz antigua |
| --- | ---: | --- |
| Marca | 70 | IDs coherentes; no requieren traducción |
| Modelo | 719 | El selector tiene 542 etiquetas existentes en el CSV, pero sus 542 IDs cambian |
| Combustible | 8 | El selector tiene siete etiquetas y tres IDs desplazados |
| Cambio | 2 | IDs coherentes; «Automatico» es una variante sin tilde de «Automático» |

Cada modelo pertenece a una única marca en el dataset. No se encontraron conflictos de ID/etiqueta. Los once campos relevantes del CSV original y del CSV de ML coinciden semánticamente en todas las filas; por tanto, el catálogo histórico para comparables puede usar los mismos nombres del contrato reconstruido.

El [contrato legible por máquina](../experiments/model-contract/feature-contract.json) queda identificado como `tfm-original-csv-v1`. Sigue siendo candidato para integración, no una API ya publicada.

## Orden de las entradas

| Posición | Campo de la API original | Significado |
| ---: | --- | --- |
| 0 | `year` | Año |
| 1 | `horses` | Potencia en CV |
| 2 | `km` | Kilómetros |
| 3 | `displ_engine` | Cilindrada |
| 4 | `marches` | Número de marchas |
| 5 | `card_brand_id` | Marca; se conserva aquí la grafía histórica del parámetro |
| 6 | `model_id` | ID original del modelo en el CSV completo |
| 7 | `fuel_id` | ID original del combustible |
| 8 | `gearbox_id` | ID original del cambio |

El orden coincide entre las columnas reducidas del CSV, el recorrido documentado por el notebook y la lista usada por la API. El estimador contiene nueve features, pero no sus nombres: no se atribuye al archivo una metadata que no incluye.

Como sklearn 1.2.1, el runtime compacto convierte las entradas a float32 y compara contra los umbrales originales float64. No se renumeran categorías al filtrar el catálogo.

## Desfase de los modelos de coche

El diccionario reducido de la interfaz y backend es idéntico a `dic_cars_modelo_less.json`: 542 entradas con IDs 0–541. El diccionario completo tiene 719 entradas con IDs 0–718 y coincide con todas las etiquetas/IDs del CSV de ML.

Los árboles del archivo original contienen cortes para `model_id` de hasta **717,5**. Eso descarta usar 0–541 como todo el dominio categórico esperado por el bosque. Los cortes de marca alcanzan 68,5, coherentes con las 70 marcas originales. Esta evidencia respalda los IDs originales; las etiquetas semánticas se reconstruyen desde los CSV/notebooks, no desde los árboles.

Ejemplos:

| Etiqueta | ID del selector antiguo | ID del CSV que debe conservarse |
| --- | ---: | ---: |
| Abarth 500 | 0 | 1 |
| Citroen C3 aircross | 88 | 118 |
| Volvo Xc90 | 541 | 718 |

Los 542 modelos del selector antiguo existen por nombre en el diccionario completo. Para preservar su alcance inicial, el nuevo selector puede mostrar esas mismas 542 etiquetas con los IDs originales correctos. Tener 719 nombres en el catálogo no demuestra cobertura de todos ellos en el entrenamiento: no se ampliará silenciosamente el alcance de las predicciones.

## Desfase de los combustibles

El notebook de preprocesado incluye ocho combustibles, como el CSV. El selector Dart omitía «Gasolina Super», pero volvía a enumerar los siguientes:

| ID antiguo | Etiqueta del selector | ID original del CSV |
| ---: | --- | ---: |
| 0 | Corriente eléctrica | 0 |
| 1 | Diesel | 1 |
| 2 | Diesel y corriente eléctrica | 2 |
| 3 | Gasolina | 3 |
| 4 | Gasolina y corriente eléctrica | **5** |
| 5 | Gasolina/Gas | **6** |
| 6 | Mixto Gasolina/Etanol | **7** |

En el CSV, el ID 4 es «Gasolina Super» y solo aparece una vez. No se añadirá al formulario inicial solo por aparecer en el catálogo. La traducción reconoce la variante de mayúsculas `Gasolina/Gas` frente a `Gasolina/gas`, sin cambiar su ID original.

Esto es un defecto de codificación de las entradas, separado de los pesos del modelo. Conservar el modelo no obliga a conservar ese defecto en la nueva interfaz.

## Efecto comprobado y regresión

Se compararon 2.000 vehículos de una muestra reproducible entre los que el selector antiguo podía representar, usando sus atributos físicos y dos codificaciones categóricas:

- 1.953 predicciones cambiaron al pasar de los IDs del selector antiguo a los IDs del CSV.
- La mediana del cambio absoluto fue de 788,935 €; el máximo fue de 24.942,77 €.
- Con las entradas reconstruidas, el modelo compacto y el original coincidieron exactamente en los 2.000 casos.

Estos importes cuantifican un cambio de entrada; **no son una mejora de MAE, un error frente al precio real ni una evaluación con datos independientes**. El muestreo puede solaparse con entrenamiento. No se ha reentrenado ni se ha determinado la precisión actual del modelo.

Se guardaron además ocho fixtures de regresión, uno por combustible del CSV, con etiquetas, vector y resultado original. Incluyen categorías raras para comprobar la codificación; no acreditan cobertura suficiente del entrenamiento ni disponibilidad de esas categorías en la futura interfaz.

## Límite de la procedencia reconstruida

Las raíces de los 100 árboles registran un peso de bootstrap de **140.965** muestras. Los filtros del notebook actual aplicados al CSV producen **176.492** filas y una partición 80/20 daría **141.193** filas de entrenamiento. Los recuentos no coinciden.

No se ha recuperado la población exacta ni la partición aleatoria usada para exportar `cars_model.pkl`. El notebook genera varias variantes de bosque y el artefacto tiene un nombre genérico. Se conserva esa incertidumbre y no se reentrena para ocultarla. No impide conservar y comparar el artefacto congelado, pero limita cualquier afirmación sobre su entrenamiento o precisión.

## Cómo integrarlo después

1. Mantener la revisión del modelo anclada al SHA-256 original `1c36a9dca5b7ac0076d6fef0f1c6db9952aba5b42fae92db647b1f4750a11b87`. Versionar por separado el formato compacto y el catálogo.
2. Servir el catálogo desde una única fuente. Resolver la relación marca/modelo mediante el mapa explícito del contrato, en lugar de prefijos de texto.
3. Usar una versión explícita del contrato en la nueva API/frontend. No adivinar si un ID bajo es antiguo o original: ambos espacios numéricos se solapan.
4. Si se necesita compatibilidad con peticiones antiguas, crear un adapter explícito usando `legacy-to-canonical.json`; no aplicar la traducción dos veces a IDs ya canónicos.
5. Validar categorías, pares marca/modelo, campos físicos y errores antes de inferir. Los rangos observados del CSV no son límites certificados del entrenamiento ni reglas de validación ya implementadas.
6. Mantener los datos y artefactos de solo lectura. No instalar tareas programadas de scraping, actualización de datos o entrenamiento.
7. Ejecutar los fixtures y los flujos completos de predicción/comparables sobre la preview del proveedor antes de publicar el subdominio.

## Ficheros de revisión

- [Código y ejecución de la auditoría](../experiments/model-contract/README.md).
- [Resultados de auditoría](../experiments/model-contract/audit.json).
- [Contrato de features y categorías](../experiments/model-contract/feature-contract.json).
- [Traducción de IDs antiguos](../experiments/model-contract/legacy-to-canonical.json).
- [Casos de regresión](../experiments/model-contract/golden-contract-cases.json).

No se han modificado pesos, `.pkl`, aplicación histórica, CSV, diccionarios históricos ni sus lockfiles. La nueva API candidata consume el contrato canónico y pasa regresión local. El adapter público para IDs antiguos no está implementado y React sigue pendiente; no se deduce la versión del catálogo a partir de un ID.
