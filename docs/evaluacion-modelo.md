# Evaluación del modelo: conversión compacta sin reentrenamiento

Fecha: 14-11-2026. Resultado: alternativa local viable para reducir dependencias, tamaño comprimido y memoria. Integrada posteriormente en una [API candidata validada localmente](paquete-vercel.md), sin despliegue en Vercel ni cambios de la aplicación histórica.

Decisión posterior del usuario: mantener este modelo y dataset, sin nuevos scrapings ni reentrenamiento. Se ha auditado el [contrato de IDs y features](contrato-modelo-historico.md); la conversión compacta conserva los árboles originales y la nueva interfaz deberá usar los IDs reconstruidos.

## Conclusión

Se pueden conservar los bosques originales y ejecutar sus predicciones con biblioteca estándar de Python. El experimento exporta la estructura necesaria para inferencia y omite estadísticas utilizadas para entrenar. No reduce el número de árboles, poda ramas, cuantiza umbrales ni cambia el entrenamiento.

En los casos probados, las predicciones y probabilidades coinciden exactamente con el runtime original. Esta vía es preferible a reentrenar solo para reducir recursos: primero comprobar si el artefacto compacto cabe en el plan gratuito. La procedencia de los IDs sigue siendo un problema separado.

## Resultados medidos

| Medida | Original | Compacto |
| --- | ---: | ---: |
| Modelo de precio comprimido | 93,88 MiB | 22,58 MiB |
| Modelo de chat comprimido | 0,476 MiB | 0,045 MiB |
| Ambos modelos comprimidos | 94,36 MiB | 22,63 MiB |
| Dependencias de ML para inferencia | sklearn, NumPy, SciPy, joblib | Ninguna |
| RAM residente tras carga/prueba | Unos 621 MiB tras cargar el original | Unos 105 MiB tras 1.000 predicciones seriales y 100 mensajes |
| Pico observado | Unos 1.018 MiB durante carga original | Unos 105 MiB en el benchmark compacto |
| Arranque local | 7,48 s en el benchmark serial original | 0,013 s para abrir el archivo mapeado y cargar el chat |
| Precio individual, mediana / p95 | 5,66 / 7,95 ms | 0,28 / 0,47 ms |
| Chat individual, mediana / p95 | 6,65 / 8,63 ms | 0,16 / 0,46 ms |

La reducción conjunta de tamaño comprimido es del **76,0 %**. La memoria residente medida baja aproximadamente un **83 %** y el pico observado alrededor de un **90 %**. No son medidas de Vercel.

Condiciones: filesystem local disponible, ejecución serial, 1.000 entradas de precio y 100 mensajes comunes a ambos benchmarks. Python 3.10.22 en el original y 3.12.14 en el compacto; los runtimes y sus validaciones difieren. No se atribuye toda la diferencia temporal al formato. El arranque compacto usa `mmap`, por lo que parte de la lectura ocurre al inferir: la primera predicción medida tardó 2,95 ms. No se midieron descarga, arranque frío del proveedor ni concurrencia. La apertura rápida no prueba que todos los bytes del modelo ya estén residentes.

**El archivo mapeado no ocupa 22,58 MiB:** el binario sin gzip ocupa 91,63 MiB. Gzip reduce almacenamiento/transferencia, pero el runtime probado abre el binario descomprimido. No confundir el tamaño de descarga con el del bundle descomprimido o la RAM.

## Comparación de resultados

Precio: 13.500 vectores, con semilla 20261114:

- 10.000 filas muestreadas del CSV.
- 2.000 combinaciones sintéticas dentro de los rangos numéricos observados.
- 1.500 sondas de valores float32 alrededor de umbrales de una selección de árboles. No garantizan recorrer todos los nodos ni representan necesariamente vehículos válidos.
- Diferencia absoluta máxima: **0,0**; ninguna diferencia superior a 1e-9.

Chat: 1.367 casos:

- Los 357 mensajes del CSV.
- 10 casos adicionales, incluidos vacío, puntuación, acentos, Unicode, repetición y texto largo.
- 1.000 combinaciones aleatorias del vocabulario.
- Diferencias de etiqueta: **0**. Diferencia máxima de probabilidades: **0,0**.

Una segunda ejecución independiente, sin site-packages (`python3 -S`), verificó otros 1.000 vectores del CSV frente a resultados originales guardados y 100 mensajes; coincidencia exacta. Rechazó cinco clases de entradas numéricas inválidas. No importó bibliotecas externas de ML.

Esto demuestra equivalencia en los casos ejecutados, no una garantía exhaustiva para toda entrada posible. Tampoco mide MAE/R², calidad fuera de entrenamiento, actualidad de precios o calidad del chatbot. Sigue pendiente resolver el desacuerdo entre el diccionario de 542 modelos y el dataset de 719.

## Formato y ejecución

Regresor: se preservan los 100 árboles, sus 7.390.896 nodos y las nueve features. El archivo binario guarda raíces, feature por nodo, umbral o valor de hoja en float64, y desplazamiento al hijo derecho. El hijo izquierdo es el siguiente nodo; el exportador comprueba esa propiedad en todos los nodos internos. Las entradas se convierten a float32 como en sklearn 1.2.1. La predicción acumula las hojas en el orden original y divide entre 100.

Chat: JSON comprimido con los 100 árboles, probabilidades, clases, vocabulario y configuración binaria del vectorizador. Se replica el tokenizer inspeccionado: minúsculas, separación por espacios y eliminación de puntuación ASCII. No se añade un servicio de IA ni una API de pago.

El runtime independiente usa `mmap`, `struct`, `json`, `gzip` y otras partes de la biblioteca estándar. Flask y sus dependencias seguirían existiendo en la API; «sin dependencias de ML» no significa que toda la aplicación carezca de dependencias.

## Consecuencias para Vercel y coste cero

La alternativa a comprobar pasa a ser:

1. React/Vite estático en `paddock.juancerezo.com`.
2. API Python/Flask con predictor compacto, sin sklearn/NumPy/SciPy/joblib en producción.
3. Binario de precio, chat y snapshot SQLite incluidos en el despliegue si lo admite el plan gratuito.
4. Sin Blob ni base de datos gestionada por defecto.

Binario de precio + chat comprimido + SQLite candidato suman aproximadamente **111,45 MiB**, antes de Flask, runtime Python y empaquetado del proveedor. Frente a la estimación anterior de 312 MiB con dependencias de ML, es una mejora importante; no es el tamaño final de un bundle ya construido.

Si se eligiese almacenamiento separado, 1.000 descargas de ambos artefactos compactos comprimidos serían unos **22,10 GiB**, frente a 92,15 GiB con los originales. Son volúmenes calculados, no cuotas ni precios de Blob. Empaquetarlos evitaría esas descargas desde Blob por instancia.

El presupuesto permanece en **0 € adicionales**. No se han verificado aún plan, cuotas, consumo compartido o comportamiento al agotarlas; no se puede confirmar todavía capacidad mensual ni gratuidad del despliegue completo. Este experimento hace más plausible la alternativa gratuita, pero no reemplaza esa comprobación.

## Cambios y reproducibilidad

Los scripts y resultados pequeños están en [experiments/model-compact](../experiments/model-compact/README.md). Los artefactos grandes permanecen fuera del checkout, en `/workspace/.paddock/model-evaluation`; no se han añadido al repositorio ni subido a un proveedor.

- [Comparación completa](../experiments/model-compact/comparison.json).
- [Benchmark compacto independiente](../experiments/model-compact/standalone-benchmark.json).
- [Benchmark serial original](../experiments/model-compact/legacy-serial-benchmark.json).
- [Runtime experimental](../experiments/model-compact/compact_runtime.py).

Los checksums de los dos `.pkl` originales siguen coincidiendo con los registrados antes del experimento. No se modificaron aplicación, notebooks, CSV, diccionarios, dependencias ni lockfiles.

## Antes de integrar

- Resolver y versionar el contrato de IDs/features y la procedencia del modelo.
- Endurecer el lector del formato: manifiesto y SHA-256 desde una fuente confiable, límites, validación de offsets/raíces/features, manejo de errores y liberación de recursos. El prototipo valida cabecera y longitud; no debe recibir artefactos arbitrarios.
- Probar contrato de API, carga en el runtime objetivo, concurrencia, memoria por instancia y arranque sin caché. El entrenamiento y la conversión deben permanecer fuera de peticiones públicas.
- Medir el bundle generado por Vercel con dependencias mínimas; comprobar límites y cuota compartida real.
- Ejecutar la preview completa y verificar que se mantiene la factura a cero antes de asociar el subdominio.

## Diagramas

Ver los [tres diagramas interactivos generados con Archify](diagramas.md). Representan la arquitectura candidata y las puertas de validación, no un despliegue ya realizado.
