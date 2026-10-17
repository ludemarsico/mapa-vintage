# Revisión de participación y cuidados

## Qué cambió

- Comunidad usa una misma superficie editorial con invitación “Compartí tu hallazgo”, foto con vista previa local, texto, alias y red opcional. Se retiraron el desplegable y el enlace de envío por correo de esa sección. Los aportes se revisan antes de publicar.
- El receptor de fotos tiene implementación y pruebas independientes. La conexión real está vacía, el botón queda deshabilitado y el mensaje explica que nada se enviará. Nunca se usa el Apps Script de locales para esta foto.
- “Proponer una feria o evento” abre el diálogo en Agenda, precarga el valor original `Feria colectiva` y muestra fecha/horario. No cambia el ancla ni desplaza al pie. Al cerrar se devuelve foco y posición. Los seis nombres de campo y el POST original se conservan; el contexto viaja en `descripcion`.
- Cuidados tiene un solo muestrario principal. Se retiró la grilla duplicada. Quedan nombres accesibles, flechas/Inicio/Fin, anterior/siguiente, contador y las 13 entradas completas.
- Se reservó margen para esquinas y sombras del abanico durante todo el giro, con medidas distintas en celular; el contenedor ya no recorta arriba. La muestra activa, nombre y texto siguen sincronizados.
- El contacto ahora es una pieza estática con Escribime. No hay desplegable, rotación ni animación de entrada. El efecto de papel que se desabolla queda expresamente pendiente de una referencia concreta.

## Recursos y referencia que no se pudieron leer

No aparece `MAPA (7).jpg` entre los archivos descargables de la sesión. Se comprobó la carpeta de adjuntos y los recursos compartidos. Tampoco está la captura de Jaula Pájaro como archivo. La URL `https://jaulapajaro.netlify.app/registro-poetico/#mandar` devolvió error de acceso en la herramienta de lectura.

No se afirma haber inspeccionado la captura ni copiado la composición del sitio. Se aplicó el criterio descrito por la usuaria: invitación y campos integrados en una misma superficie, conservando la paleta y tipografías de Mapa Vintage.

La marca tipográfica alternativa se retiró del encabezado y footer. Hasta recibir el JPG, el encabezado tiene un enlace de navegación “Inicio”; no se presenta como un logo de reemplazo. El archivo del logo sigue pendiente de volver a adjuntar como documento o dentro de un ZIP. Los recursos reales del manual que ya eran accesibles se conservan. No se generaron imágenes nuevas.

## Qué funciona y qué requiere configuración

Mapa, filtros, lista, paginación y recorridos conservan su lógica. Agenda abre el formulario compatible. La vista previa de foto y edición del aporte funcionan localmente. El contacto estático abre el correo.

Para recibir fotos de verdad hay que configurar y desplegar el receptor separado y completar URL/site key en `CONFIG.hallazgos`. Los pasos están en `RECEPCION-DE-HALLAZGOS.md`. No se aprovisionaron recursos ni se publicó ese receptor. Agenda/notas/muro siguen esperando sus fuentes reales de Sheets; la demostración continúa separada, rotulada y sin envíos.

Las pruebas del receptor usan almacenamiento simulado. No comprueban una carga real a Cloudflare. Las pruebas de formularios en navegador interceptan solicitudes antes de la red; no mandan pruebas a producción. El detalle de comprobaciones y capturas queda en los informes `v3-*`.

## Resultado de la verificación

45 pruebas de lógica aprobadas: 28 de datos/recorridos/contenidos y 17 del contrato de recepción de fotos. En navegador pasaron 41 comprobaciones de regresión y 194 de participación, giro y controles: 235 comprobaciones en total. La mayoría de las comprobaciones adicionales verifican los límites de cada muestra en varios momentos del giro y cuatro anchos de pantalla; no son envíos reales.

Se probaron 360, 390, 768 y 1440 px, teclado, toque emulado y movimiento reducido. Ningún envío llegó a producción: el POST del formulario anterior y las respuestas del receptor de imágenes se interceptaron antes de la red. No se probó un teléfono físico ni una carga real entre Cloudflare, R2 y D1. Continúa la limitación de certificados del navegador del entorno descrita en VERIFICACION.md; se usó el CSV real descargado como respuesta de lectura y teselas reales mediante el cliente de pruebas.
