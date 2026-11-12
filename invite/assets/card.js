/* Invitation card maker: draws the card on a canvas in the browser. Nothing is uploaded. */
(function () {
  'use strict';
  var d = document, $ = function (id) { return d.getElementById(id); };
  var cv = $('cv');
  if (!cv) return;
  var ctx = cv.getContext('2d'), photo = null, pending = 0;
  var F = ['top', 'title', 'names', 'body', 'date', 'time', 'venue', 'foot'];
  var SIZES = { sq: [1080, 1080], po: [1080, 1350], st: [1080, 1920] };
  var DEV = '"Noto Sans Devanagari","Noto Sans Gurmukhi","Nirmala UI",Mangal,Raavi';
  var FONTS = {
    serif: 'Georgia,"Times New Roman",' + DEV + ',serif',
    sans: 'Inter,"Segoe UI",Roboto,' + DEV + ',Arial,sans-serif',
    classic: '"Palatino Linotype","Book Antiqua",Palatino,Georgia,' + DEV + ',serif'
  };
  var PRE = JSON.parse(($('presets') || {}).textContent || '{}');

  function rnd(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fill(c, W, H) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
  function grad(a, b, W, H) { var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); fill(g, W, H); }
  function frame(W, H, inset, c, lw) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(inset, inset, W - 2 * inset, H - 2 * inset); }
  function dot(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  function petal(x, y, r, a, c) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(r * .9, 0, r, r * .42, 0, 0, 6.2832); ctx.fill(); ctx.restore(); }
  function flower(x, y, r, n, c, c2) { for (var i = 0; i < n; i++) petal(x, y, r, i * 6.2832 / n, c); dot(x, y, r * .45, c2); }
  function corners(W, H, fn) { [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].forEach(function (k) { ctx.save(); ctx.translate(k[0], k[1]); ctx.scale(k[2], k[3]); fn(); ctx.restore(); }); }

  var THEMES = {
    marigold: { name: 'Marigold', ink: '#4a1d0f', acc: '#b4380b', soft: '#7c4a2d', pt: .17, pb: .09, px: .13, draw: function (W, H) {
      fill('#fff8ec', W, H); var u = W / 1080, n = 22, i, x;
      frame(W, H, 34 * u, '#b4380b', 5 * u); frame(W, H, 48 * u, '#f59e0b', 2 * u);
      for (i = 0; i <= n; i++) { x = 60 * u + i * (W - 120 * u) / n; var y = 70 * u + Math.sin(i / n * Math.PI * 4) * 16 * u + 18 * u; flower(x, y, 15 * u, 8, i % 2 ? '#f59e0b' : '#ea580c', '#fde68a'); }
      [0, 1].forEach(function (s) { for (i = 1; i < 6; i++) flower(s ? W - 62 * u : 62 * u, 88 * u + i * 40 * u, (15 - i) * u, 8, i % 2 ? '#ea580c' : '#f59e0b', '#fde68a'); });
      for (i = 0; i < 9; i++) flower(W / 2 + (i - 4) * 42 * u, H - 74 * u, 10 * u, 6, i % 2 ? '#f59e0b' : '#ea580c', '#fde68a');
    } },
    royal: { name: 'Royal maroon', ink: '#fdf3d7', acc: '#e7c873', soft: '#ecd9a6', pt: .13, pb: .12, px: .15, draw: function (W, H) {
      grad('#651224', '#3a0a14', W, H); var u = W / 1080;
      frame(W, H, 36 * u, '#e7c873', 4 * u); frame(W, H, 54 * u, '#e7c873', 1.5 * u);
      corners(W, H, function () {
        ctx.strokeStyle = '#e7c873'; ctx.lineWidth = 2 * u;
        for (var r = 60; r <= 150; r += 30) { ctx.beginPath(); ctx.arc(54 * u, 54 * u, r * u, 0, Math.PI / 2); ctx.stroke(); }
        for (var a = 0; a <= 6; a++) { var t = a / 6 * Math.PI / 2; dot(54 * u + Math.cos(t) * 170 * u, 54 * u + Math.sin(t) * 170 * u, 5 * u, '#e7c873'); }
      });
    } },
    mint: { name: 'Green leaves', ink: '#14342b', acc: '#15803d', soft: '#3f6659', pt: .11, pb: .11, px: .17, draw: function (W, H) {
      fill('#f1faf4', W, H); var u = W / 1080, y;
      frame(W, H, 40 * u, '#86c5a0', 2 * u);
      [70 * u, W - 70 * u].forEach(function (x, s) {
        ctx.strokeStyle = '#3f9d68'; ctx.lineWidth = 3 * u; ctx.beginPath();
        for (y = 80 * u; y < H - 80 * u; y += 8 * u) { var xx = x + Math.sin(y / (60 * u)) * 14 * u; if (y === 80 * u) ctx.moveTo(xx, y); else ctx.lineTo(xx, y); }
        ctx.stroke();
        for (y = 110 * u, s = 0; y < H - 100 * u; y += 62 * u, s++) petal(x + Math.sin(y / (60 * u)) * 14 * u, y, 20 * u, (s % 2 ? .5 : Math.PI - .5), s % 3 ? '#4fb37c' : '#2f8f5b');
      });
    } },
    night: { name: 'Night sky', ink: '#f8fafc', acc: '#fcd34d', soft: '#cbd5e1', pt: .12, pb: .12, px: .14, draw: function (W, H) {
      grad('#0b1437', '#1f2f78', W, H); var u = W / 1080, r = rnd(7), i;
      for (i = 0; i < 170; i++) dot(r() * W, r() * H, (r() * 2.4 + .6) * u, 'rgba(255,255,255,' + (.35 + r() * .6).toFixed(2) + ')');
      ctx.strokeStyle = '#fcd34d'; ctx.lineWidth = 2 * u;
      for (i = 0; i < 9; i++) { var x = r() * W, y = r() * H * .3, s = (8 + r() * 10) * u; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke(); }
      frame(W, H, 38 * u, '#fcd34d', 2.5 * u);
    } },
    balloons: { name: 'Balloons', ink: '#1f2937', acc: '#db2777', soft: '#4b5563', pt: .25, pb: .1, px: .13, draw: function (W, H) {
      fill('#fffdf5', W, H); var u = W / 1080, r = rnd(11), C = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899'], i;
      for (i = 0; i < 90; i++) { ctx.save(); ctx.translate(r() * W, r() < .75 ? r() * H * .22 : H - r() * H * .09); ctx.rotate(r() * 3); ctx.fillStyle = C[i % 6]; ctx.fillRect(0, 0, 14 * u, 6 * u); ctx.restore(); }
      [[150, 150, 0], [255, 110, 1], [345, 175, 2], [930, 150, 3], [825, 110, 4], [735, 175, 5]].forEach(function (b) {
        var x = b[0] * u, y = b[1] * u + H * .01;
        ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(x, y + 62 * u); ctx.quadraticCurveTo(x + 18 * u, y + 130 * u, x - 6 * u, y + 200 * u); ctx.stroke();
        ctx.fillStyle = C[b[2]]; ctx.beginPath(); ctx.ellipse(x, y, 50 * u, 62 * u, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(x - 18 * u, y - 24 * u, 9 * u, 16 * u, .5, 0, 6.2832); ctx.fill();
      });
    } },
    blush: { name: 'Soft pink', ink: '#4a2a35', acc: '#be185d', soft: '#7a5563', pt: .12, pb: .12, px: .15, draw: function (W, H) {
      fill('#fff5f7', W, H); var u = W / 1080;
      [[0, 0, 380, '#fbcfe8'], [W, 0, 300, '#fed7aa'], [0, H, 300, '#ddd6fe'], [W, H, 380, '#fbcfe8']].forEach(function (c) {
        var g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], c[2] * u); g.addColorStop(0, c[3]); g.addColorStop(1, 'rgba(255,245,247,0)'); fill(g, W, H);
      });
      frame(W, H, 42 * u, '#d4a373', 2.5 * u);
      corners(W, H, function () { flower(42 * u, 42 * u, 16 * u, 6, '#f9a8d4', '#be185d'); });
    } },
    diya: { name: 'Diya glow', ink: '#fff4dc', acc: '#fbbf24', soft: '#f3d9a4', pt: .12, pb: .19, px: .14, draw: function (W, H) {
      grad('#2a0f05', '#6b2a0a', W, H); var u = W / 1080, i;
      frame(W, H, 36 * u, '#fbbf24', 3 * u);
      corners(W, H, function () { for (var k = 0; k < 5; k++) for (var j = 0; j < 5 - k; j++) dot((70 + k * 26) * u, (70 + j * 26) * u, 4 * u, '#fbbf24'); });
      for (i = 0; i < 5; i++) {
        var x = W / 2 + (i - 2) * 150 * u, y = H - 110 * u;
        var g = ctx.createRadialGradient(x, y - 44 * u, 0, x, y - 44 * u, 90 * u); g.addColorStop(0, 'rgba(253,224,71,.55)'); g.addColorStop(1, 'rgba(253,224,71,0)'); ctx.fillStyle = g; ctx.fillRect(x - 90 * u, y - 134 * u, 180 * u, 180 * u);
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.moveTo(x, y - 78 * u); ctx.quadraticCurveTo(x + 20 * u, y - 36 * u, x, y - 14 * u); ctx.quadraticCurveTo(x - 20 * u, y - 36 * u, x, y - 78 * u); ctx.fill();
        ctx.fillStyle = '#c2410c'; ctx.beginPath(); ctx.moveTo(x - 46 * u, y - 14 * u); ctx.quadraticCurveTo(x, y + 44 * u, x + 46 * u, y - 14 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x - 46 * u, y - 17 * u, 92 * u, 5 * u);
      }
    } },
    simple: { name: 'Simple', ink: '#111827', acc: '#0f766e', soft: '#4b5563', pt: .11, pb: .11, px: .14, draw: function (W, H) {
      fill('#ffffff', W, H); var u = W / 1080; frame(W, H, 40 * u, '#111827', 1.5 * u);
      ctx.fillStyle = '#0f766e'; ctx.fillRect(W / 2 - 50 * u, 78 * u, 100 * u, 4 * u); ctx.fillRect(W / 2 - 50 * u, H - 82 * u, 100 * u, 4 * u);
    } }
  };

  function wrap(text, font, maxW) {
    ctx.font = font; var out = [];
    String(text).split('\n').forEach(function (par) {
      var l = '';
      par.trim().split(/\s+/).forEach(function (w) { var t = l ? l + ' ' + w : w; if (l && ctx.measureText(t).width > maxW) { out.push(l); l = w; } else l = t; });
      out.push(l);
    });
    return out;
  }
  function vals() { var v = {}; F.forEach(function (k) { v[k] = $('f-' + k).value.trim(); }); return v; }
  function state() { return { theme: (d.querySelector('#themes [aria-pressed=true]') || {}).value || 'marigold', size: $('f-size').value, font: $('f-font').value }; }

  function draw() {
    pending = 0;
    var v = vals(), st = state(), T = THEMES[st.theme], sz = SIZES[st.size] || SIZES.po, W = sz[0], H = sz[1], fam = FONTS[st.font] || FONTS.serif;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    T.draw(W, H);
    var maxW = W * (1 - 2 * T.px), top = H * T.pt, avail = H * (1 - T.pt - T.pb), s = 1, blocks, total;
    function build() {
      var u = W / 1080 * s; blocks = []; total = 0;
      function add(text, size, style, color, gap, ls) {
        if (!text) return;
        var font = style + ' ' + Math.round(size * u) + 'px ' + fam, ls2 = wrap(text, font, maxW);
        blocks.push({ lines: ls2, font: font, lh: size * u * 1.34, color: color, gap: gap * u, ls: ls }); total += ls2.length * size * u * 1.34 + gap * u;
      }
      if (photo) { blocks.push({ photo: 300 * u, gap: 34 * u }); total += 334 * u; }
      add(/^[\x00-\x7f]*$/.test(v.top) ? v.top.toUpperCase() : v.top, 30, '600', T.acc, 22, 1);
      add(v.title, 76, 'bold', T.ink, 20);
      add(v.names, 62, 'italic bold', T.acc, 24);
      add(v.body, 37, 'normal', T.ink, 26);
      if (v.date || v.time || v.venue) { blocks.push({ rule: 1, gap: 30 * u }); total += 30 * u; }
      add(v.date, 44, 'bold', T.ink, 6);
      add(v.time, 38, '600', T.ink, 10);
      add(v.venue, 34, 'normal', T.soft, 26);
      add(v.foot, 28, 'normal', T.soft, 0);
    }
    build();
    while (total > avail && s > .42) { s -= .04; build(); }
    var y = top + Math.max(0, (avail - total) / 2), u = W / 1080 * s;
    blocks.forEach(function (b) {
      if (b.photo) {
        var r = b.photo / 2, cx = W / 2, cy = y + r, iw = photo.naturalWidth, ih = photo.naturalHeight, m = Math.min(iw, ih);
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.clip();
        ctx.drawImage(photo, (iw - m) / 2, (ih - m) / 2, m, m, cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
        ctx.strokeStyle = T.acc; ctx.lineWidth = 6 * u; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
        y += b.photo + b.gap; return;
      }
      if (b.rule) {
        ctx.strokeStyle = T.acc; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(W / 2 - 110 * u, y); ctx.lineTo(W / 2 - 16 * u, y); ctx.moveTo(W / 2 + 16 * u, y); ctx.lineTo(W / 2 + 110 * u, y); ctx.stroke();
        ctx.save(); ctx.translate(W / 2, y); ctx.rotate(.785); ctx.fillStyle = T.acc; ctx.fillRect(-6 * u, -6 * u, 12 * u, 12 * u); ctx.restore();
        y += b.gap; return;
      }
      ctx.font = b.font; ctx.fillStyle = b.color;
      if ('letterSpacing' in ctx) ctx.letterSpacing = b.ls ? Math.round(4 * u) + 'px' : '0px';
      b.lines.forEach(function (l) { y += b.lh; ctx.fillText(l, W / 2, y - b.lh * .26); });
      y += b.gap;
    });
    save();
  }
  function later() { if (!pending) pending = requestAnimationFrame(draw); }

  function save() {
    try { var o = vals(), st = state(); o._t = st.theme; o._s = st.size; o._f = st.font; localStorage.setItem('inv-card', JSON.stringify(o)); } catch (e) {}
  }
  function setTheme(id) { d.querySelectorAll('#themes button').forEach(function (b) { b.setAttribute('aria-pressed', b.value === id ? 'true' : 'false'); }); }
  function preset(id, lang) {
    var p = PRE[id]; if (!p) return;
    var t = p[lang] || p.en;
    $('f-top').value = t[0]; $('f-title').value = t[1]; $('f-body').value = t[2]; setTheme(p.th);
  }

  // build theme buttons
  var th = $('themes');
  Object.keys(THEMES).forEach(function (k) { var b = d.createElement('button'); b.type = 'button'; b.value = k; b.textContent = THEMES[k].name; b.setAttribute('aria-pressed', 'false'); th.appendChild(b); });
  th.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { setTheme(b.value); later(); } });

  // restore, then apply what the visitor came with
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('inv-card') || 'null'); } catch (e) {}
  if (saved) { F.forEach(function (k) { if (saved[k] != null) $('f-' + k).value = saved[k]; }); if (saved._s) $('f-size').value = saved._s; if (saved._f) $('f-font').value = saved._f; }
  setTheme(saved && THEMES[saved._t] ? saved._t : 'marigold');
  var q = new URLSearchParams(location.search), occ = q.get('o'), msg = null;
  try { msg = sessionStorage.getItem('inv-msg'); sessionStorage.removeItem('inv-msg'); } catch (e) {}
  if (occ && PRE[occ]) {
    $('f-occ').value = occ; preset(occ, /[ऀ-ॿ]/.test(msg || '') ? 'hi' : 'en');
    if (msg) { $('f-body').value = msg; ['names', 'date', 'time', 'venue'].forEach(function (k) { $('f-' + k).value = ''; }); }
  } else if (!saved) preset('wedding', 'en');

  $('f-occ').addEventListener('change', function () { preset(this.value, $('f-lang').value); later(); });
  $('f-lang').addEventListener('change', function () { preset($('f-occ').value, this.value); later(); });
  d.querySelector('.maker').addEventListener('input', later);
  $('f-photo').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    var im = new Image(); im.onload = function () { photo = im; $('rm-photo').hidden = false; later(); }; im.onerror = function () { SYG.toast('That picture could not be opened'); };
    im.src = URL.createObjectURL(f);
  });
  $('rm-photo').addEventListener('click', function () { photo = null; $('f-photo').value = ''; this.hidden = true; later(); });
  $('clear').addEventListener('click', function () { F.forEach(function (k) { $('f-' + k).value = ''; }); later(); });

  function blob(cb) { cv.toBlob(function (b) { cb(b); }, 'image/png'); }
  function download(b) { var a = d.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'invitation-card.png'; d.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); SYG.toast('Card saved to your downloads'); }
  $('dl').addEventListener('click', function () { blob(download); });
  $('sh').addEventListener('click', function () {
    blob(function (b) {
      var f = new File([b], 'invitation-card.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'Invitation' }).catch(function () {});
      else { download(b); SYG.toast('Saved. Now attach the picture in WhatsApp'); }
    });
  });

  draw();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(later);
  window.addEventListener('load', later);
})();
