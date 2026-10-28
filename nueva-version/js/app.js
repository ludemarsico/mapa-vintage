import { CONFIG } from './config.js';
import { fetchRows, normalizeStores, filterStores } from './data.js';
import { generateRoutes, alternatives, encodeRoute, restoreRoute, googleRoute } from './routes.js';
import { $, el, link } from './dom.js';
import { createMap } from './map.js';
import { initCare, initGlossary, initEditorial } from './editorial.js';
import { initForms } from './forms.js';
import { initHallazgo } from './hallazgo.js';
import { initViews } from './views.js';
import { initContact } from './contacto.js';

// Navegación y diálogos no dependen de Sheets ni del mapa.
// Al volver a la vista Mapa, Leaflet recalcula su tamaño (estaba oculto).
let mapAPI;
initViews(view => { if (view === 'mapa') requestAnimationFrame(() => mapAPI?.resize()); });
const toggle = $('.menu-toggle'), nav = $('#navigation');
function closeMenu(focus = false) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir navegación'); if (focus) toggle.focus(); }
toggle.onclick = () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación'); };
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (nav.classList.contains('open')) { closeMenu(true); e.preventDefault(); } }
  if (e.key === 'Tab' && nav.classList.contains('open')) {
    const focusables = [toggle, ...nav.querySelectorAll('a,summary')].filter(n => n.getClientRects().length);
    const first = focusables[0], last = focusables.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
const openers = new WeakMap();
function openDialog(dialog, opener) { openers.set(dialog, opener || document.activeElement); if (!dialog.open) dialog.showModal(); document.body.classList.add('body-modal'); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { if (!$('dialog[open]')) document.body.classList.remove('body-modal'); openers.get(dialog)?.focus({ preventScroll: true });
    if (dialog.id === 'reader-dialog' && new URL(location.href).searchParams.has('nota')) {
      if (history.state?.reader) history.back();
      else { const u = new URL(location.href); u.searchParams.delete('nota'); history.replaceState(null, '', u); }
    }
  });
});
function openReader(title, build, opener, share = false) {
  $('#reader-title').textContent = title; $('#reader-content').replaceChildren(); build($('#reader-content'));
  $('#reader-share').hidden = !share; if (share) $('#reader-share').href = location.href;
  openDialog($('#reader-dialog'), opener);
}
window.addEventListener('popstate', () => { if (!new URL(location.href).searchParams.has('nota') && $('#reader-dialog').open) $('#reader-dialog').close(); });
// El logo del encabezado está fijo en index.html; CONFIG.logo solo controla el footer.
if (CONFIG.logo) {
  const logo = $('#footer-logo');
  if (logo) { logo.src = CONFIG.logo; logo.hidden = false; $('#footer-name').hidden = true; logo.onerror = () => { logo.hidden = true; $('#footer-name').hidden = false; }; }
}
function projectHash() { if (location.hash === '#sobre-el-proyecto') $('#sobre-el-proyecto').open = true; }
window.addEventListener('hashchange', projectHash); projectHash();
initForms(openDialog); initHallazgo(); initContact(); initGlossary(); initCare(); initEditorial(openReader);

const state = { stores: [], filtered: [], page: 1, selected: '', loaded: false, prefs: { barrio: '', prenda: '', mode: 'express' }, stops: [], skipped: new Set(), proposals: [], proposal: 0 };
const filterState = () => ({ query: $('#search').value, barrio: $('#filter-barrio').value, prendas: $('#filter-prenda').value ? [$('#filter-prenda').value] : [], precio: $('#filter-precio').value });
const priceLabels = { '$': '$ · Más accesible', '$$': '$$ · Intermedio', '$$$': '$$$ · Más alto' };
function switchView(view) {
  $('#directory-grid').dataset.view = view;
  $('#view-map').setAttribute('aria-pressed', String(view === 'map')); $('#view-list').setAttribute('aria-pressed', String(view === 'list'));
  if (view === 'map') requestAnimationFrame(() => mapAPI?.resize());
}
$('#view-map').onclick = () => switchView('map'); $('#view-list').onclick = () => switchView('list');
const selectStore = (id, showList = false) => {
  state.selected = id;
  const index = state.filtered.findIndex(s => s.id === id); if (index < 0) return;
  state.page = Math.floor(index / CONFIG.pageSize) + 1; renderList(); mapAPI.select(id, !showList);
  if (showList) switchView('list');
  const card = [...$('#store-list').children].find(n => n.dataset.id === id); if (card) { $('#store-list').scrollTop = card.offsetTop - $('#store-list').offsetTop; if (showList) card.focus({ preventScroll: true }); }
};
mapAPI = createMap(selectStore);
function renderList() {
  const root = $('#store-list'); root.replaceChildren();
  const pages = Math.ceil(state.filtered.length / CONFIG.pageSize);
  $('#pagination').hidden = !pages;
  $('#page-count').textContent = `Página ${state.page} de ${pages} · ${state.filtered.length} locales`;
  $('#page-prev').disabled = state.page <= 1; $('#page-next').disabled = state.page >= pages;
  if (!state.filtered.length) { root.append(el('p', { class: 'empty' }, 'No encontramos locales con esa combinación. Probá cambiar algún filtro.')); return; }
  state.filtered.slice((state.page - 1) * CONFIG.pageSize, state.page * CONFIG.pageSize).forEach(s => {
    const article = el('article', { class: 'store-card' + (s.id === state.selected ? ' selected' : ''), 'data-id': s.id, tabindex: '-1', 'aria-label': s.nombre });
    const meta = el('div', { class: 'meta' }); if (s.clasificacion) meta.append(el('span', { class: 'store-kind' }, s.clasificacion));
    meta.append(el('span', {}, s.barrio), el('span', {}, priceLabels[s.precio] || 'Precio sin informar'));
    article.append(meta, el('h3', {}, s.nombre));
    // Prendas y especialidades informadas como etiquetas.
    if (s.especialidades.length) { const tags = el('ul', { class: 'store-tags', 'aria-label': 'Prendas y especialidades' }); s.especialidades.forEach(t => tags.append(el('li', {}, t))); article.append(tags); }
    if (s.prendas.length) article.append(el('p', { class: 'specialties' }, 'Prendas que predominan: ' + s.prendas.join(', ')));
    article.append(el('p', {}, s.direccion), el('p', { class: 'specialties' }, s.horarios || 'Horarios sin informar'));
    const actions = el('div', { class: 'actions' });
    const button = el('button', { type: 'button' }, 'Ver en el mapa');
    button.onclick = () => { switchView('map'); mapAPI.resize(); selectStore(s.id); $('#map-column').scrollIntoView({ block: 'nearest', behavior: 'auto' }); };
    const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${s.nombre}, ${s.direccion}, CABA`);
    actions.append(button, link('Cómo llegar ↗', maps)); if (s.web) actions.append(link('Web o red social ↗', s.web)); article.append(actions); root.append(article);
  });
}
function applyFilters() {
  state.page = 1; const filters = filterState(); state.filtered = filterStores(state.stores, filters);
  if (!state.filtered.some(s => s.id === state.selected)) state.selected = '';
  $('#results-count').textContent = `${state.filtered.length} locales · todos los resultados en el mapa`;
  const chips = $('#active-filters'); chips.replaceChildren();
  [['query', filters.query, '#search'], ['barrio', filters.barrio, '#filter-barrio'], ['prenda', filters.prendas[0], '#filter-prenda'], ['precio', filters.precio, '#filter-precio']].forEach(([, value, selector]) => {
    if (!value) return; const button = el('button', { type: 'button', class: 'filter-chip', 'aria-label': 'Quitar filtro: ' + value }, value + ' ×');
    button.onclick = () => { $(selector).value = ''; applyFilters(); }; chips.append(button);
  });
  renderList(); mapAPI.update(state.filtered, state.selected);
}
$('#filters').addEventListener('submit', e => e.preventDefault());
// La búsqueda por nombre espera una pausa al escribir; los selectores filtran en el acto.
let searchTimer = 0;
$('#filters').addEventListener('input', event => { if (!state.loaded) return; clearTimeout(searchTimer); if (event.target.id === 'search') searchTimer = setTimeout(applyFilters, 180); else applyFilters(); });
$('#filters').addEventListener('reset', () => { clearTimeout(searchTimer); setTimeout(() => { if (state.loaded) applyFilters(); }); });
$('#page-prev').onclick = () => { if (state.page > 1) { state.page--; renderList(); $('#store-list').scrollTop = 0; } };
$('#page-next').onclick = () => { if (state.page * CONFIG.pageSize < state.filtered.length) { state.page++; renderList(); $('#store-list').scrollTop = 0; } };
const setOptions = (selector, values, labels = {}) => { const select = $(selector), previous = select.value; while (select.options.length > 1) select.remove(1); values.forEach(v => select.append(el('option', { value: v }, labels[v] || v))); if (values.includes(previous)) select.value = previous; };
async function loadStores() {
  state.loaded = false; $('#results-count').textContent = 'Estamos cargando los locales.'; $('#route-submit').disabled = true;
  try {
    const { rows } = await fetchRows(CONFIG.sources.locales); const { stores, review } = normalizeStores(rows); state.stores = stores; state.loaded = true;
    const barrios = [...new Set(stores.map(s => s.barrio))].sort((a, b) => a.localeCompare(b, 'es'));
    const prendas = CONFIG.categories;
    setOptions('#filter-barrio', barrios); setOptions('#route-barrio', barrios); setOptions('#filter-prenda', prendas); setOptions('#route-prenda', prendas);
    setOptions('#filter-precio', ['$', '$$', '$$$'].filter(p => stores.some(s => s.precio === p)), priceLabels);
    $('#route-submit').disabled = !stores.length;
    applyFilters();
    if (!stores.length) { $('#store-list').replaceChildren(el('p', { class: 'empty' }, 'No hay locales con datos suficientes para publicar en el directorio. Las fichas necesitan revisión editorial.')); $('#results-count').textContent = 'Sin locales publicables por ahora.'; }
    restoreSharedRoute();
  } catch {
    $('#results-count').textContent = 'No pudimos cargar los locales. Probá de nuevo en un momento.';
    $('#store-list').replaceChildren(el('p', { class: 'empty' }, 'No pudimos cargar los locales. Probá de nuevo en un momento.'));
    const retry = el('button', { type: 'button', class: 'retry' }, 'Reintentar'); retry.onclick = loadStores; $('#store-list').append(retry);
    $('#route-message').textContent = 'Necesitamos cargar los locales para armar tu recorrido.';
  }
}
function prefsFromForm() { return { barrio: $('#route-barrio').value, prenda: $('#route-prenda').value, mode: $('#route-form').elements.mode.value }; }
$('#route-form').addEventListener('submit', e => {
  e.preventDefault(); if (!state.loaded) return;
  // Las propuestas parten de los locales que muestra el mapa con sus filtros actuales.
  state.prefs = prefsFromForm(); state.proposals = generateRoutes(state.filtered, state.prefs, 3); state.proposal = 0;
  state.stops = [...(state.proposals[0] || [])]; state.skipped.clear(); renderRoute(); updateRouteURL(false);
});
function updateRouteURL(replace = true) { const url = encodeRoute(location.href, state.prefs, state.stops); history[replace ? 'replaceState' : 'pushState']({ route: true }, '', url); }
function renderRoute(extra = '') {
  $('#route-placeholder').hidden = true; $('#route-result').hidden = false; const stops = state.stops;
  const minimum = state.prefs.mode === 'full' ? 3 : 2, narrowed = state.filtered.length < state.stores.length;
  $('#route-status').textContent = [extra, stops.length < minimum ? 'Con estas preferencias no pudimos armar un recorrido completo. Podés ampliar la búsqueda o visitar los locales que sí encontramos.' : '', narrowed ? `Usamos los ${state.filtered.length} locales que muestra el mapa con tus filtros.` : ''].filter(Boolean).join(' ');
  renderProposals();
  const root = $('#route-stops'); root.replaceChildren();
  stops.forEach((s, i) => {
    const li = el('li'); li.append(el('h4', {}, s.nombre), el('p', {}, `${s.direccion} · ${s.barrio}`));
    const actions = el('div', { class: 'actions' });
    const remove = el('button', { type: 'button', 'aria-label': 'Sacar del recorrido: ' + s.nombre }, 'Sacar del recorrido');
    remove.onclick = () => { state.stops.splice(i, 1); renderRoute(); updateRouteURL(); $('#route-stops').focus({ preventScroll: true }); };
    const options = alternatives(state.filtered, stops, i, state.prefs);
    if (options.length) {
      const replace = el('button', { type: 'button', 'aria-label': 'Cambiar este local: ' + s.nombre }, 'Cambiar este local');
      // Se saltean los locales ya descartados hasta agotar las alternativas, para no alternar siempre entre los mismos dos.
      replace.onclick = () => {
        state.skipped.add(s.id);
        const fresh = options.filter(o => !state.skipped.has(o.id)); if (!fresh.length) { state.skipped.clear(); state.skipped.add(s.id); }
        state.stops[i] = (fresh.length ? fresh : options)[0]; renderRoute(); updateRouteURL(); $('#route-stops').children[i]?.querySelector('button')?.focus({ preventScroll: true }); }; actions.append(replace);
    }
    actions.append(remove); li.append(actions); root.append(li);
  });
  const url = encodeRoute(location.href, state.prefs, stops);
  $('#route-google').hidden = $('#route-whatsapp').hidden = $('#route-copy').hidden = !stops.length;
  $('#route-google').href = googleRoute(stops);
  $('#route-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent('Mi recorrido de Mapa Vintage: ' + url);
  $('#route-message').textContent = '';
}
// Selector de propuestas: solo aparece cuando hay más de una para elegir.
function renderProposals() {
  const root = $('#route-proposals'); root.replaceChildren(); root.hidden = state.proposals.length < 2;
  state.proposals.forEach((proposal, k) => {
    const button = el('button', { type: 'button', 'aria-pressed': String(k === state.proposal), 'aria-label': `Propuesta ${k + 1}: ${proposal.length} paradas` }, `Propuesta ${k + 1}`);
    button.onclick = () => { state.proposal = k; state.stops = [...proposal]; state.skipped.clear(); renderRoute(); updateRouteURL(); $('#route-proposals').children[k]?.focus({ preventScroll: true }); };
    root.append(button);
  });
}
$('#route-copy').onclick = async () => {
  const url = encodeRoute(location.href, state.prefs, state.stops);
  try { await navigator.clipboard.writeText(url); $('#route-message').textContent = 'Listo, copiaste el enlace del recorrido.'; }
  catch { $('#route-message').replaceChildren(el('span', {}, 'Copiá este enlace: ')); const input = el('input', { type: 'text', readonly: '', 'aria-label': 'Enlace del recorrido', value: url }); $('#route-message').append(input); input.focus(); input.select(); }
};
function restoreSharedRoute() {
  if (!state.loaded) return;
  const restored = restoreRoute(location.href, state.stores);
  if (!restored) { state.stops = []; $('#route-result').hidden = true; $('#route-placeholder').hidden = false; return; }
  state.stops = restored.stops; state.prefs = restored.prefs; state.skipped.clear(); state.proposals = []; state.proposal = 0;
  $('#route-barrio').value = state.prefs.barrio; $('#route-prenda').value = state.prefs.prenda; $('#route-form').elements.mode.value = state.prefs.mode;
  renderRoute([restored.missing ? 'El enlace incluye paradas retiradas, repetidas o preferencias que cambiaron. Revisá el recorrido actual.' : '', restored.discontinuous ? 'Las paradas compartidas están demasiado separadas para nuestro criterio de paseo. Volvé a generar la propuesta.' : ''].filter(Boolean).join(' '));
}
window.addEventListener('popstate', restoreSharedRoute);
let resizeFrame = 0;
window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => mapAPI.resize()); });
loadStores();
