/* words to send: copy, WhatsApp, save in this browser, filter a page, search the whole site */
(function () {
  'use strict';
  var d = document, S = window.SYG, KEY = 'syg-saved-messages';
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function put(l) { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 300))); } catch (e) {} }
  function textOf(card) { return [].map.call(card.querySelectorAll('[data-t]'), function (x) { return x.textContent; }).join('\n'); }
  function mark(scope) {
    var have = {}; saved().forEach(function (x) { have[x.t] = 1; });
    [].forEach.call((scope || d).querySelectorAll('.card'), function (c) {
      var b = c.querySelector('[data-s]'); if (!b) return;
      var on = !!have[textOf(c)]; b.setAttribute('aria-pressed', on); b.textContent = on ? 'Saved' : 'Save';
    });
  }
  var ACTS = '<div class="acts"><button class="btn sm" type="button" data-c>Copy</button><button class="btn sm ghost" type="button" data-w>WhatsApp</button><button class="btn sm ghost" type="button" data-s aria-pressed="false">Save</button></div>';
  function lang(t) { return /[\u0900-\u097f]/.test(t) ? 'hi' : /[\u0a00-\u0a7f]/.test(t) ? 'pa' : ''; }
  function cardHtml(t, by, note, from) {
    var l = lang(t);
    return '<li class="card"><p data-t' + (l ? ' lang="' + l + '"' : '') + '>' + S.esc(t) + '</p>' + (note ? '<p class="mean" data-t>' + S.esc(note) + '</p>' : '') +
      (by ? '<cite data-t>' + S.esc(by) + '</cite>' : '') + (from ? '<a class="from" href="' + S.esc(from[0]) + '">' + S.esc(from[1]) + '</a>' : '') + ACTS + '</li>';
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-c],[data-w],[data-s]');
    if (!b) return;
    var c = b.closest('.card'); if (!c) return;
    var t = textOf(c);
    if (b.hasAttribute('data-c')) S.copy(t, 'Copied. Paste it anywhere.');
    else if (b.hasAttribute('data-w')) window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener');
    else {
      var l = saved(), had = l.some(function (x) { return x.t === t; });
      l = l.filter(function (x) { return x.t !== t; });
      if (!had) l.unshift({ t: t, u: location.pathname });
      put(l); S.toast(had ? 'Removed from Saved' : 'Saved on this device');
      if (d.getElementById('saved')) showSaved(); else mark();
    }
  });

  /* filter the cards of one page: words typed, language, group */
  var list = d.querySelector('[data-list]');
  if (list) {
    var q = d.getElementById('q'), cards = [].slice.call(list.querySelectorAll('.card')), fl = '', fg = '';
    cards.forEach(function (c) { c._t = textOf(c).toLowerCase(); });
    var run = function () {
      var w = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), n = 0;
      cards.forEach(function (c) {
        var ok = (!fl || c.getAttribute('data-l') === fl) && (!fg || c.getAttribute('data-g') === fg) && w.every(function (x) { return c._t.indexOf(x) > -1; });
        c.hidden = !ok; if (ok) n++;
      });
      [].forEach.call(list.querySelectorAll('[data-sec]'), function (s) { s.hidden = !s.querySelector('.card:not([hidden])'); });
      d.getElementById('none').hidden = n > 0;
      d.getElementById('count').textContent = (w.length || fl || fg) ? 'Showing ' + n + ' of ' + cards.length : '';
    };
    q.addEventListener('input', run);
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fl],[data-fg]'); if (!b) return;
      var k = b.hasAttribute('data-fl') ? 'data-fl' : 'data-fg';
      [].forEach.call(list.querySelectorAll('[' + k + ']'), function (x) { x.setAttribute('aria-pressed', x === b); });
      if (k === 'data-fl') fl = b.getAttribute(k); else fg = b.getAttribute(k);
      run();
    });
    var sel = list.querySelector('[data-fgs]');
    if (sel) sel.addEventListener('change', function () { fg = sel.value; run(); });
    mark();
  }

  /* the Saved page */
  function showSaved() {
    var box = d.getElementById('saved'), l = saved();
    box.innerHTML = l.map(function (x) {
      var l2 = lang(x.t);
      return '<li class="card"><p data-t' + (l2 ? ' lang="' + l2 + '"' : '') + '>' + S.esc(x.t) + '</p>' + ACTS + '</li>';
    }).join('');
    d.getElementById('nosaved').hidden = l.length > 0;
    [].forEach.call(box.querySelectorAll('[data-s]'), function (b) { b.setAttribute('aria-pressed', 'true'); b.textContent = 'Remove'; });
  }
  if (d.getElementById('saved')) showSaved();

  /* home: search everything, or show one at random */
  var gq = d.getElementById('gq');
  if (gq) {
    var all = null, wait = null, gr = d.getElementById('gr'), gc = d.getElementById('gcount');
    var get = function () { return wait || (wait = S.json('/messages/data/all.json').then(function (j) { all = j; all.items.forEach(function (x) { x[4] = (x[0] + ' ' + x[2] + ' ' + x[3] + ' ' + x[4] + ' ' + j.cats[x[1]][1]).toLowerCase(); }); return j; })); };
    var from = function (x) { return ['/messages/' + all.cats[x[1]][0] + '/', all.cats[x[1]][1]]; };
    var tm;
    var find = function () {
      var w = gq.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (!w.length) { gr.innerHTML = ''; gc.textContent = ''; return; }
      get().then(function () {
        var hit = all.items.filter(function (x) { return w.every(function (y) { return x[4].indexOf(y) > -1; }); });
        gc.textContent = hit.length ? hit.length + ' found' + (hit.length > 40 ? ', showing the first 40. Add a word to narrow it.' : '') : 'Nothing found. Try one simple word, or choose a page from the list below.';
        gr.innerHTML = hit.slice(0, 40).map(function (x) { return cardHtml(x[0], x[2], x[3], from(x)); }).join('');
        mark(gr);
      }).catch(function () { gc.textContent = 'Could not load the list. Check your connection and try again.'; });
    };
    gq.addEventListener('focus', function () { get().catch(function () { wait = null; }); });
    gq.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(find, 160); });
    d.getElementById('rnd').addEventListener('click', function () {
      get().then(function () {
        var x = all.items[Math.floor(Math.random() * all.items.length)];
        gq.value = ''; gc.textContent = 'One at random. Tap again for another.';
        gr.innerHTML = cardHtml(x[0], x[2], x[3], from(x)).replace('class="card"', 'class="card pick"');
        mark(gr);
      }).catch(function () { wait = null; gc.textContent = 'Could not load the list. Check your connection and try again.'; });
    });
  }
})();
