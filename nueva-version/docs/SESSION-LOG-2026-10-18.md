# Mapa Vintage — Registro de sesión

Fecha de cierre: **18 de octubre de 2026, Buenos Aires**.

Este registro describe el estado vigente y las decisiones para retomar. El registro del 17/10 es histórico: sus pendientes de logo, menú y otros detalles no deben aplicarse nuevamente a la versión actual.

## Dónde continuar

- Repositorio: https://github.com/ludemarsico/mapa-vintage
- Rama: **`reconstruccion-mapa-vintage`**.
- Carpeta del sitio: **`nueva-version/`**.
- Último commit funcional antes de este registro: **`ababeb2a095d5bcb469b318bc8735b4592c5a640`**.
- Revisión privada: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site
- Acceso al mapa: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site/#mapa-seccion
- ZIP para una futura publicación manual: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site/descargas/mapa-vintage-netlify.zip
- ZIP con el código de revisión: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site/descargas/mapa-vintage-revision.zip
- Stickers adicionales sin usar: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site/descargas/mapa-vintage-stickers-adicionales.zip

La revisión de Sites es privada y no es Netlify. GitHub guarda los archivos y su historial. El ZIP preparado no implica una publicación en el dominio público. Estos enlaces privados requieren acceso de la propietaria.

La última publicación privada confirmada corresponde al commit funcional indicado. Despliegue: `appgdep_6ad57fd2df488191beb3526bce3ad33a`. Este nuevo registro sólo añade documentación a GitHub; no cambia ni publica el sitio.

## Forma de trabajo acordada

- Continuar sobre lo existente, sin reconstruir.
- Hacer cambios quirúrgicos: modificar únicamente lo pedido y conservar las funcionalidades y los textos restantes.
- Guardar los cambios funcionales en la misma rama y actualizar la misma revisión privada.
- **No hacer merge a `main`, no publicar en Netlify ni activar publicaciones automáticas sin un pedido explícito.**
- No hacer envíos de prueba al formulario o a Google Sheets de producción.
- No generar imágenes nuevas para sustituir los recursos aportados.

## Estado de diseño que se conserva

- Tipografía: **Syne en títulos + Jost en lectura y controles**.
- Encabezado: menú hamburguesa a la izquierda y logo original centrado, también en mobile. No reemplazarlo por texto.
- Fondo tramado del manual detrás del contenido; conserva la separación adicional entre encabezado y primer título.
- Glosario con cinco papeles en `assets/papeles/` y pestañas funcionales.
- Stickers originales organizados en `assets/stickers/`; no volver a colocar la bota y la campera que se habían quitado.
- “Detrás del mapa” conserva el fondo oliva oscuro y la fotografía en color con marco blanco.
- El muestrario de ocho telas pasa de a una. No lleva argolla ni instrucciones visibles. Conserva nombres, anterior/siguiente, contador, teclado y movimiento reducido.
- Los **13 textos completos de cuidados** se conservan.

## Prendas y piezas y recordatorio

1. Las cinco imágenes originales aportadas se organizaron en `assets/cuidados/` sin modificar sus archivos (`a5de7cf`).
2. Después se integraron, a pedido, en “Prendas y piezas” (`8de10f5`): texto a la izquierda, figurines a la derecha y selección mediante las prendas con sus nombres visibles. En mobile la composición se adapta a una columna.
3. Se quitaron los controles inferiores de anterior/contador/siguiente **sólo de Prendas y piezas** (`975b7b0`). El muestrario de telas conserva sus propios controles.
4. El recorte de la mujer leyendo el diario, `assets/stickers/emoji_descubrir.png`, acompaña el aviso: “Antes de lavar, revisá siempre la etiqueta de cuidado y la composición de la prenda.”
5. Se corrigió una omisión de entrega: el CSS estaba en la revisión pero faltaba copiar el PNG del recorte a los archivos publicados. El recurso original ya quedó incluido en la revisión privada y en los ZIP. Al activar recursos previamente sin usar, comprobar el archivo real en la entrega, no sólo su referencia en CSS.

## Mapa: decisión final

**Se conserva el fondo original de OpenStreetMap en Leaflet.**

Se preparó una prueba de Stamen Toner por enlace (`c4421cf`), pero la usuaria decidió conservar el mapa original. La prueba y sus instrucciones se retiraron (`8f56bc0`). No reactivar Toner ni pedir configurar Stadia para continuar. El sitio actual no necesita esa conexión.

Los pines se personalizaron con la etiqueta del favicon. La primera versión con recuadro amarillo se ajustó para dejar sólo el isotipo:

- Pin normal: `assets/miscelaneas/pin-etiqueta.svg`, interior amarillo `#F0D97A` y contorno negro.
- Pin seleccionado: `assets/miscelaneas/pin-etiqueta-rosa.svg`, interior rosa `#ECB3A6`, con la misma forma y sin recuadro.
- Al seleccionar otro local, el anterior vuelve a amarillo. El área interactiva mide 44 × 44 px, aunque el dibujo es más pequeño.
- El archivo del favicon original, `assets/miscelaneas/etiqueta.svg`, se conserva.
- La decisión final es **mostrar una viñeta compacta tanto en desktop como en mobile**. Se había probado quitarla en desktop, pero esa decisión fue reemplazada por el pedido posterior.
- La viñeta muestra nombre, dirección y “Ver ficha”. El título mide 16 px; “Ver ficha” queda subrayado y sin botón con recuadro. El ancho máximo de su contenido es 220 px.
- “Ver ficha” conserva la selección y abre/muestra la ficha correspondiente en la lista.
- Se conserva la atribución de OpenStreetMap.

Archivos de esta interacción: `js/map.js`, estilos específicos de los marcadores y `.store-map-popup` en `css/site.css`, y los dos SVG de los pines. Último cambio funcional: **`ababeb2`**.

## Comprobaciones realizadas al cerrar los cambios

- Navegador a 1440 y 390 px: selección por clic, toque y teclado; un único pin rosa y los demás amarillos; correspondencia entre pin, viñeta y ficha.
- Viñetas compactas en ambos tamaños y enlace “Ver ficha” funcional.
- Filtros y restauración de recorridos desde sus enlaces compartidos; se mantuvieron las comprobaciones de paginación durante las pasadas de los pines.
- Sin desbordamiento horizontal ni errores JavaScript en las comprobaciones finales.
- Revisión visual sobre teselas reales de OpenStreetMap y verificaciones funcionales con datos CSV de lectura reproducidos localmente. Parte de las pruebas de interacción usó teselas simuladas; no representan una comprobación del servicio externo.
- Sintaxis de JavaScript y `git diff --check` correctos. No se repitió toda la batería histórica por estos ajustes acotados.
- Se verificó que los archivos nuevos de los pines y el código correspondiente estuvieran realmente en la entrega y en los ZIP.
- No se hicieron envíos de formularios a producción ni publicaciones en Netlify.

## Créditos y publicaciones en Netlify

La usuaria informó **285 créditos disponibles, con vencimiento el 09/11/2026**. Es un saldo informado por ella; no se accedió a su facturación.

En los planes actuales por créditos, publicar desde GitHub no evita el costo de una publicación en producción. Se acordó:

1. Trabajar y guardar los cambios en GitHub durante la semana.
2. Revisar en la vista privada de Sites, fuera de Netlify.
3. Agrupar los cambios aprobados y publicar manualmente una vez por semana, preferentemente el jueves, para llevar avances a clase el viernes.

| Publicación sugerida | Clase |
| --- | --- |
| Jueves 22/10 | Viernes 23/10 |
| Jueves 29/10 | Viernes 30/10 |
| Jueves 05/11 | Viernes 06/11 |

Tres publicaciones representan 45 créditos a la tarifa consultada. De 285 quedarían 240 **antes de descontar tráfico y otros consumos**. No se configuró integración automática de GitHub con Netlify. La usuaria había realizado una publicación manual anterior; no asumir que el dominio público ya refleja la última revisión privada.

Tarifas consultadas: producción 15 créditos por publicación; transferencia 20 créditos/GB; solicitudes web 2 créditos por cada 10.000. Las vistas previas y publicaciones de rama tienen costo de despliegue cero, pero su tráfico también puede consumir créditos.

Fuente: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/

## Medición del peso del sitio

Se midió **localmente la revisión actual**, en un navegador con caché vacía, a 1440 y 390 px. No es una lectura de las estadísticas del sitio público ni una medición de facturación de Netlify.

| Recorrido | Solicitudes a los archivos del sitio | Peso sin comprimir | Estimación con gzip en archivos de texto |
| --- | ---: | ---: | ---: |
| Pantalla inicial | 39 | 3,76 MB | 3,53 MB |
| Recorrer todas las secciones | 53 | 14,33 MB | 14,10 MB |

La estimación incluye los recursos realmente solicitados al sitio, no todos los archivos guardados en el repositorio. No incluye las teselas de OpenStreetMap ni la lectura directa desde Google Sheets, porque se solicitan a sus respectivos proveedores, no a Netlify. No se descargaron los ZIP en esta simulación de una visita normal.

Con esas cantidades y las tarifas consultadas, 100 visitas nuevas a la pantalla inicial consumirían aproximadamente **8 créditos**; 100 recorridos completos, aproximadamente **29 créditos**. La compresión real del alojamiento, la caché, las secciones visitadas y el tráfico real cambian el resultado. El consumo efectivo debe consultarse en el panel de uso de Netlify.

## Próximo tema: reducir el peso de los figurines

La usuaria pidió dejar este tema anotado para la próxima sesión. **Todavía no se optimizaron las imágenes.** Las cinco originales suman **8.810.519 bytes, aproximadamente 8,81 MB**:

| Archivo en `assets/cuidados/` | Peso aproximado |
| --- | ---: |
| `Falda dorada plisada para muñeca de papel.png` | 2,14 MB |
| `Abrigo recortable de cuadros turquesa.png` | 1,91 MB |
| `Recortable vintage de lencería azul.png` | 1,82 MB |
| `Botines verde oliva con pestañas de papel.png` | 1,79 MB |
| `Bikini vintage con pestañas de papel.png` | 1,15 MB |

Propuesta para evaluar, manteniendo el trabajo quirúrgico:

1. Conservar los cinco PNG originales sin sobrescribirlos ni eliminarlos.
2. Preparar copias para web en **WebP con transparencia**, a una resolución acorde al tamaño real en que se muestran, contemplando pantallas de densidad 2x.
3. Comparar calidad visual, especialmente contornos, transparencias y pestañas de papel. Ajustar dimensiones y compresión antes de adoptar las copias. Como objetivo inicial, evaluar 150–300 KB por figurín si la calidad lo permite; no es un peso final garantizado.
4. Cambiar únicamente las rutas de esos cinco recursos en `CONFIG.careImages` (`js/config.js`) y comprobar su admisión en `safeImage` (`js/data.js`). WebP ya está admitido; no modificar esa función sin necesidad.
5. Conservar nombres visibles, disposición, selecciones y todos los textos de cuidados. No regenerar ni redibujar las prendas.
6. Repetir la medición de la pantalla inicial y del recorrido completo para informar el ahorro real. Verificar desktop y mobile, y que las copias estén en los archivos publicados y en los ZIP.
7. Actualizar la misma rama y revisión privada si la usuaria pide avanzar con esta optimización. Mantener Netlify sin publicar hasta que lo solicite.

Esta reducción podría mejorar tanto la descarga como el consumo de transferencia. No hace falta reducir el peso de todos los archivos originales de GitHub para lograrlo: importa cuáles se sirven a los visitantes.

## Otros pendientes que no se deben activar por iniciativa propia

- La recepción de fotos de Comunidad sigue pendiente de una conexión independiente; no enviarlas al Apps Script de locales ni simular un envío exitoso.
- Las fuentes de publicaciones de Agenda, Muro y Notas siguen pendientes de configuración. La demostración permanece separada y no escribe en Google Sheets.
- El contacto conserva la pieza estática “Escribime”. La animación de papel que se desabolla quedó pendiente de una referencia concreta.

## Texto para retomar mañana

> Retomemos Mapa Vintage desde https://github.com/ludemarsico/mapa-vintage, rama `reconstruccion-mapa-vintage`, carpeta `nueva-version`. Leé `nueva-version/docs/SESSION-LOG-2026-10-18.md` y continuá desde el estado existente. El último cambio funcional es `ababeb2`: mapa original, isotipos amarillos sin recuadro, pin seleccionado rosa y viñeta compacta en desktop y mobile. Conservá Syne + Jost, el muestrario sin argolla y los 13 cuidados completos. Modificá sólo lo que te pida y actualizá la misma rama y la revisión privada https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site. No publiques en Netlify, no actives publicaciones automáticas, no hagas merge a main ni envíes pruebas a producción. Primero revisemos cómo reducir el peso de los cinco figurines, conservando los PNG originales y su aspecto.

Si el entorno previo ya no está disponible, recuperar esta rama desde GitHub. No depender de una ruta interna de la sesión anterior.
