/* Audace Galvânica | anel e brinco 3D que acompanham a rolagem (three.js), gerado com `npm run build:3d`.
   Peças feitas em código, sem arquivo 3D:
   - anel de dois fios torcidos (corda) com bordas de milgrain (micro-bolinhas);
   - brinco com tarraxa em cúpula e coroa de bolinhas, argola de ligação e pingente em gota com moldura
     dupla, contorno de bolinhas e filigrana entrelaçada no centro.
   Coreografia: começam em metal bruto no hero, descem com a página passando pelas fotos da Consultoria
   e da Estratégia enquanto recebem o banho de ouro, e mergulham atrás da seção Diferenciais.
   O canvas é fixo na tela, abaixo do cabeçalho e acima só das três primeiras seções. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, Group, Mesh, Color, Curve, Vector3,
  TubeGeometry, TorusGeometry, TorusKnotGeometry, SphereGeometry, InstancedMesh, Object3D,
  MeshPhysicalMaterial, DirectionalLight, ACESFilmicToneMapping, SRGBColorSpace, MathUtils
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const FORCE = /[?&]3d=force\b/.test(location.search); // teste: liga sem GPU e sem o vigia
const GOLD = new Color('#E2B866');
const RAW = new Color('#8C8983');
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ---------- geometria ---------- */
class RopeStrand extends Curve {
  constructor(R, off, twists, phase) { super(); this.R = R; this.off = off; this.k = twists; this.ph = phase; }
  getPoint(t, target = new Vector3()) {
    const a = t * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const w = this.k * a + this.ph, o = this.off;
    // deslocamento no plano formado pela direção radial e pelo eixo do anel
    return target.set(c * (this.R + o * Math.cos(w)), s * (this.R + o * Math.cos(w)), o * Math.sin(w));
  }
}
class Teardrop extends Curve {
  constructor(w, h, cy) { super(); this.w = w; this.h = h; this.cy = cy; }
  getPoint(t, target = new Vector3()) {
    const u = t * Math.PI * 2;
    const x = this.w * Math.sin(u) * Math.sin(u / 2);
    const y = this.cy + this.h * Math.cos(u);
    return target.set(x, y, 0);
  }
}

function beads(metal, count, radius, place) {
  const mesh = new InstancedMesh(new SphereGeometry(radius, 10, 8), metal, count);
  const o = new Object3D();
  for (let i = 0; i < count; i++) { place(i, o.position); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); }
  return mesh;
}

function makeRing(metal) {
  const g = new Group();
  const R = 1;
  g.add(new Mesh(new TubeGeometry(new RopeStrand(R, 0.075, 22, 0), 720, 0.062, 12, true), metal));
  g.add(new Mesh(new TubeGeometry(new RopeStrand(R, 0.075, 22, Math.PI), 720, 0.062, 12, true), metal));
  // alma interna lisa que "segura" a corda
  const core = new Mesh(new TorusGeometry(R - 0.02, 0.05, 16, 160), metal);
  g.add(core);
  // milgrain nas duas bordas
  const n = 110;
  [-0.155, 0.155].forEach((z) => {
    g.add(beads(metal, n, 0.03, (i, p) => { const a = (i / n) * Math.PI * 2; p.set(Math.cos(a) * R, Math.sin(a) * R, z); }));
  });
  return g;
}

function makeEarring(metal) {
  const g = new Group();
  // tarraxa em cúpula com coroa de bolinhas
  const dome = new Mesh(new SphereGeometry(0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), metal);
  dome.rotation.x = Math.PI / 2; dome.scale.set(1, 1, 0.6); dome.position.set(0, 1.08, 0.02); g.add(dome);
  g.add(beads(metal, 14, 0.035, (i, p) => { const a = (i / 14) * Math.PI * 2; p.set(Math.cos(a) * 0.21, 1.08 + Math.sin(a) * 0.21, 0); }));
  // argola de ligação
  const link = new Mesh(new TorusGeometry(0.075, 0.022, 12, 40), metal);
  link.position.set(0, 0.83, 0); link.rotation.y = Math.PI / 2; g.add(link);
  // pingente em gota: moldura externa, moldura interna, bolinhas no contorno e filigrana
  const outer = new Teardrop(0.52, 0.78, -0.02);
  g.add(new Mesh(new TubeGeometry(outer, 260, 0.05, 12, true), metal));
  g.add(new Mesh(new TubeGeometry(new Teardrop(0.36, 0.56, -0.1), 220, 0.028, 10, true), metal));
  const nb = 34, tmp = new Vector3(), tmp2 = new Vector3();
  g.add(beads(metal, nb, 0.033, (i, p) => {
    const t = (i + 0.5) / nb;
    outer.getPoint(t, tmp); outer.getPoint(t + 0.002, tmp2);
    const dx = tmp2.x - tmp.x, dy = tmp2.y - tmp.y, l = Math.hypot(dx, dy) || 1;
    p.set(tmp.x + (dy / l) * 0.085, tmp.y - (dx / l) * 0.085, 0); // normal para fora
  }));
  const knot = new Mesh(new TorusKnotGeometry(0.17, 0.024, 180, 8, 2, 5), metal);
  knot.position.set(0, -0.22, 0); g.add(knot);
  const drop = new Mesh(new SphereGeometry(0.06, 20, 14), metal);
  drop.position.set(0, -0.62, 0); g.add(drop);
  g.position.y = -0.1;
  const wrap = new Group(); wrap.add(g);
  return wrap;
}

/* ---------- coreografia ----------
   Antes e depois: voltam nas laterais da imagem principal, com 15% delas atrás da imagem,
      e se transformam do bruto ao ouro conforme a seção entra na tela. Entre as duas, não aparecem. */
const HERO = {
  big: { ring: [0.905, 0.27], ear: [0.9, 0.77], size: 150 },
  small: { ring: [0.83, 0.13], ear: [0.87, 0.37], size: 74 }
};
const HIDE = 0.15; // fração das peças escondida atrás da imagem do Antes e depois

export function initJoias(opts) {
  const ST = opts && opts.ScrollTrigger;
  if (!document.querySelector('#diferenciais')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'joias3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  const gl = renderer.getContext();
  if (!gl) return;
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    if (!FORCE && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) { renderer.dispose(); return; }
  } catch (e) { /* segue */ }
  document.body.appendChild(canvas);

  const small = window.matchMedia('(max-width: 1023px)');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const key = new DirectionalLight(0xffe3b3, 2.4); key.position.set(3, 4, 6); scene.add(key);
  const rim = new DirectionalLight(0x3d6bff, 3); rim.position.set(-5, 2, -3); scene.add(rim);
  const fill = new DirectionalLight(0xffffff, 0.6); fill.position.set(-2, -3, 5); scene.add(fill);

  const metal = new MeshPhysicalMaterial({ color: RAW.clone(), metalness: 1, roughness: 0.5, clearcoat: 0, clearcoatRoughness: 0.18, envMapIntensity: 1.35, transparent: true });
  const ring = makeRing(metal);
  const ear = makeEarring(metal);
  scene.add(ring, ear);

  // conversão tela (px) -> mundo no plano z=0
  let W = 1, H = 1, k = 1;
  const HALF_FOV = Math.tan(MathUtils.degToRad(15));
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    k = (2 * 10 * HALF_FOV) / H;
    measure();
  }
  function toWorld(px, py, out) { out.x = (px - W / 2) * k; out.y = -(py - H / 2) * k; return out; }

  function measure() { /* posições são lidas ao vivo a cada quadro */ }

  const v = new Vector3();
  const heroEl = document.querySelector('#hero');
  const frameEl = document.querySelector('.compare__frame');
  let t0 = performance.now();
  let mode = 'none';

  function setAt(obj, px, py, sizePx, baseScale) {
    toWorld(px, py, v);
    obj.position.set(v.x, v.y, 0);
    obj.scale.setScalar((sizePx * k) / baseScale);
  }
  function setGold(g) {
    metal.color.copy(RAW).lerp(GOLD, g);
    metal.roughness = MathUtils.lerp(0.5, 0.15, g);
    metal.clearcoat = MathUtils.lerp(0, 0.5, g);
  }
  function stage() {
    /* hero sem peças (retiradas a pedido do cliente): elas aparecem só no Antes e depois */
    if (frameEl) { const r = frameEl.getBoundingClientRect(); if (r.top < H + 120 && r.bottom > -160) return 'compare'; }
    return 'none';
  }

  function frame() {
    const time = (performance.now() - t0) / 1000;
    const y = window.scrollY;
    mode = stage();
    const sm = small.matches;
    // movimento lento e contínuo: giro suave, leve balanço e flutuação
    ring.rotation.set(0.45 + Math.sin(time * 0.3) * 0.06, time * 0.12 + y * 0.0006, 0.22);
    ear.rotation.set(0.08, Math.sin(time * 0.25) * 0.5 + y * 0.0004, Math.sin(time * 0.6) * 0.05);
    const fl = Math.sin(time * 0.6) * 5, fl2 = Math.sin(time * 0.6 + 1.3) * 5;

    if (mode === 'hero') {
      const r = heroEl.getBoundingClientRect();
      const cfg = sm ? HERO.small : HERO.big;
      const size = sm ? cfg.size : Math.min(W * 0.12, cfg.size * (W / 1262));
      // banho acontece dentro do hero: no desktop durante a "janela que se abre", no celular ao rolar o hero
      const span = sm ? r.height * 0.6 : H * 0.85;
      setGold(smooth(0.05, 0.95, y / span));
      metal.opacity = 1;
      setAt(ring, r.left + cfg.ring[0] * r.width, r.top + cfg.ring[1] * r.height + fl, size, 2.3);
      setAt(ear, r.left + cfg.ear[0] * r.width, r.top + cfg.ear[1] * r.height + fl2, size * 1.15, 2.2);
    } else if (mode === 'compare') {
      const r = frameEl.getBoundingClientRect();
      // 0 quando a imagem começa a entrar, 1 quando está no centro da tela
      const p = clamp01((H - r.top) / (H / 2 + r.height / 2));
      setGold(smooth(0.12, 0.92, p));
      metal.opacity = smooth(0, 0.3, p) * (1 - smooth(0.25, -0.1, r.bottom / H));
      const size = sm ? Math.min(W * 0.26, 110) : Math.min(W * 0.13, 170);
      const rise = (1 - smooth(0, 0.9, p)) * 60; // sobem devagar até o lugar
      const ringW = size, earW = size * 1.15 * 0.55;
      if (sm) {
        // imagem ocupa a largura toda: as peças ficam abaixo dela, com 15% atrás da borda inferior
        setAt(ring, W * 0.16, r.bottom + (0.5 - HIDE) * ringW + rise + fl, ringW, 2.3);
        setAt(ear, W * 0.84, r.bottom + (0.5 - HIDE) * size * 1.15 + rise + fl2, size * 1.15, 2.2);
      } else {
        setAt(ring, r.left - (0.5 - HIDE) * ringW, r.top + r.height * 0.34 + rise + fl, ringW, 2.3);
        setAt(ear, r.right + (0.5 - HIDE) * earW, r.top + r.height * 0.6 + rise + fl2, size * 1.15, 2.2);
      }
    }
    if (mode !== 'none') renderer.render(scene, camera);
  }

  /* laço: só roda enquanto as peças podem estar na tela (do topo até pouco depois do mergulho) */
  let running = false, raf = 0, off = false;
  let frames = 0, slow = 0, lastT = 0, degraded = false;
  function watch(nowT) {
    if (lastT) {
      frames++; if (nowT - lastT > 45) slow++;
      if (frames === 24) {
        if (slow > 10 && !degraded) { degraded = true; frames = 0; slow = 0; renderer.setPixelRatio(1); resize(); }
        else if (slow > 10 && degraded) { stop(true); }
      }
    }
    lastT = nowT;
  }
  function inRange() { return stage() !== 'none'; }
  function loop(nowT) {
    if (!running) return;
    if (!FORCE && (frames < 24 || !degraded)) watch(nowT || performance.now());
    if (!running) return;
    if (!inRange()) { running = false; canvas.classList.remove('is-on'); return; }
    frame();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (off || running || document.hidden || !inRange()) return;
    running = true; lastT = 0; canvas.classList.add('is-on');
    raf = requestAnimationFrame(loop);
  }
  function stop(kill) {
    running = false; cancelAnimationFrame(raf); canvas.classList.remove('is-on');
    if (kill) { off = true; setTimeout(() => { canvas.remove(); renderer.dispose(); }, 900); }
  }

  resize();
  window.addEventListener('resize', resize);
  if (ST) ST.addEventListener('refresh', measure);
  window.addEventListener('scroll', start, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop(false) : start()));
  requestAnimationFrame(() => { frame(); start(); });
}
