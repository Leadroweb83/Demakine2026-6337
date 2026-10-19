import { useState } from "react";
import { ArrowUpRight, Layers, Ruler, ShieldCheck, TrendingUp, X } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { BtnPrimary, CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { projects as photoProjects } from "@/lib/content";
import { segmentList } from "@/lib/segments";
import { tr } from "@/lib/i18n";

const pillars = [
  {
    Icon: Ruler,
    title: "Projetos 100% personalizados",
    text: "Cada equipamento é desenvolvido sob medida, considerando o espaço disponível, o tipo de produto transportado e a realidade do seu processo produtivo.",
  },
  {
    Icon: Layers,
    title: "Materiais de alta resistência",
    text: "Aço inox, galvanizado, alumínio, borracha e outros materiais selecionados conforme a aplicação, garantindo durabilidade e baixo custo de manutenção.",
  },
  {
    Icon: ShieldCheck,
    title: "Segurança e ergonomia",
    text: "Desenvolvidos de acordo com normas técnicas e de segurança, reduzindo esforço físico, falhas de transporte e riscos de acidente.",
  },
  {
    Icon: TrendingUp,
    title: "Soluções que crescem com você",
    text: "Estruturas planejadas para permitir ampliações, ajustes e integração com novos equipamentos no futuro.",
  },
];

const benefits = [
  {
    title: "Aumento da produtividade",
    text: "Fluxo contínuo e sem interrupções, reduzindo gargalos e acelerando a linha de produção.",
  },
  {
    title: "Redução de custos operacionais",
    text: "Menos mão de obra em tarefas repetitivas e menor incidência de falhas e retrabalho.",
  },
  {
    title: "Mais segurança para a equipe",
    text: "Sistemas projetados para reduzir riscos de acidente e esforço físico excessivo.",
  },
  {
    title: "Padronização dos processos",
    text: "Transporte estável e uniforme, com mais qualidade e consistência no resultado final.",
  },
  {
    title: "Flexibilidade e escalabilidade",
    text: "Projetos adaptáveis, que podem ser expandidos ou integrados a novos equipamentos.",
  },
  {
    title: "Retorno rápido do investimento",
    text: "Cada projeto é pensado para maximizar resultado e reduzir custo por tonelada movimentada.",
  },
];

/**
 * Projetos desenhados pela engenharia da Demakine (renders 3D). Entram na ordem em que aparecem
 * na página: primeiro as linhas completas, depois os equipamentos.
 */
const DESIGN_DESC = "Projeto 3D desenvolvido pela engenharia da Demakine.";
const designProjects = [
  "Linha de triagem com plataforma elevada e big bags",
  "Esteira para carga de sacaria em contêineres",
  "Esteira para descarga de caminhão",
  "Esteira para descarga de caminhão em galpão",
  "Roscas transportadoras em fosso de recebimento",
  "Elevador de canecas com plataforma ao lado de silo",
  "Rosca transportadora para descarga de caminhão",
  "Elevador de canecas com plataforma de manutenção",
  "Esteira inclinada sobre rodas com estrutura treliçada",
  "Esteira em dois lances com plataforma",
  "Esteira com máquina de costurar sacos e guias laterais",
  "Costura de sacos com carro sobre trilho",
  "Rosca transportadora inclinada em inox com moega",
  "Esteira com cobertura e trecho de rolos livres",
  "Esteira horizontal com correia verde",
  "Esteira inclinada com rodízios",
  "Esteira inclinada com moega e rodas",
  "Esteira vertical com base sobre rodízios",
].map((name, i) => ({
  slug: `projeto-3d-${i + 1}`,
  name,
  desc: DESIGN_DESC,
  images: [`/img/projetos-3d/${String(i + 1).padStart(2, "0")}.webp`],
}));

const FIRST_BATCH = 9;

const engineeringText = [
  "Nem toda operação se encaixa em uma solução pronta. Existem processos que exigem dimensões específicas, diferentes capacidades, adaptações de layout ou até um equipamento desenvolvido exclusivamente para aquela aplicação.",
  "É nesse cenário que entra a experiência da Demakine em Projetos Especiais.",
  "Contamos com um time de engenharia interno, especializado em compreender o processo do cliente, identificar suas necessidades e transformar cada desafio em uma solução tecnicamente adequada.",
  "O trabalho começa entendendo a realidade da operação: o material que será movimentado, a capacidade necessária, o espaço disponível, as condições de trabalho e os objetivos do projeto. A partir dessas informações, nossa equipe de engenharia desenvolve e desenha o projeto desde o início, definindo as características necessárias para que o equipamento se integre ao processo.",
  "Da concepção à fabricação, cada etapa é acompanhada pela Demakine, unindo engenharia, experiência e conhecimento em equipamentos industriais e agroindustriais.",
  "Com mais de 15 anos de mercado e experiência no desenvolvimento de soluções personalizadas, somos especialistas em criar Projetos Especiais para operações que precisam ir além dos equipamentos convencionais.",
];

export default function ProjetosEspeciais() {
  const [open, setOpen] = useState<{ slug: string; index: number } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const active = open ? [...designProjects, ...photoProjects].find((p) => p.slug === open.slug) : null;
  const shownDesigns = showAll ? designProjects : designProjects.slice(0, FIRST_BATCH);

  return (
    <>
      <Seo
        title="Projetos Especiais: Equipamentos sob medida | Demakine"
        description="Esteiras em Z, moegas para big bag, inox sanitário, galvanizadas, com trilho e contador de sacos: mais de 20 projetos especiais entregues pela Demakine."
        path="/projetos-especiais"
        image="/img/site/projetos.webp"
      />

      <PageHero
        eyebrow="Engenharia sob medida"
        title="Projetos especiais para processos que não cabem no padrão"
        text="Adaptar uma linha, automatizar uma etapa ou integrar novos equipamentos: transformamos a sua necessidade em máquina projetada, fabricada e testada."
        image="/img/site/hero-projetos.webp"
        imageClassName="object-[50%_72%]"
        crumbs={[{ label: "Projetos Especiais" }]}
      />

      {/* ------------------------------------------------------- engenharia própria */}
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-dm-blue">Engenharia própria</p>
            <h2 className="h2 mt-3 max-w-2xl">
              Sua necessidade é o ponto de partida. Nossa engenharia transforma ela em projeto.
            </h2>
            <h3 className="mt-8 text-[20px] font-bold text-dm-ink md:text-[22px]">
              Projetos Especiais desenvolvidos para a sua operação
            </h3>
            <div className="mt-4 space-y-4 text-[16.5px] leading-relaxed text-dm-ink/80">
              {engineeringText.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </Reveal>

          <Reveal i={1} className="lg:sticky lg:top-28">
            <aside className="rounded-2xl bg-dm-blue-deep p-7 text-white md:p-9">
              <p className="eyebrow text-white/60">Fale com a engenharia</p>
              <h3 className="mt-3 text-[24px] font-bold leading-snug md:text-[28px]">
                Sua operação tem uma necessidade específica?
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-white/75">
                Conte para nossa equipe como funciona o seu processo. Nossa engenharia está preparada
                para estudar o seu projeto e desenvolver uma solução desde o zero.
              </p>
              <div className="mt-7">
                <BtnPrimary to="/contato">Contar sobre o meu processo</BtnPrimary>
              </div>
            </aside>
          </Reveal>
        </div>
      </Section>

      {/* ---------------------------------------------------------- projetos em 3D */}
      <Section tone="surface" id="projetos-3d">
        <SectionHead
          eyebrow="Projetos desenvolvidos"
          title="Abaixo estão alguns projetos que desenvolvemos"
          text="Desenhos da nossa engenharia, feitos antes de qualquer corte de aço. Clique para ampliar."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shownDesigns.map((p, idx) => (
            <Reveal key={p.slug} i={idx % 3} className="h-full">
              <button
                type="button"
                onClick={() => setOpen({ slug: p.slug, index: 0 })}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-dm-blue/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f7f7]">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    width={1200}
                    height={900}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dm-blue opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-[16px] font-bold leading-snug text-dm-ink group-hover:text-dm-blue">
                    {p.name}
                  </h3>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {!showAll && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-full border border-dm-blue px-7 py-3 text-[13px] font-bold uppercase tracking-wide text-dm-blue transition-colors hover:bg-dm-blue hover:text-white"
            >
              Ver mais projetos
            </button>
          </div>
        )}
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <p className="eyebrow text-dm-blue">Como trabalhamos</p>
            <h2 className="h2 mt-3">Nem todo processo produtivo cabe num equipamento de catálogo</h2>
            <div className="prose-dm mt-5 text-[16.5px] leading-relaxed text-dm-ink/80">
              <p>
                Por isso a Demakine desenvolve projetos especiais, criados a partir das
                especificações, do espaço disponível e das demandas operacionais de cada cliente.
              </p>
              <p>
                Nossos engenheiros e técnicos analisam cada etapa do processo produtivo para propor
                soluções únicas, com mais desempenho, durabilidade e segurança.
              </p>
              <p>
                Mais do que fabricar equipamentos, entregamos projetos completos, que integram
                tecnologia, inovação e praticidade para tornar sua operação mais eficiente.
              </p>
            </div>
          </Reveal>

          <Reveal i={1}>
            <div className="grid gap-4">
              {pillars.map(({ Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-dm-line bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold text-dm-ink">{title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-dm-gray">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------------- galeria */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Portfólio"
          title="Alguns projetos especiais já entregues"
          text="Fotos reais de equipamentos que saíram da nossa fábrica. Clique para ampliar."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photoProjects.map((p, idx) => (
            <Reveal key={p.slug} i={idx % 3} className="h-full">
              <button
                type="button"
                onClick={() => setOpen({ slug: p.slug, index: 0 })}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-dm-blue/10"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-white">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dm-blue opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  {p.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
                      {p.images.length} fotos
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[16.5px] font-bold text-dm-ink group-hover:text-dm-blue">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{p.desc}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ benefícios */}
      <Section>
        <SectionHead
          eyebrow="Resultado na operação"
          title="O que muda quando o equipamento é feito para o seu processo"
        />
        <div className="mt-12 grid gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, idx) => (
            <Reveal key={b.title} i={idx % 3}>
              <div className="border-l-2 border-dm-blue pl-5">
                <h3 className="text-[16.5px] font-bold text-dm-ink">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-dm-gray">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 rounded-2xl border border-dm-line bg-dm-surface p-7 md:p-9">
          <p className="eyebrow text-dm-blue">Segmentos atendidos</p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {segmentList.map((s) => {
              const Icon = s.icon;
              return (
                <span
                  key={s.slug}
                  className="flex items-center gap-2.5 rounded-xl border border-dm-line bg-white px-3 py-2.5 text-[13.5px] font-semibold text-dm-ink/85"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${s.color}14`, color: s.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {s.name}
                </span>
              );
            })}
          </div>
          <p className="mt-5 text-[15px] text-dm-gray">
            Seja qual for a sua necessidade, temos a expertise para desenvolver o equipamento sob
            medida.
          </p>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------ formulário */}
      <Section tone="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Vamos projetar</p>
            <h2 className="h2 mt-3">Descreva o desafio da sua linha</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Quanto mais detalhe, mais preciso o projeto: material transportado, capacidade por
              hora, distância, altura de descarga, espaço disponível e restrições de higienização.
            </p>
          </Reveal>
          <Reveal i={1}>
            <LeadForm
              source="projetos-especiais"
              product="Projeto especial"
              buttonLabel="Solicitar projeto"
            />
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Tem um desenho, uma foto ou só a ideia?"
        text="Manda para a gente. Nossa engenharia avalia a viabilidade e volta com proposta técnica e prazo."
        waMessage="Olá! Quero falar sobre um projeto especial com a Demakine."
      />

      {/* ---------------------------------------------------------------- lightbox */}
      {active && open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-label={active.name}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.images[Math.min(open.index, active.images.length - 1)]}
              alt={active.name}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-white">{active.name}</h3>
              <p className="mx-auto mt-1 max-w-xl text-[14.5px] text-white/60">{active.desc}</p>
            </div>
            {active.images.length > 1 && (
              <div className="no-scrollbar mt-4 flex justify-center gap-2 overflow-x-auto">
                {active.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setOpen({ slug: active.slug, index: idx })}
                    aria-label={tr("Foto {n}", { n: idx + 1 })}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                      idx === open.index ? "border-white" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full bg-white object-contain p-0.5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
