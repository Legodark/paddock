# Entrega del subdominio Paddock

17-11-2026. Objetivo solicitado: publicar la app histórica completa en `paddock.juancerezo.com`, conservando el portfolio y sin servicios adicionales de pago. [Contrato oficial actualizado](evidence/preview/final-domain-protocol-20261117.json).

## Fuente y respaldo

La [baseline protegida](evidence/preview/guarded-production-baseline-20261117.json) `dpl_Gbw7hDo9r6u71J8Cz1K1rFQ6auLt`, fuente `ecf9177`, contiene el límite explícito de rutas y pasó diez comprobaciones. Una candidata posterior debe tener ID distinto y los mismos modelos/datos, interfaz y política; al reemplazarla, esta baseline será el destino anterior elegible de Hobby. No reutilizar automáticamente la Production antigua anterior a este endurecimiento.

Integrar el PR con su SHA y CI final verificados, conservando la historia y `tfm-original-2023`. Fijar la fuente de `main` y su tag de reactivación; esperar también su CI. La candidata Production se construirá desde esa referencia, en el proyecto Paddock, con Git automático desconectado y autenticación `all` durante preparación. Los metadatos de source se acompañan de hashes de paquete, no se toman solos como prueba de bytes desplegados.

## Asociación y protección

1. Leer dominios/configuración actuales, confirmar Hobby y proyecto correctos, destino activo y baseline. Comprobar qué otros custom Production se abrirían; para esta entrega solo se permite el subdominio solicitado.
2. Consultar `/v6/domains/paddock.juancerezo.com/config` con `projectIdOrName` y `teamId`. El parámetro anterior `projectId` no era el contrato documentado y podía devolver una recomendación genérica.
3. Si falta, asociar únicamente ese nombre con `POST /v10/projects/{id}/domains`, body `{"name":"paddock.juancerezo.com"}`. Sin force, compra, traslado, wildcard o cambios del apex/nameservers. Si ya pertenece al proyecto, leer y continuar, sin borrarlo/recrearlo. Un conflicto real con otro proyecto no se fuerza.
4. Exigir propiedad verificada y destino Production sin branch/entorno custom/redirect. Si hace falta, cumplir la verificación indicada y usar `/v9/projects/{id}/domains/{name}/verify`. Aplicar solo DNS recomendado para ese subdominio cuando sea necesario; conservar el portfolio.
5. Mantener `all` hasta comprobar configuración DNS coherente, HTTPS válido y raíz anónima protegida. La verificación de propiedad por sí sola no certifica TLS o aplicación correcta.
6. Al activar, actualizar únicamente `ssoProtection` mediante PATCH de proyecto a `{"deploymentType":"all_except_custom_domains"}`. Es Standard actual, incluida en Hobby; no desactivar Authentication con null ni usar el valor legacy. Leer de nuevo el estado. Las URLs generadas de Vercel deben seguir protegidas; el custom Production solicitado será público.

## Presupuesto de verificación de esta entrega

Techo propio de **18 HTTP**, independiente de los ensayos anteriores ya cerrados. Concurrencia uno, sin ráfagas o reintentos de API; sin seguir redirecciones automáticamente. Incluye:

- Dos HEAD del portfolio, antes/después, sin modificarlo.
- Hasta tres HEAD de preparación del subdominio privado para comprobar propagación/TLS y 302 de autenticación; solo esta comprobación de disponibilidad puede esperar y repetirse dentro de su techo.
- Siete solicitudes públicas: HTML, JavaScript, CSS, health, predicción de referencia, clasificación y búsqueda limitada. Comprobar hashes/cabeceras y resultados históricos 20.155 €/contexto 1/una fila.
- Dos alias críticos públicos rechazados fuera de la función: entrada directa y prefijo codificado. Correlacionar logs; 404 solo no basta.
- Cuatro raíces Vercel anónimas: alias Production, URL única de candidata, Preview y baseline. Deben continuar protegidas; no seguir ni publicar nonces de autenticación.

Si falla una postcondición, cerrar exposición restableciendo `all` y registrar el estado. Recuperar el destino mantenido cuando el problema sea del despliegue; un rollback no arregla cuotas agotadas. No contratar nada para forzar continuidad.

## Registro final y portfolio

Registrar commit/tag, CI, IDs y hashes, dominio/DNS/TLS, protección y solicitudes reales; no declarar que se midió todo el bundle, CPU/RAM o frío por observar algunas respuestas. Publicar release y crear la issue de AI-Portfolio solo después de verificar la URL pública, con stack, autoría compartida, alcance histórico y capturas fieles. No modificar o desplegar el portfolio en esta sesión.

El presupuesto financiero es cero servicios adicionales dentro de Hobby. El saldo mensual compartido sigue sin medir y agotar compute puede pausar también el portfolio; no se promete disponibilidad ilimitada. El catálogo completo fue elegido por el propietario, sin atribuir permisos/licencias de terceros no acreditados. La confirmación física cubre medidor y chat con teclado abierto en iPhone, no conformidad completa de accesibilidad.
