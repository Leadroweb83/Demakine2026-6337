"use client";

/*
 * Abertura da home: o planeta em WebGL (EarthBlaze) ao fundo, as chamadas trocando à esquerda
 * e o astronauta grande em órbita à direita.
 *
 * O astronauta tem três movimentos somados, cada um em uma camada para não brigarem:
 *   1. parallax  acompanha o ponteiro e a rolagem da página (JavaScript, suavizado);
 *   2. órbita    percorre uma elipse lenta (CSS);
 *   3. giro      balança devagar em torno do próprio eixo (CSS).
 */

import * as React from "react";
import RotatingCta, { type CtaItem } from "@/components/ui/rotating-cta";

export interface EarthHeroProps {
  /** Título principal da página (h1), discreto, acima das chamadas. */
  heading: string;
  items: CtaItem[];
  astronaut: string;
  planet: string;
  space: string;
}

export default function EarthHero({ heading, items, astronaut, planet, space }: EarthHeroProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const planetRef = React.useRef<HTMLDivElement>(null);
  const spaceRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    const layer = parallaxRef.current;
    const globe = planetRef.current;
    const sky = spaceRef.current;
    if (!root || !layer || !globe || !sky || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cur = { x: 0, y: 0, s: 0 };
    const goal = { x: 0, y: 0, s: 0 };
    let frame = 0;
    const tick = () => {
      frame = 0;
      cur.x += (goal.x - cur.x) * 0.06;
      cur.y += (goal.y - cur.y) * 0.06;
      cur.s += (goal.s - cur.s) * 0.1;
      layer.style.transform = `translate3d(${(cur.x * -46).toFixed(1)}px, ${(cur.y * -30 + cur.s * -0.28).toFixed(1)}px, 0) rotate(${(cur.x * 4).toFixed(2)}deg)`;
      // Camadas mais distantes andam menos e no sentido oposto: dá profundidade.
      globe.style.transform = `translate3d(${(cur.x * 18).toFixed(1)}px, ${(cur.y * 12 + cur.s * -0.1).toFixed(1)}px, 0)`;
      sky.style.transform = `translate3d(${(cur.x * 7).toFixed(1)}px, ${(cur.y * 5 + cur.s * -0.04).toFixed(1)}px, 0) scale(1.06)`;
      if (Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) + Math.abs(goal.s - cur.s) > 0.002) frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      goal.x = (e.clientX / window.innerWidth - 0.5) * 2;
      goal.y = (e.clientY / window.innerHeight - 0.5) * 2;
      kick();
    };
    const onScroll = () => {
      goal.s = Math.min(window.scrollY, window.innerHeight * 1.2);
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={rootRef} className="eh-root">
      <style>{`
.eh-root{position:relative;margin-top:-72px;height:100svh;min-height:640px;max-height:1100px;background:#04060c;overflow:hidden}
.eh-space{position:absolute;inset:-4%;background:center/cover no-repeat;will-change:transform}
.eh-planet{--g:min(86svh,56vw);position:absolute;right:calc(var(--g) * -.08);top:50%;width:var(--g);height:var(--g);margin-top:calc(var(--g) * -.47);will-change:transform}
.eh-planet::before{content:"";position:absolute;inset:-9%;border-radius:50%;background:radial-gradient(closest-side,rgba(70,150,255,.42),rgba(40,100,220,.14) 62%,transparent 100%);animation:eh-breathe 9s ease-in-out infinite alternate}
.eh-planet img{position:relative;display:block;width:100%;height:100%;object-fit:contain;animation:eh-drift 42s ease-in-out infinite alternate;filter:drop-shadow(0 0 40px rgba(60,130,255,.35))}
@keyframes eh-breathe{from{opacity:.7;transform:scale(.97)}to{opacity:1;transform:scale(1.03)}}
@keyframes eh-drift{from{transform:rotate(-2.5deg) scale(1)}to{transform:rotate(2.5deg) scale(1.025)}}
.eh-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,4,9,.55) 0%,rgba(2,4,9,.2) 42%,transparent 62%),
  linear-gradient(0deg,var(--color-background) 0%,transparent 10%)}
.eh-copy{text-shadow:0 2px 24px rgba(0,0,0,.55)}
.eh-body{position:absolute;inset:0;display:flex;align-items:center}
.eh-wrap{width:100%;max-width:1440px;margin:0 auto;padding:96px clamp(20px,4vw,64px) 40px}
.eh-copy{max-width:min(720px,58%)}
.eh-h1{margin:0 0 26px!important;font-family:var(--font-sans)!important;font-size:11px!important;font-weight:500!important;line-height:1.5!important;
  letter-spacing:.4em!important;text-transform:uppercase;color:var(--color-brand)}
.eh-astro{--w:clamp(230px,min(35vw,52svh),580px);position:absolute;right:clamp(-20px,5vw,130px);top:50%;width:var(--w);margin-top:calc(var(--w) * -0.774 + 44px);
  pointer-events:none;will-change:transform}
.eh-orbit{animation:eh-orbit 26s linear infinite}
.eh-spin{animation:eh-spin 18s ease-in-out infinite alternate}
.eh-spin img{display:block;width:100%;height:auto;filter:drop-shadow(0 0 46px rgba(120,190,255,.28))}
@keyframes eh-orbit{
  0%{transform:translate(0,0)}
  12.5%{transform:translate(2.6%,-3.4%)}
  25%{transform:translate(6%,-4.6%)}
  37.5%{transform:translate(9.4%,-3.4%)}
  50%{transform:translate(12%,0)}
  62.5%{transform:translate(9.4%,3.4%)}
  75%{transform:translate(6%,4.6%)}
  87.5%{transform:translate(2.6%,3.4%)}
  100%{transform:translate(0,0)}
}
@keyframes eh-spin{from{transform:rotate(-9deg) scale(.97)}to{transform:rotate(11deg) scale(1.03)}}
.eh-scroll{position:absolute;left:50%;bottom:22px;translate:-50% 0;display:flex;flex-direction:column;align-items:center;gap:8px;
  font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.eh-scroll i{width:1px;height:28px;background:linear-gradient(var(--color-brand),transparent)}
@media (max-width:860px){
  .eh-body{align-items:flex-end}
  .eh-wrap{padding-bottom:84px}
  .eh-copy{max-width:none}
  .eh-astro{--w:min(58vw,300px);right:-4%;top:10%;margin-top:0;width:var(--w)}
  .eh-planet{--g:112vw;right:-34vw;top:12%;margin-top:0}
  .eh-shade{background:linear-gradient(0deg,rgba(2,4,9,.78) 0%,rgba(2,4,9,.4) 46%,transparent 74%)}
  .eh-scroll{display:none}
}
@media (prefers-reduced-motion:reduce){.eh-orbit,.eh-spin,.eh-planet img,.eh-planet::before{animation:none}}
`}</style>

      <div className="eh-space" ref={spaceRef} style={{ backgroundImage: `url("${space}")` }} aria-hidden="true" />
      <div className="eh-planet" ref={planetRef} aria-hidden="true">
        <img src={planet} alt="" width={1500} height={1501} fetchPriority="high" decoding="async" draggable={false} />
      </div>
      <div className="eh-shade" aria-hidden="true" />
      <div className="eh-astro" ref={parallaxRef} aria-hidden="true">
        <div className="eh-orbit">
          <div className="eh-spin">
            <img src={astronaut} alt="" width={900} height={1393} fetchPriority="high" decoding="async" draggable={false} />
          </div>
        </div>
      </div>
      <div className="eh-body">
        <div className="eh-wrap">
          <div className="eh-copy">
            <h1 className="eh-h1">{heading}</h1>
            <RotatingCta items={items} effect="roll" as="p" interval={5600} />
          </div>
        </div>
      </div>
      <div className="eh-scroll" aria-hidden="true">
        <span>Role para explorar</span>
        <i />
      </div>

    </section>
  );
}
