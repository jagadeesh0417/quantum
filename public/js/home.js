/* Quantum Health Biotech Park — site-wide interactions
   Re-runnable pattern: initPage() runs on first load AND after every
   pjax navigation (page:load), so form handlers, carousels and accordions
   rebind to the freshly swapped DOM. initOnce() runs once only. */
(function () {
  'use strict';

  let scrollBound = false;
  let parallaxBound = false;
  let carBound = false;
  let carTimer = null;

  /* ---- One-time global setup (idempotent across navigations) ---- */
  function initOnce() {
    const preloader = document.querySelector('.preloader');
    if (preloader && !preloader.dataset.bound) {
      preloader.dataset.bound = '1';
      const hide = () => preloader.classList.add('done');
      window.addEventListener('load', hide);
      setTimeout(hide, 1400);
    }

    /* Elements created here carry data-persist: navigation.js preserves
       them across content swaps. */
    if (!document.querySelector('.scroll-progress')) {
      const progress = document.createElement('div');
      progress.className = 'scroll-progress';
      progress.setAttribute('data-persist', '');
      document.body.appendChild(progress);
    }
    if (!document.querySelector('.back-top')) {
      const topBtn = document.createElement('button');
      topBtn.className = 'back-top';
      topBtn.setAttribute('aria-label', 'Back to top');
      topBtn.setAttribute('data-persist', '');
      topBtn.innerHTML = '&uarr;';
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(topBtn);
    }
    if (window.matchMedia('(max-width: 767px)').matches && !document.querySelector('.mobile-cta')) {
      const bar = document.createElement('div');
      bar.className = 'mobile-cta';
      bar.setAttribute('role', 'navigation');
      bar.setAttribute('aria-label', 'Quick actions');
      bar.setAttribute('data-persist', '');
      bar.innerHTML =
        '<a href="tel:+919845025857" class="btn btn-primary">Book a Consultation</a>' +
        '<a href="tel:+919845025857" class="btn btn-outline">Call Us</a>';
      document.body.appendChild(bar);
    }

    /* Scroll progress + sticky header + back-to-top: single listener,
       elements re-queried per call so it survives swaps. */
    if (!scrollBound) {
      scrollBound = true;
      const onScroll = () => {
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
        const progress = document.querySelector('.scroll-progress');
        if (progress) {
          const doc = document.documentElement;
          const max = doc.scrollHeight - window.innerHeight;
          progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        }
        const topBtn = document.querySelector('.back-top');
        if (topBtn) topBtn.classList.toggle('show', window.scrollY > 600);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ---- Per-page bindings (re-run on every page:load) ---- */
  function initPage() {
    /* Footer accordion (mobile) */
    if (window.matchMedia('(max-width: 767px)').matches) {
      document.querySelectorAll('.footer-col h4').forEach((h4) => {
        h4.addEventListener('click', () => h4.parentElement.classList.toggle('open'));
      });
    }

    /* Mega menus on mobile (tap to open) */
    const megaItems = document.querySelectorAll('.nav-links li.has-mega');
    megaItems.forEach((item) => {
      const megaMenu = item.querySelector('.mega');
      const toggle = item.querySelector('.nav-link-mega');
      if (!megaMenu || !toggle) return;
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const willOpen = !item.classList.contains('open');
          megaItems.forEach((other) => {
            other.classList.remove('open');
            const m = other.querySelector('.mega');
            if (m) m.classList.remove('open');
          });
          if (willOpen) {
            item.classList.add('open');
            megaMenu.classList.add('open');
          }
        }
      });
    });
    document.querySelectorAll('.nav-links a').forEach((link) => {
      if (link.classList.contains('nav-link-mega')) return;
      link.addEventListener('click', () => {
        megaItems.forEach((item) => {
          item.classList.remove('open');
          const megaMenu = item.querySelector('.mega');
          if (megaMenu) megaMenu.classList.remove('open');
        });
      });
    });

    /* Animated counters */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      const animate = (el) => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const iv = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(iv);
          }
          el.textContent = current;
        }, 22);
      };
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach((el) => io.observe(el));
    }

    /* Testimonial carousel (multi-card, swipe, autoplay) */
    const slidesEl = document.getElementById('carousel-slides');
    if (slidesEl) {
      if (carTimer) { clearInterval(carTimer); carTimer = null; }
      const slides = Array.from(slidesEl.querySelectorAll('.t-slide'));
      const dotsEl = document.getElementById('car-dots');
      const prevBtn = document.getElementById('car-prev');
      const nextBtn = document.getElementById('car-next');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const count = slides.length;

      const perView = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
      let pv = perView();
      let index = 0;

      const maxIndex = () => count - pv;
      const rebuildDots = () => {
        dotsEl.innerHTML = '';
        const n = maxIndex() + 1;
        for (let i = 0; i < n; i++) {
          const dot = document.createElement('button');
          dot.className = 'car-dot';
          dot.setAttribute('aria-label', 'Go to testimonial group ' + (i + 1));
          dot.addEventListener('click', () => goTo(i));
          dotsEl.appendChild(dot);
        }
      };

      const goTo = (i, instant) => {
        index = Math.max(0, Math.min(maxIndex(), i));
        const offset = (index * 100) / pv;
        if (instant) {
          slidesEl.style.transition = 'none';
          slidesEl.style.transform = 'translateX(-' + offset + '%)';
          void slidesEl.offsetWidth;
          slidesEl.style.transition = '';
        } else {
          slidesEl.style.transform = 'translateX(-' + offset + '%)';
        }
        Array.from(dotsEl.children).forEach((d, di) => d.classList.toggle('active', di === index));
      };

      const setWidths = () => {
        pv = perView();
        slides.forEach((s) => (s.style.flex = '0 0 ' + 100 / pv + '%'));
        rebuildDots();
        if (index > maxIndex()) index = maxIndex();
        goTo(index, true);
      };
      setWidths();
      if (!carBound) {
        carBound = true;
        window.addEventListener('resize', setWidths);
      }

      prevBtn.addEventListener('click', () => goTo(index - 1));
      nextBtn.addEventListener('click', () => goTo(index + 1));

      /* Swipe */
      let touchX = null;
      slidesEl.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
      slidesEl.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 45) goTo(index + (dx < 0 ? 1 : -1));
        touchX = null;
      }, { passive: true });

      /* Autoplay */
      carTimer = reduced ? null : setInterval(() => goTo(index + 1), 6000);
      const carousel = document.getElementById('testimonial-carousel');
      const stop = () => { if (carTimer) clearInterval(carTimer); carTimer = null; };
      const start = () => { if (!reduced && !carTimer) carTimer = setInterval(() => goTo(index + 1), 6000); };
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      carousel.addEventListener('touchstart', stop, { passive: true });
      carousel.addEventListener('touchend', start, { passive: true });
    }

    /* Lightbox (gallery + about tiles) */
    const lbOverlay = document.getElementById('lb-overlay');
    if (lbOverlay) {
      const lbVisual = document.getElementById('lb-visual');
      const lbIcon = document.getElementById('lb-icon');
      const lbTitle = document.getElementById('lb-title');
      const lbDesc = document.getElementById('lb-desc');
      const lbClose = document.getElementById('lb-close');
      const tiles = Array.from(document.querySelectorAll('.gal-tile[data-desc], .m-item[data-title]'));

      let lbIndex = 0;
      const paletteRe = /(?:m-|n-|l-|h-|w-|i-)\d/;

      const show = (i) => {
        lbIndex = (i + tiles.length) % tiles.length;
        const tile = tiles[lbIndex];
        const palette = (tile.className.match(paletteRe) || ['m-1'])[0];
        lbVisual.className = 'lb-visual ' + palette;
        lbIcon.innerHTML = tile.getAttribute('data-icon');
        lbTitle.textContent = tile.getAttribute('data-title');
        lbDesc.textContent = tile.getAttribute('data-desc');
        lbOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      };

      const close = () => {
        lbOverlay.classList.remove('open');
        document.body.style.overflow = '';
      };

      tiles.forEach((tile) => {
        tile.addEventListener('click', () => show(tiles.indexOf(tile)));
      });

      /* Nav buttons are added once per overlay instance (avoid dupes on re-init) */
      if (!lbOverlay.querySelector('.lb-prev')) {
        const prevBtnLb = document.createElement('button');
        prevBtnLb.className = 'lb-nav lb-prev';
        prevBtnLb.setAttribute('aria-label', 'Previous');
        prevBtnLb.innerHTML = '&lsaquo;';
        const nextBtnLb = document.createElement('button');
        nextBtnLb.className = 'lb-nav lb-next';
        nextBtnLb.setAttribute('aria-label', 'Next');
        nextBtnLb.innerHTML = '&rsaquo;';
        lbOverlay.appendChild(prevBtnLb);
        lbOverlay.appendChild(nextBtnLb);
        prevBtnLb.addEventListener('click', () => show(lbIndex - 1));
        nextBtnLb.addEventListener('click', () => show(lbIndex + 1));
      }

      lbClose.addEventListener('click', close);
      lbOverlay.addEventListener('click', (e) => { if (e.target === lbOverlay) close(); });
      document.addEventListener('keydown', (e) => {
        if (!lbOverlay.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(lbIndex - 1);
        if (e.key === 'ArrowRight') show(lbIndex + 1);
      });

      let lbTouchX = null;
      lbOverlay.addEventListener('touchstart', (e) => { lbTouchX = e.touches[0].clientX; }, { passive: true });
      lbOverlay.addEventListener('touchend', (e) => {
        if (lbTouchX === null) return;
        const dx = e.changedTouches[0].clientX - lbTouchX;
        if (Math.abs(dx) > 45) show(lbIndex + (dx < 0 ? 1 : -1));
        lbTouchX = null;
      }, { passive: true });
    }

    /* Forms */
    const heroForm = document.getElementById('hero-form');
    const heroNote = document.getElementById('hero-form-note');
    if (heroForm) {
      heroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        heroNote.textContent = 'Thank you — a senior physician will contact you within 24 hours.';
        heroNote.style.color = '#E6CE8F';
        heroForm.querySelector('button').textContent = 'Request received';
        heroForm.querySelector('button').disabled = true;
      });
    }

    const newsForm = document.getElementById('newsletter-form');
    const newsNote = document.getElementById('newsletter-note');
    if (newsForm) {
      newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        newsNote.textContent = 'Thank you for subscribing.';
        newsNote.style.color = '#E6CE8F';
        newsForm.querySelector('input').value = '';
      });
    }

    /* Subtle hero parallax + fade on scroll (single listener, re-queries DOM) */
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canParallax = !reducedMotion && !window.matchMedia('(hover: none)').matches;
    if (canParallax && !parallaxBound) {
      parallaxBound = true;
      const onParallax = () => {
        const heroGrid = document.getElementById('hero-grid');
        if (!heroGrid) return;
        const y = Math.min(window.scrollY, window.innerHeight);
        heroGrid.style.transform = 'translateY(' + (y * 0.16).toFixed(1) + 'px)';
        heroGrid.style.opacity = String(Math.max(0.35, 1 - y / (window.innerHeight * 0.85)));
      };
      window.addEventListener('scroll', onParallax, { passive: true });
    }

    /* Hero carousel: slides, arrows, dots, autoplay (re-runnable) */
    const hc = document.querySelector('[data-hero-carousel]');
    if (hc && !hc.dataset.bound) {
      hc.dataset.bound = '1';
      const slides = Array.prototype.slice.call(hc.querySelectorAll('.hc-slide'));
      const dotsWrap = hc.querySelector('.hc-dots');
      const prevBtn = hc.querySelector('.hc-prev');
      const nextBtn = hc.querySelector('.hc-next');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let current = slides.findIndex((s) => s.classList.contains('is-active'));
      if (current < 0) current = 0;
      let timer = null;
      const dots = slides.map((s, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'hc-dot';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.addEventListener('click', () => {
          go(i);
          restart();
        });
        dotsWrap.appendChild(d);
        return d;
      });
      const update = () => {
        slides.forEach((s, i) => {
          s.classList.toggle('is-active', i === current);
        });
        dots.forEach((d, i) => {
          d.classList.toggle('is-active', i === current);
          d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
      };
      const go = (i) => {
        current = (i + slides.length) % slides.length;
        update();
      };
      const restart = () => {
        if (reduce || !slides.length) return;
        if (timer) clearInterval(timer);
        timer = setInterval(() => go(current + 1), 5200);
      };
      if (prevBtn) prevBtn.addEventListener('click', () => { go(current - 1); restart(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { go(current + 1); restart(); });
      hc.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
      hc.addEventListener('mouseleave', restart);
      update();
      restart();
    }

    /* Footer year */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* Video hero: one continuous video banner on every page */
    heroVideo();
  }

  /* ---- Sitewide hero banner video (natural footage, no colour grading) ---- */
  function heroVideo() {
    const inSub = location.pathname.split('/').filter(Boolean).length > 1;
    const vSrc = (inSub ? '../' : '') + 'videos/hero-banner.mp4';
    const inject = (container) => {
      if (!container || container.querySelector('.hero-video')) return;
      const img = container.querySelector('img');
      if (img) img.remove();
      const v = document.createElement('video');
      v.className = 'hero-video';
      v.setAttribute('data-sitewide-hero', '');
      v.autoplay = true;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = 'metadata';
      v.setAttribute('aria-hidden', 'true');
      v.disablePictureInPicture = true;
      v.setAttribute('controlslist', 'nodownload noplaybackrate');
      const s = document.createElement('source');
      s.src = vSrc;
      s.type = 'video/mp4';
      v.appendChild(s);
      container.appendChild(v);
    };
    document.querySelectorAll('#main').forEach((sec) => {
      if (sec.querySelector(':scope > .hero-img, :scope > .ct-hero-media, :scope > [data-hero-optout]')) return;
      const bg = document.createElement('div');
      bg.className = 'hero-img';
      sec.insertBefore(bg, sec.firstChild);
    });
    document.querySelectorAll('#main > .hero-img').forEach(inject);
    /* Mobile playback fallback: retry once on first user gesture */
    document.querySelectorAll('.hero-video').forEach((v) => {
      const attempt = () => { const p = v.play(); if (p) p.catch(() => {}); };
      v.addEventListener('canplay', attempt, { once: true });
      attempt();
      const gesture = () => { attempt(); document.removeEventListener('touchstart', gesture); document.removeEventListener('click', gesture); };
      document.addEventListener('touchstart', gesture, { once: true });
      document.addEventListener('click', gesture, { once: true });
    });
  }

  initOnce();
  initPage();
  document.addEventListener('page:load', () => {
    initOnce();
    initPage();
  });
})();
