# Mapa Vintage — Registro de sesión

Fecha: **27 de octubre de 2026, Buenos Aires**.

Este registro actualiza el estado documentado al 18/10 y deja constancia de qué partes de los documentos anteriores quedaron desactualizadas. Los documentos anteriores no se reescribieron: se conservan como historial. **Ante una contradicción, prevalece este registro y, después, `SESSION-LOG-2026-10-18.md`.**

## Dónde continuar

- Repositorio: https://github.com/ludemarsico/mapa-vintage
- Rama: **`reconstruccion-mapa-vintage`**. Carpeta del sitio: **`nueva-version/`**.
- Último commit antes de esta sesión: `d283fc8` (documentación del 18/10). Último cambio funcional previo: `ababeb2`.
- Se trabajó en un checkout local (`C:\CodigoMaris\mapa-vintage`). En esta sesión no se hizo push, merge, publicación en Netlify ni actualización de la revisión privada de Sites.

## Correcciones a la documentación anterior

| Documento | Dice | Estado real al 27/10 |
|---|---|---|
| `README.md`, `ASSETS.md`, `VERIFICACION.md`, `SEGUNDA-PASADA.md`, `TERCERA-PASADA.md` | El logo no está integrado; el encabezado muestra un enlace “Inicio”. | El logo original está en el encabezado, fijo en `index.html`: `assets/MAPA (7) (1).png` (1920 × 1080, ~486 KB). |
| `MANTENIMIENTO.md` | “El logo se configura una sola vez en `CONFIG.logo`: encabezado y footer.” | `CONFIG.logo` **solo** afecta al footer y sigue vacío, por lo que el footer muestra el nombre en texto. El encabezado no depende de `CONFIG.logo`. |
| `ASSETS.md` | Tipografías Instrument Serif + Jost. | La combinación vigente es **Syne 700 + Jost 400/500/600** (`css/tipografia.css`). `css/fonts.css` todavía declara Instrument Serif y `css/site.css` la nombra; falta confirmar en el navegador si llega a descargarse. |
| `ASSETS.md` | Muestrario textil hecho con CSS; no hay imágenes de plisados, tapados, ropa interior ni trajes de baño. | Hay ocho fotos de telas en `assets/telas/` (`CONFIG.fabricImages`) y cinco figurines en `assets/cuidados/` (`CONFIG.careImages`). |
| `DATOS.md` | El filtro de prendas usa el diccionario `GARMENTS`; el selector muestra prendas. | El filtro del mapa y el de recorridos usan cinco especialidades fijas en `js/app.js` (Sastrería & Archivo, Denim & Streetwear 90s, Sin género / Oversized, Carteras, Calzado & Accesorios, Cuero & Tapados), comparadas con la columna `Especialidad` completa. `GARMENTS` sigue usándose para el texto “Prendas que predominan” de cada ficha. Si la planilla cambia esas especialidades, hay que actualizar la lista en `app.js`. |
| `VERIFICACION.md` | Pausa de marquesina; “no se registró ni publicó un Site”. | El botón Pausar se quitó el 17/10. La revisión privada de Sites existe desde el 17/10. |
| `RECEPCION-DE-HALLAZGOS.md` | Turnstile y `ALLOWED_ORIGINS` usan el hostname de la revisión `*.chatgpt.site`. | Sigue siendo correcto para la revisión. Al publicar en Netlify hay que agregar ese dominio al widget y a `ALLOWED_ORIGINS`. |
| `README.md` | 45 pruebas con `npm test`. | Correcto: pasan las 45 (28 + 17) después del ajuste de saltos de línea descripto abajo. Antes de ese ajuste fallaba una en Windows. |

## Cambios en el código de esta sesión

1. **“Cambiar este local” ya no alterna siempre entre los mismos dos locales** (`js/app.js`). Antes siempre tomaba la alternativa más cercana a la parada actual; al tocar de nuevo, el local original volvía a ser el más cercano y se alternaba A ↔ B. Ahora se recuerdan los locales descartados y se saltean hasta agotar las alternativas; recién entonces se vuelve a empezar, sin volver inmediatamente al local recién descartado. La memoria se reinicia al generar un recorrido nuevo o al restaurar uno desde un enlace. Las alternativas siguen cumpliendo preferencias, distancia y presupuesto.
2. **El formulario de propuestas no arrastra la tipología precargada desde Agenda** (`js/forms.js`). Al abrir “Proponer una feria o evento” se precarga `Feria colectiva` y se muestra el campo de fecha. Si después se abre otra entrada, la tipología vuelve a “Elegí una opción” y se oculta y vacía el campo de fecha. Si la persona eligió la tipología a mano, se respeta. No cambiaron el endpoint, el POST ni los seis nombres de campo.
3. **El mensaje de recepción no confirmada usa `CONFIG.email`** en vez de repetir la dirección escrita a mano (`js/forms.js`). El texto visible es el mismo.
4. **“Ver en el mapa”** primero cambia a la vista de mapa y ajusta su tamaño, y después selecciona el local una sola vez (`js/app.js`). Antes seleccionaba dos veces.
5. **El reajuste del mapa al redimensionar la ventana** se agrupa en un solo cuadro de animación (`js/app.js`).
6. **Logo:** se quitó la referencia a `#brand-logo`, que ya no existe (`js/app.js`), y se corrigió el comentario de `CONFIG.logo` (`js/config.js`). No cambió lo que se ve: el footer sigue con el nombre en texto porque no se pidió modificarlo.
7. **`scripts/build-demo.mjs`:** se quitó un reemplazo del enlace de demostración del footer, que ya no existe desde el 17/10. No cambia el resultado.
8. **Prueba de integridad de cuidados en Windows** (`tests/core.test.js`). Fallaba en este equipo aunque los textos son idénticos. El megaprompt está guardado en Git con saltos LF, pero `core.autocrlf=true` lo descarga con CRLF, y la prueba busca `\n\n`. Ahora la prueba normaliza los saltos al leer el archivo. No se modificó el megaprompt ni los textos de cuidados.

### Verificación

- `npm test` con Node 24.22.1: **45 de 45 aprobadas** (28 de datos, recorridos y contenidos; 17 del receptor de fotos). La falla de la prueba de cuidados existía antes de los cambios de esta sesión: se comprobó con el código sin modificar.
- `node --check` sin errores en `js/app.js`, `js/forms.js`, `js/config.js` y `scripts/build-demo.mjs`.
- Simulación de “Cambiar este local” con la función real `alternatives()` y cuatro locales cercanos. Antes: A → B → A → B… Ahora: A → B → C → D → C → B → A…, sin repetir pares.
- **No se ejecutaron pruebas en navegador**: las pruebas automáticas no cubren la interfaz de `app.js` ni de `forms.js`. Antes de publicar, comprobar a mano:
  - Recorrido “Tarde” con varias alternativas: tocar “Cambiar este local” varias veces y ver que recorre locales distintos.
  - Abrir “Proponer una feria o evento”, cerrar, abrir “Conozco un lugar” y ver la tipología vacía y sin campo de fecha.
  - En mobile, desde la lista, “Ver en el mapa” centra el pin rosa y abre su viñeta.
- No se hicieron envíos a la planilla de producción.

## Peso del sitio: más allá de los figurines

El plan del 18/10 para los cinco figurines (8,81 MB) sigue pendiente y vigente. Al revisar los archivos que efectivamente se sirven aparecen otros candidatos:

| Recurso servido | Peso | Observación |
|---|---:|---|
| 5 stickers usados (`emoji_clip`, `emoji_descubrir`, `emoji_digicam`, `emoji_flor1`, `emoji_stars`) | 1,47 MB | `emoji_descubrir.png` solo pesa 643 KB. Candidatos a WebP con transparencia. |
| `assets/MAPA (7) (1).png` | 486 KB | 1920 × 1080 para un logo que se muestra chico. |
| `assets/telas/*.jpg` | 1,63 MB | `lana.jpg` y `microtul.jpg` superan los 350 KB. |
| `assets/papeles/*.jpg` | 1,07 MB | `papel_5.jpg` pesa 531 KB. |
| Fuentes TTF | — | En WOFF2 pesarían cerca de la mitad. |

Los 15 MB de `assets/stickers/` en el repositorio no se descargan en una visita: solo se sirven los cinco referenciados. Se aplica el mismo criterio del 18/10: conservar los originales, crear copias para web, comparar la calidad y volver a medir.

## Pendientes que no se activan por iniciativa propia

- Recepción de fotos de Comunidad: el receptor independiente sigue sin desplegar.
- Fuentes de Agenda, Notas y Muro: las tres URLs siguen vacías.
- Animación de papel del contacto: pendiente de una referencia concreta.
- Logo en el footer: solo si se pide, completando `CONFIG.logo`.
- Netlify: publicar manualmente y de forma agrupada, según el calendario del 18/10 (próxima fecha sugerida: jueves 29/10).

## Segunda parte: lineamientos del 27/10

Se recibieron los lineamientos generales (`LineamientosMapaVintage.pdf`) y se aplicaron en la misma rama, en commits locales. **No se hizo push, merge ni publicación.**

### Decisiones consultadas

| Tema | Decisión |
|---|---|
| Estructura | **Cuatro vistas separadas** en el mismo `index.html`, una sección padre por vez. |
| Receptor de propuestas | **Apps Script nuevo** con Turnstile, “Agenda a verificar” y “Espacios a verificar”. |
| Vintage / Segunda mano | **Columna nueva `Clasificación`**. Mientras esté vacía se deduce de Tipología. |
| Recorridos | Parten de **los locales filtrados en el mapa**, con hasta tres propuestas para elegir. |
| “Detrás del mapa” | **El denim reemplaza al oliva**, con un velo oscuro para leer el texto claro. Esto deja sin efecto la decisión del 18/10 sobre el fondo oliva. |

### Qué cambió

- **Menú y vistas:** el menú tiene solo las cuatro secciones padre (MAPA, INFORMACIÓN, COMUNIDAD, SOBRE MAPA VINTAGE). Cada vista tiene una subnavegación con sus subsecciones, salvo Mapa, que ya enlaza a Armá tu recorrido desde la presentación.
  - Mapa: Mapa y Armá tu recorrido.
  - Información: Glosario y Guía de cuidados.
  - Comunidad: Agenda, Muro (“Lo que encontramos”) y Sumá tu espacio.
  - Sobre Mapa Vintage: Detrás del mapa y Notas al margen.

  Los bloques se movieron sin alterar sus textos. Se comprobó por script que el contenido es idéntico. Las anclas existentes siguen funcionando y abren la vista que corresponde: `#recorridos`, `#agenda`, `#glosario`, `#proyecto`, `#sobre-el-proyecto` y `?nota=…`. `#comunidad` ahora es la vista padre; el muro pasó a `#muro`. Sin JavaScript se ven todas las secciones en una sola página, como antes. Se quitó del menú el acceso “SUMÁ TU ESPACIO”, que ahora está dentro de Comunidad.
- **Fondos:** Mapa usa Seda, Información usa Lana, Comunidad usa Lino y Sobre Mapa Vintage usa Denim. Son las fotos de `assets/telas/`, con un velo claro. Se reemplaza la trama del manual solo cuando las vistas están activas. Para ajustar la intensidad, cambiar la opacidad del velo en `css/vistas.css`.
- **Transiciones:** fundido breve al cambiar de vista y aparición suave de cada subsección al scrollear. Ambas se desactivan con movimiento reducido. El bloque del mapa no se anima, para que el producto aparezca de inmediato.
- **Fichas:** muestran la clasificación (Vintage / Segunda mano) y las categorías como etiquetas. “Prendas que predominan” aparece solo si hay prendas detectadas; se quitó el texto “Sin detalle de prendas”.
- **Recorridos:** hasta tres propuestas distintas, priorizando las que no comparten locales. Si hay filtros activos en el mapa, el sitio avisa cuántos locales usa. Cambiar y sacar paradas, Google Maps, WhatsApp y copiar enlace siguen igual.
- **Sumá tu espacio:**
  - Los campos aparecen al elegir el tipo de espacio.
  - Siempre: dirección y barrio, ahora separados, más web.
  - Locales: horarios, prendas y rango de precios, todos opcionales.
  - Feria colectiva o evento: fecha y horario. La feria americana se trata como local.
  - La entrada “Conozco un lugar” ahora dice “Conozco un lugar, feria o evento”.
  - Se agregó un campo trampa invisible contra programas automáticos.
  - Con el receptor original se conservan los seis nombres de campo; barrio y detalles viajan dentro de `direccion` y `descripcion`.
- **Receptor nuevo:** `integraciones/propuestas/Code.gs`, listo para desplegar. Ver `RECEPCION-DE-PROPUESTAS.md`.
- **Pie:** “Escribime” abre un menú para elegir Gmail, Outlook u otra app de correo, o copiar la dirección. Sin JavaScript sigue siendo un `mailto:`. “Volver arriba” sube dentro de la vista actual.

### Escala: hasta 10.000 locales

- **Mapa:** Leaflet.markercluster 1.5.3, copia local en `vendor/` con licencia MIT, agrupa los pines cercanos. Los marcadores se crean una vez y se reutilizan al filtrar, y las viñetas se arman recién al abrirse. Cambiar la selección modifica dos íconos, no todos.
- **Datos:** los encabezados se resuelven una vez y los textos de búsqueda se calculan al cargar. La búsqueda por nombre espera una pausa breve al escribir.
- **Recorridos:** usan un índice espacial por celdas, así que cada tramo busca solo entre vecinos cercanos.

| Medición con 10.000 locales sintéticos | Resultado |
|---|---:|
| Normalización (Node) | ~0,4 s |
| Filtros | ~1 ms |
| Tres propuestas de “Tarde completa” (Node) | ~140 ms |
| Carga completa en Edge hasta mostrar la lista | ~0,6 s |
| Filtro de barrio en Edge | ~70 ms |

En el mapa quedaron unos 47 grupos en lugar de 10.000 pines.

El límite práctico pasa a ser la planilla: un CSV de 10.000 filas pesa cerca de 1,5 MB y se descarga en cada visita.

### Seguridad

- **Cabeceras en `netlify.toml`:**
  - Content-Security-Policy estricta: sin scripts ni estilos en línea, y solo los orígenes necesarios (Sheets, Apps Script, Turnstile, teselas e imágenes https).
  - HSTS, X-Frame-Options, Permissions-Policy y Cross-Origin-Opener-Policy.
  - No se sirven `docs/`, `tests/`, `integraciones/`, `scripts/` ni `package.json`.
- **`js/dom.js`** aplica estilos por CSSOM, que la CSP permite. Si no, la CSP habría bloqueado el apilado de las notas.
- **Sin cambios, ya correcto:** el contenido de las planillas se inserta como texto, y los enlaces e imágenes se validan.
- **Receptor de propuestas:** ver `RECEPCION-DE-PROPUESTAS.md`. Incluye Turnstile en el servidor, listas cerradas, límite de largo, neutralización de fórmulas, idempotencia y límite por minuto.

### Verificación

- `npm test`: **54 de 54** (28 de datos y recorridos, 17 del receptor de fotos, 9 del receptor de propuestas).
- En Edge, a 1440 y 390 px, **63 comprobaciones de vistas**:
  - Fondos de cada vista y menú.
  - Anclas compartidas, sin desborde horizontal.
  - Filtros, propuestas de recorrido, “Cambiar este local”, Agenda, “Volver arriba” y pie.
  - Sin JavaScript y con movimiento reducido.
  - Escala con 10.000 locales.
- En Edge, **12 comprobaciones de formularios** en los dos modos:
  - Original: un único POST con los seis campos de siempre.
  - Nuevo: receptor y Turnstile simulados.
- Las dos baterías se ejecutaron también con las cabeceras de `netlify.toml` aplicadas, sin bloqueos de la CSP. Esa prueba detectó que faltaba `frame-src 'self'` para la página de comparación tipográfica; ya está corregido.
- También se probaron `demostracion.html`, regenerada con `scripts/build-demo.mjs`, y `prueba-tipografica.html`.
- **Ningún envío salió a la red:** los pedidos a Apps Script y Cloudflare se bloquearon o simularon. La lectura de locales usó la planilla real, solo lectura.

### Pendiente o a confirmar

- **Desplegar el receptor de propuestas** (`RECEPCION-DE-PROPUESTAS.md`). Hasta entonces no se puede comprobar la recepción del formulario original sin un envío real, y no se hizo ninguno a producción.
- **Planilla del directorio:** agregar la columna `Clasificación` (`Vintage` o `Segunda mano`). Para varias categorías por local, escribirlas en `Especialidad` separadas por coma: “Carteras, Calzado & Accesorios” se reconoce entera aunque tenga una coma.
- **Agenda:** crear el documento curado y conectarlo en `sources.agenda`. No conectarlo nunca a “Agenda a verificar”.
- **Gmail en celulares:** el enlace abre Gmail en el navegador, o en la app si el sistema la asocia. “Otra app de correo” deja elegir la app del teléfono.
- **Revisar en un celular real** la intensidad de las telas de fondo.

## Próximo paso

Revisión de estos cambios por parte de la autora. Nada se publicó.
