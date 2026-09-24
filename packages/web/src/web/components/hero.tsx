import { useRef } from "react";
import { home } from "@/lib/home";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Wrench, Truck, Factory } from "lucide-react";
import { BtnGhost, BtnPrimary } from "./kit";
import { CineRule, CineStat, CineTag } from "./cine";
import { Counter } from "./counter";
import { Rotator } from "./rotator";
import { QuickSelector } from "./tools/quick-selector";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ ticker */

const marks = [
  { Icon: Factory, label: "Fabricação própria em Limeira/SP" },
  { Icon: Wrench, label: "Engenharia sob medida" },
  { Icon: Truck, label: "Entrega em todo o Brasil" },
  { Icon: ShieldCheck, label: "Assistência técnica com o nosso time" },
];

function Ticker() {
  const row = (
    <div className="flex shrink-0 items-center">
      {marks.map((m) => (
        <span
          key={m.label}
          className="flex items-center gap-2.5 whitespace-nowrap px-6 text-[13px] uppercase tracking-[0.14em] text-white/55"
        >
          <m.Icon className="h-4 w-4 text-dm-red" />
          {m.label}
          <span className="ml-4 h-1 w-1 rounded-full bg-white/25" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker border-y border-white/10 bg-black/25 py-3.5">
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ hero */

export function HomeHero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const markX = useTransform(scrollYProgress, [0, 1], ["-4%", "10%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-70px"]);
  const contentFade = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);

  const still = { y: undefined, scale: undefined, x: undefined, opacity: undefined };

  return (
    <section ref={ref} className="cine relative overflow-hidden">
      <div className="cine-bg" />

      {/* vídeo com parallax no scroll */}
      <motion.video
        style={reduce ? still : { y: mediaY, scale: mediaScale }}
        className="absolute inset-0 -z-[2] h-full w-full object-cover opacity-[0.3]"
        src="/video/hero-loop.mp4"
        poster="/img/site/hero.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-[1] bg-gradient-to-r from-[#08192f]/92 via-[#08192f]/70 to-transparent" />

      <div className="cine-beam" />
      <div className="hero-slash" />
      <div className="cine-grid" />
      <div className="cine-noise" />

      {/* marca d'água gigante */}
      <motion.span style={reduce ? still : { x: markX }} className="hero-mark select-none">
        Demakine
      </motion.span>

      <motion.div
        style={reduce ? still : { y: contentY, opacity: contentFade }}
        className="dm-container relative z-[1] pt-14 pb-14 md:pt-20 md:pb-16"
      >
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <CineTag>{site.legal} · Limeira/SP</CineTag>

            <h1 className="cine-title mt-6 text-white">
              <span className="cine-line">
                <span style={{ ["--i" as string]: 0 }}>A indústria</span>
              </span>
              <span className="cine-line">
                <span style={{ ["--i" as string]: 1 }}>
                  em <span className="text-dm-red">movimento</span>
                </span>
              </span>
              <span className="mt-2 block font-display text-[0.42em] font-extrabold normal-case leading-tight tracking-normal text-white/85 md:text-[0.36em]">
                para{" "}
                <Rotator
                  words={home.heroWords}
                />
              </span>
            </h1>

            <CineRule className="mt-6" />

            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/72 md:text-lg">
              {home.heroText}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BtnPrimary to="/contato" className="cine-shine">
                Solicitar orçamento
              </BtnPrimary>
              <BtnGhost dark href="/downloads/catalogo-demakine.pdf" external>
                Ver catálogo (PDF)
              </BtnGhost>
            </div>

            <a
              href="/agro"
              className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[#e8c469] transition-colors hover:text-white"
            >
              {home.agroLink}
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="mt-11 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 md:grid-cols-4">
              <CineStat
                value={<Counter to={site.stats.years} suffix="+" />}
                label="anos de mercado"
              />
              <CineStat
                value={<Counter to={site.stats.machines} suffix="+" />}
                label="máquinas entregues"
              />
              <CineStat
                value={<Counter to={site.stats.clients} suffix="+" />}
                label="clientes atendidos"
              />
              <CineStat value={<Counter to={site.stats.rating} decimals={1} />} label="nota média" />
            </div>
          </div>

          <div>
            <QuickSelector />
            <p className="mt-3 text-center text-[12.5px] text-white/45">
              Três escolhas e você já cai na ficha técnica do equipamento indicado.
            </p>
          </div>
        </div>
      </motion.div>

      <Ticker />
    </section>
  );
}
