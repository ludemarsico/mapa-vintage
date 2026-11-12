import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { serializeProposal, destinationFor, aportesEndpoint, confirmedReceipt } from '../js/forms.js';
import { photoError } from '../js/hallazgo.js';
import { receiverPosts } from '../js/data.js';
// El Apps Script se ejecuta en un contexto aislado; los servicios de Google se reemplazan por simulaciones.
const context = vm.createContext({ console });
vm.runInContext(readFileSync(new URL('../integraciones/aportes/Code.gs', import.meta.url), 'utf8'), context);
const ID = '33333333-3333-4333-8333-333333333333';
const JPEG = [255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1], PNG = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13];
function services({ rate = true, sheet = [], point = { lat: -34.5892459, lng: -58.431548 } } = {}) {
  const saved = [], received = new Set(), files = [], shared = [], cache = new Map();
  return { saved, files, shared,
    now: () => 'AHORA', stamp: () => '10/11/2026 15:30', geocode: () => point, wasReceived: id => received.has(id), allowRate: () => rate,
    decode: text => { try { return JSON.parse(text); } catch { return null; } },
    saveFile(bytes, type, name) { files.push({ bytes, type, name }); return { id: 'foto-' + files.length, url: 'https://drive.google.com/file/d/foto-' + files.length + '/view' }; },
    share: id => shared.push(id), cacheGet: key => cache.get(key), cachePut: (key, value) => cache.set(key, value),
    rows: () => sheet,
    append(where, headers, record, id, note) { saved.push({ book: where.book, name: where.sheet, headers, record, note }); received.add(id); } };
}
const base = { tipo: 'espacio', submission_id: ID, origen: 'propio', nombre: 'Prueba', tipologia: 'Boutique Vintage', direccion: 'Calle de prueba 123', barrio: 'Palermo', confirma: 'si' };
const photo = { tipo: 'hallazgo', submission_id: ID, alias: 'Lu', texto: 'Una campera heredada.', red: 'https://www.instagram.com/prueba/', foto: JSON.stringify(JPEG) };
const handle = (params, s) => context.handle_(params, s);
const DIRECTORIO = ['ID', 'Nombre', 'Barrio', 'Dirección', 'Latitud', 'Longitud', 'Tipología', 'Rango Precio', 'Especialidad', 'Horarios', 'Instagram', 'Descripción breve'];
const AGENDA = ['ID', 'Nombre', 'Barrio', 'Dirección', 'Latitud', 'Longitud', 'Tipología', 'Rango Precio', 'Especialidad', 'Días', 'Horarios', 'Instagram', 'Descripción breve'];
test('un local va a Aportes del Directorio, cada dato en la columna con su nombre', () => {
  const s = services(); const r = handle({ ...base, origen: 'recomendado', horarios: 'Lunes a viernes', web: 'https://example.com', descripcion: 'Ropa de los 70' }, s);
  assert.equal(r.received, true); assert.equal(r.id, ID); assert.equal(r.para, 'Directorio');
  const { book, name, headers, record, note } = s.saved[0];
  assert.equal(book, 'directorio'); assert.equal(name, 'Aportes'); assert.deepEqual([...headers], DIRECTORIO);
  assert.deepEqual([...context.rowFor_(DIRECTORIO, record)], ['', 'Prueba', 'Palermo', 'Calle de prueba 123', -34.5892459, -58.431548, 'Boutique Vintage', '', '', 'Lunes a viernes', 'https://example.com', 'Ropa de los 70']);
  assert.ok(note.includes('10/11/2026 15:30')); assert.match(note, /Recomendación de visitante/); assert.match(note, new RegExp(ID));
});
test('ferias y propuestas desde Agenda van a Aportes de la Agenda, con la fecha en Días', () => {
  const s = services(); assert.equal(handle({ ...base, tipologia: 'Feria colectiva', fecha: '2026-11-08', horario: 'Domingos de 10 a 18' }, s).para, 'Agenda');
  const { book, name, headers, record } = s.saved[0];
  assert.equal(book, 'agenda'); assert.equal(name, 'Aportes'); assert.deepEqual([...headers], AGENDA);
  assert.deepEqual([...context.rowFor_(AGENDA, record)], ['', 'Prueba', 'Palermo', 'Calle de prueba 123', -34.5892459, -58.431548, 'Feria colectiva', '', '', '08/11/2026', 'Domingos de 10 a 18', '', '']);
  const e = services(); assert.equal(handle({ ...base, origen: 'evento', tipologia: 'Feria colectiva' }, e).para, 'Agenda'); assert.equal(e.saved[0].book, 'agenda');
});
test('las columnas se reconocen por nombre, en cualquier orden y sin importar tildes', () => {
  assert.deepEqual([...context.rowFor_(['Descripcion breve', 'NOMBRE', 'Otra', 'Direccion'], { 'Nombre': 'A', 'Dirección': 'B', 'Descripción breve': 'C' })], ['C', 'A', '', 'B']);
});
test('una ubicación fuera de CABA o no encontrada deja Latitud y Longitud vacías', () => {
  for (const point of [null, { lat: -31.4, lng: -64.2 }]) {
    const s = services({ point }); handle(base, s); assert.equal(s.saved[0].record.Latitud, ''); assert.equal(s.saved[0].record.Longitud, '');
  }
});
test('el enlace de la planilla de la Agenda da su identificador', () => {
  assert.equal(context.bookId_('https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_-0123456789/edit#gid=0'), '1AbCdEfGhIjKlMnOpQrStUvWxYz_-0123456789');
  assert.equal(context.bookId_(''), ''); assert.equal(context.bookId_('https://example.com'), '');
});
test('valida campos obligatorios, listas cerradas, enlaces y fechas', () => {
  for (const change of [{ nombre: '' }, { barrio: '' }, { tipologia: 'Showroom (con cita)' }, { origen: 'otro' }, { confirma: '' }, { web: 'javascript:alert(1)' }, { web: 'https://usuario:clave@example.com' }, { fecha: '2026-02-30' }, { submission_id: 'no-uuid' }, { tipo: 'otro' }]) {
    const s = services(); assert.equal(handle({ ...base, ...change }, s).received, false, JSON.stringify(change)); assert.equal(s.saved.length, 0);
  }
});
test('textos que parecen fórmulas se guardan como texto y se acotan', () => {
  assert.equal(context.sheetSafe_('=IMPORTXML("x")'), '\'=IMPORTXML("x")');
  const s = services(); handle({ ...base, nombre: 'x'.repeat(500) }, s); assert.equal(s.saved[0].record.Nombre.length, 180);
});
test('un reintento con el mismo identificador no duplica la fila', () => {
  const s = services(); handle(base, s); assert.equal(handle(base, s).received, true); assert.equal(s.saved.length, 1);
});
test('el campo trampa y el límite de ritmo no guardan nada', () => {
  const trap = services(); assert.equal(handle({ ...base, trampa: 'spam' }, trap).received, true); assert.equal(trap.saved.length, 0);
  const busy = services({ rate: false }); assert.equal(handle(base, busy).received, false); assert.equal(busy.saved.length, 0);
});
test('un hallazgo guarda la foto en Drive y una fila Pendiente en Hallazgos', () => {
  const s = services(); const r = handle(photo, s);
  assert.equal(r.received, true); assert.equal(s.files.length, 1); assert.equal(s.files[0].type, 'image/jpeg'); assert.equal(s.files[0].name, 'hallazgo-' + ID + '.jpg');
  const { name, record } = s.saved[0];
  assert.equal(name, 'Hallazgos'); assert.equal(record['ID de foto'], 'foto-1'); assert.equal(record['Nombre o alias'], 'Lu'); assert.equal(record.Estado, 'Pendiente');
  assert.equal(handle({ ...photo, submission_id: '44444444-4444-4444-8444-444444444444', foto: JSON.stringify(PNG) }, s).received, true); assert.equal(s.files[1].type, 'image/png');
});
test('un hallazgo sin foto válida, sin texto o con enlace inseguro no se guarda', () => {
  for (const change of [{ foto: '' }, { foto: JSON.stringify([60, 115, 118, 103, 0, 0, 0, 0, 0, 0, 0, 0]) }, { alias: '' }, { texto: '' }, { red: 'javascript:alert(1)' }]) {
    const s = services(); assert.equal(handle({ ...photo, ...change }, s).received, false, JSON.stringify(change)); assert.equal(s.files.length, 0); assert.equal(s.saved.length, 0);
  }
});
test('el muro entrega solo hallazgos publicados y comparte su foto', () => {
  const sheet = [
    { 'ID de envío': 'a', 'Nombre o alias': 'Ana', Texto: 'Hola', Instagram: '', 'ID de foto': 'F1', Estado: 'Publicado' },
    { 'ID de envío': 'b', 'Nombre o alias': 'Bea', Texto: 'Chau', Instagram: '', 'ID de foto': 'F2', Estado: 'Pendiente' },
    { 'ID de envío': 'c', 'Nombre o alias': 'Cami', Texto: 'Sí', Instagram: '', 'ID de foto': 'F3', Estado: 'Descartado' }];
  const s = services({ sheet }); const body = JSON.parse(JSON.stringify(context.wall_(s)));
  assert.deepEqual(body.posts.map(p => p.id), ['a']); assert.deepEqual(s.shared, ['F1']);
  assert.equal(body.posts[0].imagen, 'https://lh3.googleusercontent.com/d/F1=w1200');
  assert.deepEqual(receiverPosts(body).map(p => p.nombre_alias), ['Ana']);
});
test('el sitio solo muestra hallazgos con fotos de Google y datos completos', () => {
  const posts = receiverPosts({ posts: [
    { id: '1', nombre_alias: 'Ana', texto: 'x', imagen: 'https://lh3.googleusercontent.com/d/abc_-1=w1200', red_url: 'javascript:alert(1)' },
    { id: '2', nombre_alias: 'Bea', imagen: 'https://example.com/foto.jpg' }, { id: '3', nombre_alias: '', imagen: 'https://lh3.googleusercontent.com/d/abc=w1200' }] });
  assert.deepEqual(posts.map(p => p.id), ['1']); assert.equal(posts[0].red_url, '');
  assert.deepEqual(receiverPosts(null), []);
});
test('cliente: receptor permitido, destino y recibo', () => {
  assert.equal(aportesEndpoint('https://script.google.com/macros/s/AKfy-cb_1/exec'), 'https://script.google.com/macros/s/AKfy-cb_1/exec');
  for (const bad of ['http://script.google.com/macros/s/x/exec', 'https://example.com/macros/s/x/exec', 'https://script.google.com/macros/s/x/exec?a=1', '']) assert.equal(aportesEndpoint(bad), '');
  assert.equal(destinationFor('evento', 'Boutique Vintage'), 'agenda'); assert.equal(destinationFor('propio', 'Feria colectiva'), 'agenda'); assert.equal(destinationFor('recomendado', 'Boutique Vintage'), 'espacios');
  assert.equal(confirmedReceipt({ status: 200 }, { received: true, id: ID }, ID), true);
  assert.equal(confirmedReceipt({ status: 200 }, { received: true, id: '44444444-4444-4444-8444-444444444444' }, ID), false);
  assert.equal(confirmedReceipt({ status: 200 }, { received: false, id: ID }, ID), false);
});
test('foto local: formato admitido y hasta 15 MB', () => {
  assert.ok(photoError(null)); assert.ok(photoError({ type: 'image/svg+xml', size: 1 })); assert.ok(photoError({ type: 'image/jpeg', size: 16 * 1024 * 1024 }));
  assert.equal(photoError({ type: 'image/jpeg', size: 4 * 1024 * 1024 }), '');
});
test('formulario original: barrio y detalles viajan en la descripción', () => {
  const s = serializeProposal({ source: 'recomendado', type: 'Boutique Vintage', event: '', text: 'Texto', details: { Barrio: 'Palermo', Horarios: 'Lunes' } });
  assert.match(s, /Recomendación de visitante/); assert.match(s, /\[Barrio: Palermo\]/); assert.match(s, /\[Horarios: Lunes\]/); assert.match(s, /Texto$/);
});
