// Cuatro vistas: se muestra una sección padre por vez. Cualquier ancla interna abre la vista que la contiene,
// así siguen funcionando los enlaces compartidos (#recorridos, ?nota=…#proyecto, #sobre-el-proyecto).
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function initViews(onChange) {
  const views = [...document.querySelectorAll('.view')]; if (!views.length) return () => {};
  const links = [...document.querySelectorAll('#navigation a[href^="#"]')];
  let current = null;
  const locate = hash => {
    let id = ''; try { id = decodeURIComponent((hash || '').slice(1)); } catch { return null; }
    const target = id && id !== 'inicio' ? document.getElementById(id) : null;
    const view = target?.closest('.view');
    return view ? { view, target } : null;
  };
  function show(view, target) {
    const changed = view !== current;
    if (changed) {
      views.forEach(v => { v.hidden = v !== view; });
      document.body.dataset.view = view.dataset.view; current = view;
      links.forEach(a => { if (a.getAttribute('href') === '#' + view.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      if (!reduced()) { view.classList.remove('is-entering'); void view.offsetWidth; view.classList.add('is-entering'); }
      onChange?.(view.dataset.view);
    }
    const behavior = changed || reduced() ? 'instant' : 'smooth';
    if (target && target !== view) target.scrollIntoView({ block: 'start', behavior });
    else window.scrollTo({ top: 0, behavior });
  }
  const route = () => { const found = locate(location.hash); show(found?.view || views[0], found?.target); };
  window.addEventListener('hashchange', route);
  views.forEach(v => v.addEventListener('animationend', () => v.classList.remove('is-entering')));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]'); if (!link) return;
    // "Volver arriba" sube dentro de la vista actual, sin cambiar de sección.
    if (link.hasAttribute('data-top')) { event.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? 'instant' : 'smooth' }); document.querySelector('.header-logo')?.focus({ preventScroll: true }); return; }
    // Un enlace al ancla actual no dispara hashchange: se resuelve igual.
    if (link.getAttribute('href') === location.hash) { event.preventDefault(); route(); }
  });
  route();
  initReveal();
  return route;
}
// Las subsecciones aparecen con un fundido breve al entrar en pantalla. Sin soporte o con movimiento reducido, se ven de inmediato.
function initReveal() {
  if (!('IntersectionObserver' in window) || reduced()) return;
  const items = document.querySelectorAll('.view > section:not(#mapa-seccion), .care-section > .fabric-layout, .care-section > .garment-layout, .notes-section, .hallazgo-surface, .contribution-entries');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  items.forEach(item => { item.classList.add('reveal'); observer.observe(item); });
}
