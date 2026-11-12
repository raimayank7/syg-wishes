/* Gift Ideas: finder (person, occasion, level, kind), a shortlist kept in the browser, and a name drawer for gift exchanges. */
(function () {
  'use strict';
  var d = document, $ = function (id) { return d.getElementById(id); };
  function get(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* filter the idea cards on this page */
  var cards = [].slice.call(d.querySelectorAll('#ideas > li'));
  var fp = $('f-person'), fo = $('f-occ'), fl = $('f-level'), fk = $('f-kind'), q = $('q');
  function run() {
    var n = 0, s = q ? q.value.trim().toLowerCase() : '';
    cards.forEach(function (c) {
      var hit = (!fp || !fp.value || (' ' + c.getAttribute('data-p') + ' ').indexOf(' ' + fp.value + ' ') > -1) && (!fo || !fo.value || (' ' + c.getAttribute('data-o') + ' ').indexOf(' ' + fo.value + ' ') > -1) &&
        (!fl || !fl.value || c.getAttribute('data-l') === fl.value) && (!fk || !fk.value || c.getAttribute('data-k') === fk.value) && (!s || c.textContent.toLowerCase().indexOf(s) > -1);
      c.hidden = !hit; if (hit) n++;
    });
    var cnt = $('count'); if (cnt) cnt.textContent = n + (n === 1 ? ' idea' : ' ideas');
    var none = $('none'); if (none) none.hidden = n > 0;
  }
  if (cards.length) { [fp, fo, fl, fk].forEach(function (e) { if (e) e.addEventListener('change', run); }); if (q) q.addEventListener('input', run); run(); }

  /* shortlist */
  var list = get('gift-list', []);
  function mark() { d.querySelectorAll('[data-save]').forEach(function (b) { var on = list.indexOf(b.getAttribute('data-save')) > -1; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = on ? 'Saved ✓' : 'Save'; }); draw(); }
  function draw() {
    var box = $('shortlist'); if (!box) return;
    box.innerHTML = list.length ? '<ol>' + list.map(function (t, i) { return '<li>' + SYG.esc(t) + ' <button class="btn sm ghost" type="button" data-rm="' + i + '">Remove</button></li>'; }).join('') + '</ol>' +
      '<div class="acts"><button class="btn sm" type="button" data-copy="' + SYG.esc('Gift ideas:\n' + list.map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n')) + '">Copy list</button>' +
      '<button class="btn sm ghost" type="button" data-wa="' + SYG.esc('Gift ideas:\n' + list.map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n')) + '">WhatsApp</button><button class="btn sm ghost" type="button" data-clear>Clear</button></div>'
      : '<p class="hint">Nothing saved yet. Tap Save on any idea and it appears here, on this device only.</p>';
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-save],[data-rm],[data-clear]'); if (!b) return;
    if (b.hasAttribute('data-save')) { var t = b.getAttribute('data-save'), i = list.indexOf(t); if (i > -1) list.splice(i, 1); else list.push(t); }
    else if (b.hasAttribute('data-rm')) list.splice(+b.getAttribute('data-rm'), 1); else list = [];
    set('gift-list', list); mark();
  });
  mark();

  /* name drawer for Secret Santa and other gift exchanges */
  var ss = $('ss-names');
  if (ss) {
    var pairs = [], at = 0, stage = $('ss-stage');
    var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var show = function () {
      if (at >= pairs.length) { stage.innerHTML = '<h2>All done</h2><p>Everyone has a name. Nobody, including this phone, shows the full list again. Happy gifting!</p><button class="btn ghost" type="button" id="ss-again">Start a new draw</button>'; $('ss-again').onclick = function () { stage.hidden = true; $('ss-form').hidden = false; }; return; }
      var p = pairs[at];
      stage.innerHTML = '<h2>Pass the phone to ' + SYG.esc(p[0]) + '</h2><p>Only ' + SYG.esc(p[0]) + ' should look at the screen now. (' + (at + 1) + ' of ' + pairs.length + ')</p><button class="btn" type="button" id="ss-show">I am ' + SYG.esc(p[0]) + ', show my name</button>';
      $('ss-show').onclick = function () {
        stage.innerHTML = '<h2>' + SYG.esc(p[0]) + ', you give a gift to</h2><p class="big">' + SYG.esc(p[1]) + '</p><p>Remember the name, then tap the button before you pass the phone on.</p><button class="btn" type="button" id="ss-next">Hide and continue</button>';
        $('ss-next').onclick = function () { at++; show(); };
      };
    };
    $('ss-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var names = ss.value.split(/[\n,]+/).map(function (x) { return x.trim(); }).filter(Boolean), seen = {}, dup = null;
      names.forEach(function (n) { var k = n.toLowerCase(); if (seen[k]) dup = n; seen[k] = 1; });
      if (names.length < 3) { SYG.toast('Add at least three names'); return; }
      if (dup) { SYG.toast('"' + dup + '" appears twice. Add a surname or initial'); return; }
      var order = shuffle(names.slice());   // one circle: each person gives to the next, so nobody draws themselves
      pairs = order.map(function (n, i) { return [n, order[(i + 1) % order.length]]; });
      pairs = names.map(function (n) { return pairs.filter(function (p) { return p[0] === n; })[0]; });   // reveal in the order typed
      at = 0; $('ss-form').hidden = true; stage.hidden = false; show();
    });
  }
})();
