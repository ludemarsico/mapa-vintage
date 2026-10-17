// Solo la página separada demostracion.html puede activar estas muestras.
// Sin personas, comercios, fechas de eventos ni textos atribuidos a la autora.
export const DEMO = typeof document !== 'undefined' && document.body.dataset.demo === 'true';
export const DEMO_AGENDA = ['A', 'B', 'C'].map((letter, i) => ({
  id: 'demo-afiche-' + i, titulo: 'Afiche ' + letter, demo: true,
  descripcion: 'Área para título, fecha, ubicación y condiciones de acceso. Muestra de composición; no anuncia un evento.'
}));
export const DEMO_WALL = [
  { id: 'demo-collage-a', nombre_alias: 'Composición A', texto: 'Espacio para foto y texto.', imagen: 'assets/cuidados/campera.webp', alt: 'Recorte de campera del manual de marca' },
  { id: 'demo-collage-b', nombre_alias: 'Composición B', texto: 'Otra escala, otro recorte.', imagen: 'assets/ciudad/perchero.webp', alt: 'Perchero del manual de marca' },
  { id: 'demo-collage-c', nombre_alias: 'Composición C', texto: 'Lugar para un hallazgo y su descripción.', imagen: 'assets/cuidados/botas.webp', alt: 'Recorte de botas del manual de marca' }
].map(r => ({ ...r, demo: true, red_url: '' }));
export const DEMO_NOTES = ['A', 'B', 'C'].map((letter, i) => ({
  id: 'demo-papel-' + i, titulo: 'Papel ' + letter, bajada: 'Área para título y texto. Esta muestra permite revisar las capas, el tamaño y la lectura.',
  cuerpo: 'Contenido de demostración.\n\nEste papel sirve para probar la lectura, el cambio de orden y el acceso por teclado. No es una nota de Lucia ni una publicación del proyecto.', demo: true
}));
export function demoStamp() { return 'Contenido de demostración'; }
