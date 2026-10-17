import { CONFIG } from './config.js';
import { fetchRows, normalizeStores, matches } from './data.js';
import { generateRoute, alternatives, encodeRoute, restoreRoute, googleRoute } from './routes.js';
import { $, el, link } from './dom.js';
import { createMap } from './map.js';
import { initCare, initGlossary, initEditorial } from './editorial.js';
import { initForms } from './forms.js';
import { initHallazgo } from './hallazgo.js';

// Navegación y diálogos no dependen de Sheets ni del mapa.
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
if (CONFIG.logo) {
  [['#brand-logo', '#brand-name'], ['#footer-logo', '#footer-name']].forEach(([imageSelector, nameSelector]) => {
    const logo = $(imageSelector); logo.src = CONFIG.logo; logo.hidden = false; $(nameSelector).hidden = true;
    logo.onerror = () => { logo.hidden = true; $(nameSelector).hidden = nameSelector === '#footer-name'; };
  });
}
function projectHash() { if (location.hash === '#sobre-el-proyecto') $('#sobre-el-proyecto').open = true; }
window.addEventListener('hashchange', projectHash); projectHash();
initForms(openDialog); initHallazgo(); initGlossary(); initCare(); initEditorial(openReader);

const state = { stores: [], filtered: [], page: 1, selected: '', loaded: false, prefs: { barrio: '', prenda: '', mode: 'express' }, stops: [] };
let mapAPI;
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
    const meta = el('div', { class: 'meta' }); meta.append(el('span', {}, s.barrio), el('span', {}, priceLabels[s.precio] || 'Precio sin informar'));
    article.append(meta, el('h3', {}, s.nombre), el('p', { class: 'specialties' }, 'Prendas que predominan: ' + (s.prendas.join(', ') || 'Sin detalle de prendas')));
    if (s.especialidades.length) article.append(el('p', { class: 'specialties' }, 'Selección informada: ' + s.especialidades.join(' · ')));
    article.append(el('p', {}, s.direccion), el('p', { class: 'specialties' }, s.horarios || 'Horarios sin informar'));
    const actions = el('div', { class: 'actions' });
    const button = el('button', { type: 'button' }, 'Ver en el mapa');
    button.onclick = () => { selectStore(s.id); switchView('map'); mapAPI.resize(); mapAPI.select(s.id); $('#map-column').scrollIntoView({ block: 'nearest', behavior: 'auto' }); };
    const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${s.nombre}, ${s.direccion}, CABA`);
    actions.append(button, link('Cómo llegar ↗', maps)); if (s.web) actions.append(link('Web o red social ↗', s.web)); article.append(actions); root.append(article);
  });
}
function applyFilters() {
  state.page = 1; const filters = filterState(); state.filtered = state.stores.filter(s => matches(s, filters));
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
$('#filters').addEventListener('input', () => { if (state.loaded) applyFilters(); });
$('#filters').addEventListener('reset', () => setTimeout(() => { if (state.loaded) applyFilters(); }));
$('#page-prev').onclick = () => { if (state.page > 1) { state.page--; renderList(); $('#store-list').scrollTop = 0; } };
$('#page-next').onclick = () => { if (state.page * CONFIG.pageSize < state.filtered.length) { state.page++; renderList(); $('#store-list').scrollTop = 0; } };
const setOptions = (selector, values, labels = {}) => { const select = $(selector), previous = select.value; while (select.options.length > 1) select.remove(1); values.forEach(v => select.append(el('option', { value: v }, labels[v] || v))); if (values.includes(previous)) select.value = previous; };
async function loadStores() {
  state.loaded = false; $('#results-count').textContent = 'Estamos cargando los locales.'; $('#route-submit').disabled = true;
  try {
    const { rows } = await fetchRows(CONFIG.sources.locales); const { stores, review } = normalizeStores(rows); state.stores = stores; state.loaded = true;
    const barrios = [...new Set(stores.map(s => s.barrio))].sort((a, b) => a.localeCompare(b, 'es'));
    const prendas = ['Sastrería & Archivo', 'Denim & Streetwear 90s', 'Sin género / Oversized', 'Carteras, Calzado & Accesorios', 'Cuero & Tapados'];
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
  state.prefs = prefsFromForm(); state.stops = generateRoute(state.stores, state.prefs); renderRoute(); updateRouteURL(false);
});
function updateRouteURL(replace = true) { const url = encodeRoute(location.href, state.prefs, state.stops); history[replace ? 'replaceState' : 'pushState']({ route: true }, '', url); }
function renderRoute(extra = '') {
  $('#route-placeholder').hidden = true; $('#route-result').hidden = false; const stops = state.stops;
  const minimum = state.prefs.mode === 'full' ? 3 : 2;
  $('#route-status').textContent = [extra, stops.length < minimum ? 'Con estas preferencias no pudimos armar un recorrido completo. Podés ampliar la búsqueda o visitar los locales que sí encontramos.' : ''].filter(Boolean).join(' ');
  const root = $('#route-stops'); root.replaceChildren();
  stops.forEach((s, i) => {
    const li = el('li'); li.append(el('h4', {}, s.nombre), el('p', {}, `${s.direccion} · ${s.barrio}`));
    const actions = el('div', { class: 'actions' });
    const remove = el('button', { type: 'button', 'aria-label': 'Sacar del recorrido: ' + s.nombre }, 'Sacar del recorrido');
    remove.onclick = () => { state.stops.splice(i, 1); renderRoute(); updateRouteURL(); $('#route-stops').focus({ preventScroll: true }); };
    const options = alternatives(state.stores, stops, i, state.prefs);
    if (options.length) {
      const replace = el('button', { type: 'button', 'aria-label': 'Cambiar este local: ' + s.nombre }, 'Cambiar este local');
      replace.onclick = () => { state.stops[i] = options[0]; renderRoute(); updateRouteURL(); $('#route-stops').children[i]?.querySelector('button')?.focus({ preventScroll: true }); }; actions.append(replace);
    }
    actions.append(remove); li.append(actions); root.append(li);
  });
  const url = encodeRoute(location.href, state.prefs, stops);
  $('#route-google').hidden = $('#route-whatsapp').hidden = $('#route-copy').hidden = !stops.length;
  $('#route-google').href = googleRoute(stops);
  $('#route-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent('Mi recorrido de Mapa Vintage: ' + url);
  $('#route-message').textContent = '';
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
  state.stops = restored.stops; state.prefs = restored.prefs;
  $('#route-barrio').value = state.prefs.barrio; $('#route-prenda').value = state.prefs.prenda; $('#route-form').elements.mode.value = state.prefs.mode;
  renderRoute([restored.missing ? 'El enlace incluye paradas retiradas, repetidas o preferencias que cambiaron. Revisá el recorrido actual.' : '', restored.discontinuous ? 'Las paradas compartidas están demasiado separadas para nuestro criterio de paseo. Volvé a generar la propuesta.' : ''].filter(Boolean).join(' '));
}
window.addEventListener('popstate', restoreSharedRoute);
window.addEventListener('resize', () => mapAPI.resize());
loadStores();
