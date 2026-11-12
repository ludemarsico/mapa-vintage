import { CONFIG } from './config.js';
import { safeURL } from './data.js';
import { DEMO } from './demo.js';
import { $, el } from './dom.js';
export const EVENT_TYPE = 'Feria colectiva';
const DETAIL_FIELDS = ['direccion', 'barrio', 'horarios', 'fecha', 'horario', 'descripcion'];
export function serializeProposal({ source, type, event, text, details = {} }) {
  const extra = Object.entries(details).filter(([, v]) => v).map(([k, v]) => `\n[${k}: ${v}]`).join('');
  return `[Origen: ${source === 'evento' ? 'Propuesta desde Agenda' : source === 'recomendado' ? 'Recomendación de visitante' : 'Responsable del espacio'}]\n[Destino: ${type === EVENT_TYPE ? 'Agenda: feria o evento' : 'Revisión editorial: directorio si es local permanente; agenda si es feria'}]${event ? '\n[Fecha, horario y acceso: ' + event + ']' : ''}${extra}\n\n${text}`;
}
// Ferias y eventos son para la Agenda; el resto, para el Directorio.
export const destinationFor = (source, type) => source === 'evento' || type === EVENT_TYPE ? 'agenda' : 'espacios';
// Solo se acepta un despliegue de Apps Script como receptor de aportes.
export function aportesEndpoint(value) {
  const url = safeURL(value); if (!url.startsWith('https:')) return '';
  const { hostname, pathname, search, hash } = new URL(url);
  return hostname === 'script.google.com' && /^\/macros\/s\/[\w-]+\/exec$/.test(pathname) && !search && !hash ? url : '';
}
// Solo un recibo con el mismo identificador del envío confirma que el aporte quedó guardado.
export function confirmedReceipt(response, body, expectedId) {
  return [200, 202].includes(response.status) && body?.received === true && (!expectedId || body.id === expectedId) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id || '');
}
// Envío al receptor de aportes: devuelve '' si quedó guardado, o el mensaje de error para mostrar.
export async function sendAporte(endpoint, fields) {
  try {
    const response = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(fields), credentials: 'omit', signal: AbortSignal.timeout(45000) });
    let result; try { result = await response.json(); } catch { result = null; }
    if (confirmedReceipt(response, result, fields.submission_id)) return '';
    return result?.error ? String(result.error).slice(0, 180) : 'No pudimos confirmar la recepción.';
  } catch { return 'No pudimos conectarnos. Revisá tu conexión.'; }
}
export function initForms(openDialog) {
  const form = $('#contribution-form'), dialog = $('#contribution-dialog'), submit = $('#proposal-submit'), status = $('#form-status'), iframe = $('#proposal-response');
  const fields = $('#proposal-fields'), storeFields = $('#store-fields'), eventFields = $('#event-fields');
  // Con el receptor de aportes configurado, el envío confirma que la fila se guardó; si no, se usa el formulario original.
  const endpoint = DEMO ? '' : aportesEndpoint(CONFIG.aportes?.endpoint);
  let source = 'propio', pending = false, timer = null, presetEvent = false, submissionId = crypto.randomUUID();
  // Formulario original: los locales van al Apps Script del Directorio y las ferias o eventos, al de la Agenda.
  const agendaEndpoint = aportesEndpoint(CONFIG.agendaFormEndpoint) || CONFIG.formEndpoint;
  const legacyAction = type => DEMO ? 'about:blank' : destinationFor(source, type) === 'agenda' ? agendaEndpoint : CONFIG.formEndpoint;
  form.action = legacyAction('');
  // Todos los barrios de CABA, no solo los que ya tienen locales.
  $('#proposal-barrio').append(...CONFIG.barrios.map(b => el('option', { value: b }, b)));
  if (DEMO) { submit.disabled = true; status.textContent = 'Contenido de demostración. Los envíos están desactivados.'; }
  form.elements.instagram.addEventListener('input', () => form.elements.instagram.setCustomValidity(''));
  const value = name => form.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
  // Los campos aparecen al elegir el tipo de espacio; los grupos ocultos quedan deshabilitados y no se validan ni envían.
  const toggle = (group, on) => { group.hidden = !on; group.disabled = !on; };
  const syncType = () => {
    const type = form.elements.tipologia.value;
    toggle(fields, !!type); toggle(storeFields, !!type && type !== EVENT_TYPE); toggle(eventFields, type === EVENT_TYPE);
  };
  const uncertain = () => {
    if (!pending) return;
    clearTimeout(timer); pending = false; submit.disabled = false; submit.textContent = 'Intentar de nuevo';
    status.textContent = 'No pudimos confirmar la recepción. Si querés comprobar si llegó, escribinos a ' + CONFIG.email + '. Tus datos siguen acá. Revisá antes de reenviar para evitar duplicados.';
    dialog.querySelector('.dialog-close').disabled = false;
  };
  // Entradas de "Sumá un espacio": Local o Feria o evento; adentro se pregunta si es propio o recomendado.
  // "Proponer feria o evento" de la Agenda conserva su origen propio.
  // Las opciones no pertenecen al formulario (atributo form): el envío original conserva sus seis campos.
  const relation = $('#relation-fields'), relationValue = () => relation.querySelector('input:checked')?.value;
  const submitLabel = () => DEMO ? 'Envíos desactivados en demostración' : source === 'evento' || form.elements.tipologia.value === EVENT_TYPE ? 'Proponer feria o evento' : source === 'recomendado' ? 'Recomendar un lugar' : 'Enviar propuesta';
  const syncRelation = () => { if (!relation.disabled) source = relationValue() || 'propio'; submit.textContent = submitLabel(); };
  relation.addEventListener('change', syncRelation);
  const titles = { local: 'Sumá un local.', feria: 'Sumá una feria o evento.', evento: 'Proponé una feria o evento.', propio: 'Tengo un local, feria o evento.', recomendado: 'Conozco un lugar, feria o evento.' };
  document.querySelectorAll('[data-contribute]').forEach(button => button.addEventListener('click', () => {
    if (pending) { openDialog(dialog, button); return; }
    const entry = button.dataset.contribute, asks = entry === 'local' || entry === 'feria';
    toggle(relation, asks); source = asks ? relationValue() || 'propio' : entry;
    $('#form-title').textContent = titles[entry] || titles.propio;
    if (entry === 'evento' || entry === 'feria') { form.elements.tipologia.value = EVENT_TYPE; presetEvent = true; }
    // Si la tipología vino precargada desde Agenda, no se arrastra a las otras entradas.
    else if (presetEvent) { form.elements.tipologia.value = ''; eventFields.querySelectorAll('input').forEach(i => { i.value = ''; }); presetEvent = false; }
    syncType(); submit.textContent = submitLabel();
    openDialog(dialog, button);
  }));
  form.elements.tipologia.addEventListener('change', () => { presetEvent = false; syncType(); if (!pending) submit.textContent = submitLabel(); });
  // Un cambio en los datos es una propuesta nueva; un reintento sin cambios conserva su identificador.
  form.addEventListener('input', () => { if (!pending) submissionId = crypto.randomUUID(); });
  form.addEventListener('submit', async event => {
    if (DEMO) { event.preventDefault(); status.textContent = 'Contenido de demostración. Los envíos están desactivados.'; return; }
    if (pending) { event.preventDefault(); return; }
    // Campo trampa invisible: solo lo completan programas automáticos.
    if ($('#proposal-trap').value) { event.preventDefault(); return; }
    const web = form.elements.instagram;
    web.setCustomValidity(web.value.trim() && !safeURL(web.value) ? 'Usá un enlace que empiece con https:// o http://.' : '');
    if (!form.reportValidity()) { event.preventDefault(); return; }
    const data = Object.fromEntries(DETAIL_FIELDS.map(name => [name, value(name)]));
    const type = form.elements.tipologia.value;
    if (endpoint) { event.preventDefault(); await send(type, data); return; }
    // Formulario original: mismos seis nombres de campo; barrio y detalles viajan dentro de dirección y descripción.
    form.action = legacyAction(type);
    $('#serialized-address').value = [data.direccion, data.barrio].filter(Boolean).join(', ');
    $('#serialized-description').value = serializeProposal({ source, type, event: [data.fecha, data.horario].filter(Boolean).join(' · '), text: data.descripcion,
      details: { Barrio: data.barrio, Horarios: data.horarios } });
    pending = true; submit.disabled = true; submit.textContent = 'Enviando tu propuesta…'; status.textContent = 'Enviando tu propuesta…';
    timer = setTimeout(uncertain, 18000);
    // Envío nativo: no fetch, no JSON, ni cambio de contrato. No se borra el formulario.
  });
  async function send(type, data) {
    pending = true; submit.disabled = true; submit.textContent = 'Enviando tu propuesta…'; status.textContent = 'Enviando tu propuesta…';
    const error = await sendAporte(endpoint, { tipo: 'espacio', submission_id: submissionId, origen: source, nombre: form.elements.nombre.value.trim(), tipologia: type, web: form.elements.instagram.value.trim(), ...data, confirma: 'si', trampa: $('#proposal-trap').value });
    if (!error) {
      status.textContent = 'Gracias, recibimos tu propuesta. La vamos a revisar antes de publicarla.';
      form.reset(); presetEvent = false; syncType(); syncRelation(); submissionId = crypto.randomUUID();
    } else status.textContent = error + ' Tus datos siguen acá para que puedas intentar de nuevo.';
    pending = false; submit.disabled = false; submit.textContent = submitLabel();
  }
  iframe.addEventListener('load', uncertain);
  iframe.addEventListener('error', () => {
    if (!pending) return; clearTimeout(timer); pending = false; submit.disabled = false; submit.textContent = 'Intentar de nuevo';
    status.textContent = 'No pudimos completar el envío. Tus datos siguen acá para que puedas intentar de nuevo.';
  });
}
