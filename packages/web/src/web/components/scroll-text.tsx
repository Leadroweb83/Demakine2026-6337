import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ tipos */

type Line = {
  text: string;
  /** true = corre no sentido contrário ao scroll */
  reverse?: boolean;
  /** contorno vazado em vez de preenchido */
  outline?: boolean;
  /** palavra destacada em vermelho dentro da linha */
  accent?: string;
};

const lines: Line[] = [
  { text: "Demakine", reverse: false },
  { text: "Indústria", reverse: true, outline: true },
  { text: "em movimento", reverse: false, accent: "movimento" },
  { text: "Demakine", reverse: true, outline: true },
];

/* ------------------------------------------------------------------ linha */

function TextRow({
  line,
  progress,
  distance,
  still,
}: {
  line: Line;
  progress: MotionValue<number>;
  distance: number;
  still: boolean;
}) {
  const dir = line.reverse ? -1 : 1;
  const x = useTransform(progress, (p) => (still ? 0 : (p - 0.5) * distance * dir * -1));

  const parts = line.accent ? line.text.split(line.accent) : [line.text];

  const label = (
    <span className="mr-[0.28em] inline-block">
      {line.accent ? (
        <>
          {parts[0]}
          <span className="text-dm-red">{line.accent}</span>
          {parts[1]}
        </>
      ) : (
        line.text
      )}
    </span>
  );

  return (
    <motion.div
      style={{ x }}
      className={cn(
        "kinetic-row flex whitespace-nowrap will-change-transform",
        line.outline ? "kinetic-outline" : "text-white",
      )}
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="flex items-center">
          {label}
          <span className="mr-[0.28em] inline-block h-[0.13em] w-[0.42em] shrink-0 rounded-full bg-dm-red/80 align-middle" />
        </span>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ seção */

/**
 * Texto cinético controlado pelo scroll (Motion `useScroll` + `useTransform`).
 * Linhas alternam de direção conforme a página rola, a página inteira parece
 * uma linha de produção andando.
 */
export function ScrollText() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const fade = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.25, 1, 1, 0.25]);

  return (
    <section
      ref={ref}
      className="cine relative overflow-hidden py-20 md:py-28"
      aria-label="Demakine, a indústria em movimento"
    >
      <div className="cine-bg" />
      <div className="cine-beam" />
      <div className="cine-grid" />
      <div className="cine-noise" />

      <div className="dm-container relative">
        <p className="eyebrow text-white/45">Movimento é o nosso produto</p>
        <h2 className="sr-only">Demakine, a indústria em movimento</h2>
      </div>

      <motion.div style={{ opacity: reduce ? 1 : fade }} className="relative mt-8 flex flex-col gap-1 md:gap-2">
        {lines.map((l, i) => (
          <TextRow
            key={`${l.text}-${i}`}
            line={l}
            progress={smooth}
            distance={320 + i * 90}
            still={!!reduce}
          />
        ))}
      </motion.div>

      <div className="dm-container relative mt-10">
        <p className="max-w-xl text-[16.5px] leading-relaxed text-white/62">
          Cada equipamento que sai da nossa fábrica em Limeira entra numa linha que não pode parar.
          É por isso que a gente projeta, fabrica, monta e dá assistência com o mesmo time.
        </p>
      </div>
    </section>
  );
}
