/* Órbita de cards guiada pela rolagem (porte em JavaScript puro do OrbitalCards).
   Mantém intro, órbita, saída e modo de movimento reduzido do original.
   Acréscimo da Guará: durante a saída o título das dores dá lugar ao bloco .orb__solution. */
(function () {
  var FRONT_ANGLE = 80;
  var STAGGER = 0.2;
  var START_SCALE = 0.25;
  var CATCH_UP = 0.15;
  var LERP = 0.12;
  var TRIGGER = 0.25;
  var DEPTH = 0.6;
  var FOCUS_BOOST = 0.1;
  var EXIT_SCALE = 0.85;
  var EXIT_STAGGER = 0.4;
  var NARROW = 560;
  var NARROW_X = 0.94;
  var NARROW_Y = 0.54;
  var NARROW_FRONT = 90;
  var RAD = Math.PI / 180;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) { return 1 + 2.25 * Math.pow(t - 1, 3) + 1.25 * Math.pow(t - 1, 2); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function initOrbitalCards(root, options) {
    var host = root.ownerDocument.defaultView;
    var reducedMotion = host.matchMedia('(prefers-reduced-motion: reduce)');
    var cleanup = function () {};
    function remount() {
      cleanup();
      cleanup = function () {};
      cleanup = mountMode(root, options, reducedMotion.matches);
    }
    reducedMotion.addEventListener('change', remount);
    try { remount(); } catch (e) { reducedMotion.removeEventListener('change', remount); throw e; }
    return function () {
      reducedMotion.removeEventListener('change', remount);
      cleanup();
    };
  }

  function mountMode(root, o, reduced) {
    var host = root.ownerDocument.defaultView;
    var stage = root.querySelector('.orb__stage');
    var center = root.querySelector('.orb__center');
    var solution = root.querySelector('.orb__solution');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.orb__card'));
    var count = cards.length;
    var step = 360 / count;
    var rotAtExit = -o.steps * step;
    var abort = new AbortController();
    var signal = abort.signal;
    var observers = [];
    var raf = 0;
    function dispose() {
      abort.abort();
      observers.forEach(function (ob) { ob.disconnect(); });
      host.cancelAnimationFrame(raf);
      raf = 0;
      cards.forEach(function (c) { c.removeAttribute('style'); });
      center.removeAttribute('style');
      if (solution) solution.removeAttribute('style');
    }

    var radiusX = 0, radiusY = 0, cardHalfHeight = 0, depthRange = DEPTH, focusBoost = FOCUS_BOOST, frontAngle = FRONT_ANGLE;
    function measure() {
      var width = root.clientWidth || 1;
      var ring = stage.clientWidth || width;
      var narrow = width < NARROW;
      radiusX = ring * (narrow ? NARROW_X : o.radiusX / 100);
      radiusY = ring * (narrow ? NARROW_Y : o.radiusY / 100);
      depthRange = narrow ? 0 : DEPTH;
      focusBoost = narrow ? 0 : FOCUS_BOOST;
      frontAngle = narrow ? NARROW_FRONT : FRONT_ANGLE;
      cardHalfHeight = (cards[0] ? cards[0].offsetHeight : 0) / 2;
    }

    var target = 0, current = 0, intro = 0, onScreen = false, introActive = false, fullyOut = true, last = 0;
    function readScroll() {
      var rect = root.getBoundingClientRect();
      var viewport = host.innerHeight || 1;
      introActive = rect.top <= viewport * TRIGGER && rect.bottom > 0;
      fullyOut = rect.bottom <= 0 || rect.top >= viewport;
      var travel = root.offsetHeight - viewport;
      target = travel <= 0 ? 0 : clamp(-rect.top / travel, 0, 1);
    }

    function paint(p, it, seat) {
      var seats = seat !== undefined ? seat : (p / o.exitStart) * o.steps;
      var ringRot = -seats * step;
      var exit = seat === undefined ? clamp((p - o.exitStart) / (1 - o.exitStart), 0, 1) : 0;
      for (var i = 0; i < count; i++) {
        var t = clamp((it - (i / (count - 1)) * STAGGER) / (1 - STAGGER), 0, 1);
        var spread = easeOutBack(t);
        var appear = easeOutCubic(clamp(t * 1.7, 0, 1));
        var angle = (frontAngle + i * step + ringRot) * RAD;
        var order = ((((i * step + rotAtExit) % 360) + 360) % 360) / step;
        var et = clamp((exit - (order / (count - 1)) * EXIT_STAGGER) / (1 - EXIT_STAGGER), 0, 1);
        var exitT = et * et * et;
        var exitMul = 1 + (o.scatter - 1) * exitT;
        var x = Math.cos(angle) * radiusX * spread * exitMul;
        var y = Math.sin(angle) * radiusY * spread * exitMul;
        var depth = (Math.sin(angle) + 1) / 2;
        var focus = Math.pow(depth, 8);
        var ringScale = (1 - depthRange / 2) + depthRange * depth + focusBoost * focus;
        var scale = mix(START_SCALE, ringScale, clamp(spread, 0, 1)) * mix(1, EXIT_SCALE, exitT);
        var blur = o.farBlur * (1 - depth) * (1 - focus) * appear;
        var opacity = appear * (1 - o.farFade * (1 - depth) * (1 - focus)) * (1 - exitT);
        var card = cards[i];
        card.style.transform = 'translate3d(' + x.toFixed(2) + 'px, ' + (y - cardHalfHeight).toFixed(2) + 'px, 0) scale(' + scale.toFixed(3) + ')';
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
        card.style.zIndex = String(Math.round(depth * 100));
      }
      var headIn = easeInOutCubic(clamp(it * 1.2, 0, 1));
      // O título central some por completo na primeira metade da saída, antes da mensagem final entrar
      var headOut = easeInOutCubic(clamp(exit / 0.4, 0, 1));
      center.style.transform = 'translate(-50%, -50%) scale(' + (mix(0.92, 1, headIn) * mix(1, 0.96, headOut)).toFixed(3) + ')';
      center.style.opacity = (mix(0.35, 1, headIn) * (1 - headOut)).toFixed(3);
      if (solution) {
        // A mensagem final entra quando o título central já saiu.
        var solIn = easeInOutCubic(clamp((exit - 0.35) / 0.5, 0, 1));
        solution.style.transform = 'translate(-50%, -50%) scale(' + mix(1.06, 1, solIn).toFixed(3) + ')';
        solution.style.opacity = solIn.toFixed(3);
        solution.style.visibility = solIn > 0.01 ? 'visible' : 'hidden';
      }
    }

    function frame(now) {
      raf = 0;
      if (signal.aborted) return;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (fullyOut) intro = 0;
      else intro = clamp(intro + (introActive ? 1 : -1) * dt / o.entry, 0, 1);
      current += (target - current) * LERP;
      if (Math.abs(target - current) < 0.0002) current = target;
      paint(current, Math.max(intro, clamp(current / CATCH_UP, 0, 1)));
      if (onScreen) raf = host.requestAnimationFrame(frame);
    }

    try {
      if (reduced) {
        // Anel parado: a rolagem avança um card inteiro por vez. No fim mostra a solução.
        var still = function () {
          readScroll();
          paint(0, 1, Math.round(target * (count - 1)));
          if (solution) {
            var show = target > 0.9;
            solution.style.transform = 'translate(-50%, -50%)';
            solution.style.opacity = show ? '1' : '0';
            solution.style.visibility = show ? 'visible' : 'hidden';
            center.style.opacity = show ? '0' : '1';
          }
        };
        var resizeR = function () { measure(); still(); };
        host.addEventListener('scroll', still, { passive: true, signal: signal });
        host.addEventListener('resize', resizeR, { signal: signal });
        var roR = new ResizeObserver(resizeR);
        observers.push(roR);
        roR.observe(root);
        cards.forEach(function (c) { roR.observe(c); });
        resizeR();
        return dispose;
      }
      var resize = function () { measure(); readScroll(); };
      host.addEventListener('scroll', readScroll, { passive: true, signal: signal });
      host.addEventListener('resize', resize, { signal: signal });
      var ro = new ResizeObserver(resize);
      observers.push(ro);
      ro.observe(root);
      ro.observe(stage);
      cards.forEach(function (c) { ro.observe(c); });
      var io = new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (!onScreen || raf || signal.aborted) return;
        readScroll();
        last = performance.now();
        raf = host.requestAnimationFrame(frame);
      });
      observers.push(io);
      io.observe(root);
      resize();
      paint(0, 0);
    } catch (e) {
      dispose();
      throw e;
    }
    return dispose;
  }

  window.initOrbitalCards = initOrbitalCards;
})();
