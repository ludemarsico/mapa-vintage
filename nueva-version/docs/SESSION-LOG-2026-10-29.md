# Registro de sesión — 29 de octubre de 2026

Rama: `modificaciones-tommy`. Sin push.

## Cambios de la lista de modificaciones

### Encabezado y pie
- El menú hamburguesa queda en la esquina izquierda en cualquier ancho. Antes, en pantallas de más de 1440 px, el relleno del encabezado lo corría hacia el centro.
- "Volver arriba" mantiene la altura y se alinea al margen derecho.

### Mapa
- Se quitaron la franja amarilla con leyendas en movimiento y la leyenda "Locales a la calle… No incluimos showrooms ni tiendas exclusivamente online."
- El mapa se puede arrastrar y pellizcar siempre. Ya no hay botón "Activar desplazamiento", zócalo ni texto de ayuda sobre + y −.
- La rueda del mouse sigue bajando la página. Para acercar se usan + y −, el doble clic o el pellizco.
- "Ver todos los resultados" pasó a estar dentro del mapa, en la esquina superior derecha.
- Debajo de "Armá tu recorrido" (arriba de la página) aparece "Sumá tu espacio", que lleva a su sección.
  - Los dos enlaces ahora también se ven en tablet y teléfono; antes se ocultaban por debajo de 1100 px.

### Directorio (`js/data.js`, `normalizeStores`)
- La curaduría es de la hoja Directorio. Ya no se descartan locales por tipología, descripción ("showroom", "cita previa", "online"), por ser "feria colectiva" ni por no declarar "local a la calle".
- Solo quedan afuera:
  - Las filas sin nombre.
  - Las filas sin coordenadas válidas, porque no se pueden ubicar en el mapa.
- No hay regla de Estado: la lista sale de la hoja Directorio y la Agenda, de la hoja Agenda.
- Un ID repetido ya no saca al local: se le agrega un sufijo.
- Con la hoja actual se publican **54 de 54** filas. Antes eran 38: 16 quedaban afuera con el motivo "Confirmar que es un local a la calle".

### Lista de locales
- 10 locales por página.
- El nombre es un botón que muestra el local en el mapa. Se quitó "Ver en el mapa".
- A la vista quedan barrio, precio solo en signos ($, $$, $$$) y la Clasificación (Vintage, Segunda mano…). Se quitaron las etiquetas de Especialidad y la línea "Prendas que predominan".
- "Ver más" despliega, en este orden:
  - Dirección.
  - Días y horarios.
  - Descripción breve.
  - Los botones "Cómo llegar" e "Instagram" (antes "Web o red social", con la misma acción).
- La lista muestra solo la barra de desplazamiento, sin las flechas de arriba y abajo.
- Las flechas de paginado no tienen borde y conservan el tamaño de 44 px.

### Sumá tu espacio
- La sección pasó de Comunidad a Mapa, debajo de "Armá tu recorrido", y salió del submenú de Comunidad.
- El campo Barrio es una lista con los 48 barrios oficiales de CABA (`CONFIG.barrios`).
- Las ferias y eventos, tanto desde Agenda como eligiendo "Feria colectiva o evento", se envían al Apps Script de la Agenda (`CONFIG.agendaFormEndpoint`), que guarda en su hoja "Aportes".
  - Se mandan los mismos seis campos del formulario original.
  - Los locales siguen yendo al Apps Script del Directorio.

### Agenda
- Lee la hoja "Agenda" publicada como CSV (`CONFIG.sources.agenda`).
- Tiene las mismas columnas que el Directorio, más **Días**: ID, Nombre, Barrio, Dirección, Latitud, Longitud, Tipología, Rango Precio, Especialidad, Días, Horarios, Instagram y Descripción breve.
- Al 29/10 la hoja solo tiene encabezados, así que la sección muestra su mensaje inicial. Con datos simulados con esas columnas, la lista se verificó en el navegador.
- Listado paginado (10 por página) como el de locales:
  - A la vista: Días, barrio, precio en signos, tipología y nombre.
  - "Ver más": dirección, horarios, especialidad, descripción breve, "Cómo llegar" e "Instagram".
- Todo lo que está en la hoja se publica, en el orden de la hoja. No hay regla de Estado.
- Con fechas publicadas, "Proponer una feria o evento" queda a la derecha de la bajada "Ferias y encuentros…". En el teléfono pasa debajo. Sin fechas, sigue dentro del mensaje inicial, para no duplicarlo.
- Si en algún momento se agrega una columna Fecha (8/11/2026 o 2026-11-08), las fechas pasadas se ocultan y las próximas se ordenan primero. Hoy no es necesaria.

### Información
- Glosario: se quitó "Archivo de términos".
- Materiales y tejidos:
  - Se quitó la cajita con el nombre dentro de cada tela.
  - Hay flechas a los costados del muestrario y un contador.
  - Se puede elegir cualquier tela visible con un clic, no solo la de arriba.
  - En pantallas táctiles se pasa de tela deslizando.
- Prendas y piezas: una prenda por página con su figurín grande, flechas, contador y deslizamiento táctil.
- "Antes de lavar, revisá siempre la etiqueta…" va en negrita, sobre un fondo claro.

### Comunidad
- Muro de Polaroids:
  - Debajo de la foto se muestran hasta 180 caracteres.
  - Si el texto es más largo, "Seguir leyendo" da vuelta la foto y muestra el texto completo, el nombre y la red social. "Ver imagen" la vuelve a dar vuelta.
  - Al pasar el mouse hay un vaivén suave, que se apaga mientras la foto está dada vuelta y con "reducir movimiento".
  - Se ven 3 por página en escritorio, 2 en tablet y 1 en el teléfono.
  - Las flechas de los costados (o deslizar) pasan a las siguientes.
- Compartí tu hallazgo: "Tu red social" pide un @usuario.
  - Se acepta @usuario o un enlace completo.
  - Antes de enviar, el @usuario se convierte en el enlace de Instagram, que es lo que espera el receptor de fotos.

### Sobre Mapa Vintage
- "Sobre el proyecto" ya no es desplegable: el título y el texto quedan fijos. El ancla `#sobre-el-proyecto` sigue funcionando.

### Cloudflare
- Queda preparado y sin efecto mientras las claves estén vacías:
  - `CONFIG.propuestas` (receptor verificado de propuestas).
  - `CONFIG.hallazgos` (receptor de fotos).
- Sin claves, los formularios funcionan como hasta ahora y no se carga Turnstile.

## Archivos
- JS: `config.js`, `data.js`, `app.js`, `map.js`, `forms.js`, `hallazgo.js`, `editorial.js`, `views.js`, `demo.js`.
- CSS: `directorio.css`, `vistas.css`, más los nuevos `paginado.css` y `muro.css`.
- `index.html` y `demostracion.html` (regenerada).
- `tests/core.test.js`.

## Verificación
- `npm test`: 57/57.
- Navegador (Edge sin interfaz):
  - Lista de esta sesión: 39/40. La falla es un falso negativo de la prueba de las telas: la tela girada hace que el recuadro oculto de 1 px mida un poco más. En la captura no se ve la cajita.
  - Vistas: 65/65.
  - Formularios: 11/11.
  - Demostración y comparación: OK.
- No se hizo ningún envío real. Los POST a Apps Script se interceptaron en las pruebas.
