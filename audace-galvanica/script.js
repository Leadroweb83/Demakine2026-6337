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
    if (e.target.matches("input, select, textarea")) validate(e.target);
  }, true);

  /* Envio: abre o WhatsApp da Audace com todos os dados preenchidos. */
  function onlyDigits(v) { return v.replace(/\D/g, ''); }

  var tel = form.querySelector('input[type="tel"]');
  tel.addEventListener('input', function () {
    var d = onlyDigits(tel.value).slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    tel.value = out;
  });

  function buildMessage() {
    var f = form.elements;
    return [
      'Olá! Quero solicitar uma consultoria de banhos para semijoias.',
      '',
      '*Nome:* ' + f.nome.value.trim(),
      '*WhatsApp:* ' + f.whatsapp.value.trim(),
      '*Marca / Empresa:* ' + f.empresa.value.trim(),
      '*Cidade / UF:* ' + f.cidade.value.trim(),
      '*Momento:* ' + f.momento.value,
      '*Volume de peças:* ' + f.volume.value,
      '*Principal necessidade:* ' + f.necessidade.value
    ].join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = Array.prototype.filter.call(form.elements, function (el) {
      return el.matches && el.matches('input, select, textarea') && !validate(el);
    });
    if (invalid.length) { invalid[0].focus(); return; }

    var url = 'https://wa.me/' + form.dataset.whatsapp + '?text=' + encodeURIComponent(buildMessage());
    var win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;   // navegador bloqueou a nova aba: abre na mesma
    status.textContent = 'Abrimos o WhatsApp com seus dados. É só tocar em enviar para falar com nosso time.';
  });
})();
