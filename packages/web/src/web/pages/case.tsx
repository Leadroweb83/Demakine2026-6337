import { Link, useParams } from "wouter";
import { RedirectGate } from "@/components/redirect-gate";
import { AlertTriangle, ArrowRight, BadgeCheck, Calculator, Check, Info, Quote } from "lucide-react";
import { Seo } from "@/components/seo";
import {
  BtnGhost,
  BtnWhats,
  CtaBand,
  PageHero,
  ProductCard,
  Section,
  SectionHead,
} from "@/components/kit";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { getProduct } from "@/lib/content";
import { caseStudies, getCase, hasRealData } from "@/lib/cases";
import { brl, computeRoi, num } from "@/lib/engine";
import { site, waLink } from "@/lib/site";

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = getCase(slug ?? "");

  if (!item) {
    return (
      <RedirectGate>
        <Section>
          <p className="eyebrow text-dm-blue">Aplicações</p>
          <h1 className="h2 mt-3">Aplicação não encontrada</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            {caseStudies.map((c) => (
              <Link
                key={c.slug}
                href={`/cases/${c.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-dm-line px-4 py-2.5 text-[14.5px] font-semibold text-dm-ink/80 hover:border-dm-blue/40 hover:text-dm-blue"
              >
                {c.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </Section>
      </RedirectGate>
    );
  }

  const products = item.products.map((s) => getProduct(s)).filter((p) => Boolean(p));
  const sim = item.simulation;
  const r = computeRoi(sim);
  const waMsg = `Olá! Vi a aplicação "${item.title}" no site e quero avaliar a minha operação.`;
  const real = hasRealData(item) ? item.real! : null;

  return (
    <>
      <Seo
        title={`${item.title} | Aplicações Demakine`}
        description={item.intro.slice(0, 155)}
        path={`/cases/${item.slug}`}
        image={item.image}
      />

      <PageHero
        eyebrow={`${real ? "Case real" : item.eyebrow} · ${item.segment}`}
        title={item.title}
        text={item.intro}
        image={item.image}
        crumbs={[{ label: "Aplicações e cases", to: "/cases" }, { label: item.segment }]}
      />

      {/* cenário */}
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow text-dm-blue">O cenário</p>
            <h2 className="h2 mt-3">O que costuma travar essa operação</h2>
            <ul className="mt-7 space-y-4">
              {item.challenge.map((c) => (
                <li key={c} className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-dm-red" />
                  <span className="text-[15.5px] leading-relaxed text-dm-ink/85">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 text-[13.5px] text-dm-gray">
              Região típica dessa aplicação: {item.region}. Fabricação na unidade da Demakine em
              Limeira/SP.
            </p>
          </div>

          <div>
            <p className="eyebrow text-dm-blue">A configuração</p>
            <h2 className="h2 mt-3">O que a fábrica entrega</h2>
            <ol className="mt-7 space-y-4">
              {item.solution.map((s, i) => (
                <Reveal key={s.step} i={i}>
                  <li className="flex gap-4 rounded-2xl border border-dm-line bg-white p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dm-blue-soft font-mono text-[13px] font-bold text-dm-blue">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[15.5px] font-bold text-dm-ink">{s.step}</p>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-dm-gray">{s.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* resultado real: só com cliente identificado e autorização registrada no painel */}
      {real && (
        <Section tone="surface">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-dm-green/12 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-dm-green-dark">
              <BadgeCheck className="h-3.5 w-3.5" />
              Resultado medido
            </span>
            <span className="text-[13px] text-dm-gray">Publicado com autorização por escrito de {real.client}.</span>
          </div>
          <h2 className="h2 mt-5 max-w-3xl">O que mudou na operação de {real.client}</h2>

          {real.results.length > 0 && (
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {real.results.map((r) => (
                <div key={r.label} className="rounded-2xl border border-dm-line bg-white p-5">
                  <p className="text-[12.5px] font-bold uppercase tracking-wide text-dm-gray">{r.label}</p>
                  <div className="mt-3 flex items-end gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-dm-gray">Antes</p>
                      <p className="tabnum text-[18px] font-bold text-dm-ink/60 line-through decoration-dm-red/60">{r.before}</p>
                    </div>
                    <ArrowRight className="mb-1.5 h-4 w-4 text-dm-ink/35" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-dm-green-dark">Depois</p>
                      <p className="tabnum text-[24px] font-extrabold text-dm-ink">{r.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(real.testimonial?.text || real.photos.length > 0) && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              {real.testimonial?.text && (
                <figure className="rounded-2xl border border-dm-line bg-white p-6">
                  <Quote className="h-6 w-6 text-dm-blue" />
                  <blockquote className="mt-3 text-[16.5px] leading-relaxed text-dm-ink/85">{real.testimonial.text}</blockquote>
                  <figcaption className="mt-4 text-[14px] font-bold text-dm-ink">
                    {real.testimonial.name}
                    {real.testimonial.role && <span className="font-normal text-dm-gray"> · {real.testimonial.role}</span>}
                  </figcaption>
                </figure>
              )}
              {real.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {real.photos.slice(0, 4).map((src) => (
                    <img key={src} src={src} alt={`Instalação Demakine: ${real.client}`} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* cenário simulado */}
      <Section tone="deep">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-dm-red/50 bg-dm-red/15 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white">
            <Calculator className="h-3.5 w-3.5" />
            Cenário simulado
          </span>
          <span className="text-[13px] text-white/50">
            Não é resultado de cliente. É cálculo a partir das premissas abaixo.
          </span>
        </div>

        <h2 className="h2 mt-5 max-w-3xl text-white">
          O que a mecanização representaria nesse cenário
        </h2>

        <div className="mt-9 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* premissas */}
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
            <p className="text-[13px] font-bold uppercase tracking-wide text-white/55">
              Premissas usadas
            </p>
            <dl className="mt-4 space-y-2.5 text-[14.5px]">
              {[
                ["Volumes por dia", num(sim.volumePerDay)],
                ["Dias por mês", num(sim.daysPerMonth)],
                ["Pessoas na operação hoje", num(sim.people)],
                ["Pessoas depois de mecanizar", num(sim.peopleAfter)],
                ["Custo mensal por pessoa", brl(sim.costPerPerson)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-2.5">
                  <dt className="text-white/60">{k}</dt>
                  <dd className="tabnum font-bold text-white">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[13px] leading-relaxed text-white/45">{sim.note}</p>
          </div>

          {/* resultado da simulação */}
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Economia mensal simulada", brl(r.monthlySaving)],
                ["Economia em 12 meses", brl(r.yearlySaving)],
                ["Horas de operação poupadas por mês", `${num(r.hoursSavedPerMonth, 1)} h`],
                ["Volumes por ano no cenário", num(r.volumePerYear)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
                  <p className="text-[12.5px] uppercase tracking-wide text-white/50">{k}</p>
                  <p className="tabnum mt-2 text-[24px] font-extrabold text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-white/50" />
              <p className="text-[13.5px] leading-relaxed text-white/55">
                A simulação usa apenas custo de pessoal e capacidade de transporte. Não estima preço
                de máquina, energia, manutenção nem retorno financeiro garantido. Para ver o payback
                com o seu investimento, rode a calculadora com os seus números.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <BtnWhats href={waLink(waMsg)}>Falar com a engenharia</BtnWhats>
              <BtnGhost dark to="/ferramentas">
                Rodar com os meus números
              </BtnGhost>
            </div>
          </div>
        </div>
      </Section>

      {/* equipamentos */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Equipamentos"
          title="O que entra nessa configuração"
          text="Todos de fabricação própria e adaptáveis ao seu material, comprimento e altura."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p!.slug} product={p!} i={i % 3} compare />
          ))}
        </div>
      </Section>

      {/* transparência + lead */}
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <Reveal>
            <p className="eyebrow text-dm-blue">Transparência</p>
            <h2 className="h2 mt-3">{real ? "Como publicamos este case" : "Por que não há número de cliente aqui"}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              {real
                ? `Os números medidos e o depoimento foram publicados com autorização por escrito de ${real.client}. A simulação acima continua rotulada como simulação.`
                : "A Demakine só publica resultado de cliente com medição feita na operação e autorização por escrito do uso de nome e imagem. Enquanto isso não existe, o site mostra a configuração técnica e a simulação, com as premissas abertas."}
            </p>
            <ul className="mt-7 space-y-3 text-[15px] text-dm-ink/85">
              {[
                "Configuração técnica real, com produtos de catálogo",
                "Simulação rotulada, com premissas visíveis",
                "Sem promessa de payback, prazo ou percentual",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-dm-green" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-[13.5px] text-dm-gray">
              É cliente da Demakine e quer que a sua operação apareça aqui? Fale com a gente:{" "}
              {site.mobile}.
            </p>
          </Reveal>

          <LeadForm
            source={`case-${item.slug}`}
            product={item.title}
            title="Avaliar a minha operação"
            subtitle="Conte o material, o volume por dia e a altura necessária. A engenharia responde com a configuração."
          />
        </div>
      </Section>

      {/* outras aplicações */}
      <Section tone="surface">
        <SectionHead eyebrow="Outras aplicações" title="Veja outros cenários" />
        <div className="mt-8 flex flex-wrap gap-3">
          {caseStudies
            .filter((c) => c.slug !== item.slug)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/cases/${c.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-dm-line bg-white px-4 py-2.5 text-[14.5px] font-semibold text-dm-ink/80 transition-colors hover:border-dm-blue/40 hover:text-dm-blue"
              >
                {c.segment}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
        </div>
      </Section>

      <CtaBand waMessage={waMsg} />
    </>
  );
}
