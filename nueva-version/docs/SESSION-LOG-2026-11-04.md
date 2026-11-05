# Registro de sesión — 4 de noviembre de 2026

Rama: `modificaciones-tommy`. Commit y pull request hacia `reconstruccion-mapa-vintage` el 5/11.
Los originales de `assets/nuevo_estilo` (32 MB) no se suben al repositorio: el sitio usa las copias de `assets/identidad`.

## Nueva identidad visual
Se aplicaron el diseño de Canva ("MAPA VINTAGE — prueba de color", 4 páginas) y el documento "Identidad visual - lineamientos".

### Tipografías (en `assets/fonts`, licencia OFL)
- **Rosario 700:** títulos, siempre en mayúscula.
- **Open Sauce Sans 400 y 700:** lectura; en bold para las bajadas.
- **Space Mono 400 y 700:** botones y etiquetas, en mayúscula.

Problema con Open Sauce Sans:
- El paquete de fontsource trae un archivo "regular" roto: es un PostScript con extensión `.woff2`, y le pasa a todas las versiones 5.x.
- Por eso el regular y la itálica se sirven en TTF desde el repositorio oficial (marcologous/Open-Sauce-Fonts).
- El bold sí está en WOFF2.

### Paleta
Definida en `css/identidad.css` como `--azul`, `--rosa`, `--mostaza`, `--blanco`, `--marfil` y `--negro`.

### Imágenes
- Las de `assets/nuevo_estilo` (32 MB) se convirtieron a WebP en `assets/identidad` (2,3 MB), con los bordes transparentes recortados.
- `assets/nuevo_estilo` queda como carpeta de originales.
- Los pines del mapa son mostaza, y rosa el elegido. Los grupos de pines también son mostaza.

### Hojas de estilo
- `index.html` usa `css/fonts.css`, `css/identidad.css` (nueva y completa) y `css/muro.css` (el giro de las Polaroids).
- Las hojas anteriores (`site`, `revision`, `participacion`, `tipografia`, `muestrario`, `prendas`, `directorio`, `vistas`, `paginado`) ya no se cargan.
  - Siguen en el repositorio por `prueba-tipografica.html`.

## Por vista
### Encabezado y pie
- **Encabezado:**
  - Menú hamburguesa a la izquierda en cualquier ancho; se despliega como panel.
  - Logo negro al centro.
- **Pie (negro):**
  - "¿Tenés algo para contarme?" en rosa.
  - Botón azul "Escribime", que mantiene la elección de app de correo.
  - Contacto e Instagram abajo a la izquierda.
  - Collage con el logo blanco.
  - La flecha mostaza lleva a "Volver arriba".

### Mapa
- **Portada:** foto de la 9 de Julio con jacarandás, un velo claro y el botón "Ver mapa".
- **Debajo de la portada:**
  - La bajada.
  - "Armá tu recorrido" (botón azul) y "Sumá tu espacio".
  - Los filtros Buscar, Barrio, Tipo y Precio.
- **Lista de locales en acordeón:**
  - Cerrada, muestra solo el nombre (que lleva al mapa) y una flecha.
  - Abierta, muestra "$$ – Clasificación", dirección y barrio, horarios, descripción, "Cómo llegar" e "Instagram".
- **Armá tu recorrido:**
  - Panel con alfiler.
  - Propuestas A, B y C.
  - Paradas numeradas 01, 02…
  - Botones "Abrir en Google Maps", "Compartir por WhatsApp" y "Copiar enlace".
- **Sumá un espacio:**
  - Dos entradas con foto: **Local** y **Feria o evento**.
  - Dentro del formulario se pregunta "¿Es tuyo o lo conocés?":
    - "Es mío o lo organizo" se guarda como origen "Responsable del espacio".
    - "Lo conozco" se guarda como "Recomendación de visitante".
  - Esa pregunta no se agrega a los campos que se envían: el formulario original sigue mandando sus seis campos.

### Información (Glosario · Cuidados · Agenda)
- La Agenda pasó de Comunidad a Información, como en el diseño.
- **Glosario:**
  - Pestañas de carpeta, cada una con su papel (`papel_1` a `papel_5`).
  - El recorte de la mujer leyendo el diario.
- **Cuidados:**
  - Perchero de prendas que se desplaza de costado (flechas, deslizando o con el teclado). Al elegir una prenda, su texto aparece debajo.
  - Las 18 prendas, con los textos de Cuidados.pdf, guardados tal cual en `assets/originales/cuidados-2026-11-04.md`.
    - De ahí sale `CARE` en `js/content.js`, y la prueba controla que coincidan palabra por palabra.
    - Reemplazan a los 13 textos anteriores. "Calzado de cuero" quedó fuera y "Cuero" es la campera.
  - El orden de `CONFIG.prendas` sigue el diseño: Lana, Cuero, Seda, Gamuza, Plisado, Estampas, Tejidos a mano, Jean y el resto.
  - En el diseño la prenda tejida decía "Sweaters" y quedó como "Tejidos a mano", igual que su texto.
- **Agenda:**
  - Lista sujeta con un gancho: fecha a la izquierda, nombre al centro y datos a la derecha.
  - Si en la hoja la fecha está en la columna **Días** (07/11/2026), cuenta como fecha del evento: se muestra "7/11", el día de la semana va en los datos y se oculta cuando pasa.
  - Esto se hizo porque el primer evento real (OGA Misericordia) se cargó así.

### Comunidad (fondo negro)
- "Comunidad" y "Mandá tu foto".
- Muro de Polaroids (mismo funcionamiento que el 29/10).
- Si todavía no hay hallazgos, se ven tres marcos vacíos.
- **Compartí tu hallazgo:** collage (selfie, Vermeer, estrellas), cámara y formulario en el orden del diseño.
  - El formulario mide hasta 640 px de ancho y unos 580 px de alto, con campos más bajos y menos espacio entre ellos.
  - El collage llega a 390 px y queda centrado a la izquierda, como en la imagen del diseño.

### Sobre Mapa Vintage (fondo negro)
- Se quitaron "Detrás del mapa" y "Notas al margen". El código de notas queda inactivo.
- El texto de Lucia (del PDF) va sobre el pañuelo de encaje, con el dije de corazón y el nautilus.
- La Polaroid de la foto de infancia queda al costado y acompaña el desplazamiento.
- La flor va al final.

## Cambios respecto del diseño, aprobados
- La bajada de "Compartí tu hallazgo" repetía "prenda heredada". Quedó: "…un recuerdo a través de una prenda".
- Accesibilidad: el texto de los botones azules va en negro, que cumple contraste AA. El diseño mostraba texto blanco o rosa sobre azul, que no lo cumple.

## Verificación
- `npm test`: 59/59 (agrega la fecha en la columna Días y los 18 cuidados con sus imágenes).
- Navegador (Edge sin interfaz):
  - 23/23 comprobaciones de interacción: fuentes, menú, glosario, perchero, Agenda, entradas Local y Feria, acordeón, recorrido, "Volver arriba" y demostración.
  - No se hizo ningún envío a Apps Script.
- Capturas de las cuatro vistas en escritorio (1366 px) y teléfono (390 px), sin errores de consola.
