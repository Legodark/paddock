# Primer recorrido React validado

Fecha: 14-11-2026. Estado: funcional y comprobado localmente; sin despliegue ni cambios DNS.

Actualización del 15-11-2026: el [chatbot](chatbot-react.md) ya está integrado y la [revisión de seguridad local](seguridad-reactivacion.md) está documentada. Las métricas y capturas de este informe conservan la línea base del primer recorrido.

## Resultado

La nueva interfaz en [web](../web/README.md) permite seleccionar un vehículo, validar sus características, consultar la API de inferencia y comparar el resultado con registros reales del mismo modelo. Mantiene los IDs canónicos auditados; el ejemplo Citroën C3 aircross usa `model_id=118` y devuelve **20.155 €**, igual que el modelo original. No hay scraping, entrenamiento ni predicciones prefabricadas.

Se sustituyen los tamaños rígidos de la interfaz histórica por un diseño adaptable, con formulario y resultado en dos columnas en escritorio y una columna en móvil. La identidad usa fondo oscuro y acentos ámbar. Se explica el contexto de 2023 antes del formulario, junto al resultado y junto a los comparables. Se conserva la atribución compartida del TFM.

- [Captura de escritorio](evidence/web/desktop-result.png).
- [Captura móvil](evidence/web/mobile-result.png).

El formulario incluye marca/modelo dependientes, unidades, límites y errores asociados al campo. El primer error recibe el foco. Los botones evitan envíos duplicados y la petición tiene timeout. Ante un fallo se mantienen los datos y se permite reintentar; no se representa un error como precio cero.

El resultado recibe el foco tras la respuesta. Si se editan los datos, se avisa de que hay que actualizarlo. Los comparables se pueden filtrar por precio inferior/superior; el rango corresponde al catálogo y no se anuncia como intervalo de confianza. Cuando faltan referencias se muestra el estado vacío.

## Verificación ejecutada

| Comprobación | Resultado |
| --- | --- |
| Tests unitarios de contrato, validación y errores HTTP | 19 pasados |
| TypeScript estricto y build de producción | Correctos |
| Playwright, escritorio Chromium | 8 pasados |
| Playwright, Chromium con emulación Pixel 7 | 8 pasados |
| API sobre los artefactos del paquete conjunto | 13 pasados |
| axe, etiquetas WCAG 2 A/AA, 2.1 AA y 2.2 AA | Sin infracciones detectadas en estado inicial y resultado, en ambos perfiles |
| Teclado | Enlace de salto funcional, foco en el formulario, error y resultado |
| Anchos 320, 360, 390, 768, 1.024 y 1.440 px | Sin desbordamiento horizontal en el recorrido probado |
| Política CSP de la preview | Sin infracciones en la predicción y actualización reales |
| `npm audit`, incluyendo desarrollo | 0 vulnerabilidades conocidas, salida 0 |
| Modelo/dataset descargado por el navegador | Ninguno en el recorrido probado |

Los tests de extremo a extremo usan el catálogo y la inferencia reales. Solo los escenarios de error, demora y ausencia de comparables interceptan respuestas para verificar recuperación. Se inspeccionaron capturas de escritorio y móvil; se corrigieron un enlace de salto visible en la captura de página completa y símbolos dependientes de la fuente instalada.

Estas comprobaciones no equivalen a una auditoría completa de seguridad o accesibilidad. Faltan Firefox, Safari/iOS, dispositivos físicos, lector de pantalla, zoom y orientación. Las cifras corresponden a esta máquina y a una preview local de Vite, no a Vercel.

## Recursos y aislamiento

El paquete público contiene cuatro archivos: HTML, JS, CSS y `robots.txt`; suma **265.686 bytes**, unos 266 kB sin comprimir. Su suma gzip local es aproximadamente **81 kB**, excluyendo respuestas de API y cabeceras. No es una medición de transferencia facturada por Vercel ni una puntuación de rendimiento web.

El constructor oficial genera la función Python con **121.111.993 bytes = 115,50 MiB** y 369 archivos. El frontend se excluye de la función. Los modelos y SQLite se conservan en la función y fuera de `public/`. La función materializada, sin el entorno virtual de desarrollo, devuelve readiness, catálogo de 542 modelos, predicción dorada y diez comparables correctos.

Se han añadido cabeceras candidatas `nosniff`, denegación de marcos, referrer y permisos restrictivos, y CSP del documento con scripts/conexiones del mismo origen. Los estilos en atributos se permiten para el indicador de precio; no se permiten scripts inline ni `eval`. La preview prueba esta política; queda comprobar las cabeceras efectivas y el routing en Vercel.

Evidencias: [resumen de navegador y dependencias](evidence/web/verification.json), [paquete conjunto](evidence/web/package-smoke.json), [constructor oficial](evidence/web/bundle-report.json). Las capturas no contienen datos de la cuenta de Vercel ni credenciales.

## Siguientes pasos del plan

1. Chatbot y extracción de filtros ya integrados y probados; ver [chatbot](chatbot-react.md). Las cifras anteriores conservan la línea base del primer recorrido.
2. Cerrar la revisión profunda de seguridad, dependencias históricas, protección contra abuso y la revisión manual pendiente de UX/accesibilidad y navegadores.
3. El flujo reproducible y la CI alojada ya pasaron 144 pruebas. Validar una preview real después de resolver sus condiciones de publicación y comprobar límites/consumo compartido sin contratar extras.
4. El tag original ya está publicado y el PR #6 está en borrador. Quedan el subdominio y la issue del portfolio cuando existan versión y URL verificadas. Ver [seguimiento #7](https://github.com/Legodark/paddock/issues/7) y [revisión actual](revision-pr-y-hobby.md).

No se han reconfigurado los ajustes ya publicados del entorno ni se han creado servicios de Vercel, Blob o planes de pago.
