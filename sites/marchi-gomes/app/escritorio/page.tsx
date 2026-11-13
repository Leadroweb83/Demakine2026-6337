import type { Metadata } from "next";
import { areas, future, history, site, team } from "@/content/site";
import { Contact, Future, Legacy, Team, Timeline } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "O escritório: história, sócios e legado",
  description: "A história da Marchi Gomes Advogados, nascida em 1996 em Limeira como escritório João Jair Marchi e, desde 2026, Marchi Gomes, com Gisele Marchi e Gabriel Gomes.",
  alternates: { canonical: "/escritorio" },
};

export default function FirmPage() {
  const [lead, ...rest] = history.paragraphs;
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-20 pt-40 lg:pb-28 lg:pt-52">
          <p className="eyebrow" data-reveal>O escritório · Limeira, desde {site.founded}</p>
          <h1 className="display mt-8 max-w-[20ch] text-[clamp(2.6rem,6.4vw,5.75rem)]" data-split>{history.title}</h1>
          <span className="rule mt-10" data-draw />
        </div>
      </section>

      <section className="bg-paper py-24 text-ink lg:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <h2 className="eyebrow !text-copper-lo lg:pt-3">Qual é a história do escritório e de seus sócios?</h2>
          <div>
            <p className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-snug" data-reveal>{lead}</p>
            {rest.map((t) => (
              <p key={t} className="mt-7 max-w-2xl text-lg text-ink/75" data-reveal>{t}</p>
            ))}
          </div>
        </div>
      </section>

      <Timeline />
      <Legacy />
      <Team />
      <Future full />
      <Contact />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `Sobre ${site.name}`,
          url: `${site.url}/escritorio`,
          about: { "@id": `${site.url}/#escritorio` },
          description: future.title,
        }}
      />
      {team.map((m) => (
        <JsonLd
          key={m.name}
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: m.name,
            jobTitle: m.role,
            ...(m.bio ? { description: m.bio } : {}),
            ...(m.oab ? { identifier: { "@type": "PropertyValue", propertyID: "OAB", value: m.oab } } : {}),
            ...(m.oab ? { hasOccupation: { "@type": "Occupation", name: "Advogado" } } : {}),
            worksFor: { "@id": `${site.url}/#escritorio` },
            workLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: site.contact.city, addressRegion: site.contact.state, addressCountry: "BR" } },
            ...(m.oab ? { knowsAbout: areas.map((a) => a.title) } : {}),
          }}
        />
      ))}
    </>
  );
}
