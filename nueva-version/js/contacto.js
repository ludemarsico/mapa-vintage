import { CONFIG } from './config.js';
import { $ } from './dom.js';
// "Escribime" ofrece elegir la app de correo. Sin JavaScript queda el mailto original.
export function mailOptions(email) {
  const to = encodeURIComponent(email);
  return {
    gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + to,
    outlook: 'https://outlook.live.com/mail/0/deeplink/compose?to=' + to,
    mailto: 'mailto:' + email
  };
}
export function initContact() {
  const trigger = $('#contact-write'), menu = $('#mail-options'); if (!trigger || !menu) return;
  const urls = mailOptions(CONFIG.email);
  menu.querySelectorAll('[data-mail]').forEach(a => { a.href = urls[a.dataset.mail]; });
  trigger.setAttribute('aria-haspopup', 'true'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', 'mail-options');
  const close = (focus = false) => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (focus) trigger.focus(); };
  trigger.addEventListener('click', event => {
    event.preventDefault();
    const open = menu.hidden; menu.hidden = !open; trigger.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelector('a,button')?.focus();
  });
  menu.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); close(true); } });
  document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !trigger.contains(event.target)) close(); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));
  const status = $('#mail-copy-status');
  $('#mail-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(CONFIG.email); status.textContent = 'Copiaste la dirección.'; }
    catch { status.textContent = 'Copiá la dirección: ' + CONFIG.email; }
  });
}
