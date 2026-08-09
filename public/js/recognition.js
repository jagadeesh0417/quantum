/* Ecosystem network interactions — connected map.
   Progressive enhancement only: everything degrades gracefully without JS. */
(function () {
  'use strict';

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
