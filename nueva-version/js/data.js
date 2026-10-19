import { CONFIG, GARMENTS } from './config.js';
export const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
// CSV RFC 4180: comas, comillas escapadas, CRLF y saltos de párrafo entre comillas.
export function parseCSV(input) {
  const text = input.replace(/^\uFEFF/, '');
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell === '') quoted = !quoted;
      else throw new Error('CSV: comillas inválidas');
    } else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(v => v.trim())) rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (quoted) throw new Error('CSV: comillas sin cerrar');
  row.push(cell); if (row.some(v => v.trim())) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift().map(h => h.trim());
  if (new Set(headers.map(fold)).size !== headers.length) throw new Error('CSV: encabezados repetidos');
  return rows.map(values => {
    if (values.length !== headers.length) throw new Error('CSV: cantidad de columnas incorrecta');
    return Object.fromEntries(headers.map((h, i) => [h, values[i].trim()]));
  });
}
export function safeURL(value) {
  try { const u = new URL(String(value).trim()); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function socialURL(value) {
  const direct = safeURL(value); if (direct) return direct;
  const match = String(value || '').match(/(?:^|[\s(])@([a-zA-Z0-9_.]{1,30})(?=[\s)•·]|$)/);
  return match ? 'https://www.instagram.com/' + match[1] + '/' : '';
}
export function safeImage(value) {
  const s = String(value || '').trim();
  if (/^assets\/[\p{L}\p{M}\p{N}_./ -]+\.(?:webp|jpg|jpeg|png|avif)$/iu.test(s) && !s.split('/').includes('..')) return s;
  const url = safeURL(s); return url.startsWith('https:') ? url : '';
}
const hash = text => { let h = 2166136261; for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
const get = (row, key) => {
  const names = CONFIG.columns[key] || [key];
  const found = Object.keys(row).find(h => names.some(n => fold(n) === fold(h)));
  return found ? String(row[found]).trim() : '';
};
export function normalizeStores(rows) {
  if (rows.length && (!Object.keys(rows[0]).some(h => fold(h) === 'nombre') || !Object.keys(rows[0]).some(h => fold(h) === 'tipologia'))) throw new Error('La fuente no tiene los encabezados esperados: Nombre y Tipología.');
  const stores = [], review = []; const ids = new Set();
  for (const row of rows) {
    const nombre = get(row, 'nombre'), tipo = fold(get(row, 'tipo')), direccion = get(row, 'direccion');
    const raw = [tipo, get(row, 'descripcion'), direccion, get(row, 'horarios')].map(fold).join(' ');
    const lat = Number(get(row, 'lat').replace(',', '.')), lng = Number(get(row, 'lng').replace(',', '.'));
    const ciudad = fold(get(row, 'ciudad'));
    let reason = '';
    if (!nombre || !direccion) reason = 'Falta nombre o dirección';
    else if (/showroom|cita previa|con cita|solo online|exclusivamente online|tienda online|unicamente online/.test(raw)) reason = 'Showroom, cita previa u online';
    else if (/feria colectiva|evento|pop.?up|puesto de feria/.test(tipo) && !/\blocal a la calle\b/.test(fold(get(row, 'descripcion')))) reason = 'Corresponde revisar para agenda';
    else if (ciudad && !['caba', 'buenos aires', 'capital federal', 'ciudad autonoma de buenos aires'].includes(ciudad)) reason = 'Fuera de CABA';
    else if (!get(row, 'lat') || !get(row, 'lng') || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -34.71 || lat > -34.52 || lng < -58.54 || lng > -58.32) reason = 'Coordenadas incompletas o fuera del área CABA; revisar';
    const presencial = fold(get(row, 'presencial'));
    const declared = ['si', 'true', '1'].includes(presencial) || ['boutique vintage', 'cadena de reventa', 'local a la calle'].includes(tipo) || /\blocal (?:a la calle|de reventa)\b|\btienda de segunda mano\b/.test(fold(get(row, 'descripcion')));
    if (!reason && (['no', 'false', '0'].includes(presencial) || !declared)) reason = 'Confirmar que es un local a la calle';
    if (!reason && get(row, 'estado') && !['publicado', 'activo'].includes(fold(get(row, 'estado')))) reason = 'Sin publicación aprobada';
    const id = get(row, 'id') || 'mv-' + hash(fold(nombre + '|' + direccion));
    if (!reason && ids.has(id)) reason = 'ID duplicado';
    if (reason) { review.push({ id, nombre, reason }); continue; }
    ids.add(id);
    const source = get(row, 'prendas') || get(row, 'especialidad');
    const rawTags = source.split(/[,;|&]/).map(t => t.trim()).filter(Boolean);
    const prendas = [...new Set(rawTags.map(t => GARMENTS[fold(t)]).filter(Boolean))];
    const precio = get(row, 'precio').replace(/\s/g, '');
    stores.push({ id, nombre, direccion, barrio: get(row, 'barrio') || 'Barrio sin informar', lat, lng, tipo,
      precio: ['$', '$$', '$$$'].includes(precio) ? precio : '', prendas, especialidades: rawTags, categoria: get(row, 'especialidad'),
      horarios: get(row, 'horarios'), web: socialURL(get(row, 'web')), descripcion: get(row, 'descripcion') });
  }
  return { stores, review };
}
export function matches(store, filters) {
  return (!filters.query || fold(store.nombre).includes(fold(filters.query))) &&
    (!filters.barrio || fold(store.barrio) === fold(filters.barrio)) &&
    (!filters.precio || store.precio === filters.precio) &&
    (!filters.prendas?.length || filters.prendas.some(p => store.prendas.includes(p) || (store.categoria && fold(store.categoria) === fold(p))));
}
export async function fetchRows(url) {
  if (!url) return { connected: false, rows: [] };
  if (!safeURL(url)) throw new Error('URL CSV inválida');
  const response = await fetch(url, { signal: AbortSignal.timeout(18000), credentials: 'omit' });
  if (!response.ok) throw new Error('No se pudo leer la fuente (' + response.status + ')');
  const text = await response.text();
  if (/^\s*</.test(text)) throw new Error('La fuente devolvió HTML en lugar de CSV');
  return { connected: true, rows: parseCSV(text) };
}
export const published = rows => rows.filter(r => fold(r.estado) === 'publicado');
export function buenosAiresDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en', { timeZone: CONFIG.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const d = new Date(value + 'T12:00:00-03:00');
  return !Number.isNaN(+d) && buenosAiresDate(d) === value;
}
// Recurrencias verificadas: semanal:1,3 (lunes, miércoles), mensual:15, o vacía.
export function nextEventDate(row, today = buenosAiresDate()) {
  if (!validDate(row.fecha_inicio) || (row.fecha_fin && !validDate(row.fecha_fin))) return '';
  const start = row.fecha_inicio, end = row.fecha_fin || '';
  if (end && (end < today || end < start)) return '';
  if (!row.recurrencia) return (end || start) >= today ? (start < today ? today : start) : '';
  const rule = fold(row.recurrencia);
  for (let i = 0; i < 367; i++) {
    const d = new Date(today + 'T12:00:00-03:00'); d.setUTCDate(d.getUTCDate() + i);
    const date = buenosAiresDate(d);
    if (date < start || (end && date > end)) continue;
    if (/^semanal:[1-7](,[1-7])*$/.test(rule) && rule.split(':')[1].split(',').map(Number).includes(d.getUTCDay() || 7)) return date;
    if (/^mensual:(?:[1-9]|[12]\d|3[01])$/.test(rule) && Number(rule.split(':')[1]) === d.getUTCDate()) return date;
  }
  return '';
}
