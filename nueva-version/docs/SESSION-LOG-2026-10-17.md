# Mapa Vintage — Registro de sesión

Fecha: 17 de octubre de 2026 (Buenos Aires).

## Dónde está cada cosa

- Repositorio: https://github.com/ludemarsico/mapa-vintage
- Rama de trabajo: `reconstruccion-mapa-vintage`.
- Carpeta del sitio nuevo: `nueva-version/`.
- Página principal: `nueva-version/index.html`.
- Archivos del sitio: https://github.com/ludemarsico/mapa-vintage/tree/reconstruccion-mapa-vintage/nueva-version
- Revisión navegable privada: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site
- ZIP de la revisión: https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site/descargas/mapa-vintage-revision.zip
- Proyecto de Sites: `appgprj_6ad39ee46ae0819188ea3a1930843316`.

El sitio original se conserva. No se hizo merge a `main` ni se publicó en Netlify.
La revisión privada de Sites y GitHub son servicios distintos: Sites permite recorrer el sitio y GitHub conserva sus archivos e historial.

## Base y trabajo de diseño

Se construyó la versión de revisión en una carpeta separada, a partir del megaprompt y los HTML aportados. Se mantuvieron la lectura de locales desde Google Sheets, el contrato del formulario de propuestas y los 13 textos completos de cuidados.

Las primeras pasadas incorporaron el mapa y los filtros, los recorridos compartibles, las secciones editoriales y una página separada de demostración. Se revisaron el muestrario de cuidados, el glosario y las composiciones de las secciones. Comunidad tiene un formulario integrado y una implementación preparada para recibir fotos mediante una conexión independiente. Agenda abre el formulario de propuestas en un diálogo. El contacto quedó como una pieza estática con “Escribime”; su animación no se considera terminada.

## Cambios quirúrgicos acordados y aplicados

1. Footer: se quitaron el enlace “Ver demostración de composiciones” y los dos textos de acreditación académica. La página de demostración sigue existiendo por separado.
2. Filtro del mapa: se reemplazó la opción aislada de tapados por estas cinco categorías, en este orden:
   - Sastrería & Archivo.
   - Denim & Streetwear 90s.
   - Sin género / Oversized.
   - Carteras, Calzado & Accesorios.
   - Cuero & Tapados.
   El filtro usa la especialidad informada en la planilla; no se inventaron locales para llenar categorías.
3. Menú: sus enlaces dicen MAPA; ARMÁ TU RECORRIDO; AGENDA; GLOSARIO; GUÍA DE CUIDADOS; COMUNIDAD; SOBRE MAPA VINTAGE; SUMÁ TU ESPACIO.
4. GLOSARIO y GUÍA DE CUIDADOS se sacaron del grupo “Guías” y quedaron al mismo nivel que los otros enlaces.
5. Debajo del mapa se quitó la explicación de los símbolos de precios y el desplegable de datos. Se dejó siempre visible únicamente: “Locales a la calle de ropa vintage y segunda mano en CABA. No incluimos showrooms ni tiendas exclusivamente online.”
6. Barra amarilla: se quitó el botón “Pausar”; el texto sigue animado.
7. Recorridos: el rótulo definitivo es “¿Qué estás buscando?”. El selector usa las mismas cinco categorías del mapa; conserva la opción inicial “Quiero explorar”. Se corrigió el rótulo intermedio “Quiero encontrar”.
8. Se quitó el disclaimer inmediatamente debajo del botón para armar el recorrido.
9. Cada parada muestra número, nombre del local, dirección y barrio. Se quitaron el texto de coincidencia de preferencias y el tiempo de caminata entre paradas.
10. Los botones de cada parada dicen “Cambiar este local” y “Sacar del recorrido”. Conservan su funcionamiento.
11. Se quitaron “Tu paseo a pie” y el resumen superior de cantidad de paradas, kilómetros y tiempo. Se muestran directamente las paradas cuando hay resultados. Los avisos de falta de resultados o enlaces desactualizados permanecen.
12. Desktop: también usa menú hamburguesa del lado derecho. Se mantuvieron los enlaces, el cierre con Escape y la navegación por teclado.

El disclaimer técnico que aparece al final del resultado, debajo de las acciones de compartir/Google Maps, sigue en el código: no se confundió con el resumen superior solicitado en el punto 11. Revisarlo sólo si la usuaria pide un cambio sobre ese texto.

## Logo: pendiente

La usuaria volvió a mostrar en el chat el logo elegido, MAPA (7).jpg, y pidió que reemplace “Inicio ↗” en el encabezado.
La imagen fue visible en la conversación, pero su archivo binario no estuvo disponible en el entorno ni llegó con un identificador descargable. No se incorporó ni se sustituyó por una recreación tipográfica.

Para resolverlo: recibir el JPG original como archivo descargable, verificarlo y reemplazar únicamente el acceso “Inicio ↗”, manteniendo el enlace al inicio. Si hay mucho margen alrededor de la marca, encuadrarlo para que sea legible. No modificar el footer ni otros elementos por iniciativa propia durante esta etapa de cambios quirúrgicos.

## Conexiones y otros pendientes

- Locales: se conserva la lectura desde Google Sheets.
- Propuestas de locales/ferias/eventos: se conserva el contrato de recepción existente. No se enviaron pruebas a producción.
- Fotos de Comunidad: la conexión independiente todavía no está configurada. La interfaz no simula éxito y el envío permanece deshabilitado. Instrucciones en `docs/RECEPCION-DE-HALLAZGOS.md`; implementación preparada en `integraciones/hallazgos/`.
- Agenda, notas y muro: las fuentes de publicaciones siguen pendientes de configuración; las plantillas están en `plantillas/`. La demostración es separada, está rotulada y no escribe en Google Sheets.
- Los recursos gráficos originales que no llegaron como archivos descargables siguen pendientes. No generar sustitutos sin pedido.
- La animación de papel de contacto se dejó para otra instancia con una referencia concreta.
- Se explicó la conveniencia de una entrega final limpia para Netlify, pero todavía no se reorganizó ni se publicó. Durante la revisión se conserva la estructura existente.

## Verificación realizada

En las pasadas anteriores se ejecutaron pruebas de lógica e interacciones en escritorio y celular. Para los cambios quirúrgicos se hicieron comprobaciones acotadas al cambio: sintaxis de JavaScript, igualdad de enlaces y textos, filtrado por categoría, generación de recorridos, representación de las paradas, eliminación de paradas y controles de teclado del menú.

La prueba de lógica principal pasó sus 28 casos al revisar los recorridos. Las verificaciones posteriores no constituyen una nueva revisión visual completa en navegador. Las publicaciones de Sites devolvieron estado exitoso. No se hicieron envíos de formularios a la planilla de producción.

## Estado de GitHub y revisión al cerrar

Los 15 commits del sitio se subieron a GitHub en `reconstruccion-mapa-vintage`. El último commit funcional al cerrar es `e685cb5ec953c857865509c7fec25e61bfcbca95` (“Usa menú hamburguesa también en escritorio”). El commit de este registro sólo añade documentación.

La revisión privada publicada corresponde a esa versión funcional. Su último despliegue confirmado es `appgdep_6ad3cadfa5388191b9d7b4753865d3a2`.

## Cómo retomar

Volver a esta conversación y dar el siguiente cambio, de a uno. Si se abre otra conversación, copiar:

> Continuemos Mapa Vintage con cambios quirúrgicos. El repositorio es https://github.com/ludemarsico/mapa-vintage, la rama es reconstruccion-mapa-vintage y el sitio está en nueva-version/. Leé primero nueva-version/docs/SESSION-LOG-2026-10-17.md. Continuá sobre esa versión, sin reconstruirla. Modificá sólo lo que te pida, conservá las funcionalidades y los textos restantes. Actualizá la misma revisión privada y guardá los cambios en esa rama de GitHub. No hagas merge a main, no publiques en Netlify y no envíes pruebas a la planilla de producción. Mi próximo cambio es: [escribir el cambio].

Si no está disponible el entorno previo, recuperar la rama desde GitHub. La copia de GitHub es la referencia persistente de los archivos; no depender de una ruta interna de una sesión anterior.
