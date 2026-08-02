(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const MAX_TILT = 7;

  const cards = document.querySelectorAll(
    '.flip-card, .programme-card, .pricing-card, .journey-step, .condition-item, .diff-item, .benefit-item'
  );

  cards.forEach((card) => {
    card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    card.style.transformStyle = 'preserve-3d';
    card.style.perspective = '800px';
    card.style.willChange = 'transform';

    let rafId = null;

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)';
    });

    card.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -MAX_TILT;
        const tiltY = (x - 0.5) * MAX_TILT;
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
})();
