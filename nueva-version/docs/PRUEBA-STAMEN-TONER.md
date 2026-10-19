# Prueba de Stamen Toner

Esta prueba cambia solamente el fondo de Leaflet al abrir un enlace con `?mapa=toner`. La entrada habitual conserva OpenStreetMap. Los pines, los filtros, la selección de locales y los recorridos conservan su lógica.

Enlace de revisión:

https://mapa-vintage-revision-lucia.ivorybead3.chatgpt.site/?mapa=toner#mapa-seccion

## Conexión pendiente

Stamen Toner se sirve desde Stadia Maps. Fuera de localhost requiere autenticación. No se creó una cuenta, no se contrataron planes y no se añadieron claves al repositorio.

Para habilitarlo en esta revisión:

1. Entrar o registrarse en https://client.stadiamaps.com/ . Revisar las condiciones y los límites del plan que corresponda al proyecto; no hace falta contratar un plan para preparar esta prueba.
2. Abrir **Manage Properties** y seleccionar o crear la propiedad del proyecto.
3. En **Authentication Configuration**, añadir únicamente el dominio de revisión: `mapa-vintage-revision-lucia.ivorybead3.chatgpt.site`, sin `https://`, rutas ni parámetros. Si el formulario separa dominio y subdominio, usar dominio `ivorybead3.chatgpt.site` y subdominio `mapa-vintage-revision-lucia`.
4. Guardar la configuración y volver a abrir el enlace de prueba. No es necesario compartir una contraseña ni insertar una API key en JavaScript.
5. Comprobar que se ve la cartografía en blanco y negro y que figuran los créditos de Stadia Maps, Stamen Design, OpenMapTiles y OpenStreetMap.

Si falla una tesela de Toner, la prueba retira esa capa y carga OpenStreetMap, conservando posición, zoom y pines. Se informa de ese regreso para no confundir el mapa habitual con Toner. No se vuelve a intentar hasta recargar la página.

Para comparar con el mapa habitual, quitar `?mapa=toner` de la URL. Los enlaces de recorridos mantienen su contrato existente: no difunden el parámetro de prueba y, al abrirlos, usan el mapa habitual. La prueba no cambia la configuración de Netlify ni publica allí. Para una futura activación en el dominio público habrá que autorizar ese dominio por separado y decidir primero si se adopta este estilo.

El servidor debe permitir enviar el origen como referente (`strict-origin-when-cross-origin`); no usar `no-referrer`. El `netlify.toml` existente ya conserva la política compatible. La configuración de un proveedor y la política de red del entorno de desarrollo son requisitos separados.

Referencias oficiales consultadas:

- https://docs.stadiamaps.com/map-styles/stamen-toner/
- https://docs.stadiamaps.com/authentication/

La integración y el regreso al fondo habitual se pueden comprobar con respuestas de teselas simuladas. Esas pruebas no verifican que el dominio esté autorizado ni validan visualmente las teselas reales de Stadia Maps.
