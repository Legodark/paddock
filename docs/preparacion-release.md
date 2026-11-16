# Preparación de la publicación y del rollback

16-11-2026. Seguimiento: [#14](https://github.com/Legodark/paddock/issues/14), candidata [PR #6](https://github.com/Legodark/paddock/pull/6). **Ensayo privado de Production/rollback completado: 22/22 comprobaciones.** Se restauró la candidata y se conservó la autenticación obligatoria. La entrega pública, integración, nueva release/tag y DNS siguen pendientes.

## Entradas verificadas y decisiones pendientes

| Área | Estado que debe acompañar la decisión de entrega |
| --- | --- |
| Código e historia | `tfm-original-2023` y `main` históricos preservados; candidata revisada en rama separada |
| Auditoría de fuentes #24 | [Completada sobre `5e8091b`](evidence/security-audit-20261116/REPORT.md): 47 unidades de fuentes, dos históricas fuera de alcance, cero candidatos supervivientes; dos críticos independientes y validadores pasados. Un cambio posterior de comportamiento necesita revalidar sus unidades |
| Plataforma #10 | Hobby activo; función Python 3.12, 2.048 MB asignados, timeout 10 s, región de función `iad1`. Consumo real de CPU/RAM, arranque frío y saldo mensual compartido aún desconocidos |
| Firewall #11 | Umbral canónico, 429 anterior a función según proveedor y recuperación posterior probados. Destino del 308 confirmado al health canónico; variantes bajo bloqueo pendientes |
| UX #12 | Automatización amplia y prueba inicial del propietario en iPhone. Confirmación del medidor y controles físicos pendientes según el recorrido manual |
| Catálogo #17 | Decisión pendiente entre el alcance de la demo pública y conservar la aplicación completa privada; no modificar fichas/chat silenciosamente |
| Coste | Cero servicios adicionales; no activar Pro, Observability Plus, Blob o base gestionada |

Los parámetros de memoria y timeout proceden del plano de control: no miden memoria usada o CPU facturada. La región CDN `cle1` observada durante pruebas tampoco identifica la región de función `iad1`. [Evidencia de plataforma y fuentes](evidence/preview/release-platform-review-20261116.json).

Está preparado el [inventario verificable de la candidata privada](evidence/preview/candidate-artifacts-20261116.json): 88 archivos seleccionados, 504.608 bytes públicos y hashes de los modelos, SQLite, manifiesto y código/configuración del paquete. Los hashes de los assets se contrastaron con su manifiesto; no se publican los binarios o filas del dataset. Ese inventario identifica la candidata completa actual; los IDs del ensayo privado se registran abajo. La release pública final sigue pendiente de la decisión de catálogo y de su referencia/build definitivos.

El panel gratuito **Usage** del equipo es una vía para leer el consumo mensual. En esta sesión el escritorio está habilitado pero no están expuestas las herramientas de control del navegador compartido ni de apertura de su visor; la consulta de Usage no se ha realizado. La CLI rechaza los datos de métricas con `payment_required` y billing no ofrece datos. No se interpreta esto como saldo completo ni se solicita contratar observabilidad.

## Separar entrega estática de bloqueo simultáneo

El control `/robots.txt` del ensayo devolvió 404 porque ese archivo no existe en el paquete vigente. No es una prueba positiva de entrega de un archivo existente.

Sí existe evidencia anterior de **seis recursos 200 en este mismo despliegue**, con hashes idénticos al build: HTML, JS, CSS, logo de marca, PNG de identidad y avisos de licencia. [Evidencia](evidence/ux/price-gauge-provider.json). Esto acredita entrega estática; no acredita que se repitiera mientras esa IP estaba limitada. La política y el compilador local excluyen estas rutas de Python. Conservar ambas afirmaciones separadas permite cerrar la comprobación de entrega sin fabricar simultaneidad ni repetir llamadas.

Las variantes 404/308 no demostraron acceso funcional fuera del límite. Tampoco demostraron todas la política desde una IP ya limitada. Resolver esa parte con un procedimiento revisado o una decisión explícita sobre la limitación residual; el destino del 308 ya se observó sin seguirlo. El ensayo de recuperación posterior tuvo su propio techo de 22 HTTP: la contabilidad conjunta conservadora queda en 121 frente a 127, seis sin consumir; no permite otra ráfaga.

## Secuencia de entrega

1. Registrar la decisión de catálogo y resolver las comprobaciones pendientes de seguridad/UX. Si cambia la salida de API o interfaz, implementar el cambio acordado, probar contratos y revalidar las unidades de auditoría afectadas antes de entregar.
2. Fijar el commit candidato final, verificar su CI y preparar el paquete con sus modelos/datos congelados. Registrar hashes SHA-256 del paquete público, manifiesto, modelos y SQLite, además de runtime y dependencias. Una compilación de CI no demuestra que se desplegó ese resultado.
3. El ensayo privado descrito abajo ya pasó manteniendo autenticación `all`, sin asociar `paddock.juancerezo.com`. Si cambia el alcance público o el código final, revisar la compatibilidad de sus destinos antes de reutilizarlos.
4. Tras ese ensayo, revisar el resultado, el presupuesto de smoke y las limitaciones de consumo. Preparar la integración de #6 y el nuevo tag/versionado conservando intacto el tag original. Los identificadores, hashes y referencia deben corresponder al código final, no a una Preview antigua por conveniencia.
5. Asociar **solo** `paddock.juancerezo.com` al proyecto Paddock siguiendo los registros que indique Vercel; preservar `juancerezo.com` y el portfolio. Revisar el efecto sobre autenticación y aliases como parte de la entrega pública concreta.
6. Verificar DNS, certificado, acceso y un smoke acotado de predicción, clasificación y búsqueda sobre el dominio. No usar toda la matriz de CI contra el proveedor. Registrar la URL/release reales y cómo retirar tráfico o volver a la baseline elegible.
7. Crear la issue de AI-Portfolio con URL pública, release, capturas y alcance histórico comprobados; #15 no sustituye esa issue en el otro repositorio.

Esta secuencia prepara una entrega revisable. No autoriza a resolver automáticamente las decisiones pendientes, ampliar tráfico de prueba, contratar servicios o abrir acceso público.

## Ensayo privado de producción y recuperación

La [documentación de promoción](https://vercel.com/docs/deployments/promote-preview-to-production) establece que promover una **Preview** genera una nueva compilación Production con las variables de ese entorno. Identificar su nuevo ID y esperar a `READY`; no presentar el ID o bytes de la Preview como resultado de producción inalterado.

La [documentación de Instant Rollback](https://vercel.com/docs/instant-rollback) establece dos condiciones relevantes:

- Hobby permite volver al despliegue anterior elegible.
- El destino debe haber tenido un alias de producción. Una Preview nunca promovida no basta.

Por tanto, preparar una **baseline mantenida y compatible** y una candidata como destinos de producción privada verificables. La primera Production defectuosa del diagnóstico inicial y el original archivado no son respaldos públicos válidos. Una baseline puede tener el mismo código mantenido que la candidata para ensayar el mecanismo sin reintroducir defectos; deben existir dos IDs y antecedentes de alias realmente elegibles, no solo dos carpetas locales.

La baseline debe respetar también el **alcance público del catálogo finalmente acordado**: si se elige no publicar fichas individuales, un rollback no puede reintroducirlas aunque esa versión funcione técnicamente. No usar la Preview completa actual como respaldo público sin comprobar esa condición.

Ensayo realizado: baseline privada verificada → candidata privada verificada → rollback a baseline → restauración de la candidata mantenida. Antes de cada transición se verificaron IDs, protección y dominios del proyecto. Se mantuvo autenticación obligatoria sin tocar el dominio del portfolio.

Consultar después la aplicación activa y registrar IDs, aliases, hashes, protección y resultado funcional mínimo. La restauración mediante promoción puede restablecer autoasignación de dominios: revisar ese efecto y conservar la integración Git automática desactivada si sigue siendo la decisión de Paddock. No asumir que rollback restaura nuevas variables o configuración externa; mantiene las condiciones del build de destino.

### Resultado observado · 16-11-2026

[Evidencia saneada del ensayo](evidence/preview/private-production-rehearsal-20261116.json). Dos builds Production READY del mismo código mantenido `2b8b760`, auditado en `5e8091b`; no se promovió la Preview ni se simuló una regresión entre versiones distintas.

| Destino | ID | URL privada |
| --- | --- | --- |
| Baseline A | `dpl_5oin9KLGrYBndgUijQS8Dr2ikM3R` | [Abrir A](https://paddock-2esuw26nz-legodarks-projects.vercel.app) |
| Candidata B, activa al finalizar | `dpl_GPrbbbEGDV1zXQ2ZTz5Y5sNQWJAp` | [Abrir B](https://paddock-l9io99hnr-legodarks-projects.vercel.app) |

Se verificó **B → A → B** por ID en el plano de control y consultando HTML/health a través de `paddock-phi-hazel.vercel.app` después de cada transición. El segundo alias, `paddock-legodarks-projects.vercel.app`, se comprobó anónimo en A y apuntando a B al finalizar mediante metadatos; no se consultó individualmente durante el rollback.

El techo propio fue de **dos builds y 22 HTTP**, cumplido: nueve casos en A, siete en B, tres tras rollback y tres tras restauración. Son diez solicitudes de API, seis estáticos autenticados y seis raíces anónimas; concurrencia uno, sin reintentos, ráfagas o redirecciones seguidas. Todos pasaron: predicción de referencia 20.155 €, clasificación contexto 1, consulta histórica y health; HTML/JS remotos coincidentes con el build. Los 88 hashes seleccionados del paquete local también se revalidaron. Esto no verifica criptográficamente cada byte del bundle Python remoto.

La protección `all` se conservó y las seis muestras anónimas devolvieron 302. Vercel [incluye autenticación de Production sin coste adicional en todos los planes](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan); el equipo siguió Hobby. No se habilitaron productos de pago. El rollback desactivó autoasignación y la restauración la reactivó, manteniendo Git desconectado y solo aliases `vercel.app`.

El ensayo no mide arranque frío, CPU/RAM usados ni margen mensual; sus tiempos HTTP no sustituyen esas métricas. Tampoco resuelve la decisión de catálogo: **estos destinos completos privados no sirven como respaldo público si se acuerda excluir fichas individuales**. La comprobación física del iPhone, variantes WAF desde IP limitada y entrega final siguen pendientes.

## Registro mínimo de release

Conservar: commit/tag, CI, source ref auditado y cambios revalidados, hashes, IDs de producción/baseline, historial de aliases elegibles, protección efectiva, DNS/HTTPS, solicitudes del smoke, resultado del rollback, consumo observado y datos que no se pudieron medir. La publicación no se declara completa por tener la web disponible en `vercel.app`.
