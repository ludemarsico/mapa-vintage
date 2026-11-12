# Recepción de aportes y fotos

Un solo receptor, instalado dentro de la planilla del Directorio, recibe todo lo que llega desde el sitio:

| Desde el sitio | Llega a |
|---|---|
| Sumá un espacio → Local | Hoja **Aportes** de la planilla del Directorio |
| Sumá un espacio → Feria o evento, y "Proponer feria o evento" de la Agenda | Hoja **Aportes** de la planilla de la Agenda |
| Compartí tu hallazgo | La foto va a la carpeta **Mapa Vintage — Hallazgos** de tu Drive y los datos, a la hoja **Hallazgos** |

Las hojas Aportes tienen las mismas columnas que el Directorio y la Agenda, y cada dato va a la columna con su mismo nombre. El orden de las columnas no importa, ni las tildes o mayúsculas del encabezado.

| Columna | Qué recibe |
|---|---|
| ID | Vacía: se completa al pasar la fila al Directorio o a la Agenda |
| Nombre, Barrio, Dirección, Tipología, Instagram | Lo que se escribió en el formulario (Instagram recibe la web o red social) |
| Latitud, Longitud | La ubicación que encuentra Google Maps para la dirección y el barrio. Si no la encuentra o cae fuera de CABA, quedan vacías. **Revisalas antes de publicar** |
| Rango Precio, Especialidad | Vacías: el formulario ya no las pregunta |
| Días (solo Agenda) | La fecha de la feria, como dd/mm/aaaa, si se indicó una |
| Horarios | Los horarios del local o el horario de la feria |
| Descripción breve | El texto "Contanos qué podemos encontrar" |

La fecha de recepción, quién lo propone (responsable o visitante) y el identificador del envío quedan en una **nota** sobre la celda del Nombre (se ve al pasar el mouse). Si la hoja tiene una columna Estado, la fila entra como Pendiente. Nada se publica solo. El sitio muestra "recibimos tu propuesta" solo cuando el receptor confirma que la fila se guardó.

El código está en `integraciones/aportes/Code.gs`.

## Instalación (una sola vez, unos 10 minutos)

1. Abrí la planilla **DIRECTORIO VINTAGE BUENOS AIRES**.
2. Menú **Extensiones → Apps Script**. Se abre un proyecto nuevo, unido a esta planilla.
3. Borrá todo lo que aparece en `Código.gs` y pegá el contenido completo de `integraciones/aportes/Code.gs`.
   - El enlace de la planilla de la **Agenda** ya está cargado en la línea `var AGENDA = …`. Si algún día la Agenda pasa a otra planilla, se cambia ahí.
   - Guardá con el ícono del disquete.
4. Arriba a la derecha: **Implementar → Nueva implementación**. En el engranaje, elegí **Aplicación web**.
   - Descripción: `Aportes`.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
5. Tocá **Implementar** y después **Autorizar acceso**. Elegí tu cuenta.
   - Google avisa que "no verificó esta app" porque es tuya y nueva. Entrá en **Configuración avanzada → Ir a Aportes (no seguro) → Permitir**.
   - Los permisos son: tus planillas (para escribir en Aportes del Directorio y de la Agenda), crear la carpeta de fotos en tu Drive, compartir por enlace las fotos que publiques y buscar direcciones en Google Maps.
6. Copiá la **URL de la aplicación web** (termina en `/exec`) y pasámela, o pegala en `js/config.js`:

```js
aportes: { endpoint: 'https://script.google.com/macros/s/…/exec' },
```

Mientras ese campo esté vacío, las propuestas siguen yendo a los formularios anteriores y las fotos no se envían.

### Revisá qué está publicado de la planilla

La planilla del Directorio está publicada en la web para que el sitio la lea. Las hojas Aportes y Hallazgos tienen datos de quienes escriben, así que **no tienen que publicarse**:

- **Archivo → Compartir → Publicar en la web**. En "Vínculo", el primer desplegable tiene que decir el nombre de la hoja del directorio, **no** "Todo el documento".

### Después de conectar

- Los dos Apps Script anteriores (el del Directorio, que escribía los datos en orden fijo y por eso quedaban en columnas corridas, y el de la Agenda, que no guardaba) ya no se usan: en cada proyecto, **Implementar → Administrar implementaciones → Archivar**.
- Borrá las filas de prueba que quedaron corridas en Aportes.
- Borrá a mano la fila mal cargada de Le Garage Di Tutti en el Directorio.

## Uso diario

- **Aportes:** si aprobás una fila, revisá Latitud y Longitud, completá ID, Rango Precio y Especialidad y copiala a la hoja del Directorio o de la Agenda: las columnas coinciden. Después podés borrarla de Aportes.
- **Hallazgos:** la columna Foto abre la imagen en tu Drive. Para que aparezca en el muro de Comunidad, cambiá el Estado a **Publicado**. El muro se actualiza en unos cinco minutos. Para sacarla, cambiá el Estado a Descartado.
- Si una hoja Aportes no existe, el receptor la crea con las columnas del Directorio o de la Agenda. No agrega columnas a una hoja que ya existe: un dato sin columna con su nombre no se guarda.
- Si el enlace de la Agenda no está cargado, las ferias llegan a Aportes del Directorio, con "PARA LA AGENDA", la fecha y el horario en la nota.

## Si más adelante cambia el código

En el proyecto de Apps Script: pegá el código nuevo, guardá y andá a **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar**. La URL no cambia.

## Protecciones

- Campo trampa invisible contra programas automáticos y límite de 20 aportes por minuto.
- Un reintento con el mismo identificador no duplica la fila.
- Listas cerradas para el tipo de espacio y el origen; fechas válidas; enlaces solo `http`/`https`, sin usuario ni clave.
- Textos acotados y guardados como texto (un `=` al principio no se convierte en fórmula).
- La foto se reduce en el navegador a JPEG de hasta 1600 px antes de enviarse: pesa poco y pierde los datos internos del archivo, como la ubicación. El receptor reconoce el formato por el contenido del archivo y no acepta más de 6 MB.
- Las fotos quedan privadas en tu Drive. Solo se comparten por enlace las que marcás como Publicado.

## Límites

- Se probó con servicios simulados (`tests/aportes.test.js`), no contra Google. La primera prueba real es enviar un aporte desde el sitio una vez instalado.
- Sin verificación tipo captcha: si llega spam, se puede sumar más adelante.
