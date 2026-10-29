import { CONFIG } from './config.js';
import { CARE, GLOSSARY } from './content.js';
import { fetchRows, published, normalizeEvents, safeImage, safeURL, validDate } from './data.js';
import { $, el, link, picture, paragraphs } from './dom.js';
import { DEMO, DEMO_AGENDA, DEMO_WALL, DEMO_NOTES, demoStamp } from './demo.js';

export function initGlossary() {
  const root = $('#glossary-files'), fallback = el('div', { id: 'glossary-fallback' });
  while (root.firstChild) fallback.append(root.firstChild);
  const tabs = el('div', { class: 'folder-tabs', role: 'tablist', 'aria-label': 'Términos del glosario' });
  const panel = el('article', { class: 'folder-panel', role: 'tabpanel', id: 'glossary-panel', tabindex: '0' });
  const activate = (index, focus = false) => {
    [...tabs.children].forEach((b, i) => { b.setAttribute('aria-selected', String(i === index)); b.tabIndex = i === index ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'glossary-tab-' + index); panel.dataset.color = String(index);
    panel.replaceChildren(el('h3', {}, GLOSSARY[index].titulo), el('p', {}, GLOSSARY[index].texto));
    if (focus) tabs.children[index].focus({ preventScroll: true });
  };
  GLOSSARY.forEach((item, index) => {
    const button = el('button', { type: 'button', class: 'folder-tab', id: 'glossary-tab-' + index, role: 'tab', 'aria-controls': 'glossary-panel' }, item.titulo);
    button.onclick = () => activate(index);
    button.onkeydown = e => {
      const moves = { ArrowRight: (index + 1) % GLOSSARY.length, ArrowLeft: (index - 1 + GLOSSARY.length) % GLOSSARY.length, Home: 0, End: GLOSSARY.length - 1 };
      if (e.key in moves) { e.preventDefault(); activate(moves[e.key], true); }
    };
    tabs.append(button);
  });
  root.append(fallback, tabs, panel); activate(0); fallback.hidden = true;
}

// Deslizar horizontalmente en pantallas táctiles cambia de elemento; un toque sin desplazamiento sigue siendo un clic.
export function onSwipe(target, change) {
  let start = null, swiped = false;
  target.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') start = { x: e.clientX, y: e.clientY }; swiped = false; });
  target.addEventListener('pointerup', e => {
    if (!start) return; const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped = true; change(dx < 0 ? 1 : -1); }
  });
  target.addEventListener('pointercancel', () => { start = null; });
  target.addEventListener('click', e => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);
}

export function initCare() {
  const fallback = $('#care-fallback'), fan = $('.swatch-fan');
  fan.removeAttribute('aria-hidden'); fan.setAttribute('role', 'group'); fan.setAttribute('aria-label', 'Muestrario de materiales y tejidos');
  fan.querySelector('.swatch-ring').setAttribute('aria-hidden', 'true');
  const colors = ['#DCCBA4','#ECC8BE','#C9D2B7','#EBDDAA','#D5C8AF','#A3B4C0','#E9E4D7','#D9C9D2'];
  // Materiales: abanico de telas; cualquier tela visible se puede elegir. Prendas: una prenda por página con su figurín.
  // En ambos, flechas a los costados y deslizamiento en pantallas táctiles.
  const initGroup = (items, readingSelector, materials) => {
    let index = 0, turning = false;
    const reading = $(readingSelector), buttons = [];
    const stage = materials ? fan : $('#garment-buttons'), frame = materials ? $('.swatch-catalog') : stage;
    const restingAngles = [-48, -32, -16, 0, 16, 32, 48, 58];
    const noun = materials ? 'Tela' : 'Prenda';
    const prev = el('button', { type: 'button', class: 'care-arrow care-arrow-prev', 'aria-label': noun + ' anterior', 'aria-controls': reading.id }, '←');
    const next = el('button', { type: 'button', class: 'care-arrow care-arrow-next', 'aria-label': noun + ' siguiente', 'aria-controls': reading.id }, '→');
    const count = el('p', { class: 'care-count', 'aria-hidden': 'true' });
    const focusControl = target => {
      if (target === 'fan') buttons[index].focus({ preventScroll: true });
      else if (target) (target === 'next' ? next : prev).focus({ preventScroll: true });
    };
    const render = () => {
      buttons.forEach((button, i) => {
        const active = i === index; button.setAttribute('aria-pressed', String(active));
        if (materials) {
          button.tabIndex = active ? 0 : -1;
          const depth = (i - index + items.length) % items.length;
          button.style.setProperty('--leaf-order', active ? '20' : String(items.length - depth));
          button.style.setProperty('--leaf-angle', active ? '-4deg' : restingAngles[i] + 'deg');
        } else button.hidden = !active;
      });
      const item = items[index]; reading.replaceChildren(el('h4', {}, item.titulo), el('p', { class: 'care-full' }, item.texto));
      count.textContent = `${index + 1} / ${items.length}`;
      prev.disabled = next.disabled = turning;
    };
    const rotate = async (button, from, to, duration) => {
      const motion = button.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration, easing: 'cubic-bezier(.35,0,.2,1)', fill: 'forwards' });
      try { await motion.finished; } finally { motion.cancel(); }
    };
    const select = async (i, direction = 1, focus = '') => {
      if (turning) return;
      const nextIndex = (i + items.length) % items.length;
      if (nextIndex === index) return;
      const sequential = nextIndex === (index + direction + items.length) % items.length;
      if (!materials || !sequential || matchMedia('(prefers-reduced-motion: reduce)').matches || !buttons[index].animate) {
        index = nextIndex; render(); focusControl(focus); return;
      }
      turning = true; fan.setAttribute('aria-busy', 'true'); prev.disabled = next.disabled = true;
      const outgoing = index, moving = buttons[direction > 0 ? index : nextIndex];
      moving.dataset.turning = 'true';
      moving.style.setProperty('--turn-order', direction > 0 ? '40' : '0');
      let committed = false;
      const commit = () => { index = nextIndex; committed = true; render(); };
      try {
        await rotate(moving, direction > 0 ? -4 : restingAngles[nextIndex], -108, 280);
        moving.style.setProperty('--turn-order', direction > 0 ? '0' : '40');
        commit();
        await rotate(moving, -108, direction > 0 ? restingAngles[outgoing] : -4, 240);
      } catch {
        // Una interrupción del navegador conserva la selección y los controles.
        if (!committed) commit();
      } finally {
        delete moving.dataset.turning; moving.style.removeProperty('--turn-order');
        turning = false; fan.setAttribute('aria-busy', 'false'); prev.disabled = next.disabled = false;
        focusControl(focus);
      }
    };
    const change = delta => select(index + delta, delta, delta > 0 ? 'next' : 'prev');
    prev.onclick = () => change(-1); next.onclick = () => change(1);
    items.forEach((item, i) => {
      const button = el('button', { type: 'button', class: materials ? 'fan-leaf' : 'garment-button', 'aria-label': materials ? 'Mostrar cuidado de ' + item.titulo : item.titulo + ', ver la prenda siguiente', title: item.titulo, 'aria-controls': reading.id });
      button.append(el('span', { class: materials ? 'leaf-label' : 'garment-label' }, item.titulo));
      if (materials) {
        button.style.setProperty('--leaf-color', colors[i]);
        const path = safeImage(CONFIG.fabricImages?.[item.titulo]);
        if (path) {
          button.append(el('img', { class: 'leaf-texture', src: path, alt: '', 'aria-hidden': 'true', loading: 'lazy', decoding: 'async', draggable: 'false' }));
          button.classList.add('has-texture');
        }
      }
      else {
        const path = CONFIG.careImages?.[item.titulo], image = path ? picture(path, 'Recurso ilustrativo para ' + item.titulo) : null;
        if (image) { button.append(image); button.classList.add('has-art'); }
      }
      // La tela de arriba pasa a la siguiente; cualquier otra tela visible se elige directamente.
      button.onclick = () => materials ? (i === index ? select(index + 1, 1, 'fan') : select(i, (i - index + items.length) % items.length === 1 ? 1 : -1, 'fan')) : change(1);
      if (materials) button.onkeydown = e => {
        const moves = { ArrowRight: (i + 1) % items.length, ArrowLeft: (i - 1 + items.length) % items.length, Home: 0, End: items.length - 1 };
        if (e.key in moves) { e.preventDefault(); select(moves[e.key], e.key === 'ArrowLeft' || e.key === 'Home' ? -1 : 1, 'fan'); }
      };
      buttons.push(button); stage.append(button);
    });
    frame.classList.add('care-pager'); frame.append(prev, next, count);
    onSwipe(stage, change);
    render();
  };
  initGroup(CARE.slice(0, 8), '#fabric-reading', true);
  initGroup(CARE.slice(8), '#garment-reading', false);
  if (fallback) fallback.hidden = true;
}

export async function initEditorial(openReader) {
  let notesData = [];
  const errorState = (selector, retry) => {
    const status = $(selector); status.replaceChildren(el('span', {}, 'No pudimos cargar esta sección. '));
    const button = el('button', { type: 'button' }, 'Reintentar'); button.onclick = () => { status.replaceChildren(); retry(); }; status.append(button);
  };
  const stamp = () => el('span', { class: 'demo-stamp' }, demoStamp());
  // Agenda: listado paginado como el del Mapa, con la información de la hoja "Agenda".
  const dateLabel = iso => new Intl.DateTimeFormat('es-AR', { timeZone: CONFIG.timezone, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso + 'T12:00:00-03:00'));
  const loadAgenda = async () => {
    try {
      let events;
      if (DEMO) events = DEMO_AGENDA.map(r => ({ id: r.id, nombre: r.titulo, descripcion: r.descripcion, demo: true, next: '' }));
      else {
        const { connected, rows } = await fetchRows(CONFIG.sources.agenda); if (!connected) return;
        events = normalizeEvents(rows);
      }
      if (!events.length) return;
      $('#agenda').classList.remove('is-empty');
      let page = 1; const expanded = new Set();
      const render = () => {
        const board = $('#agenda-board'); board.replaceChildren();
        const pages = Math.ceil(events.length / CONFIG.pageSize);
        $('#agenda-pagination').hidden = pages < 2;
        $('#agenda-count').textContent = `Página ${page} de ${pages} · ${events.length} fechas`;
        $('#agenda-prev').disabled = page <= 1; $('#agenda-next').disabled = page >= pages;
        events.slice((page - 1) * CONFIG.pageSize, page * CONFIG.pageSize).forEach(r => {
          const card = el('article', { class: 'store-card agenda-card', 'aria-label': r.nombre });
          if (r.demo) card.append(stamp());
          const meta = el('div', { class: 'meta' });
          // Fecha si la hoja la tiene; si no, los días.
          const when = r.next ? el('time', { datetime: r.next }, dateLabel(r.next)) : r.dias || r.fechaTexto ? el('span', {}, r.dias || r.fechaTexto) : r.demo ? el('span', {}, 'Fecha · horario') : null;
          if (when) meta.append(when);
          if (r.barrio) meta.append(el('span', {}, r.barrio));
          if (r.precio) meta.append(el('span', { class: 'store-price' }, r.precio));
          if (r.tipo) meta.append(el('span', { class: 'store-kind' }, r.tipo));
          card.append(meta, el('h3', {}, r.nombre));
          const open = expanded.has(r.id), detailsId = 'agenda-details-' + r.id.replace(/[^\w-]/g, '_');
          const more = el('button', { type: 'button', class: 'store-more', 'aria-expanded': String(open), 'aria-controls': detailsId }, open ? 'Ver menos' : 'Ver más');
          const details = el('div', { class: 'store-details', id: detailsId }); details.hidden = !open;
          if (r.direccion) details.append(el('p', {}, r.direccion));
          if (r.dias && r.next) details.append(el('p', { class: 'specialties' }, r.dias));
          if (r.horario) details.append(el('p', { class: 'specialties' }, r.horario));
          [r.acceso, r.especialidad].filter(Boolean).forEach(t => details.append(el('p', { class: 'specialties' }, t)));
          if (r.descripcion) details.append(el('p', { class: 'store-description' }, r.descripcion));
          const img = picture(r.imagen, r.nombre); if (img) details.append(img);
          const actions = el('div', { class: 'actions' });
          if (r.direccion) actions.append(link('Cómo llegar ↗', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${r.direccion}, ${r.barrio ? r.barrio + ', ' : ''}CABA`)));
          if (r.enlace) actions.append(link('Instagram ↗', r.enlace));
          if (actions.children.length) details.append(actions);
          more.onclick = () => {
            const show = details.hidden; details.hidden = !show; more.setAttribute('aria-expanded', String(show)); more.textContent = show ? 'Ver menos' : 'Ver más';
            if (show) expanded.add(r.id); else expanded.delete(r.id);
          };
          if (details.children.length) card.append(more, details);
          board.append(card);
        });
      };
      $('#agenda-prev').onclick = () => { if (page > 1) { page--; render(); $('#agenda-board').scrollTop = 0; } };
      $('#agenda-next').onclick = () => { if (page * CONFIG.pageSize < events.length) { page++; render(); $('#agenda-board').scrollTop = 0; } };
      render();
    } catch { $('#agenda-board').hidden = true; errorState('#agenda-status', () => { $('#agenda-board').hidden = false; loadAgenda(); }); }
  };
  // Muro: Polaroids. Abajo, hasta 180 caracteres; "Seguir leyendo" da vuelta la foto para leer todo, con nombre y red social.
  // Se ven 3 en escritorio, 2 en tablet y 1 en el teléfono; las flechas (o deslizar) pasan a las siguientes.
  const WALL_PREVIEW = 180;
  const preview = text => {
    const flat = String(text || '').replace(/\s+/g, ' ').trim(); if (flat.length <= WALL_PREVIEW) return { text: flat, cut: false };
    let cut = flat.slice(0, WALL_PREVIEW); const space = cut.lastIndexOf(' '); if (space > WALL_PREVIEW * 0.6) cut = cut.slice(0, space);
    return { text: cut.replace(/[\s,.;:]+$/, '') + '…', cut: true };
  };
  const handleLabel = url => { const m = String(url).match(/^https:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9_.]{1,30})\/?$/); return m ? '@' + m[1] : 'Red social ↗'; };
  const wallQueries = [matchMedia('(max-width: 640px)'), matchMedia('(max-width: 900px)')];
  const perPage = () => wallQueries[0].matches ? 1 : wallQueries[1].matches ? 2 : 3;
  const polaroid = r => {
    const card = el('article', { class: 'polaroid', 'aria-label': 'Hallazgo de ' + r.nombre_alias });
    const inner = el('div', { class: 'polaroid-inner' }), front = el('div', { class: 'polaroid-face polaroid-front' }), back = el('div', { class: 'polaroid-face polaroid-back' });
    if (r.demo) front.append(stamp());
    const photo = el('div', { class: 'polaroid-photo' }), img = picture(r.imagen, r.alt || 'Hallazgo compartido por ' + r.nombre_alias);
    if (img) photo.append(img); else photo.classList.add('is-empty');
    const { text, cut } = preview(r.texto), caption = el('div', { class: 'polaroid-caption' });
    caption.append(el('p', {}, text));
    const social = safeURL(r.red_url), author = () => { const p = el('p', { class: 'polaroid-author' }); p.append(el('strong', {}, r.nombre_alias)); if (social) p.append(link(handleLabel(social), social)); return p; };
    front.append(photo, caption);
    if (!cut) { caption.append(author()); inner.append(front); card.append(inner); return card; }
    const flip = (toBack, focusSelector) => {
      card.classList.toggle('is-flipped', toBack); front.inert = toBack; back.inert = !toBack;
      front.setAttribute('aria-hidden', String(toBack)); back.setAttribute('aria-hidden', String(!toBack));
      card.querySelector(focusSelector)?.focus({ preventScroll: true });
    };
    const readMore = el('button', { type: 'button', class: 'polaroid-turn' }, 'Seguir leyendo'), showImage = el('button', { type: 'button', class: 'polaroid-turn' }, 'Ver imagen');
    readMore.onclick = () => flip(true, '.polaroid-back .polaroid-turn'); showImage.onclick = () => flip(false, '.polaroid-front .polaroid-turn');
    caption.append(readMore);
    const body = el('div', { class: 'polaroid-text' }); paragraphs(r.texto, body);
    back.append(body, author(), showImage); back.inert = true; back.setAttribute('aria-hidden', 'true');
    inner.append(front, back); card.append(inner); return card;
  };
  const loadWall = async () => {
    try {
      let posts;
      if (DEMO) posts = DEMO_WALL;
      else {
        const { connected, rows } = await fetchRows(CONFIG.sources.muro); if (!connected) return;
        posts = published(rows).filter(r => r.id && r.nombre_alias && safeImage(r.imagen)).sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
      }
      if (!posts.length) return;
      $('#muro').classList.remove('is-empty');
      const wall = $('#wall'), prev = $('#wall-prev'), next = $('#wall-next'), count = $('#wall-count');
      let start = 0;
      const render = () => {
        const n = perPage(); start = Math.min(Math.floor(start / n) * n, Math.max(0, posts.length - 1));
        wall.replaceChildren(...posts.slice(start, start + n).map(polaroid)); wall.dataset.perPage = String(n);
        const paged = posts.length > n; prev.hidden = next.hidden = count.hidden = !paged;
        prev.disabled = start <= 0; next.disabled = start + n >= posts.length;
        count.textContent = n === 1 ? `${start + 1} de ${posts.length}` : `${start + 1}–${Math.min(start + n, posts.length)} de ${posts.length}`;
      };
      const move = delta => { const n = perPage(), to = start + delta * n; if (to < 0 || to >= posts.length) return; start = to; render(); };
      prev.onclick = () => move(-1); next.onclick = () => move(1);
      onSwipe(wall, move);
      wallQueries.forEach(q => q.addEventListener('change', render));
      render();
    } catch { $('#wall').hidden = true; errorState('#wall-status', () => { $('#wall').hidden = false; loadWall(); }); }
  };
  let noteIndex = 0, listView = false;
  const showNote = (r, opener, push = true) => {
    if (push) { const u = new URL(location.href); u.searchParams.set('nota', r.id); u.hash = 'proyecto'; history.pushState({ reader: true }, '', u); }
    openReader(r.titulo, container => { if (r.demo) container.append(stamp()); if (validDate(r.fecha)) container.append(el('time', { datetime: r.fecha }, r.fecha)); const img = picture(r.imagen, r.alt); if (img) container.append(img); paragraphs(r.cuerpo, container); }, opener, true);
  };
  const renderNotes = (focusTab = false) => {
    const notes = $('#notes'); notes.replaceChildren(); notes.className = 'notes ' + (listView ? 'list' : 'stack');
    if (!listView) {
      const tabs = el('div', { class: 'note-tabs', role: 'tablist', 'aria-label': 'Elegí una nota' });
      notesData.forEach((r, i) => {
        const tab = el('button', { type: 'button', class: 'note-tab', id: 'note-tab-' + i, role: 'tab', 'aria-selected': String(noteIndex === i), 'aria-controls': 'note-panel-' + i, tabindex: noteIndex === i ? '0' : '-1' }, r.titulo);
        tab.onclick = () => { noteIndex = i; renderNotes(true); };
        tab.onkeydown = e => {
          const moves = { ArrowRight: (i + 1) % notesData.length, ArrowLeft: (i - 1 + notesData.length) % notesData.length, Home: 0, End: notesData.length - 1 };
          if (e.key in moves) { e.preventDefault(); noteIndex = moves[e.key]; renderNotes(true); }
        };
        tabs.append(tab);
      }); notes.append(tabs);
    }
    const papers = el('div', { class: 'note-papers' });
    notesData.forEach((r, i) => {
      const active = listView || i === noteIndex;
      const article = el('article', { class: 'note-paper', id: 'note-panel-' + i, 'data-active': String(active), style: '--paper-index:' + ((i - noteIndex + notesData.length) % notesData.length) });
      if (!listView) { article.setAttribute('role', 'tabpanel'); article.setAttribute('aria-labelledby', 'note-tab-' + i); if (!active) { article.setAttribute('aria-hidden', 'true'); article.inert = true; } }
      const content = el('div', { class: 'note-content' });
      if (r.demo) content.append(stamp());
      if (validDate(r.fecha)) content.append(el('time', { datetime: r.fecha, class: 'small' }, r.fecha));
      const button = el('button', { type: 'button', class: 'text-link' }, 'Leer nota ↗'); button.onclick = () => showNote(r, button);
      content.append(el('h4', {}, r.titulo), el('p', {}, r.bajada), button); article.append(content); papers.append(article);
    });
    notes.append(papers);
    $('#notes-controls').hidden = !notesData.length; $('#note-count').textContent = `${noteIndex + 1} / ${notesData.length}`;
    $('#note-prev').hidden = $('#note-next').hidden = $('#note-count').hidden = listView || notesData.length < 2;
    $('#notes-list-toggle').setAttribute('aria-pressed', String(listView)); $('#notes-list-toggle').textContent = listView ? 'Ver como papeles' : 'Ver en lista';
    if (focusTab) notes.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
  };
  const restoreNote = () => {
    const id = new URL(location.href).searchParams.get('nota'); if (!id) return;
    const r = notesData.find(n => n.id === id);
    if (r) showNote(r, $('#proyecto a'), false);
    else $('#notes-status').textContent = 'La nota del enlace no está disponible o ya no está publicada.';
  };
  const loadNotes = async () => {
    try {
      if (DEMO) notesData = DEMO_NOTES;
      else { const { rows } = await fetchRows(CONFIG.sources.notas); notesData = published(rows).filter(r => r.id && r.titulo && r.cuerpo).sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0)); }
      if (notesData.length) { $('.notes-section').classList.remove('is-empty'); renderNotes(); }
      restoreNote();
    } catch { $('#notes').hidden = true; errorState('#notes-status', () => { $('#notes').hidden = false; loadNotes(); }); }
  };
  $('#note-prev').onclick = () => { noteIndex = (noteIndex - 1 + notesData.length) % notesData.length; renderNotes(); };
  $('#note-next').onclick = () => { noteIndex = (noteIndex + 1) % notesData.length; renderNotes(); };
  $('#notes-list-toggle').onclick = () => { listView = !listView; renderNotes(); };
  window.addEventListener('popstate', restoreNote);
  await Promise.allSettled([loadAgenda(), loadWall(), loadNotes()]);
}
