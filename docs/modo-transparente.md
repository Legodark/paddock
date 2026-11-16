# Modo transparente: ver el interior de Paddock

Propuesta del propietario del 16-11-2026: una «carcasa transparente» de la aplicación mediante diagramas dinámicos que expliquen el entrenamiento y permitan seguir una predicción. Trabajo planificado **para después de completar el despliegue público**, en el [milestone posterior al despliegue](https://github.com/Legodark/paddock/milestone/2).

## Dos recorridos complementarios

| Recorrido | Qué se mostrará | Seguimiento |
| --- | --- | --- |
| Entrenamiento histórico | Reconstrucción animada de datos, preparación, características, entrenamiento, evaluación y exportación, basada en las fuentes conservadas | [#21](https://github.com/Legodark/paddock/issues/21) |
| Una predicción | Acciones reales de la petición: validación, vector de entrada, inferencia del modelo congelado, comparables y respuesta; también cancelación y errores | [#22](https://github.com/Legodark/paddock/issues/22) |

La ubicación queda abierta: una sección de la portada o una vista «Cómo funciona» integrada con ella. En móvil debe poder leerse cada paso sin tapar el resultado, formulario o chat flotante.

## Control del usuario

Ambas vistas comparten un control **«Modo transparente»**. Propuesta inicial: desactivado por defecto y activable/desactivable a voluntad. Si se recuerda la elección, guardar solo esa preferencia en el navegador. Desactivarlo detiene el trabajo visual y mantiene formulario, resultado y conversación. Reproducir o repetir una animación conserva la petición original, sin lanzar otra predicción.

Controles de pausa, avance y repetición; alternativa textual y movimiento reducido, además de teclado y lector de pantalla. La presentación del entrenamiento y la traza de predicción deben compartir lenguaje visual y mantener clara su naturaleza.

## Fidelidad de las explicaciones

El entrenamiento es una **reconstrucción didáctica histórica**: el modelo y catálogo siguen congelados. No se vuelve a scrapear o entrenar. La auditoría no recuperó la población/partición exacta del modelo exportado; las etapas ilustrativas y las desconocidas se identificarán, sin inventar métricas o hiperparámetros.

La vista de predicción debe vincularse a la **misma petición real**. El cliente actual conoce envío, espera y respuesta, pero no recibe eventos de progreso interno. Antes de implementarlo se evaluará una traza opcional en la misma respuesta: animar después esas etapas se identificará como reproducción de una traza ya completada. El progreso incremental durante el cómputo requiere evaluar transporte y cuotas; no se representará mediante temporizadores que finjan actividad real del servidor.

La traza será acotada y aislada por petición. Puede explicar etapas, versión y tiempos medidos; no debe entregar pesos del modelo, SQLite, secretos, rutas internas, SQL completo o trazas de excepción. Explicar el proceso no equivale a explicar la causa del precio ni la importancia de cada característica.

## Coste y entrega

Mantener **0 € adicionales en Hobby**: recursos ligeros, carga a demanda y ninguna llamada por cada etapa, servicio de observabilidad de pago o almacenamiento nuevo. Medir también los bytes públicos totales: lazy loading por sí solo no reduce ese presupuesto. Los diagramas Archify existentes sirven de referencia documental/visual; sus HTML congelados no se consideran una implementación lista de estas animaciones.

Comenzar después de verificar la publicación de [#14](https://github.com/Legodark/paddock/issues/14). Estas mejoras se siguen separadas del milestone v1.0; la entrega al portfolio [#15](https://github.com/Legodark/paddock/issues/15) mantiene su curso. Cuando llegue esta fase, cada mejora tendrá diseño, implementación y validación propios. En esta petición se actualiza únicamente la planificación y el seguimiento.
