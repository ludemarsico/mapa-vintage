import { CONFIG } from './config.js';
import { matches, filterStores } from './data.js';
export function distance(a, b) {
  const rad = v => v * Math.PI / 180;
  const dlat = rad(b.lat - a.lat), dlng = rad(b.lng - a.lng);
  const x = Math.sin(dlat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1 - x))) * CONFIG.route.distanceFactor;
}
export function totals(stops) {
  const km = stops.slice(1).reduce((sum, stop, i) => sum + distance(stops[i], stop), 0);
  const walk = Math.ceil(km / CONFIG.route.walkingKmh * 60), visits = stops.length * CONFIG.route.visitMinutes;
  return { km, walk, visits, minutes: walk + visits };
}
// Celdas del tamaño de un tramo máximo: los vecinos posibles de un local están en sus 9 celdas cercanas.
export function spatialIndex(stores) {
  const reach = CONFIG.route.maxLegKm / CONFIG.route.distanceFactor / 110.5;
  const maxLat = stores.reduce((m, s) => Math.max(m, Math.abs(s.lat)), 0);
  const latSize = reach, lngSize = reach / (Math.cos(maxLat * Math.PI / 180) || 1), cells = new Map();
  const cellOf = s => [Math.floor(s.lat / latSize), Math.floor(s.lng / lngSize)];
  for (const s of stores) { const [i, j] = cellOf(s), key = i + ':' + j; if (!cells.has(key)) cells.set(key, []); cells.get(key).push(s); }
  return {
    cells,
    near(s) { const [i, j] = cellOf(s), out = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const list = cells.get((i + a) + ':' + (j + b)); if (list) out.push(...list); } return out; }
  };
}
const MAX_SEEDS = 300;
// Con muchos candidatos se prueba un punto de partida por celda, en orden estable, hasta MAX_SEEDS.
function seedsFor(candidates, index) {
  if (candidates.length <= MAX_SEEDS) return candidates;
  const seeds = [...index.cells.values()].map(list => list.reduce((a, b) => a.id.localeCompare(b.id) <= 0 ? a : b));
  if (seeds.length <= MAX_SEEDS) return seeds;
  const step = seeds.length / MAX_SEEDS; return Array.from({ length: MAX_SEEDS }, (_, i) => seeds[Math.floor(i * step)]);
}
const preferenceFilter = prefs => ({ barrio: prefs.barrio, prendas: prefs.prenda ? [prefs.prenda] : [] });
// Varias propuestas distintas, mejor primero: más paradas y, a igualdad, menos caminata. Se priorizan las que no comparten locales.
export function generateRoutes(stores, prefs, count = 3) {
  const candidates = filterStores(stores, preferenceFilter(prefs));
  const limit = prefs.mode === 'full' ? 5 : 2, minimum = prefs.mode === 'full' ? 3 : 2;
  const budget = prefs.mode === 'full' ? CONFIG.route.fullMinutes : CONFIG.route.expressMinutes;
  const index = spatialIndex(candidates), routes = [], seen = new Set();
  for (const seed of seedsFor(candidates, index)) {
    const route = [seed];
    while (route.length < limit) {
      const last = route.at(-1);
      const next = index.near(last).filter(s => !route.some(p => p.id === s.id) && distance(last, s) <= CONFIG.route.maxLegKm)
        .sort((a, b) => distance(last, a) - distance(last, b) || a.id.localeCompare(b.id))
        .find(s => totals([...route, s]).minutes <= budget);
      if (!next) break; route.push(next);
    }
    const key = route.map(s => s.id).sort().join(',');
    if (!seen.has(key)) { seen.add(key); routes.push({ route, km: totals(route).km, key }); }
  }
  routes.sort((a, b) => b.route.length - a.route.length || a.km - b.km || a.key.localeCompare(b.key));
  if (!routes.length) return [];
  const floor = Math.min(routes[0].route.length, minimum), pool = routes.filter(r => r.route.length >= floor), chosen = [];
  const shares = (a, b) => a.route.some(s => b.route.some(p => p.id === s.id));
  for (const r of pool) if (chosen.length < count && !chosen.some(c => shares(c, r))) chosen.push(r);
  for (const r of pool) if (chosen.length < count && !chosen.includes(r)) chosen.push(r);
  return chosen.map(r => r.route);
}
export const generateRoute = (stores, prefs) => generateRoutes(stores, prefs, 1)[0] || [];
export function alternatives(stores, stops, index, prefs) {
  const budget = prefs.mode === 'full' ? CONFIG.route.fullMinutes : CONFIG.route.expressMinutes;
  return filterStores(stores, preferenceFilter(prefs)).filter(s => !stops.some(p => p.id === s.id))
    .filter(s => { const next = [...stops]; next[index] = s; return totals(next).minutes <= budget && next.every((p, i) => !i || distance(next[i - 1], p) <= CONFIG.route.maxLegKm); })
    .sort((a, b) => distance(stops[index], a) - distance(stops[index], b));
}
export function encodeRoute(base, prefs, stops) {
  const url = new URL(base); url.search = ''; url.hash = 'recorridos';
  url.searchParams.set('ruta', stops.map(s => s.id).join(','));
  if (prefs.barrio) url.searchParams.set('barrio', prefs.barrio);
  if (prefs.prenda) url.searchParams.set('prenda', prefs.prenda);
  url.searchParams.set('paseo', prefs.mode === 'full' ? 'full' : 'express');
  return url.href;
}
export function restoreRoute(url, stores) {
  const params = new URL(url).searchParams;
  if (!params.has('ruta')) return null;
  const ids = params.get('ruta').split(',').filter(Boolean);
  const prefs = { barrio: params.get('barrio') || '', prenda: params.get('prenda') || '', mode: params.get('paseo') === 'full' ? 'full' : 'express' };
  const unique = [...new Set(ids)].slice(0, prefs.mode === 'full' ? 5 : 2);
  const stops = unique.map(id => stores.find(s => s.id === id)).filter(Boolean);
  const missing = ids.length !== stops.length || stops.some(s => !matches(s, { barrio: prefs.barrio, prendas: prefs.prenda ? [prefs.prenda] : [] }));
  const discontinuous = stops.some((s, i) => i && distance(stops[i - 1], s) > CONFIG.route.maxLegKm);
  return { prefs, stops, missing, discontinuous };
}
export function googleRoute(stops) {
  if (!stops.length) return '';
  const u = new URL('https://www.google.com/maps/dir/'); u.searchParams.set('api', '1'); u.searchParams.set('travelmode', 'walking');
  const point = s => `${s.lat},${s.lng}`;
  u.searchParams.set('origin', point(stops[0])); u.searchParams.set('destination', point(stops.at(-1)));
  if (stops.length > 2) u.searchParams.set('waypoints', stops.slice(1, -1).map(point).join('|'));
  return u.href;
}
