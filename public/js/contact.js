/* Contact page — enquiry form handling
   Re-runnable: rebinds on every page:load (persistent video navigation). */
(function () {
  'use strict';

  function initContact() {
    const form = document.getElementById('contact-form');
    const note = document.getElementById('contact-form-note');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.textContent = 'Thank you — your request has been received. A care advisor will contact you within 24 hours.';
      note.style.color = '#1B6B52';
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Request received';
      btn.disabled = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContact);
  } else {
    initContact();
  }
  document.addEventListener('page:load', initContact);
})();
