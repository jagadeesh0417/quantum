/* Contact page — enquiry form handling
   Re-runnable: rebinds on every page:load (persistent navigation). */
(function () {
  'use strict';

  var ENQUIRY_ENDPOINT = null;
  var SUBMIT_DELAY_MS = 900;
  var TIMEOUT_MS = 12000;
  var MAX_SUBMITS = 3;
  var RATE_WINDOW_MS = 60000;

  function initContact() {
    var form = document.getElementById('ct-enquiry-form');
    if (!form) return;

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn.querySelector('.ct-submit-label');
    var successPanel = document.getElementById('ct-form-success');
    var errorPanel = document.getElementById('ct-form-error');
    var counter = document.getElementById('cf-count');
    var message = document.getElementById('cf-message');
    var hp = document.getElementById('cf-website');
    var submitTimes = [];

    var fields = {
      'cf-name': [byId('cf-name'), byId('cf-name-err'), 'Please enter your full name.', function (v) { return v.length >= 2; }],
      'cf-email': [byId('cf-email'), byId('cf-email-err'), 'Please enter a valid email address.', function (v) { return emailRe.test(v); }],
      'cf-phone': [byId('cf-phone'), byId('cf-phone-err'), 'Please enter a valid phone number.', function (v) { return v.replace(/\D/g, '').length >= 7; }],
      'cf-subject': [byId('cf-subject'), byId('cf-subject-err'), 'Please choose a subject.', function (v) { return v !== ''; }],
      'cf-message': [message, byId('cf-message-err'), 'Please tell us how we can help.', function (v) { return v.trim().length > 0; }]
    };

    function byId(id) { return document.getElementById(id); }

    function showError(input, errEl, msg) {
      var wrap = input.closest('.ct-field');
      if (wrap) wrap.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = msg;
      errEl.hidden = false;
    }

    function clearError(input, errEl) {
      var wrap = input.closest('.ct-field');
      if (wrap) wrap.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      errEl.textContent = '';
      errEl.hidden = true;
    }

    function validate(field, silent) {
      var input = field[0], errEl = field[1], msg = field[2], test = field[3];
      var ok = test(String(input.value || '').trim());
      if (ok) {
        if (!silent) clearError(input, errEl);
        return true;
      }
      if (!silent) showError(input, errEl, msg);
      return false;
    }

    function resetPanels() {
      successPanel.hidden = true;
      errorPanel.hidden = true;
    }

    function rateLimited() {
      var now = Date.now();
      submitTimes = submitTimes.filter(function (t) { return now - t < RATE_WINDOW_MS; });
      if (submitTimes.length >= MAX_SUBMITS) return true;
      submitTimes.push(now);
      return false;
    }

    function submitPayload() {
      return {
        fullname: String(byId('cf-name').value || '').trim(),
        email: String(byId('cf-email').value || '').trim(),
        phone: String(byId('cf-phone').value || '').trim(),
        subject: String(byId('cf-subject').value || '').trim(),
        message: String(message.value || '').trim()
      };
    }

    function sendEnquiry(payload) {
      return new Promise(function (resolve, reject) {
        if (!ENQUIRY_ENDPOINT) {
          window.setTimeout(function () { resolve({ ok: true, simulated: true }); }, SUBMIT_DELAY_MS);
          return;
        }
        var started = Date.now();
        fetch(ENQUIRY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (res) {
          var elapsed = Date.now() - started;
          var wait = Math.max(0, SUBMIT_DELAY_MS - elapsed);
          window.setTimeout(function () {
            res.ok ? resolve({ ok: true }) : reject(new Error('bad status ' + res.status));
          }, wait);
        }).catch(function (err) {
          var elapsed = Date.now() - started;
          var wait = Math.max(0, SUBMIT_DELAY_MS - elapsed);
          window.setTimeout(function () { reject(err); }, wait);
        });
      });
    }

    function handleSubmit(e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        if (!validate(fields[key])) {
          byId(key).setAttribute('aria-describedby', fields[key][1].id || '');
          if (!firstInvalid) firstInvalid = byId(key);
        }
      });
      if (firstInvalid) {
        resetPanels();
        firstInvalid.focus();
        return;
      }
      if (submitBtn.disabled) return;
      if (rateLimited()) {
        window.alert('Too many attempts. Please try again in a minute.');
        return;
      }

      resetPanels();
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      if (submitLabel) submitLabel.textContent = 'Sending...';

      var hpFilled = hp && String(hp.value || '').trim() !== '';
      var chain = hpFilled
        ? Promise.resolve({ ok: true, filter: true })
        : sendEnquiry(submitPayload());

      chain.then(function () {
        form.reset();
        if (counter) counter.textContent = '0 / 800';
        errorPanel.hidden = true;
        successPanel.hidden = false;
        successPanel.focus({ preventScroll: true });
      }).catch(function () {
        errorPanel.hidden = false;
        successPanel.hidden = true;
      }).finally(function () {
        submitBtn.classList.remove('is-loading');
        if (submitLabel) submitLabel.textContent = 'Send Message';
        window.setTimeout(function () { submitBtn.disabled = false; }, 2500);
      });
    }

    Object.keys(fields).forEach(function (key) {
      var input = fields[key][0];
      input.addEventListener('blur', function () { validate(fields[key]); });
      input.addEventListener('input', function () {
        var v = String(input.value || '');
        if (!input.getAttribute('aria-invalid')) return;
        if (fields[key][3](v.trim())) clearError(input, fields[key][1]);
      });
    });
    if (message) {
      message.addEventListener('input', function () {
        if (counter) counter.textContent = String(message.value.length) + ' / 800';
      });
    }
    form.addEventListener('submit', handleSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContact);
  } else {
    initContact();
  }
  document.addEventListener('page:load', initContact);
})();