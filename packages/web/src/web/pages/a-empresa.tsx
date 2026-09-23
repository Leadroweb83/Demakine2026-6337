import { Compass, HeartHandshake, Target } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { ClientsMarquee, CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { site } from "@/lib/site";

const values = [
  "Deus",
  "Respeito",
  "Trabalho em equipe",
  "Humanismo",
  "Foco nas pessoas e no cliente",
  "Superação e resiliência",
  "Humildade",
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
        description="Há mais de 15 anos em Limeira/SP, a Demakine fabrica máquinas e equipamentos para a indústria e o agronegócio. Missão, visão, valores e propósito social."
        path="/a-empresa"
        image="/img/site/fabrica.jpg"
      />

      <PageHero
        eyebrow="A Empresa"
        title="Transformando o setor agroindustrial desde a nossa fábrica em Limeira"
        text="Mais de 15 anos criando soluções inteligentes para indústrias que buscam agilidade e alto desempenho nos seus processos de produção."
        image="/img/site/fabrica.jpg"
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

      {/* ------------------------------------------------------------- história */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-dm-blue">Nossa história</p>
            <h2 className="h2 mt-3">Não somos apenas fornecedores. Somos parceiros estratégicos.</h2>
            <div className="prose-dm mt-6 text-[16.5px] leading-relaxed text-dm-ink/80">
              <p>
                Localizada em Limeira, no interior de São Paulo, a Demakine consolidou-se como
                referência no mercado de equipamentos agroindustriais. Com mais de 15 anos de
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
              src="/img/site/fabrica.jpg"
              alt="Fábrica Demakine"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
            />
            <img
              src="/img/site/oficina.jpg"
              alt="Equipamento Demakine em produção na oficina"
              loading="lazy"
              className="w-full rounded-2xl object-cover"
            />
          </Reveal>
        </div>
      </Section>

      {/* --------------------------------------------------- missão visão valores */}
      <Section tone="surface">
        <SectionHead eyebrow="O que nos guia" title="Missão, visão e valores" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              Icon: Target,
              title: "Missão",
              body: (
                <p className="text-[15.5px] leading-relaxed text-dm-gray">
                  Oferecer soluções práticas e inovadoras na fabricação de máquinas e equipamentos
                  para os setores da indústria e do agronegócio.
                </p>
              ),
            },
            {
              Icon: Compass,
              title: "Visão",
              body: (
                <p className="text-[15.5px] leading-relaxed text-dm-gray">
                  Ser líder nacional no setor industrial e empresa referência para clientes,
                  colaboradores e parceiros.
                </p>
              ),
            },
            {
              Icon: HeartHandshake,
              title: "Valores",
              body: (
                <ul className="space-y-1.5 text-[15.5px] text-dm-gray">
                  {values.map((v) => (
                    <li key={v} className="flex gap-2">
                      <span className="text-dm-blue">•</span>
                      {v}
                    </li>
                  ))}
                </ul>
              ),
            },
          ].map(({ Icon, title, body }, idx) => (
            <Reveal key={title} i={idx} className="h-full">
              <div className="h-full rounded-2xl border border-dm-line bg-white p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[18px] font-bold text-dm-ink">{title}</h3>
                <div className="mt-3">{body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- propósito social */}
      <section className="relative overflow-hidden bg-dm-blue-deep py-16 md:py-24">
        <div className="absolute inset-0 grid-lines" />
        <div className="dm-container relative">
          <SectionHead
            dark
            eyebrow="Propósito social"
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
          <p className="mt-10 max-w-3xl text-[15.5px] leading-relaxed text-white/55">
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
