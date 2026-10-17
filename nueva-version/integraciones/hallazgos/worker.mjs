// Receptor opcional e independiente. No está desplegado ni conectado en esta entrega.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_FILE = 5 * 1024 * 1024, MAX_BODY = 6 * 1024 * 1024;
export function imageType(bytes) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['image/jpeg', 'jpg'];
  if ([137,80,78,71,13,10,26,10].every((v, i) => bytes[i] === v)) return ['image/png', 'png'];
  const ascii = (a, b) => String.fromCharCode(...bytes.slice(a, b));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return ['image/webp', 'webp'];
  return null;
}
async function boundedForm(request) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new Error('format');
  const reader = request.body?.getReader(); if (!reader) throw new Error('format');
  const chunks = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    length += value.byteLength; if (length > MAX_BODY) { await reader.cancel(); throw new Error('size'); } chunks.push(value);
  }
  return new Response(new Blob(chunks), { headers: { 'Content-Type': request.headers.get('content-type') } }).formData();
}
const trim = value => typeof value === 'string' ? value.trim() : '';
const hex = buffer => [...new Uint8Array(buffer)].map(v => v.toString(16).padStart(2, '0')).join('');
async function run(statement) { const result = await statement.run(); if (result?.success === false) throw new Error('database'); return result; }
export async function handleRequest(request, env, services = { fetch: (...args) => fetch(...args) }) {
  const origin = request.headers.get('Origin') || '';
  const origins = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowed = origins.includes(origin);
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  if (allowed) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
  if (!allowed) return reply(403, { error: 'Origen no autorizado.' });
  if (new URL(request.url).pathname !== '/hallazgos') return reply(404, { error: 'Ruta no disponible.' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } });
  if (request.method !== 'POST') return reply(405, { error: 'Método no disponible.' });
  if (!env.DB || !env.BUCKET || !env.TURNSTILE_SECRET_KEY) return reply(503, { error: 'La recepción todavía no está configurada.' });
  let form;
  try { form = await boundedForm(request); } catch (e) { return reply(e.message === 'size' ? 413 : 400, { error: e.message === 'size' ? 'La foto es demasiado grande.' : 'No pudimos leer el aporte.' }); }
  const id = trim(form.get('submission_id')), alias = trim(form.get('alias')), text = trim(form.get('text')), social = trim(form.get('social_url'));
  const file = form.get('photo'), token = trim(form.get('cf-turnstile-response'));
  if (!UUID.test(id) || !alias || alias.length > 80 || !text || text.length > 1200 || !file || typeof file.arrayBuffer !== 'function') return reply(400, { error: 'Revisá la foto, el texto y el nombre o alias.' });
  if (!file.size || file.size > MAX_FILE) return reply(413, { error: 'La foto debe pesar hasta 5 MB.' });
  if (social) { try { const url = new URL(social); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || social.length > 500) throw new Error(); } catch { return reply(400, { error: 'El enlace de la red social debe empezar con http:// o https://.' }); } }
  const bytes = new Uint8Array(await file.arrayBuffer()), detected = imageType(bytes);
  if (!detected || file.type !== detected[0]) return reply(415, { error: 'Elegí una foto JPG, PNG o WebP válida.' });
  const imageHash = hex(await crypto.subtle.digest('SHA-256', bytes));
  const fingerprint = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([alias, text, social, imageHash]))));
  const receipt = () => reply(202, { received: true, id });
  try {
    const existing = await env.DB.prepare('SELECT fingerprint, estado, imagen_key, bytes FROM aportes WHERE id = ?').bind(id).first();
    if (existing) {
      if (existing.fingerprint !== fingerprint || existing.estado !== 'pendiente') return reply(409, { error: 'Este aporte está en proceso o cambió. Conservá tus datos e intentá de nuevo más tarde.' });
      const stored = await env.BUCKET.head(existing.imagen_key);
      return stored && stored.size === existing.bytes ? receipt() : reply(503, { error: 'No pudimos confirmar el archivo de este aporte.' });
    }
    if (!token || token.length > 2048) return reply(400, { error: 'Completá la verificación antes de enviar.' });
    const verification = await services.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get('CF-Connecting-IP') || undefined, idempotency_key: id }) });
    if (!verification.ok) return reply(503, { error: 'No pudimos comprobar la verificación.' });
    const verified = await verification.json();
    if (!verified.success || verified.hostname !== new URL(origin).hostname || verified.action !== 'hallazgo') return reply(403, { error: 'La verificación venció o no es válida. Intentá de nuevo.' });
    const key = `pendientes/${id}.${detected[1]}`, created = new Date().toISOString();
    // Reserva atómica: evita que dos solicitudes sobreescriban la imagen de un mismo ID.
    try { await run(env.DB.prepare('INSERT INTO aportes (id, fingerprint, estado, nombre_alias, texto, red_url, imagen_key, mime, bytes, creado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, fingerprint, 'recibiendo', alias, text, social, key, detected[0], bytes.byteLength, created)); }
    catch { return reply(409, { error: 'El aporte ya está en proceso. Conservá tus datos e intentá de nuevo más tarde.' }); }
    try {
      const object = await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: detected[0], contentDisposition: 'attachment' } });
      if (!object || object.key !== key || object.size !== bytes.byteLength) throw new Error('storage');
      await run(env.DB.prepare('UPDATE aportes SET estado = ? WHERE id = ? AND estado = ?').bind('pendiente', id, 'recibiendo'));
      return receipt();
    } catch {
      // Nunca confirmar una recepción si no quedaron guardados imagen y registro.
      try {
        const current = await env.DB.prepare('SELECT fingerprint, estado, imagen_key, bytes FROM aportes WHERE id = ?').bind(id).first();
        if (current?.estado === 'pendiente' && current.fingerprint === fingerprint) {
          const stored = await env.BUCKET.head(key); if (stored?.size === bytes.byteLength) return receipt();
        }
        if (current?.estado === 'recibiendo') { await env.BUCKET.delete(key); await run(env.DB.prepare('DELETE FROM aportes WHERE id = ? AND estado = ?').bind(id, 'recibiendo')); }
      } catch { /* Ante estado incierto se conserva para revisión; nunca se confirma a ciegas. */ }
      return reply(503, { error: 'No pudimos guardar el aporte. Tus datos siguen en el formulario.' });
    }
  } catch { return reply(503, { error: 'La recepción no está disponible en este momento.' }); }
}
export default { fetch: (request, env) => handleRequest(request, env) };
