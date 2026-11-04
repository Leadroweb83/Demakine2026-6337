/* Black Guará: motion e interações da landing page.
   GSAP + ScrollTrigger + Lenis (todos servidos localmente em /vendor). */
(function () {
  'use strict';

  /* ================= CONFIGURAÇÃO DA CAMPANHA ================= */
  var CONFIG = {
    whatsapp: '5519993369331',               // WhatsApp vendas (19) 99336-9331
    // Cópia de cada lead por e-mail (assunto "Lead BlackFriday").
    // Padrão: FormSubmit (o 1º envio pede ativação no e-mail contato@).
    // Para usar o servidor do próprio site, troque por 'enviar-lead.php'.
    leadEndpoint: 'https://formsubmit.co/ajax/contato@guaraequipamentos.com.br',
    leadAssunto: 'Lead BlackFriday',
    fimCampanha: '2026-11-30T23:59:59-03:00',
    mensagemPadrao: 'Olá! Vim pela Black Guará e quero saber dos kits com até 30% OFF.',
    produtos: [
      { nome: 'Lavadora Extratora com Barreira Sanitária 21 e 30 kg', categoria: 'Lavadoras', imagem: 'img/lavadora-barreira-21-30kg.webp', descricao: 'Separa área suja e área limpa. Indicada para lavanderias hospitalares e clínicas.' },
      { nome: 'Lavadora Extratora com Barreira Sanitária 60 kg', categoria: 'Lavadoras', imagem: 'img/lavadora-barreira-60kg.webp', descricao: 'Maior capacidade com segurança sanitária para hospitais de médio e grande porte.' },
      { nome: 'Lavadora Horizontal com Barreira Sanitária', categoria: 'Lavadoras', imagem: 'img/lavadora-horizontal-barreira.webp', descricao: 'Modelo horizontal para operações hospitalares de alto volume.' },
      { nome: 'Lavadora Extratora Industrial 140 kg', categoria: 'Lavadoras', imagem: 'img/lavadora-extratora-140kg.webp', descricao: 'Alta capacidade e força G elevada para lavanderias industriais.' },
      { nome: 'Centrífuga Industrial', categoria: 'Centrífugas e secadores', imagem: 'img/centrifuga.webp', descricao: 'Sistema pendular e inversor de frequência para operação contínua.' },
      { nome: 'Secador Industrial', categoria: 'Centrífugas e secadores', imagem: 'img/secador.webp', descricao: 'Painel digital e aquecimento elétrico, a gás ou a vapor.' },
      { nome: 'Calandra Elétrica Industrial', categoria: 'Acabamento', imagem: 'img/calandra-eletrica.webp', descricao: 'Passadoria de lençóis e toalhas sem caldeira, ideal para começar.' },
      { nome: 'Calandra Industrial Multirrolos', categoria: 'Acabamento', imagem: 'img/calandra-multirrolos.webp', descricao: 'Alta produção de peças por hora para lavanderias de grande volume.' },
      { nome: 'Dobradeira de Lençol ZD-3300', categoria: 'Acabamento', imagem: 'img/dobradeira-lencol.webp', descricao: 'Automatiza a dobra de lençóis e reduz mão de obra no acabamento.' },
      { nome: 'Alimentadora Industrial', categoria: 'Acabamento', imagem: 'img/alimentadora.webp', descricao: 'Integração com a calandra para alimentar peças com agilidade.' }
    ]
  };
  /* ============================================================ */

  var doc = document, root = doc.documentElement;
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap && root.classList.contains('anim')) { root.classList.remove('anim'); root.classList.add('reduced'); }
  var ANIM = root.classList.contains('anim');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- WhatsApp, UTMs e rastreamento ---------- */
  var params = new URLSearchParams(location.search);
  var utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map(function (k) { return params.get(k); }).filter(Boolean).join(' / ');
  function waLink(msg, phone) { return 'https://wa.me/' + (phone || CONFIG.whatsapp) + '?text=' + encodeURIComponent(msg + (utm ? '\n\n[origem: ' + utm + ']' : '')); }
  function track(data) {
    window.dataLayer = window.dataLayer || [];
    data.event = 'generate_lead'; data.campaign = 'black_guara_2026';
    window.dataLayer.push(data);
  }

  /* ---------- Equipamentos + filtros ---------- */
  var offers = $('#offers');
  offers.innerHTML = CONFIG.produtos.map(function (p) {
    return '<article class="card rv" data-cat="' + esc(p.categoria) + '">' +
      '<div class="card-media"><img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + ' Guará" loading="lazy" width="600" height="450"><span class="badge">Até 30% OFF</span></div>' +
      '<div class="card-body"><span class="card-cat">' + esc(p.categoria) + '</span><h4>' + esc(p.nome) + '</h4><p>' + esc(p.descricao) + '</p>' +
      '<a class="btn btn-wa js-wa" data-origin="card" data-product="' + esc(p.nome) + '" href="https://wa.me/' + CONFIG.whatsapp + '" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Pedir condição</a></div></article>';
  }).join('');
  var cats = ['Todos'].concat(CONFIG.produtos.map(function (p) { return p.categoria; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
  var filters = $('#filters');
  filters.innerHTML = cats.map(function (c, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-f="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
  filters.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    $$('.card', offers).forEach(function (c) {
      c.hidden = b.dataset.f !== 'Todos' && c.dataset.cat !== b.dataset.f;
      if (!c.hidden) { c.style.opacity = 1; c.style.transform = 'none'; }
    });
    if (hasGsap) ScrollTrigger.refresh();
  });

  $$('.js-wa').forEach(function (a) {
    var product = a.dataset.product;
    a.href = waLink(product ? 'Olá! Vim pela Black Guará e quero a condição especial para: ' + product + '.' : CONFIG.mensagemPadrao, a.dataset.phone);
    a.target = '_blank';
    a.addEventListener('click', function () { track({ lead_channel: 'whatsapp', lead_origin: a.dataset.origin || 'link', product_name: product || '(geral)' }); });
  });
  $$('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { track({ lead_channel: 'telefone', lead_origin: a.dataset.origin || 'tel' }); });
  });

  /* ---------- Fitas cruzadas ---------- */
  var tapeItem = '<span class="tape-item">Black Guará <img src="img/favicon.png" alt="" width="32" height="32"> 30% de desconto <i>Black Friday</i> <img src="img/favicon.png" alt="" width="32" height="32"></span>';
  $$('[data-tape]').forEach(function (t) {
    var half = new Array(7).join(tapeItem);
    t.innerHTML = half + half; // duas metades iguais: o loop em -50% fica contínuo
  });

  /* ---------- Contagem regressiva com dígitos rolando ---------- */
  var end = new Date(CONFIG.fimCampanha).getTime();
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var units = {};
  $$('#countdown [data-u]').forEach(function (el) { units[el.dataset.u] = { el: el, digits: [] }; });
  function setUnit(u, str) {
    var unit = units[u];
    while (unit.digits.length < str.length) {
      var d = doc.createElement('span'); d.className = 'cd-digit';
      var s = doc.createElement('span'); d.appendChild(s);
      unit.el.appendChild(d); unit.digits.push({ box: d, cur: s, val: null });
    }
    for (var i = 0; i < str.length; i++) {
      var dg = unit.digits[i], ch = str[i];
      if (dg.val === ch) continue;
      if (dg.val === null || !ANIM) { dg.cur.textContent = ch; dg.val = ch; continue; }
      var old = dg.cur, nu = doc.createElement('span');
      nu.textContent = ch; dg.box.appendChild(nu); dg.cur = nu; dg.val = ch;
      gsap.fromTo(nu, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' });
      gsap.to(old, { yPercent: -100, opacity: 0, duration: 0.55, ease: 'power3.out', onComplete: function () { this.targets()[0].remove(); } });
    }
  }
  var timer;
  function tick() {
    var diff = Math.max(0, end - Date.now());
    var d = Math.floor(diff / 864e5); diff -= d * 864e5;
    var h = Math.floor(diff / 36e5); diff -= h * 36e5;
    var m = Math.floor(diff / 6e4); diff -= m * 6e4;
    var s = Math.floor(diff / 1e3);
    var v = { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
    Object.keys(v).forEach(function (k) { setUnit(k, v[k]); });
    var txt = v.d + 'd ' + v.h + 'h ' + v.m + 'm ' + v.s + 's';
    $('#topbar-cd').textContent = txt;
    $('#final-cd').textContent = txt;
    if (end <= Date.now()) {
      $('#topbar-label').textContent = 'A Black Guará foi encerrada. Fale com o time comercial sobre as condições atuais';
      $('#topbar-cd').hidden = true;
      clearInterval(timer);
    }
  }
  tick(); timer = setInterval(tick, 1000);

  /* ---------- Órbita das dores ---------- */
  if (window.initOrbitalCards) {
    window.initOrbitalCards($('.orb'), { radiusX: 34, radiusY: 17, steps: 5, entry: 1.55, exitStart: 0.78, scatter: 2.4, farBlur: 10, farFade: 0.8 });
  }

  /* ---------- Anel de tracinhos (+20 anos) ---------- */
  var ticksSvg = $('#ticks'), TICKS = 60, tickEls = [];
  for (var t = 0; t < TICKS; t++) {
    var a = (t / TICKS) * Math.PI * 2 - Math.PI / 2;
    var ln = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', (Math.cos(a) * 82).toFixed(2)); ln.setAttribute('y1', (Math.sin(a) * 82).toFixed(2));
    ln.setAttribute('x2', (Math.cos(a) * 94).toFixed(2)); ln.setAttribute('y2', (Math.sin(a) * 94).toFixed(2));
    ticksSvg.appendChild(ln); tickEls.push(ln);
  }

  /* ---------- Manifesto: palavras ---------- */
  var manifesto = $('#manifesto'), manWords = [];
  (function splitManifesto(el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = doc.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(doc.createTextNode(w)); return; }
          var sp = doc.createElement('span'); sp.className = 'w' + (el.hasAttribute && el.hasAttribute('data-hl') ? ' hl' : ''); sp.textContent = w;
          frag.appendChild(sp); manWords.push(sp);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) splitManifesto(n);
    });
  })(manifesto);

  /* ---------- Mapa do Brasil ---------- */
  var mapa = window.BR_MAP, mapSvg = $('#mapa-svg'), pins = [];
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = doc.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  if (mapa && mapSvg) {
    mapSvg.setAttribute('viewBox', '-20 -70 1040 ' + (mapa.h + 110));
    var defs = el('defs', {}, mapSvg);
    var g1 = el('linearGradient', { id: 'pinBody', x1: '0', y1: '0', x2: '1', y2: '0.4' }, defs);
    el('stop', { offset: '0', 'stop-color': '#FFA066' }, g1); el('stop', { offset: '.45', 'stop-color': '#F0612A' }, g1); el('stop', { offset: '1', 'stop-color': '#A8350F' }, g1);
    var g2 = el('radialGradient', { id: 'pinHole', cx: '.4', cy: '.35', r: '.8' }, defs);
    el('stop', { offset: '0', 'stop-color': '#7A250A' }, g2); el('stop', { offset: '1', 'stop-color': '#C9461B' }, g2);
    var f = el('filter', { id: 'mapShadow', x: '-20%', y: '-20%', width: '140%', height: '150%' }, defs);
    el('feDropShadow', { dx: '18', dy: '26', stdDeviation: '16', 'flood-color': '#000', 'flood-opacity': '.65' }, f);
    var shape = el('g', { id: 'brShape' }, defs);
    mapa.estados.forEach(function (s) { el('path', { d: s.d }, shape); });

    var base = el('g', { filter: 'url(#mapShadow)' }, mapSvg);
    for (var k = 12; k >= 1; k--) {
      var c = Math.round(70 + (12 - k) * 6);
      el('use', { href: '#brShape', transform: 'translate(0,' + k * 1.4 + ')', fill: 'rgb(' + c + ',' + c + ',' + (c + 4) + ')' }, base);
    }
    var top = el('g', {}, mapSvg);
    var stateEl = {};
    mapa.estados.forEach(function (s) {
      var p = el('path', { d: s.d, class: 'st', fill: '#ECECEE' }, top);
      var tt = el('title', {}, p); tt.textContent = s.nome;
      stateEl[s.uf] = p;
    });

    // Ordem de queda: começa em SP (fábrica em Limeira) e se espalha pela distância.
    var sp = mapa.estados.filter(function (s) { return s.uf === 'SP'; })[0];
    var ordem = mapa.estados.slice().sort(function (a, b) {
      return Math.hypot(a.x - sp.x, a.y - sp.y) - Math.hypot(b.x - sp.x, b.y - sp.y);
    });
    var shades = ['#E7511F', '#FF8A4D', '#C8441A', '#FFB38A', '#F26B2E', '#A8350F', '#FF9E66', '#D9531F', '#FFC7A3', '#B9401A'];
    var pinLayer = el('g', {}, mapSvg);
    ordem.forEach(function (s, i) {
      var gp = el('g', { transform: 'translate(' + s.x + ',' + s.y + ')' }, pinLayer);
      var sh = el('ellipse', { cx: '0', cy: '0', rx: '10', ry: '3.4', fill: '#000', opacity: '.45' }, gp);
      var drop = el('g', {}, gp);
      var sc = el('g', { transform: 'scale(.82)' }, drop);
      el('path', { d: 'M0 0C-4-10-16-21-16-35A16 16 0 1 1 16-35C16-21 4-10 0 0Z', fill: 'url(#pinBody)' }, sc);
      el('path', { d: 'M0 0C3-9 12-19 14-31C10-20 4-10 0 0Z', fill: '#000', opacity: '.18' }, sc);
      el('circle', { cx: '0', cy: '-35', r: '7', fill: 'url(#pinHole)' }, sc);
      el('circle', { cx: '0', cy: '-35', r: '7', fill: 'none', stroke: '#FFC7A3', 'stroke-width': '1.2', opacity: '.6' }, sc);
      el('ellipse', { cx: '-7', cy: '-43', rx: '5.5', ry: '3', fill: '#fff', opacity: '.55', transform: 'rotate(-35 -7 -43)' }, sc);
      pins.push({ uf: s.uf, nome: s.nome, g: gp, drop: drop, shadow: sh, state: stateEl[s.uf], shade: i === 0 ? '#E7511F' : shades[i % shades.length] });
    });
    if (!ANIM) pins.forEach(function (p) { p.state.setAttribute('fill', p.shade); });
  }

  /* ---------- Formulário final ---------- */
  var form = $('#lead-form'), msg = $('#form-msg');
  var tel = form.elements.whatsapp;
  tel.addEventListener('input', function () {
    var d = tel.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    tel.value = out;
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var nome = f.nome.value.trim();
    var fone = tel.value.replace(/\D/g, '');
    var email = f.email.value.trim();
    var cidade = f.cidade.value.trim();
    // Valida na ordem dos campos e foca o primeiro com problema
    var checks = [
      [f.nome, nome.length >= 2, 'Informe seu nome para continuar.'],
      [tel, fone.length >= 10, 'Informe um WhatsApp válido com DDD.'],
      [f.email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), 'Informe um e-mail válido.'],
      [f.cidade, cidade.length >= 2, 'Informe sua cidade e estado.']
    ];
    var erro = null;
    checks.forEach(function (c) {
      c[0].setAttribute('aria-invalid', String(!c[1]));
      if (!c[1] && !erro) erro = c;
    });
    if (erro) { msg.textContent = erro[2]; erro[0].focus(); return; }
    var texto = 'Olá! Vim pela Black Guará e quero saber dos kits com até 30% OFF.\n\n' +
      'Nome: ' + nome + '\nWhatsApp: ' + tel.value + '\nE-mail: ' + email + '\nCidade: ' + cidade;
    // Robôs preenchem o campo invisível: descarta sem avisar
    if (f._honey && f._honey.value) return;
    track({ lead_channel: 'formulario_whatsapp', lead_origin: 'cta-final', lead_city: cidade });
    var primeiro = nome.split(' ')[0];
    msg.textContent = 'Perfeito, ' + primeiro + '! Abrindo o WhatsApp do nosso time comercial...';
    // O WhatsApp abre já, ainda dentro do clique (senão o navegador bloqueia a nova aba)
    var w = window.open(waLink(texto), '_blank');
    if (w) w.opener = null;
    enviarLeadEmail({ nome: nome, whatsapp: tel.value, email: email, cidade: cidade }).then(function (ok) {
      if (ok) { msg.textContent = 'Recebemos seus dados, ' + primeiro + '! Nosso time comercial vai falar com você.'; form.reset(); }
      else if (w) msg.textContent = 'WhatsApp aberto, ' + primeiro + '! Se preferir, ligue (19) 3442-2196.';
      if (!w) location.href = waLink(texto);
    });
  });

  // Envia a cópia do lead por e-mail para contato@guaraequipamentos.com.br
  function enviarLeadEmail(lead) {
    if (!CONFIG.leadEndpoint || !window.fetch) return Promise.resolve(false);
    var origem = utm || 'direto';
    var body = {
      _subject: CONFIG.leadAssunto,
      _template: 'table',
      _captcha: 'false',
      Assunto: CONFIG.leadAssunto,
      Nome: lead.nome,
      WhatsApp: lead.whatsapp,
      'E-mail': lead.email,
      Cidade: lead.cidade,
      Origem: origem,
      Pagina: location.href.split('#')[0],
      Data: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    };
    body._replyto = lead.email;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    return fetch(CONFIG.leadEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { clearTimeout(timer); return r.ok; })
      .catch(function () { clearTimeout(timer); return false; });
  }

  /* ================= MOTION (GSAP) ================= */
  if (!ANIM) {
    if (mapa) { $('#mapa-n').textContent = '27'; }
    return;
  }

  // Rolagem suave cinematográfica
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('.js-scroll').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = $(a.getAttribute('href')); if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.6 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Títulos: palavras sobem de dentro de uma máscara
  function splitWords(elm) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var outer = doc.createElement('span'); outer.className = 'split-line'; outer.style.display = 'inline-block'; outer.style.verticalAlign = 'top';
            var inner = doc.createElement('span'); inner.textContent = w;
            outer.appendChild(inner); frag.appendChild(outer); words.push(inner);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(elm);
    return words;
  }

  // HERO: letterbox abre, título sobe, contagem e cartões entram
  var heroWords = splitWords($('#hero-title'));
  gsap.set(heroWords, { y: 0, yPercent: 105 });
  gsap.set('.letterbox', { scaleY: 1 });
  var intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro.to('.letterbox', { scaleY: 0, duration: 1.4, ease: 'expo.inOut' })
    .from('.hero-film video', { scale: 1.12, duration: 2, ease: 'power3.out' }, 0)
    .fromTo('.hero-in', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.7)
    .to(heroWords, { yPercent: 0, duration: 1.1, stagger: 0.045 }, 0.75)
    .fromTo('.hero-pop', { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.12, ease: 'back.out(1.6)' }, 1.1)
    .from('.hero-giant', { yPercent: 70, opacity: 0, duration: 1.6, ease: 'expo.out' }, 1.0);

  // Vídeo do hero respira e a palavra gigante desliza com a rolagem
  gsap.to('.hero-film video', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-giant', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  // Pausa o vídeo fora da tela (economia de bateria) e retoma ao voltar
  var heroVideo = $('#hero-video');
  ScrollTrigger.create({ trigger: '.hero-film', start: 'top bottom', end: 'bottom top', onToggle: function (st) { if (st.isActive) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); } else heroVideo.pause(); } });

  // Fitas aceleram conforme a velocidade da rolagem
  var tapes = $$('.tape-track').map(function (t) { return t.getAnimations ? t.getAnimations()[0] : null; }).filter(Boolean);
  ScrollTrigger.create({
    trigger: '.tapes', start: 'top bottom', end: 'bottom top',
    onUpdate: function (st) {
      var v = Math.min(4, 1 + Math.abs(st.getVelocity()) / 600);
      tapes.forEach(function (an) { an.playbackRate = v; });
      gsap.delayedCall(0.25, function () { tapes.forEach(function (an) { an.playbackRate = 1; }); });
    }
  });
  gsap.fromTo('.tape.a', { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.tape.b', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Títulos de seção
  $$('h2.split').filter(function (h) { return h.id !== 'hero-title'; }).forEach(function (h) {
    var w = splitWords(h);
    gsap.set(w, { y: 0, yPercent: 105 });
    gsap.to(w, { yPercent: 0, duration: 1, stagger: 0.04, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  });

  // Revelações genéricas
  ScrollTrigger.batch('.rv', {
    start: 'top 88%', once: true,
    onEnter: function (batch) { gsap.fromTo(batch, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out', overwrite: true }); }
  });

  // Fotos dos kits: abrem como cortina e assentam
  $$('.kit-media img').forEach(function (img) {
    gsap.fromTo(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.25 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: img, start: 'top 88%', once: true } });
  });

  // Números 01 02 03 deslizam
  $$('.dcard .num').forEach(function (n) {
    gsap.fromTo(n, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: n.parentNode, start: 'top 80%', once: true } });
  });
  $$('.dcard.photo').forEach(function (card, i) {
    // Parallax leve em cada foto, com intensidade um pouco diferente por card
    gsap.fromTo(card.querySelector('.bgimg'), { yPercent: 0, scale: 1.12 }, { yPercent: -6 - i * 2, scale: 1.12, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Manifesto: as palavras acendem com a rolagem
  var manTl = gsap.timeline({ scrollTrigger: { trigger: '#manifesto', start: 'top 80%', end: 'bottom 40%', scrub: 0.6 } });
  manWords.forEach(function (w, i) {
    manTl.to(w, { color: w.classList.contains('hl') ? '#E7511F' : '#F5F5F4', duration: 1, ease: 'none' }, i * 0.5);
  });

  // +20 anos: tracinhos acendem e o número conta
  var tickState = { p: 0 };
  gsap.to(tickState, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: '.big-stat.ring', start: 'top 85%', end: 'center 45%', scrub: 0.5 },
    onUpdate: function () { var on = Math.round(tickState.p * TICKS); tickEls.forEach(function (l, i) { l.classList.toggle('on', i < on); }); }
  });
  $$('[data-count]').forEach(function (c) {
    var to = +c.dataset.count, o = { v: 0 };
    c.textContent = '0';
    gsap.to(o, { v: to, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 85%', once: true }, onUpdate: function () { c.textContent = Math.round(o.v); } });
  });

  // ZOOM PARALLAX: guará no centro, fotos da Guará ao redor (escalas do original: 4,5,6,5,6,8,9)
  var zoomScales = [4, 5, 6, 5, 6, 8, 9];
  var zoomTl = gsap.timeline({ scrollTrigger: { trigger: '#guara-brasil', start: 'top top', end: 'bottom bottom', scrub: true } });
  $$('#guara-brasil .zoom__layer').forEach(function (layer, i) {
    zoomTl.fromTo(layer, { scale: 1 }, { scale: zoomScales[i % zoomScales.length], ease: 'none', duration: 1 }, 0);
  });
  zoomTl.fromTo('#guara-brasil .zoom__caption', { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.22 }, 0.72);

  // MAPA: seção fixa, os pins caem um por vez e o estado se pinta de laranja
  if (pins.length) {
    var nEl = $('#mapa-n'), ufEl = $('#mapa-uf');
    nEl.textContent = '0';
    var STEP = 0.5, LAND = 0.62;
    pins.forEach(function (p) {
      gsap.set(p.drop, { y: -480, opacity: 0 });
      gsap.set(p.shadow, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    });
    var mapTl = gsap.timeline({
      scrollTrigger: { trigger: '#mapa', start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * 2.6); }, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
      onUpdate: function () {
        var tm = mapTl.time(), n = 0, last = '';
        pins.forEach(function (p, i) { if (tm >= i * STEP + LAND) { n++; last = p.uf; } });
        nEl.textContent = n; ufEl.textContent = last;
      }
    });
    pins.forEach(function (p, i) {
      var at = i * STEP;
      mapTl.to(p.drop, { y: 0, opacity: 1, duration: 1, ease: 'bounce.out' }, at)
        .to(p.shadow, { scale: 1, opacity: 0.45, duration: 0.8, ease: 'power2.out' }, at + 0.2)
        .to(p.state, { attr: { fill: p.shade }, duration: 0.4, ease: 'power1.out' }, at + LAND);
    });
    mapTl.to({}, { duration: 1 }); // respiro com o mapa completo antes de soltar
  }

  // CTA final: frase gigante atravessa a tela
  gsap.fromTo('.final-giant', { xPercent: 4 }, { xPercent: -42, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Após fontes e imagens carregarem, recalcula posições
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
