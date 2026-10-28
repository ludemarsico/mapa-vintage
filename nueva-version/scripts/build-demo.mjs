import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
let html = readFileSync(new URL('index.html', root), 'utf8');
html = html.replace('<body id="inicio">', '<body id="inicio" data-demo="true" class="demo-mode"><aside class="demo-banner" aria-label="Modo de demostración"><div><strong>Contenido de demostración</strong><p>Muestras de cartelera, collage y papeles. No son publicaciones reales. Los envíos están desactivados.</p></div><a href="index.html">Volver a la versión real ↗</a></aside>');
html = html.replace('<title>Mapa Vintage — Ropa vintage y segunda mano en Buenos Aires</title>', '<title>Contenido de demostración · Mapa Vintage</title><meta name="robots" content="noindex,nofollow">');
html = html.replace(/action="https:\/\/script\.google\.com\/[^\"]+"/, 'action="about:blank"');
writeFileSync(new URL('demostracion.html', root), html);
console.log('demostracion.html actualizada. La página normal sigue con la demostración desactivada.');
