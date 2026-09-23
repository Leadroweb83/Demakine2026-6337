import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, Factory, Play, Truck, Wrench } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { site } from "@/lib/site";

const YT_ID = "cHw0WbzKy4A";

const points = [
  {
    Icon: Factory,
    title: "Fábrica própria em Limeira/SP",
    text: "Projeto, corte, dobra, solda, pintura e montagem no mesmo lugar. Nada é terceirizado às escuras.",
  },
  {
    Icon: Wrench,
    title: "Engenharia que atende sob medida",
    text: "Quando o catálogo não resolve, desenhamos o equipamento para o seu layout e o seu produto.",
  },
  {
    Icon: Truck,
    title: "Entrega em todo o Brasil",
    text: "Logística acompanhada e assistência técnica própria, do embarque à máquina rodando.",
  },
];

/**
 * Seção institucional: vídeo do YouTube em facade (só carrega o iframe depois do
 * clique) de um lado e o texto de experiência da empresa do outro, com CTA para
 * o catálogo.
 */
export function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden bg-dm-blue-deep py-16 md:py-24">
      <div className="absolute inset-0 grid-lines" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full bg-dm-blue/35 blur-[120px]"
        aria-hidden="true"
      />

      <div className="dm-container relative grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] xl:items-stretch lg:gap-14">
        {/* vídeo */}
        <Reveal className="xl:h-full">
          <div className="relative overflow-hidden rounded-3xl xl:h-full border border-white/12 bg-black shadow-[0_36px_80px_rgba(0,0,0,0.5)]">
            <div className="aspect-video w-full xl:aspect-auto xl:h-full">
              {playing ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1`}
                  title="Vídeo institucional Demakine"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Assistir ao vídeo institucional da Demakine"
                  className="group relative block h-full w-full"
                >
                  <img
                    src="/img/site/video-institucional-cover.jpg"
                    alt="Vista aérea da fábrica Demakine em Limeira/SP"
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/25" />
                  <span className="absolute left-1/2 top-1/2 flex h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-dm-red text-white shadow-[0_18px_44px_rgba(228,20,27,0.45)] transition-transform duration-300 group-hover:scale-110 md:h-[86px] md:w-[86px]">
                    <span className="pulse-ring absolute inset-0 rounded-full border border-white/45" />
                    <Play className="ml-1 h-7 w-7 fill-current md:h-8 md:w-8" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-left md:p-6">
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Vídeo institucional
                    </span>
                    <span className="font-display text-[19px] font-extrabold leading-tight text-white md:text-[23px]">
                      Conheça a fábrica que move a sua produção
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {/* texto */}
        <Reveal i={1}>
          <p className="eyebrow text-white/45">Quem é a Demakine</p>
          <h2 className="mt-3 font-display text-[26px] font-extrabold leading-tight text-white md:text-[32px]">
            Mais de 15 anos fabricando o que a indústria precisa mover
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-white/70">
            Começamos em Limeira e hoje temos esteiras, roscas, elevadores e peneiras rodando em
            todo o Brasil. Cada máquina sai testada da fábrica, e é esse atendimento técnico com
            prazo cumprido que faz nossos clientes voltarem e indicarem a Demakine.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { value: <Counter to={site.stats.years} suffix="+" />, label: "anos de mercado" },
              { value: <Counter to={site.stats.machines} suffix="+" />, label: "máquinas entregues" },
              { value: <Counter to={site.stats.rating} decimals={1} />, label: "nota média" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/12 bg-white/[0.05] px-3 py-3 text-center"
              >
                <p className="cine-kicker tabnum text-[24px] leading-none text-white md:text-[26px]">
                  {s.value}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-[0.1em] text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {points.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-white">{title}</span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-white/60">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 rounded-full bg-dm-green px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_16px_36px_rgba(23,134,79,0.32)] transition-colors hover:bg-dm-green-dark"
            >
              Conhecer nossos produtos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/a-empresa"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:border-white/60"
            >
              <Award className="h-4 w-4" />
              Nossa história
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
