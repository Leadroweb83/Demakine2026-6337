import Link from "next/link";
import Image from "next/image";
import { approach, areas, faqs, images, marquee, pillars, site, stats, team } from "@/content/site";
import { hasAddress, whatsappHref } from "@/lib/site";
import { Arrow, WhatsAppIcon } from "./icons";
import { Monogram } from "./logo";
import { LeadForm } from "./lead-form";

export function Hero() {
  return (
    <section className="hero-light relative isolate overflow-hidden">
      {images.hero ? (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-[-8%]" data-parallax="0.12">
            <Image src={images.hero} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        </div>
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
        <p className="eyebrow" data-reveal>Advocacia para pessoas e empresas</p>
        <h1 className="display mt-6 max-w-[15ch] text-[clamp(2.9rem,8.2vw,7.25rem)]" data-split>
          Seu patrimônio, seus negócios e seus planos <em className="not-italic text-copper-hi">em boas mãos.</em>
        </h1>
        <span className="rule mt-10" data-draw />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-xl text-lg text-bone/80" data-reveal>
            Assessoria jurídica estratégica nas áreas empresarial, civil, tributária e trabalhista,
            com foco em segurança e tranquilidade para decidir.
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
            {areas.map((a) => (
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

export function Areas() {
  return (
    <section id="areas" className="bg-paper text-ink py-24 lg:py-36">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow !text-copper-lo" data-reveal>Áreas de atuação</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,4.75rem)]" data-split>
              Mais que advocacia, soluções para o seu <span className="text-copper-lo">amanhã.</span>
            </h2>
          </div>
          <p className="max-w-lg text-ink/70 lg:justify-self-end" data-reveal>
            Experiência, estratégia e compromisso para proteger o que importa e impulsionar novos caminhos.
          </p>
        </div>

        <ol className="mt-16 border-t hairline">
          {areas.map((a, i) => (
            <li key={a.slug} className="border-b hairline" data-reveal>
              <Link
                href={`/areas/${a.slug}`}
                data-cursor-label="Ver área"
                className="group grid gap-x-10 gap-y-4 py-9 transition-colors duration-500 hover:bg-bone lg:grid-cols-[5rem_1fr_1.2fr_auto] lg:items-baseline lg:px-6 lg:py-12"
              >
                <span className="font-display text-xl text-copper-lo">0{i + 1}</span>
                <h3 className="display text-[clamp(2rem,4.4vw,3.6rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3 group-hover:text-copper-lo">
                  {a.name}
                </h3>
                <div>
                  <p className="text-ink/85">{a.summary}</p>
                  <p className="mt-3 text-sm text-ink/55">{a.topics.join(" · ")}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center self-center rounded-full border border-copper-lo/50 text-copper-lo transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-bone max-lg:hidden">
                  <Arrow />
                </span>
              </Link>
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
        <div className="relative aspect-[4/5] overflow-hidden bg-navy">
          {/* Slot de foto real do escritorio/socios. Ate chegar, fica o monograma. */}
          {images.firm ? (
            <div className="absolute inset-[-10%]" data-parallax="0.14">
              <Image src={images.firm} alt={`Escritório ${site.name}`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
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
          <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]" data-split>
            Tradição, ética e excelência jurídica.
          </h2>
          <span className="rule mt-8 !bg-copper-lo" data-draw />
          <p className="mt-8 max-w-xl text-lg text-ink/80" data-reveal>
            Experiência, estratégia e compromisso com soluções que geram impacto real para pessoas,
            negócios e o futuro.
          </p>
          <p className="mt-5 max-w-xl text-ink/70" data-reveal>
            A marca mudou, a essência é a mesma: uma advocacia próxima, que explica o cenário com
            franqueza e conduz cada caso com critério técnico.
          </p>
          <a href={whatsappHref()} className="btn mt-10 bg-ink text-bone hover:bg-navy-2" data-reveal data-magnetic data-event="whatsapp_firm">
            <WhatsAppIcon /> Conversar com a equipe
          </a>
        </div>
      </div>
      {stats.length > 0 && (
        <dl className="wrap mt-20 grid grid-cols-2 gap-y-10 border-t border-ink/15 pt-12 lg:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} data-reveal>
              <dd className="display text-[clamp(3rem,6vw,5.5rem)]">
                <span data-count={st.value}>{st.value.toLocaleString("pt-BR")}</span>{st.suffix}
              </dd>
              <dt className="mt-1 text-xs uppercase tracking-[0.22em] text-ink/60">{st.label}</dt>
            </div>
          ))}
        </dl>
      )}
      <ul className="wrap mt-20 grid grid-cols-2 border-t border-ink/15 lg:grid-cols-4">
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

/** Equipe: so aparece quando houver advogados reais cadastrados em content/site.ts. */
export function Team() {
  if (team.length === 0) return null;
  return (
    <section id="equipe" className="bg-ink py-24 lg:py-36">
      <div className="wrap">
        <p className="eyebrow" data-reveal>Quem conduz o seu caso</p>
        <h2 className="display mt-5 max-w-[14ch] text-[clamp(2.4rem,5vw,4.4rem)]" data-split>
          Os advogados por trás de cada decisão.
        </h2>
        <ul className="team-row mt-14 flex flex-col gap-4 min-[900px]:h-[34rem] min-[900px]:flex-row">
          {team.map((m) => (
            <li key={m.name} className="team-card relative overflow-hidden bg-navy max-[899px]:h-80" tabIndex={0}>
              {m.photo && <Image src={m.photo} alt={m.name} fill sizes="(min-width: 900px) 50vw, 100vw" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="display whitespace-nowrap text-3xl">{m.name}</h3>
                <p className="mt-1 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-copper">{m.role} · {m.oab}</p>
                <p className="team-bio mt-4 max-w-md text-sm text-bone/80 min-[900px]:w-[26rem]">{m.bio}</p>
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
              Sua causa <span className="text-copper-hi">em boas mãos.</span>
            </h2>
            <p className="mt-6 max-w-md text-bone/75">
              Um atendimento pensado para que você saiba, em cada etapa, onde está e para onde vai.
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
                <span className="font-display text-[clamp(4rem,9vw,8rem)] leading-none text-copper/25">0{i + 1}</span>
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

export function Faq() {
  return (
    <section id="duvidas" className="bg-paper text-ink py-24 lg:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <p className="eyebrow !text-copper-lo" data-reveal>Dúvidas frequentes</p>
          <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)]" data-split>
            Antes de falar com a gente.
          </h2>
        </div>
        <div className="border-t hairline">
          {faqs.map((f) => (
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
          {(c.phone || c.email || hasAddress) && (
            <address className="mt-12 space-y-2 not-italic text-bone/75" data-reveal>
              {c.phone && <p><a href={`tel:${c.phone.replace(/\D/g, "")}`} className="hover:text-copper-hi">{c.phone}</a></p>}
              {c.email && <p><a href={`mailto:${c.email}`} className="hover:text-copper-hi">{c.email}</a></p>}
              {hasAddress && <p>{c.street}, {c.city}{c.state ? ` / ${c.state}` : ""}</p>}
              {c.hours && <p>{c.hours}</p>}
            </address>
          )}
        </div>
        <div className="self-center" data-reveal>
          <LeadForm defaultArea={defaultArea} />
        </div>
      </div>
    </section>
  );
}
