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

/* ---------------------------------------- accent colour + calm mode */
function initAccent() {
  const buttons = $$('[data-accent-set]');
  if (!buttons.length) return;
  const root = document.documentElement;
  const sync = () => {
    const cur = root.dataset.accent || 'blue';
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.accentSet === cur)));
  };
  const apply = (v) => {
    if (v === 'blue') delete root.dataset.accent; else root.dataset.accent = v;
    sync();
  };
  buttons.forEach((b) => b.addEventListener('click', (e) => {
    const v = b.dataset.accentSet;
    try { localStorage.setItem('accent', v); } catch { /* private mode: the choice just will not persist */ }
    const calm = reduce || root.hasAttribute('data-calm');
    if (!document.startViewTransition || calm) { apply(v); return; }
    // The new colour spreads out from the swatch as a growing circle (View Transitions + clip-path).
    const r = b.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('vt-accent');
    const vt = document.startViewTransition(() => apply(v));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
    vt.finished.finally(() => root.classList.remove('vt-accent'));
  }));
  sync();
}

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
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

function initNav() {
  const nav = $('.nav');
  const indicator = $('.nav-indicator');
  if (!nav || !indicator) return;
  const links = $$('a', nav);
  const isHome = document.body.dataset.page === 'home';
  let active = links.find((a) => a.getAttribute('aria-current') === 'page') || null;

  const place = (a) => {
    if (!a) { indicator.style.opacity = '0'; return; }
    indicator.style.opacity = '1';
    indicator.style.width = `${a.offsetWidth}px`;
    indicator.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  const setActive = (a) => {
    if (a === active) return;
    active = a;
    links.forEach((l) => { if (isHome) { if (l === a) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); } });
    place(active);
  };

  links.forEach((a) => {
    a.addEventListener('pointerenter', () => place(a));
    a.addEventListener('focus', () => place(a));
    a.addEventListener('blur', () => place(active));
  });
  nav.addEventListener('pointerleave', () => place(active));
  addEventListener('resize', () => place(active), { passive: true });

  if (isHome) {
    const sections = ['work', 'case', 'experience', 'skills', 'contact']
      .map((id) => ({ id, el: document.getElementById(id), link: links.find((l) => l.dataset.nav === id) }))
      .filter((s) => s.el && s.link);
    const spy = raf(() => {
      let cur = null;
      const line = innerHeight * 0.35;
      sections.forEach((s) => { if (s.el.getBoundingClientRect().top <= line) cur = s.link; });
      setActive(cur);
    });
    addEventListener('scroll', spy, { passive: true });
    spy();
  }
  place(active);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(active));
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

/* ---------------------------------- isometric diorama: parallax + drag to rotate */
function initIso() {
  const iso = $('[data-iso]');
  const scene = iso && $('.scene', iso);
  if (!scene) return;
  const s = { tx: 0, ty: 0, x: 0, y: 0, drag: 0, vel: 0, down: false, dragging: false, startX: 0, lastX: 0, pid: 0, suppress: false };
  let running = false;

  const paint = () => {
    scene.style.setProperty('--px', s.x.toFixed(3));
    scene.style.setProperty('--py', s.y.toFixed(3));
    scene.style.setProperty('--drag', `${s.drag.toFixed(2)}deg`);
  };
  const step = () => {
    s.x += (s.tx - s.x) * 0.09;
    s.y += (s.ty - s.y) * 0.09;
    if (!s.dragging && Math.abs(s.vel) > 0.02) { s.drag += s.vel; s.vel *= 0.94; } else if (!s.dragging) { s.vel = 0; }
    paint();
    const settled = Math.abs(s.tx - s.x) < 0.002 && Math.abs(s.ty - s.y) < 0.002 && Math.abs(s.vel) <= 0.02;
    if (settled && !s.dragging) { running = false; return; }
    requestAnimationFrame(step);
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };

  if (finePointer && !reduce) {
    iso.addEventListener('pointermove', (e) => {
      if (s.down) return;
      const r = iso.getBoundingClientRect();
      s.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      s.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    });
    iso.addEventListener('pointerleave', () => { s.tx = 0; s.ty = 0; kick(); });
  }

  iso.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    s.down = true; s.dragging = false; s.startX = s.lastX = e.clientX; s.pid = e.pointerId; s.vel = 0; s.suppress = false;
  });
  addEventListener('pointermove', (e) => {
    if (!s.down || e.pointerId !== s.pid) return;
    if (!s.dragging && Math.abs(e.clientX - s.startX) > 5) {
      s.dragging = true;
      iso.classList.add('is-dragging');
      try { iso.setPointerCapture(s.pid); } catch { /* ignore */ }
    }
    if (s.dragging) {
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.drag += dx * 0.4;
      s.vel = reduce ? 0 : dx * 0.4;
      kick();
    }
  }, { passive: true });
  const end = (e) => {
    if (!s.down || (e && e.pointerId !== s.pid)) return;
    s.down = false;
    if (s.dragging) { s.dragging = false; s.suppress = true; iso.classList.remove('is-dragging'); kick(); }
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  // A drag that ends on a label must not also follow the label's link.
  iso.addEventListener('click', (e) => { if (s.suppress) { e.preventDefault(); e.stopPropagation(); s.suppress = false; } }, true);
  iso.addEventListener('dragstart', (e) => e.preventDefault());
  paint();
}

/* ---------------------------------------------- card tilt and magnetic buttons */
function initTilt() {
  if (!finePointer || reduce) return;
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${((px - 0.5) * 7).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });
}

function initMagnetic() {
  if (!finePointer || reduce) return;
  $$('[data-magnetic]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      b.style.transform = `translate(${(x * 0.12).toFixed(1)}px, ${(y * 0.2).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
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
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n${name}\n${from}`);
    toast('Opening your email app in a new tab');
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank', 'noopener');
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
  ['accent', initAccent], ['iso', initIso], ['tilt', initTilt], ['magnetic', initMagnetic],
  ['terminal', initTerminal], ['timeline', initTimeline], ['carousel', initCarousel], ['palette', initPalette], ['contact', initContact],
  ['work', initWork], ['approval', initApproval], ['safesend', initSafeSend], ['toc', initToc],
].forEach(([name, fn]) => safe(name, fn));
