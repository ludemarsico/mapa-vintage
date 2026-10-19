export const CONFIG = {
  sources: {
    locales: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8k2lfSgDs566JtZ3TGN9e1u5Wx7XFV-bIsk4iq4aGhKtbZBEMvW385AdhMRd3nfHyoZC12-ti3rUU/pub?output=csv',
    agenda: '', notas: '', muro: ''
  },
  formEndpoint: 'https://script.google.com/macros/s/AKfycbyAOwtD6FOe6xkByXj2hK89gkCdFfydW9FqIH7WDYIdkurvwpYdUD7T9seNHL-CrcjS_Q/exec',
  email: 'mapavintage.ba@gmail.com',
  // Al recibir MAPA (7).jpg: copiar el archivo a assets/logo/ y poner aquí su ruta.
  logo: '',
  // Receptor independiente de imágenes. Nunca usar el Apps Script de locales aquí.
  hallazgos: { endpoint: '', turnstileSiteKey: '' },
  // Figurines originales aportados para los cinco tipos de prendas.
  careImages: {
    'Prendas plisadas': 'assets/cuidados/Falda dorada plisada para muñeca de papel.png',
    'Tapados de lana': 'assets/cuidados/Abrigo recortable de cuadros turquesa.png',
    'Ropa interior': 'assets/cuidados/Recortable vintage de lencería azul.png',
    'Trajes de baño': 'assets/cuidados/Bikini vintage con pestañas de papel.png',
    'Calzado de cuero': 'assets/cuidados/Botines verde oliva con pestañas de papel.png'
  },
  fabricImages: {
    'Seda': 'assets/telas/seda.jpg', 'Satén o raso': 'assets/telas/saten.jpg',
    'Lana': 'assets/telas/lana.jpg', 'Cashmere': 'assets/telas/cashmere.jpg',
    'Lino': 'assets/telas/lino.jpg', 'Denim / jean': 'assets/telas/denim.jpg',
    'Algodón': 'assets/telas/algodon.jpg', 'Microtul': 'assets/telas/microtul.jpg'
  },
  columns: {
    id: ['ID', 'id'], nombre: ['Nombre'], barrio: ['Barrio'], direccion: ['Dirección', 'Direccion'],
    lat: ['Latitud'], lng: ['Longitud'], tipo: ['Tipología', 'Tipologia'], precio: ['Rango Precio'],
    prendas: ['Prendas predominantes', 'Prendas'], especialidad: ['Especialidad'], horarios: ['Horarios'],
    web: ['Instagram', 'Web'], descripcion: ['Descripción breve', 'Descripcion breve'],
    presencial: ['Local a la calle'], ciudad: ['Ciudad'], estado: ['Estado']
  },
  // Solo valores originales del formulario. "Evento" se distingue dentro de descripcion.
  formTypes: ['Boutique Vintage', 'Feria americana', 'Feria colectiva', 'Cadena de reventa'],
  pageSize: 6,
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
