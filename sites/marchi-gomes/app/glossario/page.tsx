import type { Metadata } from "next";
import Link from "next/link";
import { glossary } from "@/content/glossary";
import { visibleArticles } from "@/content/articles";
import { areas, site } from "@/content/site";
import { Contact } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Glossário jurídico em linguagem simples",
  description: "O que é inventário, holding familiar, usucapião, testamento e outros termos jurídicos, explicados de forma direta pela Marchi Gomes Advogados.",
  alternates: { canonical: "/glossario" },
};

export default function GlossaryPage() {
  const letters = [...new Set(glossary.map((g) => g.term[0].toUpperCase()))];
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-16 pt-40 lg:pb-24 lg:pt-52">
          <p className="eyebrow" data-reveal>Glossário jurídico</p>
          <h1 className="display mt-8 max-w-[16ch] text-[clamp(2.8rem,7vw,6.25rem)]" data-split>O Direito em linguagem simples.</h1>
          <nav aria-label="Letras" className="mt-10 flex flex-wrap gap-2" data-reveal>
            {letters.map((l) => (
              <a key={l} href={`#letra-${l}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-copper/40 font-display text-lg hover:bg-copper-hi hover:text-ink">{l}</a>
            ))}
          </nav>
        </div>
      </section>
      <section className="bg-paper py-20 text-ink lg:py-28">
        <dl className="wrap max-w-4xl">
          {glossary.map((g, i) => {
            const first = i === 0 || glossary[i - 1].term[0] !== g.term[0];
            const area = areas.find((a) => a.slug === g.area);
            const article = visibleArticles().find((a) => a.slug === g.article);
            return (
              <div key={g.term} id={first ? `letra-${g.term[0].toUpperCase()}` : undefined} className="grid gap-x-10 gap-y-2 border-t border-ink/15 py-8 sm:grid-cols-[16rem_1fr]" data-reveal>
                <dt className="font-display text-[1.75rem] leading-tight">{g.term}</dt>
                <dd className="text-lg text-ink/80">
                  {g.def}
                  {area && <Link href={`/areas/${area.slug}`} className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-copper-lo hover:text-ink">{area.title} →</Link>}
                  {article && <Link href={`/artigos/${article.slug}`} className="mt-2 block text-sm text-ink/60 underline underline-offset-4 hover:text-ink">Artigo: {article.title}</Link>}
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="wrap mt-10 max-w-4xl text-sm text-ink/55">Definições de caráter informativo, que não substituem a análise do seu caso por um advogado.</p>
      </section>
      <Contact />
      {site.launchReady && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "Glossário jurídico",
            url: `${site.url}/glossario`,
            hasDefinedTerm: glossary.map((g) => ({ "@type": "DefinedTerm", name: g.term, description: g.def })),
          }}
        />
      )}
    </>
  );
}
