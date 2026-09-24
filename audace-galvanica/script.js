/* Audace Galvânica | interações
   Fase 0: apenas menu mobile e formulário. Motions entram na Fase 10. */
(function () {
  'use strict';

  /* ---------- Menu mobile acessível ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Fechar menu' : 'Abrir menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Formulário de lead ---------- */
  var form = document.querySelector('[data-lead-form]');
  if (!form) return;

  var status = form.querySelector('[data-form-status]');
  var submit = form.querySelector('button[type="submit"]');
  var submitLabel = submit.firstChild.textContent;

  function fieldError(el, message) {
    var field = el.closest('.field');
    var err = field.querySelector('.field__error');
    field.classList.toggle('is-invalid', !!message);
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) {
      if (!err) {
        err = document.createElement('span');
        err.className = 'field__error';
        err.id = el.id + '-erro';
        field.appendChild(err);
        el.setAttribute('aria-describedby', err.id);
      }
      err.textContent = message;
    } else if (err) {
      err.remove();
      el.removeAttribute('aria-describedby');
    }
  }

  function validate(el) {
    if (!el.required) return true;
    var v = el.value.trim();
    if (!v) { fieldError(el, 'Campo obrigatório.'); return false; }
    if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) {
      fieldError(el, 'Informe o WhatsApp com DDD.');
      return false;
    }
    fieldError(el, '');
    return true;
  }

  form.addEventListener('blur', function (e) {
    if (e.target.matches('input, select')) validate(e.target);
  }, true);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = Array.prototype.filter.call(form.elements, function (el) {
      return el.matches && el.matches('input, select, textarea') && !validate(el);
    });
    if (invalid.length) { invalid[0].focus(); return; }

    var endpoint = form.dataset.endpoint;
    if (!endpoint) {
      // Sem integração configurada: não simular sucesso.
      status.textContent = 'Envio indisponível no momento. A integração do formulário ainda não foi configurada.';
      return;
    }

    submit.disabled = true;
    submit.firstChild.textContent = 'Enviando… ';
    status.textContent = '';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        submit.firstChild.textContent = 'Consultoria solicitada ✓ ';
        status.textContent = 'Recebemos seus dados. Nosso time entrará em contato pelo WhatsApp.';
        form.reset();
      })
      .catch(function () {
        submit.disabled = false;
        submit.firstChild.textContent = submitLabel;
        status.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
      });
  });
})();
