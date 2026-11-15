# Plan de reactivación de Paddock

Actualizado: 15 de noviembre de 2026. Estado: API, predicción, chatbot React y CI reproducible validados localmente y en GitHub; rama de revisión y tag original publicados. Propuesta gratuita de firewall preparada. Pendientes las verificaciones de plataforma. Sin despliegues. Aplicación histórica intacta.

Preparación actual de #10: proyecto Paddock creado en Hobby con autenticación de todos los despliegues; paquete de la candidata comprobado y 17 pruebas de API pasadas. La red bloquea las URLs `*.vercel.app`; se guardó únicamente ese permiso adicional en el borrador, pendiente de aplicación por el propietario. La app sigue sin desplegar y el DNS sin cambios. Ver [configuración y evidencia de la preview](preview-vercel.md).

## Objetivo y alcance

Recuperar el TFM como aplicación pública en `paddock.juancerezo.com` (nombre propuesto), conservar su historia, actualizar sus dependencias y mejorar seguridad, UX/UI y usabilidad en móvil y escritorio. Al terminar, crear una issue en `Legodark/ai-portfolio` para integrarlo desde otra sesión.

Presupuesto confirmado: **0 € de servicios adicionales, manteniendo Vercel y pagando únicamente la renovación del dominio existente**. No contratar planes de pago, contenedores de pago ni almacenamiento con cobro por exceso. Comprobar elegibilidad, consumo compartido con el portfolio y protección ante sobreconsumo antes de desplegar. Si no se demuestra que la aplicación completa cabe en esa condición, reducir recursos o documentar el bloqueo; no sustituirla por un demo incompleto sin decisión del usuario.

Diagramas con Archify: los [tres HTML interactivos](diagramas.md) ya pasaron sus cuatro gates originales en GitHub Actions, conservando candidatos y bytes. También se revisaron visualmente en claro/oscuro. El bloqueo local de `file://` queda diagnosticado y sus recibos históricos se preservan. Los HTML describen la propuesta congelada del 14-11-2026; el estado actual se sigue aquí y en las issues. Los Mermaid del estudio de costes quedan como esquemas textuales complementarios.

Decisión acordada: reconstruir el frontend con React + TypeScript + Vite y conservar inicialmente la API Python/Flask y ambos modelos. Flutter queda como referencia histórica en el tag original; no mantener dos interfaces activas. Flutter sigue siendo una tecnología mantenida: la migración responde al objetivo web y al mantenimiento compartido con el portfolio, no a una supuesta desaparición del framework.

Modelo y datos congelados por decisión del usuario: no volver a scrapear la web de origen ni reentrenar por ahora. La conversión compacta conserva los árboles originales. La aplicación se presentará como demo histórica del TFM, sin prometer tasaciones actuales. El [contrato de IDs y features](contrato-modelo-historico.md) está auditado y preparado para integrar; la procedencia exacta de la partición de entrenamiento sigue sin recuperarse.

Avance posterior: contrato canónico integrado en [deploy/vercel](../deploy/vercel/README.md). El constructor oficial produjo una función de 115,50 MiB; predicciones HTTP locales y la prueba del bundle materializado pasaron. El tag original y la rama de revisión están publicados, con `main` intacta; ver [entrega en GitHub](entrega-github.md). Al [primer recorrido React](frontend-react.md) se añade el [chatbot](chatbot-react.md): clasificación congelada, extracción de filtros, consultas y recuperación de errores. La [CI](../ci/README.md) regenera los modelos desde los pickle verificados y pasó en GitHub 80 pruebas unitarias, 17 de API, 40 de navegador y siete guardas de CI; 144 en total, sin omitidas. La [revisión de seguridad](seguridad-reactivacion.md) cubre código, dependencias y paquete, incluidas las correcciones de las herramientas de construcción. La [propuesta de firewall](proteccion-vercel.md) usa una regla incluida en Hobby; queda aplicarla y comprobarla. Faltan validación de plataforma, cobertura manual de navegadores, preview autorizada y DNS.

La CLI está autenticada mediante el flujo seguro completado por el usuario. Se confirmó el equipo `legodarks-projects` en Hobby y el dominio existente del portfolio. El [estudio de costes](costes-y-diagramas.md) recoge las cuotas consultadas y las capturas de consumo compartidas. El consumo mensual de CPU, memoria provisionada e invocaciones sigue sin estar disponible mediante las capacidades gratuitas probadas; no se contratará Observability Plus ni se pedirán nuevas capturas para continuar el trabajo local.

La [revisión del PR y Hobby](revision-pr-y-hobby.md) amplía el barrido a los 116 commits alcanzables, añade avisos de licencia y confirma Hobby activo sin trial. Quedan pendientes la evidencia de reutilización pública del catálogo y la comprobación de plataforma. La documentación actual advierte que una pausa por cuota puede afectar a todos los despliegues del equipo y no reactivarse automáticamente; el presupuesto de prueba no se confunde con un límite de gasto. El [seguimiento #7](https://github.com/Legodark/paddock/issues/7) enlaza las tareas y el PR. El [Kanban](https://github.com/users/Legodark/projects/3) ya contiene las 12 tarjetas, según la ejecución local del propietario; #16 conserva pendientes la agrupación visual y los ajustes de automatización. La integración de la nube sigue sin acceso a Projects; los detalles y la evidencia están en [Kanban de GitHub](kanban-github.md).

La [revisión UX posterior](ux-y-accesibilidad.md) corrige la navegación móvil con texto ampliado, el indicador de sección seleccionada y el titular que desbordaba en WebKit. La CI ampliada pasó 239 pruebas, con 135 casos de navegador en cinco perfiles de Chrome, Firefox y WebKit. Se conserva el diagnóstico fallido anterior y se documenta una adaptación temporal del analizador axe para el fallo nativo de Firefox 159, sin omitir reglas. Quedan lector de pantalla, dispositivos físicos, zoom nativo y smoke de plataforma; #12 continúa abierta. Los diagramas están validados y #13 está cerrada.

Antes de escribir código de aplicación, comprobar alojamiento, datos, recursos de inferencia, costes y dominio. Las pruebas de viabilidad se ejecutan fuera del código de aplicación. Ver el [informe de arquitectura](arquitectura-reactivacion.md).

## Evidencia inicial

- HEAD original: `d43ea99461ab8d2457f4ccf8552822d34d6dfd52` (12-03-2023). No había tags locales ni cambios en el checkout antes de redactar este plan. Hay que consultar tags remotos antes de reservar nombres.
- Backend Flask; modelos entrenados con scikit-learn 1.2.1. El entorno preparado usa Python 3.10.22 y versiones compatibles de NumPy/SciPy. Arranque, clasificación HTTP de dos mensajes y predicción directa del modelo comprobados.
- `cars_model.pkl`: aproximadamente 94 MiB; `message_model.pkl`: aproximadamente 488 KiB. Medir además tamaño descomprimido, memoria real y latencia. El tamaño del archivo no equivale al consumo del proceso.
- MongoDB no está configurado: `get_collection.py` contiene una cadena de ejemplo y no admite variables de entorno. La predicción HTTP completa y las consultas necesitan resolverlo.
- Frontend Flutter con Dart `>=2.19.2 <3.0.0`. Hay URLs de API fijas, peticiones sin timeout explícito y componentes de entre 350 y 1.050 px de ancho fijo.
- En `lib/`, Firebase se importa para inicializar la aplicación. El alojamiento está configurado en `firebase.json`. Confirmar que no existe otra dependencia funcional antes de eliminarlo.
- El test de contador referencia `MyApp`, que no existe en el punto de entrada actual. Es un defecto detectado por inspección, todavía no ejecutado.
- Flutter pendiente de instalación: `storage.googleapis.com` devuelve 403 del proxy. El dominio está guardado en el borrador, pero no aplicado al runtime.
- `Legodark/ai-portfolio` existe y se puede leer mediante Git. Su API de GitHub devuelve Forbidden desde este entorno. No se ha creado ninguna issue.
- Las páginas oficiales de Vercel también están bloqueadas por el proxy; precios y cuotas vigentes NO están verificados.
- La comprobación de arquitectura midió unos 621 MiB residentes tras cargar modelos y un pico de aproximadamente 1 GiB. Un prototipo SQLite del catálogo completo ocupa unos 20 MiB y supera las comprobaciones parciales contra CSV. Ver medidas y alcance en el informe de arquitectura.
- Los diccionarios de la aplicación (542 entradas) no coinciden con los IDs del CSV de entrenamiento (719 modelos). La auditoría posterior deja un contrato y una traducción verificables, incluidos tres combustibles desplazados; aplicar ese contrato sin reentrenar antes de publicar predicciones.
- El usuario confirma DNS en Vercel. El conector Vercel no está expuesto en esta sesión; la cuenta, zona DNS y cuotas todavía no se han podido consultar.
- [Evaluación compacta completada](evaluacion-modelo.md): ambos modelos ocupan 22,63 MiB comprimidos, un 76 % menos; runtime independiente de unos 105 MiB sin dependencias ML. Coincidencia exacta en 13.500 predicciones y 1.367 mensajes. Sin integración ni prueba de Vercel todavía.

## 0. Comprobar arquitectura y registrar la línea base

1. Medir carga, memoria y latencia de los modelos existentes; comprobar los CSV y la viabilidad de servirlos como snapshot de solo lectura. Consultar las cuotas vigentes de los proveedores y el DNS sin modificarlo.
2. Flutter 3.7.x solo es necesario si se necesita ejecutar la referencia histórica para comparar comportamientos; su instalación deja de ser un requisito del nuevo frontend. Mantener intactos su código y lockfile. Registrar los fallos conocidos del original.
3. Conservar las instrucciones probadas del backend y actualizar las de arranque para reflejar React como objetivo. Cuando la arquitectura esté resuelta, fijar una versión Node LTS compatible con React/Vite y guardar instalación y arranque completos tras probarlos; no generar aún el proyecto React.
4. Inventariar configuración, secretos por nombre/presencia, servicios, licencias, datasets, notebooks, artefactos y CI. No imprimir valores ni introducir credenciales en Git.
5. Ejecutar la aplicación histórica donde sea viable; documentar qué falla por entorno y qué falla en el repositorio. Capturar pantallas de referencia y rendimiento de inferencia.

Salida: línea base y recursos medidos, arquitectura documentada y bloqueos identificados antes de implementar. Las funciones dependientes de datos seguirán pendientes de integración hasta la fase 3.

## 1. Preservación y estrategia de versiones

1. Verificar HEAD, tags remotos, historial y ausencia de secretos antes de publicar referencias nuevas. Si aparecen secretos, rotarlos y acordar la corrección del historial antes de difundirlo.
2. Crear un tag anotado propuesto `tfm-original-2023` apuntando al SHA original, nunca al commit de este plan. Publicarlo sin sobrescribir tags existentes; registrar SHA y checksum de modelos/diccionarios.
3. Mantener el tag histórico inmutable. Las actualizaciones no pueden estar a la vez dentro de ese tag y preservar el original.
4. La decisión posterior de migrar a React sustituye el mantenimiento de dos frontends: conservar Flutter original en el tag y mantener actualizados React y el backend compartido. No actualizar ni reescribir el tag histórico.
5. Crear la rama de modernización después de comprobar arquitectura; etiquetar posteriormente la nueva versión de producción y registrar su matriz de soporte. No publicar una versión con dependencias EOL.

Salida: original recuperable, ramas claramente identificadas y política de versiones sin ambigüedad.

## 2. Decidir alojamiento y presupuesto, con una prueba técnica

Arquitectura candidata: frontend estático React/TypeScript/Vite en un proyecto Vercel separado del portfolio, servido desde `paddock.juancerezo.com`; API Python inicialmente Flask en Vercel Functions solo si supera la prueba de viabilidad, o en un servicio de contenedores compatible; modelo en almacenamiento de objetos o incluido en la imagen; datos en una base gestionada o snapshot local de solo lectura si las consultas permiten sustituir MongoDB. Preferir `/api/*` bajo el mismo origen mediante proxy/rewrite si el proveedor lo permite y cumple timeouts/streaming; no hace falta añadir otro subdominio por defecto.

Restringir la evaluación de producción a Vercel sin coste adicional. No hay aún una demostración de que la API/modelo completo quepan en el plan gratuito. Los contenedores externos del informe anterior quedan como referencia técnica, fuera de la solución autorizada. No prometer disponibilidad ilimitada ni cambiar a un plan de pago.

### Investigación de Vercel

- Consultar documentación oficial y condiciones de Hobby vigentes: https://vercel.com/docs/vercel-blob/usage-and-pricing, https://vercel.com/docs/functions/limitations y https://vercel.com/docs/plans/hobby.
- Verificar elegibilidad del proyecto, almacenamiento incluido, transferencia, operaciones, tamaño por objeto, límites de descarga, cuotas compartidas de la cuenta, comportamiento al agotarse y posibilidad de evitar sobrecostes.
- Verificar límites específicos de Functions Python: bundle final con dependencias, RAM, CPU, duración, disco temporal, arranque en frío, región y concurrencia. No aplicar límites de Node a Python sin comprobarlos.
- Comparar modelo incluido en el despliegue frente a descarga y caché al arrancar. Un Blob público no es un servicio de inferencia y puede permitir descargar el modelo y consumir la cuota.
- Estimar escenarios con medidas reales: almacenamiento de una y varias versiones; descargas por instancia nueva; invocaciones por visita; transferencia; meses sin tráfico y picos. Incluir API y base de datos, no solo Blob.
- Probar en preview descarga verificada, carga de ambos modelos, memoria, petición representativa, arranque frío/caliente, concurrencia y reinicio sin caché. Evitar descargar el modelo en cada petición.
- Evaluar alternativas únicamente si los límites o el coste lo exigen; comparar cuotas y suspensión por inactividad con la misma carga.
- Aplicar el [presupuesto y criterios de coste cero](costes-y-diagramas.md). Probar primero Functions con modelo y snapshot empaquetados; Blob solo si las cuotas verificadas y el comportamiento al agotarse mantienen la factura en cero. Si no cabe, evaluar un modelo más compacto con regresión de precisión y recursos. Una variante estática con inferencia en navegador exige además validación móvil y acuerdo explícito sobre la nueva arquitectura.
- Priorizar el runtime compacto evaluado, sin dependencias ML de entrenamiento. Aplicar el contrato de IDs auditado y endurecer el formato antes de integrarlo. No reentrenar. Mantener la calidad de la tasación como una validación distinta de la equivalencia con predicciones históricas.

Salida: decisión de arquitectura escrita con cuotas fechadas, consumo compartido, coste adicional de 0 €, comportamiento al agotar cuota y una prueba funcional. El presupuesto cero es obligatorio; la viabilidad técnica todavía debe demostrarse.

## 3. Recuperar datos y modernizar el backend y los modelos

1. Determinar si existe MongoDB recuperable y si aporta datos que no estén en los CSV. Nunca depender de la antigua API desplegada para que la nueva aplicación funcione.
2. Preparar datos de demostración reproducibles a partir del dataset autorizado; verificar tipos, diccionarios, índices, compatibilidad de agregaciones y contenido que pueda identificar personas. Si se conserva MongoDB, usar credenciales de mínimo privilegio y conexión por variable segura, con timeouts y pool limitado.
3. Declarar versiones soportadas de Python, Flask y servidor de producción; fijar dependencias directas/transitivas y generar inventario de componentes. Con SQLite y el runtime compacto no se necesitan pymongo ni dependencias de ML en producción. Conservar el entorno histórico compatible aislado para leer/comparar los artefactos de confianza, no para entrenar.
4. No actualizar scikit-learn y dar por válidos los `.pkl`: la carga entre versiones no está garantizada. Usar los notebooks y datos únicamente para reconstruir la procedencia y el contrato. No ejecutar entrenamiento. Mantener el orden de las nueve features y los IDs originales auditados, con traducción explícita del selector antiguo.
5. Integrar el formato compacto que conserva los bosques y eliminar del runtime público las dependencias de ML de entrenamiento. Validar equivalencia, categorías desconocidas, límites y tokenizer por separado. No atribuir al modelo una precisión independiente que no se ha medido; no se recuperó la partición original.
6. Publicar artefactos versionados con SHA-256, metadatos de entrenamiento, fecha del dataset y runtime compatible. Cargar únicamente artefactos propios y verificados; `pickle`/`joblib` permiten ejecución de código al deserializar.
7. Mantener la reducción de recursos mediante conversión de formato sin cambiar árboles, umbrales ni hojas. Conservar el artefacto original. Podar, reentrenar o sustituir pesos queda fuera del alcance actual.
8. Añadir validación de parámetros, contrato JSON consistente, códigos HTTP correctos, límites de consulta, timeout, health/readiness y tratamiento de errores. Sustituir el servidor de desarrollo por un servidor de producción.

Salida: API y ambos modelos congelados funcionando con runtime compacto mantenido, datos recuperables y pruebas de regresión. Documentar la procedencia no recuperada; no declarar validada la precisión actual por coincidir con las predicciones históricas.

## 4. Revisión profunda de seguridad y correcciones

Entregable: informe por hallazgo con evidencia, severidad, impacto, corrección y prueba de cierre. Distinguir fallos confirmados de hipótesis y limitaciones de las herramientas.

- Revisar secretos en árbol e historial sin revelarlos; dependencias Python y React/TypeScript, avisos del proveedor, licencias y cadena de suministro. Revisar también licencias de los recursos heredados, fuentes, imágenes, datos y distribución del modelo; no trasladar Syncfusion automáticamente al nuevo frontend.
- Modelar amenazas: API pública, agotamiento de inferencia/cuotas, exposición de datos, abuso de consultas, manipulación de artefactos y dependencias externas.
- Validar tipo, rango, longitud y enumeraciones; limitar carga y resultados. Probar consultas adversas de forma controlada en local/preview, no en servicios ajenos o producción.
- Restringir CORS a orígenes necesarios y documentar que CORS no impide abuso directo. Aplicar rate limiting compatible con ejecución distribuida y protección frente a gasto involuntario.
- Auditar XSS/DOM, renderizado de respuestas, construcción/encoding de URLs, exposición de mensajes en URLs/logs, CSRF si se introducen sesiones, permisos de base de datos y manejo de excepciones.
- Diseñar CSP compatible con el frontend React, cabeceras de seguridad, HTTPS, permisos mínimos y caché. Verificar cabeceras en respuestas reales sin desactivar protecciones para hacer funcionar la app.
- Evitar trazas o secretos en respuestas/logs; aislar entornos; verificar integridad al descargar modelos; rotación y revocación de credenciales.
- Añadir CI de análisis, pruebas, build y auditoría. Cerrar críticos/altos antes de producción y registrar excepciones justificadas con fecha de revisión; no afirmar que un escáner equivale a una auditoría completa.

## 5. Migración de frontend y revisión UX/UI y usabilidad

1. Crear el frontend React + TypeScript + Vite después de la comprobación de arquitectura y del tag de preservación. Elegir versiones mantenidas, fijar Node LTS y lockfile, e implementar por recorridos con paridad funcional documentada. Conservar Flask mientras no haya una razón comprobada para cambiarlo.
2. El nuevo frontend no inicializará Firebase salvo que se descubra un uso funcional necesario. Parametrizar la URL de API por entorno, preferiblemente `/api`; ningún secreto en variables públicas `VITE_*` ni en el bundle web. Portar explícitamente la extracción de filtros del chatbot hoy implementada en Dart: el clasificador Python no reemplaza esa lógica.
3. Revisar recorrido completo: inicio, selección de coche, validación, predicción, interpretación de resultados, consultas y chatbot. Priorizar una tarea principal clara y mantener la identidad visual del TFM donde resulte útil.
4. Rediseñar tamaños rígidos con layouts adaptativos. Probar 360, 390, 768, 1.024 y 1.440 px, orientación y zoom. Tablas/gráficos con alternativa móvil; chatbot sin tapar formulario, resultados o teclado.
5. Accesibilidad con objetivo WCAG 2.2 AA: contraste, foco visible, teclado, lectores de pantalla, etiquetas, errores asociados al campo, áreas táctiles, zoom, movimiento reducido y alternativa textual a gráficos.
6. Añadir estados de carga, vacío, error y recuperación; evitar doble envío; timeouts y reintentos limitados. No convertir errores de API en una predicción cero aparentemente válida.
7. Explicar que es un TFM, la fecha de los datos y las limitaciones de una estimación histórica. No presentar un modelo de 2023 como una tasación actual sin validación de datos recientes.
8. Medir carga inicial, recursos, interacción y consumo en móvil; comprobar navegación, enlaces directos y metadatos sociales/SEO. Mantener Vite como SPA salvo necesidad comprobada de renderizado en servidor.
9. Crear pruebas útiles del nuevo frontend, integración API y pruebas de extremo a extremo; conservar el test histórico dentro de su versión de referencia sin presentarlo como validación de React. Revisar visualmente en Chrome y Firefox de escritorio y Chrome Android/Safari iOS, con dispositivos o emulación documentada y pruebas reales cuando estén disponibles.

Salida: informe antes/después, capturas, pruebas de los recorridos y registro de problemas pendientes; no declarar validado un navegador que no se haya probado.

## 6. Despliegue, dominio y operación

1. Preparar CI/CD y preview con servicios de prueba. Configuración reproducible de frontend, API, datos y artefactos; credenciales desde ajustes seguros del proveedor.
2. Elegir subdominio definitivo; propuesta `paddock.juancerezo.com`. DNS gestionado en Vercel según confirma el usuario; consultar la zona y cuenta/proyecto de hosting cuando el conector esté disponible. Usar exactamente los registros que indique el proveedor, sin tocar otros servicios de `juancerezo.com`.
3. Validar preview: predicción, clasificación, consultas, navegación móvil, cabeceras, CORS, TLS, caché, límites de abuso, logs y escenarios de caída de API/modelo/BD. Verificar arranque sin estado previo.
4. Comprobar que el frontend nunca incluye el modelo, datasets privados ni credenciales por error en el directorio público.
5. Publicar por una versión identificada en Git, verificar DNS/certificado y repetir smoke tests sobre el dominio real. Configurar alertas de disponibilidad, errores y consumo con un presupuesto explícito.
6. Definir rollback de frontend, API, modelo y esquema/datos. No usar como rollback público el original vulnerable o EOL; conservar una última versión segura compatible.

Salida: URL pública verificada, versión etiquetada, instrucciones operativas y recuperación probada.

## 7. Issue en ai-portfolio para otra sesión

Crear la issue solo al disponer de URL, release y material final. El usuario ha autorizado esta creación; no crear todavía una issue que afirme un despliegue inexistente.

Título propuesto: `Añadir Paddock, TFM de predicción de precios de coches, al portfolio`.

Incluir: URL verificada, repositorio y tag/release, descripción del problema, autoría compartida de Juan Cerezo Serrano y Oscar Pörtner Ostos, contribuciones de Juan comprobadas, stack final, arquitectura, capturas móvil/escritorio, resultados medidos y limitaciones temporales del dataset. No inventar métricas ni atribuir todo el proyecto a una sola persona.

Contexto comprobado del portfolio: contenido en `src/profile.js`, navegación por `/projects` y modos responsive. La sesión encargada deberá leer su `AGENTS.md`, respetar `safeExternalHref`, documentar el cambio y ejecutar `npm run validate` con la versión de Node requerida. Producción se despliega mediante integración GitHub/Vercel; no usar un despliegue CLI directo.

Criterios de aceptación de la issue: proyecto visible en móvil/escritorio y comando de proyectos, enlaces HTTPS válidos, atribución correcta, capturas optimizadas, texto fiel y validación del repositorio superada. La issue solicitará implementación desde otra sesión, sin lanzar agentes desde esta planificación.

Acceso actualizado: `api.github.com` está permitido y la CLI autenticada creó el [PR #6 de Paddock](https://github.com/Legodark/paddock/pull/6). Cuando llegue el momento de crear la issue del portfolio, comprobar el permiso específico de ese repositorio con la autenticación existente; no pedir un token por chat. La issue sigue pendiente de URL pública y release verificadas.

## Orden de ejecución y controles de avance

`Comprobación de arquitectura/coste/dominio y línea base → tag original → entorno del nuevo stack → datos/modelos/API → frontend React → cierre de auditorías → preview → subdominio/producción → issue del portfolio`.

Seguridad y accesibilidad comienzan en el diagnóstico y se verifican durante cada migración. Separar los PRs por objetivo: infraestructura/configuración, API/modelos, dependencias/frontend, UX y hardening final. Cada PR debe indicar pruebas ejecutadas, fallos y compatibilidad con artefactos/datos.

No avanzar a producción con entrenamiento/runtime incompatible, vulnerabilidades críticas/altas sin resolver, costes desconocidos, funciones principales rotas o configuración no recuperable. Las decisiones de proveedor y coste se toman con evidencia de la fase 2, antes de vincular DNS.

## Datos externos que pueden ser necesarios al ejecutar

- Acceso autorizado a proyecto de hosting y DNS; no se necesitan valores secretos en conversación.
- Recuperación de MongoDB únicamente si los CSV no cubren los datos necesarios.
- Verificación de límites/cuotas y de que no haya cobros adicionales; no hay autorización para contratar planes de pago.
- Acceso de escritura a GitHub para publicar tags/PRs y, al terminar, la issue.

No hace falta resolver estos puntos para revisar la candidata. No se han contratado servicios, modificado DNS ni creado issues. La rama de revisión y el tag original ya están publicados; la CI alojada ha pasado, sin desplegar la aplicación.
