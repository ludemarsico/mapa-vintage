/**
 * Receptor de propuestas de Mapa Vintage (Apps Script). No está desplegado: ver docs/RECEPCION-DE-PROPUESTAS.md.
 *
 * Escribe cada propuesta en una planilla PRIVADA (propiedad SPREADSHEET_ID), en dos hojas:
 *   - "Agenda a verificar": ferias y eventos.
 *   - "Espacios a verificar": locales propuestos o recomendados.
 * Nunca publica nada: la Agenda pública se alimenta de otro documento curado a mano.
 *
 * Propiedades del script (Configuración del proyecto → Propiedades del script):
 *   SPREADSHEET_ID         ID de la planilla privada de recepción.
 *   TURNSTILE_SECRET_KEY   Clave secreta del widget de Cloudflare Turnstile.
 *   ALLOWED_HOSTNAMES      Dominios del sitio separados por coma, sin https:// (por ejemplo: mapavintage.netlify.app).
 */
var SHEETS = { agenda: 'Agenda a verificar', espacios: 'Espacios a verificar' };
var HEADERS = ['Recibido', 'ID de envío', 'Origen', 'Nombre', 'Tipología', 'Dirección', 'Barrio', 'Instagram', 'Horarios',
  'Especialidad', 'Rango Precio', 'Fecha', 'Horario', 'Descripción breve', 'Confirma CABA', 'Estado'];
var TYPES = ['Boutique Vintage', 'Feria americana', 'Feria colectiva', 'Cadena de reventa'];
var CATEGORIES = ['Sastrería & Archivo', 'Denim & Streetwear 90s', 'Sin género / Oversized', 'Carteras, Calzado & Accesorios', 'Cuero & Tapados'];
var ORIGINS = { propio: 'Responsable del espacio', recomendado: 'Recomendación de visitante', evento: 'Propuesta desde Agenda' };
var LIMITS = { nombre: 180, direccion: 200, barrio: 80, web: 500, horarios: 200, horario: 160, descripcion: 3000 };
var MAX_PER_MINUTE = 20;

function doPost(e) {
  try { return json_(handle_((e && e.parameter) || {}, services_())); }
  catch (err) { console.error(err); return json_({ received: false, error: 'No pudimos guardar la propuesta en este momento.' }); }
}
function doGet() { return json_({ servicio: 'propuestas', estado: 'activo' }); }
function json_(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }

/** Lógica pura: valida, verifica y guarda usando los servicios recibidos. */
function handle_(p, s) {
  var id = clean_(p.submission_id, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return fail_('Falta el identificador del envío.');
  if (s.wasReceived(id)) return { received: true, id: id };
  if (!s.allowRate()) return fail_('Recibimos muchas propuestas juntas. Probá de nuevo en unos minutos.');
  var check = s.verifyTurnstile(clean_(p['cf-turnstile-response'], 2048));
  var hosts = String(s.prop('ALLOWED_HOSTNAMES') || '').split(',').map(function (h) { return h.trim().toLowerCase(); }).filter(String);
  if (!check || check.success !== true || check.action !== 'propuesta' || hosts.indexOf(String(check.hostname || '').toLowerCase()) < 0) return fail_('La verificación venció o no es válida. Intentá de nuevo.');

  // Los campos de lista cerrada se acotan con margen para que la comparación sea exacta.
  var origen = clean_(p.origen, 60), tipo = clean_(p.tipologia, 60);
  var d = {
    nombre: clean_(p.nombre, LIMITS.nombre), direccion: clean_(p.direccion, LIMITS.direccion), barrio: clean_(p.barrio, LIMITS.barrio),
    web: clean_(p.web, LIMITS.web), horarios: clean_(p.horarios, LIMITS.horarios), especialidad: clean_(p.especialidad, 120),
    precio: clean_(p.precio, 20), fecha: clean_(p.fecha, 40), horario: clean_(p.horario, LIMITS.horario), descripcion: clean_(p.descripcion, LIMITS.descripcion, true)
  };
  if (!ORIGINS[origen] || TYPES.indexOf(tipo) < 0) return fail_('Elegí el tipo de espacio.');
  if (!d.nombre || !d.direccion || !d.barrio) return fail_('Completá nombre, dirección y barrio.');
  if (String(p.confirma) !== 'si') return fail_('Falta confirmar la ubicación presencial en CABA.');
  if (d.web && !safeWeb_(d.web)) return fail_('El enlace debe empezar con https:// o http://.');
  if (d.especialidad && CATEGORIES.indexOf(d.especialidad) < 0) return fail_('Elegí una categoría de la lista.');
  if (['', '$', '$$', '$$$'].indexOf(d.precio) < 0) return fail_('Elegí un rango de precios de la lista.');
  if (d.fecha && !validDate_(d.fecha)) return fail_('La fecha no es válida.');

  var destino = origen === 'evento' || tipo === 'Feria colectiva' ? 'agenda' : 'espacios';
  var row = [s.now(), id, ORIGINS[origen], d.nombre, tipo, d.direccion, d.barrio, d.web, d.horarios, d.especialidad, d.precio, d.fecha, d.horario, d.descripcion, 'Sí', 'Pendiente']
    .map(function (v, i) { return i === 0 ? v : sheetSafe_(v); });
  s.append(SHEETS[destino], HEADERS, row, id);
  return { received: true, id: id, destino: destino };
}
function fail_(error) { return { received: false, error: error }; }
/** Texto plano acotado, sin caracteres de control (salvo saltos de línea en la descripción). */
function clean_(value, max, multiline) {
  var text = String(value == null ? '' : value).replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, ' ').trim();
  return text.length > max ? text.slice(0, max) : text;
}
/** Evita que un texto se interprete como fórmula al abrir la planilla. */
function sheetSafe_(value) { var v = String(value); return /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }
function safeWeb_(value) { return /^https?:\/\/[^\s/@]+\.[^\s/@]+(\/\S*)?$/i.test(value) && !/^https?:\/\/[^/]*@/.test(value); }
function validDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  var parts = value.split('-').map(Number), date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return date.getUTCFullYear() === parts[0] && date.getUTCMonth() === parts[1] - 1 && date.getUTCDate() === parts[2];
}

/** Servicios reales de Google. */
function services_() {
  var props = PropertiesService.getScriptProperties(), cache = CacheService.getScriptCache();
  return {
    prop: function (key) { return props.getProperty(key); },
    now: function () { return new Date(); },
    wasReceived: function (id) { return cache.get('envio:' + id) === '1'; },
    allowRate: function () {
      var key = 'ritmo:' + Math.floor(Date.now() / 60000), lock = LockService.getScriptLock(); lock.waitLock(5000);
      try { var n = Number(cache.get(key) || 0) + 1; cache.put(key, String(n), 120); return n <= MAX_PER_MINUTE; } finally { lock.releaseLock(); }
    },
    verifyTurnstile: function (token) {
      if (!token) return null;
      var res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'post', muteHttpExceptions: true, payload: { secret: props.getProperty('TURNSTILE_SECRET_KEY'), response: token }
      });
      return res.getResponseCode() === 200 ? JSON.parse(res.getContentText()) : null;
    },
    append: function (name, headers, row, id) {
      var lock = LockService.getScriptLock(); lock.waitLock(10000);
      try {
        if (cache.get('envio:' + id) === '1') return;
        var book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')), sheet = book.getSheetByName(name);
        if (!sheet) { sheet = book.insertSheet(name); sheet.appendRow(headers); sheet.setFrozenRows(1); }
        sheet.appendRow(row);
        cache.put('envio:' + id, '1', 21600);
      } finally { lock.releaseLock(); }
    }
  };
}
