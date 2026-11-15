# Rama de revisión y CI en GitHub

La rama de trabajo es `codex/paddock-reactivacion`, basada en el original `d43ea99461ab8d2457f4ccf8552822d34d6dfd52`. Contiene la candidata React/API, los contratos y modelos reproducibles, las pruebas y la documentación. El código histórico en `padook/` y los datasets originales se conservan.

El tag anotado `tfm-original-2023` apunta exclusivamente al commit original. Su publicación no sustituye archivos ni cambia el destino de `main`.

La workflow comprueba tanto los pushes a esta rama como los pull requests. Esto permite ejecutar la CI alojada y revisar sus resultados antes de integrar cambios en `main`. La configuración mantiene permisos de lectura, carece de credenciales de Vercel y no ejecuta despliegues.

Los [143 tests y auditorías locales](evidence/ci/summary.md) son la línea base de la entrega. Los resultados alojados deben comprobarse en la [página de Actions de la rama](https://github.com/Legodark/paddock/actions?query=branch%3Acodex%2Fpaddock-reactivacion); una ejecución local correcta no implica que el job remoto ya haya pasado.

En esta fase no se publica la aplicación, no se aplica la regla de firewall, no se crea el proyecto Vercel ni se modifica el DNS. Las siguientes comprobaciones de plataforma siguen sujetas al presupuesto Hobby y a la autorización de publicación de una preview.
