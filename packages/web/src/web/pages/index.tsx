import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Clock,
  Clock3,
  Cog,
  Factory,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Ruler,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { Seo, organizationJsonLd, websiteJsonLd } from "@/components/seo";
import {
  CineRule,
  CineSection,
  CineTag,
  CineTitle,
} from "@/components/cine";
import { HomeHero } from "@/components/hero";
import { ScrollText } from "@/components/scroll-text";
import { AgroBand } from "@/components/agro-band";
import { VideoSection } from "@/components/video-section";
import { BestSellers } from "@/components/best-sellers";
import { JobsCta } from "@/components/jobs-cta";
import { SegmentsCarousel } from "@/components/segments-carousel";
import { TestimonialsWall } from "@/components/testimonials";
import { Timeline } from "@/components/timeline";
import { BrazilMap } from "@/components/tools/brazil-map";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import {
  BtnGhost,
  ClientsMarquee,
  ProductCard,
  Section,
  SectionHead,
} from "@/components/kit";
import {
  categories,
  formatDate,
  posts,
  products,
  projects,
  testimonials,
} from "@/lib/content";
import { segments, site, waLink } from "@/lib/site";
import { PageSections, type Block } from "@/lib/page-layout";
import { LANGUAGE_ALTERNATES } from "@/lib/hreflang";

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

  // seções abaixo do topo: a ordem e o que aparece vêm do painel (Ordem das seções)
  const blocks: Record<string, Block> = {
    clientes: {
      render: () => (
        <div className="border-b border-dm-line bg-white">
          <div className="dm-container pt-10">
            <p className="text-center text-[13px] uppercase tracking-[0.18em] text-dm-gray">
              Quem já produz com equipamentos Demakine
            </p>
          </div>
          <ClientsMarquee />
        </div>
      ),
    },
    categorias: {
      render: (tone) => (
        <Section tone={tone}>
          <SectionHead
            eyebrow="Linhas de produto"
            title="Equipamentos para transportar, elevar e embalar"
            text={`${products.length} equipamentos em linha, com dezenas de modelos e variações. Se o seu processo pede algo diferente, a gente projeta.`}
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
      ),
    },
    video: { render: () => <VideoSection /> },
    "mais-procurados": {
      render: (tone) => (
        <Section tone={tone}>
          <SectionHead
            eyebrow="Mais procurados"
            title="Os equipamentos que mais saem da nossa fábrica"
            text="Modelos com tabela de especificações, capacidade e motorização definidas, e sempre ajustáveis ao seu layout."
            action={<BtnGhost to="/produtos">Todos os produtos</BtnGhost>}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, idx) => (
              <ProductCard key={p.slug} product={p} i={idx % 4} />
            ))}
          </div>
        </Section>
      ),
    },
    campeas: { render: () => <BestSellers /> },
    agro: { render: () => <AgroBand /> },
    diferenciais: {
      render: (tone) => (
        <Section tone={tone}>
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
      ),
    },
    projetos: {
      render: () => (
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
      ),
    },
    segmentos: {
      render: (tone) => (
        <Section tone={tone}>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <Reveal>
              <p className="eyebrow text-dm-blue">Segmentos atendidos</p>
              <h2 className="h2 mt-3">Da lavoura ao centro de distribuição</h2>
              <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-dm-gray">
                Cada segmento tem uma exigência diferente de correia, higienização, inclinação e
                capacidade. Escolha o seu e veja o equipamento que a nossa engenharia indica.
              </p>
            </Reveal>

            <Reveal i={1} className="min-w-0">
              <div className="grid grid-cols-2 items-end gap-x-6 gap-y-5 border-t border-dm-line pt-6 lg:flex lg:justify-end lg:gap-10">
                <div>
                  <p className="font-display text-[2.1rem] font-extrabold leading-none text-dm-blue">
                    {segments.length}
                  </p>
                  <p className="mt-1.5 text-[12.5px] uppercase tracking-[0.14em] text-dm-gray">
                    segmentos atendidos
                  </p>
                </div>
                <div>
                  <p className="font-display text-[2.1rem] font-extrabold leading-none text-dm-blue">
                    21
                  </p>
                  <p className="mt-1.5 text-[12.5px] uppercase tracking-[0.14em] text-dm-gray">
                    linhas de equipamento
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-10">
            <SegmentsCarousel />
          </div>
        </Section>
      ),
    },
    frase: { render: () => <ScrollText /> },
    processo: {
      render: (tone) => (
        <Section tone={tone}>
          <SectionHead
            eyebrow="Como fabricamos"
            title="Do primeiro contato à máquina rodando"
            text="Cinco etapas, um especialista acompanhando do começo ao fim e nada saindo da fábrica sem teste de funcionamento."
          />
          <div className="mt-10">
            <Timeline />
          </div>
        </Section>
      ),
    },
    mapa: {
      render: () => (
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

              <div className="mt-8 space-y-3">
                {[
                  { to: "/ferramentas#dimensionar", title: "Dimensionar minha esteira", text: "Material, distância e altura: recebemos o modelo indicado." },
                  { to: "/ferramentas#retorno", title: "Calcular o retorno", text: "Compare o custo de movimentar na mão com a esteira." },
                  { to: "/ferramentas#configurador", title: "Configurar visualmente", text: "Ajuste comprimento e inclinação e veja o desenho." },
                ].map((t, idx) => (
                  <Reveal key={t.to} i={idx}>
                    <Link
                      href={t.to}
                      className="cine-shine group flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-4 transition-colors hover:border-dm-green/70"
                    >
                      <span>
                        <span className="block text-[15.5px] font-bold text-white">{t.title}</span>
                        <span className="mt-1 block text-[13.5px] text-white/60">{t.text}</span>
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dm-green text-white transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRight className="h-4.5 w-4.5" />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>

            <BrazilMap />
          </div>
        </CineSection>
      ),
    },
    depoimentos: {
      render: (tone) => (
        <Section tone={tone}>
          <SectionHead
            eyebrow="Depoimentos"
            title={`${testimonials.length} avaliações de quem já comprou`}
            text="Nota média 4,9. A maior parte dos nossos clientes chega por indicação de outro cliente."
            action={<BtnGhost to="/clientes">Ver todos</BtnGhost>}
          />
          <div className="mt-2">
            <TestimonialsWall />
          </div>
        </Section>
      ),
    },
    blog: {
      render: (tone) => (
        <Section tone={tone}>
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
          <div className="mt-12">
            <JobsCta />
          </div>
        </Section>
      ),
    },
    contato: {
      render: () => (
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

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <a
                  href={waLink("Olá! Vim pelo site da Demakine e quero um orçamento.")}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/[0.05] p-4 transition-colors hover:border-dm-green/70"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-green/18 text-[#4ade9a]">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      WhatsApp
                    </span>
                    <span className="mt-0.5 block text-[16px] font-bold text-white">{site.mobile}</span>
                  </span>
                </a>

                <a
                  href={site.phoneHref}
                  className="group flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/[0.05] p-4 transition-colors hover:border-white/35"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Telefone
                    </span>
                    <span className="mt-0.5 block text-[16px] font-bold text-white">{site.phone}</span>
                  </span>
                </a>

                <a
                  href={`mailto:${site.email}`}
                  className="group flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/[0.05] p-4 transition-colors hover:border-white/35 sm:col-span-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      E-mail
                    </span>
                    <span className="mt-0.5 block truncate text-[16px] font-bold text-white">
                      {site.email}
                    </span>
                  </span>
                </a>
              </div>

              {/* fábrica + mapa */}
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05]">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Fábrica
                      </span>
                      <span className="mt-0.5 block text-[15.5px] font-semibold leading-snug text-white">
                        {site.address}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[13px] text-white/55">
                        <Clock className="h-3.5 w-3.5" />
                        {site.hoursLine}
                      </span>
                    </span>
                  </div>
                  <a
                    href={site.mapsDirections}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-dm-green px-5 py-3 text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
                  >
                    <Navigation className="h-4 w-4" />
                    Me leve até lá!
                  </a>
                </div>
                <iframe
                  src={site.mapsEmbed}
                  title="Mapa da fábrica Demakine em Limeira/SP"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[210px] w-full border-0 grayscale-[0.35] contrast-[1.05]"
                />
              </div>
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
      ),
    },
  };

  return (
    <>
      <Seo
        title="Demakine | Esteiras Transportadoras, Roscas e Elevadores"
        description="Fábrica de esteiras transportadoras, roscas, elevadores e máquinas de costurar sacos sob medida. Mais de 15 anos e 7.000 máquinas entregues. Limeira/SP."
        path="/"
        jsonLd={[organizationJsonLd, websiteJsonLd]}
        alternates={LANGUAGE_ALTERNATES}
        preloadImage="/img/site/hero.webp"
      />

      <HomeHero />

      <PageSections page="home" blocks={blocks} />
    </>
  );
}
