/* About page — campus experience lightbox */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('lb-overlay');
  if (!overlay) return;

  const visual = document.getElementById('lb-visual');
  const icon = document.getElementById('lb-icon');
  const title = document.getElementById('lb-title');
  const desc = document.getElementById('lb-desc');
  const closeBtn = document.getElementById('lb-close');

  document.querySelectorAll('.m-item[data-title]').forEach((tile) => {
    tile.addEventListener('click', () => {
      visual.className = 'lb-visual ' + (tile.className.match(/m-\d/) ? tile.className.match(/m-\d/)[0] : 'm-1');
      icon.innerHTML = tile.getAttribute('data-icon');
      title.textContent = tile.getAttribute('data-title');
      desc.textContent = tile.getAttribute('data-desc');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
});
