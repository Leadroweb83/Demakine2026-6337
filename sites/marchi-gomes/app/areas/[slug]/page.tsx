import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areas, site } from "@/content/site";
import { whatsappHref } from "@/lib/site";
import { Contact, Services } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";
import { Arrow, WhatsAppIcon } from "@/components/icons";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => areas.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = areas.find((a) => a.slug === slug);
  if (!area) return {};
  const where = site.contact.city ? ` em ${site.contact.city}` : "";
  return {
    title: `Advogado de ${area.title}${where}`,
    description: `${area.summary} ${site.name}, em ${site.contact.city}, ${site.contact.state}, desde ${site.founded}.`,
    alternates: { canonical: `/areas/${area.slug}` },
    openGraph: { title: `${area.title} | ${site.name}`, description: area.summary, url: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = areas.find((a) => a.slug === slug);
  if (!area) notFound();
  const others = areas.filter((a) => a.slug !== area.slug);

  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-20 pt-40 lg:pb-28 lg:pt-52">
          <nav aria-label="Você está em" className="text-xs uppercase tracking-[0.2em] text-mist" data-reveal>
            <Link href="/" className="hover:text-copper-hi">Início</Link>
            <span className="mx-2 text-copper">/</span>
            <Link href="/#areas" className="hover:text-copper-hi">Áreas de atuação</Link>
            <span className="mx-2 text-copper">/</span>
            <span className="text-bone">{area.name}</span>
          </nav>
          <h1 className="display mt-8 max-w-[16ch] text-[clamp(2.8rem,7vw,6.25rem)]" data-split>{area.title}{site.contact.city ? ` em ${site.contact.city}` : ""}</h1>
          <span className="rule mt-10" data-draw />
          <p className="mt-8 max-w-2xl font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug text-bone/90" data-reveal>
            {area.summary}
          </p>
          <p className="mt-5 max-w-xl text-bone/70" data-reveal>{area.intro}</p>
          <a
            href={whatsappHref(`Olá! Vim pelo site e gostaria de falar sobre ${area.title}.`)}
            className="btn btn-primary mt-10"
            data-reveal
            data-magnetic
            data-event={`whatsapp_area_${area.slug}`}
          >
            <WhatsAppIcon /> Falar sobre {area.name}
          </a>
        </div>
      </section>

      <Services heading={`Como atuamos em ${area.name}.`} />

      <section className="border-t hairline bg-navy py-16">
        <div className="wrap">
          <p className="eyebrow">Outras áreas</p>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/areas/${o.slug}`} className="group flex items-center justify-between border-b hairline py-5 sm:pr-8">
                  <span className="display text-3xl group-hover:text-copper-hi">{o.name}</span>
                  <Arrow className="h-4 w-4 text-copper transition-transform duration-500 group-hover:translate-x-2" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Contact defaultArea={area.name} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: area.title,
              description: area.summary,
              serviceType: area.title,
              provider: { "@id": `${site.url}/#escritorio` },
              url: `${site.url}/areas/${area.slug}`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: site.url },
                { "@type": "ListItem", position: 2, name: area.title, item: `${site.url}/areas/${area.slug}` },
              ],
            },
          ],
        }}
      />
    </>
  );
}
