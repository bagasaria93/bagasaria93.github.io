/* Portfolio interactions. Vanilla JavaScript, no dependencies. Most of the motion on the site is plain CSS;
   this file only handles what CSS cannot: pointer input, the command palette, forms and the demos. */
/* (original note follows)
   Every feature starts in isolation: one failure never stops the others.
   Everything respects prefers-reduced-motion, and the page still reads fully without any of this. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const safe = (name, fn) => {
  try { fn(); } catch (err) { console.error(`[site] ${name} failed`, err); }
};
const raf = (fn) => { let queued = false; return () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(); }); }; };

/* ------------------------------------------------------------ toast + copy */
const toastEl = () => $('#toast');
let toastTimer = 0;
function toast(message) {
  const el = toastEl();
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

/* ---------------------------------------------------------- calm mode */
function toggleCalm() {
  const root = document.documentElement;
  const on = !root.hasAttribute('data-calm');
  if (on) root.setAttribute('data-calm', ''); else root.removeAttribute('data-calm');
  try { localStorage.setItem('calm', on ? '1' : '0'); } catch { /* ignore */ }
  toast(on ? 'Calm mode on: less motion' : 'Calm mode off');
}

/* ------------------------------------------------- header, progress, nav */
function initHeader() {
  const header = $('.site-header');
  const bar = $('.progress i');
  if (!header) return;
  const update = raf(() => {
    header.classList.toggle('is-scrolled', scrollY > 8);
    const top = $('.to-top');
    if (top) top.classList.toggle('is-visible', scrollY > innerHeight * 0.9);
    const rail = $('[data-rail]');
    if (rail) rail.classList.toggle('is-visible', scrollY > innerHeight * 0.55);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

/* Back to top. The old link pointed at the sticky header, which is always "at the top",
   so the browser had nowhere to go. Scroll to 0 explicitly. */
function initToTop() {
  $$('[data-to-top]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  }));
}

/* One scroll spy drives the nav underline and the rail, so they always agree. */
function initNav() {
  const nav = $('.nav');
  if (!nav) return;
  const links = $$('a', nav);
  const isHome = document.body.dataset.page === 'home';
  if (!isHome) return;
  const ids = ['about', 'work', 'websites', 'case', 'experience', 'skills', 'contact'];
  const sections = ids.map((id) => ({ id, el: document.getElementById(id) })).filter((s) => s.el);
  const layerEls = $$('[data-layer]');
  let current = '';
  const spy = raf(() => {
    let cur = '';
    const line = innerHeight * 0.4;
    sections.forEach((s) => { if (s.el.getBoundingClientRect().top <= line) cur = s.id; });
    if (cur === current) return;
    current = cur;
    links.forEach((l) => { if (l.dataset.nav === cur) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
    layerEls.forEach((el) => el.classList.toggle('is-active', el.dataset.layer === cur));
  });
  addEventListener('scroll', spy, { passive: true });
  spy();
}

function initMenu() {
  const btn = $('.menu-toggle');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}

/* ------------------------------------------------------- reveal + counters */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;
  if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  els.forEach((e) => io.observe(e));
}

function initCount() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = `${target}${suffix}`; return; }
    const dur = 1400, t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = `${Math.round(target * ease(p))}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.6 });
  els.forEach((e) => io.observe(e));
}

/* ------------------------------------------------------------ identity card
   A slab with a front, a back and real thickness. The pointer tilts it, a drag turns it over, a button does the same
   for keyboard users, and the hidden face is made inert so its link never takes focus while it cannot be seen. */
function initCard() {
  const scene = $('[data-card]');
  const card = scene && $('[data-idcard]', scene);
  if (!card) return;
  const sheen = $('.idsheen', card);
  const faces = { front: $('[data-face="front"]', card), back: $('[data-face="back"]', card) };
  const amp = reduce ? 0.5 : 1; // Tilt answers the visitor's own movement, so it stays, gentler, under reduced motion.
  const s = { base: 0, spin: 0, tx: 0, ty: 0, x: 0, y: 0, hover: false, drag: false, lx: 0, moved: 0 };
  const syncFaces = () => {
    const front = Math.cos(s.base * Math.PI / 180) > 0;
    faces.front.inert = !front;
    faces.back.inert = front;
  };
  const flip = () => { s.base += 180; s.spin = 0; syncFaces(); };
  $('[data-flip]', scene)?.addEventListener('click', flip);
  scene.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    s.drag = true; s.lx = e.clientX; s.moved = 0;
    scene.setPointerCapture(e.pointerId);
  });
  const release = () => {
    if (!s.drag) return;
    s.drag = false;
    const total = s.base + s.spin;
    s.base = Math.round(total / 180) * 180; s.spin = 0;
    syncFaces();
  };
  scene.addEventListener('pointerup', release);
  scene.addEventListener('pointercancel', release);
  scene.addEventListener('pointermove', (e) => {
    const r = scene.getBoundingClientRect();
    if (finePointer || s.drag) {
      s.hover = true;
      s.tx = ((e.clientX - r.left) / r.width - 0.5) * 30 * amp;
      s.ty = -((e.clientY - r.top) / r.height - 0.5) * 20 * amp;
    }
    if (s.drag) { s.spin += (e.clientX - s.lx) * 0.6; s.moved += Math.abs(e.clientX - s.lx); s.lx = e.clientX; }
  });
  scene.addEventListener('pointerleave', () => { s.hover = false; s.tx = 0; s.ty = 0; });
  let ry = 0, rx = 0, visible = true;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(scene);
  const tick = (t) => {
    if (visible) {
      const idle = (s.hover || s.drag || reduce) ? 0 : Math.sin(t / 1800) * 6;
      const ty = s.base + s.spin + s.tx + idle;
      const tx = s.ty + ((s.hover || s.drag || reduce) ? 0 : Math.sin(t / 2400) * 2.5);
      ry += (ty - ry) * 0.12; rx += (tx - rx) * 0.12;
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      const side = Math.sin(ry * Math.PI / 180);
      sheen.style.setProperty('--gx', (50 + side * 55).toFixed(1) + '%');
      sheen.style.setProperty('--gy', (30 - rx * 2).toFixed(1) + '%');
      sheen.style.setProperty('--ga', (ry * 1.4).toFixed(1) + 'deg');
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------ depth tiles: each layer sits at its own distance */
function initTiles() {
  const tiles = $$('[data-tilt]');
  if (!tiles.length || !finePointer) return;
  const amp = reduce ? 0.5 : 1;
  tiles.forEach((t) => {
    t.addEventListener('pointermove', (e) => {
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      t.classList.add('is-hover');
      t.style.setProperty('--ry', ((px - 0.5) * 22 * amp).toFixed(2) + 'deg');
      t.style.setProperty('--rx', (-(py - 0.5) * 22 * amp).toFixed(2) + 'deg');
      t.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      t.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    t.addEventListener('pointerleave', () => {
      t.classList.remove('is-hover');
      t.style.setProperty('--ry', '0deg'); t.style.setProperty('--rx', '0deg');
    });
  });
}

/* ------------------------------------ project rows: the preview follows the pointer */
function initPeek() {
  const peek = $('[data-peek-el]');
  if (!peek || !finePointer) return;
  const img = $('img', peek), cap = $('.peek-cap', peek);
  const links = $$('.row-link[data-img]');
  const s = { tx: 0, ty: 0, x: 0, y: 0, r: 0, running: false, first: true };
  const size = () => ({ w: peek.offsetWidth, h: peek.offsetHeight });
  const place = (cx, cy) => {
    const { w, h } = size();
    let tx = cx + 28;
    if (tx + w > innerWidth - 12) tx = cx - w - 28;
    s.tx = Math.max(12, tx);
    s.ty = Math.min(innerHeight - h - 12, Math.max(12, cy - h / 2));
  };
  const step = () => {
    const k = reduce ? 1 : 0.2;
    const dx = s.tx - s.x;
    s.x += dx * k; s.y += (s.ty - s.y) * k;
    s.r += ((Math.max(-7, Math.min(7, dx * 0.12))) - s.r) * 0.25;
    peek.style.setProperty('--x', `${s.x.toFixed(1)}px`);
    peek.style.setProperty('--y', `${s.y.toFixed(1)}px`);
    peek.style.setProperty('--r', `${s.r.toFixed(2)}deg`);
    if (peek.classList.contains('on') || Math.abs(dx) > 0.3) requestAnimationFrame(step); else s.running = false;
  };
  const kick = () => { if (!s.running) { s.running = true; requestAnimationFrame(step); } };
  const show = (a, cx, cy) => {
    const src = a.dataset.img;
    if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
    cap.textContent = a.dataset.cap || '';
    place(cx, cy);
    if (s.first) { s.x = s.tx; s.y = s.ty; s.first = false; }
    peek.classList.add('on');
    kick();
  };
  links.forEach((a) => {
    a.addEventListener('pointerenter', (e) => show(a, e.clientX, e.clientY));
    a.addEventListener('pointermove', (e) => { place(e.clientX, e.clientY); kick(); }, { passive: true });
    a.addEventListener('pointerleave', () => peek.classList.remove('on'));
    a.addEventListener('focus', () => {
      const r = a.getBoundingClientRect();
      show(a, r.right - size().w - 80, r.top + r.height / 2);
    });
    a.addEventListener('blur', () => peek.classList.remove('on'));
  });
  addEventListener('scroll', () => peek.classList.remove('on'), { passive: true });
}

/* --------------------------------------------------------------- terminal */
function initTerminal() {
  const el = $('[data-terminal]');
  if (!el || reduce) return;
  const lines = JSON.parse(el.dataset.lines || '[]');
  if (!lines.length) return;
  const caret = document.createElement('span');
  caret.className = 'term-caret';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const run = async () => {
    el.textContent = '';
    for (const l of lines) {
      const row = document.createElement('div');
      el.appendChild(row);
      if (l.k === 'cmd') {
        const p = document.createElement('span'); p.className = 'p'; p.textContent = '$ ';
        const k = document.createElement('span'); k.className = 'k';
        row.append(p, k, caret);
        for (const ch of l.t) { k.textContent += ch; await sleep(34); }
        await sleep(260);
      } else {
        const o = document.createElement('span'); o.className = 'o'; o.textContent = l.t;
        row.append(o);
        await sleep(160);
      }
    }
    const last = document.createElement('div');
    const p = document.createElement('span'); p.className = 'p'; p.textContent = '$ ';
    last.append(p, caret);
    el.appendChild(last);
  };
  new IntersectionObserver((entries, io) => {
    if (entries[0].isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.4 }).observe(el);
}

/* --------------------------------------------------------------- timeline */
function initTimeline() {
  const tl = $('[data-timeline]');
  if (!tl) return;
  const jobs = $$('[data-job]', tl);
  const update = raf(() => {
    const r = tl.getBoundingClientRect();
    const line = innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
    tl.style.setProperty('--tp', p.toFixed(3));
    jobs.forEach((j) => j.classList.toggle('is-active', j.getBoundingClientRect().top < line));
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

/* Experience: the side list follows the job being read. */
function initXp() {
  const root = $('[data-xp]');
  if (!root) return;
  const links = $$('[data-xp-link]', root);
  const jobs = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  const spy = raf(() => {
    let cur = 0;
    const line = innerHeight * 0.45;
    jobs.forEach((j, i) => { if (j && j.getBoundingClientRect().top <= line) cur = i; });
    links.forEach((a, i) => {
      if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      a.parentElement.classList.toggle('is-active', i <= cur);
    });
  });
  addEventListener('scroll', spy, { passive: true });
  addEventListener('resize', spy, { passive: true });
  spy();
}

/* ------------------------------------------------------------- theme lab */
function initLab() {
  const root = document.documentElement;
  if (!$('[data-lab]')) return;
  const el = (k) => $(`[data-lab="${k}"]`);
  const out = (k, v) => { const o = $(`[data-lab-out="${k}"]`); if (o) o.textContent = v; };
  const defaults = { hue: 125, wd: 0, round: 0 };
  let state = {};
  try { state = JSON.parse(localStorage.getItem('lab') || 'null') || {}; } catch { state = {}; }
  const apply = (k, v) => {
    if (k === 'hue') { root.setAttribute('data-hue', ''); root.style.setProperty('--hue', v); }
    if (k === 'wd') root.style.setProperty('--wd', `${v}%`);
    if (k === 'round') root.style.setProperty('--round', `${v}px`);
    out(k, v);
  };
  const save = () => { try { localStorage.setItem('lab', JSON.stringify(state)); } catch { /* ignore */ } };
  Object.keys(defaults).forEach((k) => {
    if (state[k] != null) { el(k).value = state[k]; apply(k, state[k]); }
    el(k).addEventListener('input', (e) => { state[k] = Number(e.target.value); apply(k, state[k]); save(); });
  });
  const calm = el('calm');
  const syncCalm = () => { calm.checked = root.hasAttribute('data-calm'); };
  syncCalm();
  calm.addEventListener('change', () => { if (calm.checked !== root.hasAttribute('data-calm')) toggleCalm(); });
  $('#lab').addEventListener('toggle', syncCalm);
  $('[data-lab-reset]').addEventListener('click', () => {
    state = {};
    root.removeAttribute('data-hue');
    ['--hue', '--wd', '--round'].forEach((p) => root.style.removeProperty(p));
    Object.entries(defaults).forEach(([k, v]) => { el(k).value = v; out(k, v); });
    if (root.hasAttribute('data-calm')) toggleCalm();
    syncCalm();
    try { localStorage.removeItem('lab'); } catch { /* ignore */ }
  });
}

/* ---------------------------------------------------------- show the CSS */
function initXray() {
  const toggle = $('[data-xray-toggle]'), tip = $('[data-xray-tip]'), panel = $('[data-xray-panel]');
  if (!toggle || !tip || !panel) return;
  const root = document.documentElement;
  const title = $('[data-xray-title]'), code = $('[data-xray-code]');
  let text = '';
  const isOn = () => root.hasAttribute('data-xray');
  const set = (v) => {
    root.toggleAttribute('data-xray', v);
    toggle.setAttribute('aria-pressed', String(v));
    if (!v) { tip.hidden = true; panel.hidden = true; } else toast('Show the CSS: point at a dashed outline, click to read it');
  };
  toggle.addEventListener('click', () => set(!isOn()));
  const label = (e) => e.tagName.toLowerCase() + (e.classList.length ? `.${e.classList[0]}` : '');
  document.addEventListener('pointerover', (e) => {
    if (!isOn()) return;
    const target = e.target.closest ? e.target.closest('[data-css]') : null;
    if (!target) { tip.hidden = true; return; }
    tip.textContent = `${label(target)}  /  ${target.dataset.css.split(/\s+/).join('  /  ')}`;
    tip.hidden = false;
    const r = target.getBoundingClientRect();
    tip.style.left = `${Math.max(6, Math.min(innerWidth - tip.offsetWidth - 6, r.left))}px`;
    tip.style.top = `${Math.max(6, r.top - tip.offsetHeight - 6)}px`;
  });
  addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });
  // Capture phase: while the mode is on, clicking an annotated element reads it instead of using it.
  document.addEventListener('click', (e) => {
    if (!isOn() || e.target.closest('.dock, .xray-panel, .lab, .keys, #palette')) return;
    const target = e.target.closest('[data-css]');
    if (!target) return;
    e.preventDefault(); e.stopPropagation();
    const cs = getComputedStyle(target);
    const rows = target.dataset.css.split(/\s+/).filter(Boolean).map((p) => [p, cs.getPropertyValue(p).trim() || 'initial']);
    const sel = label(target);
    title.textContent = sel;
    code.textContent = '';
    const line = (parts) => { const d = document.createElement('div'); parts.forEach((x) => d.append(x)); code.appendChild(d); };
    const span = (cls, t) => { const s = document.createElement('span'); s.className = cls; s.textContent = t; return s; };
    line([`${sel} {`]);
    rows.forEach(([p, v]) => line(['  ', span('p', p), ': ', span('v', v), ';']));
    line(['}']);
    text = `${sel} {\n${rows.map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}`;
    panel.hidden = false;
  }, true);
  $('[data-xray-close]').addEventListener('click', () => { panel.hidden = true; });
  $('[data-xray-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text); toast('CSS copied'); } catch { toast('Could not copy'); }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.hidden = true; });
}

/* ------------------------------------------------------- keyboard shortcuts */
function initKeys() {
  const dlg = $('#keys');
  const map = { h: '/', w: '/#work', c: '/#case', e: '/#experience', s: '/#skills', d: '/websites/', b: '/for-business/', t: '/#contact' };
  let pending = 0;
  const openKeys = () => { if (dlg && typeof dlg.showModal === 'function' && !dlg.open) dlg.showModal(); };
  const btn = $('[data-keys-open]');
  if (btn) btn.addEventListener('click', openKeys);
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    const tag = ((t && t.tagName) || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
    if (pending) {
      clearTimeout(pending); pending = 0;
      const to = map[e.key.toLowerCase()];
      if (to) { e.preventDefault(); location.href = to; }
      return;
    }
    if (document.querySelector('dialog[open]')) return;
    if (e.key === 'g') { pending = setTimeout(() => { pending = 0; }, 1400); toast('g, then h w c e s d b t'); }
    else if (e.key === '?') { e.preventDefault(); openKeys(); }
    else if (e.key === '/') { e.preventDefault(); const b = $('[data-open-palette]'); if (b) b.click(); }
    else if (e.key === 'x') { const b = $('[data-xray-toggle]'); if (b) b.click(); }
    else if (e.key === 'l') { const lab = $('#lab'); if (lab && lab.togglePopover) lab.togglePopover(); }
  });
}

/* --------------------------------------------------------------- carousel */
function initCarousel() {
  $$('[data-carousel]').forEach((root) => {
    const track = $('[data-track]', root);
    const slides = $$('[data-slide]', root);
    const prev = $('[data-prev]', root), next = $('[data-next]', root), label = $('[data-count-label]', root);
    if (!track || !slides.length) return;
    const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
    const sync = () => {
      const i = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / step())));
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = atEnd;
      if (label) label.textContent = `${i + 1} / ${slides.length}`;
    };
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', raf(sync), { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    addEventListener('resize', raf(sync), { passive: true });

    // Drag with a mouse or pen. Touch already scrolls natively, so it is left alone.
    const d = { down: false, dragging: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, vel: 0, pid: 0, suppress: false };
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      d.down = true; d.dragging = false; d.suppress = false;
      d.startX = d.lastX = e.clientX; d.startLeft = track.scrollLeft; d.lastT = performance.now(); d.vel = 0; d.pid = e.pointerId;
    });
    track.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault(); // no text selection while dragging
      track.focus({ preventScroll: true });
    });
    addEventListener('pointermove', (e) => {
      if (!d.down || e.pointerId !== d.pid) return;
      const dx = e.clientX - d.startX;
      if (!d.dragging && Math.abs(dx) > 5) {
        d.dragging = true;
        track.classList.add('is-dragging');
        try { track.setPointerCapture(d.pid); } catch { /* ignore */ }
      }
      if (!d.dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      d.vel = (d.lastX - e.clientX) / dt; // px per ms, positive means moving forward
      d.lastX = e.clientX; d.lastT = now;
      track.scrollLeft = d.startLeft - dx;
    }, { passive: true });
    const release = (e) => {
      if (!d.down || (e && e.pointerId !== d.pid)) return;
      d.down = false;
      if (!d.dragging) return;
      d.dragging = false; d.suppress = true;
      track.classList.remove('is-dragging');
      // Land on the slide the drag was heading for: position plus a little of the throw.
      const s = step();
      const last = slides.length - 1;
      const from = track.scrollLeft;
      const idx = Math.min(last, Math.max(0, Math.round((from + d.vel * 220) / s)));
      track.scrollTo({ left: idx * s, behavior: reduce ? 'auto' : 'smooth' });
    };
    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);
    track.addEventListener('click', (e) => { if (d.suppress) { e.preventDefault(); e.stopPropagation(); d.suppress = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    sync();
  });
}

/* -------------------------------------------------------- command palette */
const svgIcon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false">${d}</svg>`;
const PALETTE_ICONS = {
  'Go to': svgIcon('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  Actions: svgIcon('<path d="m13 2-10 12h9l-1 8 10-12h-9z"/>'),
  Projects: svgIcon('<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>'),
};

function initPalette() {
  const dialog = $('#palette');
  const dataEl = $('#palette-data');
  if (!dialog || !dataEl || typeof dialog.showModal !== 'function') return;
  const input = $('#palette-input'), list = $('#palette-list');
  const data = JSON.parse(dataEl.textContent);
  const groups = [['Go to', data.go], ['Actions', data.actions], ['Projects', data.projects]];
  let flat = [], selected = 0;

  const matches = (item, words) => {
    const hay = `${item.label} ${item.hint || ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  };
  const setSelected = (n) => {
    if (!flat.length) { input.removeAttribute('aria-activedescendant'); return; }
    selected = (n + flat.length) % flat.length;
    flat.forEach((f, i) => f.el.setAttribute('aria-selected', String(i === selected)));
    input.setAttribute('aria-activedescendant', flat[selected].el.id);
    flat[selected].el.scrollIntoView({ block: 'nearest' });
  };
  const render = (query) => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    list.textContent = '';
    flat = [];
    groups.forEach(([name, items]) => {
      const hits = items.filter((it) => matches(it, words));
      if (!hits.length) return;
      const head = document.createElement('li');
      head.className = 'palette-group';
      head.setAttribute('role', 'presentation');
      head.textContent = name;
      list.appendChild(head);
      hits.forEach((it) => {
        const li = document.createElement('li');
        li.className = 'palette-item';
        li.id = `pal-${flat.length}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        const a = document.createElement('span'); a.className = 'palette-label';
        const ico = document.createElement('i'); ico.className = 'palette-ico'; ico.setAttribute('aria-hidden', 'true');
        ico.innerHTML = PALETTE_ICONS[name] || '';
        const t = document.createElement('span'); t.textContent = it.label;
        a.append(ico, t);
        const b = document.createElement('small'); b.textContent = it.hint || '';
        li.append(a, b);
        li.addEventListener('pointermove', () => { const i = flat.findIndex((f) => f.el === li); if (i !== selected) setSelected(i); });
        li.addEventListener('click', () => run(it));
        list.appendChild(li);
        flat.push({ el: li, item: it });
      });
    });
    if (!flat.length) {
      const li = document.createElement('li');
      li.className = 'palette-empty';
      li.textContent = 'Nothing matches that. Try a project name or a technology.';
      list.appendChild(li);
    }
    setSelected(0);
  };
  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    input.value = '';
    render('');
    input.focus();
  };
  const close = () => { if (dialog.open) dialog.close(); };
  const run = (it) => {
    close();
    if (it.action === 'toggle-calm') { toggleCalm(); return; }
    if (it.action === 'print') { setTimeout(() => print(), 120); return; }
    if (it.action === 'xray') { const b = $('[data-xray-toggle]'); if (b) b.click(); return; }
    if (it.action === 'lab') { const lab = $('#lab'); if (lab && lab.togglePopover) lab.togglePopover(); return; }
    if (!it.href) return;
    if (it.download) {
      const a = document.createElement('a');
      a.href = it.href; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
    } else if (it.external) {
      window.open(it.href, '_blank', 'noopener');
    } else {
      location.href = it.href;
    }
  };

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(selected + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(selected - 1); }
    else if (e.key === 'Enter' && flat[selected]) { e.preventDefault(); run(flat[selected].item); }
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  $$('[data-open-palette]').forEach((b) => b.addEventListener('click', open));
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog.open ? close() : open(); }
  });
}

/* --------------------------------------------------------- contact + form */
function initContact() {
  const form = $('[data-contact]');
  if (!form) return;
  const dataEl = $('#site-data');
  const { email } = dataEl ? JSON.parse(dataEl.textContent) : { email: '' };
  const fields = [
    { id: 'f-name', err: 'e-name', test: (v) => v.trim().length >= 2, msg: 'Please enter your name.' },
    { id: 'f-email', err: 'e-email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Please enter a valid email address.' },
    { id: 'f-msg', err: 'e-msg', test: (v) => v.trim().length >= 10, msg: 'Please write at least a short sentence.' },
  ];
  const check = (f) => {
    const el = document.getElementById(f.id), out = document.getElementById(f.err);
    const ok = f.test(el.value);
    el.setAttribute('aria-invalid', String(!ok));
    out.textContent = ok ? '' : f.msg;
    return ok;
  };
  fields.forEach((f) => document.getElementById(f.id).addEventListener('blur', () => { if (document.getElementById(f.id).value) check(f); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = fields.map(check);
    const firstBad = results.findIndex((r) => !r);
    if (firstBad !== -1) { document.getElementById(fields[firstBad].id).focus(); return; }
    const name = document.getElementById('f-name').value.trim();
    const from = document.getElementById('f-email').value.trim();
    const msg = document.getElementById('f-msg').value.trim();
    // The brief builder: the chosen options become structured lines at the top of the email.
    const kinds = $$('input[name="kind"]:checked', form).map((i) => i.value);
    const when = ($('input[name="when"]:checked', form) || {}).value;
    const lines = ['Hi Bagas,', ''];
    if (kinds.length) lines.push(`I would like to talk about: ${kinds.join(', ')}.`);
    if (when) lines.push(`Timing: ${when}.`);
    if (kinds.length || when) lines.push('');
    lines.push(msg, '', 'Thanks,', name, from);
    const subject = encodeURIComponent(kinds.length ? `${kinds[0]}${kinds.length > 1 ? ' and more' : ''}: message from ${name}` : `Portfolio message from ${name}`);
    const body = encodeURIComponent(lines.join('\n'));
    toast('Opening your email app in a new tab');
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank', 'noopener');
  });
  // Links like /?brief=website#contact arrive with the right option already ticked.
  const preset = { website: 'Company profile website' }[new URLSearchParams(location.search).get('brief')];
  if (preset) {
    const box = $$('input[name="kind"]', form).find((i) => i.value === preset);
    if (box) box.checked = true;
  }
}

/* ------------------------------------------------- company profile gallery */
function initSites() {
  const input = $('[data-sites-search]');
  const wall = $('[data-wall]');
  if (!input || !wall) return;
  const items = $$('[data-site]', wall);
  const count = $('[data-sites-count]');
  const empty = $('[data-sites-empty]');
  input.addEventListener('input', () => {
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    items.forEach((el) => {
      const ok = words.every((w) => el.dataset.search.includes(w));
      el.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = `Showing ${shown} of ${items.length}`;
    empty.hidden = shown !== 0;
  });
}

/* -------------------------------------------------------------- work page */
function initWork() {
  const root = $('[data-work]');
  if (!root) return;
  const cards = $$('[data-card]', root);
  const chips = $$('[data-filter]', root);
  const search = $('[data-work-search]', root);
  const count = $('[data-work-count]', root);
  const empty = $('[data-work-empty]', root);
  const params = new URLSearchParams(location.search);
  let cat = chips.some((c) => c.dataset.filter === params.get('type')) ? params.get('type') : 'all';
  let q = (params.get('q') || '').toLowerCase();
  if (search) search.value = params.get('q') || '';

  const apply = () => {
    let shown = 0;
    cards.forEach((c) => {
      const okCat = cat === 'all' || c.dataset.cats.split(' ').includes(cat);
      const okQ = !q || (c.dataset.search || '').includes(q);
      const ok = okCat && okQ;
      c.hidden = !ok;
      if (ok) shown++;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === cat)));
    count.textContent = `Showing ${shown} of ${cards.length}`;
    empty.hidden = shown !== 0;
    const next = new URLSearchParams();
    if (cat !== 'all') next.set('type', cat);
    if (q) next.set('q', q);
    const qs = next.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  };
  const run = () => {
    if (document.startViewTransition && !reduce) {
      cards.forEach((c, i) => { c.style.viewTransitionName = `card-${i}`; });
      const vt = document.startViewTransition(apply);
      vt.finished.finally(() => cards.forEach((c) => { c.style.viewTransitionName = ''; }));
    } else {
      apply();
    }
  };
  chips.forEach((c) => c.addEventListener('click', () => { cat = c.dataset.filter; run(); }));
  if (search) {
    let timer = 0;
    search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { q = search.value.trim().toLowerCase(); run(); }, 120); });
  }
  apply();
}

/* ------------------------------------------------------ interactive demos */
function initApproval() {
  $$('[data-approval]').forEach((root) => {
    const steps = $$('[data-step]', root);
    const statusEl = $('[data-approval-status]', root);
    const readout = $('[data-approval-readout]', root);
    const act = $('[data-approval-act]', root);
    const reject = $('[data-approval-reject]', root);
    const reset = $('[data-approval-reset]', root);
    const radios = $$('input[type="radio"]', root);
    // c = index of the step that is waiting. 6 means everything is complete.
    const owners = ['requester', 'requester', 'supervisor', 'manager', 'director', 'system'];
    const names = { requester: 'Requester', supervisor: 'Supervisor', manager: 'Manager', director: 'Director', system: 'System' };
    const actLabels = ['Create draft', 'Submit request', 'Approve as supervisor', 'Approve as manager', 'Approve as director'];
    const statusNames = ['New', 'Draft created', 'Submitted', 'Supervisor approved', 'Manager approved', 'Director approved', 'Sent to accounting'];
    const initialText = 'Pick a role and take the next action. Try acting as the wrong role to see the rule enforced.';
    let c = 0, rejected = false, busy = false;

    const role = () => (radios.find((r) => r.checked) || {}).value || 'requester';
    const say = (html) => { readout.innerHTML = html; };
    const paint = () => {
      steps.forEach((s, i) => {
        let state = 'idle';
        if (i < c) state = 'done';
        else if (i === c && c <= 5) state = rejected ? 'bad' : 'active';
        s.dataset.state = state;
      });
      statusEl.textContent = rejected ? 'Rejected' : statusNames[c];
      const finished = rejected || c >= 5;
      act.disabled = finished || busy;
      reject.disabled = finished || busy || c < 2;
      act.textContent = rejected ? 'Rejected' : c >= 5 ? (c === 5 ? 'Sending' : 'Completed') : actLabels[c];
    };

    act.addEventListener('click', () => {
      if (rejected || c >= 5 || busy) return;
      const owner = owners[c];
      if (role() !== owner) {
        say(`<strong>Not allowed.</strong> Only the ${names[owner]} can take this step. You are acting as the ${names[role()]}, so the action was refused and nothing changed.`);
        return;
      }
      c += 1;
      if (c === 5) {
        busy = true;
        paint();
        say('<strong>Fully approved.</strong> The request is being sent to the accounting system.');
        setTimeout(() => { busy = false; c = 6; paint(); say('<strong>Sent to accounting.</strong> Each step was taken in order, by the role that owns it.'); }, reduce ? 0 : 900);
        return;
      }
      paint();
      say(`<strong>Recorded.</strong> Next: the ${names[owners[c]]} must ${c === 1 ? 'submit the request' : 'approve it'}.`);
    });
    reject.addEventListener('click', () => {
      if (rejected || c < 2 || c > 4 || busy) return;
      const owner = owners[c];
      if (role() !== owner) {
        say(`<strong>Not allowed.</strong> Only the ${names[owner]} can reject at this step.`);
        return;
      }
      rejected = true;
      paint();
      say(`<strong>Rejected by the ${names[owner]}.</strong> The request stops here and goes back to the requester with the reason.`);
    });
    reset.addEventListener('click', () => { c = 0; rejected = false; busy = false; paint(); say(initialText); });
    radios.forEach((r) => r.addEventListener('change', () => {
      if (rejected || c >= 5) return;
      say(`Acting as the <strong>${names[role()]}</strong>. The next step belongs to the <strong>${names[owners[c]]}</strong>.`);
    }));
    paint();
  });
}

function initSafeSend() {
  $$('[data-safesend]').forEach((root) => {
    const steps = $$('[data-step]', root);
    const statusEl = $('[data-send-status]', root);
    const readout = $('[data-send-readout]', root);
    const run = $('[data-send-run]', root);
    const scenario = $('[data-send-scenario]', root);
    const outcomes = {
      ok: { failAt: -1, final: 'ok', status: 'Sent', text: '<strong>Sent.</strong> Accounting returned a document number and the read-back matched every amount.' },
      invalid: { failAt: 0, final: 'bad', status: 'Held', text: '<strong>Held.</strong> Nothing was sent. The document waits with a clear reason until the data is fixed.' },
      rejected: { failAt: 2, final: 'bad', status: 'Failed', text: '<strong>Failed.</strong> Accounting refused the document, so nothing was created and it is safe to try again after the cause is fixed.' },
      dropped: { failAt: 2, final: 'warn', status: 'Unknown', text: '<strong>Unknown.</strong> The connection dropped after sending, so the result is uncertain. It is not retried automatically: a person checks the accounting system first, which prevents a duplicate.' },
      mismatch: { failAt: 3, final: 'warn', status: 'Sent, needs check', text: '<strong>Sent, needs check.</strong> The document exists, but an amount differs from the ERP. It is flagged for review instead of being corrected silently.' },
    };
    let token = 0;
    const clear = () => steps.forEach((s) => { s.dataset.state = 'idle'; });
    const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

    run.addEventListener('click', async () => {
      const my = ++token;
      const o = outcomes[scenario.value];
      run.disabled = true;
      clear();
      statusEl.textContent = 'Running';
      readout.textContent = 'Running the steps in order.';
      for (let i = 0; i < steps.length; i++) {
        if (my !== token) return;
        steps[i].dataset.state = 'active';
        await wait(650);
        if (my !== token) return;
        if (i === o.failAt) {
          steps[i].dataset.state = o.final;
          statusEl.textContent = o.status;
          readout.innerHTML = o.text;
          run.disabled = false;
          return;
        }
        steps[i].dataset.state = 'done';
      }
      steps[steps.length - 1].dataset.state = 'ok';
      statusEl.textContent = o.status;
      readout.innerHTML = o.text;
      run.disabled = false;
    });
    scenario.addEventListener('change', () => { token++; clear(); run.disabled = false; statusEl.textContent = 'Ready'; readout.textContent = 'Press Run to see how this case ends.'; });
  });
}

/* ------------------------------------------------------------ case study */
function initToc() {
  const links = $$('[data-toc]');
  if (!links.length) return;
  const sections = links.map((a) => document.getElementById(a.dataset.toc));
  const update = raf(() => {
    let cur = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= 150) cur = i; });
    links.forEach((a, i) => a.setAttribute('aria-current', String(i === cur)));
  });
  addEventListener('scroll', update, { passive: true });
  update();
}

[
  ['header', initHeader], ['nav', initNav], ['menu', initMenu], ['reveal', initReveal], ['count', initCount],
  ['totop', initToTop], ['card', initCard], ['tiles', initTiles], ['peek', initPeek], ['xp', initXp], ['sites', initSites], ['lab', initLab], ['xray', initXray], ['keys', initKeys],
  ['terminal', initTerminal], ['timeline', initTimeline], ['carousel', initCarousel], ['palette', initPalette], ['contact', initContact],
  ['work', initWork], ['approval', initApproval], ['safesend', initSafeSend], ['toc', initToc],
].forEach(([name, fn]) => safe(name, fn));
