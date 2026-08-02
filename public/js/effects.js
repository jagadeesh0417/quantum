(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  /* Floating glow orbs */
  const orbsContainer = document.createElement('div');
  orbsContainer.id = 'glow-orbs';
  orbsContainer.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.appendChild(orbsContainer);

  const orbColors = [
    'rgba(21,69,92,0.12)',
    'rgba(143,186,217,0.08)',
    'rgba(30,106,141,0.06)',
    'rgba(21,69,92,0.10)'
  ];

  for (let i = 0; i < 3; i++) {
    const orb = document.createElement('div');
    const size = 200 + Math.random() * 300;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = 20 + Math.random() * 15;
    const delay = Math.random() * -20;
    orb.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      left:${x}%;top:${y}%;
      background:radial-gradient(circle, ${orbColors[i]} 0%, transparent 70%);
      border-radius:50%;
      filter:blur(60px);
      transform:translate(-50%,-50%);
      animation: orbFloat${i} ${dur}s ${delay}s ease-in-out infinite alternate;
    `;
    orbsContainer.appendChild(orb);
  }

  const sheet = document.createElement('style');
  sheet.textContent = `
    @keyframes orbFloat0 {
      0% { transform: translate(-50%,-50%) translate(0,0) scale(1); }
      100% { transform: translate(-50%,-50%) translate(40px,-60px) scale(1.1); }
    }
    @keyframes orbFloat1 {
      0% { transform: translate(-50%,-50%) translate(0,0) scale(1); }
      100% { transform: translate(-50%,-50%) translate(-50px,30px) scale(1.15); }
    }
    @keyframes orbFloat2 {
      0% { transform: translate(-50%,-50%) translate(0,0) scale(1); }
      100% { transform: translate(-50%,-50%) translate(30px,50px) scale(0.95); }
    }
  `;
  document.head.appendChild(sheet);

  /* Idle float on stat badges, pricing badges, section-tags */
  const floatEls = document.querySelectorAll(
    '.pricing-badge, .section-tag, .stat-number'
  );
  floatEls.forEach((el, i) => {
    el.style.animation = `idleFloat ${2.5 + (i % 3) * 0.5}s ${i * 0.3}s ease-in-out infinite alternate`;
    el.style.willChange = 'transform';
  });

  if (!document.getElementById('idle-float-style')) {
    const floatSheet = document.createElement('style');
    floatSheet.id = 'idle-float-style';
    floatSheet.textContent = `
      @keyframes idleFloat {
        0% { transform: translateY(0); }
        100% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(floatSheet);
  }

  /* Scroll-driven parallax depth on hero layers */
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroBg = hero.querySelector('.hero-canvas-wrap');
    let ticking = false;
    document.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const progress = Math.max(0, Math.min(1, -rect.top / hero.offsetHeight));
          if (heroBg) heroBg.style.transform = `translateY(${progress * 30}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
