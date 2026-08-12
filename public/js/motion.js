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
         - hiding is CSS-driven and only armed when JS + IntersectionObserver
           are available (@media reduced-motion / old engines default to visible)
         - elements already in/above the viewport are revealed immediately
         - watchdog reveals anything still hidden after 6s, even if the
           observer never fires (iframes, preview panes, layout shifts).
         If ANYTHING fails, the default state of the element is visible. */
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const supportsIO = 'IntersectionObserver' in window;

      if (reduced || !supportsIO) return;

      document.documentElement.classList.add('js-reveal');

      const reveal = (el) => el.classList.add('in-view');

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
          ro.observe(el);
        }
      });

      /* Watchdog: never leave content invisible. */
      setTimeout(() => {
        els.forEach((el) => {
          if (!el.classList.contains('in-view')) reveal(el);
        });
      }, 6000);
    }

    /* Accordion toggling is handled once in main.js (also binds .accordion-header
       on page:load); binding a second toggle here would immediately re-close
       every item (double handler). */

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
