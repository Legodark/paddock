# Validación local del paquete candidato para Vercel

Fecha: 14-11-2026. Estado: paquete y API comprobados localmente; sin preview, proyecto nuevo ni cambios DNS en Vercel.

Actualización de preparación del 15-11-2026: ya se creó Paddock como proyecto vacío, con autenticación de todos los despliegues, y se comprobó de nuevo el paquete completo. La app continúa sin desplegar y el DNS del dominio sigue intacto. El [registro de preview](preview-vercel.md) conserva configuración, dry run, 17 pruebas de API y el permiso de red pendiente para `*.vercel.app`.

Actualización 15-11-2026: la [CI reproducible](../ci/README.md) confirma la generación desde los originales y el paquete con Python 3.12.14. La función final mide **121.114.042 bytes = 115,50 MiB**; la [evidencia actual](evidence/ci/package-check.json) comprueba predicción, chatbot, consultas y aislamiento. Los números de la primera tabla conservan la medición de la fase inicial.

## Resultado

Se ha preparado una API nueva y separada en [deploy/vercel](../deploy/vercel/README.md), usando los modelos congelados en formato compacto, el contrato de IDs auditado y el catálogo histórico SQLite. La API original y Flutter no se han modificado. No hay scraping ni reentrenamiento.

El tag anotado `tfm-original-2023` se creó **localmente** apuntando a `d43ea99461ab8d2457f4ccf8552822d34d6dfd52`. No se ha subido a GitHub; los archivos nuevos de esta sesión no forman parte de ese tag.

| Comprobación | Resultado |
| --- | --- |
| Constructor oficial | `@vercel/python@32.0.0` |
| Runtime generado | `python3.12`, handler WSGI oficial |
| Tamaño real sin comprimir | **121.111.227 bytes = 115,50 MiB** |
| Archivos en la función | 369 |
| Dependencias de ML/MongoDB en la función | Ninguna |
| `.pkl` o CSV en la función | Ninguno; se incluyen binario compacto y SQLite |
| Tests locales de API/formatos | **13 pasados**, sin fallos ni omitidos |
| Prueba HTTP real local | **40 predicciones** coincidentes, 20 seriales y 20 con cuatro trabajadores cliente |
| Comparables, filtros y clasificación HTTP | Comprobados contra datos/resultados de referencia |
| Primera readiness HTTP local | 1,466 s |
| Mediana HTTP serial local | 2,606 ms, 20 peticiones sobre un vehículo de referencia |
| RAM observada tras HTTP | Aproximadamente **126,1 MiB** |
| Función extraída del bundle | Importada con `python3 -S` y sus dependencias `_vendor`; endpoints básicos correctos |
| Datos | 179.502 coches, SQLite inmutable |

Las métricas HTTP corresponden al servidor Flask de desarrollo en esta máquina; no son rendimiento, memoria facturada o arranque frío real de Vercel. Las cuatro peticiones cliente concurrentes validan funcionamiento básico, no una prueba de carga o capacidad máxima. La comprobación del bundle usa WSGI local; no simula el enrutado ni el sistema de invocaciones completo del proveedor.

El código del builder instalado contiene un umbral técnico de empaquetado de 225 MiB para su estrategia ordinaria de bundle. El paquete quedó por debajo de ese umbral. Esto **no es una consulta del plan Hobby**, ni garantiza una cuota de memoria o de transferencia de la cuenta. Se inspeccionó la versión instalada del paquete oficial, no una tabla de precios vigente.

## Funciones incorporadas y límites

- Catálogo con 542 modelos del selector histórico, conservando IDs canónicos del CSV, y siete combustibles correctamente traducidos.
- Predicción completa con los mismos árboles originales y comparables reales del modelo seleccionado; no respuestas prefabricadas.
- Clasificación de mensajes con el bosque y vocabulario congelados.
- Consultas SQL parametrizadas con filtros acotados y hasta diez resultados.
- Verificación de hashes y formato antes de servir; detección de recursos ausentes/corruptos; SQLite de solo lectura; errores y cuerpos acotados; sin CORS abierto.
- El [primer recorrido React](frontend-react.md) permite predecir y consultar comparables reales; el preparador admite `--web-dist`. El [chatbot y su intérprete](chatbot-react.md) también están integrados y probados desde el 15-11-2026.
- La [revisión de seguridad local](seguridad-reactivacion.md) y los recorridos UX tienen evidencia. No hay todavía protección global/distribuida contra abuso ni comportamiento ante agotamiento de cuota comprobado en la cuenta; faltan también la cobertura manual y los navegadores indicados en el informe.

## Evidencia y reproducibilidad

- [Informe del builder](evidence/vercel/bundle-report.json).
- [Prueba HTTP local](evidence/vercel/http-smoke.json).
- [Prueba de la función materializada](evidence/vercel/materialized-bundle-smoke.json).
- [Preparador del paquete](../tools/prepare_vercel_package.py): verifica fuentes congeladas y genera una salida nueva con datos/manifest.
- [Invocador del constructor oficial](../tools/build_vercel_package.cjs): no despliega ni consulta una cuenta.
- [Tests de API y formato](../deploy/vercel/tests/test_api.py).
- [Contrato HTTP y comandos](../deploy/vercel/README.md).

Se ejercitó también el instalador completo sobre una segunda salida: creación del snapshot, instalación con hashes y los mismos 13 tests pasaron. La ruta más reciente queda guardada en `/workspace/.paddock/current-vercel-package`.

Los binarios, la SQLite, los entornos y las dependencias de herramientas quedan bajo `/workspace/.paddock`, fuera del checkout. No se han añadido binarios generados a Git ni alojado nada en Blob. Los archivos de evidencia en `docs/` son JSON pequeños, sin credenciales.

## Acceso a Vercel y presupuesto

Actualización posterior a la publicación del entorno: la CLI oficial 65.16.0 está autenticada como `legodark`, mediante el flujo de dispositivo completado por el usuario. Se confirmó en modo lectura el equipo `legodarks-projects`, su plan Hobby activo, el dominio `juancerezo.com` verificado y su asociación al portfolio. La sesión sigue sin exponer herramientas del conector; la CLI proporciona las consultas disponibles sin reutilizar la sesión del navegador del usuario. No se solicitaron tokens por chat.

El presupuesto permanece en **0 € adicionales**, con el único pago del dominio existente. No se han creado recursos de Vercel, cambiado de plan o modificado DNS.

El usuario ya publicó la configuración del entorno y autorizó continuar las comprobaciones. La red permite consultar la API y documentación oficial. No se han vuelto a aplicar los ajustes anteriores ni se ha publicado de nuevo el entorno al añadir React.

El [estudio de costes](costes-y-diagramas.md) recoge las cuotas oficiales y los consumos de transferencia/CDN proporcionados por el usuario. Las consultas gratuitas probadas no exponen el consumo mensual completo de CPU/memoria/invocaciones: una respuesta de facturación «sin suscripción» no demuestra consumo cero. Las consultas de métricas rechazaron el acceso por requerir Observability Plus; no se contrató ni se pedirá ese extra para seguir desarrollando.

Antes de publicar una preview real hace falta:

1. Mantener la cuenta Hobby y comprobar que no se activa ningún extra de pago; la autenticación y la red ya están resueltas.
2. Revisar consumo compartido y comportamiento al agotar cuotas antes de publicar, registrando los datos no disponibles sin interpretarlos como cero.
3. Verificar que el directorio generado completo llega a la función, que el rewrite mantiene las rutas y que los assets no se sirven como estáticos.
4. Medir la invocación real sin caché, concurrencia y consumo, y cerrar control de abuso y seguridad sin activar extras de pago.
5. Completar React, probar la aplicación y solo entonces asociar `paddock.juancerezo.com`; no tocar `juancerezo.com`, `www` ni registros ajenos.

No se puede afirmar todavía una capacidad mensual gratuita o facturación cero en la cuenta por haber construido una función localmente. La incertidumbre pendiente es de plataforma/cuenta y validación de producción; el empaquetado ya tiene evidencia funcional concreta.
