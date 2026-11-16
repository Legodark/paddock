# Protección de la API en Vercel Hobby

Comprobado el 15-11-2026. Tras la aprobación expresa del propietario, la regla incluida en Hobby se publicó **únicamente para Paddock** y la CLI confirmó su estado Enabled en la configuración live. **No se ha probado el umbral 60/min, la recuperación ni la exclusión de invocaciones**. El equipo sigue en Hobby y no se modificaron reglas del portfolio. Ver [estado y evidencia actual](preview-vercel.md).

## Opción gratuita verificada

La [documentación oficial de rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) incluye:

| Característica | Hobby |
| --- | --- |
| Reglas de rate limiting | Una por proyecto |
| Reglas personalizadas totales | Tres por proyecto; la de rate limiting ocupa una |
| Solicitudes permitidas incluidas | 1.000.000 |
| Algoritmo | Ventana fija |
| Claves admitidas | IP y JA4; se propone IP |
| Ventana | Entre 10 segundos y 10 minutos |

El [anuncio oficial](https://vercel.com/changelog/rate-limiting-now-available-on-hobby-with-higher-included-usage-on-pro) especifica que el primer millón de solicitudes permitidas **por mes** está incluido y que Hobby dispone de una regla gratuita por proyecto, hasta ese tramo. La [documentación de uso/precios](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing) indica que el tráfico mitigado por deny/challenge/rate limit no incurre en CDN Requests ni Fast Data Transfer; el tráfico que continúa hasta la aplicación sí cuenta normalmente.

**Coste incremental previsto: 0 €/mes dentro de Hobby y del tramo incluido.** La solución no requiere Redis, KV, Blob, Observability Plus ni un servicio externo de rate limiting. No se han activado funcionalidades de pago o un trial.

Esto no convierte el millón de solicitudes en un presupuesto global de CPU/memoria del equipo. Los contadores de rate limit son **por región**, y una IP que llegue a varias regiones puede superar el número configurado para una sola región. Un límite por IP tampoco impide un ataque distribuido.

## Regla propuesta

Definición: [security/vercel-firewall.json](../security/vercel-firewall.json).

- Equipo `legodarks-projects`, proyecto candidato `paddock`, alcance de **proyecto**.
- Condición de ruta: comienza por `/api`.
- Máximo: **60 solicitudes por ventana de 60 segundos e IP**, usando ventana fija.
- Respuesta al superar el límite: **HTTP 429** en el firewall.
- Protege predicción, clasificación, consultas, catálogos y health, además de la entrada directa `/api/index.py`.
- Los archivos estáticos, `/` y `robots.txt` quedan fuera del contador de esta regla.

Una carga normal usa dos consultas de catálogo; una predicción añade una petición y una búsqueda de chatbot añade clasificación y consulta. El límite inicial da margen a la demo personal, pero una IP compartida por varios usuarios puede necesitar ajustes basados en evidencia. Se ajustará sin superar lo permitido por Hobby ni activar extras de pago.

La web ya trata un 429, incluso si el firewall devuelve HTML, como un límite recuperable. No intenta interpretarlo como JSON de éxito o resultado vacío; conserva la consulta. Esto se verifica localmente y no demuestra que el firewall remoto esté activo.

## Preparación y comprobaciones locales

[inspect_firewall_policy.py](../tools/inspect_firewall_policy.py) valida el alcance y genera el comando de revisión sin ejecutarlo:

```bash
python3 tools/inspect_firewall_policy.py
```

La propuesta no puede convertirse en una regla de equipo ni seleccionar Token Bucket, que la documentación reserva a Enterprise. Los tests comprueban también que `/api/index.py` quede cubierto; una condición limitada solo a `/api/v1/` se rechaza. La CI marca esta comprobación explícitamente como **política local, no aplicada**.

El comando generado tiene equipo y proyecto explícitos. Se creó un único borrador para Paddock; tras mostrar el efecto y recibir aprobación humana, se confirmó el digest `4b47e12c6dc65729` y se publicó. La regla live es `rule_paddock_api_60_requests_per_minute_per_ip_LdESSE`. No volver a ejecutar la creación como si siguiese pendiente: ya existe. El script local sigue indicando `remote_applied: false` porque valida una declaración y no consulta la cuenta; la prueba de activación procede de la CLI y de la evidencia de plataforma. No se cambiaron reglas del portfolio o protecciones de equipo.

Evidencia: [regla y rutas](evidence/ci/firewall-policy.json), [consulta de cuenta de solo lectura](evidence/ci/account-check.json) y [fuentes/versiones](evidence/ci/sources.json).

## Cierre pendiente en la plataforma

Está preparado el [procedimiento acotado para la Preview](prueba-firewall-preview.md): máximo **66 solicitudes candidatas a API y una estática (67 HTTP)**, una sola ejecución, concurrencia uno y sin reintentos. Incluye umbral, cuatro variantes, estático y recuperación, con consultas gratuitas de logs/tráfico. No se ha ejecutado ni ampliado automáticamente el primer presupuesto agotado.

Con el proyecto y el borrador existentes, antes de abrir tráfico:

1. Confirmar Hobby y el tramo gratuito en el diálogo de precios de ese proyecto. Si pide contratar uso adicional o cambiar de plan, detener esa activación; no aceptarlo automáticamente.
2. La activación autorizada ya está realizada. Para cambios posteriores, volver a revisar sus efectos y usar la confirmación normal de la CLI; no eludirla mediante otra API.
3. En una preview controlada, comprobar peticiones permitidas, 429 por encima del umbral y recuperación al cambiar de ventana. Verificar también la entrada directa, rutas codificadas/normalizadas y que el bloqueo sucede antes de invocar la función.
4. Comprobar el efecto sobre el consumo y la cuota compartida. No usar el panel de las últimas 12 horas como sustituto del consumo mensual.
5. Documentar el comportamiento al agotar cuotas. La [documentación Hobby](https://vercel.com/docs/plans/hobby) advierte que, en la mayoría de los casos, al superar límites hay que esperar hasta 30 días para volver a usar la función. Las fuentes consultadas no concretan aquí el comportamiento específico de esta regla al agotar su millón incluido; no se ha probado ni se garantiza disponibilidad ilimitada.

El presupuesto sigue siendo cero euros adicionales y la continuidad del servicio queda sujeta a cuotas. La protección y las pruebas de plataforma siguen abiertas en SEC-01/SEC-08; la elegibilidad gratuita y la propuesta técnica ya tienen evidencia. No se solicitan más capturas ni un producto de observabilidad de pago para continuar.
