/* Awards & Ecosystem interactions — recognition showcase + connected network.
   Progressive enhancement only: everything degrades gracefully without JS. */
(function () {
  'use strict';

  var awards = document.getElementById('award-list');
  var feat = document.getElementById('award-featured');
  if (awards && feat) {
    var ft = feat.querySelector('#award-featured-title');
    var fd = feat.querySelector('#award-featured-desc');
    var fy = feat.querySelector('#award-featured-year');
    var items = Array.prototype.slice.call(awards.children);
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function activate(idx, instant) {
      var target = items[idx];
      if (!target) return;
      items.forEach(function (it, i) {
        var on = i === idx;
        it.classList.toggle('is-active', on);
        it.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (reduced || instant) {
        ft.textContent = target.querySelector('h4').textContent;
        fd.textContent = target.querySelector('p').textContent;
        fy.textContent = target.querySelector('.award-item-year').textContent;
      } else {
        feat.classList.add('is-switching');
        window.setTimeout(function () {
          ft.textContent = target.querySelector('h4').textContent;
          fd.textContent = target.querySelector('p').textContent;
          fy.textContent = target.querySelector('.award-item-year').textContent;
          feat.classList.remove('is-switching');
        }, 260);
      }
    }

    items.forEach(function (it, i) {
      it.addEventListener('click', function () { activate(i); });
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(i);
        }
      });
    });
  }

  var map = document.getElementById('eco-map');
  if (map) {
    var nodes = map.querySelectorAll('.eco-node');
    var lines = map.querySelectorAll('.eco-line');
    var core = map.querySelector('.eco-core');

    function link(eco, on) {
      map.classList.toggle('is-hovering', on && !!eco);
      nodes.forEach(function (n) {
        n.classList.toggle('is-dimmed', on && n.getAttribute('data-eco') !== eco);
      });
      lines.forEach(function (l) {
        l.classList.toggle('is-linked', on && l.classList.contains('eco-line-' + eco));
      });
    }

    nodes.forEach(function (n) {
      var eco = n.getAttribute('data-eco');
      n.addEventListener('mouseenter', function () { link(eco, true); });
      n.addEventListener('mouseleave', function () { link(null, false); });
      n.addEventListener('focus', function () { link(eco, true); });
      n.addEventListener('blur', function () { link(null, false); });
    });
    if (core) {
      core.addEventListener('mouseenter', function () { link(null, false); });
    }
    map.addEventListener('mouseleave', function () { link(null, false); });
  }
})();
