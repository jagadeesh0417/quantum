document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelector('.nav-links');
  const toggle = document.querySelector('.mobile-toggle');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  const els = document.querySelectorAll('[data-reveal]');
  if (els.length) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      ro.observe(el);
    });
  }

  const accordions = document.querySelectorAll('.accordion-item');
  accordions.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        accordions.forEach(a => a.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  document.querySelectorAll('.hero-stats .stat-number').forEach(el => {
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
});
