# Entrega del subdominio Paddock

17-11-2026. **[Aplicación histórica completa publicada](https://paddock.juancerezo.com)**, conservando el portfolio y Hobby sin servicios adicionales de pago. [Resultado y evidencia final](entrega-publica-20261117.md). Los pasos siguientes conservan el protocolo de operación; el [contrato oficial consultado](evidence/preview/final-domain-protocol-20261117.json) precede a la comprobación efectiva de aliases descrita abajo.

## Fuente y respaldo

La [baseline protegida](evidence/preview/guarded-production-baseline-20261117.json) `dpl_Gbw7hDo9r6u71J8Cz1K1rFQ6auLt`, fuente `ecf9177`, contiene el límite explícito de rutas y pasó diez comprobaciones. La candidata publicada `dpl_5G9aPw9k49MnFN79VAPsVbKz1S1y` tiene ID distinto y conserva modelos/datos, interfaz y política. La baseline tiene historial de alias Production y queda como respaldo mantenido, sin repetir el rollback en esta fase. No reutilizar automáticamente la Production antigua anterior a este endurecimiento.

El PR #6 se integró con su SHA y CI final verificados, conservando la historia y `tfm-original-2023`. La fuente `9a38be8848cbf601988614b01381758c99ae86f6`, tag `v2026.11.17`, pasó también su CI en `main`. La candidata Production se construyó desde esa referencia, en el proyecto Paddock, con Git automático desconectado y autenticación `all` durante preparación. Los metadatos de source se acompañan de hashes de paquete, no se toman solos como prueba de bytes desplegados.

## Asociación y protección

1. Leer dominios/configuración actuales, confirmar Hobby y proyecto correctos, destino activo y baseline. Comprobar qué otros custom Production se abrirían; para esta entrega solo se permite el subdominio solicitado.
2. Consultar `/v6/domains/paddock.juancerezo.com/config` con `projectIdOrName` y `teamId`. El parámetro anterior `projectId` no era el contrato documentado y podía devolver una recomendación genérica.
3. Si falta, asociar únicamente ese nombre con `POST /v10/projects/{id}/domains`, body `{"name":"paddock.juancerezo.com"}`. Sin force, compra, traslado, wildcard o cambios del apex/nameservers. Si ya pertenece al proyecto, leer y continuar, sin borrarlo/recrearlo. Un conflicto real con otro proyecto no se fuerza.
4. Exigir propiedad verificada y destino Production sin branch/entorno custom/redirect. Si hace falta, cumplir la verificación indicada y usar `/v9/projects/{id}/domains/{name}/verify`. Aplicar solo DNS recomendado para ese subdominio cuando sea necesario; conservar el portfolio.
5. Mantener `all` hasta comprobar configuración DNS coherente, HTTPS válido y raíz anónima protegida. La verificación de propiedad por sí sola no certifica TLS o aplicación correcta.
6. Al activar, actualizar únicamente `ssoProtection` mediante PATCH de proyecto a `{"deploymentType":"all_except_custom_domains"}`. Es Standard actual, incluida en Hobby; no desactivar Authentication con null ni usar el valor legacy. Leer de nuevo el estado. Distinguir URLs únicas de deployment y aliases canónicos de Production: las primeras deben seguir protegidas; el custom Production solicitado será público y Standard puede dejar público también el alias canónico `*.vercel.app`. En esta entrega el alias `paddock-phi-hazel.vercel.app` devolvió 200 con el mismo HTML/hash y destino que el subdominio; las tres URLs únicas ensayadas devolvieron 302 de autenticación.

## Presupuesto de verificación de esta entrega

Techo propio de **18 HTTP**, con **16 realizadas**, independiente de los ensayos anteriores ya cerrados. Concurrencia uno, sin ráfagas o reintentos de API; sin seguir redirecciones automáticamente. Incluye:

- Dos HEAD del portfolio, antes/después, sin modificarlo.
- Hasta tres HEAD de preparación del subdominio privado para comprobar propagación/TLS y 302 de autenticación; solo esta comprobación de disponibilidad puede esperar y repetirse dentro de su techo.
- Siete solicitudes públicas: HTML, JavaScript, CSS, health, predicción de referencia, clasificación y búsqueda limitada. Comprobar hashes/cabeceras y resultados históricos 20.155 €/contexto 1/una fila.
- Dos alias críticos públicos rechazados fuera de la función: entrada directa y prefijo codificado. Correlacionar logs; 404 solo no basta.
- Cuatro raíces Vercel anónimas: alias canónico Production, URL única de candidata, Preview y baseline. El alias canónico se acepta público solo con HTML/hash y destino correctos; las tres URLs únicas deben continuar protegidas. No seguir ni publicar nonces de autenticación.

Si falla una postcondición, cerrar exposición restableciendo `all` y registrar el estado. Recuperar el destino mantenido cuando el problema sea del despliegue; un rollback no arregla cuotas agotadas. No contratar nada para forzar continuidad.

## Registro final y portfolio

La [evidencia final](evidence/preview/public-release-20261117.json) registra commit/tag, CI, IDs y hashes, dominio/DNS/TLS, protección y solicitudes reales; no declarar que se midió todo el bundle, CPU/RAM o frío por observar algunas respuestas. Tras verificar la URL pública se publicaron la [release `v2026.11.17`](https://github.com/Legodark/paddock/releases/tag/v2026.11.17) y la [issue AI-Portfolio #61](https://github.com/Legodark/AI-Portfolio/issues/61), con stack, autoría compartida, alcance histórico y capturas locales fieles. La implementación queda para otra sesión; no se modificó ni desplegó el portfolio.

El presupuesto financiero es cero servicios adicionales dentro de Hobby. El saldo mensual compartido sigue sin medir y agotar compute puede pausar también el portfolio; no se promete disponibilidad ilimitada. El catálogo completo fue elegido por el propietario, sin atribuir permisos/licencias de terceros no acreditados. La confirmación física cubre medidor y chat con teclado abierto en iPhone, no conformidad completa de accesibilidad.

La instantánea de evidencia se capturó tras verificar la aplicación y antes de publicar la release de GitHub; su campo `release_published: false` describe ese instante y no se reescribe retrospectivamente. Los enlaces finales están en el [registro de entrega](entrega-publica-20261117.md).
