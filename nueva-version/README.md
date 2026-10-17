# Mapa Vintage · versión para revisar

Versión estática para revisión, con una copia privada alojada en Sites. El sitio anterior se conserva en la raíz del repositorio; esta versión vive en `nueva-version/`, en la rama local `reconstruccion-mapa-vintage`, creada desde `origin/main` (`bf88776e1badb362f0538c9290d7e1262df7c16b`). No se hizo push ni merge en el repositorio original, ni despliegue en Netlify. La copia de Sites usa su propio repositorio privado y conserva el mismo acceso de revisión.

## Abrir la versión

1. Descomprimí la entrega.
2. Abrí una terminal en la carpeta que contiene este README y `index.html`.
3. Ejecutá `python3 -m http.server 4173` (en Windows, `py -m http.server 4173`).
4. Abrí **http://localhost:4173**. Para terminar, Ctrl+C en la terminal.

No abras el HTML con doble clic: los módulos JavaScript necesitan un servidor HTTP. No hace falta instalar dependencias, compilar ni tener una cuenta. Mapa y locales requieren Internet.

Si más adelante aprobás publicarla como sitio estático, la carpeta a servir es esta misma. El archivo `netlify.toml` solo declara esa carpeta; no publica nada.

## Qué está implementado

- Lectura de la URL original de locales, normalización, filtros compartidos, mapa Leaflet y lista de seis fichas por página, selección vinculada, errores y reintento.
- Recorridos a partir de locales reales, estimaciones explícitas, quitar/cambiar paradas cuando hay alternativas, Google Maps, WhatsApp y enlace reconstruible.
- Cinco entradas de glosario y 13 cuidados íntegros. Muestrario con abanico, controles por teclado y lectura completa.
- Agenda, notas y muro: renderizado desde CSV, solo registros publicados, estados vacíos, lectura ampliada y plantillas. **Faltan sus tres URLs.**
- Dos entradas al formulario original. Mantiene endpoint, POST, iframe y los seis nombres de campo. Nunca afirma que se guardó una fila sin poder comprobarlo.
- Formulario integrado de hallazgos con foto y vista previa local; el receptor independiente necesita configuración. Navegación móvil, foco de diálogos, Escape y pausa de movimiento.

## Qué falta para completar los recursos

El logo elegido y las ocho imágenes más recientes se ven en el chat, pero no se expusieron como archivos descargables en este entorno. No se redibujó ni se simuló el logo. La marca tipográfica alternativa fue retirada; el encabezado muestra únicamente un enlace de navegación Inicio. El sitio usa fotografías y recortes extraídos del manual; no son las imágenes nuevas del chat.

Para terminar el logo: copiar el JPG original a `assets/logo/MAPA-7.jpg`, preparar un recorte fiel sin el margen exterior amplio y poner la ruta final en `logo` de `js/config.js`. El `<img>` del encabezado ya está implementado con proporciones conservadas y alternativa ante error. No inventar el arte ni sustituirlo con otra tipografía.

Ver [inventario de recursos](docs/ASSETS.md) para las imágenes disponibles y pendientes.

## Mantenimiento y revisión

- [Guía sencilla de mantenimiento](docs/MANTENIMIENTO.md).
- [Contrato de datos e integraciones](docs/DATOS.md).
- [Qué se probó y límites de la revisión](docs/VERIFICACION.md).
- [Registros a revisar editorialmente](docs/revision-editorial.csv).
- `plantillas/`: encabezados CSV, sin eventos, notas ni personas inventadas.
- `assets/originales/`: los tres documentos recibidos, conservados.

Los originales heredados de `main` también siguen en la raíz del checkout, fuera de esta carpeta.

## Pruebas

Con Node disponible, `npm test` ejecuta las 45 pruebas de lógica y del receptor independiente sin instalar paquetes. No hace envíos ni consultas a producción.

Las comprobaciones adicionales de Chromium están documentadas en `docs/VERIFICACION.md`. Su único envío de prueba se interceptó localmente; no llegó al Apps Script.

## Segunda pasada

La revisión de composición e interacciones se documenta en `docs/SEGUNDA-PASADA.md`. Para evaluar cartelera, collage y notas, abrí `demostracion.html`; está rotulada y mantiene los envíos desactivados. La página normal no muestra ejemplos. Después de editar `index.html`, regenerá la página separada con `node scripts/build-demo.mjs`.

## Revisión de participación

Ver `docs/TERCERA-PASADA.md` y `docs/RECEPCION-DE-HALLAZGOS.md`. El contacto es estático. Comunidad tiene campos integrados y recepción desactivada hasta configurar el servicio separado. No se incorporó el JPG del logo, que no está accesible como archivo.
