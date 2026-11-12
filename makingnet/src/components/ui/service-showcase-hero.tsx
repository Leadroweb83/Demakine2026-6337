"use client";

/*
 * Service Showcase Hero: o hero da home da Making.
 *
 * Derivado do componente "sneaker-product-hero" (21st.dev). A mecânica é a mesma,
 * trocando o produto pelo serviço:
 * - cada "cor do tênis" virou uma frente de atuação (Marketing, TI, Sistemas);
 * - ao trocar, a tela atual sobe e sai, a nova entra por baixo, o fundo muda de tom
 *   e o nome da frente passa gigante atrás da imagem;
 * - a imagem flutua, inclina na direção do ponteiro e recebe um brilho a cada troca;
 * - a coluna de compra (tamanho, preço, carrinho) virou a lista de serviços e o pedido de orçamento.
 *
 * O GSAP cuida do movimento. Com "reduzir movimento", tudo troca no lugar.
 */

import * as React from "react";
import gsap from "gsap";

export type ShowcaseVariant = {
  /** Nome curto do seletor, ex.: "Marketing". */
  name: string;
  /** Palavra gigante atrás da imagem. */
  word: string;
  /** Tom do fundo nesta frente. Qualquer cor CSS. */
  tint: string;
  src: string;
  alt: string;
  href: string;
  description: string;
  services: { name: string; href: string }[];
};

export type ServiceShowcaseHeroProps = {
  variants: ShowcaseVariant[];
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Imagem de fundo (opcional), fica bem escura atrás do conteúdo. */
  backdrop?: string;
  /** Troca automática em milissegundos; 0 desliga. Pausa quando o visitante interage. */
  autoplay?: number;
  /** Use "h2" quando a seção não é a primeira da página. */
  as?: "h1" | "h2";
  /** Primeira seção da página: sobe por baixo do cabeçalho fixo. */
  first?: boolean;
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ServiceShowcaseHero({
  variants,
  eyebrow,
  title,
  description,
  primary,
  secondary,
  backdrop,
  autoplay = 6000,
  as: Heading = "h1",
  first = true,
}: ServiceShowcaseHeroProps) {
  const [active, setActive] = React.useState(0);
  const shown = React.useRef(0);
  const touched = React.useRef(false);

  const rootRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const floatRef = React.useRef<HTMLDivElement | null>(null);
  const tiltRef = React.useRef<HTMLDivElement | null>(null);
  const sheenRef = React.useRef<HTMLSpanElement | null>(null);
  const floorRef = React.useRef<HTMLSpanElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const shotRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  // Só a frente ativa aparece no início.
  React.useLayoutEffect(() => {
    shotRefs.current.forEach((el, i) => el && gsap.set(el, { yPercent: 0, rotation: 0, autoAlpha: i === shown.current ? 1 : 0 }));
    wordRefs.current.forEach((el, i) => el && gsap.set(el, { yPercent: 0, autoAlpha: i === shown.current ? 1 : 0 }));
  }, [variants.length]);

  // Entrada: o conteúdo sobe em sequência.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-in]", { y: 28, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.1 });
      gsap.from(stageRef.current, { y: 60, autoAlpha: 0, scale: 0.94, duration: 1.2, ease: "power3.out", delay: 0.25 });
    }, root);
    return () => ctx.revert();
  }, []);

  // Flutuação lenta enquanto a seção está na tela.
  React.useEffect(() => {
    const wrap = floatRef.current;
    const floor = floorRef.current;
    const root = rootRef.current;
    if (!wrap || !floor || !root || prefersReduced()) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 2.8, ease: "sine.inOut" } });
    tl.to(wrap, { y: -12 }, 0).to(floor, { scaleX: 0.88, opacity: 0.6 }, 0);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.resume() : tl.pause()));
    io.observe(root);
    return () => {
      io.disconnect();
      tl.kill();
    };
  }, []);

  // A imagem inclina na direção do ponteiro; o brilho do fundo acompanha.
  React.useEffect(() => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    if (!root || !tilt || prefersReduced() || !window.matchMedia("(pointer: fine)").matches) return;
    gsap.set(tilt, { transformPerspective: 1100 });
    const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
    const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = root.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      ry(nx * 9);
      rx(-ny * 6);
      root.style.setProperty("--mx", (nx * 8).toFixed(2) + "%");
      root.style.setProperty("--my", (ny * 6).toFixed(2) + "%");
    };
    const onLeave = () => {
      ry(0);
      rx(0);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const sweep = (delay: number) => {
    const sh = sheenRef.current;
    if (!sh || prefersReduced()) return;
    gsap.fromTo(sh, { backgroundPosition: "130% 0%" }, { backgroundPosition: "-30% 0%", duration: 1.2, ease: "power2.inOut", delay });
  };
  React.useEffect(() => sweep(1.1), []);

  const pick = React.useCallback(
    (next: number) => {
      const prev = shown.current;
      if (next === prev) return;
      shown.current = next;
      setActive(next);
      const shots = shotRefs.current;
      const words = wordRefs.current;
      [shots, words].forEach((list) =>
        list.forEach((el, i) => {
          if (!el) return;
          gsap.killTweensOf(el);
          if (i !== prev && i !== next) gsap.set(el, { autoAlpha: 0, yPercent: 0, rotation: 0 });
        }),
      );
      if (prefersReduced()) {
        [shots, words].forEach((list) => {
          if (list[prev]) gsap.set(list[prev], { autoAlpha: 0 });
          if (list[next]) gsap.set(list[next], { autoAlpha: 1, yPercent: 0, rotation: 0 });
        });
        return;
      }
      if (shots[prev]) gsap.to(shots[prev], { yPercent: -120, rotation: -5, autoAlpha: 0, duration: 0.45, ease: "power2.in" });
      if (shots[next])
        gsap.fromTo(
          shots[next],
          { yPercent: 120, rotation: 6, autoAlpha: 0 },
          { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.75, ease: "back.out(1.2)", delay: 0.06 },
        );
      sweep(0.55);
      if (words[prev]) gsap.to(words[prev], { yPercent: -60, autoAlpha: 0, duration: 0.5, ease: "power2.in" });
      if (words[next])
        gsap.fromTo(words[next], { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", delay: 0.1 });
      if (panelRef.current)
        gsap.fromTo(panelRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.15 });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Troca automática até a primeira interação.
  React.useEffect(() => {
    if (!autoplay || prefersReduced() || variants.length < 2) return;
    const id = window.setInterval(() => {
      if (touched.current || document.hidden) return;
      pick((shown.current + 1) % variants.length);
    }, autoplay);
    return () => window.clearInterval(id);
  }, [autoplay, pick, variants.length]);

  const choose = (i: number) => {
    touched.current = true;
    pick(i);
  };

  const current = variants[active];

  return (
    <section
      ref={rootRef}
      className="ssh-root"
      data-first={first}
      onPointerDown={() => (touched.current = true)}
      onFocusCapture={() => (touched.current = true)}
    >
      <style>{`
.ssh-root{position:relative;isolation:isolate;overflow:hidden;min-height:100svh;display:flex;align-items:center;
  background:var(--color-background);color:var(--color-foreground);container-type:inline-size}
.ssh-root[data-first="true"]{margin-top:-72px;padding-top:72px}
.ssh-backdrop{position:absolute;inset:0;z-index:-3;background-size:cover;background-position:50% 22%;opacity:.85}
.ssh-shade{position:absolute;inset:0;z-index:-2;
  background:linear-gradient(180deg,rgba(5,7,10,.5) 0%,rgba(5,7,10,.42) 50%,var(--color-background) 100%)}
.ssh-bg{position:absolute;inset:0;z-index:-1;opacity:0;transition:opacity .9s ease;pointer-events:none;
  background:radial-gradient(46% 56% at calc(52% + var(--mx,0%)) calc(52% + var(--my,0%)),color-mix(in oklab,var(--t) 30%,transparent),transparent 70%)}
.ssh-bg[data-on="true"]{opacity:1}
.ssh-body{width:100%;max-width:1440px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1.15fr) minmax(0,.7fr);
  gap:clamp(20px,3cqw,56px);align-items:center;padding:clamp(40px,6cqw,96px) clamp(20px,4cqw,64px)}
.ssh-eyebrow{margin:0 0 20px;font-size:11px;font-weight:500;letter-spacing:.4em;text-transform:uppercase;color:var(--color-brand);max-width:none}
.ssh-title{margin:0;font-size:clamp(2.7rem,4.5cqw,4.9rem)}
.ssh-title em{font-style:normal;color:var(--color-brand)}
.ssh-desc{margin:24px 0 0;max-width:38ch;font-size:clamp(1rem,1.25cqw,1.15rem);line-height:1.6;color:var(--color-muted-foreground)}
.ssh-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.ssh-stage{position:relative;aspect-ratio:16/11;min-height:240px}
.ssh-word{position:absolute;left:50%;top:50%;translate:-50% -62%;font-family:var(--font-display);font-size:clamp(4rem,15cqw,15rem);line-height:.9;
  text-transform:uppercase;white-space:nowrap;color:color-mix(in oklab,var(--t) 26%,transparent);pointer-events:none;user-select:none}
.ssh-float,.ssh-tilt{position:absolute;inset:0}
.ssh-tilt{transform-style:preserve-3d}
.ssh-shot{position:absolute;inset:0;margin:auto;width:88%;height:fit-content;border-radius:14px;overflow:hidden;
  background:#0c1217;box-shadow:0 0 0 1px rgba(255,255,255,.14),0 40px 80px -30px rgba(0,0,0,.9),0 0 90px -30px var(--t)}
.ssh-bar{display:flex;gap:6px;padding:10px 12px;background:rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.08)}
.ssh-bar i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.22)}
.ssh-shot img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
.ssh-sheen{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(100deg,transparent 40%,rgba(255,255,255,.28) 50%,transparent 60%) 130% 0/300% 100% no-repeat}
.ssh-floor{position:absolute;left:14%;right:14%;bottom:-2%;height:9%;border-radius:50%;
  background:radial-gradient(closest-side,rgba(0,0,0,.75),transparent);filter:blur(6px)}
.ssh-label{display:block;font-size:11px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:var(--color-muted-foreground)}
.ssh-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ssh-tab{font:inherit;font-size:.9rem;font-weight:500;min-height:44px;padding:0 18px;border-radius:999px;cursor:pointer;
  color:var(--color-foreground);background:transparent;border:1px solid rgba(255,255,255,.22);transition:background .25s,color .25s,border-color .25s}
.ssh-tab:hover{border-color:var(--color-brand)}
.ssh-tab[aria-pressed="true"]{background:var(--color-foreground);color:var(--color-background);border-color:var(--color-foreground)}
.ssh-panel{margin-top:28px}
.ssh-panel p{margin:12px 0 0;font-size:.95rem;line-height:1.55;color:var(--color-muted-foreground);max-width:34ch}
.ssh-list{list-style:none;margin:16px 0 0;padding:0;border-top:1px solid rgba(255,255,255,.12)}
.ssh-list a{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.12);
  color:var(--color-foreground);text-decoration:none;font-size:.95rem;transition:color .2s,padding .25s}
.ssh-list a:hover{color:var(--color-brand);padding-left:6px}
.ssh-list a span{color:var(--color-muted-foreground);transition:transform .25s,color .2s}
.ssh-list a:hover span{transform:translateX(4px);color:var(--color-brand)}
.ssh-more{display:inline-block;margin-top:16px;font-size:.9rem;font-weight:700;color:var(--color-brand);text-decoration:none}
@container (max-width:1020px){
  .ssh-body{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .ssh-buy{grid-column:1/-1}
  .ssh-panel{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
  .ssh-list{margin-top:0}
}
@container (max-width:700px){
  .ssh-body{grid-template-columns:minmax(0,1fr);gap:32px}
  .ssh-panel{display:block}
  .ssh-list{margin-top:16px}
  .ssh-stage{margin-block:8px}
  .ssh-word{font-size:24cqw}
}
@media (prefers-reduced-motion:reduce){.ssh-root *{transition:none!important}}
`}</style>

      {backdrop && <span className="ssh-backdrop" style={{ backgroundImage: `url("${backdrop}")` }} aria-hidden="true" />}
      <span className="ssh-shade" aria-hidden="true" />
      {variants.map((v, i) => (
        <span key={v.name} className="ssh-bg" data-on={i === active} style={{ ["--t" as string]: v.tint }} aria-hidden="true" />
      ))}

      <div className="ssh-body">
        <div>
          {eyebrow && (
            <p className="ssh-eyebrow" data-in>
              {eyebrow}
            </p>
          )}
          <Heading className="ssh-title" data-in>
            {title}
          </Heading>
          {description && (
            <p className="ssh-desc" data-in>
              {description}
            </p>
          )}
          <div className="ssh-actions" data-in>
            <a className="btn btn--primary" href={primary.href}>
              {primary.label}
            </a>
            {secondary && (
              <a className="btn btn--ghost" href={secondary.href} target="_blank" rel="noopener">
                {secondary.label}
              </a>
            )}
          </div>
        </div>

        <div className="ssh-stage" ref={stageRef}>
          {variants.map((v, i) => (
            <span
              key={v.name}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="ssh-word"
              style={{ ["--t" as string]: v.tint, visibility: i === active ? "visible" : "hidden" }}
              aria-hidden="true"
            >
              {v.word}
            </span>
          ))}
          <span className="ssh-floor" ref={floorRef} aria-hidden="true" />
          <div className="ssh-float" ref={floatRef}>
            <div className="ssh-tilt" ref={tiltRef}>
              {variants.map((v, i) => (
                <div
                  key={v.name}
                  ref={(el) => {
                    shotRefs.current[i] = el;
                  }}
                  className="ssh-shot"
                  style={{ ["--t" as string]: v.tint, visibility: i === active ? "visible" : "hidden" }}
                  aria-hidden={i === active ? undefined : true}
                >
                  <div className="ssh-bar" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <img
                    src={v.src}
                    alt={i === active ? v.alt : ""}
                    width={1000}
                    height={625}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    decoding="async"
                    draggable={false}
                  />
                  {i === active && <span className="ssh-sheen" ref={sheenRef} aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ssh-buy" data-in>
          <span className="ssh-label">Frente de atuação</span>
          <div className="ssh-tabs" role="group" aria-label="Frente de atuação">
            {variants.map((v, i) => (
              <button key={v.name} type="button" className="ssh-tab" aria-pressed={i === active} onClick={() => choose(i)}>
                {v.name}
              </button>
            ))}
          </div>
          {current && (
            <div className="ssh-panel" ref={panelRef} aria-live="polite">
              <div>
                <span className="ssh-label">O que entregamos</span>
                <p>{current.description}</p>
                <a className="ssh-more" href={current.href}>
                  Conhecer {current.name} →
                </a>
              </div>
              <ul className="ssh-list">
                {current.services.map((s) => (
                  <li key={s.href + s.name}>
                    <a href={s.href}>
                      {s.name} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
