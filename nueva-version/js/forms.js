import { CONFIG } from './config.js';
import { safeURL } from './data.js';
import { DEMO } from './demo.js';
import { $, el } from './dom.js';
export function serializeProposal({ source, type, event, text }) {
  return `[Origen: ${source === 'evento' ? 'Propuesta desde Agenda' : source === 'recomendado' ? 'Recomendación de visitante' : 'Responsable del espacio'}]\n[Destino: ${type === 'Feria colectiva' ? 'Agenda: feria o evento' : 'Revisión editorial: directorio si es local permanente; agenda si es feria'}]${event ? '\n[Fecha, horario y acceso: ' + event + ']' : ''}\n\n${text}`;
}
export function initForms(openDialog) {
  const form = $('#contribution-form'), dialog = $('#contribution-dialog'), submit = $('#proposal-submit'), status = $('#form-status'), iframe = $('#proposal-response');
  let source = 'propio', pending = false, timer = null;
  form.action = DEMO ? 'about:blank' : CONFIG.formEndpoint;
  if (DEMO) { submit.disabled = true; status.textContent = 'Contenido de demostración. Los envíos están desactivados.'; }
  form.elements.instagram.addEventListener('input', () => form.elements.instagram.setCustomValidity(''));
  const uncertain = () => {
    if (!pending) return;
    clearTimeout(timer); pending = false; submit.disabled = false; submit.textContent = 'Intentar de nuevo';
    status.textContent = 'No pudimos confirmar la recepción. Si querés comprobar si llegó, escribinos a mapavintage.ba@gmail.com. Tus datos siguen acá. Revisá antes de reenviar para evitar duplicados.';
    dialog.querySelector('.dialog-close').disabled = false;
  };
  document.querySelectorAll('[data-contribute]').forEach(button => button.addEventListener('click', () => {
    if (pending) { openDialog(dialog, button); return; }
    source = button.dataset.contribute;
    $('#form-title').textContent = source === 'evento' ? 'Proponé una feria o evento.' : source === 'propio' ? 'Tengo un local, feria o evento.' : 'Conozco un lugar.';
    if (source === 'evento') { form.elements.tipologia.value = 'Feria colectiva'; $('#event-label').hidden = false; }
    submit.textContent = DEMO ? 'Envíos desactivados en demostración' : source === 'evento' ? 'Proponer feria o evento' : source === 'propio' ? 'Enviar propuesta' : 'Recomendar un lugar';
    openDialog(dialog, button);
  }));
  form.elements.tipologia.addEventListener('change', () => {
    const event = ['Feria colectiva', 'Feria americana'].includes(form.elements.tipologia.value);
    $('#event-label').hidden = !event;
    if (!event) $('#event-info').value = '';
  });
  form.addEventListener('submit', event => {
    if (DEMO) { event.preventDefault(); status.textContent = 'Contenido de demostración. Los envíos están desactivados.'; return; }
    if (pending) { event.preventDefault(); return; }
    const web = form.elements.instagram;
    web.setCustomValidity(web.value.trim() && !safeURL(web.value) ? 'Usá un enlace que empiece con https:// o http://.' : '');
    if (!form.reportValidity()) { event.preventDefault(); return; }
    $('#serialized-description').value = serializeProposal({ source, type: form.elements.tipologia.value, event: $('#event-info').value.trim(), text: $('#proposal-description').value.trim() });
    pending = true; submit.disabled = true; submit.textContent = 'Enviando tu propuesta…'; status.textContent = 'Enviando tu propuesta…';
    timer = setTimeout(uncertain, 18000);
    // Envío nativo: no fetch, no JSON, ni cambio de contrato. No se borra el formulario.
  });
  iframe.addEventListener('load', uncertain);
  iframe.addEventListener('error', () => {
    if (!pending) return; clearTimeout(timer); pending = false; submit.disabled = false; submit.textContent = 'Intentar de nuevo';
    status.textContent = 'No pudimos completar el envío. Tus datos siguen acá para que puedas intentar de nuevo.';
  });
}
