import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../integraciones/hallazgos/worker.mjs';
import { photoError, hallazgoEndpoint, confirmedReceipt, PHOTO_LIMIT } from '../js/hallazgo.js';
import { serializeProposal } from '../js/forms.js';
const ID = '22222222-2222-4222-8222-222222222222';
function environment() {
  const records = new Map(), objects = new Map(); let puts = 0;
  const env = {
    ALLOWED_ORIGINS: 'https://example.com', TURNSTILE_SECRET_KEY: 'test-secret-not-a-real-key',
    DB: { prepare(sql) { return { bind(...values) { return {
      async first() { return records.get(values[0]) || null; },
      async run() {
        if (sql.startsWith('INSERT')) { if (records.has(values[0])) throw new Error('duplicate'); records.set(values[0], { fingerprint: values[1], estado: values[2], alias: values[3], imagen_key: values[6], bytes: values[8] }); }
        else if (sql.startsWith('UPDATE')) { const record = records.get(values[1]); if (record && record.estado === values[2]) record.estado = values[0]; }
        else if (sql.startsWith('DELETE')) { const record = records.get(values[0]); if (record?.estado === values[1]) records.delete(values[0]); }
        return { success: true };
      }
    }; } }; } },
    BUCKET: { async put(key, bytes) { puts++; objects.set(key, bytes); return { key, size: bytes.byteLength }; }, async head(key) { const bytes = objects.get(key); return bytes ? { key, size: bytes.byteLength } : null; }, async delete(key) { objects.delete(key); } }
  };
  return { env, records, objects, puts: () => puts };
}
function request({ origin = 'https://example.com', text = 'Texto de prueba', social = '', bytes = [137,80,78,71,13,10,26,10,0], mime = 'image/png' } = {}) {
  const form = new FormData(); form.set('submission_id', ID); form.set('alias', 'Alias de prueba'); form.set('text', text); form.set('social_url', social); form.set('cf-turnstile-response', 'test-token'); form.set('photo', new File([new Uint8Array(bytes)], 'prueba.png', { type: mime }));
  return new Request('https://receiver.example/hallazgos', { method: 'POST', body: form, headers: { Origin: origin } });
}
const verified = { fetch: async () => Response.json({ success: true, hostname: 'example.com', action: 'hallazgo' }) };
test('receptor confirma solo después de guardar foto privada y registro pendiente', async () => {
  const state = environment(), response = await handleRequest(request(), state.env, verified);
  assert.equal(response.status, 202); assert.deepEqual(await response.json(), { received: true, id: ID }); assert.equal(state.records.get(ID).estado, 'pendiente'); assert.equal(state.objects.size, 1);
});
test('reintento idéntico devuelve el mismo recibo sin duplicar la imagen', async () => {
  const state = environment(); await handleRequest(request(), state.env, verified); const response = await handleRequest(request(), state.env, verified); assert.equal(response.status, 202); assert.equal(state.puts(), 1); assert.equal(state.records.size, 1);
});
test('ID reutilizado con otro contenido se rechaza sin sobrescribir', async () => { const s = environment(); await handleRequest(request(), s.env, verified); assert.equal((await handleRequest(request({ text: 'Otro texto' }), s.env, verified)).status, 409); assert.equal(s.puts(), 1); });
test('fallo al guardar imagen no confirma recepción y retira la reserva', async () => { const s = environment(); s.env.BUCKET.put = async () => { throw new Error('failure'); }; const r = await handleRequest(request(), s.env, verified); assert.equal(r.status, 503); assert.equal(s.records.size, 0); assert.equal(s.objects.size, 0); assert.equal((await r.json()).received, undefined); });
test('no acepta orígenes ajenos', async () => { const s = environment(); assert.equal((await handleRequest(request({ origin: 'https://other.example' }), s.env, verified)).status, 403); assert.equal(s.puts(), 0); });
test('preflight conserva el origen exacto permitido', async () => { const s = environment(); const r = await handleRequest(new Request('https://receiver.example/hallazgos', { method: 'OPTIONS', headers: { Origin: 'https://example.com' } }), s.env, verified); assert.equal(r.status, 204); assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://example.com'); });
test('firma de archivo incompatible se rechaza antes del almacenamiento', async () => { const s = environment(); assert.equal((await handleRequest(request({ bytes: [60,115,118,103,62] }), s.env, verified)).status, 415); assert.equal(s.puts(), 0); });
test('Turnstile debe validar acción y hostname', async () => { for (const result of [{ success: false }, { success: true, hostname: 'other.example', action: 'hallazgo' }, { success: true, hostname: 'example.com', action: 'other' }]) { const s = environment(); const r = await handleRequest(request(), s.env, { fetch: async () => Response.json(result) }); assert.equal(r.status, 403); assert.equal(s.puts(), 0); } });
test('sin claves o bindings el receptor queda inhabilitado', async () => { const s = environment(); delete s.env.TURNSTILE_SECRET_KEY; assert.equal((await handleRequest(request(), s.env, verified)).status, 503); assert.equal(s.puts(), 0); });
test('no expone imágenes ni registros por GET', async () => { const s = environment(); assert.equal((await handleRequest(new Request('https://receiver.example/hallazgos', { headers: { Origin: 'https://example.com' } }), s.env, verified)).status, 405); });
test('enlaces inseguros no se guardan', async () => { const s = environment(); assert.equal((await handleRequest(request({ social: 'javascript:alert(1)' }), s.env, verified)).status, 400); assert.equal(s.puts(), 0); });
test('límite total del cuerpo se aplica antes de parsear ni almacenar', async () => { const s = environment(); const r = new Request('https://receiver.example/hallazgos', { method: 'POST', headers: { Origin: 'https://example.com', 'Content-Type': 'multipart/form-data; boundary=test' }, body: new Uint8Array(6 * 1024 * 1024 + 1) }); assert.equal((await handleRequest(r, s.env, verified)).status, 413); assert.equal(s.puts(), 0); });
test('el cliente rechaza Apps Script como receptor de fotos', () => { assert.equal(hallazgoEndpoint('https://script.google.com/macros/s/test/exec'), ''); assert.equal(hallazgoEndpoint('http://example.com/hallazgos'), ''); assert.equal(hallazgoEndpoint('https://example.com/hallazgos'), 'https://example.com/hallazgos'); });
test('solo un recibo estructurado y correspondiente confirma el envío', () => { assert.equal(confirmedReceipt({ status: 202 }, { received: true, id: ID }, ID), true); assert.equal(confirmedReceipt({ status: 202 }, { received: true, id: ID }, 'otro'), false); assert.equal(confirmedReceipt({ status: 200 }, { ok: true }, ID), false); assert.equal(confirmedReceipt({ status: 500 }, { received: true, id: ID }, ID), false); });
test('foto local exige formato admitido y tamaño válido', () => { assert.ok(photoError(null)); assert.ok(photoError({ type: 'image/svg+xml', size: 1 })); assert.ok(photoError({ type: 'image/png', size: PHOTO_LIMIT + 1 })); assert.equal(photoError({ type: 'image/png', size: 50 }), ''); });
test('Agenda conserva tipo compatible y contexto dentro de descripcion', () => { const s = serializeProposal({ source: 'evento', type: 'Feria colectiva', event: 'Fecha de prueba', text: 'Texto íntegro' }); assert.match(s, /Propuesta desde Agenda/); assert.match(s, /Agenda: feria o evento/); assert.ok(s.endsWith('Texto íntegro')); });

test('un reintento no confirma un objeto que ya no existe', async () => { const s=environment(); await handleRequest(request(),s.env,verified); s.objects.clear(); const r=await handleRequest(request(),s.env,verified); assert.equal(r.status,503); assert.equal((await r.json()).received,undefined); });
