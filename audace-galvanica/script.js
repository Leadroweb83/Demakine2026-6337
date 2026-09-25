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
      '*Principal necessidade:* ' + f.necessidade.value,
      '',
      '_Enviado pela landing page Audace Galvânica_'
    ].join('\n');
  }

  /* Origem do pedido: landing page + parâmetros de campanha (utm_*, gclid, fbclid), se houver */
  function origin() {
    var q = new URLSearchParams(location.search), parts = [];
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(function (k) {
      if (q.get(k)) parts.push(k + '=' + q.get(k));
    });
    return 'Landing page Audace Galvânica (' + location.host + ')' + (parts.length ? ' | ' + parts.join(' | ') : '');
  }

  /* E-mail organizado (tabela) para a caixa do cliente, sem esperar resposta: o WhatsApp abre na hora */
  function sendEmail() {
    var to = (form.getAttribute('data-email') || '').trim();
    if (!to || !window.fetch) return;
    var f = form.elements;
    var now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    var data = {
      _subject: 'Nova solicitação de consultoria | Landing Page Audace Galvânica | ' + f.nome.value.trim(),
      _template: 'table',
      _captcha: 'false',
      'Origem': origin(),
      'Data e hora': now,
      'Nome completo': f.nome.value.trim(),
      'WhatsApp': f.whatsapp.value.trim(),
      'Marca / Empresa': f.empresa.value.trim(),
      'Cidade / UF': f.cidade.value.trim(),
      'Momento': f.momento.value,
      'Volume aproximado de peças': f.volume.value,
      'Principal necessidade': f.necessidade.value,
      'Responder pelo WhatsApp': 'https://wa.me/55' + onlyDigits(f.whatsapp.value)
    };
    try {
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function () {});
    } catch (err) { /* segue para o WhatsApp */ }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements._honey && form.elements._honey.value) return; // robô
    var invalid = Array.prototype.filter.call(form.elements, function (el) {
      return el.matches && el.matches('input, select, textarea') && !validate(el);
    });
    if (invalid.length) { invalid[0].focus(); return; }
    sendEmail();

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
  /* Quando o GSAP + ScrollTrigger (carregado por scroll.js depois da página abrir) assume,
     o hero e as etapas no desktop passam a ser controlados por ele */
  function gs() { return motion && window.__audaceGsap === true; }
  var wide = window.matchMedia('(min-width: 1024px)');

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
    /* no celular aparece depois do botão do hero (para não cobri-lo); no desktop fica sempre visível */
    if (wa) wa.classList.toggle('is-visible', wide.matches || !hero || y > hero.offsetHeight * 0.6);
    if (!motion) return;

    var big = desktop.matches;
    if (!gs() && heroPic && y < hero.offsetHeight) heroPic.style.setProperty('--hero-y', big ? (y * 0.06).toFixed(1) + 'px' : '0px');
    if (consult) {
      var rc = consult.getBoundingClientRect();
      var pc = clamp((vh - rc.top) / (vh + rc.height)) - 0.5;
      consult.style.setProperty('--consult-y', big ? (pc * -26).toFixed(1) + 'px' : '0px');
    }
    golds.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--gp', clamp((vh * 0.92 - r.top) / (vh * 0.45)).toFixed(3));
    });
    if (stepsList && !(gs() && wide.matches)) {
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

/* ---------- Instagram: feed automático (Behold) ----------
   Com o ID do feed em data-behold-feed-id, o widget carrega quando a seção se aproxima
   da tela e substitui o cartão com o link do perfil. Sem ID, o cartão fica. */
(function () {
  'use strict';
  var box = document.querySelector('[data-insta-feed]');
  if (!box) return;
  var id = (box.getAttribute('data-behold-feed-id') || '').trim();
  if (!id) return;
  function load() {
    var sc = document.createElement('script');
    sc.type = 'module'; sc.src = 'https://w.behold.so/widget.js';
    document.head.appendChild(sc);
    var w = document.createElement('behold-widget');
    w.setAttribute('feed-id', id);
    box.innerHTML = '';
    box.appendChild(w);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '400px 0px' });
    io.observe(box);
  } else load();
})();

/* ---------- Feixes de luz nos fundos azuis ----------
   Versão em JS puro do componente "Beams Background": feixes inclinados que sobem,
   pulsam e se desfocam. Cores puxadas para o azul #193D89 da paleta, com alguns
   feixes dourados. Desenha em baixa resolução (o desfoque esconde) e só anima
   quando a seção está na tela; com movimento reduzido fica um quadro parado. */
(function () {
  'use strict';
  var canvases = document.querySelectorAll('[data-beams]');
  if (!canvases.length || !window.requestAnimationFrame) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCALE = 0.25;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function Beams(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.beams = []; this.running = false; this.raf = 0;
    this.visible = false;
    this.resize();
  }
  Beams.prototype.make = function (i, n, fromBottom) {
    var W = this.W, H = this.H, k = SCALE;
    var gold = i % 7 === 3;
    var col = i % 3, sp = W / 3;
    return {
      x: fromBottom ? col * sp + sp / 2 + (Math.random() - 0.5) * sp * 0.5 : rand(-W * 0.25, W * 1.25),
      y: fromBottom ? H + 100 * k : rand(-H * 0.25, H * 1.25),
      w: (fromBottom ? rand(100, 200) : rand(30, 90)) * k * 1.4,
      len: H * 2.5,
      angle: rand(-35, -25) * Math.PI / 180,
      speed: rand(0.5, 1.1) * k * 1.6,
      op: gold ? rand(0.10, 0.16) : rand(0.16, 0.28),
      hue: gold ? 42 : 205 + (i * 30) / n,
      sat: gold ? 55 : 75,
      pulse: rand(0, Math.PI * 2), ps: rand(0.02, 0.05)
    };
  };
  Beams.prototype.resize = function () {
    var r = this.c.getBoundingClientRect();
    this.W = Math.max(1, Math.round(r.width * SCALE));
    this.H = Math.max(1, Math.round(r.height * SCALE));
    this.c.width = this.W; this.c.height = this.H;
    var n = r.width < 768 ? 14 : 26;
    this.beams = [];
    for (var i = 0; i < n; i++) this.beams.push(this.make(i, n, false));
    this.draw(false);
  };
  Beams.prototype.draw = function (move) {
    var ctx = this.ctx, n = this.beams.length;
    ctx.clearRect(0, 0, this.W, this.H);
    for (var i = 0; i < n; i++) {
      var b = this.beams[i];
      if (move) {
        b.y -= b.speed; b.pulse += b.ps;
        if (b.y + b.len < -100 * SCALE) this.beams[i] = b = this.make(i, n, true);
      }
      var o = b.op * (0.8 + Math.sin(b.pulse) * 0.2);
      var c = 'hsla(' + b.hue + ',' + b.sat + '%,60%,';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.angle);
      var g = ctx.createLinearGradient(0, 0, 0, b.len);
      g.addColorStop(0, c + '0)'); g.addColorStop(0.1, c + o * 0.5 + ')');
      g.addColorStop(0.4, c + o + ')'); g.addColorStop(0.6, c + o + ')');
      g.addColorStop(0.9, c + o * 0.5 + ')'); g.addColorStop(1, c + '0)');
      ctx.fillStyle = g; ctx.fillRect(-b.w / 2, 0, b.w, b.len);
      ctx.restore();
    }
  };
  Beams.prototype.loop = function () {
    var self = this;
    if (!self.running) return;
    self.draw(true);
    self.raf = requestAnimationFrame(function () { self.loop(); });
  };
  Beams.prototype.set = function (on) {
    if (reduce || on === this.running) return;
    this.running = on;
    if (on) this.loop(); else cancelAnimationFrame(this.raf);
  };

  var list = Array.prototype.map.call(canvases, function (c) { var b = new Beams(c); c.classList.add('is-on'); return b; });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        list.forEach(function (b) { if (b.c === e.target) { b.visible = e.isIntersecting; b.set(b.visible && !document.hidden); } });
      });
    }, { rootMargin: '100px 0px' });
    list.forEach(function (b) { io.observe(b.c); });
  } else list.forEach(function (b) { b.visible = true; b.set(true); });

  document.addEventListener('visibilitychange', function () {
    list.forEach(function (b) { b.set(b.visible && !document.hidden); });
  });
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () { list.forEach(function (b) { b.resize(); }); }, 200);
  });
})();

/* ---------- Antes e depois: slider de comparação ----------
   Versão em JS puro do componente "Image Comparison Slider": arrastar (mouse ou toque)
   ou usar as setas do teclado no campo de faixa acessível. Na primeira vez que aparece,
   o divisor faz uma varredura curta para mostrar que pode ser arrastado. */
(function () {
  'use strict';
  var frame = document.querySelector('[data-compare]');
  if (!frame) return;
  var range = frame.querySelector('.compare__range');
  var dragging = false;

  function set(p) {
    p = Math.max(0, Math.min(100, p));
    frame.style.setProperty('--pos', p + '%');
    range.value = Math.round(p);
  }
  function fromX(x) { var r = frame.getBoundingClientRect(); set((x - r.left) / r.width * 100); }

  frame.addEventListener('pointerdown', function (e) {
    dragging = true; frame.classList.add('is-dragging');
    frame.setPointerCapture(e.pointerId); fromX(e.clientX);
  });
  frame.addEventListener('pointermove', function (e) { if (dragging) fromX(e.clientX); });
  function stop() { dragging = false; frame.classList.remove('is-dragging'); }
  frame.addEventListener('pointerup', stop);
  frame.addEventListener('pointercancel', stop);
  range.addEventListener('input', function () { set(+range.value); });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (en) {
    if (!en[0].isIntersecting) return;
    io.disconnect();
    var keys = [[0, 50], [900, 22], [1900, 78], [2800, 50]], t0 = null;
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function step(ts) {
      if (dragging) return;
      if (t0 === null) t0 = ts;
      var t = ts - t0 - 400;
      if (t < 0) return requestAnimationFrame(step);
      for (var i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          var a = keys[i - 1], b = keys[i], k = ease((t - a[0]) / (b[0] - a[0]));
          set(a[1] + (b[1] - a[1]) * k);
          return requestAnimationFrame(step);
        }
      }
      set(50);
    }
    requestAnimationFrame(step);
  }, { threshold: 0.5 });
  io.observe(frame);
})();

/* Ano do copyright sempre atual */
(function () {
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();

/* WhatsApp flutuante: "Estamos online" das 7h às 18h no horário de Brasília, "Fale conosco" fora dele.
   Perto do rodapé vira só o ícone, para não cobrir a assinatura. */
(function () {
  var wa = document.querySelector('[data-wa-float]');
  if (!wa) return;
  var label = wa.querySelector('[data-wa-status]');
  function hourBR() {
    try {
      return parseInt(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date()), 10);
    } catch (e) { return new Date().getHours(); }
  }
  function update() {
    var h = hourBR(), online = h >= 7 && h < 18;
    wa.classList.toggle('is-online', online);
    label.textContent = online ? 'Estamos online' : 'Fale conosco';
    wa.setAttribute('aria-label', (online ? 'Estamos online no WhatsApp' : 'Fale conosco no WhatsApp') + ' (abre em nova aba)');
  }
  update();
  setInterval(update, 60000);
  var foot = document.querySelector('.site-footer');
  if (foot && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { wa.classList.toggle('is-compact', e[0].isIntersecting); }).observe(foot);
  }
})();
