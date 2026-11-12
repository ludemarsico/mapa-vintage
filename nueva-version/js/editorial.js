import { CONFIG } from './config.js';
import { CARE, GLOSSARY } from './content.js';
import { fetchRows, published, normalizeEvents, safeImage, safeURL, validDate, receiverPosts } from './data.js';
import { $, el, link, picture, paragraphs } from './dom.js';
import { DEMO, DEMO_AGENDA, DEMO_WALL, DEMO_NOTES, demoStamp } from './demo.js';
import { aportesEndpoint } from './forms.js';

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

// Cuidados: un perchero de prendas. Al elegir una, su texto aparece debajo.
// El perchero se desplaza de costado (flechas, rueda o deslizando) y las flechas del teclado pasan de prenda.
export function initCare() {
  const rail = $('#care-rail'), reading = $('#care-reading'), fallback = $('#care-fallback');
  const texts = new Map(CARE.map(c => [c.titulo, c.texto]));
  const items = CONFIG.prendas.filter(p => texts.get(p.cuidado));
  if (!rail || !items.length) return;
  const buttons = [], track = el('div', { class: 'garment-track' });
  const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  const select = (index, focus = false, reveal = true) => {
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    const item = items[index];
    reading.replaceChildren(el('h3', {}, item.cuidado), el('p', {}, texts.get(item.cuidado)));
    const button = buttons[index];
    // Solo se mueve el perchero (nunca la página) para que la prenda elegida quede a la vista.
    const left = button.offsetLeft, right = left + button.offsetWidth;
    if (reveal && (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth)) track.scrollTo({ left: left - (track.clientWidth - button.offsetWidth) / 2, behavior: smooth() });
    if (focus) button.focus({ preventScroll: true });
  };
  items.forEach((item, i) => {
    const button = el('button', { type: 'button', class: 'garment', 'aria-pressed': 'false', 'aria-controls': 'care-reading' });
    button.append(el('img', { src: `assets/identidad/prendas/${item.imagen}.webp`, alt: '', loading: 'lazy', decoding: 'async', draggable: 'false' }), el('span', {}, item.etiqueta));
    button.onclick = () => select(i);
    button.onkeydown = e => {
      const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 };
      if (e.key in moves) { e.preventDefault(); select((moves[e.key] + items.length) % items.length, true); }
    };
    buttons.push(button);
  });
  track.append(...buttons);
  const prev = el('button', { type: 'button', class: 'rail-arrow rail-arrow-prev', 'aria-label': 'Ver prendas anteriores', 'aria-controls': 'care-rail' }, '←');
  const next = el('button', { type: 'button', class: 'rail-arrow rail-arrow-next', 'aria-label': 'Ver más prendas', 'aria-controls': 'care-rail' }, '→');
  const page = delta => track.scrollBy({ left: delta * track.clientWidth * 0.8, behavior: smooth() });
  prev.onclick = () => page(-1); next.onclick = () => page(1);
  const edges = () => { prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; };
  // También al mostrarse la vista: el perchero estaba oculto y medía cero.
  track.addEventListener('scroll', edges, { passive: true }); if (window.ResizeObserver) new ResizeObserver(edges).observe(track); else window.addEventListener('resize', edges);
  // Las prendas cargan de a poco: cada imagen nueva cambia el ancho del perchero.
  track.querySelectorAll('img').forEach(img => img.addEventListener('load', edges));
  rail.replaceChildren(prev, track, next); rail.hidden = false; reading.hidden = false;
  select(0, false, false); edges();
  if (fallback) fallback.hidden = true;
}

export async function initEditorial(openReader) {
  let notesData = [];
  const errorState = (selector, retry) => {
    const status = $(selector); status.replaceChildren(el('span', {}, 'No pudimos cargar esta sección. '));
    const button = el('button', { type: 'button' }, 'Reintentar'); button.onclick = () => { status.replaceChildren(); retry(); }; status.append(button);
  };
  const stamp = () => el('span', { class: 'demo-stamp' }, demoStamp());
  // Agenda: listado paginado con la información de la hoja "Agenda".
  const day = (iso, options) => new Intl.DateTimeFormat('es-AR', { timeZone: CONFIG.timezone, ...options }).format(new Date(iso + 'T12:00:00-03:00'));
  const shortDate = iso => day(iso, { day: '2-digit', month: '2-digit' });
  const weekday = iso => { const w = day(iso, { weekday: 'long' }); return w.charAt(0).toUpperCase() + w.slice(1); };
  const dateLabel = iso => day(iso, { weekday: 'long', day: 'numeric', month: 'long' });
  const loadAgenda = async () => {
    try {
      let events;
      if (DEMO) events = DEMO_AGENDA.map(r => ({ id: r.id, nombre: r.titulo, descripcion: r.descripcion, demo: true, next: '' }));
      else {
        const { connected, rows } = await fetchRows(CONFIG.sources.agenda); if (!connected) return;
        events = normalizeEvents(rows);
      }
      if (!events.length) return;
      $('#agenda-fechas').classList.remove('is-empty');
      let page = 1;
      const render = () => {
        const board = $('#agenda-board'); board.replaceChildren();
        const pages = Math.ceil(events.length / CONFIG.pageSize);
        $('#agenda-pagination').hidden = pages < 2;
        $('#agenda-count').textContent = `Página ${page} de ${pages} · ${events.length} fechas`;
        $('#agenda-prev').disabled = page <= 1; $('#agenda-next').disabled = page >= pages;
        events.slice((page - 1) * CONFIG.pageSize, page * CONFIG.pageSize).forEach(r => {
          // Como en el diseño: fecha (o días) a la izquierda, nombre al centro y los datos prácticos a la derecha.
          const row = el('article', { class: 'agenda-row', 'aria-label': r.nombre });
          if (r.demo) row.append(stamp());
          const when = el('p', { class: 'agenda-when' });
          if (r.next) when.append(el('time', { datetime: r.next, title: dateLabel(r.next) }, shortDate(r.next)));
          else when.textContent = r.dias || r.fechaTexto || (r.demo ? 'Fecha' : '');
          const main = el('div', { class: 'agenda-main' }); main.append(el('h3', {}, r.nombre));
          const kind = [r.tipo, r.precio].filter(Boolean).join(' · '); if (kind) main.append(el('p', { class: 'agenda-kind' }, kind));
          if (r.descripcion) main.append(el('p', { class: 'agenda-description' }, r.descripcion));
          const img = picture(r.imagen, r.nombre); if (img) main.append(img);
          const facts = el('ul', { class: 'agenda-facts' });
          const place = [r.direccion, r.barrio].filter(Boolean).join(', ');
          [r.next ? r.dias || weekday(r.next) : '', r.horario, place, r.acceso, r.especialidad].filter(Boolean).forEach(t => facts.append(el('li', {}, t)));
          const links = el('li', { class: 'agenda-links' });
          if (r.direccion) links.append(link('Cómo llegar ↗', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place + ', CABA')));
          if (r.enlace) links.append(link('Instagram ↗', r.enlace));
          if (links.children.length) facts.append(links);
          row.append(when, main, facts); board.append(row);
        });
      };
      $('#agenda-prev').onclick = () => { if (page > 1) { page--; render(); $('#agenda-board').scrollTop = 0; } };
      $('#agenda-next').onclick = () => { if (page * CONFIG.pageSize < events.length) { page++; render(); $('#agenda-board').scrollTop = 0; } };
      render();
    } catch { $('#agenda-board').hidden = true; errorState('#agenda-status', () => { $('#agenda-board').hidden = false; loadAgenda(); }); }
  };
  // Muro: Polaroids. Al frente, la foto con el nombre; al tocarla se da vuelta y el dorso muestra la historia completa.
  // Se ven 3 en escritorio, 2 en tablet y 1 en el teléfono; las flechas (o deslizar) pasan a las siguientes.
  const handleLabel = url => { const m = String(url).match(/^https:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9_.]{1,30})\/?$/); return m ? '@' + m[1] : 'Red social ↗'; };
  const wallQueries = [matchMedia('(max-width: 640px)'), matchMedia('(max-width: 900px)')];
  const perPage = () => wallQueries[0].matches ? 1 : wallQueries[1].matches ? 2 : 3;
  const polaroid = r => {
    const card = el('article', { class: 'polaroid', 'aria-label': 'Hallazgo de ' + r.nombre_alias });
    const inner = el('div', { class: 'polaroid-inner' }), front = el('div', { class: 'polaroid-face polaroid-front' }), back = el('div', { class: 'polaroid-face polaroid-back' });
    if (r.demo) front.append(stamp());
    const photo = el('div', { class: 'polaroid-photo' }), img = picture(r.imagen, r.alt || 'Hallazgo compartido por ' + r.nombre_alias);
    if (img) photo.append(img); else photo.classList.add('is-empty');
    const social = safeURL(r.red_url), author = () => { const p = el('p', { class: 'polaroid-author' }); p.append(el('strong', {}, r.nombre_alias)); if (social) p.append(link(handleLabel(social), social)); return p; };
    const caption = el('div', { class: 'polaroid-caption' }), body = el('div', { class: 'polaroid-text' }); paragraphs(r.texto, body);
    const readMore = el('button', { type: 'button', class: 'polaroid-turn' }, 'Leer su historia'), showImage = el('button', { type: 'button', class: 'polaroid-turn' }, 'Ver la foto');
    caption.append(author(), readMore); front.append(photo, caption); back.append(body, author(), showImage);
    const flip = (toBack, focus) => {
      card.classList.toggle('is-flipped', toBack); front.inert = toBack; back.inert = !toBack;
      front.setAttribute('aria-hidden', String(toBack)); back.setAttribute('aria-hidden', String(!toBack));
      if (focus) (toBack ? showImage : readMore).focus({ preventScroll: true });
    };
    readMore.onclick = event => { event.stopPropagation(); flip(true, true); }; showImage.onclick = event => { event.stopPropagation(); flip(false, true); };
    // Tocar cualquier parte de la Polaroid también la da vuelta, salvo el enlace a la red social.
    card.addEventListener('click', event => { if (!event.target.closest('a')) flip(!card.classList.contains('is-flipped'), false); });
    back.inert = true; back.setAttribute('aria-hidden', 'true');
    inner.append(front, back); card.append(inner); return card;
  };
  const loadWall = async () => {
    try {
      let posts;
      const receiver = DEMO ? '' : aportesEndpoint(CONFIG.aportes?.endpoint);
      if (DEMO) posts = DEMO_WALL;
      // Con el receptor de aportes, el muro muestra los hallazgos marcados como Publicado en la hoja "Hallazgos".
      else if (receiver) {
        const response = await fetch(receiver + '?muro=1', { credentials: 'omit', signal: AbortSignal.timeout(18000) });
        if (!response.ok) throw new Error('muro'); posts = receiverPosts(await response.json());
      } else {
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
  // Notas al margen: hoy fuera de la página; el código queda listo por si vuelven.
  if (!$('#notes')) { await Promise.allSettled([loadAgenda(), loadWall()]); return; }
  $('#note-prev').onclick = () => { noteIndex = (noteIndex - 1 + notesData.length) % notesData.length; renderNotes(); };
  $('#note-next').onclick = () => { noteIndex = (noteIndex + 1) % notesData.length; renderNotes(); };
  $('#notes-list-toggle').onclick = () => { listView = !listView; renderNotes(); };
  window.addEventListener('popstate', restoreNote);
  await Promise.allSettled([loadAgenda(), loadWall(), loadNotes()]);
}
