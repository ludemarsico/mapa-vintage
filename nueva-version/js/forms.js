import { CONFIG } from './config.js';
import { safeURL } from './data.js';
import { DEMO } from './demo.js';
import { $ } from './dom.js';
import { loadTurnstile } from './turnstile.js';
import { confirmedReceipt } from './hallazgo.js';
export const EVENT_TYPE = 'Feria colectiva';
const DETAIL_FIELDS = ['direccion', 'barrio', 'horarios', 'especialidad', 'precio', 'fecha', 'horario', 'descripcion'];
export function serializeProposal({ source, type, event, text, details = {} }) {
  const extra = Object.entries(details).filter(([, v]) => v).map(([k, v]) => `\n[${k}: ${v}]`).join('');
  return `[Origen: ${source === 'evento' ? 'Propuesta desde Agenda' : source === 'recomendado' ? 'Recomendación de visitante' : 'Responsable del espacio'}]\n[Destino: ${type === EVENT_TYPE ? 'Agenda: feria o evento' : 'Revisión editorial: directorio si es local permanente; agenda si es feria'}]${event ? '\n[Fecha, horario y acceso: ' + event + ']' : ''}${extra}\n\n${text}`;
}
// Ferias y eventos van a "Agenda a verificar"; el resto, a "Espacios a verificar".
export const destinationFor = (source, type) => source === 'evento' || type === EVENT_TYPE ? 'agenda' : 'espacios';
// Solo se acepta un despliegue de Apps Script como receptor nuevo de propuestas.
export function proposalEndpoint(value) {
  const url = safeURL(value); if (!url.startsWith('https:')) return '';
  const { hostname, pathname, search, hash } = new URL(url);
  return hostname === 'script.google.com' && /^\/macros\/s\/[\w-]+\/exec$/.test(pathname) && !search && !hash ? url : '';
}
export function initForms(openDialog) {
  const form = $('#contribution-form'), dialog = $('#contribution-dialog'), submit = $('#proposal-submit'), status = $('#form-status'), iframe = $('#proposal-response');
  const fields = $('#proposal-fields'), storeFields = $('#store-fields'), eventFields = $('#event-fields');
  // Con el receptor nuevo configurado se envía con verificación y confirmación real; si no, se usa el formulario original.
  const endpoint = DEMO ? '' : proposalEndpoint(CONFIG.propuestas?.endpoint), siteKey = CONFIG.propuestas?.turnstileSiteKey || '';
  const verified = !!endpoint && !!siteKey;
  let source = 'propio', pending = false, timer = null, presetEvent = false, token = '', widgetId, submissionId = crypto.randomUUID();
  form.action = DEMO ? 'about:blank' : CONFIG.formEndpoint;
  if (DEMO) { submit.disabled = true; status.textContent = 'Contenido de demostración. Los envíos están desactivados.'; }
  form.elements.instagram.addEventListener('input', () => form.elements.instagram.setCustomValidity(''));
  const value = name => form.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
  // Los campos aparecen al elegir el tipo de espacio; los grupos ocultos quedan deshabilitados y no se validan ni envían.
  const toggle = (group, on) => { group.hidden = !on; group.disabled = !on; };
  const syncType = () => {
    const type = form.elements.tipologia.value;
    toggle(fields, !!type); toggle(storeFields, !!type && type !== EVENT_TYPE); toggle(eventFields, type === EVENT_TYPE);
    if (type) renderChallenge();
  };
  const syncButton = () => { if (!DEMO) submit.disabled = pending || (verified && !token); };
  const resetChallenge = () => { token = ''; if (widgetId !== undefined) window.turnstile?.reset(widgetId); syncButton(); };
  function renderChallenge() {
    if (!verified || widgetId !== undefined) return;
    widgetId = null; status.textContent = 'Preparando la verificación…';
    loadTurnstile().then(turnstile => {
      widgetId = turnstile.render('#proposal-verification', { sitekey: siteKey, action: 'propuesta',
        callback: v => { token = v; if (status.textContent.includes('verificación')) status.textContent = ''; syncButton(); },
        'expired-callback': () => { token = ''; syncButton(); },
        'error-callback': () => { token = ''; syncButton(); status.textContent = 'No pudimos completar la verificación. Recargá la página para intentar de nuevo.'; } });
    }, () => { widgetId = undefined; status.textContent = 'La verificación no está disponible. Nada se envió; podés intentar más tarde.'; });
  }
  const uncertain = () => {
    if (!pending) return;
    clearTimeout(timer); pending = false; submit.disabled = false; submit.textContent = 'Intentar de nuevo';
    status.textContent = 'No pudimos confirmar la recepción. Si querés comprobar si llegó, escribinos a ' + CONFIG.email + '. Tus datos siguen acá. Revisá antes de reenviar para evitar duplicados.';
    dialog.querySelector('.dialog-close').disabled = false;
  };
  document.querySelectorAll('[data-contribute]').forEach(button => button.addEventListener('click', () => {
    if (pending) { openDialog(dialog, button); return; }
    source = button.dataset.contribute;
    $('#form-title').textContent = source === 'evento' ? 'Proponé una feria o evento.' : source === 'propio' ? 'Tengo un local, feria o evento.' : 'Conozco un lugar, feria o evento.';
    if (source === 'evento') { form.elements.tipologia.value = EVENT_TYPE; presetEvent = true; }
    // Si la tipología vino precargada desde Agenda, no se arrastra a las otras entradas.
    else if (presetEvent) { form.elements.tipologia.value = ''; eventFields.querySelectorAll('input').forEach(i => { i.value = ''; }); presetEvent = false; }
    syncType();
    submit.textContent = DEMO ? 'Envíos desactivados en demostración' : source === 'evento' ? 'Proponer feria o evento' : source === 'propio' ? 'Enviar propuesta' : 'Recomendar un lugar';
    syncButton(); openDialog(dialog, button);
  }));
  form.elements.tipologia.addEventListener('change', () => { presetEvent = false; syncType(); });
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
    if (verified) { event.preventDefault(); await sendVerified(type, data); return; }
    // Formulario original: mismos seis nombres de campo; barrio y detalles viajan dentro de dirección y descripción.
    $('#serialized-address').value = [data.direccion, data.barrio].filter(Boolean).join(', ');
    $('#serialized-description').value = serializeProposal({ source, type, event: [data.fecha, data.horario].filter(Boolean).join(' · '), text: data.descripcion,
      details: { Barrio: data.barrio, Horarios: data.horarios, Especialidad: data.especialidad, 'Rango de precios': data.precio } });
    pending = true; submit.disabled = true; submit.textContent = 'Enviando tu propuesta…'; status.textContent = 'Enviando tu propuesta…';
    timer = setTimeout(uncertain, 18000);
    // Envío nativo: no fetch, no JSON, ni cambio de contrato. No se borra el formulario.
  });
  async function sendVerified(type, data) {
    if (!token) { status.textContent = 'Completá la verificación antes de enviar.'; return; }
    const body = new URLSearchParams({ submission_id: submissionId, origen: source, nombre: form.elements.nombre.value.trim(), tipologia: type, web: form.elements.instagram.value.trim(), ...data, confirma: 'si', 'cf-turnstile-response': token });
    pending = true; syncButton(); submit.textContent = 'Enviando tu propuesta…'; status.textContent = 'Enviando tu propuesta…';
    try {
      const response = await fetch(endpoint, { method: 'POST', body, credentials: 'omit', signal: AbortSignal.timeout(30000) });
      let result; try { result = await response.json(); } catch { result = null; }
      if (confirmedReceipt(response, result, submissionId)) {
        status.textContent = 'Gracias, recibimos tu propuesta. La vamos a revisar antes de publicarla.';
        form.reset(); presetEvent = false; syncType(); submissionId = crypto.randomUUID();
      } else status.textContent = result?.error ? 'No pudimos guardar la propuesta. ' + String(result.error).slice(0, 180) + ' Tus datos siguen acá.' : 'No pudimos confirmar la recepción. Tus datos siguen acá para que puedas intentar de nuevo.';
    } catch { status.textContent = 'No pudimos confirmar la recepción. Tus datos siguen acá para que puedas intentar de nuevo.'; }
    finally { pending = false; submit.textContent = source === 'evento' ? 'Proponer feria o evento' : source === 'propio' ? 'Enviar propuesta' : 'Recomendar un lugar'; resetChallenge(); }
  }
  iframe.addEventListener('load', uncertain);
  iframe.addEventListener('error', () => {
    if (!pending) return; clearTimeout(timer); pending = false; submit.disabled = false; submit.textContent = 'Intentar de nuevo';
    status.textContent = 'No pudimos completar el envío. Tus datos siguen acá para que puedas intentar de nuevo.';
  });
}
