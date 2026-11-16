# Uso de security-audit de Cloudflare en Paddock

Evaluación de integración, 16-11-2026. [Repositorio oficial](https://github.com/cloudflare/security-audit-skill), licencia MIT. Revisión fijada: [`c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8). Se leyeron README y [SKILL.md de esa revisión](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md).

**Auditoría de fuentes completada posteriormente por petición del propietario:** perfil `standard` con alcance definido, 47 unidades revisadas y dos históricas fuera de alcance; cero candidatos supervivientes, dos críticos de cobertura independientes y ambos validadores pasados. Fuente `5e8091b6fb8a88ec4c4550b9356dd7026d44b42e`, sin cambios en los archivos revisados. [Informe y límites](evidence/security-audit-20261116/REPORT.md) · [ledger](evidence/security-audit-20261116/coverage-ledger.json) · [validación](evidence/security-audit-20261116/validation.json).

**Encaja con Paddock.** Es una metodología para agentes y validadores JSON sin dependencias, no un escáner alojado o un servicio que requiera una cuenta de Cloudflare. No exige cambiar Vercel, añadir servicios de pago o enviar el modelo/dataset a un servicio de auditoría. Codex dispone de delegación a agentes y Node.js para sus validadores.

## Evaluación inicial en modo de orientación

Se aplica el **modo de orientación** que el propio skill prescribe para preguntas de seguridad o evaluación de metodología. La pregunta de si podemos usarlo no se presenta como una auditoría completa ya ejecutada. No se ha instalado un paquete npm, modificado la configuración global ni iniciado automáticamente sus seis fases o artefactos de auditoría.

La comprobación del firewall existente fue una tarea separada, autorizada previamente por el propietario. No se convierte retroactivamente en una prueba realizada por este skill, cuyo flujo de auditoría trabaja sobre fuentes y reproducciones locales aisladas, no contra infraestructura compartida.

## Alcance de la auditoría de fuentes

- `web/`: renderizado de respuestas, construcción de URLs, DOM, estados y consumo de API. El chatbot usa clasificación congelada y filtros; no atribuirle superficies de un LLM generativo que no existe aquí.
- `deploy/vercel/`: validación de entradas, SQL, lectura de artefactos, aislamiento del catálogo/modelos, errores y configuración serverless.
- `tools/`, `ci/` y `.github/workflows/`: preparación del paquete, integridad de artefactos, dependencias, permisos de automatización y entrega.
- Reconciliar los hallazgos SEC-01–SEC-09 y las evidencias anteriores contra el código actual. No declarar cubiertas unidades solo por existir una revisión previa.
- El Flutter archivado y el entrenamiento histórico quedan como contexto; el alcance de mantenimiento sigue siendo React y la API candidata, sin reentrenar ni alterar el tag original.

Los compañeros más relevantes son CLIENT-SIDE, CLOUD-AND-DEPLOYMENT, SUPPLY-CHAIN-AND-RELEASE y RESOURCE-EXHAUSTION-AND-AVAILABILITY. Las cuotas y el comportamiento del proveedor ajenos al código conservan su evidencia específica y sus límites; no se infieren desde el análisis estático.

## Flujo aplicado

1. Registrar revisión, alcance y presupuesto; crear una salida nueva fuera del repositorio y un ledger de cobertura.
2. Reconocimiento y búsqueda mediante agentes con directorios separados; el coordinador es el único escritor de informes compartidos.
3. Someter cada candidato a un verificador independiente que intente refutarlo.
4. Validar `findings.json` y el ledger con los scripts oficiales; distinguir `confirmed`, `needs_validation` y `rejected`.
5. Verificar los registros finales con agentes nuevos y derivar los informes de esos registros, sin elevar dudas a vulnerabilidades confirmadas.
6. Finalizar los auxiliares y cualquier proceso de prueba al entregar su tarea.

Se completó una pasada de este flujo con 13 invocaciones de agentes (cuatro reconocimientos, cinco búsquedas, dos turnos administrativos de materialización y dos críticos distintos). No hubo candidatos supervivientes: los conjuntos de validación y verificación por hallazgo estuvieron vacíos. Todos los checks fueron de fuentes, sin ejecución del objetivo, pruebas dinámicas, red o proveedor dentro de la auditoría. No se inventaron reproducciones o vulnerabilidades para rellenar informes. No existía un ledger compatible anterior; las revisiones previas fueron contexto, no cobertura heredada. Esta pasada con alcance definido no certifica ausencia de vulnerabilidades ni la seguridad de producción.

## Aislamiento de ejecución

Están disponibles Node.js, `bwrap`, `unshare` y `prlimit`. Se comprobó con éxito que `bwrap --unshare-all` ejecuta un `/usr/bin/true` de confianza con entorno vacío y sin red externa. Esta prueba no ejecutó código de Paddock ni certifica por sí sola el perfil completo de auditoría.

Antes de ejecutar pruebas o reproducciones del objetivo se debe verificar el perfil completo exigido por el skill: código y herramientas de solo lectura; ninguna credencial, home, socket o servicio compartido expuesto; entorno permitido explícitamente; escritura solo en scratch asignado; límites de CPU, memoria, procesos, ficheros, disco y tiempo. Si algún control no se puede imponer, mantener el caso como `needs_validation` y continuar con lectura de fuentes. No ejecutar el objetivo con los permisos amplios de esta sesión como sustituto del aislamiento.

La revisión fijada puede leerse y utilizarse desde una copia externa al proyecto. Si se incorpora como skill reutilizable del repositorio, conservar todos sus compañeros, scripts, licencia MIT y procedencia de ese commit; no copiar únicamente SKILL.md ni ejecutar un instalador de `main` sin revisión.
