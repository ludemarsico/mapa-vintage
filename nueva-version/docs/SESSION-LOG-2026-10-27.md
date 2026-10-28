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

## Próximo paso

Se espera una consigna para analizar y rearmar varias cuestiones de la página. Hasta recibirla no se hacen más cambios.
