import { areas, faqs, site } from "@/content/site";

const clean = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v != null));

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function legalServiceLd() {
  const c = site.contact;
  return clean({
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${site.url}/#escritorio`,
    name: site.name,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    telephone: c.phone,
    email: c.email,
    address: c.street
      ? clean({
          "@type": "PostalAddress",
          streetAddress: c.street,
          addressLocality: c.city,
          addressRegion: c.state,
          postalCode: c.zip,
          addressCountry: "BR",
        })
      : "",
    areaServed: c.city || "BR",
    knowsAbout: areas.map((a) => a.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Áreas de atuação",
      itemListElement: areas.map((a) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: a.title, description: a.summary, url: `${site.url}/areas/${a.slug}` },
      })),
    },
    sameAs: [site.social.instagram, site.social.linkedin].filter(Boolean),
  });
}

export function faqLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
