import { CONFIG } from './config.js';
import { CARE, GLOSSARY } from './content.js';
import { fetchRows, published, nextEventDate, safeImage, safeURL, validDate } from './data.js';
import { $, el, link, picture, paragraphs } from './dom.js';
export function initCare() {
  const fallback = $('#care-fallback');
  const fan = $('.swatch-fan');
  CARE.slice(0, 8).forEach((item, i) => {
    const leaf = el('span', { class: 'fan-leaf', style: `--angle:${-56 + i * 16}deg;--leaf-color:${['#DCCBA4','#ECC8BE','#C9D2B7','#EBDDAA','#D5C8AF','#A3B4C0','#E9E4D7','#D9C9D2'][i]};--leaf-order:${i}` }, item.titulo);
    fan.append(leaf);
  });
  const initGroup = (items, buttonRoot, readingRoot, garments = false) => {
    let index = 0;
    const root = $(buttonRoot), reading = $(readingRoot);
    const render = () => {
      [...root.children].forEach((b, i) => b.setAttribute('aria-pressed', String(index === i)));
      const item = items[index]; reading.replaceChildren(el('h4', {}, item.titulo), el('p', { class: 'care-full' }, item.texto));
      const controls = el('div', { class: 'care-controls' });
      const prev = el('button', { type: 'button', 'aria-label': 'Cuidado anterior' }, '← Anterior');
      const next = el('button', { type: 'button', 'aria-label': 'Cuidado siguiente' }, 'Siguiente →');
      const change = delta => { index = (index + delta + items.length) % items.length; render(); reading.querySelector(delta > 0 ? '[aria-label="Cuidado siguiente"]' : '[aria-label="Cuidado anterior"]').focus({ preventScroll: true }); };
      prev.onclick = () => change(-1); next.onclick = () => change(1);
      controls.append(prev, el('span', {}, `${index + 1} / ${items.length}`), next); reading.append(controls);
    };
    items.forEach((item, i) => {
      const b = el('button', { type: 'button', class: garments ? 'garment-button' : 'swatch', 'aria-pressed': String(!i), 'aria-controls': reading.id });
      b.append(el('span', {}, item.titulo));
      if (item.titulo === 'Calzado de cuero') b.append(picture('assets/cuidados/botas.webp', 'Recorte ilustrativo de botas del manual de marca'));
      b.onclick = () => { index = i; render(); if (!garments) { fan.classList.remove('flutter'); void fan.offsetWidth; fan.classList.add('flutter'); } }; root.append(b);
    });
    render();
  };
  initGroup(CARE.slice(0, 8), '#fabric-buttons', '#fabric-reading');
  initGroup(CARE.slice(8), '#garment-buttons', '#garment-reading', true);
  if (fallback) fallback.hidden = true;
}
export async function initEditorial(openReader) {
  let notesData = [];
  const errorState = (selector, retry) => {
    const status = $(selector); status.replaceChildren(el('span', {}, 'No pudimos cargar esta sección. '));
    const button = el('button', { type: 'button' }, 'Reintentar'); button.onclick = () => { status.replaceChildren(); retry(); }; status.append(button);
  };
  const loadAgenda = async () => {
    try {
      const { connected, rows } = await fetchRows(CONFIG.sources.agenda);
      if (!connected) return;
      const events = published(rows).map(r => ({ ...r, next: nextEventDate(r) })).filter(r => r.id && r.titulo && r.next).sort((a, b) => a.next.localeCompare(b.next));
      if (!events.length) return;
      let count = 3;
      const render = () => {
        const board = $('#agenda-board'); board.replaceChildren();
        events.slice(0, count).forEach(r => {
          const card = el('article', { class: 'agenda-poster' });
          const date = new Intl.DateTimeFormat('es-AR', { timeZone: CONFIG.timezone, day: 'numeric', month: 'long' }).format(new Date(r.next + 'T12:00:00-03:00'));
          card.append(el('time', { datetime: r.next }, date), el('h3', {}, r.titulo));
          const img = picture(r.imagen, r.titulo); if (img) card.append(img);
          [r.barrio, r.direccion, r.horario, r.acceso, r.descripcion].filter(Boolean).forEach(t => card.append(el('p', {}, t)));
          if (safeURL(r.enlace)) card.append(link('Ver detalles ↗', r.enlace, 'text-link'));
          board.append(card);
        });
        $('#agenda-more').hidden = count >= events.length;
      };
      $('#agenda-more').onclick = () => { count += 3; render(); }; render();
    } catch { $('#agenda-board').hidden = true; errorState('#agenda-status', () => { $('#agenda-board').hidden = false; loadAgenda(); }); }
  };
  const loadWall = async () => {
    try {
      const { connected, rows } = await fetchRows(CONFIG.sources.muro); if (!connected) return;
      const posts = published(rows).filter(r => r.id && r.nombre_alias && safeImage(r.imagen)).sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
      if (!posts.length) return;
      const wall = $('#wall'); wall.replaceChildren();
      posts.forEach(r => {
        const b = el('button', { type: 'button', class: 'wall-item', 'aria-label': 'Abrir hallazgo de ' + r.nombre_alias });
        b.append(picture(r.imagen, r.alt || 'Hallazgo compartido por ' + r.nombre_alias), el('span', {}, r.texto), el('strong', {}, r.nombre_alias));
        b.onclick = () => openReader(r.nombre_alias, container => { container.append(picture(r.imagen, r.alt || 'Hallazgo de ' + r.nombre_alias)); paragraphs(r.texto, container); if (safeURL(r.red_url)) container.append(link('Web o red social ↗', r.red_url, 'text-link')); }, b);
        wall.append(b);
      });
    } catch { $('#wall').hidden = true; errorState('#wall-status', () => { $('#wall').hidden = false; loadWall(); }); }
  };
  let noteIndex = 0, listView = false;
  const showNote = (r, opener, push = true) => {
    if (push) { const u = new URL(location.href); u.searchParams.set('nota', r.id); u.hash = 'proyecto'; history.pushState({ reader: true }, '', u); }
    openReader(r.titulo, container => { if (validDate(r.fecha)) container.append(el('time', { datetime: r.fecha }, r.fecha)); const img = picture(r.imagen, r.alt); if (img) container.append(img); paragraphs(r.cuerpo, container); }, opener, true);
  };
  const renderNotes = () => {
    const notes = $('#notes'); notes.replaceChildren(); notes.className = 'notes ' + (listView ? 'list' : 'stack');
    (listView ? notesData : [notesData[noteIndex]]).forEach(r => {
      const article = el('article', { class: 'note-paper' });
      if (validDate(r.fecha)) article.append(el('time', { datetime: r.fecha, class: 'small' }, r.fecha));
      const button = el('button', { type: 'button', class: 'text-link' }, 'Leer nota ↗');
      button.onclick = () => showNote(r, button);
      article.append(el('h4', {}, r.titulo), el('p', {}, r.bajada), button); notes.append(article);
    });
    $('#notes-controls').hidden = !notesData.length; $('#note-count').textContent = `${noteIndex + 1} / ${notesData.length}`;
    $('#note-prev').hidden = $('#note-next').hidden = $('#note-count').hidden = listView || notesData.length < 2;
    $('#notes-list-toggle').setAttribute('aria-pressed', String(listView)); $('#notes-list-toggle').textContent = listView ? 'Ver como papeles' : 'Ver en lista';
  };
  const loadNotes = async () => {
    try {
      const { connected, rows } = await fetchRows(CONFIG.sources.notas);
      notesData = published(rows).filter(r => r.id && r.titulo && r.cuerpo).sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
      if (connected && notesData.length) renderNotes();
      restoreNote();
    } catch { $('#notes').hidden = true; errorState('#notes-status', () => { $('#notes').hidden = false; loadNotes(); }); }
  };
  const restoreNote = () => {
    const id = new URL(location.href).searchParams.get('nota'); if (!id) return;
    const r = notesData.find(n => n.id === id);
    if (r) showNote(r, $('#proyecto a'), false);
    else $('#notes-status').textContent = 'La nota del enlace no está disponible o ya no está publicada.';
  };
  $('#note-prev').onclick = () => { noteIndex = (noteIndex - 1 + notesData.length) % notesData.length; renderNotes(); };
  $('#note-next').onclick = () => { noteIndex = (noteIndex + 1) % notesData.length; renderNotes(); };
  $('#notes-list-toggle').onclick = () => { listView = !listView; renderNotes(); };
  window.addEventListener('popstate', restoreNote);
  await Promise.allSettled([loadAgenda(), loadWall(), loadNotes()]);
}
