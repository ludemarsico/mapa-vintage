# Verificación de la versión de revisión

Fecha: 17 de octubre de 2026, Buenos Aires. Sin publicación, merge ni sustitución del sitio anterior.

## Datos reales y alcance

Se descargó la URL CSV original mediante una consulta GET con verificación TLS. Se comprobaron sus 12 encabezados y 29 filas. La normalización dejó 21 locales y 8 registros para revisión. No se escribieron datos ni se enviaron propuestas a producción. No se realizó verificación presencial de los comercios ni de sus horarios.

El Chromium disponible no confía en el certificado del proxy del entorno. La prueba directa mostró `ERR_CERT_AUTHORITY_INVALID` tanto en Sheets como en teselas. No se desactivó la verificación TLS. Para la revisión funcional del navegador, se interceptó la lectura de Sheets y se entregó el mismo CSV real descargado. Las teselas reales se leyeron con el cliente HTTP de Playwright, que sí usa la CA configurada, y se entregaron al navegador. Las capturas muestran datos reales y cartografía real; no son comercios ni un mapa simulados.

Esto comprueba interfaz, esquema y lógica, pero **no verifica una lectura directa de Sheets desde un navegador fuera de este entorno**. La URL y el patrón de lectura se conservaron. Antes de aprobar la publicación, abrir la versión en un navegador normal con Internet y comprobar esa lectura directa.

## Pruebas de lógica

28 casos aprobados (`npm test`):

- CSV con tildes, BOM, comas/comillas, CRLF y párrafos; errores de formato.
- Normalización de prendas, precios faltantes, arrobas explícitas, IDs y duplicados.
- Exclusión de showrooms, online y cita previa; revisión de casos ambiguos.
- Coordenadas válidas/inválidas y filtros AND/OR.
- URLs e imágenes inseguras.
- Recorridos con preferencias, proximidad, presupuesto, reemplazos, eliminación y URL reconstruible.
- Fecha de Buenos Aires, fechas inexistentes y eventos vencidos/recurrentes.
- Prefijo de origen y detalles de evento dentro de `descripcion`.
- Coincidencia literal de los 13 cuidados y las cinco definiciones con el megaprompt.

## Navegador Chromium

Primera tanda: 41 comprobaciones aprobadas. Segunda tanda editorial: 20 comprobaciones aprobadas. Revisión final adicional: 19 comprobaciones aprobadas (80 en navegador en total), incluyendo controles vinculados, lectura de los 13 cuidados en la interfaz, reemplazos de ruta, WhatsApp, respaldo sin JS, abanico y capturas finales. Los informes JSON quedan junto a este documento.

Se verificó:

- Escritorio y anchos 360, 390, 768 y 1440 px sin desbordamiento horizontal general. Captura móvil final de 390 × 844.
- Lectura a 720 px como ancho equivalente al diseño de 1440 px con zoom 200%. **No se accionó el zoom de la interfaz del navegador al 200%**; ese gesto exacto queda para revisión manual.
- Mapa protagonista en la primera pantalla móvil, alternancia Mapa/Lista, invalidación de tamaño, filtros activos, búsqueda, cero coincidencias y paginación de seis fichas.
- Ficha selecciona punto; punto accesible por teclado selecciona ficha y página. No se filtraron marcadores por la página de lista.
- Recorridos con paradas reales, quitar/reemplazar, recálculo, Google Maps, WhatsApp y restauración por URL.
- Ocho materiales y cinco prendas; textos completos accesibles en la interfaz; controles anterior/siguiente; abanico con punto de giro común y movimiento reducido.
- Cinco definiciones, apertura nativa por teclado; textos de respaldo de cuidados disponibles sin JS.
- Menú con nombre accesible, Escape y devolución de foco; Tab en navegación móvil; diálogos con Escape y retorno al control que los abrió.
- Pausa de marquesina y `prefers-reduced-motion`.
- Agenda sin vencidos ni borradores; muro solo aprobado; notas con saltos de párrafo, URL directa, Atrás, cierre y alternativa en lista.
- Texto malicioso de prueba tratado como texto, enlaces javascript omitidos, sin errores JavaScript en las tandas exitosas.
- Error CSV sin datos ficticios y reintento que recupera la lectura.

## Formulario

Se completó una propuesta ficticia **solo dentro de la prueba interceptada**. Playwright respondió localmente antes de cualquier envío al servidor; no se creó una fila en la planilla.

Se verificaron los seis campos originales, los valores de tipología, el prefijo de origen/evento, un único envío mientras está en curso, conservación de datos y el mensaje honesto de recepción no confirmada. No se probó persistencia real en Apps Script. El código del receptor no está disponible y el iframe no certifica guardado.

## Contenido ficticio de las pruebas

Los datos de agenda, notas y muro usados para probar sus plantillas existieron únicamente en respuestas interceptadas de una sesión de prueba. No aparecen en los CSV entregables ni en la configuración ni en las capturas. En el sitio final esas tres conexiones siguen vacías y muestran sus estados vacíos honestos.

## Límites y revisión pendiente

- Logo y nuevas fotografías: visibles en el chat, pero sin archivo descargable para integrarlos fielmente. Ver `ASSETS.md`. No se recreó el logo.
- No hay URLs de Agenda/Notas/Muro; crearlas con las plantillas y seguir `MANTENIMIENTO.md`.
- No hay un motor de rutas peatonales ni validación de apertura en tiempo real; tiempos y distancias son aproximaciones declaradas.
- No se verificó guardado de propuestas en producción ni carga directa de fotos, que no está implementada.
- No se probó en un teléfono físico, Safari/iOS ni con lector de pantalla. Se verificaron controles y semántica por teclado en Chromium.
- No hay una URL pública de vista previa: se entregan archivos, capturas y servidor local. No se registró ni publicó un Site.

## Qué revisar antes de aprobar una publicación futura

Abrir localmente en un navegador normal, integrar los archivos del logo/fotos, verificar los ocho registros apartados, completar prendas concretas si corresponde, conectar las tres pestañas si ya hay contenido y revisar las primeras propuestas reales sin usar pruebas en producción.
