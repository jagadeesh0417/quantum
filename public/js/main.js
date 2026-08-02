/* Quantum Health Biotech Park — site core interactions
   Re-runnable: rebinds on every page:load (persistent video navigation). */
(function () {
  'use strict';

  function initMain() {
    // Mobile nav toggle
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle) {
      toggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
      });
    }

    // Accordion
    document.querySelectorAll('.accordion-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var item = this.parentElement;
        var wasActive = item.classList.contains('active');
        var parent = item.closest('.accordion');
        if (parent) {
          parent.querySelectorAll('.accordion-item').forEach(function (el) {
            el.classList.remove('active');
          });
        }
        if (!wasActive) {
          item.classList.add('active');
        }
      });
    });

    // Team tabs
    document.querySelectorAll('.team-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var parent = this.closest('.team-tabs');
        parent.querySelectorAll('.team-tab').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        var target = this.getAttribute('data-target');
        parent.querySelectorAll('.team-panel').forEach(function (p) { p.classList.remove('active'); });
        var panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
  document.addEventListener('page:load', initMain);
})();
