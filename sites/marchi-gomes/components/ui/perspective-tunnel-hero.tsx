"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Tunel em perspectiva (base: 21st.dev "perspective-tunnel-hero"), adaptado ao site:
 * - o progresso vem da ROLAGEM NORMAL da pagina (secao alta com palco "sticky"),
 *   sem capturar a roda do mouse nem prender o visitante dentro do componente;
 * - cores da marca, fotos do escritorio e cartoes de tamanhos e proporcoes variados;
 * - decorativo: some dos leitores de tela, que recebem so uma lista de texto.
 */

export type TunnelItem = { src: string; title: string; alt?: string };

type Card = {
  item: TunnelItem;
  cos: number;
  sin: number;
  rx: number;
  ry: number;
  rot: number;
  size: number;
  aspect: string;
  index: number;
};

const SIZES = [1, 1.24, 0.86, 1.12, 0.94, 1.32, 0.9, 1.18, 1.04];
const ASPECTS = ["4/5", "3/4", "5/6", "4/5", "2/3", "1/1", "4/5", "3/4", "5/6"];

function buildCards(items: TunnelItem[]): Card[] {
  return items.map((item, i) => {
    const golden = i * 137.5 * (Math.PI / 180);
    return {
      item,
      cos: Math.cos(golden),
      sin: Math.sin(golden),
      rx: 0.28 + (i % 3) * 0.08,
      ry: 0.26 + (i % 2) * 0.09,
      rot: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
      size: SIZES[i % SIZES.length],
      aspect: ASPECTS[i % ASPECTS.length],
      index: i,
    };
  });
}

const SPRING = { stiffness: 60, damping: 25, mass: 0.5 };

type Stage = { width: number; height: number; mobile: boolean };

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);
  return { x, y };
}

function TunnelCard({
  card,
  progress,
  pointer,
  total,
  stage,
}: {
  card: Card;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: Stage;
}) {
  const span = 0.55;
  const start = (card.index / total) * (1 - span);
  const local = useTransform(progress, [start, start + span], [0, 1]);

  const z = useTransform(local, [0, 1], [stage.mobile ? -1200 : -1700, stage.mobile ? 350 : 500]);
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const base = stage.mobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(270, stage.width * 0.18));
  const width = Math.round(base * card.size);

  const baseX = card.cos * stage.width * card.rx;
  const baseY = card.sin * stage.height * card.ry;
  const pan = stage.mobile ? 20 : 45;

  const transform = useTransform([z, pointer.x, pointer.y], ([cz, px, py]: number[]) => {
    return `translate3d(calc(-50% + ${baseX - px * pan}px), calc(-50% + ${baseY - py * pan}px), ${cz}px) rotateZ(${card.rot}deg)`;
  });

  return (
    <motion.div
      style={{ width, aspectRatio: card.aspect, transform, opacity, zIndex: card.index + 1 }}
      className="absolute left-1/2 top-1/2 select-none will-change-transform"
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-navy-2 shadow-[0_1px_2px_rgb(0_0_0/0.35),0_28px_46px_-22px_rgb(0_0_0/0.75)] ring-1 ring-copper/25">
        <Image
          src={card.item.src}
          alt=""
          fill
          sizes="(min-width: 768px) 360px, 240px"
          draggable={false}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <span className="absolute bottom-4 left-4 right-4 text-[0.65rem] uppercase tracking-[0.28em] text-bone/90 sm:text-xs">
          {card.item.title}
        </span>
      </div>
    </motion.div>
  );
}

export default function PerspectiveTunnelHero({
  items,
  eyebrow,
  title,
  highlight,
  prompt = "Role para explorar",
  heightSvh = 320,
}: {
  items: TunnelItem[];
  eyebrow: string;
  title: string;
  highlight?: string;
  prompt?: string;
  heightSvh?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const cards = useMemo(() => buildCards(items), [items]);

  const [stage, setStage] = useState<Stage>({ width: 1440, height: 900, mobile: false });
  useEffect(() => {
    const update = () =>
      setStage({ width: window.innerWidth, height: window.innerHeight, mobile: window.innerWidth < 768 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Progresso 0 → 1 enquanto a secao atravessa a tela (rolagem nativa)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, restDelta: 0.0001 });

  const pointer = useCameraParallax(!stage.mobile);

  const titleScale = useTransform(progress, [0, 0.5, 1], [0.78, 1, 1.28]);
  const titleOpacity = useTransform(progress, [0, 0.1, 0.86, 1], [0.2, 1, 1, 0]);
  const promptOpacity = useTransform(progress, [0, 0.1], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label={`${eyebrow}: ${title}${highlight ? ` ${highlight}` : ""}`}
      className="relative bg-ink"
      style={{ height: `${heightSvh}svh` }}
    >
      <div
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden"
        style={{ perspective: stage.mobile ? "900px" : "1200px" }}
        aria-hidden="true"
      >
        {/* grade de pontos e brilho dourado */}
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(rgb(201_160_120/0.2)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(201_160_120/0.16)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-copper/15" />
        <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-bone/10" />

        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none z-0 flex max-w-3xl flex-col items-center px-6 text-center"
        >
          <p className="eyebrow mb-5">{eyebrow}</p>
          <p className="display text-[clamp(2.8rem,8.4vw,7rem)] text-bone">
            {title} {highlight && <span className="text-copper-hi">{highlight}</span>}
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: promptOpacity }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-mist"
        >
          <span>{prompt}</span>
          <div className="h-6 w-px bg-gradient-to-b from-copper to-transparent" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cards.map((card) => (
            <TunnelCard key={card.item.src} card={card} progress={progress} pointer={pointer} total={cards.length} stage={stage} />
          ))}
        </div>
      </div>
      <ul className="sr-only">
        {items.map((i) => (
          <li key={i.src}>{i.alt ?? i.title}</li>
        ))}
      </ul>
    </section>
  );
}
