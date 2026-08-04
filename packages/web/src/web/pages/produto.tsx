import { useState } from "react";
import { Link, useParams } from "wouter";
import { Check, MessageCircle, Phone } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { Breadcrumb, BtnGhost, BtnPrimary, CtaBand, ProductCard, Section } from "@/components/kit";
import { CineBullets, CineRule, CineSection, CineTag, CineTitle } from "@/components/cine";
import { CompareToggle } from "@/components/compare";
import { Hotspots } from "@/components/tools/hotspots";
import { categoryName, getProduct, relatedProducts } from "@/lib/content";
import { site, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

function NotFound() {
  return (
    <Section>
      <h1 className="h2">Equipamento não encontrado</h1>
      <p className="mt-3 text-[16px] text-dm-gray">
        Esse item pode ter mudado de endereço. Veja o catálogo completo.
      </p>
      <div className="mt-6">
        <BtnPrimary to="/produtos">Ir para o catálogo</BtnPrimary>
      </div>
    </Section>
  );
}

export default function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug ?? "");
  const [active, setActive] = useState(0);

  if (!product) return <NotFound />;

  const images = product.images.length ? product.images : ["/img/site/hero.jpg"];
  const current = images[Math.min(active, images.length - 1)];
  const related = relatedProducts(product, 4);
  // esconde colunas sem informação real (ex: "Definir" em todos os modelos)
  const specKeys = product.specKeys.filter((k) =>
    product.models.some((m) => {
      const v = (m.specs[k] ?? "").trim().toLowerCase();
      return v !== "" && v !== "definir" && v !== "-" && v !== "—";
    }),
  );
  const waMessage = `Olá! Quero um orçamento da ${product.name}.`;
  const isBelt = product.category === "esteiras-transportadoras";

  return (
    <>
      <Seo
        title={product.seoTitle ?? `${product.name} — Demakine`}
        description={product.seoDesc ?? product.summary.slice(0, 180)}
        path={`/produtos/${product.slug}`}
        image={images[0]}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.summary,
          image: `${site.url}${images[0]}`,
          category: categoryName(product.category),
          brand: { "@type": "Brand", name: "Demakine" },
          manufacturer: { "@type": "Organization", name: site.legal },
        }}
      />

      <div className="border-b border-dm-line bg-white">
        <div className="dm-container py-3.5">
          <Breadcrumb
            items={[{ label: "Produtos", to: "/produtos" }, { label: product.name }]}
          />
        </div>
      </div>

      {/* --------------------------------------------------------------- topo */}
      <section className="bg-white py-10 md:py-14">
        <div className="dm-container grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* galeria */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-dm-line bg-dm-surface">
              <img
                src={current}
                alt={product.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-label={`Foto ${idx + 1} de ${product.name}`}
                    className={cn(
                      "h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors md:h-20 md:w-28",
                      idx === active ? "border-dm-blue" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div className="min-w-0">
            <Link
              href={`/produtos?cat=${product.category}`}
              className="eyebrow text-dm-blue hover:underline"
            >
              {categoryName(product.category)}
            </Link>
            <h1 className="h2 mt-3">{product.name}</h1>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">{product.summary}</p>

            {product.applications.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow text-dm-ink/45">Aplicações</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.applications.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-dm-line bg-dm-surface px-3.5 py-1.5 text-[13px] font-semibold text-dm-ink/75"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.models.length > 0 && (
              <p className="mt-6 rounded-xl border border-dm-line bg-dm-blue-soft/60 px-4 py-3 text-[14.5px] text-dm-ink/80">
                <strong className="font-bold">{product.models.length} modelos</strong> disponíveis em
                linha — e adaptações sob medida quando o seu layout pede.
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <BtnPrimary href={waLink(waMessage)} external className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Orçamento no WhatsApp
              </BtnPrimary>
              <BtnGhost href={site.phoneHref} className="gap-2">
                <Phone className="h-4 w-4" />
                {site.phone}
              </BtnGhost>
            </div>

            <div className="mt-4">
              <CompareToggle slug={product.slug} label="Comparar com outro modelo" />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- descrição + features */}
      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <h2 className="h3">Sobre a {product.name}</h2>
            <div className="prose-dm mt-5 text-[16px] leading-relaxed text-dm-ink/80">
              {product.description.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </Reveal>

          {product.features.length > 0 && (
            <Reveal i={1}>
              <div className="rounded-2xl border border-dm-line bg-white p-6 md:p-7">
                <h2 className="h3">Características técnicas</h2>
                <ul className="mt-5 space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] leading-relaxed text-dm-ink/80">
                      <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-dm-blue" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </Section>

      {/* ------------------------------------------------------------- anatomia */}
      {isBelt && (
        <CineSection>
          <div className="max-w-2xl">
            <CineTag>Anatomia do equipamento</CineTag>
            <CineTitle className="mt-5" small lines={["O que faz essa", "máquina durar", "turno cheio"]} />
            <CineRule className="mt-5" />
            <p className="mt-5 text-[16.5px] leading-relaxed text-white/70">
              Toque nos pontos da foto para ver o que está por trás de cada detalhe do projeto.
            </p>
          </div>

          <div className="mt-10">
            <Hotspots image={images[0]} alt={product.name} />
          </div>

          <CineBullets
            className="mt-10 grid gap-3 md:grid-cols-2"
            items={product.features.slice(0, 4)}
          />
        </CineSection>
      )}

      {/* ------------------------------------------------------ tabela de modelos */}
      {product.models.length > 0 && specKeys.length > 0 && (
        <Section>
          <Reveal>
            <p className="eyebrow text-dm-blue">Especificações</p>
            <h2 className="h2 mt-3">Compare os {product.models.length} modelos</h2>
            <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">
              Valores de referência de fábrica. Comprimento, largura de correia e motorização podem
              ser ajustados conforme o projeto.
            </p>
          </Reveal>

          <Reveal i={1} className="mt-8">
            <div className="overflow-x-auto rounded-2xl border border-dm-line">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    {specKeys.map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.models.map((m) => (
                    <tr key={m.model}>
                      <th scope="row" className="font-bold text-dm-blue">
                        {m.model}
                      </th>
                      {specKeys.map((k) => (
                        <td key={k} className="text-dm-ink/80">
                          {m.specs[k] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-3 text-[13px] text-dm-gray lg:hidden">Arraste a tabela para o lado →</p>
        </Section>
      )}

      {/* ------------------------------------------------------------ formulário */}
      <Section tone="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Orçamento</p>
            <h2 className="h2 mt-3">Peça uma proposta para a {product.name}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Para acelerar, informe: material transportado, comprimento necessário, altura de
              descarga e capacidade desejada. Se tiver fotos do local, melhor ainda — mande no
              WhatsApp.
            </p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-dm-ink/80">
              {[
                "Projeto dimensionado para a sua operação",
                "Fabricação própria em Limeira/SP",
                "Entrega em todo o Brasil",
                "Assistência técnica e peças de reposição",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-dm-blue" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal i={1}>
            <LeadForm source={`produto:${product.slug}`} product={product.name} />
          </Reveal>
        </div>
      </Section>

      {/* -------------------------------------------------------------- relacionados */}
      <Section>
        <h2 className="h2">Equipamentos relacionados</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p, idx) => (
            <ProductCard key={p.slug} product={p} i={idx % 4} />
          ))}
        </div>
      </Section>

      <CtaBand waMessage={waMessage} />
    </>
  );
}
