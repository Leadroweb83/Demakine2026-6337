import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dict, locales, type Locale } from "@/content/i18n";
import { maps, site } from "@/content/site";
import { whatsappHref } from "@/lib/site";
import { Arrow, WhatsAppIcon } from "@/components/icons";
import { Monogram } from "@/components/logo";
import { LeadForm } from "@/components/lead-form";
import { MapBlock } from "@/components/map-block";

type Props = { params: Promise<{ lang: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

const languages = { "pt-BR": "/", en: "/en", es: "/es", "es-PY": "/es", "x-default": "/" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = dict[lang as Locale];
  if (!t) return {};
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: { canonical: `/${lang}`, languages },
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: `/${lang}`, locale: lang === "en" ? "en_US" : "es_PY" },
  };
}

export default async function IntlHome({ params }: Props) {
  const { lang } = await params;
  const t = dict[lang as Locale];
  if (!t) notFound();
  const wa = whatsappHref(t.contact.waMessage);
  return (
    <div lang={lang}>
      <section className="hero-light relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-[-12%] -z-10 flex items-center lg:right-[-2%]" aria-hidden="true">
          <div data-parallax="0.3"><Monogram className="h-[78vh] w-[78vh] max-w-none text-copper/[0.09]" /></div>
        </div>
        <div className="wrap flex min-h-[100svh] flex-col justify-end pb-16 pt-36">
          <p className="eyebrow" data-reveal>{t.hero.eyebrow}</p>
          <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.8rem,7.6vw,6.75rem)]" data-split>
            {t.hero.title} <em className="not-italic text-copper-hi">{t.hero.highlight}</em>
          </h1>
          <span className="rule mt-10" data-draw />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-xl text-lg text-bone/80" data-reveal>{t.hero.text}</p>
            <div className="flex flex-wrap gap-4" data-reveal>
              <a href={wa} className="btn btn-primary" data-magnetic data-event={`whatsapp_hero_${lang}`}><WhatsAppIcon /> {t.hero.cta}</a>
              <a href="#areas" className="btn btn-ghost" data-magnetic>{t.hero.secondary} <Arrow /></a>
            </div>
          </div>
        </div>
      </section>

      <section id="areas" className="bg-paper py-24 text-ink lg:py-36">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow !text-copper-lo" data-reveal>{t.areas.eyebrow}</p>
              <h2 className="display mt-5 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>{t.areas.title}</h2>
            </div>
            <p className="max-w-lg text-ink/70 lg:justify-self-end" data-reveal>{t.areas.text}</p>
          </div>
          <ol className="mt-16 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {t.areas.list.map((a, i) => (
              <li key={a} className="flex items-baseline gap-5 border-b border-ink/15 py-6 sm:pr-8" data-reveal>
                <span className="font-display text-sm text-copper-lo">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[1.6rem] leading-tight">{a}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="servicos" className="bg-bone py-24 text-ink lg:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow !text-copper-lo" data-reveal>{t.services.eyebrow}</p>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>{t.services.title}</h2>
          </div>
          <ol className="border-t border-ink/15">
            {t.services.items.map((sv, i) => (
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

      <section className="bg-navy py-24 lg:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow" data-reveal>{t.approach.eyebrow}</p>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>{t.approach.title}</h2>
          </div>
          <ol>
            {t.approach.items.map((st, i) => (
              <li key={st.title} className="border-t hairline py-8 first:border-t-0 first:pt-0" data-reveal>
                <span className="font-display text-6xl leading-none text-copper/30">0{i + 1}</span>
                <h3 className="display mt-2 text-[clamp(1.8rem,3vw,2.6rem)]">{st.title}</h3>
                <p className="mt-3 max-w-lg text-lg text-bone/75">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="escritorio" className="bg-paper py-24 text-ink lg:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow !text-copper-lo" data-reveal>{t.firm.eyebrow}</p>
            <h2 className="display mt-5 text-[clamp(2rem,3.8vw,3.4rem)]" data-split>{t.firm.title}</h2>
          </div>
          <div>
            {t.firm.paragraphs.map((p) => <p key={p} className="mb-6 max-w-2xl text-lg text-ink/80" data-reveal>{p}</p>)}
            <h3 className="mt-12 font-display text-3xl text-copper-lo" data-reveal>{t.firm.legacyTitle}</h3>
            <p className="mt-4 max-w-2xl text-ink/75" data-reveal>{t.firm.legacy}</p>
          </div>
        </div>
      </section>

      <section className="hero-light py-28 lg:py-40">
        <p className="wrap display max-w-[26ch] text-[clamp(2.1rem,5vw,4.6rem)] text-copper-hi" data-fill>{t.statement}</p>
      </section>

      <section id="contato" className="hero-light border-t hairline py-24 lg:py-36">
        <div className="wrap grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="eyebrow" data-reveal>{t.contact.eyebrow}</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5.6vw,5rem)]" data-split>{t.contact.title}</h2>
            <p className="mt-6 max-w-md text-bone/75" data-reveal>{t.contact.text}</p>
            <p className="mt-3 max-w-md text-sm text-mist" data-reveal>{t.contact.note}</p>
            <a href={wa} className="btn btn-primary mt-9" data-reveal data-magnetic data-event={`whatsapp_contact_${lang}`}><WhatsAppIcon /> {t.contact.whatsapp}</a>
            <address className="mt-10 space-y-1 not-italic text-bone/75" data-reveal>
              <p>+55 {site.contact.phone}</p>
              <p>{site.contact.street}<br />{site.contact.city} - {site.contact.state}, {site.contact.zip}, Brasil</p>
              <p><a href={maps.directions} target="_blank" rel="noopener" className="ulink text-copper-hi">{t.contact.directions} →</a></p>
            </address>
          </div>
          <div className="self-center" data-reveal><LeadForm labels={t.form} defaultArea="Outra área" /></div>
        </div>
        <div className="wrap"><MapBlock /></div>
      </section>
    </div>
  );
}
