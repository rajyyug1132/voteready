// Shared behaviour for every page: theme toggle, offline cache, key vibration.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-label');

  function tr(en) {
    return (typeof currentLang !== 'undefined' && currentLang === 'hi' && typeof dictionary !== 'undefined' && dictionary[en]) ? dictionary[en] : en;
  }
  function syncLabel() {
    if (!label) return;
    // The label names the mode the button switches TO.
    var next = root.getAttribute('data-bs-theme') === 'dark' ? 'Light mode' : 'Dark mode';
    label.dataset.key = next;
    label.textContent = tr(next);
  }
  function setTheme(t) {
    root.setAttribute('data-bs-theme', t);
    try { localStorage.setItem('voteready_theme', t); } catch (_) { }
    syncLabel();
  }
  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && !reduce) {
        // A skipped or aborted cross-fade still applies the theme; swallow its rejections.
        var vt = document.startViewTransition(function () { setTheme(next); });
        vt.ready.catch(function () { }); vt.finished.catch(function () { });
      } else setTheme(next);
    });
    syncLabel();
    window.addEventListener('languageChanged', syncLabel);
  }
  // Follow the OS only while the user has not picked a theme themselves.
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('voteready_theme')) { root.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light'); syncLabel(); }
    });
  } catch (_) { }

  // Short buzz on primary actions and ballot keys (Android; ignored elsewhere).
  document.addEventListener('pointerdown', function (e) {
    if (!navigator.vibrate) return;
    var el = e.target.closest && e.target.closest('.btn-primary, .bu-key, .cu-ballot, .cl-input, .id-card');
    if (el && el.getAttribute('aria-disabled') !== 'true' && !el.disabled) navigator.vibrate(12);
  }, { passive: true });

  // Offline: cache the pages, data and assets after the first visit.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); });
  }
})();
