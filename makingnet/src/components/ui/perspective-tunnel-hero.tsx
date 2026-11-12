"use client";

/*
 * Perspective Tunnel: um corredor 3D de cartões que avançam em direção à câmera.
 *
 * Adaptado do componente "perspective-tunnel-hero" (21st.dev) para o site da Making:
 * - as imagens e os textos chegam por props (portfólio real, nada fixo no código);
 * - o avanço segue a rolagem normal da página (seção alta + palco fixo), em vez de
 *   capturar a roda do mouse. Assim o visitante nunca fica preso na seção e funciona no toque;
 * - as medidas vêm do próprio contêiner, não da janela;
 * - com "reduzir movimento" ativo, vira uma grade estática.
 */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface TunnelItem {
  src: string;
  title: string;
  /** Linha pequena acima do título, ex.: "Site" ou "Loja virtual". */
  kind?: string;
  alt?: string;
}

export interface PerspectiveTunnelHeroProps {
  items: TunnelItem[];
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  /** Link exibido abaixo do texto, ex.: portfólio completo. */
  cta?: { label: string; href: string };
  /** Altura da trilha de rolagem, em telas. Mais alto = viagem mais lenta. */
  lengthVh?: number;
}

interface Stage {
  width: number;
  height: number;
  isMobile: boolean;
}

const SPRING = { stiffness: 60, damping: 25, mass: 0.5 };

function layout(i: number) {
  const angle = i * 137.5 * (Math.PI / 180);
  return {
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    rx: 0.31 + (i % 3) * 0.07,
    ry: 0.3 + (i % 2) * 0.08,
    rotate: (i % 2 === 0 ? 1 : -1) * (2 + (i % 4) * 1.5),
  };
}

function usePointerPan(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

function TunnelCard({
  item,
  index,
  total,
  progress,
  pointer,
  stage,
}: {
  item: TunnelItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  stage: Stage;
}) {
  const pos = layout(index);
  const span = 0.5;
  const start = (index / total) * (1 - span);
  const local = useTransform(progress, [start, start + span], [0, 1]);

  const z = useTransform(local, [0, 1], stage.isMobile ? [-1200, 320] : [-1700, 480]);
  const opacity = useTransform(local, [0, 0.18, 0.8, 0.97], [0, 1, 1, 0]);

  const width = stage.isMobile
    ? Math.max(170, Math.min(230, stage.width * 0.52))
    : Math.max(260, Math.min(380, stage.width * 0.26));
  const baseX = pos.cos * stage.width * pos.rx;
  const baseY = pos.sin * stage.height * pos.ry;
  const pan = stage.isMobile ? 0 : 40;

  const transform = useTransform([z, pointer.x, pointer.y], ([cz, px, py]: number[]) => {
    const ox = baseX - px * pan;
    const oy = baseY - py * pan;
    return `translate3d(calc(-50% + ${ox}px), calc(-50% + ${oy}px), ${cz}px) rotateZ(${pos.rotate}deg)`;
  });

  return (
    <motion.figure
      style={{ width, transform, opacity, zIndex: index + 1 }}
      className="absolute left-1/2 top-1/2 m-0 aspect-[16/10] select-none will-change-transform"
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-900 shadow-2xl shadow-black/80 ring-1 ring-white/15">
        <img
          src={item.src}
          alt={item.alt ?? item.title}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-top"
        />
        <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/5 to-transparent p-4">
          <span className="flex flex-col gap-0.5">
            {item.kind && (
              <span className="text-[10px] uppercase tracking-[0.28em] text-(--color-brand)">{item.kind}</span>
            )}
            <span className="text-sm font-medium text-white">{item.title}</span>
          </span>
        </figcaption>
      </div>
    </motion.figure>
  );
}

export default function PerspectiveTunnelHero({
  items,
  eyebrow,
  title,
  text,
  cta,
  lengthVh = 320,
}: PerspectiveTunnelHeroProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>({ width: 1280, height: 800, isMobile: false });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () =>
      setStage({ width: el.clientWidth, height: el.clientHeight, isMobile: el.clientWidth < 768 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, restDelta: 0.0001 });
  const pointer = usePointerPan(!reduce);

  const titleScale = useTransform(progress, [0, 0.5, 1], [0.86, 1, 1.12]);
  const titleOpacity = useTransform(progress, [0, 0.08, 0.9, 1], [0.35, 1, 1, 0.5]);
  const hintOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  const heading = (
    <>
      {eyebrow && (
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.4em] text-(--color-brand)">{eyebrow}</p>
      )}
      <h2 className="m-0 text-[clamp(2.6rem,8vw,6.5rem)] text-white">{title}</h2>
      {text && <p className="mx-auto mt-6 max-w-[40ch] text-base text-(--color-muted-foreground)">{text}</p>}
    </>
  );
  const link = cta && (
    <a
      href={cta.href}
      className="pointer-events-auto mt-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-bold text-white no-underline transition-colors hover:border-(--color-brand) hover:text-(--color-brand)"
    >
      {cta.label} <span aria-hidden="true">→</span>
    </a>
  );

  if (reduce) {
    return (
      <section className="bg-(--color-background) px-5 py-24 text-center">
        {heading}
        {link}
        <ul className="mx-auto mt-12 grid max-w-[1200px] list-none grid-cols-2 gap-4 p-0 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.src}>
              <img
                src={item.src}
                alt={item.alt ?? item.title}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-xl object-cover object-top ring-1 ring-white/15"
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section ref={trackRef} className="relative bg-(--color-background)" style={{ height: `${lengthVh}vh` }}>
      <div
        ref={stageRef}
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden"
        style={{ perspective: stage.isMobile ? "900px" : "1200px" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(32,196,244,0.14)_0%,transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[46vmin] w-[46vmin] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[78vmin] w-[78vmin] rounded-full border border-dashed border-white/8"
        />

        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none relative z-0 flex max-w-4xl flex-col items-center px-6 text-center"
        >
          {heading}
          {link}
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-(--color-muted-foreground)"
        >
          <span>Role para explorar</span>
          <span className="h-7 w-px bg-gradient-to-b from-(--color-brand) to-transparent" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {items.map((item, i) => (
            <TunnelCard
              key={item.src}
              item={item}
              index={i}
              total={items.length}
              progress={progress}
              pointer={pointer}
              stage={stage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
