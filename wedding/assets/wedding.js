/* Wedding: tick lists that remember, countdown from the wedding date, budget sheet, guest list. Everything stays in this browser. */
(function () {
  'use strict';
  var d = document, $ = function (id) { return d.getElementById(id); };
  function get(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function fmtDate(t) { return t.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function money(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  /* tick lists: <ul class="todo" data-list="key"> with <input type="checkbox" data-k="id"> */
  d.querySelectorAll('[data-list]').forEach(function (box) {
    var key = 'wed-' + box.getAttribute('data-list'), st = get(key, {}), bar = d.querySelector('[data-progress="' + box.getAttribute('data-list') + '"]');
    var all = box.querySelectorAll('input[type=checkbox]');
    function upd() { var n = 0; all.forEach(function (c) { if (c.checked) n++; }); if (bar) bar.textContent = n + ' of ' + all.length + ' done'; }
    all.forEach(function (c) { c.checked = !!st[c.getAttribute('data-k')]; });
    box.addEventListener('change', function (e) { var c = e.target; if (c.type !== 'checkbox') return; if (c.checked) st[c.getAttribute('data-k')] = 1; else delete st[c.getAttribute('data-k')]; set(key, st); upd(); });
    var rs = d.querySelector('[data-reset="' + box.getAttribute('data-list') + '"]');
    if (rs) rs.addEventListener('click', function () { st = {}; set(key, st); all.forEach(function (c) { c.checked = false; }); upd(); });
    upd();
  });

  /* wedding date: days left, and a date for every phase heading [data-before="months"] */
  var wd = $('w-date');
  if (wd) {
    var saved = get('wed-date', '');
    if (saved) wd.value = saved;
    var run = function () {
      var out = $('w-left'), v = wd.value;
      set('wed-date', v);
      d.querySelectorAll('[data-before]').forEach(function (h) { var s = h.querySelector('.due'); if (s) s.textContent = ''; h.classList.remove('now'); });
      if (!v) { if (out) out.textContent = 'Choose the date to see how many days are left and when each stage begins.'; return; }
      var day = new Date(v + 'T00:00:00'), today = new Date(); today.setHours(0, 0, 0, 0);
      var left = Math.round((day - today) / 864e5);
      if (out) out.textContent = left > 1 ? left + ' days to go. Wedding day: ' + fmtDate(day) + '.' : left === 1 ? 'Tomorrow is the day!' : left === 0 ? 'Today is the day. Congratulations!' : 'The wedding was on ' + fmtDate(day) + '. Congratulations! See the "After the wedding" list.';
      var hs = [].slice.call(d.querySelectorAll('[data-before]')), cur = null;
      hs.forEach(function (h) {
        var m = parseFloat(h.getAttribute('data-before')), s = h.querySelector('.due'), t = new Date(day);
        if (m > 0) { t.setDate(t.getDate() - Math.round(m * 30.44)); if (s) s.textContent = m >= 1 ? 'finish by ' + fmtDate(t) : 'from ' + fmtDate(t); if (t >= today && !cur) cur = h; }
        else if (m === 0 && left >= 0 && !cur) cur = h; else if (m < 0 && left < 0 && !cur) cur = h;
      });
      if (cur) { cur.classList.add('now'); var s2 = cur.querySelector('.due'); if (s2) s2.textContent += (s2.textContent ? ' · ' : '') + 'you are here'; }
    };
    wd.addEventListener('change', run); wd.addEventListener('input', run); run();
  }

  /* budget sheet */
  var bt = $('b-rows');
  if (bt) {
    var HEADS = ['Venue', 'Food and catering', 'Decoration and flowers', 'Photography and video', 'Bride\'s outfits and jewellery', 'Groom\'s outfits', 'Makeup, hair and mehndi', 'Music, DJ, band, dhol', 'Invitations', 'Gifts for family and guests', 'Rituals and priest', 'Transport', 'Stay for guests', 'Honeymoon', 'Other'];
    var rows = get('wed-budget', null) || HEADS.map(function (h) { return { h: h, p: '', a: '' }; });
    var num = function (v) { var n = parseFloat(String(v).replace(/,/g, '')); return isFinite(n) ? n : 0; };
    var total = function () {
      var P = 0, A = 0; rows.forEach(function (r) { P += num(r.p); A += num(r.a); });
      var lim = num($('b-total').value), g = num($('b-guests').value), o = $('b-out');
      var html = '<dl class="facts"><dt>Planned</dt><dd>' + money(P) + '</dd><dt>Spent so far</dt><dd>' + money(A) + '</dd>';
      if (lim) html += '<dt>Budget</dt><dd>' + money(lim) + '</dd><dt>' + (lim - P >= 0 ? 'Still unplanned' : 'Planned over budget by') + '</dd><dd' + (lim - P < 0 ? ' class="bad"' : '') + '>' + money(Math.abs(lim - P)) + '</dd>';
      if (g && P) html += '<dt>Planned cost per guest</dt><dd>' + money(P / g) + '</dd>';
      o.innerHTML = html + '</dl>';
      set('wed-budget', rows); set('wed-budget-x', { t: $('b-total').value, g: $('b-guests').value });
    };
    var draw = function () {
      bt.innerHTML = rows.map(function (r, i) {
        return '<tr><td data-l="Head"><input type="text" value="' + SYG.esc(r.h) + '" data-i="' + i + '" data-f="h" aria-label="Head"></td><td data-l="Planned (₹)"><input type="text" inputmode="numeric" value="' + SYG.esc(r.p) + '" data-i="' + i + '" data-f="p" aria-label="Planned amount"></td>' +
          '<td data-l="Spent (₹)"><input type="text" inputmode="numeric" value="' + SYG.esc(r.a) + '" data-i="' + i + '" data-f="a" aria-label="Spent amount"></td><td><button class="btn sm ghost" type="button" data-del="' + i + '" aria-label="Remove ' + SYG.esc(r.h) + '">Remove</button></td></tr>';
      }).join('');
      total();
    };
    var x = get('wed-budget-x', {}); $('b-total').value = x.t || ''; $('b-guests').value = x.g || '';
    bt.addEventListener('input', function (e) { var t = e.target; if (t.hasAttribute('data-i')) { rows[+t.getAttribute('data-i')][t.getAttribute('data-f')] = t.value; total(); } });
    bt.addEventListener('click', function (e) { var b = e.target.closest('[data-del]'); if (b) { rows.splice(+b.getAttribute('data-del'), 1); draw(); } });
    $('b-add').addEventListener('click', function () { rows.push({ h: 'New head', p: '', a: '' }); draw(); var ins = bt.querySelectorAll('input[data-f=h]'); ins[ins.length - 1].select(); });
    $('b-total').addEventListener('input', total); $('b-guests').addEventListener('input', total);
    $('b-reset').addEventListener('click', function () { rows = HEADS.map(function (h) { return { h: h, p: '', a: '' }; }); $('b-total').value = ''; $('b-guests').value = ''; draw(); });
    $('b-print').addEventListener('click', function () { window.print(); });
    draw();
  }

  /* guest list */
  var gt = $('g-rows');
  if (gt) {
    var list = get('wed-guests', []);
    var drawG = function () {
      var inv = 0, yes = 0, side = {};
      gt.innerHTML = list.map(function (g, i) {
        inv += g.n; if (g.c) yes += g.n; side[g.s] = (side[g.s] || 0) + g.n;
        return '<tr><td data-l="Name">' + SYG.esc(g.name) + '</td><td data-l="Side">' + SYG.esc(g.s) + '</td><td data-l="People">' + g.n + '</td>' +
          '<td data-l="Coming"><label class="ck"><input type="checkbox" data-c="' + i + '"' + (g.c ? ' checked' : '') + '> Confirmed</label></td><td><button class="btn sm ghost" type="button" data-del="' + i + '">Remove</button></td></tr>';
      }).join('') || '<tr><td colspan="5">No guests yet. Add the first family above.</td></tr>';
      $('g-out').innerHTML = '<dl class="facts"><dt>Families or entries</dt><dd>' + list.length + '</dd><dt>People invited</dt><dd>' + inv + '</dd><dt>Confirmed</dt><dd>' + yes + '</dd>' +
        Object.keys(side).map(function (k) { return '<dt>' + SYG.esc(k) + '</dt><dd>' + side[k] + '</dd>'; }).join('') + '</dl>';
      set('wed-guests', list);
    };
    $('g-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('g-name').value.trim(), n = Math.max(1, parseInt($('g-n').value, 10) || 1);
      if (!name) { SYG.toast('Type a name first'); return; }
      list.push({ name: name, s: $('g-side').value, n: n, c: 0 }); $('g-name').value = ''; $('g-n').value = '2'; $('g-name').focus(); drawG();
    });
    gt.addEventListener('click', function (e) { var b = e.target.closest('[data-del]'); if (b) { list.splice(+b.getAttribute('data-del'), 1); drawG(); } });
    gt.addEventListener('change', function (e) { var c = e.target; if (c.hasAttribute('data-c')) { list[+c.getAttribute('data-c')].c = c.checked ? 1 : 0; drawG(); } });
    var text = function (sep) { return ['Name', 'Side', 'People', 'Confirmed'].join(sep) + '\n' + list.map(function (g) { return [sep === ',' ? '"' + g.name.replace(/"/g, '""') + '"' : g.name, g.s, g.n, g.c ? 'Yes' : 'No'].join(sep); }).join('\n'); };
    $('g-copy').addEventListener('click', function () { if (!list.length) { SYG.toast('The list is empty'); return; } SYG.copy(text('\t'), 'List copied. Paste it into a sheet or a chat'); });
    $('g-csv').addEventListener('click', function () {
      if (!list.length) { SYG.toast('The list is empty'); return; }
      var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + text(',')], { type: 'text/csv' })); a.download = 'wedding-guest-list.csv'; d.body.appendChild(a); a.click(); a.remove();
    });
    $('g-clear').addEventListener('click', function () { if (list.length && window.confirm('Remove every guest from the list?')) { list = []; drawG(); } });
    drawG();
  }
  d.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
})();
