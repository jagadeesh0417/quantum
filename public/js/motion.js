/* Quantum Health Biotech Park — reveal + micro-interactions
   Re-runnable: rebinds on every page:load (persistent video navigation). */
(function () {
  'use strict';

  function initMotion() {
    const navLinks = document.querySelector('.nav-links');
    const toggle = document.querySelector('.mobile-toggle');

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
      document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
      });
    }

    const els = document.querySelectorAll('[data-reveal]');
    if (els.length) {
      /* Content must never stay hidden:
         - prefers-reduced-motion  -> reveal immediately (no animation)
         - IntersectionObserver unsupported -> reveal immediately
         - element already in/above viewport -> reveal immediately
         - otherwise hide and reveal on intersection. */
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const supportsIO = 'IntersectionObserver' in window;

      const reveal = (el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      };

      if (reduced || !supportsIO) {
        els.forEach(reveal);
      } else {
        const ro = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
              ro.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

        els.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            reveal(el);
          } else {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            ro.observe(el);
          }
        });

        /* Watchdog: if anything is still hidden after 6s (observer lost,
           layout shifts, edge cases), reveal it — never leave content invisible. */
        setTimeout(() => {
          els.forEach((el) => {
            if (el.style.opacity !== '1') reveal(el);
          });
        }, 6000);
      }
    }

    const accordions = document.querySelectorAll('.accordion-item');
    accordions.forEach((item) => {
      const header = item.querySelector('.accordion-header');
      if (header) {
        header.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          accordions.forEach((a) => a.classList.remove('active'));
          if (!isActive) item.classList.add('active');
        });
      }
    });

    document.querySelectorAll('.hero-stats .stat-number').forEach((el) => {
      const target = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
      if (!target) return;
      let current = 0;
      const step = Math.ceil(target / 60);
      const iv = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(iv); }
        el.textContent = current + (el.textContent.includes('+') ? '+' : '');
      }, 25);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
  document.addEventListener('page:load', initMotion);
})();
