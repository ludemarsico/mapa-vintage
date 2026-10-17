# Cómo mantener Mapa Vintage

## Locales del mapa

Seguí usando la planilla actual. El sitio lee su CSV público; las propuestas enviadas por formulario no se publican automáticamente.

1. Revisá que el local esté a la calle en CABA y cumpla el criterio del proyecto.
2. Mantené un `ID` único y estable, nombre, dirección, barrio, latitud y longitud. No reutilices el ID de un local retirado.
3. Cargá precios como `$`, `$$` o `$$$`. Un dato en blanco queda como “Precio sin informar”. No son importes en pesos.
4. Conservá horarios tal como los informa el comercio. El sitio no calcula “abierto ahora”.
5. En `Instagram` podés usar una URL completa. También se recupera una arroba explícita si quedó dentro de un texto importado. No se adivinan cuentas a partir del nombre comercial.

**Mejora recomendada, sin cambiar la planilla automáticamente:** agregar `Prendas predominantes`, con prendas reales separadas por coma: por ejemplo las que hayas confirmado con cada comercio. El programa usa primero esta columna y, si falta, lee `Especialidad`. La fuente actual solo permite derivar “Tapados” como prenda explícita para los locales admitidos: “Denim”, “Sin género” y “Sastrería & Archivo” no se transforman en prendas supuestas.

Para despejar casos ambiguos, agregar `Local a la calle` (`sí`/`no`), `Ciudad` (`CABA`) y opcionalmente `Estado` (`publicado`). No cambies la URL original al hacer esto. Si una ficha es showroom o solo online se excluye igualmente. Una feria colectiva con texto explícito “local a la calle” puede entrar al directorio; las demás necesitan revisión. El informe CSV de esta entrega identifica los ocho casos apartados con la lectura inicial.

## Conectar agenda, notas y muro por primera vez

Estas conexiones todavía no existen en la configuración entregada.

1. Creá tres pestañas: **Agenda**, **Notas**, **Muro**. Podés importar el CSV correspondiente de `plantillas/`; contiene solo la fila de encabezados.
2. Escribí contenido real. Usá IDs únicos. Solo `estado=publicado` aparece en el sitio; borradores y pendientes no se muestran.
3. En Sheets elegí **Archivo → Compartir → Publicar en la Web**. Seleccioná **una pestaña** y formato **CSV**. Copiá su enlace público; repetí para las otras dos.
4. En `js/config.js`, pegá esos tres enlaces entre las comillas de `sources.agenda`, `sources.notas` y `sources.muro`. **No reemplaces `sources.locales` ni `formEndpoint`.**
5. Abrí el sitio con el servidor local, recargá y verificá los contenidos.

La fuente publicada es pública: no pongas correos privados, teléfonos de contacto de propuestas ni filas pendientes en un documento publicado. Es preferible mantener el contenido editorial público en una planilla separada de la recepción de propuestas.

### Agenda

- `fecha_inicio` y `fecha_fin`: `AAAA-MM-DD`. La fecha final es inclusiva. Para un evento de un día alcanza la inicial.
- `recurrencia`: vacía para un evento puntual; `semanal:7` para domingos; `semanal:3,6` para miércoles y sábados; `mensual:15` para el día 15. Los días semanales van de 1 (lunes) a 7 (domingo).
- Confirmá la vigencia de toda recurrencia y cargá `fecha_fin` para que deje de publicarse cuando termine. Una regla no reconocida no se publica.
- `horario`, `direccion`, `barrio`, `acceso`: texto confirmado. No se supone entrada libre.
- `enlace`: URL http/https, opcional. `imagen`: ruta en assets o URL https, opcional.
- Se muestran tres fechas; “Ver más fechas” aparece solo si existen más. Las fechas se interpretan en Buenos Aires y se ocultan las vencidas. No se importan los eventos históricos del HTML anterior.

### Notas al margen

- `orden`: número; `fecha`: `AAAA-MM-DD`; `titulo`, `bajada`, `cuerpo`: texto normal, sin HTML.
- En `cuerpo` podés escribir párrafos en la misma celda con saltos de línea. Al exportar, Sheets los conserva entre comillas en CSV.
- Cada nota publicada se puede leer en un diálogo y compartir mediante `?nota=ID#proyecto`.
- La presentación del proyecto ya está escrita como propuesta del megaprompt; no se usa para fabricar notas personales.

### Muro de looks y hallazgos

1. La persona toca “Compartí tu look” y te escribe a `mapavintage.ba@gmail.com`, adjuntando foto, alias, texto y red opcional.
2. Revisá la publicación y acordá el uso de la imagen con quien la envía.
3. Guardá la foto optimizada en `assets/muro/` (creá la carpeta si hace falta), conservando el original aparte.
4. Añadí su ruta —por ejemplo `assets/muro/nombre-del-archivo.webp`— a `imagen`. Completá `nombre_alias`, `texto`, `alt`, `orden` y, si la persona quiere, `red_url`.
5. Marcá `estado=publicado` después de revisarlo. Las imágenes de esta carpeta deben acompañar la próxima versión de archivos del sitio.

No hay carga directa de fotos, cuentas de usuario ni publicación automática. Es un circuito manual por mail y Sheets.

## Formulario de espacios

Las dos entradas comparten el receptor original. El origen de la propuesta, su destino editorial y los detalles del evento se agregan como texto al principio de `descripcion`. No se añadieron columnas ni valores de tipología desconocidos para el receptor.

La URL del Apps Script no permite comprobar desde el iframe si la fila se guardó. El sitio avisa “No pudimos confirmar la recepción” y conserva los datos. Antes de reenviar, verificá la recepción para evitar duplicados. Para un éxito verificable futuro hace falta que quien mantiene Apps Script entregue su código y un protocolo de respuesta; no se cambió ese servidor.

No uses la planilla de producción para pruebas. Si necesitás probar el guardado real, prepará primero una copia y un despliegue de pruebas del Apps Script.

## Textos, imágenes y estilos

- Cuidados: `js/content.js`, y el respaldo legible sin JavaScript en `index.html`. Si la autora los modifica, sincronizá ambos. Las pruebas verifican la integridad contra el megaprompt recibido.
- Presentación y textos fijos: `index.html`.
- Identidad y tamaños: `css/site.css`, colores en `:root`.
- Recursos: `assets/`. Usá nombres de archivo sencillos; conservá proporciones y escribí un texto alternativo útil.
- `js/config.js`: URLs, nombres de columnas, tamaño de página y cálculo de caminata. Cambiar `visitMinutes` cambia todas las estimaciones.

Después de editar, probá la página en computadora y celular y revisá consola, filtros y enlaces. La entrega es para revisar; todavía no se publicó.
