/* Helpers shared by the two digital invitation demos (classic and modern).
   Vanilla JS, no dependencies. Everything here is demo behaviour that also
   works in a real invitation: guest name from the link, countdown, calendar
   file, copy buttons, RSVP with a wishes wall, and a synthesised music loop. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function pad(n) { return String(n).padStart(2, '0'); }

  var IV = { reduce: reduce, $: $, $$: $$, pad: pad };
  window.IV = IV;

  /* ---------- Guest name, taken from the link: ?to=Nama+Tamu ---------- */
  function cleanName(v) {
    return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  }
  var DEFAULT_GUEST = 'Bapak/Ibu/Saudara/i';
  IV.guest = cleanName(new URLSearchParams(location.search).get('to')) || DEFAULT_GUEST;
  IV.setGuest = function (name) {
    IV.guest = cleanName(name) || DEFAULT_GUEST;
    $$('[data-guest]').forEach(function (el) { el.textContent = IV.guest; });
  };
  IV.setGuest(IV.guest);

  /* ---------- Dates ---------- */
  // A rolling event date so the countdown never shows a day that already passed:
  // the first given weekday at least `minDays` from today (0 = Sunday ... 6 = Saturday).
  IV.rollingDate = function (minDays, weekday, hour, minute) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + minDays);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    d.setHours(hour || 0, minute || 0, 0, 0);
    return d;
  };
  IV.fmtDate = function (d, withWeekday) {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: withWeekday === false ? undefined : 'long',
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(d);
    } catch (e) {
      return d.toDateString();
    }
  };
  IV.fmtTime = function (d) { return pad(d.getHours()) + '.' + pad(d.getMinutes()) + ' WIB'; };
  IV.addMinutes = function (d, m) { return new Date(d.getTime() + m * 60000); };

  /* ---------- Countdown: container holds [data-cd="d|h|m|s"] ---------- */
  IV.countdown = function (container, target, doneText) {
    var cells = {};
    ['d', 'h', 'm', 's'].forEach(function (k) { cells[k] = $('[data-cd="' + k + '"]', container); });
    var timer = null;
    var handle = {
      set: function (t) { target = t; tick(); },
      stop: function () { clearInterval(timer); }
    };
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        diff = 0;
        container.classList.add('is-done');
        if (doneText) container.setAttribute('data-done', doneText);
      } else {
        container.classList.remove('is-done');
      }
      var s = Math.floor(diff / 1000);
      var vals = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      Object.keys(cells).forEach(function (k) {
        if (cells[k]) cells[k].textContent = k === 'd' ? String(vals[k]) : pad(vals[k]);
      });
    }
    tick();
    timer = setInterval(tick, 1000);
    return handle;
  };

  /* ---------- Toast ---------- */
  var toastEl = null;
  var toastTimer = 0;
  IV.toast = function (msg) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'iv-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  };

  /* ---------- Copy buttons: <button data-copy="text" data-copy-msg="..."> ---------- */
  IV.copy = function (text, msg) {
    function ok() { IV.toast(msg || 'Disalin'); }
    function fallback() {
      var t = doc.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', '');
      t.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      doc.body.appendChild(t);
      t.select();
      try { doc.execCommand('copy'); ok(); } catch (e) { IV.toast('Salin manual: ' + text); }
      doc.body.removeChild(t);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
  };
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (b) IV.copy(b.getAttribute('data-copy'), b.getAttribute('data-copy-msg'));
  });

  /* ---------- Calendar file (.ics) ---------- */
  IV.downloadIcs = function (o) {
    function f(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
    function esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    var stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bagas Aria Sativa//Undangan Demo//ID', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:' + Date.now() + '@undangan-demo', 'DTSTAMP:' + stamp,
      'DTSTART:' + f(o.start), 'DTEND:' + f(o.end),
      'SUMMARY:' + esc(o.title), 'LOCATION:' + esc(o.location), 'DESCRIPTION:' + esc(o.description),
      // A reminder one day before, so the event is not forgotten.
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Besok: ' + o.title), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = doc.createElement('a');
    a.href = url;
    a.download = (o.file || 'undangan') + '.ics';
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    IV.toast('File kalender diunduh. Buka untuk menyimpannya.');
  };

  /* ---------- Reveal on scroll ---------- */
  // Elements start hidden only when JS runs and motion is allowed, so content is never lost.
  IV.reveal = function (selector, scope) {
    var els = $$(selector || '.reveal', scope);
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  };

  /* ---------- Scroll lock while the cover is shown ---------- */
  IV.lockScroll = function (on) { root.classList.toggle('locked', !!on); };

  /* ---------- RSVP form + wishes wall (saved in this browser only) ---------- */
  IV.rsvp = function (o) {
    var form = $(o.form);
    var list = $(o.list);
    if (!form || !list) return;
    var key = o.key;
    var seed = o.seed || [];
    var user = [];
    function load() {
      try { user = JSON.parse(localStorage.getItem(key) || '[]') || []; } catch (e) { user = []; }
    }
    load();

    var labels = { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Masih ragu' };

    function save() { try { localStorage.setItem(key, JSON.stringify(user.slice(0, 30))); } catch (e) { /* storage unavailable */ } }

    function render() {
      var all = user.concat(seed);
      list.textContent = '';
      all.forEach(function (w) {
        var li = doc.createElement('li');
        li.className = 'wish';
        var head = doc.createElement('div');
        head.className = 'wish-h';
        var b = doc.createElement('b');
        b.textContent = w.name;
        var badge = doc.createElement('span');
        badge.className = 'badge badge--' + w.attend;
        badge.textContent = labels[w.attend] || '';
        head.appendChild(b);
        head.appendChild(badge);
        li.appendChild(head);
        if (w.msg) {
          var p = doc.createElement('p');
          p.textContent = w.msg;
          li.appendChild(p);
        }
        var s = doc.createElement('small');
        s.textContent = w.ago;
        li.appendChild(s);
        list.appendChild(li);
      });
      var hadir = 0;
      all.forEach(function (w) { if (w.attend === 'hadir') hadir += Number(w.guests) || 1; });
      var setc = function (k, v) { $$('[data-count="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
      setc('hadir', hadir);
      setc('ucapan', all.length);
      var resetBtn = $(o.reset || '[data-rsvp-reset]');
      if (resetBtn) resetBtn.hidden = user.length === 0;
    }

    function setErr(name, msg) {
      var el = $('[data-err="' + name + '"]', form);
      var field = form.elements[name];
      if (el) el.textContent = msg || '';
      var first = field && (field.length && field[0] ? field[0] : field);
      if (first && first.setAttribute) {
        if (msg) first.setAttribute('aria-invalid', 'true'); else first.removeAttribute('aria-invalid');
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = cleanName(form.elements.name.value);
      var attend = (form.querySelector('input[name="attend"]:checked') || {}).value;
      var guests = form.elements.guests ? Number(form.elements.guests.value) || 1 : 1;
      var msg = String(form.elements.message.value || '').trim().slice(0, 240);
      var bad = false;
      setErr('name', ''); setErr('attend', '');
      if (name.length < 2) { setErr('name', 'Tuliskan nama Anda (minimal 2 huruf).'); bad = true; }
      if (!attend) { setErr('attend', 'Pilih salah satu: hadir, tidak hadir, atau masih ragu.'); bad = true; }
      if (bad) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      user.unshift({ name: name, attend: attend, guests: attend === 'hadir' ? guests : 0, msg: msg, ago: 'Baru saja' });
      save();
      render();
      form.reset();
      if (o.guestField) form.elements.name.value = '';
      var ok = $(o.ok || '[data-rsvp-ok]');
      var okMsg = typeof o.okText === 'function'
        ? o.okText(name, attend)
        : 'Terima kasih, ' + name + '. Konfirmasi dan ucapan Anda sudah tercatat di bawah.';
      if (ok) { ok.hidden = false; ok.textContent = okMsg; }
      IV.toast('Konfirmasi terkirim (demo, tersimpan di browser ini).');
      if (typeof o.onSubmit === 'function') o.onSubmit({ name: name, attend: attend, guests: guests, msg: msg });
    });

    ['name', 'attend'].forEach(function (n) {
      form.addEventListener('input', function (e) { if (e.target.name === n) setErr(n, ''); });
    });

    var reset = $(o.reset || '[data-rsvp-reset]');
    if (reset) reset.addEventListener('click', function () {
      user = [];
      save();
      render();
      IV.toast('Ucapan demo Anda dihapus.');
    });

    render();

    // Lets a page swap the wishes (for example when the event type changes).
    return {
      use: function (newKey, newSeed) {
        key = newKey;
        seed = newSeed || [];
        load();
        var ok = $(o.ok || '[data-rsvp-ok]');
        if (ok) ok.hidden = true;
        render();
      }
    };
  };

  /* ---------- Premium extras: styles injected once, theme through CSS variables ---------- */
  var extraCss = [
    '.iv-progress{position:fixed;left:0;top:0;height:3px;width:100%;transform:scaleX(0);transform-origin:0 50%;background:var(--iv-progress,#b48a43);z-index:120;pointer-events:none}',
    'html:not(.opened) .iv-progress{opacity:0}',
    '.iv-lb{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:1rem;background:var(--lb-bg,rgba(12,9,9,.9))}',
    '.iv-lb[hidden]{display:none}',
    '.iv-lb__stage{display:grid;place-items:center;max-width:100%}',
    '.iv-lb__stage>*{width:min(86vw,var(--lb-w,400px));max-height:74vh;margin:0}',
    '.iv-lb__cap{position:absolute;left:0;right:0;bottom:1.1rem;text-align:center;color:#fff;font:600 .85rem/1.4 system-ui,sans-serif;letter-spacing:.04em}',
    '.iv-lb__btn{position:absolute;width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.6);background:rgba(0,0,0,.35);color:#fff;font:600 1.3rem/1 system-ui,sans-serif;display:grid;place-items:center;cursor:pointer}',
    '.iv-lb__btn:hover{background:rgba(255,255,255,.18)}',
    '.iv-lb__btn:focus-visible{outline:3px solid #fff;outline-offset:3px}',
    '.iv-lb__close{top:1rem;right:1rem}.iv-lb__prev{left:.8rem;top:50%;margin-top:-24px}.iv-lb__next{right:.8rem;top:50%;margin-top:-24px}',
    '.iv-zoomable{cursor:zoom-in}',
    '.iv-confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:250}'
  ].join('');
  var extraStyle = doc.createElement('style');
  extraStyle.textContent = extraCss;
  doc.head.appendChild(extraStyle);

  /* ---------- Decorative QR-style pattern (a demo picture, not a real code) ---------- */
  IV.qr = function (svg, seed, n) {
    if (!svg) return;
    n = n || 25;
    var c = 4, s = seed || 7, out = '';
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    function inFinder(x, y) { return (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); }
    function rect(x, y, w, h, fill) {
      out += '<rect x="' + x * c + '" y="' + y * c + '" width="' + w * c + '" height="' + h * c + '" style="fill:' + fill + '"/>';
    }
    var dark = 'currentColor', light = 'var(--qr-bg,#fff)';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) rect(x, y, 1, 1, dark);
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(function (p) {
      rect(p[0], p[1], 7, 7, dark); rect(p[0] + 1, p[1] + 1, 5, 5, light); rect(p[0] + 2, p[1] + 2, 3, 3, dark);
    });
    svg.setAttribute('viewBox', '0 0 ' + n * c + ' ' + n * c);
    svg.innerHTML = out;
  };

  /* ---------- Share: the phone share sheet when available, otherwise copy the link ---------- */
  IV.share = function (o) {
    o = o || {};
    var url = o.url || location.href.split('#')[0];
    if (navigator.share) {
      navigator.share({ title: o.title, text: o.text, url: url }).catch(function () { /* cancelled */ });
    } else {
      IV.copy(url, o.msg || 'Link undangan disalin');
    }
  };

  /* ---------- Thin scroll progress bar, coloured through --iv-progress ---------- */
  IV.progress = function () {
    var bar = doc.createElement('div');
    bar.className = 'iv-progress';
    bar.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(bar);
    function upd() {
      var max = root.scrollHeight - root.clientHeight;
      var y = window.pageYOffset || root.scrollTop || 0;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  };

  /* ---------- Floating particles on a canvas: gold dust, or falling petals ---------- */
  IV.dust = function (canvas, o) {
    if (!canvas || reduce || !canvas.getContext) return null;
    o = o || {};
    var ctx = canvas.getContext('2d');
    var colors = o.colors || ['#dcc08a', '#b48a43'];
    var count = o.count || 34;
    var falling = o.kind === 'petal';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 1, h = 1, ps = [], raf = 0, seen = true, t = 0;

    function size() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : (falling ? -12 : h + 12),
        r: falling ? 2.4 + Math.random() * 2.8 : 0.8 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * (falling ? 0.5 : 0.2),
        vy: falling ? 0.28 + Math.random() * 0.55 : -(0.1 + Math.random() * 0.32),
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.04,
        a: 0.3 + Math.random() * 0.5, ph: Math.random() * 6.28,
        c: colors[Math.floor(Math.random() * colors.length)]
      };
    }
    function frame() {
      if (!seen || doc.hidden) { raf = 0; return; }
      t += 0.02;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.x += p.vx + (falling ? Math.sin(t + p.ph) * 0.35 : 0);
        p.y += p.vy; p.rot += p.vr;
        if (p.y < -14 || p.y > h + 14 || p.x < -14 || p.x > w + 14) { ps[i] = make(false); continue; }
        ctx.globalAlpha = p.a * (0.65 + 0.35 * Math.sin(t * 2 + p.ph));
        ctx.fillStyle = p.c;
        ctx.beginPath();
        if (falling) {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.ellipse(0, 0, p.r * 1.7, p.r * 0.85, 0, 0, 6.2832); ctx.fill(); ctx.restore();
        } else {
          ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function go() { if (!raf) raf = requestAnimationFrame(frame); }
    size();
    for (var i = 0; i < count; i++) ps.push(make(true));
    window.addEventListener('resize', size);
    doc.addEventListener('visibilitychange', go);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { seen = en[0].isIntersecting; if (seen) go(); }).observe(canvas);
    }
    go();
    return { stop: function () { seen = false; } };
  };

  /* ---------- Confetti burst (skipped when the visitor prefers reduced motion) ---------- */
  IV.confetti = function (colors) {
    if (reduce) return;
    var c = doc.createElement('canvas');
    c.className = 'iv-confetti';
    c.setAttribute('aria-hidden', 'true');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    doc.body.appendChild(c);
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    colors = colors || ['#dcc08a', '#b48a43', '#ffffff', '#6b1523'];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      var sp = 6 + Math.random() * 9;
      bits.push({ x: W / 2, y: H * 0.7, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
        r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, c: colors[i % colors.length] });
    }
    var start = performance.now();
    (function loop(now) {
      var k = (now - start) / 2400;
      ctx.clearRect(0, 0, W, H);
      bits.forEach(function (b) {
        b.vy += 0.28; b.vx *= 0.992; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
      });
      if (k < 1) requestAnimationFrame(loop); else if (c.parentNode) c.parentNode.removeChild(c);
    })(start);
  };

  /* ---------- Lightbox: click an item to enlarge a copy of it, arrows and Esc work ---------- */
  IV.lightbox = function (items, o) {
    items = items || [];
    o = o || {};
    if (!items.length) return;
    var box = doc.createElement('div');
    box.className = 'iv-lb';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', o.label || 'Galeri foto');
    box.innerHTML = '<div class="iv-lb__stage"></div><p class="iv-lb__cap" aria-live="polite"></p>' +
      '<button type="button" class="iv-lb__btn iv-lb__close" aria-label="Tutup">&#10005;</button>' +
      '<button type="button" class="iv-lb__btn iv-lb__prev" aria-label="Sebelumnya">&#8592;</button>' +
      '<button type="button" class="iv-lb__btn iv-lb__next" aria-label="Berikutnya">&#8594;</button>';
    doc.body.appendChild(box);
    var stage = $('.iv-lb__stage', box), cap = $('.iv-lb__cap', box);
    var btnClose = $('.iv-lb__close', box), btnPrev = $('.iv-lb__prev', box), btnNext = $('.iv-lb__next', box);
    var idx = 0, opener = null;

    function show(i) {
      idx = (i + items.length) % items.length;
      var src = items[idx];
      var clone = src.cloneNode(true);
      clone.removeAttribute('id'); clone.removeAttribute('tabindex'); clone.removeAttribute('role');
      clone.classList.remove('iv-zoomable', 'reveal', 'in');
      clone.style.opacity = '1'; clone.style.transform = 'none';
      stage.textContent = '';
      stage.appendChild(clone);
      cap.textContent = (src.getAttribute('data-cap') || '') + (items.length > 1 ? '  (' + (idx + 1) + '/' + items.length + ')' : '');
    }
    function open(i) {
      opener = doc.activeElement;
      show(i);
      box.hidden = false;
      IV.lockScroll(true);
      btnClose.focus();
    }
    function close() {
      box.hidden = true;
      IV.lockScroll(false);
      if (opener && opener.focus) opener.focus();
    }
    items.forEach(function (el, i) {
      el.classList.add('iv-zoomable');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Perbesar: ' + (el.getAttribute('data-cap') || 'foto ' + (i + 1)));
      el.addEventListener('click', function () { if (!o.canOpen || o.canOpen()) open(i); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(idx - 1); });
    btnNext.addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    doc.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') {
        var f = [btnClose, btnPrev, btnNext];
        var i = f.indexOf(doc.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
  };

  /* ---------- Music: a soft arpeggio synthesised in the browser (no audio files) ---------- */
  IV.music = function (cfg) {
    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = null, master = null, timer = null, nextT = 0, step = 0, on = false;
    var listeners = [];
    var spb = 60 / cfg.bpm / 2; // one eighth note

    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function tone(m, t, dur, vol, type) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type;
      o.frequency.value = hz(m);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + dur + 0.05);
    }

    function schedule() {
      while (nextT < ctx.currentTime + 0.4) {
        var bar = Math.floor(step / 8) % cfg.chords.length;
        var pos = step % 8;
        var ch = cfg.chords[bar];
        var n = cfg.pattern[pos];
        if (n !== null) {
          tone(ch[n % ch.length] + 12 * Math.floor(n / ch.length), nextT, cfg.decay, cfg.vol, cfg.wave);
        }
        if (pos === 0) tone(ch[0] - 12, nextT, spb * 7, cfg.vol * 1.2, 'sine');
        step++;
        nextT += spb;
      }
    }

    function emit() { listeners.forEach(function (fn) { fn(on); }); }

    var api = {
      supported: !!AC,
      playing: function () { return on; },
      onChange: function (fn) { listeners.push(fn); },
      start: function () {
        if (!AC || on) return;
        if (!ctx) {
          ctx = new AC();
          master = ctx.createGain();
          master.gain.value = 0;
          var delay = ctx.createDelay(1);
          delay.delayTime.value = spb * 1.5;
          var fb = ctx.createGain();
          fb.gain.value = 0.32;
          master.connect(ctx.destination);
          master.connect(delay);
          delay.connect(fb);
          fb.connect(delay);
          delay.connect(ctx.destination);
        }
        if (ctx.resume) ctx.resume();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(cfg.master || 0.5, ctx.currentTime + 1.2);
        nextT = ctx.currentTime + 0.1;
        clearInterval(timer);
        timer = setInterval(schedule, 120);
        on = true;
        emit();
      },
      stop: function () {
        if (!ctx || !on) return;
        on = false;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        clearInterval(timer);
        emit();
      },
      toggle: function () { if (on) api.stop(); else api.start(); }
    };

    // Buttons marked [data-music] toggle the loop and mirror its state.
    $$('[data-music]').forEach(function (btn) {
      if (!AC) { btn.hidden = true; return; }
      btn.addEventListener('click', function () { api.toggle(); });
    });
    api.onChange(function (state) {
      $$('[data-music]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', state ? 'true' : 'false');
        btn.classList.toggle('is-on', state);
        btn.setAttribute('aria-label', state ? 'Matikan musik' : 'Putar musik');
      });
    });
    return api;
  };
})();
