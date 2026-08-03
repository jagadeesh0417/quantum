/* Quantum Health Biotech Park — hero video + page transitions
   Static-site adaptation of a "video in the root layout" pattern:
   - #banner-stage (video + overlay) is marked data-persist and is moved
     aside during content swaps, so the SAME <video> element survives
     navigation — playback never restarts.
   - Link clicks are intercepted and the page body is swapped via fetch;
     the video element is never touched.
   - Scripts listen for the 'page:load' event to rebind to the new DOM.
   - Legacy de/ and ar/ locales, external links and anchors do a full
     page load to keep their bespoke behaviour untouched. */
(function () {
  'use strict';

  /* ---- Hero video: autoplay + full-quality start ---- */
  const stage = document.getElementById('banner-stage');
  const video = stage ? stage.querySelector('video') : null;

  if (stage && video) {
    const start = () => video.play().catch(() => { /* retry on first interaction */ });
    /* Gradient heroes stay visible until the video can play: no black flash. */
    video.addEventListener('canplay', () => document.body.classList.add('video-active'));
    /* preload="auto" + faststart means the first frames arrive immediately;
       play() is (re)attempted as soon as data is available. */
    video.addEventListener('loadeddata', start);
    document.addEventListener('DOMContentLoaded', start);
    /* Autoplay blocked (some mobile/embedded browsers)? Resume on first tap. */
    const resume = () => { if (video.paused) start(); };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
  }

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
    const nextStage = doc.getElementById('banner-stage');
    if (nextStage) nextStage.remove();

    /* Preserve the video stage (data-persist) and JS-created fixed
       widgets across the swap so playback never restarts */
    const saved = persistEls();

    document.title = doc.title || document.title;
    const meta = document.querySelector('meta[name="description"]');
    const nextMeta = doc.querySelector('meta[name="description"]');
    if (meta && nextMeta) meta.setAttribute('content', nextMeta.getAttribute('content'));
    const canon = document.querySelector('link[rel="canonical"]');
    const nextCanon = doc.querySelector('link[rel="canonical"]');
    if (canon && nextCanon) canon.setAttribute('href', nextCanon.getAttribute('href'));

    document.body.innerHTML = doc.body.innerHTML;
    saved.forEach((el) => document.body.appendChild(el));

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
