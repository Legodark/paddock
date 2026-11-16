# Prueba acotada del firewall de la Preview

Preparada y ejecutada el 16-11-2026 para [#11](https://github.com/Legodark/paddock/issues/11), tras aprobar expresamente el propietario el presupuesto de 67 HTTP. **Resultado inconcluso:** 61 health devolvieron 200; Vercel los distribuyó entre dos IP de origen con 40 y 21 peticiones. Ninguna alcanzó 60/IP. El ejecutor se detuvo sin variantes, estático, recuperación o reintentos. [Evidencia saneada y 61 casos](evidence/preview/firewall-experiment-20261116.json).

Las instrucciones siguientes conservan el procedimiento aprobado. Una repetición requiere un presupuesto nuevo; no utilizar las seis peticiones sobrantes para otra ráfaga ni modificar la regla para obtener un resultado.

## Resultado observado

- Ráfaga: 15:17:02–15:17:15 UTC, 13,562 segundos incluyendo el arranque del cliente; 61 respuestas HTTP 200, región `cle1`.
- Las 61 respuestas coinciden uno a uno con los registros del proveedor por el sufijo único del identificador de solicitud: `wafAction: allow`, `pathType: streaming_func`, `cacheResult: MISS`, ruta `/api/index`. Todas alcanzaron la función; no hubo un 429 cuyo rechazo anterior a la función se pueda verificar.
- La consulta gratuita de tráfico, filtrada por host y User-Agent exclusivo del experimento, suma 61 solicitudes y dos IP distintas: **40 y 21**, ambas por debajo del umbral. Se publican solo estos recuentos; ninguna IP o hash.
- Regla y estado del firewall idénticos antes/después; Hobby activo, sin borradores, cambios de bypass, plan, aplicación o DNS. CPU/memoria y arranque frío siguen sin medir; los tiempos HTTP no los acreditan.
- #11 sigue abierta. No se deduce un fallo de la regla ni una exclusión de Preview: esta ejecución no ejercitó el límite por IP. No se ha repetido el experimento.

## Objetivo y alcance

Comprobar la regla existente, sin recrearla, publicarla otra vez o reducir su umbral:

- Proyecto `paddock` / `prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk`, equipo `legodarks-projects` / `team_tAZz33yNmdc18LwiG8xTDOzz`.
- Preview `https://paddock-jd7a8siqc-legodarks-projects.vercel.app`, despliegue `dpl_9PXY5N878VVNqdJBj2JD9kF5fVxw`.
- Regla `rule_paddock_api_60_requests_per_minute_per_ip_LdESSE`: prefijo `/api`, ventana fija de 60 segundos, límite de 60 solicitudes por IP y región, acción `rate_limit`.
- Autenticación obligatoria en todas las URLs. La CLI utiliza Protection Bypass for Automation. La documentación indica que también omite ciertas mitigaciones de sistema y controles de bots; no describirlo como un mecanismo exclusivamente de autenticación. No se añade una regla de bypass, IP de confianza o cabecera IP simulada. La aplicación efectiva de la regla personalizada debe observarse; el token no la demuestra. [Fuentes y fragmentos exactos](evidence/preview/firewall-sources-20261116.json).
- Cero nuevas predicciones, clasificaciones o búsquedas. El endpoint de la ráfaga es `GET /api/v1/health`. Sus respuestas permitidas sí pueden invocar la función y consumir cuotas.

La consulta real `firewall rules inspect` confirmó `active: true`, `valid: true`, `fixed_window`, `limit: 60`, `window: 60` y `keys: ["ip"]`. La consulta `firewall status` sitúa `custom-rules` antes de `deployment-routing`. Son configuración y orden publicados por el proveedor, no una prueba de ejecución del bloqueo.

## Presupuesto aprobado de esta ejecución

**Máximo: 66 solicitudes candidatas a API y una solicitud estática; 67 HTTP en total**, concurrencia uno, una sola ejecución y ningún reintento o seguimiento de redirecciones. Las consultas de metadatos/registros al plano de control no invocan la API de Paddock y se registran aparte.

| Fase | Máximo | Resultado que se busca |
| --- | ---: | --- |
| Ráfaga al health | 61 | Las primeras 60 permitidas; la 61.ª rechazada por la regla |
| Variantes, solo después de observar el rechazo | 4 | Cobertura de entrada directa y normalización, sin seguir redirecciones |
| Estático durante el bloqueo | 1 | `/robots.txt` continúa disponible con autenticación |
| Health tras expirar la ventana | 1 | Recuperación sin cambiar configuración |

La cifra limita el experimento, no establece un presupuesto de gasto o disponibilidad en Vercel. La cuenta permanece en Hobby y no se habilitan productos o funciones de pago. No se necesita Blob, una base de datos externa u Observability Plus.

Las variantes acotadas son `/api/index.py`, `/api//v1/health`, `/%61pi/v1/health` y `/api/v1/%68ealth`, siempre por `GET` y con `curl --path-as-is`. Son cuatro solicitudes totales, no cuatro ciclos. No equivalen a probar todos los posibles alias.

## Preparación sin tráfico de aplicación

1. Confirmar que no hay otra sesión automatizada usando la Preview. Solicitar una ventana breve sin pruebas manuales del propietario para no mezclar contadores. Las otras IP y regiones tienen contadores distintos; no asumir que el proxy de salida ofrece una IP exclusiva.
2. Consultar el plan, el estado de la Preview, la regla activa y los bypass de firewall en modo lectura, sin mostrar credenciales o direcciones IP. Si hay un bypass que alcanza al cliente de prueba, detener el procedimiento y documentarlo; no quitar protecciones o alterar reglas automáticamente.
3. Consultar los registros gratuitos y comprobar que siguen disponibles. Registrar la hora UTC del proveedor y del cliente. Si faltan registros, se podrá observar el HTTP, pero quedará pendiente demostrar la exclusión de invocaciones.
4. Esperar al menos 65 segundos sin solicitudes de esta IP a `/api`. Para no bloquear la conversación, dividir la espera en intervalos de hasta 60 segundos.
5. Elegir un identificador no secreto, por ejemplo `PaddockFirewallCheck/20261116-<horaUTC>`, como User-Agent de todo el experimento. Registrar las solicitudes mediante una lista fija, no un bucle abierto.

Ejemplos de consultas admitidas por Vercel CLI 65.16.0, con su perfil autenticado normal:

```bash
vercel firewall rules inspect rule_paddock_api_60_requests_per_minute_per_ip_LdESSE \
  --project prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk --scope legodarks-projects --json

vercel firewall traffic list \
  --project prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk --scope legodarks-projects \
  --since 1h --dimension action --dimension rule --dimension path --json

vercel logs requests \
  --project prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk --scope legodarks-projects \
  --deployment dpl_9PXY5N878VVNqdJBj2JD9kF5fVxw \
  --since 1h --query 'requestPath:/api*' --limit 100 --json
```

Las dos últimas consultas funcionaron en Hobby durante la preparación, sin contratación adicional. El esquema de registros de solicitudes observado contiene `requestId`, `requestPath`, `httpStatus`, `route`, `pathType`, `cacheResult`, `edgeNetworkRegion` y `wafAction`. Un registro existente de predicción permitida contenía `pathType: streaming_func` y `wafAction: allow`; no fue generado por este procedimiento. Los registros completos pueden contener datos de clientes: conservar solamente los campos necesarios y no publicar IP, identificadores de solicitud del proveedor, User-Agent ajeno, cookies o cursores de paginación. La correlación por identificadores se realiza en privado; el informe público utiliza números de caso y conserva el resultado de esa correspondencia.

El filtro `requestPath:/api*` del ejemplo sirve para explorar las rutas canónicas. **No utilizarlo como única fuente de evidencia del experimento**: excluiría potencialmente `/%61pi/...`. La consulta final abarcará todo el host/despliegue y su intervalo UTC; se seleccionarán localmente las solicitudes del experimento por sus identificadores y User-Agent. No interpretar una variante ausente de un filtro demasiado estrecho como ausencia de invocación.

## Ejecución tras revisar el presupuesto

### Una sola instancia de curl para la ráfaga

No ejecutar 61 procesos de `vercel curl`: el tiempo de inicialización y de consulta al plano de control puede repartirlos entre varias ventanas. El código distribuido de la CLI permite añadir varios `--url` de curl a una única invocación de `vercel curl`, manteniendo la cabecera de autenticación que gestiona internamente. Se inspeccionó `@vercel/cli-support/dist/chunks/chunk-YWP266LP.js`, versión 65.16.0: antepone `--url` al destino, añade `--header x-vercel-protection-bypass: …` y `--max-redirs 0`, y ejecuta `spawn("curl", flags, { shell: false })`.

La lista de argumentos se construirá en Python con `subprocess.Popen(..., shell=False)` y un arreglo de **61 URL idénticas** del mismo host: la primera procede del path de `vercel curl` y las otras 60 de pares `--url`. Añadir exactamente 61 pares `--output /dev/null` para no imprimir cuerpos. Comprobar previamente el host y el número de URL en el propio generador. No usar `--next`, que restablece opciones/cabeceras, ni añadir hosts externos.

Opciones de transporte: `--silent --show-error --path-as-is --retry 0 --max-time 5 --connect-timeout 3`, sin `--location`, `--parallel`, `--insecure`, `--trace` o `--verbose`. No extraer el secreto de configuración ni mostrar argumentos del proceso hijo que lo contengan. La autenticación nativa y el perfil ya utilizado en esta sesión bastan; no hace falta copiar un token al comando.

Emitir por solicitud, mediante `--write-out`, solo estado, duración, URL e identificadores no secretos necesarios: `x-vercel-id`, `x-vercel-error` y `Date`. No volcar todos los headers: pueden incluir cookies. El supervisor debe contar solicitudes terminadas, conservar el orden y detener el proceso al observar un 5xx, 401/403, una redirección de autenticación, un 429 anticipado o un error de transporte. Una solicitud en vuelo terminada por el supervisor sigue consumiendo una posición del presupuesto; no reemplazarla.

Empezar cerca del inicio de un minuto UTC ayuda a evitar el borde de una ventana, pero no demuestra por sí mismo el anclaje del contador. La ráfaga tendrá un plazo monotónico máximo de **40 segundos** y se abortará si no cabe. No alargarla ni repetirla para obtener el resultado deseado. Registrar el prefijo regional de `x-vercel-id` y contrastarlo con `edgeNetworkRegion`; un cambio regional o de IP vuelve inconclusa una afirmación de umbral único.

**Resultado exacto aceptable:** 60 health 200 y después un 429, sin tráfico previo conocido, con evidencia de una única región y una ventana compatible. Un 429 anterior demuestra mitigación observada, pero no acredita por sí solo el valor exacto de 60. Si las 61 pasan, si se cruza la ventana o si cambian regiones, el resultado es inconcluso: detenerse y preparar otro procedimiento, sin aumentar el presupuesto ni rebajar la protección.

### Variantes, estático y recuperación

Después del primer 429, enviar como máximo las cuatro variantes y el estático, de forma secuencial, manteniendo autenticación, User-Agent, transporte y capturas selectivas. Deben terminar dentro de la ventana bloqueada; si esta expira durante la fase, marcar los casos restantes como no ejecutados o inconclusos, sin volver a llenar el contador.

Para una ruta API canónica se espera 429 atribuido a la regla. Una ruta codificada puede recibir 404 o una redirección de normalización en lugar de coincidir con el prefijo. Un 404 no prueba enforcement de esa ruta: comprobar en registros que no abre un acceso funcional fuera del límite. No seguir un 3xx automáticamente; registrar su destino saneado y mantener pendiente cualquier variante que no pueda resolverse con evidencia. Un alias que alcance la función y devuelva 200 durante el bloqueo es un hallazgo, no un éxito.

Tras la última petición a API, esperar al menos 65 segundos y emitir **un único** health de recuperación. Se espera 200, con la misma regla/configuración y sin intervención manual en el firewall. Si falla, documentar y parar.

## Evidencia y criterio de cierre

Consultar después los registros de solicitudes y el tráfico del firewall, acotados por inicio/fin UTC, host y User-Agent del experimento; filtrar por la regla para atribuir la mitigación. Los agregados pueden llegar con retraso: se permite volver a consultar metadatos en modo lectura, nunca repetir solicitudes de aplicación para completar los gráficos.

Conservar estados y cronología del cliente, región y correspondencias del proveedor. Guardar los identificadores originales solo para correlación privada y publicar únicamente números de caso. Para acreditar rechazo antes de invocar la función, buscar registros de los **mismos** 429 con `wafAction` de mitigación y clasificación de ruta/servicio que excluya la función, además de la atribución a la regla activa y el orden firewall → routing. Contrastarlos con un health 200 que sí corresponda a la función.

La ausencia de líneas de `console.log` o de logs de runtime **no basta**: un health puede no emitir mensajes. Un gráfico agregado de `rate_limit` tampoco certifica por sí solo que ninguna función se invocó. Si el esquema gratuito no permite distinguirlo, dejar ese criterio abierto con su limitación exacta; no contratar observabilidad, añadir telemetría pública o certificar una propiedad no medida.

El informe deberá indicar solicitudes realmente enviadas frente al máximo, abortos, rutas pendientes, regla y configuración anteriores/posteriores, retrasos de ingesta y cualquier falta de granularidad. El umbral observado sigue siendo por IP y región; no se convierte en un control global contra abuso distribuido ni en un tope de consumo compartido con el portfolio. Las métricas mensuales de CPU/memoria y el arranque frío real de #10 son una verificación distinta.

## Siguiente ejecución preparada: pendiente de aprobación

Para continuar desde Cloud sin pedir al propietario que configure otra terminal, se propone un **nuevo máximo de 127 HTTP: hasta 121 health para la ráfaga, cuatro variantes, un estático y un health de recuperación**. Son 126 candidatas a API y un estático. No se ha autorizado ni ejecutado esta ampliación; las seis solicitudes no utilizadas antes no la financian ni se reasignan.

La cifra responde a las **dos IP observadas**, no a rebajar la regla: si siguen siendo solo dos dentro de la misma ventana/región, 121 solicitudes bastan para que alguna reciba al menos 61. No se garantiza que el proxy mantenga ese conjunto de IP; si cambia, el resultado puede seguir siendo inconcluso. No fijar direcciones, alterar cabeceras IP, eludir el proxy o cambiar la configuración del firewall.

Se mantienen concurrencia uno, cero reintentos, ventana limpia de 65 segundos y una única ejecución, con plazo máximo de 40 segundos para la ráfaga. Usar un marcador propio nuevo y una lista fija de 121 URL del mismo host. En esa fase, añadir **`--fail --fail-early`** a curl para terminar automáticamente al primer HTTP 429; registrar ese estado y el código de salida 22 como resultado esperado, sin continuar consumiendo el resto de la lista. Cualquier otro error HTTP/transporte detiene la prueba. Si las 121 respuestas son 200, detenerse sin variantes, recuperación o repetición.

Solo tras observar un 429, ejecutar las cuatro variantes y el estático si aún caben en la ventana bloqueada; después esperar 65 segundos y hacer un único health de recuperación. No interpretar el índice global del primer 429 como el umbral por IP: consultar el tráfico filtrado por marcador/host y verificar en privado los recuentos por IP y acción. Para acreditar el valor exacto se necesitan 60 permitidas y el rechazo posterior para una misma IP, región y ventana; si no se puede acreditar, registrar únicamente la mitigación observada.

Consultar hasta 200 registros gratuitos para no truncar la nueva ejecución. Correlacionar el sufijo de `x-vercel-id` con `requestId`, como se verificó en los 61 casos anteriores. Para un 429, contrastar acción WAF, regla y tipo de ruta con la petición permitida: la ausencia de mensajes de runtime no demuestra exclusión de invocaciones. Guardar IP e identificadores únicamente para correlación privada y publicar recuentos/casos saneados.

Este nuevo límite acota tráfico, no CPU/memoria ni continuidad del equipo. Sigue sin habilitar servicios de pago o modificar la protección de la Preview. Como alternativa, puede realizarse un procedimiento nuevo desde un equipo con salida estable, pero requeriría igualmente presupuesto revisado y evidencia de IP; no se ha trasladado ninguna ejecución al propietario.
