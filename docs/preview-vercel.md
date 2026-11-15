# Preparación de la preview protegida

15-11-2026. Seguimiento: [#10](https://github.com/Legodark/paddock/issues/10); candidata: [PR #6](https://github.com/Legodark/paddock/pull/6). **Proyecto creado y paquete verificado; aplicación todavía sin desplegar.**

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

## Bloqueo de red

La API `api.vercel.com` funciona. Una conexión HTTPS a `paddock-phi-hazel.vercel.app` fue rechazada por el túnel de salida con **403 Forbidden**, antes de llegar a Vercel. No demuestra nada sobre routing o cabeceras de la aplicación.

Se guardó un cambio nuevo en el borrador del entorno: añadir **`*.vercel.app`** a los siete dominios ya permitidos, manteniendo el resto de la configuración. Cubre las URLs generadas para cada preview; no concede permisos de cuenta ni modifica DNS. **El borrador no se ha publicado y ese acceso no se ha aplicado a esta máquina.** El propietario debe revisar/guardar el cambio y publicar el entorno. Después se comprobará el acceso en la nueva instancia.

La app no se despliega hasta poder verificarla desde la sesión. El proyecto protegido y el paquete quedan preparados para continuar después de aplicar la red.

## Publicación y prueba previstas

1. Confirmar en la nueva instancia la red, la cuenta, Hobby, el proyecto y `ssoProtection: all`.
2. Revisar y aplicar solo en Paddock la [regla gratuita propuesta](proteccion-vercel.md). Estado remoto actual: firewall sin configurar, mitigaciones de sistema activas; **la regla 60/min/IP no está aplicada ni probada**. Detenerse si aparece un requisito de pago.
3. Ejecutar el siguiente comando, **todavía no ejecutado**:

   ```bash
   /workspace/.paddock/vercel-cli/node_modules/.bin/vercel deploy \
     /workspace/.paddock/preview-preparation-20261115/package \
     --project prj_j0CAZebO2M3BsMtBR41PPbYJo8Rk \
     --scope legodarks-projects \
     --global-config /workspace/.paddock/vercel-cli-config \
     --environment preview --skip-domain --archive=tgz \
     --meta paddockSourceCommit=ad60e5b196a4091e72a94c3de99c2e99ecfb4a99 \
     --yes
   ```

4. Registrar ID, URL, target y build. Comprobar acceso anónimo protegido antes del smoke con acceso autorizado de Vercel. No guardar credenciales de automatización en informes ni URLs compartidas.
5. Primer smoke: **máximo veinte peticiones de API**, concurrencia máxima dos, sin reintentos, `maxDuration: 10`. Cubrir health frío/caliente, predicción, clasificación/consulta, routing y archivos privados. Reservar parte del presupuesto para el recorrido web; la matriz completa de CI no se ejecuta contra Vercel.
6. Detenerse ante cuotas agotadas, 429/503 de plataforma, build fallido o requisito de pago. Registrar únicamente consumos observados; desconocido no significa cero.

Probar el umbral **60/min/IP y su recuperación** de #11 requiere un procedimiento posterior con presupuesto revisado: no cabe en veinte solicitudes permitidas. Aplicar una regla no acredita su enforcement ni la exclusión de invocaciones.

Si falla el despliegue, cancelar el build o retirar únicamente el ID de despliegue de Paddock y verificar su retirada. No borrar el proyecto ni modificar el portfolio. La release pública, el subdominio, la fusión del PR y la issue de AI-Portfolio permanecen en sus fases. La preview privada no cierra #11/#12/#17.
