import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { serializeProposal, destinationFor, proposalEndpoint } from '../js/forms.js';
// El Apps Script se ejecuta en un contexto aislado; los servicios de Google se reemplazan por simulaciones.
const context = vm.createContext({ console });
vm.runInContext(readFileSync(new URL('../integraciones/propuestas/Code.gs', import.meta.url), 'utf8'), context);
const ID = '33333333-3333-4333-8333-333333333333';
function services({ turnstile = { success: true, action: 'propuesta', hostname: 'mapavintage.example' }, rate = true } = {}) {
  const rows = [], received = new Set();
  return { rows, received,
    prop: key => ({ ALLOWED_HOSTNAMES: 'mapavintage.example, otro.example' })[key],
    now: () => 'AHORA', wasReceived: id => received.has(id), allowRate: () => rate,
    verifyTurnstile: token => (token === 'token-valido' ? turnstile : null),
    append(name, headers, row, id) { rows.push({ name, headers, row }); received.add(id); } };
}
const base = { submission_id: ID, origen: 'propio', nombre: 'Prueba', tipologia: 'Boutique Vintage', direccion: 'Calle de prueba 123', barrio: 'Palermo', confirma: 'si', 'cf-turnstile-response': 'token-valido' };
const handle = (params, s) => context.handle_(params, s);
test('propuesta de local va a "Espacios a verificar" con columnas de la planilla', () => {
  const s = services(); const r = handle({ ...base, especialidad: 'Cuero & Tapados', precio: '$$', horarios: 'Lunes a viernes' }, s);
  assert.equal(r.received, true); assert.equal(r.id, ID); assert.equal(r.destino, 'espacios');
  assert.equal(s.rows[0].name, 'Espacios a verificar');
  const row = Object.fromEntries(s.rows[0].headers.map((h, i) => [h, s.rows[0].row[i]]));
  assert.equal(row.Barrio, 'Palermo'); assert.equal(row.Especialidad, 'Cuero & Tapados'); assert.equal(row['Rango Precio'], '$$'); assert.equal(row.Estado, 'Pendiente');
});
test('ferias y propuestas desde Agenda van a "Agenda a verificar"', () => {
  for (const params of [{ ...base, tipologia: 'Feria colectiva', fecha: '2026-11-08', horario: 'Domingos de 10 a 18' }, { ...base, origen: 'evento', tipologia: 'Feria colectiva' }]) {
    const s = services(); assert.equal(handle(params, s).destino, 'agenda'); assert.equal(s.rows[0].name, 'Agenda a verificar');
  }
});
test('sin verificación válida no se guarda nada', () => {
  for (const [params, opts] of [[{ ...base, 'cf-turnstile-response': '' }], [base, { turnstile: { success: false } }], [base, { turnstile: { success: true, action: 'hallazgo', hostname: 'mapavintage.example' } }], [base, { turnstile: { success: true, action: 'propuesta', hostname: 'sitio-ajeno.example' } }]]) {
    const s = services(opts); const r = handle(params, s); assert.equal(r.received, false); assert.equal(s.rows.length, 0);
  }
});
test('valida campos obligatorios, listas cerradas, enlaces y fechas', () => {
  for (const change of [{ nombre: '' }, { barrio: '' }, { tipologia: 'Showroom (con cita)' }, { origen: 'otro' }, { confirma: '' }, { web: 'javascript:alert(1)' }, { web: 'https://usuario:clave@example.com' }, { especialidad: 'Inventada' }, { precio: '$$$$' }, { fecha: '2026-02-30' }, { fecha: '2026-10-300' }, { submission_id: 'no-uuid' }]) {
    const s = services(); assert.equal(handle({ ...base, ...change }, s).received, false, JSON.stringify(change)); assert.equal(s.rows.length, 0);
  }
});
test('textos que parecen fórmulas se guardan como texto y se acotan', () => {
  const s = services(); handle({ ...base, nombre: '=IMPORTXML("https://example.com")', descripcion: '+cmd\nsegunda línea', direccion: 'x'.repeat(500) }, s);
  const row = s.rows[0].row; assert.equal(row[3], '\'=IMPORTXML("https://example.com")'); assert.equal(row[13], '\'+cmd\nsegunda línea'); assert.equal(row[5].length, 200);
});
test('un reintento con el mismo identificador no duplica la fila', () => {
  const s = services(); handle(base, s); const again = handle({ ...base, 'cf-turnstile-response': '' }, s);
  assert.deepEqual({ ...again }, { received: true, id: ID }); assert.equal(s.rows.length, 1);
});
test('el límite de ritmo frena ráfagas sin guardar', () => { const s = services({ rate: false }); assert.equal(handle(base, s).received, false); assert.equal(s.rows.length, 0); });
test('cliente: destino y receptor permitido', () => {
  assert.equal(destinationFor('evento', 'Boutique Vintage'), 'agenda'); assert.equal(destinationFor('propio', 'Feria colectiva'), 'agenda'); assert.equal(destinationFor('recomendado', 'Cadena de reventa'), 'espacios');
  assert.equal(proposalEndpoint('https://script.google.com/macros/s/AKfy-cb_123/exec'), 'https://script.google.com/macros/s/AKfy-cb_123/exec');
  for (const bad of ['http://script.google.com/macros/s/x/exec', 'https://script.google.com.evil.example/macros/s/x/exec', 'https://example.com/macros/s/x/exec', 'https://script.google.com/macros/s/x/exec?redirect=1', '']) assert.equal(proposalEndpoint(bad), '', bad);
});
test('formulario original: barrio y detalles viajan en la descripción', () => {
  const text = serializeProposal({ source: 'propio', type: 'Boutique Vintage', event: '', text: 'Texto', details: { Barrio: 'Palermo', Horarios: '', Especialidad: 'Cuero & Tapados' } });
  assert.match(text, /\[Barrio: Palermo\]/); assert.match(text, /\[Especialidad: Cuero & Tapados\]/); assert.doesNotMatch(text, /Horarios/); assert.ok(text.endsWith('Texto'));
});
