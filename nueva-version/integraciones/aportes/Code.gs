/**
 * Receptor de aportes de Mapa Vintage (Apps Script). Se instala dentro de la planilla del Directorio:
 * ver docs/RECEPCION-DE-APORTES.md.
 *
 *   - Locales propuestos → hoja "Aportes" de la planilla del Directorio.
 *   - Ferias y eventos → hoja "Aportes" de la planilla de la Agenda (AGENDA, abajo).
 *     Cada dato va a la columna con su mismo nombre (Nombre, Barrio, Dirección, Latitud, Longitud, Tipología,
 *     Días, Horarios, Instagram, Descripción breve). Las columnas que el formulario no pide quedan vacías.
 *     Latitud y Longitud se completan con la ubicación que encuentra Google Maps para la dirección: revisalas.
 *     La fecha de recepción, quién propone y el identificador del envío quedan en una nota sobre el Nombre.
 *   - Fotos de "Compartí tu hallazgo" → carpeta "Mapa Vintage — Hallazgos" de tu Drive, y una fila en la hoja "Hallazgos".
 *   - El muro de Comunidad muestra solo los hallazgos con Estado = Publicado.
 *
 * Nada se publica solo: los aportes quedan en las hojas "Aportes" hasta que pases la fila al Directorio o a la Agenda.
 */
// Enlace de la planilla de la Agenda (el que aparece en la barra del navegador al abrirla).
var AGENDA = 'https://docs.google.com/spreadsheets/d/1TnE5Y5aqMVrTDyu7g1ctJQeEK7qV5ACthrr6Bd0okmM/edit';
var SHEETS = { aportes: 'Aportes', hallazgos: 'Hallazgos' };
var DIRECTORIO_COLS = ['ID', 'Nombre', 'Barrio', 'Dirección', 'Latitud', 'Longitud', 'Tipología', 'Rango Precio', 'Especialidad', 'Horarios', 'Instagram', 'Descripción breve'];
var AGENDA_COLS = ['ID', 'Nombre', 'Barrio', 'Dirección', 'Latitud', 'Longitud', 'Tipología', 'Rango Precio', 'Especialidad', 'Días', 'Horarios', 'Instagram', 'Descripción breve'];
var HALLAZGOS = ['Recibido', 'ID de envío', 'Nombre o alias', 'Instagram', 'Texto', 'Foto', 'ID de foto', 'Estado'];
var ESTADOS = ['Pendiente', 'Publicado', 'Descartado'];
var TYPES = ['Boutique Vintage', 'Tienda de segunda mano', 'Feria americana', 'Feria colectiva', 'Cadena de reventa'];
var ORIGINS = { propio: 'Responsable del espacio', recomendado: 'Recomendación de visitante', evento: 'Propuesta desde Agenda' };
var LIMITS = { nombre: 180, direccion: 200, barrio: 80, web: 500, horarios: 200, horario: 160, descripcion: 3000, alias: 80, texto: 1200 };
var MAX_PHOTO = 6 * 1024 * 1024, MAX_PER_MINUTE = 20, FOLDER = 'Mapa Vintage — Hallazgos', MURO_SECONDS = 300;
// Recuadro de control de CABA: una ubicación fuera de él no se anota.
var CABA = { south: -34.71, north: -34.52, west: -58.54, east: -58.33 };
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function doPost(e) {
  try { return json_(handle_((e && e.parameter) || {}, services_())); }
  catch (err) { console.error(err); return json_({ received: false, error: 'No pudimos guardar el aporte en este momento.' }); }
}
function doGet(e) {
  try { return json_((e && e.parameter && e.parameter.muro) ? wall_(services_()) : { servicio: 'aportes', estado: 'activo' }); }
  catch (err) { console.error(err); return json_({ posts: [] }); }
}
function json_(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }

/** Lógica pura: valida y guarda con los servicios recibidos (en las pruebas, simulados). */
function handle_(p, s) {
  var id = clean_(p.submission_id, 36);
  if (!UUID.test(id)) return fail_('Falta el identificador del envío.');
  // Campo trampa invisible: solo lo completan programas automáticos. Se responde como si nada.
  if (clean_(p.trampa, 200)) return { received: true, id: id };
  if (s.wasReceived(id)) return { received: true, id: id };
  if (!s.allowRate()) return fail_('Recibimos muchos aportes juntos. Probá de nuevo en unos minutos.');
  if (p.tipo === 'hallazgo') return hallazgo_(p, s, id);
  if (p.tipo === 'espacio') return espacio_(p, s, id);
  return fail_('Tipo de aporte desconocido.');
}
function espacio_(p, s, id) {
  var origen = clean_(p.origen, 60), tipo = clean_(p.tipologia, 60);
  var d = {
    nombre: clean_(p.nombre, LIMITS.nombre), direccion: clean_(p.direccion, LIMITS.direccion), barrio: clean_(p.barrio, LIMITS.barrio),
    web: clean_(p.web, LIMITS.web), horarios: clean_(p.horarios, LIMITS.horarios), fecha: clean_(p.fecha, 40),
    horario: clean_(p.horario, LIMITS.horario), descripcion: clean_(p.descripcion, LIMITS.descripcion, true)
  };
  if (!ORIGINS[origen] || TYPES.indexOf(tipo) < 0) return fail_('Elegí el tipo de espacio.');
  if (!d.nombre || !d.direccion || !d.barrio) return fail_('Completá nombre, dirección y barrio.');
  if (String(p.confirma) !== 'si') return fail_('Falta confirmar la ubicación presencial en CABA.');
  if (d.web && !safeWeb_(d.web)) return fail_('El enlace debe empezar con https:// o http://.');
  if (d.fecha && !validDate_(d.fecha)) return fail_('La fecha no es válida.');
  var agenda = origen === 'evento' || tipo === 'Feria colectiva', point = located_(s.geocode(d.direccion + ', ' + d.barrio));
  var record = {
    'Nombre': d.nombre, 'Barrio': d.barrio, 'Dirección': d.direccion, 'Latitud': point ? point.lat : '', 'Longitud': point ? point.lng : '',
    'Tipología': tipo, 'Horarios': agenda ? d.horario : d.horarios, 'Instagram': d.web, 'Descripción breve': d.descripcion
  };
  if (agenda) record['Días'] = d.fecha ? d.fecha.split('-').reverse().join('/') : '';
  var note = 'Recibido: ' + s.stamp() + '\n' + ORIGINS[origen] + '\nEnvío: ' + id;
  s.append({ book: agenda ? 'agenda' : 'directorio', sheet: SHEETS.aportes }, agenda ? AGENDA_COLS : DIRECTORIO_COLS, record, id, note);
  return { received: true, id: id, para: agenda ? 'Agenda' : 'Directorio' };
}
function hallazgo_(p, s, id) {
  var alias = clean_(p.alias, LIMITS.alias), texto = clean_(p.texto, LIMITS.texto, true), red = clean_(p.red, LIMITS.web);
  if (!alias || !texto) return fail_('Completá tu nombre o alias y el texto.');
  if (red && !safeWeb_(red)) return fail_('El enlace de Instagram no es válido.');
  var bytes = s.decode(String(p.foto || ''));
  if (!bytes || !bytes.length) return fail_('Falta la foto.');
  if (bytes.length > MAX_PHOTO) return fail_('La foto es demasiado pesada.');
  var kind = imageType_(bytes);
  if (!kind) return fail_('La foto debe ser JPG, PNG o WebP.');
  var file = s.saveFile(bytes, kind[0], 'hallazgo-' + id + '.' + kind[1]);
  s.append({ book: 'directorio', sheet: SHEETS.hallazgos }, HALLAZGOS, {
    'Recibido': s.now(), 'ID de envío': id, 'Nombre o alias': alias, 'Instagram': red, 'Texto': texto,
    'Foto': file.url, 'ID de foto': file.id, 'Estado': 'Pendiente'
  }, id, '');
  return { received: true, id: id };
}
/** Hallazgos publicados para el muro. La foto se comparte por enlace recién cuando se publica. */
function wall_(s) {
  var cached = s.cacheGet('muro'); if (cached) return JSON.parse(cached);
  var posts = s.rows(SHEETS.hallazgos).filter(function (r) { return String(r['Estado']).trim().toLowerCase() === 'publicado' && r['ID de foto']; })
    .map(function (r) {
      var fileId = String(r['ID de foto']).trim(); s.share(fileId);
      return { id: String(r['ID de envío']), nombre_alias: String(r['Nombre o alias']), texto: String(r['Texto']), red_url: String(r['Instagram'] || ''),
        imagen: 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(fileId) + '=w1200' };
    });
  var body = { posts: posts }; s.cachePut('muro', JSON.stringify(body), MURO_SECONDS); return body;
}
function fail_(error) { return { received: false, error: error }; }
/** Solo se anota una ubicación dentro de CABA. */
function located_(point) {
  return point && point.lat >= CABA.south && point.lat <= CABA.north && point.lng >= CABA.west && point.lng <= CABA.east ? point : null;
}
/** Nombre de columna comparable: sin tildes, mayúsculas ni espacios de más. */
function key_(name) { return String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
/** Fila en el orden de las columnas de la hoja: cada dato va a la columna con su mismo nombre; el resto queda vacío. */
function rowFor_(headers, record) {
  var byKey = {}; Object.keys(record).forEach(function (k) { byKey[key_(k)] = record[k]; });
  return headers.map(function (h) { var v = byKey[key_(h)]; return v == null || v === '' ? '' : (v instanceof Date || typeof v === 'number' ? v : sheetSafe_(v)); });
}
/** Identificador de una planilla a partir de su enlace (o del identificador solo). */
function bookId_(value) { var m = String(value || '').match(/\/d\/([\w-]{20,})/) || String(value || '').match(/^([\w-]{20,})$/); return m ? m[1] : ''; }
/** Texto plano acotado, sin caracteres de control (salvo saltos de línea en textos largos). */
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
/** El tipo de imagen se reconoce por su firma, no por lo que declara el navegador. */
function imageType_(b) {
  var u = function (i) { return b[i] & 255; };
  if (u(0) === 255 && u(1) === 216 && u(2) === 255) return ['image/jpeg', 'jpg'];
  if ([137, 80, 78, 71, 13, 10, 26, 10].every(function (v, i) { return u(i) === v; })) return ['image/png', 'png'];
  var ascii = function (a, z) { var t = ''; for (var i = a; i < z; i++) t += String.fromCharCode(u(i)); return t; };
  if (b.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return ['image/webp', 'webp'];
  return null;
}

/** Servicios reales de Google. */
function services_() {
  var props = PropertiesService.getScriptProperties(), cache = CacheService.getScriptCache();
  var folder = function () {
    var saved = props.getProperty('CARPETA_HALLAZGOS');
    if (saved) { try { return DriveApp.getFolderById(saved); } catch (err) { console.warn('Carpeta no encontrada; se crea otra.'); } }
    var created = DriveApp.createFolder(FOLDER); props.setProperty('CARPETA_HALLAZGOS', created.getId()); return created;
  };
  // Sin el enlace de la Agenda, las ferias quedan en los Aportes del Directorio, con un aviso en la nota.
  var book = function (which) { return which === 'agenda' && bookId_(AGENDA) ? SpreadsheetApp.openById(bookId_(AGENDA)) : SpreadsheetApp.getActiveSpreadsheet(); };
  return {
    now: function () { return new Date(); },
    stamp: function () { return Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy HH:mm'); },
    geocode: function (address) {
      try {
        var found = Maps.newGeocoder().setRegion('ar').setLanguage('es').geocode(address + ', Ciudad Autónoma de Buenos Aires, Argentina');
        var where = found.status === 'OK' && found.results[0].geometry.location;
        return where ? { lat: Math.round(where.lat * 1e7) / 1e7, lng: Math.round(where.lng * 1e7) / 1e7 } : null;
      } catch (err) { console.warn('No se pudo ubicar la dirección.'); return null; }
    },
    decode: function (base64) { try { return Utilities.base64Decode(base64); } catch (err) { return null; } },
    wasReceived: function (id) { return cache.get('envio:' + id) === '1'; },
    allowRate: function () {
      var key = 'ritmo:' + Math.floor(Date.now() / 60000), lock = LockService.getScriptLock(); lock.waitLock(5000);
      try { var n = Number(cache.get(key) || 0) + 1; cache.put(key, String(n), 120); return n <= MAX_PER_MINUTE; } finally { lock.releaseLock(); }
    },
    saveFile: function (bytes, type, name) { var file = folder().createFile(Utilities.newBlob(bytes, type, name)); return { id: file.getId(), url: file.getUrl() }; },
    share: function (fileId) {
      if (cache.get('compartida:' + fileId)) return;
      try { var file = DriveApp.getFileById(fileId); if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); cache.put('compartida:' + fileId, '1', 21600); }
      catch (err) { console.warn('No se pudo compartir la foto ' + fileId); }
    },
    cacheGet: function (key) { return cache.get(key); },
    cachePut: function (key, value, seconds) { if (value.length < 90000) cache.put(key, value, seconds); },
    rows: function (name) {
      var sheet = book('directorio').getSheetByName(name); if (!sheet || sheet.getLastRow() < 2) return [];
      var values = sheet.getDataRange().getValues(), headers = values.shift().map(String);
      return values.map(function (v) { var r = {}; headers.forEach(function (h, i) { r[h.trim()] = v[i]; }); return r; });
    },
    /** Agrega la fila según los nombres de las columnas que ya tiene la hoja. Si la hoja no existe, la crea con `headers`. */
    append: function (where, headers, record, id, note) {
      var lock = LockService.getScriptLock(); lock.waitLock(10000);
      try {
        if (cache.get('envio:' + id) === '1') return;
        var target = book(where.book), fallback = where.book === 'agenda' && !bookId_(AGENDA);
        var sheet = target.getSheetByName(where.sheet) || target.insertSheet(where.sheet);
        var current = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); }) : [];
        if (!current.some(String)) { current = headers.slice(); sheet.getRange(1, 1, 1, current.length).setValues([current]).setFontWeight('bold'); sheet.setFrozenRows(1); }
        sheet.appendRow(rowFor_(current, record));
        var last = sheet.getLastRow(), keys = current.map(key_);
        if (fallback) note = 'PARA LA AGENDA' + (record['Días'] ? ' · Días: ' + record['Días'] : '') + (record['Horarios'] ? ' · Horarios: ' + record['Horarios'] : '') + '\n' + note;
        var named = keys.indexOf('nombre');
        if (note) sheet.getRange(last, named >= 0 ? named + 1 : 1).setNote(note);
        // Estado con lista desplegable (Pendiente, Publicado o Descartado), si la hoja tiene esa columna.
        var state = keys.indexOf('estado');
        if (state >= 0) sheet.getRange(last, state + 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).build());
        cache.put('envio:' + id, '1', 21600);
      } finally { lock.releaseLock(); }
    }
  };
}
