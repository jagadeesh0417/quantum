/* ==========================================================================
   The Campus (Resort Tour) — page scripts
   - Master plan expand overlay (open / close / escape / backdrop)
   ========================================================================== */
(function () {
  'use strict';

  var overlay = document.getElementById('map-overlay');
  var openBtn = document.getElementById('map-expand');
  var closeBtn = document.getElementById('map-overlay-close');

  if (!overlay || !openBtn || !closeBtn) return;

  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
