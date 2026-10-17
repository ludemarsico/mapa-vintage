# MAPA VINTAGE — PROMPT MAESTRO PARA CODEX

## 1. Encargo y prioridades

Actuá como desarrollador frontend senior, diseñador de producto y especialista en interfaces accesibles. Construí una nueva versión completa de Mapa Vintage, una guía para encontrar locales a la calle de ropa vintage y segunda mano en Buenos Aires y organizar paseos para visitarlos. El alcance inicial del directorio es CABA.

El resultado debe permitir entender la propuesta y usar el mapa desde los primeros segundos. El mapa es el producto principal. El sitio debe sentirse intuitivo, editorial, luminoso, urbano y personal, con detalles porteños y movimiento con intención. Público amplio por edad, residentes y visitantes de América Latina. Todo en español, con voseo rioplatense.

Esta es una reconstrucción de la interfaz, con libertad para mejorar jerarquía, composición y navegación. Conservá las integraciones existentes de Google Sheets y recepción de formularios. Trabajá en una carpeta nueva, conservá los originales y no publiques ni reemplaces el sitio de producción. Entregá una versión completa para revisar.

Prioridades en este orden: utilidad del mapa; integridad de datos y formularios; navegación y lectura en celular; identidad visual; animaciones.

## 2. Archivos y autoridad de las instrucciones

Leé antes de implementar:
- `mapavintage-etapa3-cuidados(1).html`: conexiones existentes, datos, textos y contenido completo de Cuidados. Su apariencia no debe limitar la nueva composición. Hay lógica incompleta en el generador de recorridos: no darla por resuelta por conservarla.
- `manual-de-marca(2).html`: guía visual, tipografías, colores, formas, collage y recursos incrustados.
- `MAPA (7).jpg`: logo elegido para esta versión. Usar el arte aportado, no reemplazarlo por texto con una fuente parecida. Preparar un encuadre sin márgenes excesivos, conservando proporciones y sin deformarlo; comprobar lectura en tamaños pequeños. El perfeccionamiento del logo es un trabajo posterior.
- Imágenes adjuntas y referencias identificadas en este documento.
- Briefing y session log: contexto. Las decisiones actuales de este prompt prevalecen sobre decisiones históricas que entren en conflicto.

No copies la estructura ni las tecnologías de Hiperstición. Ese proyecto fue referencia de precisión del encargo, no una plantilla de contenido ni de estética.

## 3. Tecnología y mantenimiento

Preferí HTML semántico, CSS y JavaScript modular, Leaflet para el mapa y PapaParse o un parser CSV probado para Google Sheets. Se permite proponer otra estructura si aporta una ventaja concreta, pero no sumar React, una base de datos paga, autenticación o un servidor por defecto. Debe poder alojarse en Netlify como sitio estático y mantenerse de forma económica.

Separá archivos y recursos de forma clara: `index.html`, `css/`, `js/`, `assets/logo/`, `assets/ciudad/`, `assets/cuidados/`, `assets/miscelaneas/`. Evitá incrustar fotografías grandes como base64. Conservá los originales; generá versiones optimizadas para web sin alterar el estilo de las imágenes.

Centralizá las URLs y el mapeo de columnas en un archivo de configuración. Separá acceso a datos, normalización, renderizado y lógica de recorridos. No expongas credenciales ni operaciones administrativas en el cliente.

La autora debe poder actualizar locales, agenda, notas y publicaciones aprobadas del muro desde Sheets. Proponé las pestañas nuevas y entregá plantillas CSV con sus encabezados y una guía clara. No supongas que esas pestañas o URLs ya existen. Si faltan conexiones nuevas, dejá componentes implementados y estados vacíos honestos, y explicá qué queda por configurar. No presentes una integración simulada como conectada.

## 4. Dirección de arte

Base del manual: Instrument Serif regular/italic para títulos y Jost para cuerpo y datos. Logo aportado como pieza independiente. Colores: hueso #F9F8F6, grafito #1A1A1A, terracota #B5654A, verde seco #8A8F6A, piedra #E6E1D8, manteca #F0D97A, rosa #ECB3A6 y kraft #DCCBA4.

Dar mayor alegría usando manteca, rosa y acentos con más presencia en secciones secundarias. Si ajustás un color, definir un token y documentarlo. Mantener contraste legible. No convertir todo el sitio en un fondo oscuro ni imponer celeste y rojo como paleta.

Composición editorial: títulos con jerarquía, filetes definidos, recortes, papeles, pestañas, clips y pequeñas rotaciones. Alternar densidad y aire. Cada sección tiene un recurso propio; evitar una repetición interminable de tarjetas iguales. Mantener controles y textos estables, legibles y fáciles de reconocer.

Buenos Aires aparece a través de calles, colectivos, arquitectura, afiches y objetos cotidianos. Usar algunas fotos nítidas y recortadas; reservar opacidad baja para fondos secundarios sin afectar lectura. No atribuir una foto genérica a un local real ni inventar su ubicación precisa. Galletitas, clips y estrellas son acentos discretos, nunca obstáculos sobre el mapa, botones o formularios.

## 5. Arquitectura y navegación

Home central con esta secuencia propuesta: encabezado; presentación breve y mapa/directorio; recorridos; agenda; glosario; cuidados; muro; entrada a Sobre el proyecto y notas; aportes; footer/contacto.

La sección editorial puede tener una vista propia con URL compartible. Las notas pueden abrir una vista de lectura. Volver al mapa debe preservar filtros y posición cuando corresponda; Atrás del navegador debe funcionar. No convertir cada bloque en una landing independiente sin necesidad.

Encabezado compacto, logo a la izquierda. Navegación: Mapa, Recorridos, Agenda, Guías, Comunidad, Sobre el proyecto y Sumá un espacio. Guías permite acceder claramente a Glosario y Cuidados. En celular, hamburguesa a la derecha sin la palabra visible “menú”, con nombre accesible, cierre por Escape y manejo correcto del foco. “Sumá un espacio” distinguible pero sin competir con el mapa. No agregar kickers ni numeración decorativa por encima de todos los títulos.

## 6. Primera pantalla: mapa y directorio

Mostrar encabezado, una presentación breve, controles principales y una superficie significativa del mapa en la primera pantalla de un celular común. No usar hero de pantalla completa, manifiesto previo, splash, video ni apertura que obligue a esperar. Se admite una entrada visual breve, sin retrasar uso ni carga de datos.

Desktop: mapa grande y lista de resultados vinculada al costado. Celular: alternancia Mapa / Lista con filtros compartidos, conservando búsqueda y selección. Al volver a mostrar un mapa oculto, recalcular su tamaño. Filtros arriba, nunca como una capa que tape gran parte de la cartografía. Evitar que el mapa capture involuntariamente el scroll; mantener zoom y navegación accesibles, y explicar el gesto real implementado.

Filtros esenciales: barrio, prendas predominantes y rango de precios. Búsqueda por nombre. Combinar dimensiones con AND; si una dimensión admite varias opciones, usar OR dentro de ella. Mostrar filtros activos, cantidad de resultados y Limpiar filtros. Opciones derivadas de datos normalizados, con manejo de espacios, tildes y sinónimos documentados. Las etiquetas visibles pueden cambiar sin modificar valores requeridos por integraciones.

Priorizar prendas concretas sobre categorías ambiguas: no mezclar automáticamente material, estilo y género como si fueran equivalentes. Revisar las categorías actuales y proponer un mapeo compatible con la planilla; no atribuir especialidades nuevas a comercios. No hace falta mostrar un filtro de tipología si no ayuda a elegir.

Directorio: únicamente locales a la calle de vintage y segunda mano. Excluir showrooms, cita previa y tiendas exclusivamente online. Ferias y eventos se presentan en Agenda. Si los datos actuales no permiten distinguir un caso, marcarlo para revisión editorial en lugar de asumir que es un local a la calle. No modificar la planilla original para aplicar estas reglas.

Cada ficha muestra nombre, barrio, prendas predominantes, rango de precios, dirección y horarios si existen. Acciones: Ver en el mapa, Cómo llegar y red/web disponible. No inventar precios, fotos, horarios ni condición “abierto ahora”. Si solo hay $, $$, $$$, explicar que es una referencia relativa y usar etiquetas claras. No mostrar cifras en pesos sin datos que las respalden.

Clic en ficha destaca el punto; clic en punto selecciona la ficha. Mantener resultados y mapa consistentes. Paginar la lista —por ejemplo seis por página, configurable— para evitar decenas de fichas consecutivas. El mapa puede conservar todos los resultados filtrados, explicando la cantidad total; distinguir selección de página y filtro. Al filtrar, reiniciar paginación.

Estados: carga, datos cargados, cero coincidencias, error con reintento y datos incompletos. No reemplazar un fallo por comercios inventados ni mostrar un mapa vacío como si no hubiera locales.

## 7. Armá tu recorrido

Selector de barrio con “Sin preferencia”, prendas buscadas con “Quiero explorar” y dos modalidades: Paseo express (1 a 2 horas, aproximadamente dos locales) y Tarde completa (tres a cinco locales según distancias y duración). El tiempo incluye caminar y permanecer en los locales. Proponer una duración de visita configurable y explicar la estimación.

Generar propuestas a partir de los locales válidos cargados, coordenadas y categorías reales. No reutilizar rutas prefijadas que ignoran selecciones. Si el barrio queda libre, buscar un conjunto caminable, sin unir arbitrariamente extremos de CABA. Explicar si no hay suficientes coincidencias y ofrecer ampliar filtros sin hacerlo silenciosamente.

Mostrar paradas ordenadas, motivo de coincidencia, direcciones, caminata estimada, tiempo de visitas y total. Permitir quitar una parada y, si existen alternativas, reemplazarla; recalcular resultados. No repetir locales. El número de paradas es orientativo, subordinado al tiempo disponible y a los datos.

Si se conserva el selector de día, debe afectar la propuesta solo con horarios estructurados suficientes; sin ellos, informar que no se verificó apertura y no aparentar que el selector resuelve ese dato. Usar horarios locales de Buenos Aires.

Si no hay motor de rutas peatonales conectado, estimar distancias con método y factor documentados y etiquetarlas como aproximadas. No dibujar una unión recta entre coordenadas como si fuera un itinerario verificado por calles. Ofrecer ruta con paradas en Google Maps. No prometer precisión en tiempo real.

Compartir por WhatsApp y copiar enlace deben conservar preferencias y paradas mediante URL reconstruible, con IDs estables y validación de datos actuales. Resolver locales retirados o parámetros inválidos. No compartir solo el ancla genérica #recorrido.

## 8. Agenda como cartelera

Selección compacta desde una pestaña de Sheets: próximas fechas y ferias recurrentes verificadas. Tarjetas como afiches, con fecha, nombre, barrio, dirección, horario, acceso y enlace cuando existan. Mostrar pocos eventos y “Ver agenda” solo si hay más. No generar una grilla inmensa.

Ocultar eventos vencidos o mostrar un archivo separado. Tratar fechas y recurrencias en America/Argentina/Buenos_Aires. No asumir que los eventos históricos del HTML siguen vigentes ni que todos tienen entrada libre. No publicar placeholders de “próximo pop-up”. Si no hay agenda confirmada, mostrar el estado vacío del corpus textual.

## 9. Glosario como archivo

Pestañas o carpetas de colores inspiradas en la referencia de archivo. Términos visibles y reconocibles, apertura por clic/toque y teclado. Mostrar definición completa al elegir, con estado activo claro. En celular, mantener una navegación evidente sin exigir arrastrar. Usar las cinco definiciones existentes del anexo textual; no generar un diccionario exhaustivo.

## 10. Cuidados: telas y prendas

Conservar íntegros los 13 textos del anexo, con acceso claro y párrafos legibles. Dos categorías prácticas, sin presentarlas como taxonomía científica:
- Materiales y tejidos: Seda, Satén o raso, Lana, Cashmere, Lino, Denim / jean, Algodón, Microtul.
- Prendas y piezas: Prendas plisadas, Tapados de lana, Ropa interior, Trajes de baño, Calzado de cuero.

Materiales: muestrario unido por una arandela, con muestras que giran brevemente como abanico alrededor de un punto común. Seleccionar una muestra actualiza título y texto. Incluir anterior/siguiente y contador; no depender de hover ni arrastre. Muestras legibles y seleccionables incluso en pantallas pequeñas. Si faltan fotografías de telas, usar representaciones claramente ilustrativas sin adjudicar una composición textil no comprobada.

Prendas: imágenes o recortables aportados como accesos al consejo correspondiente, con títulos visibles. Mantener variedad de estilos, sin volver a ilustrar todo para homogeneizarlo. No agregar roturas, parches ni remiendos. La campera de jean puede ser un acceso cruzado a Denim / jean sin duplicar la entrada. No inferir que un cardigan de referencia es cashmere o lana si no se conoce su material.

Si falta una imagen adecuada para una categoría, conservar acceso tipográfico cuidado y documentar recurso pendiente. No usar una imagen de otra prenda como si fuera equivalente. Texto completo accesible con Ver más / Ver menos cuando haga falta, sin cortes irreversibles. Adaptar giro a movimiento reducido.

## 11. Muro de looks y hallazgos

Collage de fotos, papeles y pequeños textos que permita compartir estilos e inspirarse. Cada publicación puede incluir foto, texto breve, nombre o alias y enlace opcional a la red social elegida por su autor. No exigir Instagram ni crear perfiles o cuentas.

Publicar únicamente registros aprobados por Lucia desde Sheets. No inventar personas, testimonios ni aportes para poblar la interfaz. La recepción de fotos no está resuelta por el Apps Script existente: implementar inicialmente un contacto por correo mediante “Compartí tu look”, con instrucciones para adjuntar foto, nombre/alias, texto y red opcional. Lucia recibe, selecciona, guarda la imagen entre los assets y añade su ruta o URL y datos a Sheets. Documentar este mantenimiento manual sencillo. La carga directa de fotos puede plantearse como mejora futura, no simularla.

Permitir abrir una foto con su texto, y cerrar fácilmente conservando posición. Evitar que la superposición o rotación tape contenidos; en celular ordenar el collage para poder recorrerlo. Sin autoplay, feeds de redes incrustados ni fotos descargadas de perfiles por defecto.

## 12. Sobre el proyecto y notas personales

Entrada discreta desde la home y enlace en navegación. Mostrar presentación editorial y un espacio de entradas breves mantenidas desde Sheets. El manifiesto se integra aquí con lenguaje cercano y sin grandilocuencia. Mantener propósito y autoría, sin ocupar la primera pantalla.

Notas como papeles superpuestos: al tocar una se trae al frente y queda completamente legible. Incluir anterior/siguiente, contador y una alternativa en lista. Arrastrar es opcional y nunca el único acceso. Mantener orden lógico y foco accesible. Evitar que un papel cubra permanentemente otro. Si una entrada crece, abrir vista de lectura compartible.

La autora todavía no tiene las entradas escritas. Preparar estructura y estado vacío, sin fabricar textos en su nombre. El texto de presentación del corpus es una propuesta editorial para esta versión, no una cita histórica de la autora.

## 13. Proponer espacios: dos entradas

Mostrar dos accesos claros que abren el formulario correspondiente, sin exponer dos formularios largos simultáneamente en celular:
1. “Tengo un local, feria o evento”: propuesta del responsable.
2. “Conozco un lugar”: recomendación de una persona visitante.

Distinguir locales permanentes para directorio y ferias/eventos para agenda. Mantener criterio territorial CABA y excluir showrooms/cita previa. No publicar automáticamente una propuesta. Campos mínimos razonables; no pedir a quien recomienda información comercial que puede desconocer. No afirmar que el envío garantiza inclusión.

Endpoint existente, conservar exactamente:
https://script.google.com/macros/s/AKfycbyAOwtD6FOe6xkByXj2hK89gkCdFfydW9FqIH7WDYIdkurvwpYdUD7T9seNHL-CrcjS_Q/exec

Contrato observado en el HTML: POST de formulario hacia iframe oculto, nombres `nombre`, `tipologia`, `direccion`, `instagram`, `descripcion`, `confirma`. La etiqueta visible de instagram puede ser “Web o red social”, conservando el nombre técnico. Revisar los valores de tipologia antes de cambiarlos; no introducir valores nuevos sin confirmar que el receptor los admite. No cambiar a JSON/fetch ni no-cors por comodidad si rompe compatibilidad.

No se dispone del código fuente de Apps Script: la URL de ejecución no equivale a conocer su implementación. Para distinguir origen propio/recomendado y detalles de evento sin depender de columnas nuevas, se puede estructurar un prefijo claro en `descripcion`, preservando el resto del texto. Si el receptor requiere cambios, entregar una propuesta separada y señalar dependencia, sin sobrescribir silenciosamente el contrato existente.

Validar campos, evitar doble envío, conservar datos ante fallo y habilitar reintento. El onload de un iframe no confirma que una fila se guardó. No mostrar “Registrado en la planilla” sin respuesta verificable del servidor. Si no se puede confirmar, usar el estado honesto del corpus. No enviar pruebas a producción sin autorización expresa.

## 14. Integración de lectura existente

URL CSV de locales, conservar exactamente y comprobar compatibilidad con encabezados reales:
https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8k2lfSgDs566JtZ3TGN9e1u5Wx7XFV-bIsk4iq4aGhKtbZBEMvW385AdhMRd3nfHyoZC12-ti3rUU/pub?output=csv

No confundir esta fuente de lectura con el endpoint que recibe propuestas. No asumir que un aporte recibido pasa a esta fuente publicada automáticamente. Registrar encabezados esperados, tipos, normalización, coordenadas inválidas y campos opcionales. Renderizar texto de Sheets como texto seguro; validar enlaces http/https y rutas de imágenes permitidas. No insertar HTML arbitrario desde una celda.

Para pestañas nuevas, proponer como mínimo:
- Agenda: id, estado, titulo, fecha_inicio, fecha_fin, recurrencia, horario, barrio, direccion, acceso, enlace, imagen, descripcion.
- Notas: id, estado, orden, fecha, titulo, bajada, cuerpo, imagen, alt. Soportar saltos de párrafo en celdas CSV entrecomilladas. No exigir escribir HTML.
- Muro: id, estado, orden, nombre_alias, texto, imagen, alt, red_url.

Usar estado=publicado para visibilidad. No publicar emails de contacto ni registros de propuestas pendientes. Las fuentes públicas deben contener únicamente contenido destinado a mostrarse en el sitio.

## 15. Movimiento y footer

Marquesina con frases breves del corpus y, solo si existen, cifras derivadas de datos actuales. Movimiento horizontal suave y continuo, con pausa accesible; duplicados decorativos fuera del árbol accesible. No afirmar +30 si la cantidad válida actual no lo respalda.

Entradas breves por sección mediante transform/opacity; ningún texto esencial debe permanecer invisible si falla JavaScript. Mapa y controles sin movimientos decorativos continuos. Sin scroll secuestrado, cursor personalizado ni parallax que dificulte lectura.

Footer con contacto en papel abollado que se despliega al entrar en pantalla y revela “Escribime”. Realizar una aproximación liviana con CSS/SVG o assets disponibles; no depender de un video todavía no entregado ni prometer simulación física. El mail debe poder usarse desde el inicio, incluso sin animación. Animar una vez; con movimiento reducido mostrar papel abierto. Incluir Volver arriba.

Correo: mapavintage.ba@gmail.com. Mantener créditos académicos existentes pertinentes, revisando atribuciones del HTML. No poner tilde en el nombre Lucia De Mársico.

## 16. Accesibilidad, rendimiento y verificaciones

Diseñar primero para celular. Verificar anchos de 360, 390, 768 y 1440 px, teclado y zoom al 200%. Sin desbordamiento horizontal general; carruseles solo dentro de sus regiones. Botones táctiles amplios, etiquetas persistentes en formularios, foco visible, semántica correcta y alternativas al arrastre y hover. Diálogos con Escape y devolución del foco. Respetar prefers-reduced-motion y ofrecer pausa de movimiento continuo.

Cargar de forma diferida las imágenes inferiores, reservar sus dimensiones y priorizar mapa y datos. No hacer depender la apertura del mapa de que todas las fotos hayan cargado. Gestionar fallos de fuentes, librerías externas, imágenes y CSV.

Comprobar: fuente existente y filtros; mapa/lista sincronizados; paginación; exclusión de showrooms; rutas que cambien con preferencias; compartir/restaurar rutas; agenda vencida; pestañas y 13 textos completos de Cuidados; notas; muro; formularios sin envíos de prueba a producción; navegación y consola.

Si hay navegador disponible, probar desktop y móvil. Si no, declarar qué no se pudo verificar, sin afirmar QA visual. Probar formularios con mocks o entorno de prueba, distinguiendo envío y persistencia real.

## 17. Entregables y modo de trabajo

Primero inspeccioná los archivos y enumerá brevemente integraciones, esquema observado y supuestos. Después implementá la versión completa en una carpeta nueva sin detenerte a consultar elecciones rutinarias ya cubiertas aquí. No te limites a un plan ni a una maqueta estática del mapa.

Entregá proyecto listo para servir en Netlify, instrucciones de ejecución, guía de mantenimiento, plantillas de las nuevas pestañas y configuración centralizada. Añadí un inventario breve de assets, las pruebas realizadas y una lista concreta de conexiones pendientes. Diferenciá funciones operativas, aproximaciones y dependencias pendientes. Mantener vacíos honestos donde falten contenidos reales.

Los textos del anexo son el corpus para implementar. No usar Lorem Ipsum. No sumar eslóganes grandilocuentes, cifras, locales, eventos o notas ficticias. No reescribir ni resumir los 13 cuidados. Las propuestas nuevas de interfaz están listas para una primera implementación y revisión por la autora.

# ANEXO A — TEXTOS PARA LA NUEVA VERSIÓN

## A1. Presentación y mapa — propuesta nueva

Título: Ropa vintage y segunda mano en Buenos Aires.

Bajada: Encontrá locales a la calle, filtrá por barrio, prendas y precios, y armá tu recorrido.

Accesos: Explorar el mapa / Armá tu recorrido.

Filtros: Barrio / Qué estás buscando / Rango de precios / Buscar un local / Sin preferencia / Todos los precios / Limpiar filtros.

Ayuda de precios: Los símbolos $, $$ y $$$ indican rangos orientativos entre los locales del mapa. Los precios pueden variar según la prenda.

Ficha: Prendas que predominan / Rango de precios / Dirección / Horarios / Ver en el mapa / Cómo llegar / Web o red social.

Carga: Estamos cargando los locales.

Error: No pudimos cargar los locales. Probá de nuevo en un momento.

Cero resultados: No encontramos locales con esa combinación. Probá cambiar algún filtro.

Datos faltantes: Precio sin informar / Horarios sin informar.

Marquesina: De perchero en perchero · Vintage y segunda mano · Buenos Aires para recorrer · Acceso libre y gratuito.

## A2. Recorridos — propuesta nueva

Título: Armá tu recorrido.

Bajada: Elegí qué querés encontrar, cuánto tiempo tenés y por dónde te gustaría caminar. Te proponemos un paseo entre locales del mapa.

Preguntas: ¿Qué estás buscando? / ¿Cuánto tiempo tenés? / ¿Por qué barrio querés pasear?

Opciones: Quiero explorar / Sin preferencia de barrio / Paseo express / Tarde completa.

Paseo express: Una o dos horas para conocer un par de locales.

Tarde completa: Entre tres y cinco paradas, según las distancias y el tiempo para recorrerlas.

Acciones: Armar recorrido / Cambiar esta parada / Quitar parada / Abrir en Google Maps / Compartir por WhatsApp / Copiar enlace.

Ayuda: El tiempo es estimado e incluye caminata y una pausa para mirar en cada local. Confirmá los horarios antes de salir.

Sin coincidencias suficientes: Con estas preferencias no pudimos armar un recorrido completo. Podés ampliar la búsqueda o visitar los locales que sí encontramos.

Enlace copiado: Listo, copiaste el enlace del recorrido.

## A3. Agenda — propuesta nueva

Título: Agenda.

Bajada: Ferias y encuentros para sumar a tu próximo paseo.

Acciones: Ver detalles / Ver más fechas / Proponer una feria o evento.

Estado vacío: Todavía no hay próximas fechas publicadas. Si conocés una feria o estás organizando un evento, podés compartirlo.

## A4. Glosario y Cuidados

Usar los textos existentes íntegros incluidos más abajo. Títulos: Glosario / Cómo cuidar tu ropa. Accesos de cuidados: Materiales y tejidos / Prendas y piezas. Controles: Anterior / Siguiente / Ver más / Ver menos.

## A5. Comunidad — propuesta nueva

Título: Lo que encontramos.

Bajada: Una prenda heredada, una mezcla inesperada o ese hallazgo que no te sacás más. Un muro para compartir cómo lo llevamos.

Botón: Compartí tu look.

Instrucciones: Mandame una foto, un texto breve y el nombre o alias con el que querés aparecer. Si tenés ganas, sumá un enlace a tu red social. Los aportes se revisan antes de publicarse.

Botón de contacto: Mandar mi aporte por mail.

Estado vacío: Este muro está por empezar. ¿Compartís el primer hallazgo?

## A6. Sobre el proyecto — propuesta nueva

Título: Detrás del mapa.

Entrada breve en home: Hay una persona detrás de esta selección y una ciudad para seguir descubriendo.

Botón: Conocé el proyecto.

Presentación:

Soy Lucia, estudio Ciencias de la Comunicación en la UBA y estoy armando Mapa Vintage para reunir esa información que suele quedar desperdigada entre redes, recomendaciones y capturas de pantalla.

Me interesa la mezcla: una prenda nueva con otra usada, algo heredado con algo que encontraste de casualidad. Comprar segunda mano puede ser una forma de ahorrar, encontrar buena calidad o llevar algo que te representa. No hace falta saber de décadas ni vestirse de una sola manera para disfrutarlo.

El mapa busca facilitar esa primera parte de la búsqueda. Después viene lo que ninguna pantalla reemplaza: caminar, mirar los percheros, tocar las telas y probarte la ropa.

Es un proyecto de acceso libre y gratuito que también crece con los lugares y hallazgos que otras personas comparten.

Subsección: Notas al margen.

Bajada: Apuntes breves sobre ropa, recorridos y cosas que me voy encontrando.

Estado vacío: Todavía no hay notas publicadas.

No usar estos párrafos para fabricar una serie de entradas: son únicamente la presentación propuesta del proyecto.

## A7. Aportes — propuesta nueva

Título: Sumá un espacio.

Bajada: ¿Tenés un local o conocés uno que falta? También podés compartir ferias y eventos para la agenda. Revisamos cada propuesta antes de publicarla.

Entrada 1: Tengo un local, feria o evento.

Descripción: Contanos qué ofrecés y dónde podemos encontrarte.

Entrada 2: Conozco un lugar.

Descripción: Si encontraste un local que vale la pena visitar o una feria para agendar, compartilo.

Campos visibles: Nombre del espacio / Qué tipo de espacio es / Dirección y barrio / Web o red social / Contanos qué podemos encontrar / Fecha y horario, si es un evento.

Confirmación territorial: Confirmo que el espacio o evento tiene una ubicación presencial en CABA.

Botones: Enviar propuesta / Recomendar un lugar.

Criterios: El directorio reúne locales a la calle de ropa vintage y segunda mano en CABA, con al menos un 60% del catálogo dedicado a estas prendas. Las ferias y eventos se reciben para la agenda. No incluimos showrooms con cita previa ni tiendas que funcionen solo online.

Envío en curso: Enviando tu propuesta…

Éxito SOLO si existe confirmación verificable: Gracias, recibimos tu propuesta. La vamos a revisar antes de publicarla.

Sin confirmación verificable: No pudimos confirmar la recepción. Si querés comprobar si llegó, escribinos a mapavintage.ba@gmail.com.

Error: No pudimos completar el envío. Tus datos siguen acá para que puedas intentar de nuevo.

## A8. Footer — propuesta nueva

Papel de contacto: ¿Tenés algo para contarme? / Escribime.

Correo: mapavintage.ba@gmail.com.

Volver arriba.

Descripción: Un mapa para encontrar ropa vintage y de segunda mano en Buenos Aires.

Autoría: Proyecto de Lucia De Mársico · Ciencias de la Comunicación · UBA.

# ANEXO B — CONTENIDOS EXISTENTES CONSERVADOS

Los siguientes textos se extraen del HTML de etapa 3 sin resumirlos. No fueron objeto de una nueva verificación especializada en esta sesión. Conservar su redacción al implementar.

## B1. Glosario

En el universo de lo vintage circulan términos que se usan de forma intercambiable pero que no quieren decir exactamente lo mismo. Esta guía es un diccionario para entender esas diferencias.

### Vintage

Mínimo 20 años de antigüedad. Ropa que refleja fielmente el diseño, técnicas de confección o materiales de su época. Terminaciones que la industria rápida abandonó (cierres metálicos, botones de nácar, tejidos puros).

### Retro

Fabricación reciente o contemporánea. Indumentaria actual que recrea la estética o tendencias del pasado. No posee valor histórico.

### Antiguo

Un siglo o más de historia. Tiene un valor más cercano al coleccionismo, la conservación museística o histórica.

### Segunda Mano / Thrift

Sin restricción de antigüedad. Prendas que regresan al circuito de consumo alargando su ciclo de vida y promoviendo la economía circular y precios accesibles.

### Upcycling

Confección artesanal y rediseño a partir de descarte textil para producir piezas de autor nuevas y exclusivas.

## B2. Cómo cuidar tu ropa

La ropa dura cuando mejor la cuidás. Antes de lavar una prenda, mirá su etiqueta, identificá de qué está hecha y preguntate si realmente necesita pasar por el agua. A veces, ventilarla alcanza. Otras, un cambio en la forma de secarla o guardarla puede hacer toda la diferencia.

### Seda

La seda es una fibra natural extremadamente delicada. Si la etiqueta lo permite, lavala siempre a mano, con agua fría y jabón neutro para prendas delicadas. Nunca la retuerzas ni la escurras, dejala secar por goteo, en una percha y siempre a la sombra. Evitá el sol directo, la secadora y los secadores de pelo, que pueden dañar y decolorar el tejido. No la planches. Si la dejás secar correctamente, podés aprovechar su caída natural y ahorrarte ese paso, te va a quedar impecable.

### Satén o raso

El satén no es una fibra, sino una forma de tejido: puede estar hecho de seda, poliéster o acetato. Por eso, antes de lavarlo, revisá su composición. Si es de seda, seguí los cuidados de esa fibra. Si es sintético, puede admitir lavarropas en un ciclo delicado y con agua fría, siempre que la etiqueta lo indique. Usá detergente líquido suave y evitá retorcer la prenda. Para secarla, colgala por goteo en una percha y a la sombra. Evitá la secadora y, si podés, también la plancha, el calor puede alterar su textura y su brillo.

### Lana

La lana repele la suciedad de forma natural, así que no necesita lavarse después de cada uso. Muchas veces, ventilarla alcanza. Cuando toque lavarla, hacelo a mano con agua fría y jabón neutro, o usá el programa específico para lana si la etiqueta permite el lavarropas. Evitá el centrifugado y nunca la cuelgues mojada: el peso del agua puede deformar las fibras. Para secarla, retirale el exceso de agua con una toalla y dejala extendida en horizontal. Guardá los sweaters doblados, nunca en perchas, para que no pierdan su forma. La lavanda puede ayudar a mantener las polillas alejadas y perfumar el armario. Evitá la naftalina.

### Cashmere

El cashmere necesita cuidados similares a los de la lana, pero conviene priorizar el lavado a mano. Usá agua fría y jabón neutro para prendas delicadas, masajeando suavemente sin frotar ni restregar. Para secarlo, enrollá el sweater en una toalla y presioná para absorber el exceso de agua, después, dejalo extendido sobre una superficie plana, sin tironear las fibras. Es normal que el roce genere pilling (esas bolitas que hacen ver tu prenda vieja). Retiralas con un peine específico para cashmere o una máquina quitapelusas, sin abusar para no desgastar el tejido. Guardalo limpio, seco y doblado.

### Lino

El lino es resistente, fresco y transpirable, aunque tiene una particularidad: se arruga con facilidad. Y sí, esas arrugas son parte de su encanto. Podés lavarlo en lavarropas con un ciclo delicado, agua fría y centrifugado suave. Evitá el calor porque puede encoger. Para secarlo, colgalo bien estirado o dejalo en plano, a la sombra. Si necesitás plancharlo, hacelo del revés y mientras todavía esté húmedo, con temperatura media-alta y vapor, siempre que la composición lo permita. Así las fibras se relajan y las arrugas salen más fácilmente. Si te encanta la ropa sin arrugas, el lino no es para vos.

### Denim / jean

El jean no necesita lavarse después de cada uso. Si no está sucio, podés airearlo y volver a usarlo: así ayudás a preservar el color y la forma. Cuando lo laves, hacelo del revés, con agua fría y, especialmente si es nuevo u oscuro, por separado para evitar que destiña sobre otras prendas. Evitá los suavizantes, que pueden afectar las fibras elásticas de los jeans con elastano. Para secarlo, colgalo del revés y al aire libre, sin recurrir a la secadora: el calor puede encoger el tejido y acortar su vida útil. La plancha generalmente no hace falta. Si la usás, elegí una temperatura media y hacelo del revés.

### Algodón

El algodón es versátil y resistente, pero también puede encogerse con el calor. Para conservar tus prendas, lavalas según la etiqueta y, cuando sea posible, con agua fría o tibia. Separá los colores claros de los oscuros y evitá sobrecargar el lavarropas. Para secarlas, el aire suele ser suficiente y ayuda a reducir el desgaste. Si la prenda tiene estampas, bordados o detalles delicados, lavarla del revés es un buen recurso para protegerlos.

### Microtul

El microtul es liviano y delicado: un cierre, un gancho o un roce fuerte pueden engancharlo. Lavá tu prenda a mano con agua fría y jabón suave, sin frotar ni retorcer. Si vas a recurrir al lavarropas, usá una bolsa de lavado para proteger la malla. Dejala secar al aire y a la sombra. Evitá la secadora y nunca, jamás, la planches. Para guardarla, doblala con cuidado y mantenela separada de accesorios que puedan engancharla.

### Prendas plisadas

Los pliegues son parte del diseño, así que el objetivo es conservarlos. Antes de lavar una prenda plisada, revisá la etiqueta: según la tela y el tipo de plisado, puede necesitar limpieza profesional. Evitá retorcerla, aplastarla o dejarla amontonada mientras está húmeda. Para guardarla, colgala si la estructura lo permite y asegurate de que tenga espacio para que los pliegues no se deformen. No la planches directamente ni intentes rehacer los pliegues con calor sin conocer la composición: podés alterar su forma original.

### Tapados de lana

Un buen tapado puede acompañarte durante años. Después de usarlo, dejalo ventilar y retirale el polvo con un cepillo suave. No necesita lavarse seguido, y muchas veces alcanza con airearlo. Antes de limpiarlo, revisá la etiqueta: por su estructura, forro y entretelas, algunos tapados necesitan limpieza profesional. Al terminar la temporada, guardalo limpio y completamente seco, en una percha ancha que sostenga bien los hombros. Mantenelo en un lugar ventilado y sin humedad. Para prevenir polillas, podés sumar una bolsita de lavanda al armario, sin que esté en contacto directo con la prenda.

### Ropa interior

La ropa interior necesita una limpieza frecuente, pero eso no significa que todas las piezas deban tratarse igual. El algodón suele resistir mejor el lavado cotidiano, mientras que el encaje, la microfibra y los elásticos delicados necesitan menos fricción. Si usás lavarropas, colocá los corpiños en una bolsa de lavado y cerrá los ganchos para que no se enganchen con otras prendas. Evitá retorcerlos y dejalos secar al aire. En los corpiños, no los cuelgues de los breteles cuando están mojados: el peso puede estirarlos y hacerles perder sujeción.

### Trajes de baño

El cloro, la sal y los protectores solares pueden deteriorar las fibras elásticas y alterar los colores. Después de cada uso, enjuagá la malla con agua fría para retirar los residuos. Lavala a mano con jabón suave cuando corresponda y no la retuerzas para escurrirla. Dejala secar a la sombra, lejos de fuentes de calor: el sol directo y la secadora pueden debilitar el elastano. Y un detalle clave: no la guardes húmeda ni hecha un bollo en una bolsa. Antes de guardarla hasta el próximo verano, asegurate de que esté completamente seca.

### Calzado de cuero

El cuero necesita limpieza suave, ventilación y protección frente a la humedad. Después de usar tus zapatos, retirales el polvo con un paño seco o un cepillo adecuado y dejalos airearse antes de guardarlos. Si se mojan, no los acerques a una estufa ni uses secador: rellenalos con papel limpio para absorber la humedad y dejalos secar a temperatura ambiente. Cuando el material lo permita, aplicá una crema específica para cuero, probándola primero en una zona poco visible. Guardalos lejos del sol directo y sin apretarlos contra otros pares. Si son de gamuza, charol u otro acabado especial, usá productos específicos para ese material.

Antes de lavar, revisá siempre la etiqueta de cuidado y la composición de la prenda.

# ANEXO C — INVENTARIO DE REFERENCIAS VISUALES

Usar los adjuntos como recursos y referencias según esta asignación. Si un archivo no está disponible, informarlo; no darlo por integrado.

| Archivo | Contenido y uso |
|---|---|
| MAPA (7).jpg | Logo elegido: MAPA VINTAGE / BUENOS AIRES. |
| image(20261017-143405).png | Referencia funcional de las dos entradas para proponer espacios; no copiar necesariamente su estilo. |
| image(20261017-144508).png | Campera de jean ilustrada: acceso al cuidado de Denim / jean. |
| image(20261017-144514).png | Cardigan rojo con flores: universo visual de prendas; composición material desconocida. |
| 87b7c659b2a539c632a23e300c7fbfb2.jpg | Foto de perchas y selección de ropa: recurso editorial, no atribuir a un comercio. |
| image(20261017-144929).png | Conjunto ilustrado multicolor: universo de mezcla y expresión personal. |
| image(20261017-144936).png | Prendas tejidas ilustradas: referencia, sin inferir fibras. |
| image(20261017-145104).png | Archivo de carpetas y pestañas: referencia compositiva para Glosario. |
| image(20261017-145145).png | Papeles de colores superpuestos: referencia de interacción para Notas al margen; no copiar sus textos. |
| image(20261017-145340).png | Calle Corrientes y teatros: recorte urbano para recorridos o proyecto. |
| image(20261017-145425).png | Pared porteña con pegatinas: recurso urbano secundario y referencia de capas. |
| image(20261017-145444).png | Afiches superpuestos: referencia de cartelera y collage. |
| image(20261017-145604).png | Galletitas argentinas: miscelánea puntual; no insertar la lámina entera como sección. |
| image(20261017-145617).png | Arquitectura urbana vista hacia arriba: recorte editorial secundario. |
| image(20261017-145752).png | Colectivo 39: detalle de ciudad. |
| image(20261017-150110).png | Alfileres, clips, chinches y estrellas: detalles que sujetan visualmente papeles y fotos. |
| image(20261017-145831).png | Se visualiza negra: no utilizar sin identificar su contenido. |

Conservar las imágenes aportadas con su estilo, sin generar un conjunto homogéneo nuevo. No usar la lámina de referencia de una interacción como una imagen plana en lugar de construir la interacción. Mantener créditos visibles cuando correspondan y conservar los originales identificados para poder sustituirlos.

# CIERRE DEL ENCARGO

Construí una herramienta clara, expresiva y fácil de mantener. La persona debe poder encontrar un local y armar un paseo sin entender primero el manifiesto. El carácter editorial y la ciudad se descubren durante el uso. Implementá el conjunto y entregá una versión revisable, sin desplegarla.
