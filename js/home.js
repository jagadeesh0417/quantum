/* Quantum Health Biotech Park — homepage interactions */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Sticky header: transparent over hero, solid on scroll ---- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  /* ---- Animated counters (campus stats) ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.textContent.trim() === '0' ? '' : el.textContent.replace(/0$/, '');
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const iv = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(iv);
        }
        el.textContent = current + suffix;
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

  /* ---- Testimonial carousel ---- */
  const slidesEl = document.getElementById('carousel-slides');
  if (slidesEl) {
    const slides = slidesEl.querySelectorAll('.t-slide');
    const dotsEl = document.getElementById('car-dots');
    const prevBtn = document.getElementById('car-prev');
    const nextBtn = document.getElementById('car-next');
    let index = 0;
    const count = slides.length;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'car-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
    const dots = dotsEl.querySelectorAll('.car-dot');

    const goTo = (i) => {
      index = (i + count) % count;
      slidesEl.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    };
    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = reduced ? null : setInterval(() => goTo(index + 1), 6000);
    const carousel = document.getElementById('testimonial-carousel');
    carousel.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', () => { if (!reduced) timer = setInterval(() => goTo(index + 1), 6000); });
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

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
