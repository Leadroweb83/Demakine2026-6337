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
 * Trajetória: marcos e fotos fornecidos pela Demakine (documento "Ajustes Site1 - Linha do tempo").
 * Para acrescentar um marco, é só incluir um item com foto real, na ordem cronológica: a linha do
 * tempo se ajusta sozinha. As fotos ficam em public/img/trajetoria/.
 */
const timeline: Milestone[] = [
  {
    when: "2012",
    kicker: "Limeira/SP",
    title: "Fábrica própria",
    text: "Iniciamos nossa trajetória em uma fábrica própria, localizada em Limeira/SP.",
    images: [{ src: "/img/trajetoria/2012.webp", alt: "Fachada da primeira fábrica da Demakine, com palmeiras na calçada" }],
  },
  {
    when: "2014",
    kicker: "Mudança",
    title: "Um novo endereço",
    text: "A mudança para um novo endereço, ampliando nossas experiências e nos preparando para os desafios que estavam por vir.",
    images: [
      { src: "/img/trajetoria/2014.webp", alt: "Galpão de dois andares com faixa amarela na fachada e portão de enrolar" },
      { src: "/img/trajetoria/2014-2.webp", alt: "Equipe montando esteiras de correia verde dentro da fábrica" },
      { src: "/img/trajetoria/2014-3.webp", alt: "Esteiras de correia verde prontas, enfileiradas no piso da fábrica" },
    ],
  },
  {
    when: "2016",
    kicker: "Mudança",
    title: "Seguimos em frente",
    text: "Seguimos para um novo endereço, dando continuidade à nossa trajetória e criando oportunidades para o desenvolvimento das nossas atividades e projetos.",
    images: [{ src: "/img/trajetoria/2016.webp", alt: "Prédio branco de dois andares, com árvores e carros estacionados na frente" }],
  },
  {
    when: "2020–2025",
    roll: "2020",
    kicker: "Estrutura",
    title: "Período de expansão",
    text: "Passamos a contar com uma estrutura que acompanhou um período importante de expansão das nossas atividades e realização de novos projetos.",
    images: [
      { src: "/img/trajetoria/2020-2025.webp", alt: "Prédio da Demakine em azul e vermelho, com a marca na fachada" },
      { src: "/img/trajetoria/2020-2025-2.webp", alt: "Fachada do prédio de blocos brancos, com a parte de baixo pintada de azul" },
      { src: "/img/trajetoria/2020-2025-3.webp", alt: "Prédio de dois andares visto de frente, com duas árvores na calçada" },
      { src: "/img/trajetoria/2020-2025-4.webp", alt: "Prédio visto de lado, com o portão de madeira ao lado" },
      { src: "/img/trajetoria/2020-2025-5.webp", alt: "Interior do galpão, com bancadas de solda e estruturas de aço em montagem" },
      { src: "/img/trajetoria/2020-2025-6.webp", alt: "Escritório com mesas e notebooks" },
      { src: "/img/trajetoria/2020-2025-7.webp", alt: "Sala com armário branco, mesa de trabalho e cafeteira", fit: "contain" },
      { src: "/img/trajetoria/2020-2025-8.webp", alt: "Recepção com parede azul e escada de degraus de madeira", fit: "contain" },
    ],
  },
  {
    when: "2025",
    kicker: "Ampliação",
    title: "Um segundo barracão",
    text: "Ampliamos para um segundo barracão, mantendo as duas unidades em funcionamento simultaneamente.",
    images: [
      { src: "/img/trajetoria/2025.webp", alt: "Barracão da Demakine visto da rua, com os muros azuis com a marca e as esteiras expostas ao fundo" },
      { src: "/img/trajetoria/2025-2.webp", alt: "Prédio azul de dois andares, com o barracão vermelho e branco ao lado, visto da esquina" },
      { src: "/img/trajetoria/2025-3.webp", alt: "Fachada azul com toldo e a entrada do barracão vermelho, vista de baixo" },
      { src: "/img/trajetoria/2025-7.webp", alt: "Prédio bege com toldo azul e o telhado azul do barracão ao fundo" },
      { src: "/img/trajetoria/2025-4.webp", alt: "Interior do barracão, com pórtico de içamento e esteiras azuis em montagem" },
      { src: "/img/trajetoria/2025-8.webp", alt: "Área de produção, com bancadas de solda e estruturas de aço em montagem", fit: "contain" },
      { src: "/img/trajetoria/2025-5.webp", alt: "Escada interna com corrimão preto e poltronas ao fundo" },
      { src: "/img/trajetoria/2025-6.webp", alt: "Equipe trabalhando no escritório, com mesas e notebooks", fit: "contain" },
    ],
  },
  {
    when: "2026",
    kicker: "Marco",
    title: "Nossa maior estrutura",
    text: "Alcançamos mais um marco importante: nossa maior estrutura até então. E seguimos aprimorando nossos processos e atendendo às necessidades dos nossos clientes com ainda mais eficiência.",
    images: [{ src: "/img/trajetoria/2026.webp", alt: "Vista aérea da maior estrutura da Demakine, com a marca no telhado" }],
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
