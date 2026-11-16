# Logos de fabricantes recuperados

16-11-2026. Implementación de [#18](https://github.com/Legodark/paddock/issues/18) en [PR #6](https://github.com/Legodark/paddock/pull/6); revisión conjunta en #12.

El selector de marca vuelve a mostrar el logo del fabricante y la tarjeta de resultado conserva el del vehículo enviado. Cambiar la marca en el formulario actualiza su imagen y limpia el modelo; el resultado anterior conserva su nombre e imagen hasta calcular otra estimación. Limpiar elimina la selección y rellenar el ejemplo recupera Citroën.

## Recursos y correspondencia

Los **70 IDs canónicos** de `feature-contract.json` tienen una correspondencia explícita en [brand-logos.ts](../web/src/brand-logos.ts). Se toman 70 de los 73 PNG archivados en `padook/Frontend/assets/images/marcas/`; se excluyen `lotis.png`, `lynk_&_co.png` y `vauxhall.png` como duplicados/recursos sin una categoría canónica independiente. Se usan `lotus.png` para Lotus y `lynkco.png` para Lynk & Co. Las excepciones de espacios, guiones y mayúsculas no alteran los IDs.

Los originales siguen intactos y sin diferencias respecto a `tfm-original-2023`. Las copias para web recortan el margen exterior uniforme, conservan la proporción y se codifican en WebP de hasta 96×96 px, calidad 80 y transparencia de calidad 100. Los 70 archivos pesan **157.644 bytes**, frente a **2.925.162 bytes** de sus fuentes: reducción del **94,61 %**. El mayor pesa 5.114 bytes. Los nombres incluyen un hash para identificar cada versión.

La [evidencia de recursos](evidence/ux/brand-assets.json) incluye ruta y SHA-256 de cada fuente/salida, dimensiones, versión del procesador y receta. Se registra la procedencia en `THIRD_PARTY_NOTICES.txt`; las licencias del software no se extienden a los derechos sobre las marcas. No se han descargado imágenes nuevas.

La generación es una operación de mantenimiento con ImageMagick 7:

```sh
python tools/prepare_brand_logos.py
npm --prefix web run check
```

Los derivados están incluidos en Git: instalar, construir, ejecutar CI o desplegar la aplicación no requiere ImageMagick ni bibliotecas adicionales.

## Carga, legibilidad y respaldo

No se descargan los 70 logos al abrir la aplicación: se solicita la imagen de la marca elegida, desde el mismo origen. Un espacio fijo y una superficie clara mantienen la legibilidad del dibujo y evitan movimientos del selector. El resultado usa una variante de mayor tamaño.

Se conserva el nombre textual del fabricante. Las imágenes son decorativas (`alt=""`, contenedor `aria-hidden`) para evitar anuncios duplicados; la etiqueta accesible del campo sigue siendo «Marca». El selector permanece nativo y funciona con teclado y lectores de pantalla. Ante una marca desconocida, un nombre que no coincide con el ID o una imagen fallida, aparece un icono genérico; no se asigna la imagen de otra marca. Cambiar de marca recupera la carga normal sin reintentos automáticos.

## Validación local

- **82 pruebas unitarias** y build TypeScript/Vite pasados. Las comprobaciones nuevas contrastan cobertura e IDs con el contrato congelado, hashes de fuentes/salidas, archivos distribuidos y presupuesto de imágenes.
- **60 casos de navegador Chromium** pasados entre escritorio y móvil: recorridos de estimación/chat, accesibilidad axe, teclado, texto ampliado y adaptación. Los casos nuevos cubren carga a demanda, cambio/reset/ejemplo, identidad del resultado anterior y respaldo ante fallo o marcas desconocidas.
- Decodificados los 70 recursos y revisada su composición visual. Sin desbordamiento horizontal en 320, 360, 390, 768, 1024 y 1440 px. Capturas de [escritorio](evidence/ux/brands-desktop.jpg) y [móvil](evidence/ux/brands-mobile.jpg); [evidencia local](evidence/ux/brands-local.json).
- Paquete completo: **495.019 bytes públicos**, **286.669 bytes gzip**, dentro de los presupuestos existentes de 1.000.000/300.000 bytes. Se reutiliza la función oficial ya materializada: backend, requisitos, modelos, SQLite y rutas coinciden byte a byte en los 16 archivos no públicos comparados; el smoke local del bundle sigue listo y devuelve 20.155 €.

Estas pruebas no acreditan dispositivos físicos, zoom nativo ni lector de pantalla real. No se modifica el modelo, no se vuelve a scrapear y no se añaden servicios de pago. La cabecera mantiene el DeLorean de la Preview anterior: su ajuste fino queda aplazado en #20. El siguiente punto de UX es el chatbot desplegable de #19.

## Preview verificada

[Abrir la revisión privada](https://paddock-ni6uimkps-legodarks-projects.vercel.app) con la cuenta de Vercel autorizada. Fuente `4f7b6543c0f301967262c25ee9f7a2a7862f14f0`, despliegue `dpl_9x9NRjfco3FiKRGYbMLGabsuSFaT`. Se verificaron siete recursos estáticos y sus cabeceras; todos coinciden con el paquete local. Acceso anónimo a raíz → 302. [Evidencia de entrega](evidence/ux/brands-provider.json). No hubo nuevas llamadas a la API de aplicación. Sin cambios de DNS o `main`.

La [CI del código desplegado](https://github.com/Legodark/paddock/actions/runs/43831661810) ha terminado en verde, incluidos el trabajo reproducible de web/API/modelos/paquete y los diagramas Archify. [Registro saneado](evidence/ux/brands-ci.json).
