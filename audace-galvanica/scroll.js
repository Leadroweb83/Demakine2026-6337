/* Audace Galvânica | animações presas à rolagem (GSAP + ScrollTrigger, hospedados em vendor/)
   Itens escolhidos pelo cliente: 2 hero em camadas, 3 etapas fixas, 7 frase palavra por palavra,
   8 formulário em destaque, 9 menu que acompanha a leitura, 10 chegada do mapa.
   Tudo que é movimento só roda com .js-motion e sem pedido de movimento reduzido. */
(function () {
  'use strict';
  /* O GSAP (≈46 KB compactado) só é baixado depois que a página terminou de abrir e o
     navegador ficou livre: nada disso aparece antes da primeira rolagem, e assim a foto
     do hero não disputa a rede com ele. */
  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var sc = document.createElement('script'); sc.src = src; sc.async = true;
      sc.onload = ok; sc.onerror = fail; document.head.appendChild(sc);
    });
  }
  function boot() {
    loadScript('vendor/gsap.min.js')
      .then(function () { return loadScript('vendor/ScrollTrigger.min.js'); })
      .then(init)
      .catch(function () { /* sem GSAP a página segue com as animações de script.js */ });
  }
  function idle() { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(boot, { timeout: 2000 }); }
  if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle);

  function init() {
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  window.__audaceGsap = true;
  var hp = document.querySelector('.hero .section__bg picture');
  if (hp) hp.style.removeProperty('--hero-y');
  var oldSteps = document.querySelector('[data-steps]');
  if (oldSteps && window.matchMedia('(min-width: 1024px)').matches) {
    oldSteps.classList.remove('has-active');
    Array.prototype.forEach.call(oldSteps.querySelectorAll('.step'), function (st) { st.classList.remove('is-active'); });
  }

  var root = document.documentElement;
  var motion = root.classList.contains('js-motion');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var mm = gsap.matchMedia();

  if (motion) {
    /* 3. Como funciona: seção fixa no desktop, etapas acendem uma a uma e a linha dourada cresce */
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
      var list = $('[data-steps]');
      if (!list) return;
      var steps = $$('.step', list);
      var sec = $('#como-funciona');
      sec.classList.add('is-pin-mode');
      ST.create({
        trigger: '#como-funciona',
        start: 'top 96px',
        end: function () { return '+=' + Math.round(window.innerHeight * 1.2); },
        pin: true,
        onUpdate: function (self) {
          var p = self.progress;
          var line = p <= 0.3 ? 0.5 * p / 0.3 : 0.5 + 0.5 * clamp((p - 0.3) / 0.35);
          var active = p < 0.3 ? 0 : p < 0.65 ? 1 : 2;
          list.style.setProperty('--steps-p', line.toFixed(3));
          list.classList.add('has-active');
          steps.forEach(function (s, i) { s.classList.toggle('is-active', i === active); });
        },
        onLeave: function () { list.classList.remove('has-active'); },
        onLeaveBack: function () { list.classList.remove('has-active'); }
      });
      return function () { sec.classList.remove('is-pin-mode'); list.classList.remove('has-active'); steps.forEach(function (s) { s.classList.remove('is-active'); }); };
    });

    mm.add({
      big: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      small: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)'
    }, function (ctx) {
      var big = ctx.conditions.big;
      if (!ctx.conditions.big && !ctx.conditions.small) return;

      /* 2. Hero em camadas: foto desce devagar, texto sobe mais rápido, palavras laterais somem por último */
      var hero = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      hero.to('.hero .section__bg picture', { yPercent: big ? 12 : 6, ease: 'none' }, 0)
          .to('.hero__copy', { y: big ? -120 : -60, ease: 'none' }, 0);
      if (big) hero.to('.hero__side-words', { y: -50, opacity: 0, ease: 'none', duration: 0.6 }, 0.4);

      /* 7. Frase da consultoria acende palavra por palavra (a parte dourada termina dourada) */
      $$('[data-words]').forEach(function (p) {
        p.removeAttribute('data-gold-progress');
        if (!p.querySelector('.w')) splitWords(p);
        gsap.fromTo($$('.w', p), { opacity: 0.18 }, {
          opacity: 1, ease: 'none', stagger: 0.1,
          scrollTrigger: { trigger: p, start: 'top 88%', end: 'top 42%', scrub: true }
        });
      });

      /* 8. Formulário: o cartão cresce e o fundo escurece ao chegar; o botão brilha no centro da tela */
      var form = $('#formulario');
      if (form) {
        var sc = { trigger: form, start: 'top 85%', end: 'top 20%', scrub: true };
        gsap.fromTo('.form-card', { '--pull': 0.94 }, { '--pull': 1, ease: 'none', scrollTrigger: sc });
        gsap.fromTo(form, { '--dim': 0 }, { '--dim': 0.5, ease: 'none', scrollTrigger: sc });
        var btn = $('.lead-form .btn--gold', form);
        if (btn) ST.create({ trigger: btn, start: 'center 64%', end: 'center 36%', toggleClass: { targets: btn, className: 'is-lit' } });
      }

      /* 10. Mapa: entra com zoom suave e o pin com a logo cai no lugar */
      if ($('.place__map')) {
        gsap.timeline({ scrollTrigger: { trigger: '.place__map', start: 'top 80%', toggleActions: 'play none none none' } })
          .from('.place__map iframe', { scale: 1.12, duration: 1.4, ease: 'power3.out' })
          .fromTo('.map-pin', { '--drop': '-90px', opacity: 0 }, { '--drop': '0px', opacity: 1, duration: 0.9, ease: 'bounce.out' }, 0.5)
          .from('.place__map-hint', { opacity: 0, y: 8, duration: 0.5 }, 1.1);
      }
    });
  }

  /* 9. Menu acompanha a leitura: o item da seção na tela ganha o sublinhado dourado.
     Quando dois itens levam à mesma seção, o último (o de nome igual à seção) é o marcado. */
  var byHash = {};
  $$('.site-nav__list a[href^="#"]').forEach(function (a) { byHash[a.getAttribute('href')] = a; });
  Object.keys(byHash).forEach(function (hash) {
    var sec = $(hash), link = byHash[hash];
    if (!sec) return;
    ST.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: function (self) {
        link.classList.toggle('is-current', self.isActive);
        if (self.isActive) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      }
    });
  });

  /* Abrir e fechar perguntas muda a altura da página: recalcula os gatilhos */
  $$('details').forEach(function (d) { d.addEventListener('toggle', function () { ST.refresh(); }); });

  /* Anel 3D do hero (three.js, vendor/hero3d.min.js): só com animações ligadas.
     Sem WebGL, ou se falhar, a foto do hero continua. */
  if (motion) {
    import('./vendor/hero3d.min.js')
      .then(function (m) { m.initHero3D({ gsap: gsap, ScrollTrigger: ST, reduce: false }); })
      .catch(function () {});
  }
  }

  function splitWords(el) {
    Array.prototype.slice.call(el.querySelectorAll('*')).concat([el]).forEach(function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (t) {
        if (t.nodeType !== 3 || !t.nodeValue.trim()) return;
        var frag = document.createDocumentFragment();
        t.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span');
          w.className = 'w'; w.textContent = part;
          frag.appendChild(w);
        });
        node.replaceChild(frag, t);
      });
    });
  }
})();
