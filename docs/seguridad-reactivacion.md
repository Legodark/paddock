# Revisión de seguridad de la reactivación

Fecha: 15-11-2026. Alcance: código histórico, nueva interfaz React, API candidata, contratos, dependencias instaladas y paquete local. No se han realizado ataques, pruebas de carga ni cambios sobre Vercel, el dominio o servicios de terceros.

## Resultado y límites

La candidata elimina del runtime Flask la deserialización pickle y las dependencias de ML/MongoDB. Sus modelos se leen como estructuras verificadas, SQLite es inmutable y las consultas están parametrizadas. La interfaz conserva mensajes como texto y no ejecuta HTML introducido por el usuario. Las comprobaciones locales de entradas, integridad, recuperación y aislamiento pasaron.

No se detectaron vulnerabilidades conocidas en npm, las siete dependencias de la API o los ocho paquetes del bundle oficial. Esto no certifica ausencia de fallos ni valida la plataforma: **antes de acceso público quedan abiertos el control global de abuso y su impacto en la cuota compartida, y las comprobaciones efectivas del despliegue**. El límite de diez segundos por función y los controles del navegador no constituyen un presupuesto global.

Actualización de CI del 15-11-2026: se amplió la auditoría al constructor JavaScript y aparecieron seis paquetes marcados en su árbol. Se corrigieron las dependencias de análisis con versiones explícitas; la auditoría del constructor también devuelve ahora cero avisos. La [CI reproducible](../ci/README.md) pasó en GitHub 144 pruebas y verifica modelos, presupuesto del paquete y política de firewall. El [PR #6](https://github.com/Legodark/paddock/pull/6) y el tag original están publicados; la regla de Vercel sigue sin aplicar. La [revisión posterior](revision-pr-y-hobby.md) amplía el barrido al historial y documenta las licencias y los pendientes del catálogo.

## Dependencias y versión histórica

| Objeto auditado | Resultado |
| --- | --- |
| Web, `npm audit` incluyendo desarrollo | Salida 0, cero vulnerabilidades conocidas |
| Herramientas del constructor JavaScript | Seis paquetes marcados inicialmente; cero tras las actualizaciones revisadas |
| Entorno API Python 3.12 | Siete paquetes, cero avisos y ninguno omitido |
| Bundle oficial, incluido `vercel-runtime` | Ocho paquetes, cero avisos y ninguno omitido |
| Entorno de reproducción Python 3.10 | 16 paquetes, cuatro registros de aviso que corresponden a **tres vulnerabilidades únicas** en dos paquetes |

La auditoría Python usó `pip-audit 2.10.1`, servicio PyPI, modo estricto y sin aplicar correcciones automáticas. No se mezclaron sus herramientas con las dependencias de producción. La auditoría histórica corresponde al entorno reconstruido, no a una instalación exacta de producción de 2023: el `requirements.txt` original no fija versiones.

- `dnspython 2.8.0`: `CVE-2026-114605` y `CVE-2026-128089`, relativas a consumo excesivo de CPU/memoria al procesar DNS o zonas maliciosas. Las versiones correctoras indicadas son 2.9.0 y 2.9.2. No se ha demostrado una ruta de explotación en este proyecto; MongoDB y esta dependencia se han eliminado de la candidata.
- `scikit-learn 1.2.1`: `CVE-2024-5206` / `PYSEC-2024-110` / `GHSA-jw8x-6495-233v`. El servicio devuelve dos registros para el mismo aviso, por lo que no se cuentan como dos vulnerabilidades distintas. Afecta a la conservación de tokens sensibles en `TfidfVectorizer.stop_words_`, corregida en 1.5.0. El chatbot usa `CountVectorizer`; no se ha demostrado esa exposición concreta. El runtime nuevo no contiene scikit-learn.

No se ha cambiado a ciegas la versión que reproduce los pickle originales: su compatibilidad y los hashes forman parte de la conservación del TFM. El tag histórico y `padook/` permanecen intactos; **no se consideran una versión mantenida apta para redeploy**. La versión que se mantiene para publicación es React más la API compacta. Los entornos de conversión/reproducción deben seguir aislados y no aceptar modelos o datos de terceros.

El cliente Flutter histórico declara Dart `>=2.19.2 <3.0.0`, `http ^0.13.5` y `firebase_core ^2.7.1`, entre otras versiones antiguas. Se inspeccionaron sus peticiones, parser y configuración; no se ejecutó un escáner de advisories de pub.dev ni se actualizaron sus dependencias o sus pruebas. El cliente React es la migración aprobada y el destino de mantenimiento. Tampoco se ha auditado la imagen base gestionada por Vercel.

## Hallazgos y tratamiento

La [pasada posterior con la metodología Cloudflare](evidence/security-audit-20261116/REPORT.md) completó 47 unidades de lectura de fuentes, dos áreas históricas fuera de alcance y cero candidatos supervivientes; dos críticos independientes y validadores pasados. No ejecutó código del objetivo o pruebas contra Vercel ni sustituye los límites de plataforma de SEC-01/SEC-08.

| ID | Hallazgo | Tratamiento / estado |
| --- | --- | --- |
| SEC-01 | Se puede invocar directamente una API pública y consumir la cuota compartida | **Verificado parcialmente en Preview**: 60 health permitidos y siguiente 429 por una misma IP/región, atribución a la regla, rechazo anterior a función según enrutamiento y recuperación posterior. Quedan variantes/destino del 308 en #11. La entrega estática positiva tiene evidencia previa del mismo despliegue; no simultaneidad con el bloqueo. [Evidencia](evidence/preview/firewall-recheck-20261116.json). No es un presupuesto agregado ni protección frente a abuso distribuido |
| SEC-02 | Dependencias históricas sin versiones fijadas y avisos en la reproducción | La candidata fija versiones, usa lockfile/hashes y elimina los paquetes afectados. El original queda archivado; no se publica |
| SEC-03 | Pickle puede ejecutar código al cargar un archivo no confiable | Eliminado de producción: lectores compactos con formato, límites, SHA-256 y artefactos congelados. Sin endpoint de subida ni descarga de modelos por mensaje |
| SEC-04 | Mensajes históricos enviados por GET y sin recuperación fiable | Corregido: clasificación por POST, timeout, errores explícitos, cancelación y conservación de entrada. El código no imprime mensajes |
| SEC-05 | Reglas ambiguas podían ignorar condiciones o consultar kilómetros usando el año | Corregido: normalización, IDs canónicos, filtros visibles y rechazo de condiciones no entendidas, conflictos y exclusiones |
| SEC-06 | Riesgo de publicar datos/modelos o configuración accidentalmente | `public/` contiene el build web y avisos de licencia; modelos/SQLite quedan en la función. Se excluyen `.env*`, `.git`, tests y cachés del preparador. Verificados inventario y rutas privadas en Preview. El robots de la primera publicación no existe en el paquete vigente; no asumir su presencia |
| SEC-07 | Semántica incorrecta de la lista de conversación | Corregida; axe pasa en estados inicial y de resultado en ambos perfiles de navegador |
| SEC-08 | Cabeceras, TLS, rutas y acceso a archivos no comprobados en la plataforma | **Verificado parcialmente en Preview autorizada**: TLS, cabeceras, aislamiento y entrega estática comprobados; después, 429 atribuido al firewall antes de función. Quedan variantes/destino del 308 en #11 y limitación de no haber probado estáticos simultáneamente al bloqueo |
| SEC-09 | Parsers antiguos en las dependencias del constructor JavaScript | **Corregido para el flujo Paddock**: js-yaml 4.3.2, minimatch 11.0.8, smol-toml 1.9.1 y Zod 4.6.7; auditoría npm, empaquetado oficial y prueba WSGI pasados. La compatibilidad se limita al manifiesto requirements.txt usado aquí |

## Superficies revisadas

**Entradas y SQL.** JSON con campos exactos, tipos y números finitos; se rechazan booleanos como números, categorías ajenas, pares marca/modelo incompatibles, filtros repetidos/desconocidos y rangos contradictorios. El cuerpo se limita a 16 KiB, el mensaje a 2.000 caracteres y la query string a 2.048 bytes. Las columnas, operadores y orden están definidos en código, los valores son parámetros y la salida se limita a diez registros. Pruebas de inyección, valores no finitos y límites pasaron. No se interpolan mensajes en SQL.

**XSS y navegador.** React renderiza etiquetas y mensajes como texto; no se usa `dangerouslySetInnerHTML`, `eval`, Markdown sin sanitizar ni URLs aportadas por el usuario. El test con markup confirma que no se crea una imagen ni se ejecuta el manejador. Los enlaces externos son HTTPS fijos con `noopener noreferrer`. La CSP restringe scripts y conexiones al mismo origen; no permite scripts inline ni `eval`. Solo admite estilos en atributos para el indicador de precio. No hubo infracciones CSP en los recorridos reales probados.

**Datos y modelos.** Los árboles compactos tienen límites de tamaño/estructura y validación de índices; el mensaje comprimido tiene un límite de descompresión. No se usa pickle, joblib, NumPy, scikit-learn, MongoDB ni descarga dinámica en producción. SHA-256 comprueba los artefactos antes de su uso. SQLite abre con `mode=ro`, `immutable=1` y `query_only`. La API expone características del coche y una provincia del catálogo, sin vendedor, contacto o dirección detallada. No se ha realizado una auditoría exhaustiva de datos personales en todos los CSV/cuadernos históricos.

**Rutas, errores y estado.** Se desactiva la ruta estática implícita de Flask. Las rutas a assets no existen en la API; el paquete público no contiene modelos, bases, CSV ni mapas de fuentes. Los errores no devuelven trazas o rutas internas, y los logs de la aplicación registran tipo de error sin el texto de entrada. No se han introducido cuentas, sesiones, operaciones de escritura o cookies propias; el CSRF de acciones autenticadas no aplica a las funciones actuales. CORS no está abierto, pero esto no impide llamadas directas de bots.

**Concurrencia y disponibilidad.** La carga de recursos usa exclusión mutua, los modelos son de lectura y cada consulta abre su conexión inmutable. El cliente impide envíos repetidos, aborta peticiones y no aplica resultados cancelados sobre una consulta posterior. Son controles funcionales y límites por petición, no un rate limiter distribuido. No se han ejecutado ataques volumétricos ni se ha certificado una capacidad mensual.

**Secretos.** El primer barrido acotado a fuentes queda como evidencia histórica. La revisión posterior usa Gitleaks 8.30.1 sobre 116 commits alcanzables y clasifica siete coincidencias: dos hashes de integridad y cinco entradas de configuración cliente Firebase archivada. Se documentan ubicación y clasificación sin valores; no se probaron las claves contra servicios externos ni se verificaron sus restricciones/actividad. El frontend nuevo no incorpora Firebase. Véanse el [alcance y los límites](revision-pr-y-hobby.md) antes de interpretar el resultado; no se afirma ausencia absoluta de secretos. No se leyeron ni copiaron las credenciales de la CLI Vercel.

## Evidencias y pasos de cierre

- [Auditoría API](evidence/security/api-dependencies.json), [bundle oficial](evidence/security/bundle-dependencies.json), [reproducción histórica](evidence/security/legacy-dependencies.json) y [descripción de los avisos](evidence/security/legacy-advisories.json).
- [Barrido acotado de fuentes](evidence/security/source-scan.json).
- [Pruebas de navegador/contrato](evidence/chatbot/verification.json) y [paquete público/función materializada](evidence/chatbot/package-smoke.json).
- [Resumen de CI](evidence/ci/summary.md), [auditoría inicial del constructor](evidence/ci/build-tools-audit-before.json) y [auditoría tras corregirlo](evidence/ci/build-tools-audit.json). Las auditorías de paquetes no analizan exhaustivamente todo el código compilado/vendorizado de los proveedores.

Comandos de reproducción, con la herramienta instalada fuera de la aplicación:

```bash
npm --prefix web audit
/workspace/.paddock/security-venv/bin/pip-audit --path /workspace/.paddock/vercel-venv/lib/python3.12/site-packages --strict --progress-spinner off
```

Para el bundle, usar `--path <funcion-materializada>/_vendor`. Para el original reconstruido, `--path /workspace/.paddock/venv/lib/python3.10/site-packages`; su salida 1 por los avisos es un resultado esperado y debe conservarse, no ocultarse como éxito.

La CI alojada ampliada pasó 239 pruebas: 135 de navegador en cinco perfiles de Chrome, Firefox y WebKit, además de las unitarias, API y guardas. La [revisión UX](ux-y-accesibilidad.md) documenta las correcciones y la adaptación temporal del analizador axe para el fallo de reflexión ARIA en Firefox 159, sin omitir reglas. Quedan Safari/iPhone y Android físicos, lectores de pantalla, zoom nativo y teclado móvil real; la orientación y ampliación instrumentadas no sustituyen esas pruebas.

El PR está abierto para revisión, sin fusionar. La [Preview privada](preview-vercel.md) ya existe; el dominio público permanece pendiente. SEC-01/SEC-08 conservan los límites indicados arriba, sin contratar extras ni alterar otros proyectos. La [revisión de licencias y coste compartido](revision-pr-y-hobby.md) recoge las condiciones abiertas antes de publicar. Las cifras anteriores de CI corresponden a sus revisiones históricas; la matriz posterior pasó 240 casos de navegador y 100 unitarias.
