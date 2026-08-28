/* Quantum Health Biotech Park — page transitions
   Static-site adaptation of a "video in the root layout" pattern:
   - Link clicks are intercepted and the page body is swapped via fetch;
     scroll position resets, scripts re-run on the new DOM.
   - Scripts listen for the 'page:load' event to rebind to the new DOM.
   - Legacy de/ and ar/ locales, external links and anchors do a full
     page load to keep their bespoke behaviour untouched. */
(function () {
  'use strict';

  /* ---- Navigation ---- */
  let fetching = false;

  const shouldSkip = (a) => {
    if (a.target === '_blank' || a.hasAttribute('download')) return true;
    const rel = a.getAttribute('rel') || '';
    if (rel.split(/\s+/).indexOf('external') !== -1) return true;
    const href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 ||
        href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return true;
    let url;
    try { url = new URL(href, location.href); } catch (e) { return true; }
    if (url.origin !== location.origin) return true;
    if (url.pathname.indexOf('/de/') !== -1 || url.pathname.indexOf('/ar/') !== -1) return true;
    return false;
  };

  const persistEls = () =>
    Array.from(document.querySelectorAll('[data-persist]')).map((el) => {
      el.parentNode.removeChild(el);
      return el;
    });

  const injectScripts = (doc) => {
    const loaded = new Set(Array.from(document.scripts).map((s) => s.src));
    doc.querySelectorAll('script[src]').forEach((s) => {
      const src = s.getAttribute('src');
      const abs = new URL(src, location.href).href;
      if (loaded.has(abs)) return;
      loaded.add(abs);
      const el = document.createElement('script');
      el.src = src;
      el.async = false;
      document.body.appendChild(el);
    });
  };

  const swap = (html, url, push) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    /* Preserve JS-created fixed widgets across the swap */
    const saved = persistEls();

    /* Preserve the sitewide hero video so it never restarts on navigation.
       Detaching keeps its currentTime (and paused state); we reattach + play
       it after the new body is in place. */
    const heroVideo = document.querySelector('.hero-video[data-sitewide-hero]');
    if (heroVideo && heroVideo.parentNode) heroVideo.parentNode.removeChild(heroVideo);

    document.title = doc.title || document.title;
    const meta = document.querySelector('meta[name="description"]');
    const nextMeta = doc.querySelector('meta[name="description"]');
    if (meta && nextMeta) meta.setAttribute('content', nextMeta.getAttribute('content'));
    const canon = document.querySelector('link[rel="canonical"]');
    const nextCanon = doc.querySelector('link[rel="canonical"]');
    if (canon && nextCanon) canon.setAttribute('href', nextCanon.getAttribute('href'));

    document.body.innerHTML = doc.body.innerHTML;
    saved.forEach((el) => document.body.appendChild(el));

    /* Reattach the preserved hero video into the new page's hero layer.
       This must happen before page:load so heroVideo() sees it and does not
       create a duplicate. Reusing the same element keeps currentTime, so the
       video continues instead of restarting from 0:00. */
    if (heroVideo) {
      const host = document.querySelector('#main > .hero-img') || document.getElementById('main');
      if (host && host !== heroVideo.parentNode) host.appendChild(heroVideo);
      if (heroVideo.paused) {
        const p = heroVideo.play();
        if (p && p.catch) p.catch(() => {});
      }
      const attempt = () => { const p = heroVideo.play(); if (p && p.catch) p.catch(() => {}); };
      heroVideo.addEventListener('canplay', attempt, { once: true });
    }

    const preloader = document.querySelector('.preloader');
    if (preloader) preloader.classList.add('done');

    if (push) history.pushState({ url }, '', url);
    window.scrollTo(0, 0);

    /* Re-init already-loaded scripts, then load page-specific ones
       (e.g. contact.js) which initialise themselves on execution. */
    document.dispatchEvent(new CustomEvent('page:load'));
    injectScripts(doc);

    const main = document.getElementById('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }

    /* Preserve deep links (e.g. therapies.html#therapy-01) after the swap */
    const hashPos = url.indexOf('#');
    if (hashPos !== -1) {
      const target = document.querySelector(url.slice(hashPos));
      if (target) target.scrollIntoView({ block: 'start' });
    }
  };

  const navigate = (url, push) => {
    if (fetching) return;
    fetching = true;
    fetch(url, { headers: { 'X-Requested-With': 'fetch' } })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
      .then((html) => swap(html, url, push))
      .catch(() => { window.location.href = url; }) /* graceful fallback: full load */
      .then(() => { fetching = false; });
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || shouldSkip(a)) return;
    const url = new URL(a.getAttribute('href'), location.href);

    /* Same-page links: never trigger a full reload (video must not restart);
       jump to the target section instead. */
    if (url.pathname === location.pathname) {
      e.preventDefault();
      if (url.hash) {
        const target = document.querySelector(url.hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    e.preventDefault();
    navigate(url.pathname + url.search + url.hash, true);
  });

  window.addEventListener('popstate', () => {
    navigate(location.pathname + location.search, false);
  });
})();
