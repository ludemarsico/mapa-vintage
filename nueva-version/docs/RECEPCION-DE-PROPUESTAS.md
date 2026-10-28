# Activar la recepción verificada de propuestas

## Estado

El sitio sigue enviando las propuestas al **formulario original** (`formEndpoint`), con los mismos seis campos de siempre. Barrio, horarios, prendas, precio, fecha y horario viajan como texto dentro de `direccion` y `descripcion`. Con ese receptor no se puede confirmar si la fila se guardó ni separar la Agenda.

El receptor nuevo está escrito en `integraciones/propuestas/` y probado con servicios simulados (`tests/propuestas.test.js`). **No está desplegado.** Cuando lo publiques y completes `CONFIG.propuestas`, el sitio:

- Guarda las ferias y eventos en la hoja **Agenda a verificar**.
- Guarda los locales en la hoja **Espacios a verificar**.
- Pide la verificación de Cloudflare Turnstile antes de enviar.
- Muestra “recibimos tu propuesta” solo si el receptor confirma el guardado con el mismo identificador del envío.

Nada se publica automáticamente. La Agenda pública sigue leyendo `sources.agenda`, un documento distinto que curás vos a partir de “Agenda a verificar”.

## Qué vas a necesitar

- Tu cuenta de Google (la misma de las planillas).
- Una cuenta gratuita de Cloudflare para crear el widget de Turnstile. Puede ser la misma que use el receptor de fotos.

## Pasos

1. **Planilla privada de recepción.** Creá una planilla nueva, por ejemplo “Mapa Vintage — Recepción”. **No la publiques en la web.** Copiá su ID: es la parte de la URL entre `/d/` y `/edit`. Las hojas “Agenda a verificar” y “Espacios a verificar” se crean solas con la primera propuesta, con las columnas de la planilla del directorio más Recibido, ID de envío, Origen y Estado.
2. **Widget de Turnstile.** En Cloudflare → Turnstile, creá un widget administrado con los dominios del sitio (el de Netlify y, si querés probar, el de la revisión). Guardá la *site key* (pública) y la *secret key* (privada).
3. **Proyecto de Apps Script.** Entrá a https://script.google.com → Nuevo proyecto. Reemplazá el contenido de `Código.gs` con `integraciones/propuestas/Code.gs`. En Configuración del proyecto, activá “Mostrar el archivo de manifiesto `appsscript.json`” y reemplazalo con `integraciones/propuestas/appsscript.json`.
4. **Propiedades del script** (Configuración del proyecto → Propiedades del script):
   - `SPREADSHEET_ID`: el ID del paso 1.
   - `TURNSTILE_SECRET_KEY`: la secret key del paso 2.
   - `ALLOWED_HOSTNAMES`: los dominios del sitio separados por coma, sin `https://` (por ejemplo `mapavintage.netlify.app`).
5. **Implementar.** Implementar → Nueva implementación → Aplicación web. Ejecutar como: **yo**. Quién tiene acceso: **cualquier usuario**. Autorizá los permisos: la planilla y la conexión externa con Cloudflare. Copiá la URL que termina en `/exec`.
6. **Probar antes de conectar.** Usá una planilla de prueba en `SPREADSHEET_ID` y abrí el sitio localmente con la configuración del paso 7. Mandá una propuesta y verificá que aparezca la fila. Después cambiá `SPREADSHEET_ID` por la planilla definitiva.
7. **Conectar el sitio.** En `js/config.js`:

```js
propuestas: {
  endpoint: 'https://script.google.com/macros/s/ID-DE-LA-IMPLEMENTACION/exec',
  turnstileSiteKey: 'SITE-KEY-PUBLICA'
},
```

El sitio solo acepta como receptor una URL `https://script.google.com/macros/s/…/exec`. No pegues la secret key en el sitio, en el chat ni en la planilla.

## Revisar las propuestas

- Cada fila entra con `Estado = Pendiente`. Cambialo a mano a `Aprobada` o `Descartada`.
- Para publicar un local, copiá sus datos a la planilla del directorio y completá latitud y longitud.
- Para publicar una feria, copiala al documento curado de la Agenda con `estado=publicado` (ver `MANTENIMIENTO.md`).

## Protecciones incluidas

- **Turnstile verificado en el servidor:** se comprueban el resultado, la acción `propuesta` y el dominio.
- **Listas cerradas:** tipo, categoría, rango de precios y origen. También se validan las fechas y que los enlaces sean http/https sin credenciales.
- **Límite de largo** en cada campo.
- **Textos que empiezan con `=`, `+`, `-` o `@`** se guardan como texto, no como fórmula.
- **Reintentos con el mismo identificador:** no duplican la fila.
- **Límite de 20 propuestas por minuto** para frenar ráfagas.
- **Campo trampa invisible** en el formulario contra programas automáticos.

## Límites

- No se desplegó ni se probó contra Google ni contra Cloudflare reales; solo con servicios simulados.
- Apps Script no informa la IP de quien envía. El control de abuso depende de Turnstile y del límite global por minuto.
