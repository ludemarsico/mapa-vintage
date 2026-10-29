import { safeURL, safeImage } from './data.js';
export const $ = selector => document.querySelector(selector);
export function el(tag, attrs = {}, text = '') {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v;
    // Estilos por CSSOM: compatibles con una Content-Security-Policy sin estilos en línea.
    else if (k === 'style') n.style.cssText = String(v); else if (v !== undefined && v !== null) n.setAttribute(k, String(v)); }
  if (text) n.textContent = text;
  return n;
}
export function link(text, url, className = '') {
  const n = el('a', { class: className }, text), safe = safeURL(url);
  if (safe) { n.href = safe; n.target = '_blank'; n.rel = 'noopener noreferrer'; } return n;
}
export function picture(url, alt) {
  const src = safeImage(url); if (!src) return null;
  const img = el('img', { src, alt: alt || '', loading: 'lazy', width: 800, height: 600 });
  img.addEventListener('error', () => { const fallback = el('p', { class: 'small' }, alt ? 'Imagen no disponible. ' + alt : 'Imagen no disponible.'); img.replaceWith(fallback); });
  return img;
}
export function paragraphs(text, container) {
  String(text || '').split(/\n\s*\n/).filter(Boolean).forEach(p => container.append(el('p', {}, p)));
}
