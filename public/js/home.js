/* Quantum Health Biotech Park — site-wide interactions */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Preloader ---- */
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    const hide = () => preloader.classList.add('done');
    window.addEventListener('load', hide);
    setTimeout(hide, 1400);
  }

  /* ---- Sticky header + scroll progress + back-to-top ---- */
  const navbar = document.getElementById('navbar');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const topBtn = document.createElement('button');
  topBtn.className = 'back-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&uarr;';
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const onScroll = () => {
    if (navbar) {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
    topBtn.classList.toggle('show', window.scrollY > 600);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Sticky mobile CTA bar ---- */
  if (window.matchMedia('(max-width: 767px)').matches) {
    const bar = document.createElement('div');
    bar.className = 'mobile-cta';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Quick actions');
    bar.innerHTML =
      '<a href="contact.html" class="btn btn-primary">Book a Consultation</a>' +
      '<a href="tel:+91XXXXXXXXXX" class="btn btn-outline">Call Us</a>';
    document.body.appendChild(bar);
  }

  /* ---- Footer accordion (mobile) ---- */
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.querySelectorAll('.footer-col h4').forEach((h4) => {
      h4.addEventListener('click', () => h4.parentElement.classList.toggle('open'));
    });
  }

  /* ---- Mega menu on mobile (tap to open) ---- */
  const megaWrap = document.getElementById('mega-wrap');
  const megaMenu = document.getElementById('mega-menu');
  if (megaWrap && megaMenu) {
    const toggle = megaWrap.querySelector('.nav-link-mega');
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        megaWrap.classList.toggle('open');
        megaMenu.classList.toggle('open');
      }
    });
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        megaWrap.classList.remove('open');
        megaMenu.classList.remove('open');
      });
    });
  }

  /* ---- Animated counters ---- */
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

  /* ---- Testimonial carousel (multi-card, swipe, autoplay) ---- */
  const slidesEl = document.getElementById('carousel-slides');
  if (slidesEl) {
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
    window.addEventListener('resize', setWidths);

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
    let timer = reduced ? null : setInterval(() => goTo(index + 1), 6000);
    const carousel = document.getElementById('testimonial-carousel');
    const stop = () => { if (timer) clearInterval(timer); };
    const start = () => { if (!reduced) timer = setInterval(() => goTo(index + 1), 6000); };
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('touchstart', stop, { passive: true });
    carousel.addEventListener('touchend', start, { passive: true });
  }

  /* ---- Lightbox (gallery + about tiles) ---- */
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

  /* ---- Forms ---- */
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

  /* ---- Hero video: play when in view, pause offscreen ---- */
  document.querySelectorAll('.hero-video').forEach((video) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.05 });
    videoObserver.observe(video);
  });

  /* ---- Subtle hero parallax + fade on scroll ---- */
  const heroGrid = document.getElementById('hero-grid');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroGrid && !reducedMotion && !window.matchMedia('(hover: none)').matches) {
    const onParallax = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroGrid.style.transform = 'translateY(' + (y * 0.16).toFixed(1) + 'px)';
      heroGrid.style.opacity = String(Math.max(0.35, 1 - y / (window.innerHeight * 0.85)));
    };
    window.addEventListener('scroll', onParallax, { passive: true });
  }

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
