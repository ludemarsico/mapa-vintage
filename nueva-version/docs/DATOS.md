# Datos e integraciones

## Lectura existente, conservada literalmente

`https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8k2lfSgDs566JtZ3TGN9e1u5Wx7XFV-bIsk4iq4aGhKtbZBEMvW385AdhMRd3nfHyoZC12-ti3rUU/pub?output=csv`

Encabezados observados en la consulta real del 17/10/2026: `ID`, `Nombre`, `Barrio`, `Dirección`, `Latitud`, `Longitud`, `Tipología`, `Rango Precio`, `Especialidad`, `Horarios`, `Instagram`, `Descripción breve`. 29 filas. La normalización de esta entrega admite 21 para directorio y aparta 8; esto es una lectura de la fuente, no una verificación presencial independiente de los comercios.

## Normalización y supuestos

- Nombres de columnas centralizados en `CONFIG.columns`. Comparación sin tildes ni diferencias de mayúsculas, con espacios normalizados.
- CSV con BOM, CRLF, comas entrecomilladas, comillas dobles y celdas con varios párrafos. Se rechazan columnas desalineadas, encabezados duplicados y comillas sin cerrar.
- Coordenadas numéricas con punto o coma decimal. Se exige nombre y dirección y se descartan coordenadas fuera del recuadro de control de CABA. El recuadro no equivale a una prueba catastral del límite: `Ciudad`, barrio y direcciones necesitan revisión editorial.
- `Boutique Vintage` y `Cadena de reventa` se toman como tipos de establecimiento permanente en la fuente existente. El resto necesita evidencia explícita de local en su descripción o `Local a la calle=sí`.
- Showroom, cita previa y online exclusivo se excluyen incluso si una otra columna parece admitirlos. Ferias colectivas se apartan, salvo evidencia explícita de local a la calle. Los casos ambiguos no se publican como nuevos locales.
- Si existe `Estado`, solo se admiten `publicado` o `activo`. Si falta, la fuente original se considera el directorio editorial publicado.
- Precios admitidos: `$`, `$$`, `$$$`. No se agrega `$` por defecto.
- Prendas: `Prendas predominantes`/`Prendas` si existen; si no, `Especialidad`. Se separa por coma, punto y coma, barra vertical o `&`, y solo se reconocen equivalencias explícitas del diccionario `GARMENTS`. `Cuero & Tapados` produce **Tapados**, no Cuero. `Denim & Streetwear 90s`, `Sin género / Oversized` y `Sastrería & Archivo` se conservan como selección informada pero no se convierten en prendas. No se infieren nuevas especialidades de los locales.
- IDs: se usa `ID`; si falta, hash estable de nombre y dirección. Un cambio de dirección altera ese fallback; conviene mantener IDs editoriales estables. Duplicados van a revisión.
- Web: solo http/https, sin credenciales en URL. Si Instagram es texto importado con `@cuenta` explícita, se construye el enlace a esa misma cuenta. No se adivinan handles.
- Imágenes: rutas relativas bajo `assets/` sin `..`, extensiones de imagen admitidas o URLs https. Fallos remotos muestran alternativa. El contenido CSV se inserta con `textContent`, nunca como HTML de celdas.
- Filtros: AND entre nombre/barrio/precio/prendas. La función de prendas acepta OR dentro de su dimensión; el selector visible usa una opción a la vez. Al filtrar vuelve a página 1. Paginación solo afecta la lista; el mapa conserva todos los resultados.

## Recepción de propuestas, conservada literalmente

`https://script.google.com/macros/s/AKfycbyAOwtD6FOe6xkByXj2hK89gkCdFfydW9FqIH7WDYIdkurvwpYdUD7T9seNHL-CrcjS_Q/exec`

Método: POST nativo de formulario hacia iframe oculto. Nombres enviados: `nombre`, `tipologia`, `direccion`, `instagram`, `descripcion`, `confirma` (checkbox original, valor `on`). No se usa fetch ni JSON para el envío.

Se conservan los valores originales `Boutique Vintage`, `Feria americana`, `Feria colectiva`, `Cadena de reventa`. La opción original `Showroom (con cita)` se omite por el criterio actual del proyecto. La etiqueta de `Feria colectiva` permite proponer un evento, manteniendo el valor técnico original. Detalles, origen y destino editorial van como prefijo de `descripcion`; el resto del texto se conserva.

El iframe no proporciona comprobación de persistencia. Carga, error y tiempo de espera habilitan estados honestos, mantienen los datos y permiten reintentar. No se conoce ni se reemplaza el código del Apps Script.

## Conexiones pendientes

| Configuración | Estado | Acción exacta |
|---|---|---|
| `sources.agenda` | Cadena vacía | Crear pestaña usando `plantillas/agenda.csv`, publicar esa pestaña como CSV y pegar URL |
| `sources.notas` | Cadena vacía | Repetir con `plantillas/notas.csv` |
| `sources.muro` | Cadena vacía | Repetir con `plantillas/muro.csv`; guardar fotos aprobadas en assets |
| Confirmación verificable del receptor | No disponible | Acceso al código Apps Script y protocolo de respuesta en un entorno de pruebas; mejora posterior |
| Motor peatonal | No conectado | No se necesita para esta versión: se estima y se ofrece cálculo externo por Google Maps |

No se crean automáticamente pestañas ni se conecta contenido de muestra. En las tres fuentes nuevas solo se muestran filas con `estado=publicado` y campos indispensables. Los templates no contienen registros ficticios.

## Recorridos

Haversine × 1,3 para distancia aproximada; 4 km/h para caminar; 25 minutos por visita. Valores centralizados en `CONFIG.route`. Se evalúa cada candidato como punto inicial y se añaden los vecinos próximos compatibles, sin repetir, con tramos de hasta 1,8 km estimados y dentro del presupuesto (120/240 min). Se elige la propuesta que completa más paradas y, a igualdad, camina menos. Es una heurística, no una optimización ni un motor de rutas por calles.

Express: hasta 2 paradas. Tarde: hasta 5. No se amplían filtros silenciosamente; si faltan coincidencias, se avisa. Reemplazos cumplen preferencias, distancia y presupuesto; quitar recalcula. No se dibujan segmentos rectos como itinerarios reales. Horarios se muestran, pero no se estructura ni valida apertura.

URL: `?ruta=ID1,ID2&barrio=…&prenda=…&paseo=express#recorridos`. IDs, orden y preferencias se conservan y se validan con los datos actuales. Retirados/duplicados/preferencias incompatibles se señalan. WhatsApp comparte esa misma URL.

## Arquitectura

`config.js`: contrato y ajustes. `data.js`: CSV, normalización y validación. `routes.js`: cálculo y URL. `map.js`: Leaflet. `editorial.js`: cuidados, agenda, notas y muro. `forms.js`: contrato de propuestas. `dom.js`: construcción segura del DOM. `app.js`: estado de interfaz y navegación.

Leaflet 1.9.4, fuentes y recursos del manual se incluyen como archivos locales con sus licencias cuando corresponde. Solo datos y teselas requieren red. No hay claves, operaciones administrativas, autenticación ni servidor de aplicación.
