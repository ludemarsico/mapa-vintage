# Segunda pasada de diseño e integración

17 de octubre de 2026. Continuación de la versión existente, en `reconstruccion-mapa-vintage`. No se reconstruyó el sitio ni se modificaron los HTML anteriores de la raíz del repositorio.

## Accesos

- Versión real: la raíz del mismo Site privado de revisión.
- Composiciones de prueba: `demostracion.html#agenda`.
- La demostración está desactivada en `index.html`; ni siquiera `?demo=1` la activa. Se entra por el enlace del footer o por la URL separada.

## Cambios

- Presentación más compacta, con título y explicación breve. El mapa empieza aproximadamente a los 406 px en un ancho móvil de 390 px, frente a unos 480 px de la versión anterior, y tiene unos 447 px de alto en una ventana de 844 px. En escritorio, empieza cerca de los 335 px.
- Composición distinta por sección: recorrido desplazado y fotografía ancha; agenda como franja/cartelera; glosario con introducción lateral y carpetas; cuidados con introducción editorial y muestrario; muro centrado y collage; proyecto con foto y recorte; aportes en dos alturas.
- Agenda, muro y notas sin publicaciones usan espacios compactos y conservan íntegros sus mensajes.
- El abanico ahora tiene una única muestra activa al frente. La muestra, el control, el nombre y el texto cambian juntos, también mediante flechas, Inicio/Fin y anterior/siguiente. Los nombres de muestras inactivas no compiten visualmente con el seleccionado. La arandela comparte el punto de giro.
- Las carpetas del glosario tienen pestañas rotuladas, estado activo, panel asociado y navegación por flechas/Inicio/Fin. Se retiraron los rectángulos vacíos. Se mantienen las cinco definiciones completas y su respaldo nativo.
- Los papeles de notas pueden traerse al frente con pestañas, anterior/siguiente o teclado. Solo el activo recibe foco y su contenido queda completo; atrás se ven capas de papel. La alternativa en lista conserva todas las notas.
- El papel de contacto es un desplegable nativo: se abre al entrar en pantalla, y puede plegarse/desplegarse por clic, toque y teclado. El enlace Escribime queda dentro del papel abierto. Movimiento reducido mantiene la interacción sin animación.
- Se reutilizaron la fotografía de calle, el perchero y los recortes disponibles del manual. El acceso de calzado usa el recorte de botas. La campera con flecos se usa como recurso editorial, sin llamarla denim ni inferir su fibra. Los clips pequeños se construyen con CSS, no son la lámina de misceláneas ausente.

## Demostración aislada

Todos los ejemplos se rotulan **Contenido de demostración**. Son etiquetas como Afiche A/B/C, Composición A/B/C y Papel A/B/C; no se inventan fechas de eventos, comercios, personas, testimonios ni notas atribuidas a Lucia. Las imágenes son recursos identificados del manual, no publicaciones de usuarios.

La demostración no consulta las tres fuentes editoriales ni las escribe. El mapa conserva su lectura normal de locales reales. El formulario tiene `action=about:blank`, botón desactivado y bloqueo del evento de envío. No usa el Apps Script. La versión normal conserva el contrato original sin cambios.

Si se modifica el contenido fijo de `index.html`, ejecutar `node scripts/build-demo.mjs` para actualizar la página separada. Las dos páginas usan los mismos módulos y estilos; no hay un segundo mapa ni lógica de recorridos duplicada.

## Logo y recursos pendientes

El archivo `MAPA (7).jpg` no está disponible como archivo ni tiene identificador descargable en este entorno. Solo es visible en el historial de imágenes de la conversación. Por ello **no se afirma que el logo elegido haya sido integrado** y no se redibujó ni generó un reemplazo. La configuración `logo` ahora conecta el mismo recurso con encabezado y footer, manteniendo proporciones, tamaño legible y alternativa ante fallo. Falta incorporar el binario original y su recorte fiel.

También siguen sin archivo descargable las ocho imágenes visibles del mensaje anterior:

1. Foto de Corrientes, teatros y ciclista.
2. Cardigan rojo con flores.
3. Foto de selección de ropa entre perchas.
4. Chaleco a rayas, con la leyenda DRAWING DIARY.
5. Vestido blanco de lunares rojos.
6. Campera oscura ilustrada.
7. Camisa/campera azul ilustrada.
8. Referencia de carpetas de colores.

Se necesita volver a adjuntar esos nueve archivos (logo más ocho imágenes) como documentos o dentro de un ZIP. Las láminas de clips, galletitas y demás fotos porteñas citadas en el anexo C tampoco están disponibles como archivos. El detalle por nombre está en `ASSETS.md`; no se presentan como incorporadas.

Los accesos de plisados, tapados, ropa interior y trajes de baño siguen siendo tipográficos hasta recibir imágenes adecuadas. No se usa una prenda de composición desconocida como si correspondiera a otra categoría. `CONFIG.careImages` permite añadir la ruta de cada pieza comprobada sin cambiar los textos.

## Verificación

Se volvieron a ejecutar las 28 pruebas de lógica, incluyendo coincidencia literal de los 13 cuidados y cinco definiciones. Pasaron 41 comprobaciones de regresión y 59 de interacciones nuevas (100 de navegador en esa tanda), más 20 de estructuras editoriales con respuestas de prueba aisladas y 3 del papel de contacto: 123 comprobaciones de navegador en total.

Se comprobó 360/390/768/1440 px, clic, teclado, toque emulado, movimiento reducido, ausencia de desbordamiento horizontal general, filtros, mapa/lista, paginación, recorrido por preferencias, quitar paradas, URL reconstruible, Google Maps, WhatsApp y contrato del formulario. El único POST de prueba de la regresión fue interceptado localmente antes de la red; en demostración hubo cero POST. Se verificó que los borradores, notas pendientes y eventos vencidos siguen excluidos.

Los JSON de esta revisión conservan el detalle de cada comprobación. El navegador se probó con el mismo CSV real ya descargado y teselas reales leídas mediante un cliente que confía en la CA del entorno; continúa la limitación TLS del navegador descrita en `VERIFICACION.md`. No se desactivó TLS, no se enviaron pruebas a producción y no se verificó persistencia real del Apps Script. No se usó un teléfono físico ni se probó Safari/iOS.

La lectura directa desde un navegador normal y las tres URLs de agenda/notas/muro siguen pendientes de configuración/revisión. Las estimaciones peatonales conservan su método y advertencia.
