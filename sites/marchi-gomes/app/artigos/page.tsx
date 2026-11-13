import type { Metadata } from "next";
import Link from "next/link";
import { visibleArticles } from "@/content/articles";
import { Arrow } from "@/components/icons";
import { Contact } from "@/components/sections";

export const metadata: Metadata = {
  title: "Artigos jurídicos",
  description: "Conteúdo informativo sobre família e sucessões, contratos, patrimônio e direito empresarial, escrito pela Marchi Gomes Advogados.",
  alternates: { canonical: "/artigos" },
};

export default function ArticlesPage() {
  const list = visibleArticles();
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-16 pt-40 lg:pb-24 lg:pt-52">
          <p className="eyebrow" data-reveal>Artigos</p>
          <h1 className="display mt-8 text-[clamp(2.8rem,7vw,6.25rem)]" data-split>Para decidir com informação.</h1>
        </div>
      </section>
      <section className="bg-paper py-20 text-ink lg:py-28">
        <ul className="wrap border-t border-ink/15">
          {list.map((a) => (
            <li key={a.slug} className="border-b border-ink/15" data-reveal>
              <Link href={`/artigos/${a.slug}`} className="group grid gap-4 py-9 lg:grid-cols-[14rem_1fr_auto] lg:items-baseline lg:gap-10">
                <p className="text-xs uppercase tracking-[0.22em] text-copper-lo">{a.area}{a.draft ? " · Rascunho" : ""}</p>
                <div>
                  <h2 className="font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-tight group-hover:text-copper-lo">{a.title}</h2>
                  <p className="mt-3 max-w-2xl text-ink/70">{a.excerpt}</p>
                </div>
                <Arrow className="h-5 w-5 text-copper-lo transition-transform duration-500 group-hover:translate-x-2 max-lg:hidden" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Contact />
    </>
  );
}
