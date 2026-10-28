import { CONFIG } from './config.js';
import { DEMO } from './demo.js';
import { safeURL } from './data.js';
import { $ } from './dom.js';
import { loadTurnstile } from './turnstile.js';
export const PHOTO_LIMIT = 5 * 1024 * 1024;
export function photoError(file) {
  if (!file) return 'Elegí una foto para compartir.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Elegí una foto JPG, PNG o WebP.';
  if (file.size <= 0 || file.size > PHOTO_LIMIT) return 'La foto debe pesar hasta 5 MB.';
  return '';
}
export function hallazgoEndpoint(value) {
  const url = safeURL(value); if (!url || !url.startsWith('https:')) return '';
  const host = new URL(url).hostname;
  return /(^|\.)script\.google(?:usercontent)?\.com$/i.test(host) ? '' : url;
}
export function confirmedReceipt(response, body, expectedId) {
  return [200, 202].includes(response.status) && body?.received === true && (!expectedId || body.id === expectedId) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id || '');
}
export function initHallazgo() {
  const form = $('#hallazgo-form'), fileInput = $('#hallazgo-photo'), preview = $('#hallazgo-preview'), button = $('#hallazgo-submit'), status = $('#hallazgo-status');
  const endpoint = hallazgoEndpoint(CONFIG.hallazgos?.endpoint), siteKey = CONFIG.hallazgos?.turnstileSiteKey || '';
  const connected = !!endpoint && !!siteKey && !DEMO;
  let previewURL = '', token = '', widgetId, pending = false, draftId = crypto.randomUUID();
  const releasePreview = () => { if (previewURL) URL.revokeObjectURL(previewURL); previewURL = ''; };
  window.addEventListener('pagehide', releasePreview);
  form.addEventListener('input', event => { if (!pending && ['photo','text','alias','social_url'].includes(event.target.name)) draftId = crypto.randomUUID(); });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0], error = photoError(file); releasePreview();
    $('#hallazgo-photo-choose').textContent = file ? 'Cambiar foto ↗' : 'Elegí una foto ↗';
    fileInput.setCustomValidity(error); preview.hidden = true; $('#hallazgo-photo-prompt').hidden = false;
    if (error) { if (file) status.textContent = error; return; }
    previewURL = URL.createObjectURL(file); preview.src = previewURL; preview.hidden = false; $('#hallazgo-photo-prompt').hidden = true;
    if (!connected) status.textContent = DEMO ? 'Contenido de demostración. Los envíos están desactivados.' : 'Podés revisar tu foto y tu texto. La recepción todavía no está habilitada; nada se enviará.';
  });
  const syncButton = () => { button.disabled = !connected || !token || pending; };
  const resetChallenge = () => { token = ''; if (widgetId !== undefined) window.turnstile?.reset(widgetId); syncButton(); };
  if (DEMO) status.textContent = 'Contenido de demostración. Los envíos están desactivados.';
  else if (connected) {
    status.textContent = 'Preparando la verificación…';
    const render = () => {
      widgetId = window.turnstile.render('#hallazgo-verification', { sitekey: siteKey, action: 'hallazgo', callback: value => { token = value; if (status.textContent.includes('verificación')) status.textContent = ''; syncButton(); }, 'expired-callback': () => { token = ''; syncButton(); }, 'error-callback': () => { token = ''; syncButton(); status.textContent = 'No pudimos completar la verificación. Recargá la página para intentar de nuevo.'; } });
    };
    loadTurnstile().then(render, () => { status.textContent = 'La verificación no está disponible. Nada se envió; podés intentar más tarde.'; });
  }
  syncButton();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!connected || !token || pending) { if (!connected) status.textContent = DEMO ? 'Contenido de demostración. Los envíos están desactivados.' : 'La recepción de fotos todavía no está habilitada. Tu aporte no se enviará.'; return; }
    fileInput.setCustomValidity(photoError(fileInput.files[0]));
    const social = $('#hallazgo-social'); social.setCustomValidity(social.value.trim() && !safeURL(social.value) ? 'Usá un enlace http:// o https://.' : '');
    if (!form.reportValidity()) return;
    const body = new FormData(form); body.set('submission_id', draftId); body.set('cf-turnstile-response', token);
    pending = true; syncButton(); status.textContent = 'Enviando tu hallazgo…';
    // Se congelan los campos, pero el FormData ya conserva el archivo y el texto.
    const controls = [...form.querySelectorAll('input,textarea')]; controls.forEach(n => { n.disabled = true; });
    try {
      const response = await fetch(endpoint, { method: 'POST', body, credentials: 'omit', signal: AbortSignal.timeout(30000) });
      let result; try { result = await response.json(); } catch { result = null; }
      if (confirmedReceipt(response, result, draftId)) {
        status.textContent = 'Gracias, recibí tu hallazgo. Lo voy a revisar antes de publicarlo.';
        form.reset(); $('#hallazgo-photo-choose').textContent = 'Elegí una foto ↗'; releasePreview(); preview.hidden = true; $('#hallazgo-photo-prompt').hidden = false; draftId = crypto.randomUUID();
      } else status.textContent = response.status >= 400 && result?.error ? 'No pudimos completar el envío. Tus datos siguen acá. ' + String(result.error).slice(0, 180) : 'No pudimos confirmar la recepción. Tus datos siguen acá para que puedas intentar de nuevo.';
    } catch { status.textContent = 'No pudimos confirmar la recepción. Tus datos siguen acá para que puedas intentar de nuevo.'; }
    finally { pending = false; controls.forEach(n => { n.disabled = false; }); resetChallenge(); }
  });
  $('#hallazgo-social').addEventListener('input', event => event.target.setCustomValidity(''));
}
