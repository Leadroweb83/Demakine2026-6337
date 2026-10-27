import { Compass, HeartHandshake, Target } from "lucide-react";
import { Seo } from "@/components/seo";
import { aboutPageJsonLd } from "@/lib/schema";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { ClientsMarquee, CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { Trajectory, type Milestone } from "@/components/trajectory";
import { VideoSection } from "@/components/video-section";
import { site } from "@/lib/site";

const values = ["Deus", "Empatia", "Comprometimento", "Perseverança e resiliência", "Excelência", "Humildade"];

/**
 * Trajetória: fatos publicados no site (feiras no blog, números da empresa).
 * 2012 vem da conta "14 anos de atividade" (site.stats.years) em 2026; confirmar com a Demakine.
 * Para acrescentar um marco (primeira máquina, mudança de fábrica...), é só incluir um item com
 * foto real, na ordem cronológica: a linha do tempo se ajusta sozinha.
 */
const timeline: Milestone[] = [
  {
    when: "2012",
    kicker: "Limeira/SP",
    title: "Nasce a Demakine",
    text: "Fábrica própria em Limeira, no interior de São Paulo, fabricando esteiras e roscas para a indústria e o agronegócio.",
    image: "/img/site/fabrica.webp",
    alt: "Soldador trabalhando em uma peça na fábrica da Demakine em Limeira/SP",
  },
  {
    when: "2024",
    kicker: "Ribeirão Preto/SP · Agrishow",
    title: "Agrishow 2024",
    text: "Estande em parceria com a MF Rural, com demonstração dos equipamentos para produtores e indústrias.",
    image: "/img/blog/demakine-marcou-presenca-na-agrishow-2024.webp",
    alt: "Equipe da Demakine reunida na Agrishow 2024",
  },
  {
    when: "2024",
    kicker: "Presidente Prudente/SP · 18 a 21 de julho",
    title: "5ª Batatec",
    text: "Presença na 5ª Batatec, em Presidente Prudente/SP, com demonstração dos equipamentos.",
    image: "/img/blog/batatec-2024-demakine-marcou-presenca-de-sucesso.webp",
    alt: "Esteira Demakine e equipe no estande da 5ª Batatec",
  },
  {
    when: "2025",
    kicker: "Ribeirão Preto/SP · Agrishow",
    title: "Agrishow 2025",
    text: "Cinco dias de demonstrações ao vivo e conversas técnicas com produtores e indústrias de todo o país.",
    image: "/img/blog/demakine-na-agrishow-2025.webp",
    alt: "Equipe e visitantes no estande da Demakine na Agrishow 2025",
  },
  {
    when: "2026",
    kicker: "27 de abril a 1º de maio",
    title: "Agrishow e AgroBrasília",
    text: "A linha agro chega às duas maiores vitrines do campo: Ribeirão Preto/SP e Brasília/DF.",
    image: "/img/blog/demakine-na-agrishow-2026.webp",
    alt: "Estande da Demakine na Agrishow 2026",
    fit: "contain",
  },
  {
    when: "Hoje",
    kicker: "Limeira/SP · todo o Brasil",
    title: "Fabricação, assistência e peças no mesmo time",
    text: "Do projeto à entrega, e depois dela: a mesma equipe fabrica, instala e cuida da assistência técnica.",
    image: "/img/site/patio-equipamentos.webp",
    alt: "Esteiras e roscas transportadoras Demakine ao ar livre",
    stats: true,
  },
];

const socialProjects = [
  {
    name: "Gota de Compaixão",
    place: "Tarrafas / CE",
    text: "Base missionária no sertão nordestino que assiste mais de 30 crianças com alimentação, reforço escolar e atividades lúdicas, alcançando famílias da região.",
  },
  {
    name: "Valentes de Davi",
    place: "Comunidade terapêutica",
    text: "ONG que atende pessoas em situação de vulnerabilidade social, dependência de substâncias psicoativas ou em situação de rua, com foco em tratamento e reinserção.",
  },
  {
    name: "Missionários na Índia",
    place: "Índia",
    text: "Contribuímos com trabalho missionário que alcança famílias inteiras com acolhimento, suporte espiritual e auxílio humanitário em regiões vulneráveis.",
  },
  {
    name: "Missão Atraídos",
    place: "Moçambique",
    text: "Parceria em um trabalho consistente na África, atuando em comunidades locais com educação, assistência básica e fé.",
  },
];

export default function AEmpresa() {
  return (
    <>
      <Seo
        title="A Empresa | Demakine Equipamentos Agroindustriais"
        description="Há mais de 14 anos em Limeira/SP, a Demakine fabrica máquinas e equipamentos para a indústria e o agronegócio. Missão, visão, valores e propósito social."
        path="/a-empresa"
        image="/img/site/fabrica.webp"
        jsonLd={aboutPageJsonLd(
          "Há mais de 14 anos em Limeira/SP, a Demakine fabrica máquinas e equipamentos para a indústria e o agronegócio.",
        )}
      />

      <PageHero
        eyebrow="A Empresa"
        title="Transformando o setor agroindustrial desde a nossa fábrica em Limeira"
        text="Mais de 14 anos criando soluções inteligentes para indústrias que buscam agilidade e alto desempenho nos seus processos de produção."
        image="/img/site/hero-fabrica.webp"
        videoBg="/video/hero-fabrica.mp4"
        crumbs={[{ label: "A Empresa" }]}
      />

      {/* ------------------------------------------------------------- números */}
      <div className="border-b border-dm-line bg-white">
        <div className="dm-container grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {[
            { value: <Counter to={site.stats.years} suffix="+" />, label: "anos em atividade" },
            { value: <Counter to={site.stats.machines} suffix="+" />, label: "máquinas vendidas" },
            { value: <Counter to={site.stats.clients} suffix="+" />, label: "clientes atendidos" },
            { value: <Counter to={site.stats.rating} decimals={1} suffix="★" />, label: "nota de avaliação" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-dm-blue md:text-4xl">{s.value}</p>
              <p className="mt-1 text-[13px] uppercase tracking-wide text-dm-gray">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* vídeo institucional logo no começo, como na home */}
      <VideoSection stats={false} />

      {/* ------------------------------------------------------------- história */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-dm-blue">Nossa história</p>
            <h2 className="h2 mt-3">Não somos apenas fornecedores. Somos parceiros estratégicos.</h2>
            <div className="prose-dm mt-6 text-[16.5px] leading-relaxed text-dm-ink/80">
              <p>
                Localizada em Limeira, no interior de São Paulo, a Demakine consolidou-se como
                referência no mercado de equipamentos agroindustriais. Com mais de 14 anos de
                experiência, nosso propósito é criar soluções inteligentes para indústrias que buscam
                agilidade e alto desempenho.
              </p>
              <p>
                A excelência está presente em cada etapa do trabalho. Nossa equipe de especialistas
                se dedica a entregar mais do que produtos: oferecemos parcerias de confiança,
                pensadas para superar expectativas e agregar valor. O caminho para o sucesso passa
                por um atendimento próximo, em que cada solução é feita sob medida.
              </p>
              <p>
                Nosso controle de qualidade rigoroso é uma das razões pelas quais somos reconhecidos
                no setor. Cada equipamento passa por testes meticulosos para garantir máxima
                confiabilidade e eficiência.
              </p>
              <p>
                Da fabricação até a entrega final, cada projeto carrega nossa paixão pelo ofício.
                Estamos comprometidos em entregar soluções ágeis, com qualidade e foco total no
                resultado.
              </p>
            </div>
          </Reveal>

          <Reveal i={1} className="grid gap-4">
            <img
              src="/img/site/fabrica.webp"
              alt="Fábrica Demakine"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
            />
            <img
              src="/img/site/patio-equipamentos.webp"
              alt="Esteiras e roscas transportadoras Demakine ao ar livre"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
            />
          </Reveal>
        </div>
      </Section>

      {/* ----------------------------------------------------------- trajetória */}
      {/* overflow-clip, não hidden: hidden desliga o sticky do palco */}
      <section className="relative overflow-clip bg-dm-blue-deep py-16 md:py-24">
        <div className="absolute inset-0 grid-lines" />
        <div className="dm-container relative">
          <SectionHead dark eyebrow="Linha do tempo" title="Nossa trajetória" />
          <div className="mt-12 md:mt-16">
            <Trajectory steps={timeline} />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- missão visão valores */}
      <Section tone="surface">
        <SectionHead eyebrow="O que nos guia" title="Missão, visão e valores" />
        {/*
          Missão → visão → valores ligados por uma linha, como a linha do tempo. Os pontos pulsam em
          sequência e um brilho corre pela linha no mesmo sentido: um leva ao outro.
        */}
        <ol className="mvv relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          <span aria-hidden="true" className="mvv-line">
            <span className="mvv-flow" />
          </span>
          {[
            {
              Icon: Target,
              title: "Missão",
              body: (
                <p className="text-[17px] leading-relaxed text-dm-ink/85 md:text-[18px]">
                  Oferecer soluções práticas e inovadoras na fabricação de máquinas e equipamentos
                  para os setores da indústria e do agronegócio.
                </p>
              ),
            },
            {
              Icon: Compass,
              title: "Visão",
              body: (
                <p className="text-[17px] leading-relaxed text-dm-ink/85 md:text-[18px]">
                  Ser líder nacional e internacional no setor agroindustrial e empresa referência
                  para clientes, colaboradores e parceiros.
                </p>
              ),
            },
            {
              Icon: HeartHandshake,
              title: "Valores",
              body: (
                <ul className="flex flex-wrap gap-2">
                  {values.map((v) => (
                    <li
                      key={v}
                      className="rounded-full border border-dm-blue/20 bg-white px-3.5 py-1.5 text-[14.5px] font-semibold text-dm-blue shadow-sm"
                    >
                      {v}
                    </li>
                  ))}
                </ul>
              ),
            },
          ].map(({ Icon, title, body }, idx) => (
            <li key={title} className="relative pl-20 md:pl-0 md:pt-24">
              <span
                aria-hidden="true"
                className="mvv-node absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full bg-dm-blue text-white shadow-[0_10px_24px_rgba(16,61,148,0.28)]"
                style={{ ["--d" as string]: `${idx * 0.8}s` }}
              >
                <span className="mvv-ping" />
                <Icon className="relative h-6 w-6" />
              </span>
              <Reveal i={idx}>
                <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-dm-red">0{idx + 1}</p>
                <h3 className="mt-1 font-display text-[24px] font-extrabold text-dm-ink">{title}</h3>
                <div className="mt-3">{body}</div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------------- propósito social */}
      <section className="relative overflow-hidden bg-dm-blue-deep py-16 md:py-24">
        <div className="absolute inset-0 grid-lines" />
        <div className="dm-container relative">
          {/* o pedido foi destacar "Propósito social": vira um selo legível, não um sobretítulo apagado */}
          <p className="mb-5 inline-flex items-center rounded-full bg-white/12 px-4 py-2 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
            Propósito social
          </p>
          <SectionHead
            dark
            title="Nosso compromisso é com pessoas"
            text="Acreditamos que cada empresa tem o poder de transformar realidades. Por isso apoiamos projetos que levam cuidado, educação e esperança a quem mais precisa."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {socialProjects.map((p, idx) => (
              <Reveal key={p.name} i={idx % 2} className="h-full">
                <div className="h-full rounded-2xl border border-white/12 bg-white/[0.04] p-6">
                  <p className="eyebrow text-white/40">{p.place}</p>
                  <h3 className="mt-2 text-[17px] font-bold text-white">{p.name}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/65">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <figure className="mt-12 border-l-4 border-dm-red pl-6 md:pl-8">
              <blockquote className="max-w-3xl font-display text-[22px] font-bold leading-snug text-white md:text-[30px]">
                “Que pratiquem o bem, sejam ricos de boas obras, generosos em dar e prontos a repartir.”
              </blockquote>
              <figcaption className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-white/60">
                1 Timóteo 6:18
              </figcaption>
            </figure>
          </Reveal>
          <p className="mt-12 max-w-3xl text-[15.5px] leading-relaxed text-white/55">
            Cada ação que apoiamos carrega um propósito maior: ser instrumento de transformação.
            Nossa fé nos move, e o compromisso com o próximo é parte essencial da nossa identidade
            como empresa.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- clientes */}
      <Section className="pb-6">
        <SectionHead
          eyebrow="Confiança construída"
          title="Empresas que movimentam a produção com a Demakine"
          align="center"
        />
      </Section>
      <ClientsMarquee tone="surface" />

      <CtaBand />
    </>
  );
}
