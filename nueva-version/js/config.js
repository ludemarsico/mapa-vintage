export const CONFIG = {
  sources: {
    locales: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8k2lfSgDs566JtZ3TGN9e1u5Wx7XFV-bIsk4iq4aGhKtbZBEMvW385AdhMRd3nfHyoZC12-ti3rUU/pub?output=csv',
    // Hoja "Agenda" publicada como CSV. Sin filas, la Agenda muestra su mensaje inicial.
    agenda: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbU4KQpjNNFSobTo2kBLCCTzIOc_0VV5CvJTdnRWTY0KwGFcWtd2PlgoHFOC52Z0xtbPNoJIVaLhNV/pub?gid=0&single=true&output=csv',
    notas: '', muro: ''
  },
  formEndpoint: 'https://script.google.com/macros/s/AKfycbyAOwtD6FOe6xkByXj2hK89gkCdFfydW9FqIH7WDYIdkurvwpYdUD7T9seNHL-CrcjS_Q/exec',
  // Apps Script de la Agenda: las ferias y eventos propuestos llegan a su hoja "Aportes", con los mismos seis campos.
  agendaFormEndpoint: 'https://script.google.com/macros/s/AKfycby7Zul6GiGu0DGleZchoKiRiVeoXXSv5ipnd7HMe0rkiwPpSUuKNEniTe_r6v5pkheOuQ/exec',
  email: 'mapavintage.ba@gmail.com',
  // Logo y collage del pie están fijos en index.html.
  logo: '',
  // Receptor independiente de imágenes. Nunca usar el Apps Script de locales aquí.
  hallazgos: { endpoint: '', turnstileSiteKey: '' },
  // Receptor nuevo de propuestas (integraciones/propuestas/Code.gs): escribe en "Agenda a verificar" y "Espacios a verificar".
  // Mientras esté vacío se usa formEndpoint, el formulario original.
  propuestas: { endpoint: '', turnstileSiteKey: '' },
  // Cuidados: el perchero de prendas, en este orden. "cuidado" es el título del texto en content.js (CARE).
  // Una prenda sin texto de cuidado queda oculta hasta que se agregue su texto.
  prendas: [
    { etiqueta: 'Lana', imagen: 'lana', cuidado: 'Lana' },
    { etiqueta: 'Cuero', imagen: 'cuero', cuidado: 'Cuero' },
    { etiqueta: 'Seda', imagen: 'seda', cuidado: 'Seda' },
    { etiqueta: 'Gamuza', imagen: 'gamuza', cuidado: 'Gamuza' },
    { etiqueta: 'Plisado', imagen: 'plisado', cuidado: 'Plisado' },
    { etiqueta: 'Estampas', imagen: 'estampas', cuidado: 'Estampas' },
    { etiqueta: 'Tejidos a mano', imagen: 'tejidoamano', cuidado: 'Tejidos a mano' },
    { etiqueta: 'Jean', imagen: 'denim', cuidado: 'Denim' },
    { etiqueta: 'Satén', imagen: 'saten', cuidado: 'Satén' },
    { etiqueta: 'Cashmere', imagen: 'cashmere', cuidado: 'Cashmere' },
    { etiqueta: 'Lino', imagen: 'lino', cuidado: 'Lino' },
    { etiqueta: 'Algodón', imagen: 'algodon', cuidado: 'Algodón' },
    { etiqueta: 'Tapados', imagen: 'panio', cuidado: 'Tapados de paño' },
    { etiqueta: 'Tul y encaje', imagen: 'tul', cuidado: 'Tul y encaje' },
    { etiqueta: 'Terciopelo', imagen: 'terciopelo', cuidado: 'Terciopelo' },
    { etiqueta: 'Lentejuelas', imagen: 'lentejuelas', cuidado: 'Lentejuelas y bordados' },
    { etiqueta: 'Lencería', imagen: 'lenceria', cuidado: 'Lencería' },
    { etiqueta: 'Trajes de baño', imagen: 'tajedebanio', cuidado: 'Trajes de baño' }
  ],
  columns: {
    id: ['ID', 'id'], nombre: ['Nombre'], barrio: ['Barrio'], direccion: ['Dirección', 'Direccion'],
    lat: ['Latitud'], lng: ['Longitud'], tipo: ['Tipología', 'Tipologia'], precio: ['Rango Precio'],
    prendas: ['Prendas predominantes', 'Prendas'], especialidad: ['Especialidad'], horarios: ['Horarios'],
    web: ['Instagram', 'Web'], descripcion: ['Descripción breve', 'Descripcion breve'],
    presencial: ['Local a la calle'], ciudad: ['Ciudad'],
    clasificacion: ['Clasificación', 'Clasificacion']
  },
  // Columnas de la hoja "Agenda" (mismas que el Directorio, más Días). Fecha es opcional: si se agrega, se ocultan las fechas pasadas.
  // Se aceptan también los nombres del formato anterior (titulo, fecha_inicio…).
  agendaColumns: {
    id: ['ID', 'id'], nombre: ['Nombre', 'Título', 'Titulo', 'titulo', 'Evento'], tipo: ['Tipo', 'Tipología', 'Tipologia'],
    dias: ['Días', 'Dias'], fecha: ['Fecha', 'Fecha inicio', 'fecha_inicio'], fechaFin: ['Fecha fin', 'fecha_fin'], recurrencia: ['Recurrencia', 'recurrencia'],
    horario: ['Horarios', 'Horario', 'horario'], precio: ['Rango Precio'], especialidad: ['Especialidad'], barrio: ['Barrio', 'barrio'], direccion: ['Dirección', 'Direccion', 'Lugar', 'direccion'],
    descripcion: ['Descripción', 'Descripcion', 'Descripción breve', 'descripcion'], acceso: ['Acceso', 'Entrada', 'acceso'],
    enlace: ['Instagram', 'Enlace', 'Web', 'enlace'], imagen: ['Imagen', 'imagen']
  },
  // Los 48 barrios oficiales de CABA, para los formularios.
  barrios: ['Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito', 'Chacarita', 'Coghlan', 'Colegiales', 'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers', 'Mataderos', 'Monte Castro', 'Montserrat', 'Nueva Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda', 'Parque Chacabuco', 'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro', 'Saavedra', 'San Cristóbal', 'San Nicolás', 'San Telmo', 'Vélez Sarsfield', 'Versalles', 'Villa Crespo', 'Villa del Parque', 'Villa Devoto', 'Villa General Mitre', 'Villa Lugano', 'Villa Luro', 'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Real', 'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza'],
  // Categorías de prendas del filtro y del recorrido, en este orden. Se reconocen dentro de Especialidad.
  categories: ['Sastrería & Archivo', 'Denim & Streetwear 90s', 'Sin género / Oversized', 'Carteras, Calzado & Accesorios', 'Cuero & Tapados'],
  // Respaldo mientras la columna Clasificación esté vacía. Otras tipologías quedan sin clasificar.
  classificationByType: { 'boutique vintage': 'Vintage', 'feria americana': 'Segunda mano', 'cadena de reventa': 'Segunda mano' },
  // Solo valores originales del formulario. "Evento" se distingue dentro de descripcion.
  formTypes: ['Boutique Vintage', 'Feria americana', 'Feria colectiva', 'Cadena de reventa'],
  pageSize: 10,
  route: { visitMinutes: 25, walkingKmh: 4, distanceFactor: 1.3, maxLegKm: 1.8, expressMinutes: 120, fullMinutes: 240 },
  timezone: 'America/Argentina/Buenos_Aires'
};
// Solo equivalencias de prendas; estilos, materiales y género no se convierten en prendas.
export const GARMENTS = {
  'jeans': 'Jeans', 'jean': 'Jeans', 'pantalon de jean': 'Jeans', 'pantalones de jean': 'Jeans',
  'campera': 'Camperas', 'camperas': 'Camperas', 'camperas de jean': 'Camperas', 'campera de jean': 'Camperas',
  'camisa': 'Camisas', 'camisas': 'Camisas', 'camiseria': 'Camisas',
  'remera': 'Remeras', 'remeras': 'Remeras', 'remeras graficas': 'Remeras',
  'vestido': 'Vestidos', 'vestidos': 'Vestidos', 'pollera': 'Polleras', 'polleras': 'Polleras',
  'pantalon': 'Pantalones', 'pantalones': 'Pantalones', 'sweater': 'Sweaters', 'sweaters': 'Sweaters',
  'pulover': 'Sweaters', 'puloveres': 'Sweaters', 'buzo': 'Buzos', 'buzos': 'Buzos',
  'tapado': 'Tapados', 'tapados': 'Tapados', 'saco': 'Sacos', 'sacos': 'Sacos',
  'zapatos': 'Calzado', 'calzado': 'Calzado', 'botas': 'Calzado', 'zapatillas': 'Calzado',
  'accesorios': 'Accesorios', 'carteras': 'Carteras', 'bolsos': 'Bolsos'
};
