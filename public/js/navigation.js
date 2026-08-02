/* Quantum Health Biotech Park — persistent video banner + page transitions
   Static-site adaptation of a "video in the root layout" pattern:
   - #banner-stage (video + overlay) is marked data-persist and is moved
     aside during content swaps, so the SAME <video> element survives
     navigation — playback position is preserved, nothing reloads.
   - Link clicks are intercepted and the page body is swapped via fetch;
     the video element is never touched, so there is no restart/flicker.
   - Scripts listen for the 'page:load' event to rebind to the new DOM.
   - Legacy de/ and ar/ locales, external links and anchors do a full
     page load to keep their bespoke behaviour untouched. */
(function () {
  'use strict';

  /* ---- Persistent banner state ---- */
  const stage = document.getElementById('banner-stage');
  const video = stage ? stage.querySelector('video') : null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stage && video && !reducedMotion) {
    /* Gradient heroes stay visible until the video can play: no black flash,
       and a graceful poster/gradient fallback if autoplay is blocked. */
    video.addEventListener('canplay', () => document.body.classList.add('video-active'));
    video.addEventListener('error', () => stage.remove());
    video.play().catch(() => { /* autoplay blocked: poster + gradients remain */ });
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

    /* Preserve the banner stage (and JS-created fixed widgets) across the swap */
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
