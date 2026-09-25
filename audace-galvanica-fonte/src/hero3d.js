/* Audace Galvânica | anel 3D do hero (three.js), empacotado com `npm run build:3d`.
   Anel com banho de ouro e diamante em lapidação brilhante, feito em código (sem arquivo 3D).
   Entrada: o anel começa em metal bruto e recebe o "banho" de ouro. Depois gira devagar,
   muda de ângulo com a rolagem (GSAP ScrollTrigger) e inclina com o mouse no desktop.
   A foto do hero continua sendo a imagem principal até o 3D estar pronto (e fica se não houver WebGL). */
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, Group, Mesh, Color,
  LatheGeometry, CylinderGeometry, SphereGeometry, Vector2, Vector3, MeshPhysicalMaterial, DirectionalLight,
  ACESFilmicToneMapping, SRGBColorSpace, MathUtils
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const GOLD = new Color('#E2B866');
const RAW = new Color('#8C8983');

function bandGeometry() {
  // perfil "comfort fit" (retângulo arredondado) girado em torno do eixo: aro liso e grosso
  const pts = [];
  const r0 = 1.07, w = 0.085, h = 0.19, n = 64;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const x = r0 + w * Math.sign(c) * Math.pow(Math.abs(c), 0.55);
    const y = h * Math.sign(s) * Math.pow(Math.abs(s), 0.55);
    pts.push(new Vector2(x, y));
  }
  return new LatheGeometry(pts, 160);
}

function diamondGeometry(R) {
  // lapidação brilhante simplificada: pavilhão, cintura, coroa e mesa (facetas pelo flatShading)
  const pts = [
    new Vector2(0.0001, -0.62 * R),
    new Vector2(R, -0.02 * R),
    new Vector2(R, 0.03 * R),
    new Vector2(0.72 * R, 0.3 * R),
    new Vector2(0.52 * R, 0.4 * R),
    new Vector2(0.0001, 0.4 * R)
  ];
  return new LatheGeometry(pts, 16);
}

export function initHero3D(opts) {
  const gsap = opts && opts.gsap;
  const reduce = !!(opts && opts.reduce);
  const host = document.querySelector('.hero .section__bg');
  if (!host) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  const gl = renderer.getContext();
  if (!gl) return;
  // sem placa de vídeo real (renderização por software) o 3D travaria a página: fica a foto
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    const force = /[?&]3d=force\b/.test(location.search); // teste: liga mesmo sem GPU
    if (!force && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) { renderer.dispose(); return; }
  } catch (e) { /* segue */ }
  host.appendChild(canvas);

  const small = window.matchMedia('(max-width: 1023px)');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small.matches ? 1.5 : 1.6));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.35, 7.4);
  camera.lookAt(0, 0, 0);

  // luz quente de estúdio + contraluz azul da paleta (#193D89)
  const key = new DirectionalLight(0xffe3b3, 2.4); key.position.set(3, 4, 5); scene.add(key);
  const rim = new DirectionalLight(0x3d6bff, 3.2); rim.position.set(-5, 1.5, -3); scene.add(rim);
  const fill = new DirectionalLight(0xffffff, 0.6); fill.position.set(-2, -3, 4); scene.add(fill);

  const metal = new MeshPhysicalMaterial({
    color: reduce ? GOLD.clone() : RAW.clone(), metalness: 1,
    roughness: reduce ? 0.16 : 0.5, clearcoat: reduce ? 0.45 : 0, clearcoatRoughness: 0.18, envMapIntensity: 1.35
  });
  const stone = new MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, ior: 2.42, thickness: 0.6,
    dispersion: 4, iridescence: 0.25, iridescenceIOR: 1.9, specularIntensity: 1, envMapIntensity: 3, flatShading: true
  });

  const ring = new Group();
  const band = new Mesh(bandGeometry(), metal);
  band.rotation.x = Math.PI / 2; // aro de pé, de frente para a câmera
  ring.add(band);

  const topY = 1.07 + 0.085;
  const R = 0.34;                       // raio da pedra
  const gemY = topY + 0.36;             // cintura da pedra
  // cesto (cathedral): cone que nasce no aro e recebe a ponta do pavilhão
  const head = new Mesh(new CylinderGeometry(0.15, 0.08, 0.3, 32, 1, true), metal);
  head.position.y = topY + 0.1; ring.add(head);
  const seat = new Mesh(new CylinderGeometry(0.2, 0.15, 0.05, 32), metal);
  seat.position.y = topY + 0.26; ring.add(seat);
  // 4 garras: sobem do cesto, passam pela cintura e dobram sobre a coroa
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
    // garra: vai do assento (raio 0,17) até a borda da coroa (raio 0,8R), com ponta arredondada
    const x0 = ca * 0.17, z0 = sa * 0.17, y0 = topY + 0.26;
    const x1 = ca * R * 0.86, z1 = sa * R * 0.86, y1 = gemY + 0.1;
    const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
    const up = new Mesh(new CylinderGeometry(0.021, 0.026, len, 10), metal);
    up.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    up.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(x1 - x0, y1 - y0, z1 - z0).normalize());
    ring.add(up);
    const bead = new Mesh(new SphereGeometry(0.034, 16, 12), metal);
    bead.position.set(x1, y1 + 0.01, z1);
    ring.add(bead);
  }
  const gem = new Mesh(diamondGeometry(R), stone);
  gem.position.y = gemY; ring.add(gem);

  ring.rotation.set(0.28, 0.55, 0.08);
  scene.add(ring);

  // posição no quadro: no desktop o anel fica na parte visível da janela da foto (à direita)
  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const s = small.matches ? Math.min(0.78, (w / h) * 1.05) : 0.74;
    ring.scale.setScalar(s);
    ring.position.x = small.matches ? 0.1 : 0.55;
    baseY = (small.matches ? 0.05 : -0.12) - 0.28 * s;
    draw();
  }

  // estado animado
  const st = { spin: 0, scroll: 0, tx: 0, ty: 0, px: 0, py: 0, banho: reduce ? 1 : 0 };
  let running = false, visible = true, raf = 0, t0 = performance.now(), baseY = 0;

  function applyBanho() {
    metal.color.copy(RAW).lerp(GOLD, st.banho);
    metal.roughness = MathUtils.lerp(0.5, 0.16, st.banho);
    metal.clearcoat = MathUtils.lerp(0, 0.45, st.banho);
  }

  function draw() {
    const t = (performance.now() - t0) / 1000;
    st.px += (st.tx - st.px) * 0.06; st.py += (st.ty - st.py) * 0.06;
    ring.rotation.y = 0.55 + st.spin + st.scroll * Math.PI * 1.1 + st.px * 0.35;
    ring.rotation.x = 0.28 + st.scroll * 0.5 + st.py * 0.2;
    ring.rotation.z = 0.08 + st.scroll * 0.25;
    ring.position.y = baseY + (reduce ? 0 : Math.sin(t * 1.1) * 0.05);
    camera.position.z = 7.4 - st.scroll * 1.2;
    renderer.render(scene, camera);
  }

  // vigia de desempenho: mede os primeiros quadros; se o aparelho sofrer, baixa a resolução
  // e, se ainda assim estiver lento, desliga o 3D e devolve a foto
  let frames = 0, slow = 0, last = 0, degraded = false, off = false;
  function watch(now) {
    if (last) {
      frames++;
      if (now - last > 45) slow++;
      if (frames === 24) {
        if (slow > 10 && !degraded) {
          degraded = true; frames = 0; slow = 0;
          renderer.setPixelRatio(1); layout();
        } else if (slow > 10 && degraded) {
          off = true; running = false; cancelAnimationFrame(raf);
          host.classList.remove('has-3d');
          setTimeout(() => { canvas.remove(); renderer.dispose(); }, 1300);
        }
      }
    }
    last = now;
  }
  function loop(now) {
    if (!running) return;
    if (frames < 24 || !degraded) watch(now || performance.now());
    if (!running) return;
    if (!reduce) st.spin += 0.0032;
    draw();
    raf = requestAnimationFrame(loop);
  }
  function setRunning(on) {
    on = on && !off && !reduce && visible && !document.hidden;
    if (on && !running) last = 0;
    if (on === running) return;
    running = on;
    if (on) loop(); else cancelAnimationFrame(raf);
  }

  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(host);
  else window.addEventListener('resize', layout);

  // primeira imagem pronta: troca a foto pelo 3D com fade
  requestAnimationFrame(() => {
    draw();
    host.classList.add('has-3d');
  });

  if (!reduce && gsap) {
    // o "banho": do metal bruto ao ouro
    gsap.to(st, { banho: 1, duration: 2.4, delay: 0.5, ease: 'power2.inOut', onUpdate: applyBanho });
    // rolagem: o anel gira e se aproxima enquanto o hero sai da tela
    gsap.to(st, { scroll: 1, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
  } else {
    applyBanho();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; setRunning(true); }, { rootMargin: '80px 0px' }).observe(host);
  }
  document.addEventListener('visibilitychange', () => setRunning(true));

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (fine.matches && !reduce) {
    window.addEventListener('pointermove', (e) => {
      st.tx = (e.clientX / window.innerWidth) * 2 - 1;
      st.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  setRunning(true);
  if (reduce) draw();
}
