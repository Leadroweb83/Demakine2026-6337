import Link from "next/link";
import Image, { getImageProps } from "next/image";
import { visibleArticles } from "@/content/articles";
import { HeroVideo } from "./hero-video";
import { MapBlock } from "./map-block";
import { approach, areas, featuredAreas, timeline, faqs, future, history, images, legacy, marquee, integrations, pillars, services, site, stats, team } from "@/content/site";
import { hasAddress, whatsappHref } from "@/lib/site";
import { Arrow, WhatsAppIcon } from "./icons";
import { Monogram } from "./logo";
import { LeadForm } from "./lead-form";

/** Fundo do hero: video (ou foto), recorte vertical no celular, parallax e brilho que segue o cursor. */
export function HeroMedia({ strong = false, video = true }: { strong?: boolean; video?: boolean }) {
  if (!images.hero) return null;
  const withVideo = video && Boolean(images.heroVideo);
  const common = { alt: "", sizes: "100vw", quality: 80, priority: true } as const;
  const { props: { srcSet: desktop, ...img } } = getImageProps({ ...common, src: withVideo ? images.heroPoster : images.hero, width: 1280, height: 720 });
  const { props: { srcSet: mobile } } = getImageProps({ ...common, src: withVideo ? images.heroPosterMobile : images.heroMobile || images.hero, width: 480, height: 854 });
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-[-8%]" data-parallax="0.12">
        <div className="absolute inset-0" {...(withVideo ? {} : { "data-kenburns": true })}>
          <picture>
            <source media="(max-width: 767px)" srcSet={mobile} />
            <source media="(min-width: 768px)" srcSet={desktop} />
            <img {...img} alt="" className="h-full w-full object-cover object-[68%_center] max-md:object-center" />
          </picture>
          {withVideo && <HeroVideo src={images.heroVideo} mobileSrc={images.heroVideoMobile} poster={images.heroPoster} />}
        </div>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-r from-ink to-ink/10 max-lg:via-ink/85 max-lg:to-ink/55 ${strong ? "via-ink/88" : "via-ink/75"}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/55" />
      <div className="absolute inset-0" data-spotlight />
    </div>
  );
}

/** Tres imagens em faixa: deslizam de lado e cada uma se move em um ritmo. */
export function ImageStrip() {
  if (images.strip.length === 0) return null;
  const alts = ["Livros de Direito sobre a mesa do escritório", "Estátua da Justiça com a balança", "Cadeira e janela do escritório ao entardecer"];
  return (
    <section className="overflow-hidden bg-ink py-16 lg:py-24" aria-label="Imagens do escritório">
      <div className="flex w-[150vw] gap-4 lg:w-[118vw] lg:gap-8" data-strip>
        {images.strip.map((src, i) => (
          <div key={src} className={`relative aspect-[3/4] flex-1 overflow-hidden ${i === 1 ? "lg:mt-16" : ""}`}>
            <div className="absolute inset-x-0 bottom-[-14%] top-[-14%]" data-parallax={[0.12, 0.26, 0.18][i % 3]}>
              <Image src={src} alt={alts[i] ?? ""} fill sizes="(min-width: 1024px) 38vw, 50vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <section className="hero-light relative isolate overflow-hidden">
      {images.hero ? (
        <HeroMedia />
      ) : (
        <div className="pointer-events-none absolute inset-y-0 right-[-12%] -z-10 flex items-center lg:right-[-2%]" aria-hidden="true">
          <div data-parallax="0.3">
            <Monogram className="h-[78vh] w-[78vh] max-w-none text-copper/[0.09]" />
          </div>
        </div>
      )}
      {/* Camadas em velocidades diferentes: luz ao fundo sobe, monograma desce, texto segue o scroll */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div data-parallax="-0.35" className="absolute right-[-10%] top-[-20%] h-[90vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgb(232_200_160/0.16),transparent)]" />
        <div data-parallax="0.5" className="absolute bottom-[-30%] left-[-15%] h-[70vh] w-[55vw] rounded-full bg-[radial-gradient(closest-side,rgb(143_107_71/0.14),transparent)]" />
      </div>
      <div className="wrap flex min-h-[100svh] flex-col justify-end pb-10 pt-36">
        <p className="eyebrow" data-reveal>Limeira, SP · Desde 1996</p>
        <h1 className="display mt-6 max-w-[15ch] text-[clamp(2.9rem,8.2vw,7.25rem)]" data-split>
          Seu patrimônio, seus negócios e seus planos <em className="not-italic text-copper-hi">em boas mãos.</em>
        </h1>
        <span className="rule mt-10" data-draw />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-xl text-lg text-bone/80" data-reveal>
            Orientação jurídica rigorosa, atendimento próximo e estratégia alinhada à realidade de
            cada cliente, para pessoas, famílias e empresas.
          </p>
          <div className="flex flex-wrap gap-4" data-reveal>
            <a href={whatsappHref()} className="btn btn-primary" data-magnetic data-event="whatsapp_hero">
              <WhatsAppIcon /> Fale com nossa equipe
            </a>
            <Link href="/#areas" className="btn btn-ghost" data-magnetic>
              Áreas de atuação <Arrow />
            </Link>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t hairline pt-6" data-reveal>
          <nav aria-label="Atalhos para as áreas" className="flex flex-wrap gap-x-8 gap-y-3">
            {featuredAreas.map((a) => (
              <Link key={a.slug} href={`/areas/${a.slug}`} className="group flex items-center gap-2 text-sm text-bone/85 hover:text-copper-hi">
                {a.title} <Arrow className="h-3.5 w-3.5 text-copper transition-transform duration-500 group-hover:translate-x-1.5" />
              </Link>
            ))}
          </nav>
          <Link href="/#areas" className="text-xs uppercase tracking-[0.3em] text-mist hover:text-copper-hi max-md:hidden">
            Role para baixo <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Faixa com as palavras da marca: anda sozinha e acelera com o scroll. */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {marquee.map((w, i) => (
        <li key={w} className="flex items-center">
          <span className={`display px-8 text-[clamp(3rem,8vw,7rem)] uppercase ${i % 2 ? "outline-text" : "text-ink"}`}>{w}</span>
          <Monogram className="h-8 w-8 text-copper lg:h-12 lg:w-12" />
        </li>
      ))}
    </ul>
  );
  return (
    <div data-marquee className="overflow-hidden border-y hairline bg-paper text-ink py-8 lg:py-12">
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}

/** Duas portas de entrada: cada publico com a sua linguagem e o seu contato. */
export function Doors() {
  const doors = [
    {
      eyebrow: "Para pessoas e famílias",
      title: "Decisões pessoais pedem atenção a quem está envolvido.",
      text: "Questões familiares, proteção patrimonial e contratos demandam uma compreensão que vai além do processo: as relações envolvidas, os seus objetivos e os efeitos de cada medida.",
      cta: "Falar sobre um assunto pessoal",
      msg: "Olá! Vim pelo site e gostaria de orientação sobre um assunto pessoal ou familiar.",
      event: "whatsapp_door_pessoas",
    },
    {
      eyebrow: "Para empresas",
      title: "Orientação jurídica que cabe na gestão do negócio.",
      text: "A análise considera a operação da empresa, seus compromissos comerciais e os efeitos econômicos das decisões, para que cada recomendação possa ser compreendida e aplicada.",
      cta: "Falar sobre a minha empresa",
      more: "/para-empresas",
      msg: "Olá! Vim pelo site e gostaria de orientação jurídica para a minha empresa.",
      event: "whatsapp_door_empresas",
    },
  ];
  return (
    <section className="bg-paper text-ink">
      <div className="wrap grid lg:grid-cols-2">
        {doors.map((d, i) => (
          <article key={d.eyebrow} className={`group py-16 lg:py-24 ${i ? "border-t border-ink/15 lg:border-l lg:border-t-0 lg:pl-16" : "lg:pr-16"}`} data-reveal>
            <p className="eyebrow !text-copper-lo">{d.eyebrow}</p>
            <h2 className="display mt-5 max-w-[16ch] text-[clamp(2rem,3.6vw,3.2rem)]">{d.title}</h2>
            <p className="mt-6 max-w-md text-ink/70">{d.text}</p>
            <a href={whatsappHref(d.msg)} data-event={d.event} className="mt-8 inline-flex items-center gap-3 border-b border-copper-lo pb-1 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:text-copper-lo">
              {d.cta} <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
            </a>
            {"more" in d && d.more && <Link href={d.more} className="ml-8 text-sm text-ink/60 underline underline-offset-4 hover:text-ink">Como funciona a assessoria</Link>}
          </article>
        ))}
      </div>
    </section>
  );
}

export function Articles() {
  const list = visibleArticles().slice(0, 3);
  if (list.length === 0) return null;
  return (
    <section id="artigos" className="bg-bone py-24 text-ink lg:py-36">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow !text-copper-lo" data-reveal>Artigos</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]" data-split>Para decidir com informação.</h2>
          </div>
          <Link href="/artigos" className="btn border border-ink/25 text-ink hover:border-ink" data-reveal>Todos os artigos <Arrow /></Link>
        </div>
        <ul className="mt-14 grid gap-px border-t border-ink/15 lg:grid-cols-3">
          {list.map((ar) => (
            <li key={ar.slug} data-reveal>
              <Link href={`/artigos/${ar.slug}`} className="group flex h-full flex-col justify-between gap-10 border-b border-ink/15 py-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0">
                <div>
                  {ar.cover && <div className="relative mb-6 aspect-[16/10] overflow-hidden"><Image src={ar.cover} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" /></div>}
                  <p className="text-xs uppercase tracking-[0.22em] text-copper-lo">{ar.area}{ar.draft ? " · Rascunho" : ""}</p>
                  <h3 className="mt-4 font-display text-[1.75rem] leading-tight group-hover:text-copper-lo">{ar.title}</h3>
                  <p className="mt-4 text-ink/70">{ar.excerpt}</p>
                </div>
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">Ler artigo <Arrow className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-2" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Areas() {
  return (
    <section id="areas" className="bg-paper text-ink py-24 lg:py-36">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow !text-copper-lo" data-reveal>Áreas de atuação</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,4.75rem)]" data-split>
              Proteger interesses, orientar decisões e <span className="text-copper-lo">conduzir conflitos.</span>
            </h2>
          </div>
          <p className="max-w-lg text-ink/70 lg:justify-self-end" data-reveal>
            A Marchi Gomes atende pessoas, famílias e empresas nas frentes consultiva, preventiva e
            contenciosa. Estas são as questões em que o escritório concentra sua experiência.
          </p>
        </div>

        <ol className="mt-16 border-t hairline">
          {featuredAreas.map((a, i) => (
            <li key={a.slug} className="border-b hairline" data-reveal>
              <Link
                href={`/areas/${a.slug}`}
                data-cursor-label="Ver área"
                data-preview-index={i}
                className="group grid gap-x-10 gap-y-4 py-9 transition-colors duration-500 hover:bg-bone lg:grid-cols-[5rem_1fr_1.2fr_auto] lg:items-baseline lg:px-6 lg:py-12"
              >
                <span className="font-display text-xl text-copper-lo">0{i + 1}</span>
                <h3 className="display text-[clamp(2rem,4.4vw,3.6rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3 group-hover:text-copper-lo">
                  {a.name}
                </h3>
                <div>
                  <p className="text-ink/85">{a.summary}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center self-center rounded-full border border-copper-lo/50 text-copper-lo transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-bone max-lg:hidden">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {/* Painel que acompanha o cursor sobre as linhas (so em desktop com mouse) */}
        <div data-preview aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-40 hidden h-[16rem] w-[12rem] overflow-hidden bg-navy shadow-2xl shadow-ink/40">
          {featuredAreas.map((a, i) => (
            <div key={a.slug} data-preview-item className="absolute inset-0">
              {a.image ? (
                <Image src={a.image} alt="" fill sizes="272px" className="object-cover" />
              ) : (
                <div className="hero-light flex h-full flex-col justify-between p-5">
                  <span className="font-display text-5xl leading-none text-copper/40">0{i + 1}</span>
                  <Monogram className="h-12 w-12 self-end text-copper" />
                  <span className="font-display text-xl leading-tight text-bone">{a.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[5rem_1fr] lg:px-6" data-reveal>
          <p className="eyebrow !text-copper-lo lg:col-span-2">Todas as áreas de atuação</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-3 lg:col-span-2">
            {areas.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`} className="block rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/75 transition-colors hover:border-ink hover:bg-ink hover:text-bone">{a.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Services({ heading = "O que o escritório faz por você." }: { heading?: string }) {
  return (
    <section id="servicos" className="bg-bone py-24 text-ink lg:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow !text-copper-lo" data-reveal>Serviços</p>
          <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]" data-split>{heading}</h2>
          <p className="mt-6 max-w-md text-ink/70" data-reveal>
            Da orientação pontual à representação em juízo, com a mesma exigência técnica em cada etapa.
          </p>
        </div>
        <ol className="border-t border-ink/15">
          {services.map((sv, i) => (
            <li key={sv.title} className="grid gap-x-8 gap-y-2 border-b border-ink/15 py-8 sm:grid-cols-[3rem_1fr]" data-reveal>
              <span className="font-display text-lg text-copper-lo">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight">{sv.title}</h3>
                <p className="mt-3 max-w-xl text-ink/70">{sv.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Selo da marca: gira devagar e pode ser arrastado; ao soltar, volta com mola. */
function Seal() {
  return (
    <div data-drag className="absolute -right-4 -top-10 z-10 h-32 w-32 overflow-hidden touch-none select-none rounded-full bg-ink text-copper-hi shadow-xl shadow-ink/30 lg:-right-14 lg:h-40 lg:w-40" aria-hidden="true">
      <svg data-drag-spin viewBox="0 0 100 100" className="h-full w-full">
        <defs><path id="seal-path" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
        <text fill="currentColor" fontSize="6.2" style={{ textTransform: "uppercase" }}>
          <textPath href="#seal-path" textLength="226" lengthAdjust="spacing">{site.tagline.replace(".", "")} ·</textPath>
        </text>
      </svg>
      <Monogram className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-copper" />
    </div>
  );
}

export function Firm() {
  return (
    <section id="escritorio" className="bg-bone py-24 text-ink lg:py-36">
      <div className="wrap grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="relative">
          <Seal />
        <div className="relative aspect-[4/5] overflow-hidden bg-navy" data-clip>
          {/* Slot de foto real do escritorio/socios. Ate chegar, fica o monograma. */}
          {images.firm ? (
            <div className="absolute inset-x-0 bottom-[-30%] top-[-4%]" data-parallax="-0.3">
              <Image src={images.firm} alt="Estátua da Justiça, de olhos vendados, segurando a balança" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
            </div>
          ) : (
            <>
              <div className="absolute inset-[-12%] hero-light" data-parallax="0.16" />
              <Monogram className="absolute left-1/2 top-1/2 h-2/5 w-2/5 -translate-x-1/2 -translate-y-1/2 text-copper" />
            </>
          )}
        </div>
        </div>
        <div className="self-center">
          <p className="eyebrow !text-copper-lo" data-reveal>O escritório</p>
          <h2 className="display mt-5 text-[clamp(2rem,3.6vw,3.2rem)]" data-split>
            {history.title}
          </h2>
          <span className="rule mt-8 !bg-copper-lo" data-draw />
          <p className="mt-8 max-w-xl text-lg text-ink/80" data-reveal>{history.paragraphs[0]}</p>
          <Link href="/escritorio" className="btn mt-10 bg-ink text-bone hover:bg-navy-2" data-reveal data-magnetic>
            Conheça a nossa história <Arrow />
          </Link>
        </div>
      </div>
      {stats.length > 0 && (
        <dl className="wrap mt-20 grid gap-y-10 border-t border-ink/15 pt-12 sm:grid-cols-3">
          {stats.map((st) => (
            <div key={st.label} data-reveal>
              <dd className="display text-[clamp(3.4rem,7vw,6.5rem)] text-copper-lo">
                <span data-count={st.value}>{st.value.toLocaleString("pt-BR")}</span>{st.suffix}
              </dd>
              <dt className="mt-1 max-w-[18rem] text-xs uppercase tracking-[0.22em] text-ink/60">{st.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export function Pillars() {
  return (
    <section className="bg-bone text-ink">
      <ul className="wrap grid grid-cols-2 border-t border-ink/15 lg:grid-cols-4">
        {pillars.map((p, i) => (
          <li key={p.title} className={`py-7 ${i % 2 ? "max-lg:pl-5" : ""} ${i ? "lg:border-l lg:border-ink/15 lg:pl-8" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-ink/15" : ""}`} data-reveal>
            <p className="font-display text-2xl uppercase tracking-[0.12em] text-copper-lo">{p.title}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/60">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Homenagem ao Dr. Joao Jair Marchi. */
export function Legacy() {
  return (
    <section id="legado" className="bg-navy py-24 lg:py-36">
      <div className={`wrap grid gap-14 lg:gap-24 ${legacy.photo ? "lg:grid-cols-[0.8fr_1.2fr]" : "lg:grid-cols-[0.5fr_1.5fr]"}`}>
        <div>
          {legacy.photo ? (
            <div className="relative aspect-[4/5] overflow-hidden" data-clip>
              <div className="absolute inset-[-10%]" data-parallax="0.14">
                <Image src={legacy.photo} alt={legacy.name} fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" />
              </div>
            </div>
          ) : (
            <p className="eyebrow" data-reveal>O legado</p>
          )}
        </div>
        <div>
          {legacy.photo && <p className="eyebrow" data-reveal>O legado</p>}
          <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5.5rem)] text-copper-hi" data-split>{legacy.name}</h2>
          <span className="rule mt-8" data-draw />
          {legacy.paragraphs.map((t) => (
            <p key={t} className="mt-7 max-w-2xl text-lg text-bone/80" data-reveal>{t}</p>
          ))}
          {legacy.testimonial.quote && (
            <figure className="mt-12 border-l border-copper pl-8" data-reveal>
              <blockquote className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-snug text-bone">“{legacy.testimonial.quote}”</blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-[0.22em] text-copper">{legacy.testimonial.author}{legacy.testimonial.role ? ` · ${legacy.testimonial.role}` : ""}</figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}

export function Timeline() {
  return (
    <section data-hscroll className="bg-ink">
      <div data-hscroll-view className="py-24">
        <div className="wrap">
          <p className="eyebrow">Linha do tempo</p>
          <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]">De uma tradição a um escritório.</h2>
        </div>
        <ol data-hscroll-track className="wrap mt-14 flex flex-col lg:!max-w-none">
          {timeline.map((t) => (
            <li key={t.title} className="shrink-0 border-t hairline py-9">
              <p className="display text-[clamp(3rem,6vw,5.5rem)] leading-none text-copper-hi">{t.when}</p>
              <h3 className="mt-6 font-display text-[1.75rem] leading-tight">{t.title}</h3>
              <p className="mt-4 max-w-md text-bone/75">{t.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Future({ full = false }: { full?: boolean }) {
  return (
    <section id="futuro" className="hero-light py-28 lg:py-44">
      <div className="wrap">
        <p className="eyebrow" data-reveal>O futuro</p>
        <p className="display mt-8 max-w-[22ch] text-[clamp(2.2rem,5.4vw,5rem)] text-copper-hi" data-fill>
          {future.statement}
        </p>
        {full && (
          <div className="mt-20 grid gap-10 border-t hairline pt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <h2 className="display text-[clamp(1.9rem,3.2vw,2.8rem)]" data-split>{future.title}</h2>
            <div className="space-y-6">
              {future.paragraphs.map((t) => (
                <p key={t} className="max-w-2xl text-bone/80" data-reveal>{t}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Equipe: so aparece quando houver advogados reais cadastrados em content/site.ts. */
export function Team() {
  if (team.length === 0) return null;
  return (
    <section id="equipe" className="bg-ink py-24 lg:py-36">
      <div className="wrap">
        <p className="eyebrow" data-reveal>Os sócios</p>
        <h2 className="display mt-5 max-w-[14ch] text-[clamp(2.4rem,5vw,4.4rem)]" data-split>
          Quem responde pelo seu caso.
        </h2>
        <ul className={`team-row mt-14 flex flex-col gap-4 min-[900px]:flex-row ${team.some((m) => m.photo) ? "min-[900px]:h-[30rem]" : "min-[900px]:h-56"}`}>
          {team.map((m) => (
            <li key={m.name} className={`team-card relative overflow-hidden bg-navy-2 ${m.photo ? "max-[899px]:h-80" : "max-[899px]:h-40"}`} tabIndex={0}>
              {!m.photo && <Monogram className="absolute right-6 top-6 h-12 w-12 text-copper/50" />}
              {m.photo && <Image src={m.photo} alt={m.name} fill sizes="(min-width: 900px) 50vw, 100vw" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="display whitespace-nowrap text-3xl">{m.name}</h3>
                <p className="mt-1 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-copper">{m.role}{m.oab ? ` · ${m.oab}` : ""}</p>
                {m.bio && <p className="team-bio mt-4 max-w-md text-sm text-bone/80 min-[900px]:w-[26rem]">{m.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Approach() {
  return (
    <section id="como-atuamos" data-story className="relative bg-navy">
      <div data-story-sticky className="py-24 lg:py-0">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow">Como atuamos</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]">
              Do contexto à <span className="text-copper-hi">decisão.</span>
            </h2>
            <p className="mt-6 max-w-md text-bone/75">
              O cliente precisa compreender as recomendações recebidas e dispor de informações para decidir.
            </p>
            <div data-story-progress className="mt-12 flex items-center gap-5">
              <div className="flex gap-4 font-display text-2xl text-copper-hi">
                {approach.map((_, i) => <span key={i} data-story-num>0{i + 1}</span>)}
              </div>
              <span className="h-px flex-1 bg-copper/20">
                <span data-story-bar className="block h-px origin-left bg-copper-hi" />
              </span>
            </div>
          </div>
          <ol data-story-steps className="self-center">
            {approach.map((s, i) => (
              <li key={s.title} data-story-step className="border-t hairline py-8 first:border-t-0 first:pt-0">
                <span aria-hidden="true" className="font-display text-[clamp(4rem,9vw,8rem)] leading-none text-copper/25">0{i + 1}</span>
                <h3 className="display mt-2 text-[clamp(1.9rem,3.4vw,3rem)]">{s.title}</h3>
                <p className="mt-4 max-w-lg text-lg text-bone/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Faq({ items = faqs, heading = "Antes de falar com a gente." }: { items?: { q: string; a: string }[]; heading?: string }) {
  return (
    <section id="duvidas" className="bg-paper text-ink py-24 lg:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <p className="eyebrow !text-copper-lo" data-reveal>Dúvidas frequentes</p>
          <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]" data-split>
            {heading}
          </h2>
        </div>
        <div className="border-t hairline">
          {items.map((f) => (
            <details key={f.q} className="group border-b hairline" data-reveal>
              <summary className="flex items-center justify-between gap-6 py-6">
                <h3 className="font-display text-2xl leading-snug lg:text-[1.75rem]">{f.q}</h3>
                <span className="faq-plus text-2xl font-light text-copper-lo transition-transform duration-300" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-7 text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ defaultArea }: { defaultArea?: string }) {
  const c = site.contact;
  return (
    <section id="contato" className="hero-light border-t hairline py-24 lg:py-36">
      <div className="wrap grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <p className="eyebrow" data-reveal>Contato</p>
          <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5.25rem)]" data-split>
            Ao seu lado em cada <span className="text-copper-hi">decisão importante.</span>
          </h2>
          <p className="mt-6 max-w-md text-bone/75" data-reveal>
            Conte o que você precisa. O contato é sigiloso e a nossa equipe responde em horário comercial.
          </p>
          <a href={whatsappHref()} className="btn btn-primary mt-9" data-reveal data-magnetic data-event="whatsapp_contact">
            <WhatsAppIcon /> Falar pelo WhatsApp
          </a>
          {integrations.schedulingUrl && (
            <a href={integrations.schedulingUrl} target="_blank" rel="noopener" className="btn btn-ghost ml-0 mt-4 sm:ml-4" data-reveal data-event="agendar_horario">
              Ver horários disponíveis <Arrow />
            </a>
          )}
          {(c.phone || c.email || hasAddress) && (
            <address className="mt-12 space-y-2 not-italic text-bone/75" data-reveal>
              {c.phone && <p><a href={`tel:${c.phone.replace(/\D/g, "")}`} className="hover:text-copper-hi">{c.phone}</a></p>}
              {c.email && <p><a href={`mailto:${c.email}`} className="hover:text-copper-hi">{c.email}</a></p>}
              {hasAddress && <p>{c.street}<br />{c.city} - {c.state}{c.zip ? `, ${c.zip}` : ""}</p>}
              {c.hours && <p>{c.hours}</p>}
            </address>
          )}
        </div>
        <div className="self-center" data-reveal>
          <LeadForm defaultArea={defaultArea} />
        </div>
      </div>
      <div className="wrap"><MapBlock /></div>
    </section>
  );
}
