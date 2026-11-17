# Auditoría offline del contrato del modelo histórico

Política acordada: modelo y dataset congelados; sin scraping nuevo ni reentrenamiento. Se inspeccionan los artefactos originales y se construye una traducción de identificadores. El modelo compacto conserva los mismos árboles y resultados.

## Ejecutar

```bash
cd /workspace/paddock
PYTHONDONTWRITEBYTECODE=1 /workspace/.paddock/venv/bin/python experiments/model-contract/audit_contract.py
```

Requiere el entorno histórico de lectura del modelo y el binario compacto generado por [model-compact](../model-compact/README.md). Usa los `.pkl` originales de confianza y verifica el SHA-256 del regresor antes de cargarlos. No ejecuta `.fit()`, notebooks, scraping ni peticiones externas. La salida se escribe fuera del checkout, por defecto en `/workspace/.paddock/model-contract`; se puede cambiar mediante `PADDOCK_CONTRACT_DIR`. El binario compacto se busca en el directorio externo estándar del experimento anterior.

## Ficheros revisables

- `feature-contract.json`: orden de las nueve features, diccionarios completos, relación modelo/marca, política del catálogo, hashes y límites de lo reconstruido.
- `legacy-to-canonical.json`: traducción explícita de los selectores antiguos a los IDs del CSV. No deducir la codificación por el valor numérico.
- `audit.json`: resultados de las comprobaciones y comparación de entradas antiguas y corregidas.
- `golden-contract-cases.json`: ocho casos de regresión, uno por combustible presente en el CSV, con vector y resultado original. Son fixtures, no una garantía de cobertura del entrenamiento ni precisión del modelo.

Los JSON incluidos aquí corresponden a la ejecución documentada. Repetir la auditoría actualiza los resultados externos, no estos ficheros automáticamente.

## Comprobaciones

Se verifican las 179.502 filas para obtener correspondencias uno a uno entre IDs y etiquetas en marca, modelo, combustible y cambio, y una marca única por modelo. Se contrastan los diccionarios y selectores Dart. El orden físico de las features del CSV, tras eliminar columnas ajenas a la inferencia, coincide con las nueve entradas de la API original.

También se comparan las 179.502 filas de `car_data.csv` y `cars_ml.csv` en los once campos usados por la consulta/inferencia: cero diferencias semánticas. La comparación numérica admite representaciones equivalentes como `1` y `1.0`.

Los árboles se inspeccionan sin reentrenar: un corte en `model_id=717.5` es incompatible con el diccionario reducido cuyo ID máximo es 541. Por último, se comparan 2.000 vehículos usando la codificación del selector antiguo y la del CSV, y se verifica que el runtime compacto coincide con el original al usar las entradas reconstruidas.

## Límites

El estimador no contiene etiquetas de categorías ni nombres de features. El contrato se reconstruye a partir de CSV, notebooks, API y rangos de los árboles; no se recuperó el dataset exacto ni la partición aleatoria del entrenamiento. El recuento de muestras del bosque difiere del que resultaría de los filtros del notebook actual. Esta diferencia se conserva en el informe; no se intenta resolver entrenando otro modelo.

Las diferencias entre predicciones con IDs antiguos y correctos miden el efecto de la codificación, no la precisión. Ningún resultado debe presentarse como validación independiente o tasación actual de mercado.

Ver [contrato e implicaciones para la migración](../../docs/contrato-modelo-historico.md).
