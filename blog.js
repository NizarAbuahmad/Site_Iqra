/**
 * Blog post interactions: tab switching, category filter, search, copy.
 *
 * Every card is already in the HTML (tools-build-blog.mjs renders them) — this
 * only hides and shows what is there, so the page is complete for a crawler
 * and for anyone whose JS never loads. Nothing here fetches.
 */
(function () {
  var sets = [].slice.call(document.querySelectorAll('.pset'));
  if (!sets.length) return;

  // ── tabs ──────────────────────────────────────────────────────────────────
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      sets.forEach(function (set) {
        set.hidden = set.id !== tab.getAttribute('aria-controls');
      });
    });
  });

  // ── filter + search, per set ──────────────────────────────────────────────
  sets.forEach(function (set) {
    var cards = [].slice.call(set.querySelectorAll('.pc'));
    var chips = [].slice.call(set.querySelectorAll('.chip'));
    var input = set.querySelector('.search input');
    var count = set.querySelector('.count');
    var empty = set.querySelector('.empty');
    var total = cards.length;
    var cat = '';

    // Search is diacritic- and alif-insensitive: a teacher types «الاملاء»
    // for «الإملاء» and expects the same card back. Same normalisation the
    // curriculum search uses.
    function norm(s) {
      return s
        .replace(/[ً-ٰٟـ]/g, '')
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .toLowerCase()
        .trim();
    }

    function apply() {
      var q = norm(input ? input.value : '');
      // «الإملاء» must find «إملاء». Arabic search without this returns nothing
      // for the most natural way to type a noun, and the miss looks like the
      // card does not exist.
      var qBare = q.replace(/^ال/, '');
      var shown = 0;
      cards.forEach(function (c) {
        var okCat = !cat || c.getAttribute('data-cat') === cat;
        var hay = norm(c.getAttribute('data-find') || '');
        var okQ = !q || hay.indexOf(q) > -1 || (qBare !== q && hay.indexOf(qBare) > -1);
        var show = okCat && okQ;
        c.hidden = !show;
        if (show) shown++;
      });
      if (count) count.innerHTML = 'عرض <b>' + shown + '</b> من ' + total + ' أمر';
      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        cat = chip.getAttribute('data-cat') || '';
        chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        apply();
      });
    });

    if (input) {
      input.addEventListener('input', apply);
      // A search box that keeps its text across a reload confuses more than it
      // helps when the page is a reference list.
      input.value = '';
    }
  });

  // ── copy ──────────────────────────────────────────────────────────────────
  var revert;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.pc-copy') : null;
    if (!btn) return;

    var text = btn.getAttribute('data-copy') || '';
    var done = function () {
      var was = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', was);
      btn.textContent = 'تم النسخ';
      btn.classList.add('is-done');
      clearTimeout(revert);
      revert = setTimeout(function () {
        btn.textContent = btn.getAttribute('data-label');
        btn.classList.remove('is-done');
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }

    // Older Android browsers, and any context where the clipboard API is
    // blocked, still need to come away with the text.
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* nothing to offer */ }
      document.body.removeChild(ta);
    }
  });
})();
