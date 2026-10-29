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
// Encabezados resueltos una vez por estructura de fila: con miles de filas evita repetir la búsqueda por campo.
const columnCache = new Map();
const columnsFor = (row, columns) => {
  const headers = Object.keys(row), signature = headers.join('\u0000');
  if (!columnCache.has(columns)) columnCache.set(columns, new Map());
  const cache = columnCache.get(columns);
  if (!cache.has(signature)) cache.set(signature, Object.fromEntries(Object.entries(columns).map(([key, names]) => [key, headers.find(h => names.some(n => fold(n) === fold(h)))])));
  return cache.get(signature);
};
const get = (row, key, columns = CONFIG.columns) => { const header = columnsFor(row, columns)[key]; return header ? String(row[header] ?? '').trim() : ''; };
// Sin tildes y en minúsculas, conservando la longitud del texto NFC para ubicar coincidencias.
const plain = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const categoryPatterns = CONFIG.categories.map(name => [name, new RegExp(plain(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s*([/&,])\s*/g, '\\s*$1\\s*').replace(/ +/g, '\\s+'))]);
// Categorías conocidas primero (pueden contener comas); el resto, separado por coma, punto y coma o barra, queda como etiqueta.
export function storeTags(value) {
  let text = String(value || '').normalize('NFC'); const categorias = [];
  for (const [name, pattern] of categoryPatterns) {
    const found = pattern.exec(plain(text));
    if (found) { categorias.push(name); text = text.slice(0, found.index) + ';' + text.slice(found.index + found[0].length); }
  }
  const extras = text.split(/[,;|]/).map(t => t.trim()).filter(Boolean);
  return { categorias, etiquetas: [...new Set([...categorias, ...extras])] };
}
export function classify(value, tipo) {
  const v = fold(value);
  if (!v) return CONFIG.classificationByType[fold(tipo)] || '';
  const vintage = /\bvintage\b/.test(v), segunda = /segunda mano|second hand|thrift/.test(v);
  return vintage && segunda ? 'Vintage y segunda mano' : vintage ? 'Vintage' : segunda ? 'Segunda mano' : '';
}
// La curaduría se hace en la hoja Directorio: todo local incluido ahí se publica.
// Solo quedan afuera las filas que no se pueden mostrar: sin nombre o sin coordenadas para ubicarlas en el mapa.
export function normalizeStores(rows) {
  if (rows.length && !Object.keys(rows[0]).some(h => fold(h) === 'nombre')) throw new Error('La fuente no tiene el encabezado esperado: Nombre.');
  const stores = [], review = []; const ids = new Set();
  for (const row of rows) {
    const nombre = get(row, 'nombre'), tipo = fold(get(row, 'tipo')), direccion = get(row, 'direccion');
    const lat = Number(get(row, 'lat').replace(',', '.')), lng = Number(get(row, 'lng').replace(',', '.'));
    let reason = '';
    if (!nombre) reason = 'Falta el nombre';
    else if (!get(row, 'lat') || !get(row, 'lng') || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) reason = 'Faltan coordenadas o no son válidas';
    let id = get(row, 'id') || 'mv-' + hash(fold(nombre + '|' + direccion));
    if (reason) { review.push({ id, nombre, reason }); continue; }
    // Un ID repetido por error en la hoja no saca al local: se distingue con un sufijo.
    if (ids.has(id)) { let n = 2; while (ids.has(id + '-' + n)) n++; id += '-' + n; }
    ids.add(id);
    const source = get(row, 'prendas') || get(row, 'especialidad');
    const rawTags = source.split(/[,;|&]/).map(t => t.trim()).filter(Boolean);
    const prendas = [...new Set(rawTags.map(t => GARMENTS[fold(t)]).filter(Boolean))];
    const precio = get(row, 'precio').replace(/\s/g, '');
    const barrio = get(row, 'barrio') || 'Barrio sin informar', { categorias, etiquetas } = storeTags(get(row, 'especialidad'));
    stores.push({ id, nombre, direccion, barrio, lat, lng, tipo,
      precio: ['$', '$$', '$$$'].includes(precio) ? precio : '', prendas, especialidades: etiquetas, categoria: get(row, 'especialidad'), categorias,
      clasificacion: classify(get(row, 'clasificacion'), tipo),
      horarios: get(row, 'horarios'), web: socialURL(get(row, 'web')), descripcion: get(row, 'descripcion'),
      busqueda: { nombre: fold(nombre), barrio: fold(barrio), categorias: categorias.map(fold) } });
  }
  return { stores, review };
}
// Los filtros se normalizan una vez y cada local usa sus claves ya calculadas al cargar.
const compileFilters = f => ({ query: fold(f.query), barrio: fold(f.barrio), precio: f.precio || '', prendas: (f.prendas || []).filter(Boolean).map(p => [p, fold(p)]) });
function passes(store, c) {
  const k = store.busqueda || { nombre: fold(store.nombre), barrio: fold(store.barrio), categorias: (store.categorias || [store.categoria]).filter(Boolean).map(fold) };
  return (!c.query || k.nombre.includes(c.query)) && (!c.barrio || k.barrio === c.barrio) && (!c.precio || store.precio === c.precio) &&
    (!c.prendas.length || c.prendas.some(([p, folded]) => store.prendas.includes(p) || k.categorias.includes(folded)));
}
export const matches = (store, filters) => passes(store, compileFilters(filters));
export const filterStores = (stores, filters) => { const c = compileFilters(filters); return stores.filter(s => passes(s, c)); };
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
// Fechas de la hoja: 2026-11-08 o 8/11/2026 (día/mes/año, como las escribe Sheets en es-AR).
export function sheetDate(value) {
  const s = String(value || '').trim();
  if (validDate(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) return '';
  const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return validDate(iso) ? iso : '';
}
// Hoja "Agenda": todo lo que está en la hoja se publica. Si hay columna Fecha, se ocultan las fechas que ya pasaron;
// las filas sin fecha (con Días y Horarios) se muestran al final, en el orden de la hoja.
export function normalizeEvents(rows, today = buenosAiresDate()) {
  const C = CONFIG.agendaColumns, dated = [], undated = [], ids = new Set();
  for (const row of rows) {
    const g = key => get(row, key, C), nombre = g('nombre');
    if (!nombre) continue;
    const fecha = sheetDate(g('fecha')), fin = sheetDate(g('fechaFin'));
    let next = '';
    if (fecha && g('recurrencia')) { next = nextEventDate({ fecha_inicio: fecha, fecha_fin: fin, recurrencia: g('recurrencia') }, today); if (!next) continue; }
    else if (fecha) { if ((fin || fecha) < today) continue; next = fecha < today ? today : fecha; }
    let id = g('id') || 'ev-' + hash(fold(nombre + '|' + g('fecha') + '|' + g('direccion')));
    if (ids.has(id)) { let n = 2; while (ids.has(id + '-' + n)) n++; id += '-' + n; }
    ids.add(id);
    const precio = g('precio').replace(/\s/g, '');
    const event = { id, nombre, next, fechaTexto: fecha ? '' : g('fecha'), dias: g('dias'), tipo: g('tipo'), horario: g('horario'), precio: ['$', '$$', '$$$'].includes(precio) ? precio : '', especialidad: g('especialidad'), barrio: g('barrio'), direccion: g('direccion'),
      descripcion: g('descripcion'), acceso: g('acceso'), enlace: socialURL(g('enlace')), imagen: safeImage(g('imagen')) };
    (next ? dated : undated).push(event);
  }
  return [...dated.sort((a, b) => a.next.localeCompare(b.next)), ...undated];
}
