import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areas, cities, site } from "@/content/site";
import { Contact } from "@/components/sections";

type Props = { params: Promise<{ cidade: string }> };

// Sem cidades confirmadas em content/site.ts, nenhuma pagina e gerada.
export const dynamicParams = false;
export const generateStaticParams = () => cities.map((c) => ({ cidade: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params;
  const c = cities.find((x) => x.slug === cidade);
  if (!c) return {};
  return {
    title: `Advogado em ${c.name}`,
    description: `${site.name} atende pessoas, famílias e empresas de ${c.name} a partir do escritório em ${site.contact.city}, ${site.contact.state}.`,
    alternates: { canonical: `/atuacao/${c.slug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { cidade } = await params;
  const c = cities.find((x) => x.slug === cidade);
  if (!c) notFound();
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-20 pt-40 lg:pb-28 lg:pt-52">
          <p className="eyebrow" data-reveal>Atuação em {c.name}</p>
          <h1 className="display mt-8 max-w-[16ch] text-[clamp(2.8rem,7vw,6.25rem)]" data-split>Advogado em {c.name}.</h1>
          <span className="rule mt-10" data-draw />
          <p className="mt-8 max-w-2xl text-lg text-bone/80" data-reveal>
            A {site.name} atende pessoas, famílias e empresas de {c.name} a partir do escritório em {site.contact.city}, fundado em {site.founded}.
          </p>
        </div>
      </section>
      <section className="bg-paper py-20 text-ink">
        <div className="wrap">
          <p className="eyebrow !text-copper-lo">Áreas de atuação</p>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <li key={a.slug}><Link href={`/areas/${a.slug}`} className="block border-b border-ink/15 py-4 font-display text-2xl hover:text-copper-lo">{a.title}</Link></li>
            ))}
          </ul>
        </div>
      </section>
      <Contact />
    </>
  );
}
