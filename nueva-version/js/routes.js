import { CONFIG } from './config.js';
import { matches } from './data.js';
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
export function generateRoute(stores, prefs) {
  const candidates = stores.filter(s => matches(s, { barrio: prefs.barrio, prendas: prefs.prenda ? [prefs.prenda] : [] }));
  const limit = prefs.mode === 'full' ? 5 : 2;
  const budget = prefs.mode === 'full' ? CONFIG.route.fullMinutes : CONFIG.route.expressMinutes;
  let best = [];
  for (const seed of candidates) {
    const route = [seed];
    while (route.length < limit) {
      const last = route.at(-1);
      const next = candidates.filter(s => !route.some(p => p.id === s.id) && distance(last, s) <= CONFIG.route.maxLegKm)
        .sort((a, b) => distance(last, a) - distance(last, b) || a.id.localeCompare(b.id))
        .find(s => totals([...route, s]).minutes <= budget);
      if (!next) break; route.push(next);
    }
    if (route.length > best.length || (route.length === best.length && totals(route).km < totals(best).km)) best = route;
  }
  return best;
}
export function alternatives(stores, stops, index, prefs) {
  const budget = prefs.mode === 'full' ? CONFIG.route.fullMinutes : CONFIG.route.expressMinutes;
  return stores.filter(s => !stops.some(p => p.id === s.id) && matches(s, { barrio: prefs.barrio, prendas: prefs.prenda ? [prefs.prenda] : [] }))
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
