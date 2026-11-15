# Rama de revisión y CI en GitHub

La rama de trabajo es `codex/paddock-reactivacion`, basada en el original `d43ea99461ab8d2457f4ccf8552822d34d6dfd52`. Contiene la candidata React/API, los contratos y modelos reproducibles, las pruebas y la documentación. El código histórico en `padook/` y los datasets originales se conservan.

El [tag anotado `tfm-original-2023`](https://github.com/Legodark/paddock/releases/tag/tfm-original-2023) está publicado y apunta exclusivamente al commit original. Su publicación no sustituye archivos ni cambia el destino de `main`.

La workflow comprueba tanto los pushes a esta rama como los pull requests. Esto permite ejecutar la CI alojada y revisar sus resultados antes de integrar cambios en `main`. La configuración mantiene permisos de lectura, carece de credenciales de Vercel y no ejecuta despliegues.

La [ejecución alojada 43703395035](https://github.com/Legodark/paddock/actions/runs/43703395035) pasó el 15 de noviembre de 2026 para el commit `72031fcfc44a0c3b18a6bcd7cd77ae6b4dee05db`, en 1 min 59 s. Pasaron **144 pruebas**: 80 unitarias, 17 de API, 40 de navegador y siete guardas de CI. Google Chrome 157.0.8103.50 ejecutó las pruebas de navegador con el sandbox solicitado por la configuración, sin casos omitidos ni inestables. No se ha probado aquí Firefox o Safari.

Las auditorías de la web y las herramientas de construcción devolvieron cero vulnerabilidades conocidas; las de Python evaluaron siete paquetes de API y ocho del bundle, sin avisos ni paquetes omitidos. Ambos modelos compactos reprodujeron sus SHA-256. El paquete materializado midió 121.114.042 bytes y la web pública, 290.036 bytes. La [evidencia alojada](evidence/github/ci-43703395035.json) conserva los resultados visibles del run; la [evidencia local anterior](evidence/ci/summary.md) sigue fechada y separada.

Las primeras ejecuciones alojadas fallaron y se corrigieron dos diferencias del runner: selección de un intérprete Python distinto al de la API y arranque del Chromium descargado. Ahora se conserva la ruta absoluta del Python fijado, se audita su directorio real de paquetes y se prefiere el Chrome instalado en el runner. Los diagnósticos de CI conservan los fallos del navegador y publican anotaciones con caracteres de control escapados.

El [pull request #6](https://github.com/Legodark/paddock/pull/6) está abierto para revisión contra `main`, tras completar la revisión técnica de #8 y el estudio de #9. La reutilización pública del catálogo sigue pendiente en #17. El acceso a `api.github.com` quedó habilitado tras la publicación del entorno; `gh` verificó la identidad y creó el PR sin solicitar credenciales adicionales. No se ha integrado la rama. Los resultados posteriores se consultan en el PR y en la [página de Actions de la rama](https://github.com/Legodark/paddock/actions?query=branch%3Acodex%2Fpaddock-reactivacion).

La ampliación de [UX y navegadores](ux-y-accesibilidad.md) pasó después 239 pruebas, con 27 casos por cada uno de los cinco perfiles. El [resumen completo](evidence/ux/browser-matrix-success.json) conserva todos los controles, versiones, auditorías y tamaños del paquete. Los tres [diagramas Archify](diagramas.md) pasaron sus gates originales y revisión visual (#13 cerrada). La #12 sigue abierta para lector de pantalla, dispositivos físicos, zoom nativo y smoke de plataforma. La conexión GitHub se comprobó con selección de todos los repositorios; el permiso de Projects sigue pendiente por separado en #16.

En esta fase no se publica la aplicación, no se aplica la regla de firewall, no se crea el proyecto Vercel ni se modifica el DNS. Las siguientes comprobaciones de plataforma siguen sujetas al presupuesto Hobby y a la autorización de publicación de una preview.
