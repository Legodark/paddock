# Preparación de la preview protegida

15-11-2026. Seguimiento: [#10](https://github.com/Legodark/paddock/issues/10); candidata: [PR #6](https://github.com/Legodark/paddock/pull/6). **Red aplicada, proyecto protegido y paquete verificado; aplicación todavía sin desplegar.** Pendientes: aprobación explícita del firewall y decisión sobre el destino obligatorio del primer despliegue.

## Configuración confirmada

| Campo | Valor comprobado |
| --- | --- |
| Cuenta y equipo | `legodark`, `legodarks-projects` |
| Plan | Hobby activo, sin trial declarado |
| Proyecto | [`paddock`](https://vercel.com/legodarks-projects/paddock), `prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk` |
| Protección | Vercel Authentication, `deploymentType: all` |
| Framework y salida | Other (`framework: null`), `public` |
| Recursos predeterminados | Fluid compute, región `iad1`, build básico |
| Integración Git | Ninguna; sin despliegues automáticos al hacer push |
| Despliegues de Paddock | Cero |
| Dominio automático reservado | `paddock-phi-hazel.vercel.app`, sin app desplegada |
| Dominio propio | Sin asociar `paddock.juancerezo.com` ni modificar su DNS |

La [petición de creación](../deploy/preview/project-create.json) se ejecutó en el equipo explícito y se verificó después mediante GET. Según las fuentes oficiales de [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) y [Deployment Protection](https://vercel.com/docs/deployment-protection), la autenticación de **todos** los despliegues está incluida en todos los planes. Mantiene la revisión privada mientras se decide el alcance público del catálogo (#17). No se activa Password Protection, Passport ni una prueba Pro.

El proyecto está separado del portfolio; las cuotas de equipo siguen compartidas. El margen mensual de CPU, memoria e invocaciones continúa sin certificar. **0 € adicionales es la restricción de configuración; no demuestra margen de cuota ni disponibilidad ilimitada.**

## Paquete comprobado

Fuente: commit `ad60e5b196a4091e72a94c3de99c2e99ecfb4a99`. Directorio fuera de Git: `/workspace/.paddock/preview-preparation-20261115/package`. Los assets congelados y SQLite ya están incluidos; no basta con desplegar directamente `deploy/vercel` desde Git.

- React compilado con Node 24.22.1/npm 11.9.0; Python 3.12.14 y requisitos con hashes.
- CLI 65.16.0 en **dry run**, sin subir archivos: Other, 20 archivos, **117.469.499 bytes de fuentes**.
- Constructor fijado `@vercel/python@32.0.0`, con los overrides auditados de `ci/vercel-tooling`: **121.114.042 bytes = 115,50 MiB** de función.
- `public/`: **292.855 bytes**, 88.650 bytes gzip, cinco archivos. Modelos y SQLite quedan fuera de esa salida pública.
- Prueba aislada `python -I -S` de la función: readiness, predicción de **20.155 €**, clasificación, 719 modelos, 50 provincias, diez resultados reales y rutas privadas con 404.
- **17 pruebas de API pasadas**, cero fallos, errores u omitidos. La política local de firewall también pasó su comprobación de forma y cobertura.

Los modelos no cambian; no hay scraping, entrenamiento, Blob, Redis, MongoDB ni almacenamiento adicional. La [evidencia saneada](evidence/preview/preparation.json) conserva inventario, hashes y resultados, sin credenciales.

Las [cuotas de subida](https://vercel.com/docs/limits#static-file-uploads) indican 100 MB en Hobby. Las fuentes sin comprimir superan esa cifra: se propone [`--archive=tgz`](https://vercel.com/docs/cli/deploy#archive). Un tar.gz local de los veinte archivos mide **30.121.547 bytes**; es una estimación de compresión, no el archivo real de subida de la CLI. La aceptación del upload/build sigue pendiente de prueba en Vercel.

## Acceso de red resuelto

El propietario publicó el permiso `*.vercel.app`. La nueva instancia confirmó la política aplicada y una conexión HTTPS a `paddock-phi-hazel.vercel.app` llegó a Vercel: **404 `DEPLOYMENT_NOT_FOUND`**. Es el resultado esperado para un proyecto sin despliegues y resuelve el rechazo previo del túnel (403). No es una prueba funcional de la app.

Se confirmó también Hobby activo, `ssoProtection: all`, ausencia de integración Git y los SHA-256 de los veinte archivos preparados. No se volvió a modificar o publicar el entorno. [Evidencia de plataforma y requisitos de la CLI](evidence/preview/platform-readiness.json).

## Requisitos concretos detectados en la CLI

La regla gratuita de 60/min/IP ya está **preparada como un único cambio de borrador remoto** para Paddock. La publicación sin confirmación devolvió `confirmation_required`: «Can't publish firewall changes for project paddock without approval». El efecto revisable es hacer efectivo ese único cambio de Paddock. No se han modificado las reglas de otros proyectos. La CLI exige aprobación humana y el digest de efectos; no se ha ejecutado el comando de confirmación ni usado una API alternativa para evitar esa aprobación.

La publicación de la app como Preview fue rechazada antes de crear un despliegue: **el primer despliegue de un proyecto debe tener destino Production**; las versiones posteriores pueden usar Preview. Además, `--skip-domain` solo se admite con Production. El comando propuesto anteriormente con `--environment preview --skip-domain` era incompatible y se corrige abajo.

La alternativa pendiente de decisión es crear el primer despliegue con `--prod --skip-domain`, manteniendo Vercel Authentication para todas las URLs. No se asociaría el dominio del usuario, no se fusionaría el PR y no se activaría acceso público. El nombre técnico del destino sería Production. **No se ha ejecutado esa alternativa.** Una consulta posterior confirmó cero despliegues y cero peticiones de smoke a la API.

## Publicación y prueba previstas

1. Red, cuenta, Hobby, proyecto, protección e inventario ya están comprobados. Revalidar los estados que puedan cambiar antes de publicar.
2. Tras la aprobación humana del efecto, publicar solo el borrador de Paddock y comprobar la regla activa. **La regla 60/min/IP todavía no está aplicada ni probada**. Detenerse ante cambios en el digest o requisitos de pago.
3. Si el propietario acepta el destino obligatorio del primer despliegue, ejecutar el siguiente comando, **todavía no ejecutado**:

   ```bash
   /workspace/.paddock/vercel-cli/node_modules/.bin/vercel deploy \
     /workspace/.paddock/preview-preparation-20261115/package \
     --project prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk \
     --scope legodarks-projects \
     --global-config /workspace/.paddock/vercel-cli-config \
     --prod --skip-domain --archive=tgz \
     --meta paddockSourceCommit=ad60e5b196a4091e72a94c3de99c2e99ecfb4a99 \
     --yes
   ```

4. Registrar ID, URL, target y build, indicando expresamente Production si se usa la alternativa anterior. Comprobar acceso anónimo protegido antes del smoke con acceso autorizado de Vercel. No guardar credenciales de automatización en informes ni URLs compartidas. Las versiones posteriores podrán usar `--environment preview`, sin `--skip-domain`.
5. Primer smoke: **máximo veinte peticiones de API**, concurrencia máxima dos, sin reintentos, `maxDuration: 10`. Cubrir health frío/caliente, predicción, clasificación/consulta, routing y archivos privados. Reservar parte del presupuesto para el recorrido web; la matriz completa de CI no se ejecuta contra Vercel.
6. Detenerse ante cuotas agotadas, 429/503 de plataforma, build fallido o requisito de pago. Registrar únicamente consumos observados; desconocido no significa cero.

Probar el umbral **60/min/IP y su recuperación** de #11 requiere un procedimiento posterior con presupuesto revisado: no cabe en veinte solicitudes permitidas. Aplicar una regla no acredita su enforcement ni la exclusión de invocaciones.

Si falla el despliegue, cancelar el build o retirar únicamente el ID de despliegue de Paddock y verificar su retirada. No borrar el proyecto ni modificar el portfolio. La release pública, el subdominio, la fusión del PR y la issue de AI-Portfolio permanecen en sus fases. La preview privada no cierra #11/#12/#17.
