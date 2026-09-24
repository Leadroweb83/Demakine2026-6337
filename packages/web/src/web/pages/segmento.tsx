import { Link, useParams } from "wouter";
import { ArrowRight, AlertTriangle, Search } from "lucide-react";
import { Seo } from "@/components/seo";
import { clipDescription, fitTitle } from "@/lib/seo-text";
import {
  Section,
  SectionHead,
  PageHero,
  ProductCard,
  BtnWhats,
  BtnGhost,
  ClientsMarquee,
  CtaBand,
} from "@/components/kit";
import { Reveal } from "@/components/reveal";
import { FaqAccordion } from "@/components/faq";
import { LeadForm } from "@/components/lead-form";
import { getProduct } from "@/lib/content";
import { getSegmentLp, segmentLps } from "@/lib/segmentos-lp";
import { site, waLink } from "@/lib/site";

function SegmentoNaoEncontrado() {
  return (
    <Section>
      <p className="eyebrow text-dm-blue">Segmento</p>
      <h1 className="h2 mt-3">Segmento não encontrado</h1>
      <p className="mt-4 max-w-xl text-[16.5px] text-dm-gray">
        Escolha um dos setores atendidos pela Demakine ou fale direto com a engenharia.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {segmentLps.map((s) => (
          <Link
            key={s.slug}
            href={`/segmentos/${s.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-dm-line px-4 py-2.5 text-[14.5px] font-semibold text-dm-ink/80 transition-colors hover:border-dm-blue/40 hover:text-dm-blue"
          >
            {s.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </Section>
  );
}

export default function Segmento() {
  const { slug } = useParams<{ slug: string }>();
  const lp = getSegmentLp(slug ?? "");

  if (!lp) return <SegmentoNaoEncontrado />;

  const products = lp.products.map((s) => getProduct(s)).filter((p) => Boolean(p));
  const others = segmentLps.filter((s) => s.slug !== lp.slug);
  const waMsg = `Olá! Preciso de equipamento para ${lp.name.toLowerCase()}.`;

  return (
    <>
      <Seo
        title={fitTitle(lp.title, [" | Demakine"])}
        description={clipDescription(lp.intro)}
        path={`/segmentos/${lp.slug}`}
        image={lp.hero}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: lp.title,
          serviceType: lp.name,
          areaServed: "BR",
          provider: {
            "@type": "Organization",
            name: site.legal,
            url: site.url,
            telephone: site.phone,
          },
        }}
      />

      <PageHero
        eyebrow={lp.eyebrow}
        title={lp.title}
        text={lp.intro}
        image={lp.hero}
        crumbs={[{ label: "Segmentos" }, { label: lp.name }]}
      />

      {/* dores do setor */}
      <Section tone="white">
        <SectionHead
          eyebrow="O que trava a operação"
          title="Os problemas que aparecem nesse setor"
          text="Antes de falar de máquina, vale olhar onde o processo perde tempo, material e gente."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {lp.pains.map((p, i) => (
            <Reveal key={p.title} i={i % 2} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${lp.color}18`, color: lp.color }}
                >
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[17px] font-bold leading-snug text-dm-ink">{p.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-dm-gray">{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* fluxo do material */}
      <Section tone="deep">
        <SectionHead
          dark
          eyebrow="Fluxo do material"
          title="Onde cada equipamento entra"
          text="O caminho típico do material nesse setor, da chegada até a saída."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {lp.chain.map((c, i) => (
            <Reveal key={c.step} i={i} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-5">
                <span
                  className="font-mono text-[12px] font-bold tracking-widest"
                  style={{ color: lp.color }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[16px] font-bold leading-snug text-white">{c.step}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/60">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <BtnWhats href={waLink(waMsg)}>Falar com um especialista</BtnWhats>
          <BtnGhost dark to="/ferramentas">
            Dimensionar no simulador
          </BtnGhost>
        </div>
      </Section>

      {/* produtos indicados */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Equipamentos indicados"
          title={`Linha usada em ${lp.name.toLowerCase()}`}
          text="Todos fabricados na nossa unidade em Limeira/SP e adaptáveis ao seu material, comprimento e altura."
          action={
            <BtnGhost to="/produtos">
              Ver catálogo completo
            </BtnGhost>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p!.slug} product={p!} i={i % 3} compare />
          ))}
        </div>
      </Section>

      <ClientsMarquee />

      {/* formulário */}
      <Section tone="white" id="orcamento">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <Reveal>
            <p className="eyebrow text-dm-blue">Orçamento</p>
            <h2 className="h2 mt-3">Conte o material e a operação</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Informe o produto que você movimenta, o comprimento e a altura necessários e a
              capacidade desejada. A engenharia responde com a especificação e o orçamento.
            </p>
            <ul className="mt-7 space-y-3 text-[15px] text-dm-ink/85">
              {[
                "Projeto sob medida, inclusive medida especial",
                "Fabricação própria em Limeira/SP",
                "Assistência técnica e peças de reposição",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0" style={{ color: lp.color }} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <BtnWhats href={waLink(waMsg)}>WhatsApp {site.mobile}</BtnWhats>
            </div>
          </Reveal>
          <LeadForm
            source={`segmento-${lp.slug}`}
            product={lp.name}
            title="Solicitar orçamento"
            subtitle="Resposta de um especialista, sem robô."
          />
        </div>
      </Section>

      {/* faq */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Perguntas do setor"
          title="Dúvidas que aparecem antes da compra"
        />
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <FaqAccordion items={lp.faq} openFirst />
          <Reveal>
            <div className="rounded-2xl border border-dm-line bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                <Search className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[13px] font-bold uppercase tracking-wide text-dm-gray">
                Também procuram por
              </p>
              <ul className="mt-3 space-y-2 text-[15px] text-dm-ink/85">
                {lp.searchTerms.map((t) => (
                  <li key={t} className="border-b border-dm-line pb-2 last:border-0">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* outros segmentos */}
      <Section tone="white">
        <SectionHead eyebrow="Outros setores" title="A Demakine também atende" />
        <div className="mt-8 flex flex-wrap gap-3">
          {others.map((s) => (
            <Link
              key={s.slug}
              href={`/segmentos/${s.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-dm-line px-4 py-2.5 text-[14.5px] font-semibold text-dm-ink/80 transition-colors hover:border-dm-blue/40 hover:text-dm-blue"
            >
              {s.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
          <Link
            href="/agro"
            className="inline-flex items-center gap-2 rounded-full border border-dm-line px-4 py-2.5 text-[14.5px] font-semibold text-dm-ink/80 transition-colors hover:border-dm-blue/40 hover:text-dm-blue"
          >
            Agro e grãos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CtaBand waMessage={waMsg} />
    </>
  );
}
