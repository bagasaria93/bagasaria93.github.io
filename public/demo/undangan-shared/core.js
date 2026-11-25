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
  IV.guest = cleanName(new URLSearchParams(location.search).get('to')) || 'Tamu Undangan';
  IV.setGuest = function (name) {
    IV.guest = cleanName(name) || 'Tamu Undangan';
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
      if (ok) { ok.hidden = false; ok.textContent = 'Terima kasih, ' + name + '. Konfirmasi dan ucapan Anda sudah tercatat di bawah.'; }
      IV.toast('Konfirmasi terkirim (demo, tersimpan di browser ini).');
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
