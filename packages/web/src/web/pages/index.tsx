import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Clock3,
  Cog,
  Factory,
  Headphones,
  Ruler,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { Seo, organizationJsonLd } from "@/components/seo";
import {
  CineBullets,
  CineRule,
  CineSection,
  CineShot,
  CineStat,
  CineTag,
  CineTitle,
} from "@/components/cine";
import { Rotator } from "@/components/rotator";
import { Timeline } from "@/components/timeline";
import { QuickSelector } from "@/components/tools/quick-selector";
import { BrazilMap } from "@/components/tools/brazil-map";
import { CompareSlider } from "@/components/tools/compare-slider";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { LeadForm } from "@/components/lead-form";
import {
  BtnGhost,
  BtnPrimary,
  ClientsMarquee,
  ProductCard,
  Section,
  SectionHead,
  TestimonialGrid,
} from "@/components/kit";
import {
  bestSeller,
  categories,
  formatDate,
  getProduct,
  posts,
  products,
  projects,
  testimonials,
} from "@/lib/content";
import { segments, site, waLink } from "@/lib/site";

const categoryIcons: Record<string, typeof Cog> = {
  "esteiras-transportadoras": Truck,
  "roscas-transportadoras": Cog,
  elevadores: Boxes,
  "empacotamento-e-costura": Wrench,
};

const differentials = [
  {
    Icon: Ruler,
    title: "Engenharia sob medida",
    text: "Cada equipamento é dimensionado para o seu material, layout e capacidade. Nada de solução de catálogo forçada na sua linha.",
  },
  {
    Icon: Factory,
    title: "Fabricação própria",
    text: "Corte, dobra, solda, usinagem, montagem e pintura na nossa fábrica em Limeira/SP. Controle rigoroso em todas as etapas.",
  },
  {
    Icon: Clock3,
    title: "Prazo que se cumpre",
    text: "Cronograma definido na proposta e acompanhamento da produção. Nossos clientes voltam justamente por isso.",
  },
  {
    Icon: ShieldCheck,
    title: "Estrutura reforçada",
    text: "Aço SAE 1020, motoredutores blindados, roletes com rolamentos e pintura industrial para operar turno cheio.",
  },
  {
    Icon: Headphones,
    title: "Assistência técnica real",
    text: "SAC com peças de reposição, orientação de instalação e suporte técnico direto com quem fabricou a máquina.",
  },
  {
    Icon: BadgeCheck,
    title: "Preço competitivo",
    text: "Fabricante direto, sem intermediário. Você paga pela engenharia e pelo aço, não pela cadeia de revenda.",
  },
];


export default function Home() {
  const featured = products.slice(0, 8);
  const latestPosts = posts.slice(0, 3);
  const homeProjects = projects.slice(0, 6);
  const champion = getProduct(bestSeller) ?? products[0];
  const championBullets = champion.features.slice(0, 5);

  return (
    <>
      <Seo
        title="Demakine — Esteiras, Roscas, Elevadores e Máquinas de Costurar Sacos"
        description="Fábrica de esteiras transportadoras, roscas, elevadores, máquinas de costurar sacos e projetos especiais sob medida. +15 anos e 7.000 máquinas entregues em todo o Brasil. Limeira/SP."
        path="/"
        jsonLd={organizationJsonLd}
      />

      {/* ---------------------------------------------------------------- hero */}
      <CineSection
        bleed
        className="pt-14 pb-16 md:pt-20 md:pb-24"
        media={
          <video
            className="absolute inset-0 -z-[2] h-full w-full object-cover opacity-[0.32]"
            src="/video/hero-loop.mp4"
            poster="/img/site/hero.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        }
      >
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <CineTag>{site.legal} · Limeira/SP</CineTag>

            <h1 className="cine-title mt-6 text-white">
              <span className="cine-line">
                <span style={{ ["--i" as string]: 0 }}>A indústria</span>
              </span>
              <span className="cine-line">
                <span style={{ ["--i" as string]: 1 }}>em movimento</span>
              </span>
              <span className="block text-[0.46em] font-display font-extrabold leading-tight tracking-normal normal-case text-white/85 md:text-[0.4em]">
                para{" "}
                <Rotator
                  words={["grãos", "fertilizantes", "reciclagem", "construção", "alimentos"]}
                />
              </span>
            </h1>

            <CineRule className="mt-6" />

            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/72 md:text-lg">
              Esteiras transportadoras, roscas, elevadores, máquinas de costurar sacos e projetos
              especiais fabricados sob medida na nossa fábrica em Limeira/SP. Menos gente carregando
              no braço, mais produtividade na linha.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BtnPrimary to="/contato" className="cine-shine">
                Solicitar orçamento
              </BtnPrimary>
              <BtnGhost dark href="/downloads/catalogo-demakine.pdf" external>
                Ver catálogo (PDF)
              </BtnGhost>
            </div>

            <div className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 md:grid-cols-4">
              <CineStat value={<Counter to={site.stats.years} suffix="+" />} label="anos de mercado" />
              <CineStat value={<Counter to={site.stats.machines} suffix="+" />} label="máquinas entregues" />
              <CineStat value={<Counter to={site.stats.clients} suffix="+" />} label="clientes atendidos" />
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <CineStat value={<Counter to={site.stats.rating} decimals={1} />} label="nota média · ver no Google" />
              </a>
            </div>
          </div>

          <div>
            <QuickSelector />
            <p className="mt-3 text-center text-[12.5px] text-white/45">
              Três escolhas e você já cai na ficha técnica do equipamento indicado.
            </p>
          </div>
        </div>
      </CineSection>

      {/* ------------------------------------------------------- logos clientes */}
      <div className="border-b border-dm-line bg-white">
        <div className="dm-container pt-10">
          <p className="text-center text-[13px] uppercase tracking-[0.18em] text-dm-gray">
            Quem já produz com equipamentos Demakine
          </p>
        </div>
        <ClientsMarquee />
      </div>

      {/* ------------------------------------------------------------ categorias */}
      <Section>
        <SectionHead
          eyebrow="Linhas de produto"
          title="Equipamentos para transportar, elevar e embalar"
          text="21 equipamentos em linha, com dezenas de modelos e variações. Se o seu processo pede algo diferente, a gente projeta."
          action={<BtnGhost to="/produtos">Ver catálogo</BtnGhost>}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, idx) => {
            const Icon = categoryIcons[c.slug] ?? Cog;
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <Reveal key={c.slug} i={idx} className="h-full">
                <Link
                  href={`/produtos?cat=${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-dm-blue/35 hover:shadow-lg hover:shadow-dm-blue/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-[17px] font-bold text-dm-ink group-hover:text-dm-blue">
                    {c.name}
                  </h3>
                  <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-dm-gray">{c.desc}</p>
                  <span className="mt-4 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-dm-blue">
                    {count} equipamentos
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* -------------------------------------------------------- produtos top */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Mais procurados"
          title="Os equipamentos que mais saem da nossa fábrica"
          text="Modelos com tabela de especificações, capacidade e motorização definidas — e sempre ajustáveis ao seu layout."
          action={<BtnGhost to="/produtos">Todos os produtos</BtnGhost>}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, idx) => (
            <ProductCard key={p.slug} product={p} i={idx % 4} />
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- spotlight */}
      <CineSection>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <CineTag>Campeã de vendas</CineTag>
            <CineTitle className="mt-5" lines={["Esteira para", "sacaria e fardos"]} />
            <CineRule className="mt-5" />
            <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/70">
              {champion.summary}
            </p>
            <CineBullets className="mt-7" items={championBullets} />

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <CineStat value={`${champion.models.length}`} label="modelos de tabela" />
              <CineStat value="3 a 12 m" label="comprimento" />
              <CineStat value="0,75 a 5 cv" label="motorização" />
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BtnPrimary to={`/produtos/${champion.slug}`} className="cine-shine">
                Ver ficha técnica
              </BtnPrimary>
              <BtnGhost dark href={waLink(`Olá! Quero um orçamento da ${champion.name}.`)} external>
                Pedir orçamento
              </BtnGhost>
            </div>
          </div>

          <CineShot src={champion.images[0]} alt={champion.name} />
        </div>
      </CineSection>

      {/* --------------------------------------------------------- diferenciais */}
      <Section>
        <SectionHead
          eyebrow="Por que Demakine"
          title="Fabricante direto, engenharia própria e prazo cumprido"
          text="Somos uma fábrica, não uma revenda. Isso muda o preço, o prazo e a qualidade do suporte que você recebe depois da entrega."
        />
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {differentials.map(({ Icon, title, text }, idx) => (
            <Reveal key={title} i={idx % 3}>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[16.5px] font-bold text-dm-ink">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-dm-gray">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- projetos especiais */}
      <CineSection>
        <div>
          <CineTag>Projetos especiais</CineTag>
          <CineTitle className="mt-5" small lines={["Quando o catálogo", "não resolve,", "a gente projeta"]} />
          <CineRule className="mt-5" />
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-2xl text-[16.5px] leading-relaxed text-white/68">
              Esteiras em Z, moegas para big bag, inox sanitário, galvanizadas, com trilho, com
              contador de sacos. Mais de 20 configurações já entregues e documentadas.
            </p>
            <BtnGhost dark to="/projetos-especiais">Ver projetos</BtnGhost>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeProjects.map((p, idx) => (
              <Reveal key={p.slug} i={idx % 3}>
                <Link
                  href="/projetos-especiais"
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                >
                  <div className="aspect-[16/11] overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-[16px] font-bold text-white">{p.name}</h3>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-white/60">
                      {p.desc}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </CineSection>

      {/* ------------------------------------------------------------- segmentos */}
      <Section tone="surface">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Segmentos atendidos</p>
            <h2 className="h2 mt-3">Da lavoura ao centro de distribuição</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-dm-gray">
              Grãos, fertilizantes, alimentos, reciclagem, plásticos, papel e celulose, logística e
              construção. Cada segmento tem uma exigência diferente de correia, higienização e
              capacidade — e a gente conhece todas elas.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {segments.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-dm-line bg-white px-4 py-2 text-[13.5px] font-semibold text-dm-ink/80"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <BtnGhost to="/clientes">Conhecer nossos clientes</BtnGhost>
            </div>
          </Reveal>

          <Reveal i={1}>
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/img/site/fabrica.jpg"
                alt="Fábrica Demakine em Limeira/SP"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* -------------------------------------------------------------- processo */}
      <Section>
        <SectionHead
          eyebrow="Como fabricamos"
          title="Do primeiro contato à máquina rodando"
          text="Cinco etapas, um especialista acompanhando do começo ao fim e nada saindo da fábrica sem teste de funcionamento."
        />
        <div className="mt-10">
          <Timeline />
        </div>
      </Section>

      {/* ------------------------------------------------------------ comparador */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Duas configurações, dois resultados"
          title="Correia lisa ou taliscada? Arraste e veja a diferença"
          text="Duas esteiras inclinadas que fabricamos, lado a lado. É esse tipo de detalhe que definimos junto com você antes de cortar o primeiro perfil."
        />
        <div className="mt-10">
          <CompareSlider
            left={{
              image: "/img/projetos/esteira-inclinada-correia-lisa/1.jpg",
              label: "Correia lisa",
              caption: "Indicada para caixas, fardos e produtos embalados em inclinação suave. Superfície fácil de higienizar e menos desgaste na emenda.",
            }}
            right={{
              image: "/img/projetos/esteira-inclinada-correia-taliscada/1.jpg",
              label: "Correia taliscada",
              caption: "Para inclinação forte e material solto: as taliscas seguram a carga na subida e evitam retorno de grão, sacaria e resíduo.",
            }}
          />
        </div>
      </Section>

      {/* ----------------------------------------------------- mapa + ferramentas */}
      <CineSection>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <CineTag>Brasil inteiro</CineTag>
            <CineTitle className="mt-5" small lines={["Nossas máquinas", "estão rodando", "perto de você"]} />
            <CineRule className="mt-5" />
            <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/70">
              O mapa mostra os estados onde clientes já publicaram depoimento sobre a Demakine.
              Entregamos em todo o país, com logística acompanhada e assistência técnica própria.
            </p>
            <Link
              href="/assistencia-tecnica"
              className="mt-3 inline-block text-[13.5px] font-bold text-white/70 underline underline-offset-4 hover:text-white"
            >
              Como funciona nossa assistência técnica
            </Link>

            <div className="mt-8 space-y-3">
              {[
                { to: "/ferramentas#dimensionar", title: "Dimensionar minha esteira", text: "Material, distância e altura: recebemos o modelo indicado." },
                { to: "/ferramentas#retorno", title: "Calcular o retorno", text: "Compare o custo de movimentar na mão com a esteira." },
                { to: "/ferramentas#configurador", title: "Configurar visualmente", text: "Ajuste comprimento e inclinação e veja o desenho." },
              ].map((t, idx) => (
                <Reveal key={t.to} i={idx}>
                  <Link
                    href={t.to}
                    className="cine-shine flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-4 transition-colors hover:border-white/35"
                  >
                    <span>
                      <span className="block text-[15.5px] font-bold text-white">{t.title}</span>
                      <span className="mt-1 block text-[13.5px] text-white/60">{t.text}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-[#ff5a60]" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <BrazilMap />
        </div>
      </CineSection>

      {/* ---------------------------------------------------------- depoimentos */}
      <Section tone="surface">
        <SectionHead
          eyebrow="Depoimentos"
          title={`${testimonials.length} avaliações de quem já comprou`}
          text="Nota média 4,9. A maior parte dos nossos clientes chega por indicação de outro cliente."
          action={<BtnGhost to="/clientes">Ver todos</BtnGhost>}
        />
        <div className="mt-12">
          <TestimonialGrid limit={6} />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- blog */}
      <Section>
        <SectionHead
          eyebrow="Conteúdo técnico"
          title="Guias e artigos da nossa engenharia"
          action={<BtnGhost to="/blog">Ver blog</BtnGhost>}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {latestPosts.map((p, idx) => (
            <Reveal key={p.slug} i={idx} className="h-full">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-dm-blue/10"
              >
                <div className="aspect-[16/9] overflow-hidden bg-dm-surface">
                  <img
                    src={p.cover}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[12px] font-bold uppercase tracking-wide text-dm-blue">
                    {p.category}
                  </span>
                  <h3 className="mt-2 text-[17px] font-bold leading-snug text-dm-ink group-hover:text-dm-blue">
                    {p.title}
                  </h3>
                  <span className="mt-auto pt-4 text-[13px] text-dm-gray">{formatDate(p.date)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------------- contato */}
      <section className="relative overflow-hidden bg-dm-blue-deep py-16 md:py-24">
        <div className="absolute inset-0 grid-lines" />
        <div className="dm-container relative grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-white/45">Fale com a Demakine</p>
            <h2 className="h2 mt-3 text-white">
              Conte o que você precisa mover. A gente volta com a solução.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-white/65">
              Atendimento técnico de verdade: quem responde entende de correia, motorização e layout
              de linha. Resposta em até 1 dia útil.
            </p>

            <dl className="mt-9 space-y-5 text-white/70">
              <div>
                <dt className="eyebrow text-white/40">Telefone e WhatsApp</dt>
                <dd className="mt-1 text-[16px]">
                  <a href={site.phoneHref} className="hover:text-white">{site.phone}</a>
                  {" · "}
                  <a href={site.mobileHref} className="hover:text-white">{site.mobile}</a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-white/40">E-mail</dt>
                <dd className="mt-1 text-[16px]">
                  <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-white/40">Fábrica</dt>
                <dd className="mt-1 text-[16px]">{site.address}</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal i={1}>
            <LeadForm
              variant="dark"
              source="home"
              title="Solicitar orçamento"
              subtitle="Preencha os dados e um especialista entra em contato."
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
