/* Comparación aislada: carga la página existente y cambia sólo sus títulos. */
const frame = document.querySelector('#comparison-site');
const buttons = [...document.querySelectorAll('[data-font]')];
const status = document.querySelector('#comparison-status');
const options = {
  actual: { label: 'Actual · Instrument Serif', font: null },
  fraunces: { label: 'Fraunces', font: '600 48px "Fraunces Preview"' },
  syne: { label: 'Syne', font: '700 48px "Syne Preview"' }
};
const params = new URLSearchParams(location.search);
let selected = Object.hasOwn(options, params.get('fuente')) ? params.get('fuente') : 'fraunces';
let revision = 0;

async function applyFont(key, initial = false) {
  selected = key;
  const currentRevision = ++revision;
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.font === key)));
  const url = new URL(location.href);
  url.searchParams.set('fuente', key);
  history.replaceState(null, '', url);
  const doc = frame.contentDocument;
  if (!doc?.querySelector('#recorridos')) return;
  let css = doc.querySelector('#font-comparison-styles');
  if (!css) {
    css = doc.createElement('link');
    css.id = 'font-comparison-styles';
    css.rel = 'stylesheet';
    css.href = 'css/prueba-titulos.css';
    const ready = new Promise((resolve, reject) => {
      css.onload = resolve;
      css.onerror = reject;
    });
    doc.head.append(css);
    try { await ready; }
    catch { status.textContent = 'No se pudo cargar la prueba. Volvé a abrir esta página.'; return; }
  }
  try {
    if (options[key].font) await doc.fonts.load(options[key].font, 'Armá tu recorrido · ¿Qué estás buscando?');
  } catch {
    if (currentRevision === revision) status.textContent = 'No se pudo cargar esa fuente. Probá nuevamente.';
    return;
  }
  if (currentRevision !== revision) return;
  const win = frame.contentWindow;
  const sections = [...doc.querySelectorAll('main>section')];
  const anchor = sections.find(section => section.getBoundingClientRect().bottom > 100);
  const previousTop = anchor?.getBoundingClientRect().top;
  if (key === 'actual') delete doc.documentElement.dataset.fontPreview;
  else doc.documentElement.dataset.fontPreview = key;
  // Mantiene la sección que se estaba mirando al alternar las fuentes.
  if (initial) {
    const requested = url.hash.slice(1) || 'recorridos';
    (doc.getElementById(requested) || doc.querySelector('#recorridos')).scrollIntoView({ behavior: 'instant' });
  } else if (anchor) {
    win.scrollBy({ top: anchor.getBoundingClientRect().top - previousTop, behavior: 'instant' });
  }
  status.textContent = `Títulos: ${options[key].label} · Textos: Jost`;
}

buttons.forEach(button => button.addEventListener('click', () => applyFont(button.dataset.font)));
frame.addEventListener('load', () => applyFont(selected, true));
