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

/* ---------- coreografia ---------- */
const STAGES = {
  big: [
    { sel: '#hero .section__bg', ring: [0.62, 0.38], ear: [0.8, 0.64], size: 1 },
    { sel: '#consultoria .section__bg', ring: [0.22, 0.8], ear: [0.6, 0.86], size: 0.78 },
    { sel: '#estrategia .section__bg', ring: [0.3, 0.56], ear: [0.74, 0.44], size: 0.78 },
    { sel: '#diferenciais', ring: [0.42, 0.5], ear: [0.6, 0.46], size: 0.7 }
  ],
  small: [
    { sel: '#hero .section__bg', ring: [0.32, 0.36], ear: [0.76, 0.46], size: 1 },
    { sel: '#consultoria .section__bg', ring: [0.2, 0.72], ear: [0.8, 0.78], size: 0.85 },
    { sel: '#estrategia .section__bg', ring: [0.24, 0.6], ear: [0.8, 0.5], size: 0.85 },
    { sel: '#diferenciais', ring: [0.38, 0.4], ear: [0.66, 0.36], size: 0.75 }
  ]
};

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

  // posições de rolagem de cada etapa (em coordenadas do documento)
  let stops = [], stages = STAGES.big;
  function measure() {
    stages = small.matches ? STAGES.small : STAGES.big;
    const y = window.scrollY;
    stops = stages.map((s, i) => {
      const el = document.querySelector(s.sel);
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      if (i === 0) return 0;
      if (i === stages.length - 1) return r.top + y - H * 0.28;   // seção-parede com o topo a 28% da tela
      return r.top + y + r.height / 2 - H / 2;                     // foto centralizada na tela
    });
  }

  function anchor(i, which, out) {
    const s = stages[i];
    const el = document.querySelector(s.sel);
    const r = el.getBoundingClientRect();
    const f = s[which];
    out.x = r.left + f[0] * r.width; out.y = r.top + f[1] * r.height;
    return out;
  }

  const a = { x: 0, y: 0 }, b = { x: 0, y: 0 }, v = new Vector3();
  let t0 = performance.now(), lastY = -1;
  function place(obj, which, seg, t, time, baseScale) {
    anchor(seg, which, a); anchor(Math.min(seg + 1, stages.length - 1), which, b);
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
    toWorld(px, py, v);
    obj.position.set(v.x, v.y, 0);
    const sz = stages[seg].size + (stages[Math.min(seg + 1, stages.length - 1)].size - stages[seg].size) * t;
    const pxSize = (small.matches ? Math.min(W * 0.24, 120) : Math.min(W * 0.12, 190)) * sz;
    obj.scale.setScalar((pxSize * k) / baseScale);
  }

  function frame() {
    const now = performance.now(), time = (now - t0) / 1000;
    const y = window.scrollY;
    const last = stops[stops.length - 1] || 1;
    // etapa atual e avanço entre âncoras (fica um tempo "presa" na foto e depois desliza)
    let seg = 0;
    for (let i = 0; i < stops.length - 1; i++) if (y >= stops[i]) seg = i;
    const span = Math.max(1, stops[seg + 1] - stops[seg]);
    const t = smooth(0.2, 0.9, (y - stops[seg]) / span);

    // banho de ouro: bruto no topo, dourado ao chegar na Estratégia
    const gold = smooth(0, stops[2] || last * 0.66, y);
    metal.color.copy(RAW).lerp(GOLD, gold);
    metal.roughness = MathUtils.lerp(0.5, 0.15, gold);
    metal.clearcoat = MathUtils.lerp(0, 0.5, gold);

    // no celular as fotos ficam acima dos textos: entre uma foto e outra as peças se dissolvem
    // e reaparecem na próxima, em vez de atravessar o texto
    const last2 = seg >= stops.length - 2;
    metal.opacity = small.matches && !last2 ? 1 - smooth(0.06, 0.2, t) + smooth(0.8, 0.94, t) : 1;
    place(ring, 'ring', seg, t, time, 2.3);
    place(ear, 'ear', seg, t, time, 2.2);
    const scrollSpin = y * 0.0022;
    ring.rotation.set(0.5 + Math.sin(time * 0.6) * 0.08, time * 0.35 + scrollSpin, 0.25);
    ear.rotation.set(0.1, Math.sin(time * 0.5) * 0.6 + scrollSpin * 0.6, Math.sin(time * 1.3) * 0.08);
    ring.position.y += Math.sin(time * 1.1) * 0.04;
    ear.position.y += Math.sin(time * 1.1 + 1.4) * 0.04;
    renderer.render(scene, camera);
    lastY = y;
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
  function inRange() { return window.scrollY < (stops[stops.length - 1] || 0) + H * 0.9; }
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
