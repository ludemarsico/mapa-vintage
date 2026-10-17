# Activar la recepción de fotos de Comunidad

## Estado de esta entrega

El formulario de Comunidad está implementado: foto local con vista previa, texto, alias y red opcional. **La recepción real está desactivada** porque todavía no existen una URL de receptor y claves de verificación configuradas. No manda correos ni adjunta fotos al Apps Script de locales. No se simuló una recepción exitosa.

La implementación separada está en `integraciones/hallazgos/`. Sus pruebas usan almacenamiento y verificación simulados; no fue desplegada en una cuenta de Cloudflare ni se hizo una carga real.

## Opciones revisadas

- El correo existente no recibe automáticamente un archivo seleccionado en un formulario web.
- El Apps Script de locales tiene otro contrato y no recibe estas fotos: se conserva exclusivamente para propuestas de locales/agenda.
- Sites ofrece D1 y R2 cuando hay un backend de aplicación; convertir el sitio estático para ello modificaría su arquitectura.
- Se deja un receptor independiente con Worker + R2 privado + D1, para mantener el sitio estático y poder usarlo también fuera de Sites. Requiere una cuenta y configuración propias. No se configura ni despliega automáticamente con el ZIP.

## Qué vas a necesitar

Una cuenta de Cloudflare con Workers, D1, R2 y Turnstile habilitados. La cuenta de ChatGPT que abre la revisión no configura esos recursos automáticamente. Necesitás Node/npm para ejecutar Wrangler, o ayuda de quien administre esa cuenta.

No pegues claves secretas en el HTML, `config.js`, la planilla ni el chat. La clave pública del widget sí se usa en `config.js`.

## Pasos exactos

1. Descomprimí la entrega y abrí una terminal en `integraciones/hallazgos/`.
2. Copiá `wrangler.toml.example` como `wrangler.toml`.
3. Autenticá Wrangler y creá los recursos independientes:

```sh
npx wrangler login
npx wrangler r2 bucket create mapa-vintage-hallazgos
npx wrangler d1 create mapa-vintage-hallazgos
```

Si un nombre ya existe en tu cuenta, revisá a qué pertenece antes de usarlo. No borres ni reemplaces recursos existentes. Podés elegir otro nombre, actualizando `database_name` o `bucket_name` en `wrangler.toml` y en los comandos siguientes.

4. Copiá el `database_id` devuelto por el comando D1 al campo correspondiente de `wrangler.toml`. Conservá las vinculaciones `DB` y `BUCKET`: son los nombres que usa el receptor.
5. Creá la tabla en la base nueva:

```sh
npx wrangler d1 execute mapa-vintage-hallazgos --remote --file=./schema.sql
```

6. En el panel de Cloudflare, creá un widget de **Turnstile**, tipo administrado, para el hostname `mapa-vintage-revision-lucia.ivorybead3.chatgpt.site`. Copiá su site key pública y conservá su secret key en tu cuenta.
7. Guardá la secret key del widget en el Worker, a través de la entrada protegida de Wrangler:

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY
```

8. En `wrangler.toml`, `ALLOWED_ORIGINS` debe contener la URL del sitio, **sin barra final ni ruta**. El ejemplo ya contiene el origen de esta revisión. Si más adelante cambia el dominio, agregá el nuevo origen separado por coma y el hostname correspondiente al widget de Turnstile. No uses `*`.
9. Cuando esos valores estén listos, desplegá **solo el receptor** en tu cuenta:

```sh
npx wrangler deploy
```

10. Wrangler mostrará la URL del Worker. Agregale `/hallazgos`. En `js/config.js` del sitio, completá:

```js
hallazgos: {
  endpoint: 'https://URL-REAL-DEL-WORKER/hallazgos',
  turnstileSiteKey: 'SITE-KEY-PUBLICA-DEL-WIDGET'
},
```

No cambies `formEndpoint` ni `sources.locales`. La URL nueva nunca debe ser la de Apps Script. El programa rechaza esos hosts para las fotos.

11. Actualizá los archivos de la copia de revisión con ese `config.js`. Editar un archivo local no cambia automáticamente el sitio alojado. La página habilita el botón después de cargar y completar Turnstile. `demostracion.html` mantiene los envíos desactivados incluso con conexión configurada.
12. Antes de usar datos reales, verificá la integración completa con recursos de prueba separados. Esta entrega solo verificó cliente y receptor con mocks, sin crear filas o fotos de prueba en servicios de producción.

## Cómo revisar los aportes

- El archivo queda en el bucket R2 privado, bajo `pendientes/ID.ext`.
- El texto y alias quedan en la tabla D1 `aportes`, con `estado=pendiente`. No son una publicación del muro.
- En el panel de D1, podés consultar:

```sql
SELECT id, nombre_alias, texto, red_url, imagen_key, creado
FROM aportes
WHERE estado = 'pendiente'
ORDER BY creado DESC;
```

- Abrí el bucket privado en el panel de R2 y descargá la imagen indicada en `imagen_key`. No actives una URL pública para todo el bucket.
- Si aprobás el aporte, prepará su copia web en `assets/muro/` y agregá su ruta, texto, alias y red opcional a la pestaña Muro con `estado=publicado`. Es el mismo circuito editorial manual explicado en `MANTENIMIENTO.md`.
- El receptor no publica automáticamente, no escribe en Sheets y no manda notificaciones por correo. La revisión se hace desde el panel de Cloudflare.
- Si rechazás un aporte, podés marcarlo como `descartado` y borrar su imagen desde el bucket privado. Un registro que quede en `recibiendo` después de una interrupción debe revisarse antes de retirarlo o volver a aceptar el mismo ID.

## Contrato y comportamiento

POST `multipart/form-data` a `/hallazgos`: `photo`, `text`, `alias`, `social_url`, `submission_id` y `cf-turnstile-response`. Foto JPG/PNG/WebP de hasta 5 MB; cuerpo total de hasta 6 MB; texto de hasta 1200 caracteres y alias de hasta 80. Se revisa la firma del archivo, no se realiza una decodificación/optimización de imagen en el servidor.

Turnstile se valida en el servidor, incluyendo acción `hallazgo` y hostname. La secret key no se expone en el cliente. El Worker no tiene una ruta pública para listar aportes ni descargar imágenes privadas.

Solo se muestra recepción confirmada si el receptor devuelve HTTP 200/202 y `{ received: true, id }`, con el mismo ID del aporte. Se responde después de guardar la imagen y el registro pendiente. Los reintentos idénticos conservan ese ID para evitar duplicados. Un error o respuesta no verificable conserva foto y campos en el navegador y vuelve a pedir la verificación.

No existe una transacción única entre D1 y R2: ante errores normales se compensa retirando la reserva y el objeto. Una interrupción abrupta puede dejar un registro `recibiendo`; no se presenta como recepción confirmada.

## Fuentes oficiales

- [Validación de Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- [Inicio de D1](https://developers.cloudflare.com/d1/get-started/).
- [R2 desde Workers](https://developers.cloudflare.com/r2/get-started/workers/).

La validación de Turnstile y la guía de D1 pudieron consultarse durante esta sesión. Las páginas de R2 no estuvieron accesibles desde la herramienta de lectura. No se ejecutaron comandos de provisión o despliegue del receptor; la configuración real y la prueba entre servicios siguen pendientes.
