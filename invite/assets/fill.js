/* Wording pages: type your details once, every card fills itself in; language chips; "Make a card" hands the text to the card maker. */
(function () {
  'use strict';
  var d = document, box = d.querySelector('[data-fill]'), cards = [].slice.call(d.querySelectorAll('[data-t]'));
  function text(c) {
    var m = {};
    if (box) box.querySelectorAll('input').forEach(function (i) { if (i.value.trim()) m[i.name] = i.value.trim(); });
    return c.getAttribute('data-t').replace(/\[([^\]]+)\]/g, function (a, k) { return m[k] || a; });
  }
  function upd() {
    cards.forEach(function (c) {
      var t = text(c); c.querySelector('p').textContent = t;
      var a = c.querySelector('[data-copy]'), w = c.querySelector('[data-wa]');
      if (a) a.setAttribute('data-copy', t); if (w) w.setAttribute('data-wa', t);
    });
  }
  if (box) {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('inv-fill') || '{}'); } catch (e) {}
    box.querySelectorAll('input').forEach(function (i) { if (saved[i.name]) i.value = saved[i.name]; });
    box.addEventListener('input', function () {
      box.querySelectorAll('input').forEach(function (i) { if (i.value.trim()) saved[i.name] = i.value.trim(); else delete saved[i.name]; });
      try { localStorage.setItem('inv-fill', JSON.stringify(saved)); } catch (e) {}
      upd();
    });
    var cl = box.querySelector('[data-clear]');
    if (cl) cl.addEventListener('click', function () { box.querySelectorAll('input').forEach(function (i) { i.value = ''; }); saved = {}; try { localStorage.removeItem('inv-fill'); } catch (e) {} upd(); });
    upd();
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-card]');
    if (b) { try { sessionStorage.setItem('inv-msg', text(b.closest('[data-t]'))); } catch (e2) {} location.href = '/invite/card-maker/?o=' + b.getAttribute('data-card'); return; }
    var l = e.target.closest('[data-lang-btn]');
    if (l) {
      var v = l.getAttribute('data-lang-btn');
      d.querySelectorAll('[data-lang-btn]').forEach(function (x) { x.setAttribute('aria-pressed', x === l ? 'true' : 'false'); });
      cards.forEach(function (c) { c.hidden = v !== 'all' && c.getAttribute('data-lang') !== v; });
    }
  });
  /* home page: filter the list of occasions */
  var q = d.getElementById('q');
  if (q) q.addEventListener('input', function () {
    var s = q.value.trim().toLowerCase(), n = 0;
    d.querySelectorAll('#occ li').forEach(function (li) { var hit = !s || li.textContent.toLowerCase().indexOf(s) > -1; li.hidden = !hit; if (hit) n++; });
    d.getElementById('none').hidden = n > 0;
  });
})();
