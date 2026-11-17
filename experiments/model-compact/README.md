# Experimento: inferencia compacta de los bosques originales

Estos scripts evalúan una conversión de formato sin reentrenamiento. No están integrados en la API ni listos para producción. Los `.pkl` originales permanecen intactos.

## Qué conservan

- Los 100 árboles del regresor, sus umbrales float64 y los valores de las hojas. La entrada se convierte a float32 como en scikit-learn 1.2.1.
- El clasificador del chat, sus probabilidades, vocabulario binario y tokenizer. No se cambian etiquetas ni reglas de tokenización.
- Se omiten estadísticas de entrenamiento que no usa la inferencia. El hijo izquierdo es el siguiente nodo en preorden; el derecho se guarda como desplazamiento. El exportador verifica esa propiedad en todos los nodos internos.

El runtime compacto usa solo biblioteca estándar de Python. El regresor se abre como archivo binario de solo lectura con `mmap`; no ejecutar directamente un archivo `.gz`. El exportador depende del entorno histórico compatible para leer los artefactos confiables.

## Reproducir en este entorno

Los resultados y binarios se guardan por defecto fuera del checkout, en `/workspace/.paddock/model-evaluation`. Se puede elegir otro directorio con `PADDOCK_EVAL_DIR`.

```bash
cd /workspace/paddock
PYTHONDONTWRITEBYTECODE=1 /workspace/.paddock/venv/bin/python experiments/model-compact/export_and_compare.py
PYTHONDONTWRITEBYTECODE=1 python3 -S experiments/model-compact/benchmark_standalone.py
PYTHONDONTWRITEBYTECODE=1 /workspace/.paddock/venv/bin/python experiments/model-compact/benchmark_legacy.py
```

El primer comando carga los artefactos originales de confianza con las dependencias fijadas del onboarding, exporta ambos modelos, escribe hashes, compara resultados y genera casos de referencia. El gzip usa fecha cero para evitar diferencias introducidas por la fecha del archivo. La exportación puede tardar más de un minuto.

`-S` impide cargar site-packages: la prueba independiente comprueba que no se importaron NumPy, SciPy, scikit-learn ni joblib. Los resultados JSON pequeños de esta carpeta corresponden a la ejecución documentada; repetir un comando escribe nuevos resultados en el directorio externo, sin sustituirlos automáticamente aquí.

## Límites

La equivalencia se ha probado en 13.500 vectores y 1.367 mensajes; no es una demostración exhaustiva para todas las entradas posibles. Las sondas alrededor de umbrales no garantizan recorrer todos los nodos. Se comparan predicciones antiguas, no precisión contra un conjunto independiente de entrenamiento.

Los IDs del dataset completo y del diccionario de la aplicación difieren. Hay que reconstruir la procedencia del modelo antes de usarlo para tasaciones públicas. La prueba no corrige ese problema.

Antes de integrar: versión de formato documentada, manifiesto confiable y verificación SHA-256, comprobaciones completas de índices/raíces/features, límites y manejo de errores, cierre de recursos, tests de contrato y despliegue real. El prototipo solo valida cabecera y tamaño; no es un lector endurecido para artefactos no confiables.

No se han instalado dependencias en la aplicación ni subido binarios generados a Git, Blob o Vercel. Ver [evaluación y resultados](../../docs/evaluacion-modelo.md).
