/* Wellness Experience — sticky stage navigation + progress
   Re-runnable: rebinds on every page:load (persistent video navigation). */
(function () {
  'use strict';

  function initWellness() {
    const cards = Array.from(document.querySelectorAll('.wl-card'));
    const railItems = Array.from(document.querySelectorAll('.wl-rail-item'));
    const fill = document.getElementById('wl-fill');
    if (!cards.length || !railItems.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setActive = (index) => {
      railItems.forEach((item, i) => item.classList.toggle('active', i === index));
      if (fill) {
        fill.style.width = (index / (cards.length - 1)) * 100 + '%';
      }
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(cards.indexOf(entry.target));
        }
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });

    cards.forEach((card) => io.observe(card));

    railItems.forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-target'), 10);
        const target = cards[index];
        if (!target) return;
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        setActive(index);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWellness);
  } else {
    initWellness();
  }
  document.addEventListener('page:load', initWellness);
})();
