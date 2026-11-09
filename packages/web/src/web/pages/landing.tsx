import { Link, useLocation } from "wouter";
import { Check } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { PageHero, ProductCard, Section, SectionHead } from "@/components/kit";
import { FaqAccordion } from "@/components/faq";
import { LeadForm } from "@/components/lead-form";
import { VendorCta } from "@/components/vendor-cta";
import { categoryName, products, type Product } from "@/lib/content";
import { faqJsonLd } from "@/lib/faq";
import { itemListJsonLd } from "@/lib/schema";
import { landingFor } from "@/lib/landing-pages";
import { CATEGORY_PAGE } from "@/lib/landing-links";

const FALLBACK_HERO = "/img/site/hero.webp";

/**
 * Página com URL própria, só em português: as 4 categorias e as 6 páginas comerciais. Um componente, um texto por página
 * (lib/landing-pages.ts). Trilha: Início › Produtos › [Categoria] › página.
 */
export default function LandingPage() {
  const [path] = useLocation();
  const l = landingFor(path);
  if (!l) return null;

  const list = l.productSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
  const isCategory = l.kind === "categoria";
  const track = isCategory ? "categoria" : "pagina";
  const categoryLabel = l.category ? categoryName(l.category) : undefined;
  // a trilha da página comercial passa pela categoria dela; a da categoria é "Produtos › Categoria"
  const parents = [
    { name: "Produtos", path: "/produtos" },
    ...(!isCategory && l.category && CATEGORY_PAGE[l.category] ? [{ name: categoryLabel!, path: CATEGORY_PAGE[l.category]! }] : []),
  ];
  const crumbs = [
    ...parents.map((p) => ({ label: p.name, to: p.path })),
    { label: isCategory ? l.eyebrow : l.seoTitle.split(" | ")[0]! },
  ];

  return (
    <>
      <Seo
        title={l.seoTitle}
        description={l.seoDesc}
        path={`/${l.slug}`}
        parents={parents}
        jsonLd={[
          itemListJsonLd(
            l.h1,
            list.map((p) => ({ name: p.name, path: `/produtos/${p.slug}`, image: p.images[0] })),
          ),
          faqJsonLd(l.faq),
        ]}
      />

      <PageHero
        eyebrow={l.eyebrow}
        title={l.h1}
        text={l.lead}
        image={list[0]?.images[0] ?? FALLBACK_HERO}
        scrim
        crumbs={crumbs}
        action={<VendorCta waMessage={l.waMessage} location={`${track}:${l.slug}`} dark />}
      />

      <Section>
        <SectionHead eyebrow={l.productsEyebrow} title={l.productsTitle} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} i={i % 3} />
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead eyebrow={l.guideEyebrow} title={l.guideTitle} />
        <ol className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">
          {l.guide.map((b, i) => (
            <li key={b.title}>
              <Reveal i={i % 2} className="flex gap-5">
                <span aria-hidden className="font-display text-[44px] font-black leading-none text-dm-blue/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[19px] font-bold text-dm-ink">{b.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-dm-gray">{b.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        {l.table && (
          <Reveal className="mt-12 max-w-xl">
            <table className="w-full border-collapse text-left text-[15px]">
              <caption className="pb-3 text-left font-display text-[18px] font-bold text-dm-ink">{l.table.title}</caption>
              <thead>
                <tr className="border-b-2 border-dm-ink/20 text-[13px] uppercase tracking-wide text-dm-gray">
                  {l.table.head.map((h) => (
                    <th key={h} scope="col" className="py-2.5 pr-6 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {l.table.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-dm-line">
                    {r.map((cell, ci) =>
                      ci === 0 ? (
                        <th key={cell} scope="row" className="py-2.5 pr-6 font-semibold text-dm-ink">
                          {cell}
                        </th>
                      ) : (
                        <td key={cell} className="py-2.5 pr-6 text-dm-ink/80">
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {l.table.note && <p className="mt-3 text-[13.5px] text-dm-gray">{l.table.note}</p>}
          </Reveal>
        )}
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <p className="eyebrow text-dm-blue">Perguntas frequentes</p>
            <h2 className="h2 mt-3">{l.faqTitle}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Não achou a sua? Fale com um vendedor, que responde na hora.
            </p>
          </Reveal>
          <Reveal i={1}>
            <FaqAccordion items={l.faq} openFirst />
          </Reveal>
        </div>
      </Section>

      <Section tone="surface" id="orcamento">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Orçamento</p>
            <h2 className="h2 mt-3">{l.quoteTitle}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">{l.quoteText}</p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-dm-ink/80">
              {[
                "Projeto dimensionado para a sua operação",
                "Fabricação própria em Limeira/SP",
                "Entrega em todo o Brasil",
                "Assistência técnica e peças de reposição",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-dm-blue" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <VendorCta waMessage={l.waMessage} location={`${track}:${l.slug}:form`} showQuote={false} className="mt-7" />
          </Reveal>
          <Reveal i={1}>
            <LeadForm source={`${track}:${l.slug}`} />
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Veja também" title="Outras páginas que podem ajudar" />
        <ul className="mt-6 flex flex-wrap gap-3">
          {l.related.map((r) => (
            <li key={r.to}>
              <Link
                href={r.to}
                className="inline-block rounded-full border border-dm-line px-5 py-2.5 text-[14px] font-semibold text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
