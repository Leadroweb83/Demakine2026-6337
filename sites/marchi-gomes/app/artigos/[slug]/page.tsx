import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visibleArticles } from "@/content/articles";
import { site } from "@/content/site";
import { Contact } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => visibleArticles().map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = visibleArticles().find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/artigos/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.excerpt, url: `/artigos/${a.slug}`, publishedTime: a.date },
    robots: a.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = visibleArticles().find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-16 pt-40 lg:pb-24 lg:pt-52">
          <nav aria-label="Você está em" className="text-xs uppercase tracking-[0.2em] text-mist" data-reveal>
            <Link href="/artigos" className="hover:text-copper-hi">Artigos</Link>
            <span className="mx-2 text-copper">/</span>
            <span className="text-bone">{a.area}</span>
          </nav>
          <h1 className="display mt-8 max-w-[20ch] text-[clamp(2.5rem,5.6vw,5rem)]" data-split>{a.title}</h1>
          {a.draft && <p className="mt-6 inline-block border border-copper/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-copper-hi">Rascunho: aguardando revisão de um advogado do escritório</p>}
        </div>
      </section>
      <article className="bg-paper py-20 text-ink lg:py-28">
        <div className="wrap max-w-3xl">
          <p className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-snug" data-reveal>{a.excerpt}</p>
          {a.body.map((b) => (
            <div key={b.p} data-reveal>
              {b.h && <h2 className="display mt-12 text-[clamp(1.7rem,3vw,2.4rem)]">{b.h}</h2>}
              <p className="mt-5 text-lg text-ink/80">{b.p}</p>
            </div>
          ))}
        </div>
      </article>
      <Contact defaultArea={a.area} />
      {!a.draft && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.excerpt,
            datePublished: a.date,
            author: { "@id": `${site.url}/#escritorio` },
            publisher: { "@id": `${site.url}/#escritorio` },
            mainEntityOfPage: `${site.url}/artigos/${a.slug}`,
          }}
        />
      )}
    </>
  );
}
