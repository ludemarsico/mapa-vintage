# Registro de sesión — 18 de noviembre de 2026

Rama: `modificaciones-tommy`. Sin push.

## Agenda: Próximos eventos y Ferias habituales
- Un selector, con el mismo estilo que Mapa / Lista, alterna entre las dos pestañas. Se ve en escritorio y en el teléfono, debajo del gancho.
- **Próximos eventos:** hoja **Agenda**, como hasta ahora. Muestra solo las fechas de hoy en adelante.
- **Ferias habituales:** hoja **Habituales** de la misma planilla, con las mismas columnas.
  - En Días va el texto tal como se muestra ("Sábados, domingos y feriados", "El primer viernes de cada mes").
  - Se publican todas las filas, en el orden de la hoja. La columna de Días es más ancha y su letra, más chica.
- Cada pestaña tiene su paginación y su mensaje cuando está vacía.
- **Conectada (18/11):** la planilla Agenda se volvió a publicar, con las hojas Agenda (`gid=0`) y Habituales (`gid=983594457`) y la vuelta a publicar automática.
  - Google le dio un enlace nuevo (`2PACX-1vRbB4…`). `sources.agenda` y `sources.habituales` apuntan a él.
  - Se comprobó en el navegador con los datos reales, en escritorio y en el teléfono: Próximos muestra 3 fechas del 21/11 y Habituales, 2 ferias con "Sábados y Domingos".
  - En la hoja Agenda, "Feria Parque los Andes" del 21/11 está cargada dos veces, así que se ve repetida.

## Armá tu recorrido
- Es independiente de los filtros del mapa: parte de todos los locales y usa solo sus preferencias (¿Qué buscás?, barrio y tiempo).
- Se quitó el aviso "Usamos los N locales que muestra el mapa".
- Filtrar el mapa no cambia el recorrido, y armar un recorrido no cambia el mapa.

## Registros que no aparecían
- El sitio lee la versión **publicada en la web** de cada hoja, no la planilla en sí.
- **Directorio:** la versión publicada que se consultó hoy tiene 61 locales (ID 1 a 61). El sitio muestra los 61 y no descarta ninguno, así que los locales nuevos no están en esa versión.
- **Agenda:** la versión publicada tiene fechas hasta el 15/11/2026, que hoy ya pasaron, por eso no se ve ninguna.
- Causa probable: la publicación no tiene activado "Volver a publicar automáticamente cuando se realicen cambios". Cómo revisarlo: `DATOS.md`.
- La hoja **Aportes** del Directorio aparece publicada en la web junto con Directorio. Tiene datos de quienes proponen locales y conviene dejar de publicarla.
- **Resuelto en el Directorio (18/11):** se volvió a publicar solo la hoja Directorio, con "Volver a publicar automáticamente" activado.
  - Google le dio un enlace nuevo (`2PACX-1vSsAoe…`, `gid=0`) con los 63 locales. El enlace viejo sigue respondiendo, pero con la copia de 61.
  - `sources.locales` en `config.js` y `DATOS.md` apuntan ahora al enlace nuevo. Se comprobó en el navegador: 63 locales.

## Portada
- "Sumá tu espacio" pasó de debajo de "Armá tu recorrido" a la portada, con el mismo estilo que "Ver mapa".
  - En escritorio va al lado de "Ver mapa"; en el teléfono, debajo.
- Debajo de la portada queda solo "Armá tu recorrido".
- **Cambio del 19/11:** se deshizo. Ver "Botones de la sección Mapa".

## Botones de la sección Mapa (19/11)
- "Sumá tu espacio" vuelve al lado de "Armá tu recorrido", en escritorio y en el teléfono.
- Se sacó el "Sumá tu espacio" de la portada. La portada vuelve a tener solo "Ver mapa", con el mismo lugar y tamaño que antes.
- Los dos son blancos y del mismo ancho. Al pasar el mouse, o al tocarlos en el teléfono, "Armá tu recorrido" pasa a azul y "Sumá tu espacio" a rosa.
- En escritorio quedan en la misma línea que "Encontrá locales a la calle…", centrados a su altura.
  - En pantallas medianas, desde unos 980 px de ancho hacia abajo, pasan debajo de la leyenda.
  - En el teléfono la leyenda no se muestra y los botones quedan uno al lado del otro.

## Pie
- El logo ya no se superpone con el collage: quedan muy cerca, sin tocarse.
  - La separación se midió sobre la transparencia de las dos imágenes.
  - El conjunto mantiene el tamaño del collage.

## Archivos viejos guardados en el navegador
- **Qué pasó:** en la primera revisión, el navegador mostró la página nueva con los estilos y el código anteriores. Seguía teniendo guardados `identidad.css`, `app.js` y `editorial.js`, porque el servidor no indica cuándo volver a pedirlos.
- **Cómo se vio:**
  - "Sumá tu espacio" tapaba "Ver mapa".
  - El selector de la Agenda no aparecía en escritorio y no respondía en el teléfono.
  - El gancho tapaba el selector.
  - El logo seguía encimado y el recorrido seguía atado al mapa.
- Se reprodujo cargando la página nueva con esos archivos viejos.
- **Solución:** todas las referencias a CSS y JS propios llevan el mismo número de versión, en el HTML y en los `import` entre módulos.
  - Con un número nuevo, el navegador está obligado a pedir los archivos nuevos y no puede mezclar versiones.
  - El número lo pone `npm run version` (`scripts/version.mjs`), después de cambiar CSS o JS.
  - Una prueba falla si alguna referencia queda sin número o con otro número.
- En `netlify.toml`, la página se revisa en cada visita (`Cache-Control: no-cache`).

## Verificación
- `npm test`: 54/54.
  - `core`: 38. Se sumaron Ferias habituales, la independencia del recorrido y la versión única de CSS y JS.
  - `aportes`: 16.
- **Navegador (Edge sin interfaz, escritorio y teléfono):** 31 de 33 comprobaciones bien, con la Agenda y Habituales simulados. Las otras dos son la de errores de consola, en escritorio y en teléfono.
  - Portada: botones iguales, al lado o debajo según el ancho.
  - Recorrido: no cambia con el filtro del mapa.
  - Selector de la Agenda: visible y sin chocar con el gancho ni con la lista. Días se ve como texto.
  - Sin desplazamiento horizontal.
  - Errores de consola: solo uno, el pedido al receptor real, que la prueba corta a propósito.
