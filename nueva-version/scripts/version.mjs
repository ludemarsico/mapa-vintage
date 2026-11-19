// Pone el mismo número de versión en todas las referencias a CSS y JS propios (index.html, demostracion.html y los
// import entre módulos). Así el navegador no puede mezclar la página nueva con estilos o código viejos guardados.
// Uso, después de cambiar CSS o JS: node scripts/version.mjs  (o npm run version)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const now = new Date(), pad = n => String(n).padStart(2, '0');
const version = process.argv[2] || `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
if (!/^[\w.-]+$/.test(version)) throw new Error('Versión inválida: ' + version);
const files = ['index.html', 'demostracion.html', ...readdirSync(new URL('js/', root)).filter(f => f.endsWith('.js')).map(f => 'js/' + f)];
for (const file of files) {
  const url = new URL(file, root), before = readFileSync(url, 'utf8');
  const after = file.endsWith('.html')
    ? before.replace(/((?:href|src)="(?:css|js)\/[\w-]+\.(?:css|js))(?:\?v=[\w.-]+)?"/g, `$1?v=${version}"`)
    : before.replace(/(from '\.\/[\w-]+\.js)(?:\?v=[\w.-]+)?'/g, `$1?v=${version}'`);
  if (after !== before) writeFileSync(url, after);
}
console.log('Versión de CSS y JS: ' + version);
