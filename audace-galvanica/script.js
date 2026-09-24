/* Audace Galvânica | interações
   Menu mobile, formulário (WhatsApp) e motion (Fase 10). */
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
    var label = form.querySelector('.btn__label');
    if (label) {
      label.textContent = 'Abrindo WhatsApp…';
      setTimeout(function () { label.textContent = 'SOLICITAR CONSULTORIA'; }, 1800);
    }
  });
})();

/* ---------- Fase 10: motion ----------
   Tudo aqui é progressivo: sem .js-motion (sem JS, sem IntersectionObserver ou com
   movimento reduzido), só o cabeçalho, a barra de leitura e o WhatsApp flutuante funcionam. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('js-motion');
  window.__audaceMotion = true;
  var desktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

  /* Ordem das entradas em grupos (benefícios, etapas, rodapé) */
  function order(list) { Array.prototype.forEach.call(list, function (el, i) { el.style.setProperty('--i', i); }); }
  order(document.querySelectorAll('.benefit'));
  order(document.querySelectorAll('.step'));
  var foot = document.querySelector('[data-reveal-group]');
  if (foot) Array.prototype.forEach.call(foot.children, function (el, i) { el.setAttribute('data-reveal', ''); el.style.setProperty('--i', i); });

  /* Entradas por viewport */
  if (motion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.hasAttribute('data-depth')) {
          var btn = e.target.querySelector('[data-pulse]');
          if (btn) btn.classList.add('pulse');
        }
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal], [data-credits]').forEach(function (el) { io.observe(el); });

    /* 38. Fade das imagens só depois de carregar */
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      function done() { img.classList.add('is-loaded'); }
      if (img.complete) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
    });

    /* 21. Luz que acompanha o cursor sobre as joias */
    document.querySelectorAll('.step__media, .cta-form').forEach(function (el) {
      var target = el.classList.contains('cta-form') ? el.querySelector('.cta-form__media') : el;
      if (!target) return;
      el.addEventListener('pointermove', function (ev) {
        if (!desktop.matches) return;
        var r = target.getBoundingClientRect();
        target.style.setProperty('--lx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        target.style.setProperty('--ly', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* Rolagem: cabeçalho, barra de leitura, WhatsApp, parallax, dourado progressivo e etapas */
  var header = document.querySelector('[data-header]');
  var hero = document.getElementById('hero');
  var wa = document.querySelector('[data-wa-float]');
  var heroPic = document.querySelector('.hero .section__bg picture');
  var consult = document.querySelector('.consult');
  var golds = document.querySelectorAll('[data-gold-progress]');
  var stepsList = document.querySelector('[data-steps]');
  var steps = stepsList ? stepsList.querySelectorAll('.step') : [];
  var ticking = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    header.classList.toggle('is-scrolled', y > 40);
    root.style.setProperty('--read', max > 0 ? (y / max).toFixed(4) : 0);
    if (wa && hero) wa.classList.toggle('is-visible', y > hero.offsetHeight * 0.8);
    if (!motion) return;

    var big = desktop.matches;
    if (heroPic && y < hero.offsetHeight) heroPic.style.setProperty('--hero-y', big ? (y * 0.06).toFixed(1) + 'px' : '0px');
    if (consult) {
      var rc = consult.getBoundingClientRect();
      var pc = clamp((vh - rc.top) / (vh + rc.height)) - 0.5;
      consult.style.setProperty('--consult-y', big ? (pc * -26).toFixed(1) + 'px' : '0px');
    }
    golds.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--gp', clamp((vh * 0.92 - r.top) / (vh * 0.45)).toFixed(3));
    });
    if (stepsList) {
      var rs = stepsList.getBoundingClientRect();
      stepsList.style.setProperty('--steps-p', clamp((vh * 0.8 - rs.top) / (rs.height + vh * 0.25)).toFixed(3));
      var best = null, bestD = Infinity;
      steps.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) { bestD = d; best = s; }
      });
      var near = rs.top < vh * 0.85 && rs.bottom > vh * 0.15;
      stepsList.classList.toggle('has-active', near);
      steps.forEach(function (s) { s.classList.toggle('is-active', near && s === best); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
