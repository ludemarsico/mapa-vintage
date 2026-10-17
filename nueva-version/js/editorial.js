import { CONFIG } from './config.js';
import { CARE, GLOSSARY } from './content.js';
import { fetchRows, published, nextEventDate, safeImage, safeURL, validDate } from './data.js';
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
    panel.replaceChildren(el('span', { class: 'folder-caption' }, 'Archivo de términos'), el('h3', {}, GLOSSARY[index].titulo), el('p', {}, GLOSSARY[index].texto));
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

export function initCare() {
  const fallback = $('#care-fallback'), fan = $('.swatch-fan');
  fan.removeAttribute('aria-hidden'); fan.setAttribute('role', 'group'); fan.setAttribute('aria-label', 'Abanico de materiales y tejidos');
  fan.querySelector('.swatch-ring').setAttribute('aria-hidden', 'true');
  const colors = ['#DCCBA4','#ECC8BE','#C9D2B7','#EBDDAA','#D5C8AF','#A3B4C0','#E9E4D7','#D9C9D2'];
  CARE.slice(0, 8).forEach((item, i) => {
    const leaf = el('button', { type: 'button', class: 'fan-leaf', 'aria-label': 'Mostrar cuidado de ' + item.titulo, 'aria-controls': 'fabric-reading', style: `--leaf-color:${colors[i]}` });
    leaf.append(el('span', { class: 'leaf-label' }, item.titulo)); fan.append(leaf);
  });
  const initGroup = (items, buttonRoot, readingRoot, garments = false) => {
    let index = 0;
    const root = $(buttonRoot), reading = $(readingRoot);
    const leaves = garments ? [] : [...fan.querySelectorAll('.fan-leaf')];
    const animateFan = () => { fan.classList.remove('flutter'); void fan.offsetWidth; fan.classList.add('flutter'); };
    const render = () => {
      [...root.children].forEach((b, i) => b.setAttribute('aria-pressed', String(index === i)));
      leaves.forEach((leaf, i) => {
        const active = i === index;
        leaf.setAttribute('aria-pressed', String(active)); leaf.tabIndex = active ? 0 : -1;
        leaf.style.setProperty('--leaf-order', active ? '20' : String(i));
        leaf.style.setProperty('--leaf-angle', active ? '-4deg' : (-56 + i * 16) + 'deg');
      });
      const item = items[index]; reading.replaceChildren(el('h4', {}, item.titulo), el('p', { class: 'care-full' }, item.texto));
      const controls = el('div', { class: 'care-controls' });
      const prev = el('button', { type: 'button', 'aria-label': 'Cuidado anterior' }, '← Anterior');
      const next = el('button', { type: 'button', 'aria-label': 'Cuidado siguiente' }, 'Siguiente →');
      const change = delta => { index = (index + delta + items.length) % items.length; render(); if (!garments) animateFan(); reading.querySelector(delta > 0 ? '[aria-label="Cuidado siguiente"]' : '[aria-label="Cuidado anterior"]').focus({ preventScroll: true }); };
      prev.onclick = () => change(-1); next.onclick = () => change(1);
      controls.append(prev, el('span', {}, `${index + 1} / ${items.length}`), next); reading.append(controls);
    };
    const select = i => { index = i; render(); if (!garments) animateFan(); };
    items.forEach((item, i) => {
      const b = el('button', { type: 'button', class: garments ? 'garment-button' : 'swatch', 'aria-pressed': String(!i), 'aria-controls': reading.id });
      b.append(el('span', {}, item.titulo));
      const path = CONFIG.careImages?.[item.titulo];
      const image = path ? picture(path, 'Recurso ilustrativo para ' + item.titulo) : null;
      if (image) { b.append(image); b.classList.add('has-art'); }
      b.onclick = () => select(i); root.append(b);
      if (!garments) {
        const leaf = leaves[i]; leaf.onclick = () => select(i);
        leaf.onkeydown = e => {
          const moves = { ArrowRight: (i + 1) % items.length, ArrowLeft: (i - 1 + items.length) % items.length, Home: 0, End: items.length - 1 };
          if (e.key in moves) { e.preventDefault(); select(moves[e.key]); leaves[index].focus({ preventScroll: true }); }
        };
      }
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
  const stamp = () => el('span', { class: 'demo-stamp' }, demoStamp());
  const loadAgenda = async () => {
    try {
      let events;
      if (DEMO) events = DEMO_AGENDA;
      else {
        const { connected, rows } = await fetchRows(CONFIG.sources.agenda); if (!connected) return;
        events = published(rows).map(r => ({ ...r, next: nextEventDate(r) })).filter(r => r.id && r.titulo && r.next).sort((a, b) => a.next.localeCompare(b.next));
      }
      if (!events.length) return;
      $('#agenda').classList.remove('is-empty');
      let count = 3;
      const render = () => {
        const board = $('#agenda-board'); board.replaceChildren();
        events.slice(0, count).forEach(r => {
          const card = el('article', { class: 'agenda-poster' });
          if (r.demo) card.append(stamp(), el('span', { class: 'poster-date' }, 'Fecha · horario'));
          else card.append(el('time', { datetime: r.next }, new Intl.DateTimeFormat('es-AR', { timeZone: CONFIG.timezone, day: 'numeric', month: 'long' }).format(new Date(r.next + 'T12:00:00-03:00'))));
          card.append(el('h3', {}, r.titulo));
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
      let posts;
      if (DEMO) posts = DEMO_WALL;
      else {
        const { connected, rows } = await fetchRows(CONFIG.sources.muro); if (!connected) return;
        posts = published(rows).filter(r => r.id && r.nombre_alias && safeImage(r.imagen)).sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
      }
      if (!posts.length) return;
      $('#comunidad').classList.remove('is-empty'); const wall = $('#wall'); wall.replaceChildren();
      posts.forEach(r => {
        const b = el('button', { type: 'button', class: 'wall-item', 'aria-label': r.demo ? 'Abrir ' + r.nombre_alias : 'Abrir hallazgo de ' + r.nombre_alias });
        if (r.demo) b.append(stamp());
        b.append(picture(r.imagen, r.alt || 'Hallazgo compartido por ' + r.nombre_alias), el('span', {}, r.texto), el('strong', {}, r.nombre_alias));
        if (r.demo) b.append(el('small', {}, 'Recurso del manual; no es una publicación.'));
        b.onclick = () => openReader(r.nombre_alias, container => { if (r.demo) container.append(stamp()); container.append(picture(r.imagen, r.alt || 'Hallazgo de ' + r.nombre_alias)); paragraphs(r.texto, container); if (safeURL(r.red_url)) container.append(link('Web o red social ↗', r.red_url, 'text-link')); }, b);
        wall.append(b);
      });
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
