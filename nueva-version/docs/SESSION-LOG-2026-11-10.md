# Registro de sesión — 10 de noviembre de 2026

Rama: `modificaciones-tommy`. Sin push. Se aplicó la lista "Correcciones.pdf".

## Navegación y vistas
- **Menú:** Mapa, Agenda, Recursos, Comunidad, Sobre Mapa Vintage.
- **Agenda** es una vista propia (`#agenda`), entre Mapa y Recursos.
  - Solo muestra fechas de hoy en adelante. La regla ya existía: un evento del 9/11 deja de verse el 10/11. Se comprobó con OGA Misericordia (7/11), que ya no aparece.
- **Recursos** (ex Información) tiene solo Glosario y Cuidados. Se quitaron el título "Información" y el submenú rosa.
  - El enlace viejo `#informacion` sigue abriendo Recursos.

## Mapa
- **Portada:**
  - Ocupa la pantalla debajo del encabezado. A primera vista solo se ve "Ver mapa"; la bajada y "Armá tu recorrido" quedan debajo.
  - En escritorio se muestra la parte baja de la foto, con el obelisco al centro y la calle, como en el diseño.
  - En el teléfono, la foto cubre toda la pantalla y el botón es más chico.
- **Etiquetas:**
  - Algunos locales no mostraban etiqueta porque la Tipología "Tienda de segunda mano" no tenía una asignada.
  - Ahora cada local lleva Vintage, Segunda mano o Feria americana según su Tipología.
  - Para sumar varias etiquetas, se agrega una columna **Clasificación** en la hoja (ver `DATOS.md`).
- **Filtros:**
  - Tipo: Todos, Vintage, Segunda mano, Feria americana.
  - Precio: Todos los precios, $$$ Alto, $$ Medio, $ Bajo.
- **Armá tu recorrido:** "¿Qué buscás?" ofrece Sin preferencia, Vintage, Segunda mano y Feria americana. El enlace compartido usa `tipo=`.
- **WhatsApp:** "Mirá el paseo que armé en Mapa Vintage: (enlace) ¿Vamos? Armá el tuyo en www.mapavintage.com.ar".
- **En el teléfono:**
  - Sin el texto explicativo.
  - "Armá tu recorrido" y "Sumá tu espacio" son dos botones claros iguales: toman azul y rosa al tocarlos.
  - "Limpiar filtros" queda al lado de Precio.
- El pin de "Sumá un espacio" es más chico.

## Otros cambios visuales
- **Barras de desplazamiento:** finas y sin flechas (página, menú, lista y formularios).
- **Favicon:** era de 48×64 y el navegador lo estiraba. Ahora es cuadrado, con la etiqueta centrada (64 y 180 px).
- **Pie:**
  - El logo tiene un contorno negro para despegarse del collage, y la composición es más grande.
  - En el teléfono hay más aire y el ícono de Instagram (el correo queda en "Escribime").
- **Teléfono:** las secciones muestran título, imagen y bajada, en ese orden (Sumá un espacio, Cuidados, Glosario y las demás).
- **Glosario:** papeles aclarados con un velo. En el teléfono, las cinco pestañas entran en el ancho.
- **Compartí tu hallazgo:** el formulario tiene la estética del panel de Armá tu recorrido (gris, borde y sombra, etiquetas en negrita, campos con borde negro).

## Formularios y fotos
- **Problema:**
  - El Apps Script anterior escribía las propuestas en la hoja pública del Directorio, con las columnas corridas.
  - El de la Agenda no guardaba nada.
  - Como el sitio no podía leer la respuesta, mostraba "No pudimos confirmar la recepción" aunque el envío llegara.
- **Solución:** un receptor nuevo, `integraciones/aportes/Code.gs`, que se instala desde la misma planilla del Directorio (Extensiones → Apps Script). Pasos en `RECEPCION-DE-APORTES.md`.
  - Los locales van a la hoja **Aportes** de la planilla del Directorio; las ferias y eventos, a la hoja **Aportes** de la planilla de la Agenda (su enlace va en `AGENDA`, al principio de `Code.gs`).
  - Cada dato va a la columna con su mismo nombre, igual que en el Directorio y la Agenda (Días recibe la fecha como dd/mm/aaaa). Latitud y Longitud salen de Google Maps y hay que revisarlas. Fecha de recepción, origen e identificador del envío quedan en una nota sobre el Nombre.
  - La prueba del 10/11 que llegó con columnas corridas pasó por el Apps Script anterior, que sigue activo hasta que se conecte el nuevo y escribe en orden fijo.
  - Las fotos de Comunidad van a la carpeta "Mapa Vintage — Hallazgos" de Drive y a la hoja **Hallazgos**. Con Estado = Publicado aparecen en el muro, en unos cinco minutos.
  - El sitio confirma la recepción solo cuando el receptor responde con el identificador del envío.
  - La foto se reduce en el navegador (JPEG, 1600 px) y pierde la ubicación del archivo.
- Mientras `CONFIG.aportes.endpoint` esté vacío, las propuestas siguen por los formularios anteriores y las fotos no se envían.
- **Formulario:**
  - Se quitaron "Qué prendas predominan" y "Rango de precios".
  - Se agregó "Local de segunda mano" al tipo de espacio.
- **Se retiraron** el receptor de fotos en Cloudflare, el receptor con Turnstile (ninguno estaba desplegado) y sus permisos en la política de seguridad de `netlify.toml`.

## Verificación
- `npm test`: 51/51.
  - `core`: 35, incluye etiquetas y el texto de WhatsApp.
  - `aportes`: 16, el receptor con servicios simulados.
- **Navegador (Edge sin interfaz):** 37/37 comprobaciones en escritorio y teléfono.
  - Con el receptor simulado: local, feria, foto y muro.
  - Sin envíos reales a Google y sin errores de consola.

## Receptor conectado y "Correcciones v2" (11 y 12/11)
- **Receptor:** instalado y conectado en `CONFIG.aportes.endpoint`. La planilla de la Agenda está cargada en `AGENDA` (`Code.gs`). Locales y ferias llegan bien a sus hojas Aportes (confirmado por Tommy).
- **Muro de Comunidad:**
  - La Polaroid se veía como una tira angosta sin foto. Las flechas ocultas salían de la grilla del carrusel (por la regla general `[hidden]{display:none!important}`) y el muro caía en la columna de 44 px de la flecha. Ahora cada parte tiene su columna fija.
  - Al frente se ve la foto con el nombre y la red social; al tocar la Polaroid (o "Leer su historia") se da vuelta y el dorso, del mismo tamaño, muestra la historia completa. "Ver la foto" la vuelve al frente.
  - Las Polaroids quedan centradas aunque haya menos que lugares.
- **Mapa (escritorio):** llega hasta el borde de abajo, a la altura de la lista con su paginación.
- **Armá tu recorrido (escritorio):** el sticker del teléfono es más chico y queda por encima de la línea del título.
- **Teléfono:**
  - Portada con zoom ×1,35 desde abajo: el Obelisco se ve más grande y más cerca del centro. No puede subir más sin más zoom, porque en la foto solo queda la calle debajo de él.
  - El ícono de Instagram del pie queda centrado en la pantalla.
  - El mapa ocupa el 68% del alto de la pantalla (entre 380 y 640 px), en vez de 380 px fijos; el resto queda libre para deslizar la página.
- **Verificación:** `npm test` 51/51; navegador 40/40 (se sumaron tres comprobaciones de la Polaroid). Las pruebas del navegador simulan el receptor y cortan cualquier envío al real.
