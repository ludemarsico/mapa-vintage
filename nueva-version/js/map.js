import { $, el } from './dom.js';
export function createMap(onSelect) {
  const L = window.L;
  const error = $('#map-error');
  if (!L) {
    $('#map').replaceChildren(el('p', { class: 'map-loading' }, 'No pudimos cargar la biblioteca del mapa. Podés consultar los locales en la lista.'));
    return { update() {}, select() {}, resize() {}, fit() {} };
  }
  $('#map').replaceChildren();
  // El mapa siempre se puede arrastrar y pellizcar. La rueda del mouse sigue bajando la página; para acercar están + y −.
  const map = L.map('map', { scrollWheelZoom: false, dragging: true, touchZoom: true, doubleClickZoom: true, boxZoom: false, keyboard: true }).setView([-34.6037, -58.415], 12);
  map.attributionControl.setPrefix(false);
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
  let errors = 0; tiles.on('tileerror', () => { if (++errors >= 3) error.textContent = 'El fondo cartográfico no pudo cargarse por completo. La lista sigue disponible.'; });
  // Con muchos locales, los pines cercanos se agrupan; sin el complemento se muestran sueltos como antes.
  const layer = (L.markerClusterGroup ? L.markerClusterGroup({
    chunkedLoading: true, showCoverageOnHover: false, maxClusterRadius: 45, disableClusteringAtZoom: 17,
    iconCreateFunction: group => { const n = Number(group.getChildCount()); return L.divIcon({ className: 'map-cluster', html: '<span>' + n + '</span><span class="visually-hidden"> locales; acercar el mapa</span>', iconSize: [44, 44] }); }
  }) : L.layerGroup()).addTo(map);
  const markers = new Map();
  let visible = [], selectedId = '', pendingFit = false;
  const icon = selected => L.divIcon({
    className: 'map-pin',
    html: '<div class="map-marker' + (selected ? ' selected' : '') + '"><img src="assets/miscelaneas/pin-etiqueta' + (selected ? '-rosa' : '') + '.svg" width="28" height="34" alt="" aria-hidden="true" draggable="false"></div>',
    iconSize: [44, 44], iconAnchor: [22, 35], popupAnchor: [0, -34]
  });
  const icons = { normal: icon(false), selected: icon(true) };
  const popupFor = store => {
    const popup = el('div'); popup.append(el('h3', {}, store.nombre), el('p', {}, store.direccion));
    const button = el('button', { type: 'button', class: 'map-popup-link' }, 'Ver ficha');
    button.onclick = () => onSelect(store.id, true); popup.append(button);
    return popup;
  };
  // Cada marcador se crea una vez y se reutiliza al cambiar filtros; su viñeta se arma recién al abrirse.
  const markerFor = s => {
    if (markers.has(s.id)) return markers.get(s.id);
    const marker = L.marker([s.lat, s.lng], { icon: icons.normal, title: s.nombre, alt: s.nombre, keyboard: true });
    marker.bindPopup(() => popupFor(s), { className: 'store-map-popup', minWidth: 150, maxWidth: 220 });
    marker.on('add', () => {
      const markerElement = marker.getElement(); if (!markerElement) return;
      markerElement.setAttribute('role', 'button'); markerElement.setAttribute('aria-label', s.nombre + ', ver ficha');
      markerElement.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onSelect(s.id, false); }
      });
    });
    marker.on('click', () => onSelect(s.id, false)); markers.set(s.id, marker);
    return marker;
  };
  const setSelected = id => {
    if (selectedId && selectedId !== id) markers.get(selectedId)?.setIcon(icons.normal);
    selectedId = id; if (id) markers.get(id)?.setIcon(icons.selected);
  };
  const hasSize = () => { const size = map.getSize(); return size.x > 0 && size.y > 0; };
  const fit = () => {
    map.invalidateSize(false);
    if (!hasSize()) { pendingFit = true; return; }
    pendingFit = false;
    if (visible.length) map.fitBounds(L.latLngBounds(visible.map(s => [s.lat, s.lng])), { padding: [35, 35], maxZoom: 14 });
  };
  const api = {
    update(stores, selected) {
      visible = stores; layer.clearLayers();
      const list = stores.map(markerFor);
      if (layer.addLayers) layer.addLayers(list); else list.forEach(m => m.addTo(layer));
      setSelected(stores.some(s => s.id === selected) ? selected : '');
      fit();
    },
    select(id, pan = true) {
      setSelected(id);
      const m = markers.get(id); if (!m || !visible.some(s => s.id === id)) return;
      const open = () => m.openPopup();
      if (layer.zoomToShowLayer) {
        // Si el pin está dentro de un grupo, se acerca lo necesario para mostrarlo.
        if (pan || !m.getElement()) layer.zoomToShowLayer(m, () => { if (pan) map.panTo(m.getLatLng(), { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches }); open(); });
        else open();
      } else { if (pan) map.panTo(m.getLatLng(), { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches }); open(); }
    },
    resize() { map.invalidateSize(false); if (pendingFit && hasSize()) fit(); },
    fit
  };
  // "Ver todos los resultados" vive dentro del mapa, en la esquina opuesta a + y −.
  const FitControl = L.Control.extend({ options: { position: 'topright' }, onAdd() {
    const button = L.DomUtil.create('button', 'map-fit-control');
    button.type = 'button'; button.textContent = 'Ver todos los resultados';
    L.DomEvent.disableClickPropagation(button); L.DomEvent.on(button, 'click', () => { map.invalidateSize(false); fit(); });
    return button;
  } });
  map.addControl(new FitControl());
  return api;
}
