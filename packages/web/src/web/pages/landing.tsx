import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { PageHero, ProductCard, Section } from "@/components/kit";
import { FaqAccordion } from "@/components/faq";
import { LeadForm } from "@/components/lead-form";
import { VendorCta } from "@/components/vendor-cta";
import { Blocks, Md } from "@/components/landing-blocks";
import { products, type Product } from "@/lib/content";
import { faqJsonLd } from "@/lib/faq";
import { landingFor } from "@/lib/landing-pages";

const FALLBACK_HERO = "/img/site/hero.webp";

/**
 * Página com URL própria, só em português: as 4 categorias e as 6 páginas comerciais. O texto, o título e o schema são do
 * Marketing (content/landing/*.md); aqui ficam o layout, os botões de contato e o formulário.
 * Trilha: a do arquivo (Início › Produtos › Categoria, ou Início › Categoria › página comercial).
 */
export default function LandingPage() {
  const [path] = useLocation();
  const l = landingFor(path);
  if (!l) return null;

  const isCategory = l.kind === "categoria";
  const track = isCategory ? "categoria" : "pagina";
  const list = l.items.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p));
  const trail = l.breadcrumb.slice(1, -1).map(([name, to]) => ({ name, path: to }));
  const last = l.breadcrumb[l.breadcrumb.length - 1]![0];
  const [first, ...more] = l.intro;
  const heroImage = l.heroImage ?? list[0]?.images[0] ?? l.heroFallback ?? FALLBACK_HERO;

  return (
    <>
      <Seo
        title={l.title}
        description={l.description}
        path={`/${l.slug}`}
        parents={trail}
        crumb={last}
        jsonLd={[...l.schema, faqJsonLd(l.faq)]}
      />

      <PageHero
        eyebrow={isCategory ? "Produtos" : (trail[trail.length - 1]?.name ?? "Demakine")}
        title={l.h1}
        text={first?.t === "p" ? <Md text={first.md} dark /> : undefined}
        image={heroImage}
        scrim
        crumbs={[...trail.map((p) => ({ label: p.name, to: p.path })), { label: last }]}
        action={
          <>
            <VendorCta waMessage={l.waMessage} location={`${track}:${l.slug}`} dark />
            {l.heroNote && <p className="mt-3 text-[13.5px] text-white/65">{l.heroNote.charAt(0).toUpperCase() + l.heroNote.slice(1)}</p>}
          </>
        }
      />

      {more.length > 0 && (
        <Section className="pb-0 md:pb-0">
          <div className="max-w-3xl">
            <Blocks blocks={more} />
          </div>
        </Section>
      )}

      {isCategory && list.length > 0 && (
        <Section>
          <p className="eyebrow text-dm-blue">Modelos</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <ProductCard key={p.slug} product={p} i={i % 3} />
            ))}
          </div>
        </Section>
      )}

      {l.sections.map((s, i) => (
        <Section key={s.title} tone={i % 2 === 0 ? "surface" : "white"}>
          <Reveal>
            <h2 className="h2 max-w-3xl">{s.title}</h2>
          </Reveal>
          <div className="mt-6 max-w-4xl">
            <Blocks blocks={s.blocks} />
          </div>
        </Section>
      ))}

      {l.faq.length > 0 && (
        <Section tone={l.sections.length % 2 === 0 ? "surface" : "white"}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <h2 className="h2">Perguntas frequentes</h2>
              <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
                Não achou a sua? Chame um vendedor pelo WhatsApp.
              </p>
            </Reveal>
            <Reveal i={1}>
              <FaqAccordion items={l.faq.map((f) => ({ q: f.q, a: f.a, rich: <Md text={f.md} /> }))} openFirst />
            </Reveal>
          </div>
        </Section>
      )}

      <Section tone={l.sections.length % 2 === 0 ? "white" : "surface"} id="orcamento">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Orçamento</p>
            <h2 className="h2 mt-3">{l.cta.title}</h2>
            <div className="mt-4">
              <Blocks blocks={l.cta.blocks} />
            </div>
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
            {l.cta.contact && (
              <p className="mt-5 text-[14.5px] text-dm-gray">
                <Md text={l.cta.contact} />
              </p>
            )}
          </Reveal>
          <Reveal i={1}>
            <LeadForm source={`${track}:${l.slug}`} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
