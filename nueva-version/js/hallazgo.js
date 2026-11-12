import { CONFIG } from './config.js';
import { DEMO } from './demo.js';
import { safeURL } from './data.js';
import { $ } from './dom.js';
import { aportesEndpoint, sendAporte } from './forms.js';
export const PHOTO_LIMIT = 15 * 1024 * 1024;
export function photoError(file) {
  if (!file) return 'Elegí una foto para compartir.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Elegí una foto JPG, PNG o WebP.';
  if (file.size <= 0 || file.size > PHOTO_LIMIT) return 'La foto debe pesar hasta 15 MB.';
  return '';
}
// La red social se escribe como @usuario (Instagram); también se acepta un enlace completo. Vacío es válido.
export function socialHandle(value) {
  const s = String(value || '').trim(); if (!s) return '';
  const handle = s.match(/^@?([A-Za-z0-9_.]{1,30})$/); if (handle) return 'https://www.instagram.com/' + handle[1] + '/';
  return safeURL(s);
}
// La foto viaja como JPEG de hasta 1600 px: pesa poco y pierde los datos internos del archivo (como la ubicación).
async function preparePhoto(file, max = 1600) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d'); context.fillStyle = '#FFFFFF'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  const url = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  return String(url).split(',')[1];
}
export function initHallazgo() {
  const form = $('#hallazgo-form'), fileInput = $('#hallazgo-photo'), preview = $('#hallazgo-preview'), button = $('#hallazgo-submit'), status = $('#hallazgo-status');
  const endpoint = DEMO ? '' : aportesEndpoint(CONFIG.aportes?.endpoint);
  let previewURL = '', pending = false, draftId = crypto.randomUUID();
  const offMessage = DEMO ? 'Contenido de demostración. Los envíos están desactivados.' : 'La recepción de fotos todavía no está habilitada. Tu aporte no se enviará.';
  const releasePreview = () => { if (previewURL) URL.revokeObjectURL(previewURL); previewURL = ''; };
  window.addEventListener('pagehide', releasePreview);
  form.addEventListener('input', event => { if (!pending && ['photo', 'text', 'alias', 'social_url'].includes(event.target.name)) draftId = crypto.randomUUID(); });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0], error = photoError(file); releasePreview();
    $('#hallazgo-photo-choose').textContent = file ? 'Cambiar foto ↗' : 'Elegí una foto ↗';
    fileInput.setCustomValidity(error); preview.hidden = true; $('#hallazgo-photo-prompt').hidden = false;
    if (error) { if (file) status.textContent = error; return; }
    status.textContent = endpoint ? '' : offMessage;
    previewURL = URL.createObjectURL(file); preview.src = previewURL; preview.hidden = false; $('#hallazgo-photo-prompt').hidden = true;
  });
  button.disabled = !endpoint; status.textContent = endpoint ? '' : offMessage;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!endpoint || pending) { if (!endpoint) status.textContent = offMessage; return; }
    fileInput.setCustomValidity(photoError(fileInput.files[0]));
    const social = $('#hallazgo-social'); social.setCustomValidity(social.value.trim() && !socialHandle(social.value) ? 'Escribí tu usuario con @ (por ejemplo @mapavintage) o un enlace https://.' : '');
    if (!form.reportValidity()) return;
    pending = true; button.disabled = true; status.textContent = 'Enviando tu hallazgo…';
    // Se congelan los campos mientras se envía.
    const controls = [...form.querySelectorAll('input,textarea')]; controls.forEach(n => { n.disabled = true; });
    let error;
    try {
      const foto = await preparePhoto(fileInput.files[0]);
      error = await sendAporte(endpoint, { tipo: 'hallazgo', submission_id: draftId, alias: $('#hallazgo-alias').value.trim(), texto: $('#hallazgo-text').value.trim(), red: socialHandle(social.value), foto });
    } catch { error = 'No pudimos preparar la foto. Probá con otra.'; }
    controls.forEach(n => { n.disabled = false; });
    if (!error) {
      status.textContent = 'Gracias, recibí tu hallazgo. Lo voy a revisar antes de publicarlo.';
      form.reset(); $('#hallazgo-photo-choose').textContent = 'Elegí una foto ↗'; releasePreview(); preview.hidden = true; $('#hallazgo-photo-prompt').hidden = false; draftId = crypto.randomUUID();
    } else status.textContent = error + ' Tus datos siguen acá para que puedas intentar de nuevo.';
    pending = false; button.disabled = false;
  });
  $('#hallazgo-social').addEventListener('input', event => event.target.setCustomValidity(''));
}
