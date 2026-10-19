import { $, el, link } from './dom.js';
export function createMap(onSelect) {
  const L = window.L;
  const error = $('#map-error');
  if (!L) {
    $('#map').replaceChildren(el('p', { class: 'map-loading' }, 'No pudimos cargar la biblioteca del mapa. Podés consultar los locales en la lista.'));
    $('#map-interact').disabled = true; $('#map-fit').disabled = true;
    return { update() {}, select() {}, resize() {}, fit() {} };
  }
  $('#map').replaceChildren();
  const map = L.map('map', { scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: true }).setView([-34.6037, -58.415], 12);
  map.attributionControl.setPrefix(false);
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
  let errors = 0; tiles.on('tileerror', () => { if (++errors >= 3) error.textContent = 'El fondo cartográfico no pudo cargarse por completo. La lista sigue disponible.'; });
  const layer = L.layerGroup().addTo(map), markers = new Map();
  let visible = [];
  const icon = selected => L.divIcon({
    className: 'map-pin',
    html: '<div class="map-marker' + (selected ? ' selected' : '') + '"><img src="assets/miscelaneas/pin-etiqueta' + (selected ? '-rosa' : '') + '.svg" width="28" height="34" alt="" aria-hidden="true" draggable="false"></div>',
    iconSize: [44, 44], iconAnchor: [22, 35], popupAnchor: [0, -34]
  });
  const syncPopup = (marker, store) => {
    const popup = el('div'); popup.append(el('h3', {}, store.nombre), el('p', {}, store.direccion));
    const button = el('button', { type: 'button', class: 'map-popup-link' }, 'Ver ficha');
    button.onclick = () => onSelect(store.id, true); popup.append(button);
    marker.bindPopup(popup, { className: 'store-map-popup', minWidth: 150, maxWidth: 220 });
  };
  const fit = () => { map.invalidateSize(false); if (visible.length) map.fitBounds(visible.map(s => [s.lat, s.lng]), { padding: [35, 35], maxZoom: 14 }); };
  const api = {
    update(stores, selected) {
      visible = stores; layer.clearLayers(); markers.clear();
      stores.forEach(s => {
        const marker = L.marker([s.lat, s.lng], { icon: icon(s.id === selected), title: s.nombre, alt: s.nombre, keyboard: true }).addTo(layer);
        syncPopup(marker, s);
        const markerElement = marker.getElement();
        markerElement.setAttribute('role', 'button'); markerElement.setAttribute('aria-label', s.nombre + ', ver ficha');
        markerElement.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onSelect(s.id, false); }
        });
        marker.on('click', () => onSelect(s.id, false)); markers.set(s.id, marker);
      });
      fit();
    },
    select(id, pan = true) {
      markers.forEach((m, key) => m.setIcon(icon(key === id)));
      const m = markers.get(id); if (m) { if (pan) map.panTo(m.getLatLng(), { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches }); m.openPopup(); }
    }, resize() { map.invalidateSize(false); }, fit
  };
  $('#map-fit').onclick = () => { map.invalidateSize(false); fit(); };
  $('#map-interact').onclick = event => {
    const button = event.currentTarget, active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Desactivar desplazamiento' : 'Activar desplazamiento';
    if (active) { map.dragging.enable(); map.touchZoom.enable(); } else { map.dragging.disable(); map.touchZoom.disable(); }
  };
  return api;
}
