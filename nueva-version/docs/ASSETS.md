# Recursos visuales

## Recibidos como archivos y leídos

- `manual-de-marca.html`: legible, con ocho imágenes WebP incrustadas.
- `mapavintage-etapa3-cuidados.html`: legible; conexiones, valores del formulario y contenidos revisados.
- `Mapa-Vintage-megaprompt-Codex.md`: leído completo; autoridad principal de la reconstrucción.

Los tres se conservan sin alterar en `assets/originales/`. Los archivos heredados de main permanecen en la raíz del checkout original y del checkout de revisión.

## Extraídos del manual

Los WebP se extrajeron sin redibujarlos y sin grandes fotografías base64 en el HTML nuevo. Ya estaban comprimidos; se conservaron los bytes de esas versiones. Las fotos usadas son recursos editoriales generales, sin atribuirlas a locales del directorio.

| Recurso | Tamaño aprox. | Uso |
|---|---:|---|
| `assets/ciudad/calle.webp` | 160 KB | Recorridos; calle porteña ilustrativa, no Corrientes del último mensaje |
| `assets/ciudad/perchero.webp` | 135 KB | Presentación del proyecto; foto editorial del manual |
| `assets/cuidados/botas.webp` | 27 KB | Recorte ilustrativo como acceso al cuidado de calzado |
| `assets/cuidados/campera.webp` | 25 KB | Conservado, no usado como denim: es otra prenda |
| `assets/ciudad/caminante.webp` | 13 KB | Conservado como recurso disponible |
| `assets/miscelaneas/polaroid.webp` | 34 KB | Conservado, no se presenta como aporte de usuario |
| `assets/miscelaneas/mapa.webp` | 39 KB | Conservado; no sustituye al mapa interactivo |
| `assets/miscelaneas/costura.webp` | 76 KB | Conservado como recurso disponible |

## Imágenes visibles en el chat, sin archivo binario accesible

Se pudieron inspeccionar visualmente en la conversación, pero no descargar ni integrar fielmente como archivos del proyecto. No se afirma que estén incorporadas.

- Logo elegido: MAPA / VINTAGE / BUENOS AIRES, sobre hueso y con margen amplio. **Pendiente de archivo descargable.** No se recreó con una fuente. El nombre tipográfico del encabezado es provisional, no el logo seleccionado.
- Foto de Corrientes y teatros, con ciclista.
- Cardigan rojo con flores; material desconocido.
- Foto de selección de ropa y perchas.
- Chaleco tejido a rayas, con firma/leyenda “DRAWING DIARY”; no se infiere su fibra.
- Vestido blanco con lunares rojos; no se identifica como plisado ni se adivina su composición.
- Campera oscura ilustrada; no se usa como tapado de lana.
- Camisa/campera azul ilustrada, identificada como referencia de denim en el megaprompt.
- Carpetas de archivo de colores: su idea compositiva se implementa en HTML/CSS para Glosario, sin insertar la referencia plana.

Cuando estén disponibles como archivos, guardar los originales y preparar copias web. No borrar firmas/créditos presentes. La sustitución debe conservar las indicaciones del anexo C; en particular, un cardigan no demuestra que sea lana o cashmere, ni el vestido de lunares corresponde a plisados.

## Otros recursos del anexo C no entregados como archivos

`image(20261017-143405).png` (dos entradas al formulario), `image(20261017-144929).png` (conjunto multicolor), `image(20261017-144936).png` (prendas tejidas, sin correspondencia de nombre comprobable con el chaleco del chat), `image(20261017-145145).png` (papeles de notas), `image(20261017-145425).png` (pegatinas), `image(20261017-145444).png` (afiches), `image(20261017-145604).png` (galletitas), `image(20261017-145617).png` (arquitectura), `image(20261017-145752).png` (colectivo 39), `image(20261017-150110).png` (clips y estrellas), `image(20261017-145831).png` (imagen negra: no utilizar sin identificar).

No hay imágenes adecuadas específicas para plisados, tapados, ropa interior o trajes de baño. Se mantienen accesos tipográficos y textos completos. Muestrario textil ilustrativo hecho con CSS, sin afirmar una composición material real.

## Dependencias y pequeños recursos

- Leaflet 1.9.4 local: `vendor/`, licencia incluida. Teselas de OpenStreetMap con atribución visible.
- Instrument Serif regular/italic y Jost 400/500/600 locales: `assets/fonts/`; licencias OFL incluidas. Familias alternativas del sistema si fallan.
- `etiqueta.svg`: pequeño favicon nuevo, no reemplaza al logo. Papeles, pestañas, arandela, abanico y movimientos se construyen con CSS.
- Paleta principal intacta. Los tonos auxiliares de papeles y muestras son mezclas ilustrativas de los colores del manual; no cambian la identidad principal. Terracota en enlaces pequeños se oscurece al grafito para lectura; foco `#7C3D2A`, texto secundario `#5D5B56` y filete `#C8C4BA` son tokens auxiliares.
