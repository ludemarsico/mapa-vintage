# Muestrario de telas

El muestrario conserva las ocho imágenes aportadas y los textos de cuidado.
Las cinco prendas mantienen sus controles y textos completos.

- Clic o toque en la tela del frente: pasa a la siguiente.
- Anterior/siguiente: recorren las ocho telas en ambas direcciones, con contador.
- Teclado en la muestra activa: flechas izquierda/derecha, Inicio y Fin.
- Con movimiento reducido, la selección cambia sin animación.

Las muestras comparten un punto de giro a 24 px de sus bordes superior e izquierdo.
La argolla está oculta por pedido de revisión. La tela saliente gira por delante,
vuelve detrás del conjunto y descubre la siguiente; al retroceder se invierte
ese orden. Los nombres y el texto cambian juntos cuando pasa la muestra.
Durante cada giro se espera a que termine antes de aceptar otro paso.

La lógica está en `initCare()` de `js/editorial.js`. La hoja `css/muestrario.css`
define el punto común y el espacio necesario para las esquinas y
sombras. Los tiempos del giro son 280 ms y 240 ms. Las etiquetas de accesibilidad
explican la acción sin agregar instrucciones visibles a la sección.

Los recursos de tela se configuran en `CONFIG.fabricImages`. Los 13 textos
siguen en `js/content.js` y en el contenido alternativo del HTML.
