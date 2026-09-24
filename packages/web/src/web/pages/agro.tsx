import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Sprout,
  Truck,
  Wheat,
  Wrench,
  Package,
} from "lucide-react";
import { Seo } from "@/components/seo";
import { Section, SectionHead, BtnGhost, BtnWhats, Breadcrumb } from "@/components/kit";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { LeadForm } from "@/components/lead-form";
import {
  agroChain,
  agroChains,
  agroClients,
  agroFaq,
  agroProducts,
  agroTestimonials,
} from "@/lib/agro";
import { site, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const waMsg = "Olá! Sou do agro e quero um orçamento de equipamento Demakine.";

/* ------------------------------------------------------------------ hero agro */

function AgroHero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section ref={ref} className="agro pt-10 pb-0">
      <div className="agro-bg" />
      <div className="agro-beam" />
      <div className="agro-field" />

      <div className="dm-container relative">
        <div className="[&_a]:text-white/55 [&_a:hover]:text-[#e8c469] [&_span]:text-white/75 [&_svg]:text-white/35">
          <Breadcrumb items={[{ label: "Agro" }]} />
        </div>

        <div className="grid items-center gap-12 pt-8 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
          <div>
            <span className="agro-tag">
              <span>Linha Agro · safra que não pode parar</span>
            </span>

            <h1 className="cine-title mt-6 text-white">
              <span className="cine-line">
                <span style={{ ["--i" as string]: 0 }}>Do recebimento</span>
              </span>
              <span className="cine-line">
                <span style={{ ["--i" as string]: 1 }}>
                  ao <span className="text-[#e8c469]">caminhão</span>
                </span>
              </span>
            </h1>

            <div className="agro-rule mt-6" />

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/78">
              Grão, fertilizante, semente e ração exigem equipamento que aguenta poeira, abrasão e
              turno cheio. A Demakine fabrica esteiras, roscas, elevadores e máquinas de costurar
              sacos sob medida para cada etapa da sua operação, e entrega em todo o Brasil.
            </p>

            <ul className="agro-bullets mt-7">
              <li>Dimensionamento por material, distância e altura de descarga</li>
              <li>Correia certa para cada carga: lisa, taliscada, em V, PVC sanitário</li>
              <li>Fabricação própria em Limeira/SP e assistência com o nosso time</li>
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BtnWhats href={waLink(waMsg)} className="cine-shine">
                Falar com especialista agro
              </BtnWhats>
              <BtnGhost dark href="#proposta">
                Receber proposta técnica
              </BtnGhost>
            </div>

            <div className="mt-11 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-7">
              {[
                { v: <Counter to={agroClients.length} suffix="+" />, l: "clientes do agro na base" },
                { v: <Counter to={site.stats.machines} suffix="+" />, l: "máquinas entregues" },
                { v: <Counter to={site.stats.years} suffix="+" />, l: "anos fabricando" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="font-display text-[1.9rem] font-extrabold leading-none text-[#e8c469]">
                    {s.v}
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-white/58">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <Reveal i={1}>
            <div className="relative overflow-hidden rounded-3xl border border-white/12">
              <motion.img
                style={reduce ? {} : { y: imgY }}
                src="/img/site/projetos.webp"
                alt="Esteira transportadora Demakine com moega instalada em operação"
                className="h-[420px] w-full object-cover md:h-[520px]"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b2415] via-[#0b2415]/70 to-transparent p-6 pt-16">
                <p className="text-[13px] uppercase tracking-[0.16em] text-[#e8c469]">
                  Equipamento em campo
                </p>
                <p className="mt-2 text-[15.5px] text-white/85">
                  Esteira com moega alimentadora instalada: recebimento de material direto na linha.
                </p>
              </div>
              {/* grãos caindo */}
              <div className="pointer-events-none absolute left-[18%] top-[12%] flex gap-2">
                {[0, 0.6, 1.2].map((d) => (
                  <span
                    key={d}
                    className="grain-fall h-2 w-2 rounded-full bg-[#e8c469]/80"
                    style={{ animationDelay: `${d}s` }}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* faixa de credibilidade */}
      <div className="relative border-t border-white/10 bg-black/25">
        <div className="dm-container flex flex-wrap items-center gap-x-10 gap-y-4 py-5">
          {[
            { Icon: MapPin, t: "Entrega em todo o Brasil" },
            { Icon: Wrench, t: "Projeto sob medida" },
            { Icon: Truck, t: "Prazo cumprido na safra" },
            { Icon: Sprout, t: "Cooperativas, tradings e produtores" },
          ].map((m) => (
            <span
              key={m.t}
              className="flex items-center gap-2.5 text-[13px] uppercase tracking-[0.12em] text-white/60"
            >
              <m.Icon className="h-4 w-4 text-[#e8c469]" />
              {m.t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ página */

export default function Agro() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Seo
        title="Equipamentos para o Agro: Esteiras e Roscas | Demakine"
        description="Esteiras, roscas, elevadores de canecas e máquinas de costurar sacos para grãos, fertilizantes, sementes, ração e hortifrúti. Sob medida, em Limeira/SP."
        path="/agro"
      />

      <AgroHero />

      {/* -------------------------------------------------- cadeia da operação */}
      <Section tone="surface" id="etapas">
        <SectionHead
          eyebrow="Onde a Demakine entra"
          title="Cinco etapas, um fornecedor só"
          text="Do caminhão que chega carregado até o que sai cheio. Cada etapa tem o equipamento certo, e todos saem da mesma fábrica, com a mesma assistência."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {agroChain.map((s, i) => (
            <Reveal key={s.step} i={i} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#2f7a3f]/45 hover:shadow-xl hover:shadow-[#2f7a3f]/10">
                <span className="font-display text-[2.1rem] font-extrabold leading-none text-[#2f7a3f]/25">
                  {s.step}
                </span>
                <p className="mt-3 text-[16.5px] font-bold text-dm-ink">{s.title}</p>
                <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-dm-gray">{s.text}</p>
                <ul className="mt-4 space-y-1.5 border-t border-dm-line pt-4">
                  {agroProducts(s.slugs).map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/produtos/${p.slug}`}
                        className="group flex items-start gap-1.5 text-[13.5px] font-semibold text-[#1d5230] hover:text-[#2f7a3f]"
                      >
                        <ArrowRight className="mt-[3px] h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------- cadeias atendidas */}
      <Section>
        <SectionHead
          eyebrow="Cadeias atendidas"
          title="Cada cultura pede um equipamento diferente"
          text="O material define correia, estrutura e inclinação. Escolha a sua cadeia e veja o que a gente indica."
          action={<BtnGhost to="/produtos">Ver catálogo completo</BtnGhost>}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agroChains.map((c, i) => (
            <Reveal key={c.id} i={i % 3} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white transition-all hover:-translate-y-1 hover:border-[#2f7a3f]/45 hover:shadow-xl hover:shadow-[#2f7a3f]/10">
                <div className="relative aspect-[16/10] overflow-hidden bg-dm-surface">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#12331e]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#e8c469]">
                    <Wheat className="h-3.5 w-3.5" />
                    Agro
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[17.5px] font-bold text-dm-ink">{c.name}</h3>
                  <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-dm-gray">{c.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-dm-line pt-4">
                    {agroProducts(c.slugs).map((p) => (
                      <Link
                        key={p.slug}
                        href={`/produtos/${p.slug}`}
                        className="rounded-full bg-[#2f7a3f]/10 px-3 py-1.5 text-[12.5px] font-semibold text-[#1d5230] transition-colors hover:bg-[#2f7a3f]/20"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------- clientes agro */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Quem já produz com a Demakine"
          title="Algumas das empresas agro que confiam na Demakine"
          text="Cooperativas, tradings, indústrias de nutrição animal, sementeiras e produtores. Todas as marcas abaixo são clientes reais."
          action={<BtnGhost to="/clientes">Ver todos os clientes</BtnGhost>}
        />
        <div className="mt-11 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {agroClients.map((c, i) => (
            <Reveal key={c.id} i={i % 6}>
              <div
                className="flex h-[92px] items-center justify-center rounded-xl border border-dm-line bg-white p-4"
                title={`${c.name} · ${c.segment}`}
              >
                <img
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain opacity-75 transition-opacity hover:opacity-100"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------- depoimentos agro */}
      <Section>
        <SectionHead
          eyebrow="Na palavra de quem comprou"
          title="Depoimentos de clientes do campo"
          text="Avaliações reais de produtores, cooperativas e indústrias do agro."
        />
        <div className="mt-11 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agroTestimonials.map((t, i) => (
            <Reveal key={`${t.company}-${i}`} i={i % 3} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
                <div className="flex gap-1 text-[#d8a02a]">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-dm-ink/85">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-5 border-t border-dm-line pt-4 text-[14px] font-bold text-dm-ink">
                  {t.name}
                  <span className="block text-[13px] font-normal text-dm-gray">
                    {[t.company, t.city].filter(Boolean).join(" · ")}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------- faq + proposta */}
      <section className="agro py-16 md:py-24" id="proposta">
        <div className="agro-bg" />
        <div className="agro-beam" />
        <div className="dm-container relative grid gap-14 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="agro-tag">
              <span>Antes de fechar</span>
            </span>
            <h2 className="cine-title cine-title-sm mt-5 text-white">
              Dúvidas de quem compra na safra
            </h2>
            <div className="agro-rule mt-5" />

            <div className="mt-9 divide-y divide-white/12 border-y border-white/12">
              {agroFaq.map((f, i) => {
                const on = open === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpen(on ? null : i)}
                      aria-expanded={on}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="text-[16px] font-bold text-white">{f.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-[#e8c469] transition-transform",
                          on && "rotate-180",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid overflow-hidden transition-all duration-300",
                        on ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
                      )}
                    >
                      <p className="min-h-0 max-w-xl text-[15px] leading-relaxed text-white/70">
                        {f.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <BtnWhats href={waLink(waMsg)}>
                Falar no WhatsApp agora
              </BtnWhats>
              <BtnGhost dark href="/downloads/catalogo-demakine.pdf" external>
                Baixar catálogo (PDF)
              </BtnGhost>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[13.5px] text-white/50">
              <Package className="h-4 w-4" />
              {site.phone} · {site.mobile} · {site.email}
            </p>
          </div>

          <Reveal i={1}>
            <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 md:p-8 [&_button[type=submit]]:bg-[#d8a02a] [&_button[type=submit]]:text-[#12331e] [&_button[type=submit]:hover]:bg-[#e8b23c] [&_input:focus]:border-[#e8c469] [&_textarea:focus]:border-[#e8c469]">
              <LeadForm
                source="agro"
                variant="dark"
                title="Proposta técnica para a sua operação"
                subtitle="Conte o material, a distância e a altura de descarga. Nossa engenharia responde com o modelo indicado e o orçamento em até 1 dia útil."
                buttonLabel="Quero minha proposta"
                successTitle="Recebemos os dados da sua operação"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
