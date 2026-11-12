/* speeches: copy / listen / WhatsApp / print for each block, home filter, speech timer */
(function () {
  'use strict';
  var d = document, SYG = window.SYG, speaking = null;
  function textOf(sec) {
    var parts = [];
    sec.querySelectorAll('.sp-text p, .sc-part').forEach(function (p) {
      if (p.classList.contains('sc-part')) parts.push(p.querySelector('h3').textContent.toUpperCase() + '\n' + p.querySelector('p').textContent);
      else parts.push(p.textContent.trim());
    });
    return parts.join('\n\n');
  }
  function stop() { if (window.speechSynthesis) speechSynthesis.cancel(); if (speaking) { speaking.textContent = 'Listen'; speaking = null; } }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sp]'); if (!b) return;
    var sec = b.closest('.sp'), act = b.getAttribute('data-sp'), t = textOf(sec);
    if (act === 'copy') SYG.copy(t, 'Copied');
    else if (act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(t + '\n\n' + location.href.split('#')[0]), '_blank', 'noopener');
    else if (act === 'print') window.print();
    else if (act === 'say') {
      if (!window.speechSynthesis) { SYG.toast('This browser cannot read aloud'); return; }
      if (speaking === b) { stop(); return; }
      stop();
      var lang = b.getAttribute('data-lang') || 'en-IN', u = new SpeechSynthesisUtterance(t.replace(/\[[^\]]*\]/g, ' blank '));
      var v = speechSynthesis.getVoices().filter(function (x) { return x.lang.replace('_', '-').toLowerCase().indexOf(lang.slice(0, 2)) === 0; });
      var best = v.filter(function (x) { return /IN/i.test(x.lang); })[0] || v[0];
      if (lang.slice(0, 2) === 'hi' && !best) { SYG.toast('No Hindi voice on this device'); return; }
      if (best) u.voice = best;
      u.lang = lang; u.rate = 0.85;
      u.onend = u.onerror = function () { if (speaking === b) { b.textContent = 'Listen'; speaking = null; } };
      speaking = b; b.textContent = 'Stop'; speechSynthesis.speak(u);
    }
  });
  window.addEventListener('pagehide', stop);
  if (window.speechSynthesis) speechSynthesis.getVoices();

  var q = d.querySelector('[data-filter]');
  if (q) {
    var items = d.querySelectorAll('[data-list] li'), none = d.querySelector('[data-none]');
    q.addEventListener('input', function () {
      var w = q.value.toLowerCase().split(/\s+/).filter(Boolean), n = 0;
      items.forEach(function (li) { var s = (li.getAttribute('data-q') || li.textContent).toLowerCase(), ok = w.every(function (x) { return s.indexOf(x) > -1; }); li.hidden = !ok; if (ok) n++; });
      d.querySelectorAll('[data-list]').forEach(function (ul) { var h = ul.previousElementSibling; if (h && h.tagName === 'H2') h.hidden = !ul.querySelector('li:not([hidden])'); });
      if (none) none.hidden = n > 0;
    });
  }

  /* speech timer: words -> minutes at three paces, and a stopwatch for practice */
  var ta = d.querySelector('[data-draft]');
  if (ta) {
    var out = function (k, v) { d.querySelector('[data-o="' + k + '"]').textContent = v; };
    var fmt = function (min) { var s = Math.round(min * 60); return Math.floor(s / 60) + ' min ' + (s % 60 < 10 ? '0' : '') + (s % 60) + ' s'; };
    var calc = function () {
      var words = (ta.value.match(/[^\s]+/g) || []).length;
      out('w', words); out('slow', words ? fmt(words / 110) : '0'); out('mid', words ? fmt(words / 130) : '0'); out('fast', words ? fmt(words / 150) : '0');
      try { localStorage.setItem('speech-draft', ta.value); } catch (e) {}
    };
    try { ta.value = localStorage.getItem('speech-draft') || ''; } catch (e) {}
    ta.addEventListener('input', calc); calc();
    d.querySelector('[data-clear]').addEventListener('click', function () { ta.value = ''; calc(); ta.focus(); });
    var need = d.querySelector('[data-need]'), nout = d.querySelector('[data-need-out]');
    var nc = function () { var m = parseFloat(need.value) || 0; nout.textContent = m ? 'About ' + Math.round(m * 120) + ' to ' + Math.round(m * 135) + ' words' : ''; };
    need.addEventListener('input', nc); nc();
    var clock = d.querySelector('.clock'), t0 = 0, run = null, sb = d.querySelector('[data-sw]');
    sb.addEventListener('click', function () {
      if (run) { clearInterval(run); run = null; sb.textContent = 'Start again'; return; }
      t0 = Date.now(); sb.textContent = 'Stop';
      run = setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); clock.textContent = Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }, 250);
    });
  }
})();
