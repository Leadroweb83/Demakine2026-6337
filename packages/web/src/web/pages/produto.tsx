import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  HelpCircle,
  MessageCircle,
  Minus,
  Phone,
  Printer,
  Wrench,
  X,
} from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { Breadcrumb, BtnGhost, BtnPrimary, BtnWhats, CtaBand, ProductCard, Section } from "@/components/kit";
import { CineBullets, CineRule, CineSection, CineTag, CineTitle } from "@/components/cine";
import { CompareToggle } from "@/components/compare";
import { Hotspots } from "@/components/tools/hotspots";
import { Spin360 } from "@/components/spin-360";
import { ProductVideos } from "@/components/product-videos";
import { videosFor } from "@/lib/product-videos";
import { FaqAccordion } from "@/components/faq";
import { faqGroups, faqJsonLd } from "@/lib/faq";
import {
  maintenancePlan,
  materialFit,
  materials,
  productExtras,
  type Fit,
} from "@/lib/product-content";
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
      return v !== "" && v !== "definir" && v !== "-" && v !== "-";
    }),
  );
  const waMessage = `Olá! Quero um orçamento da ${product.name}.`;
  const isBelt = product.category === "esteiras-transportadoras";
  const spin = images.length >= 4;
  const extras = productExtras(product.category);
  const fit = materialFit(product.slug);
  const pageFaq = [...extras.faq, ...faqGroups[0].items.slice(0, 1), ...faqGroups[2].items.slice(0, 1)];
  const videos = videosFor(product.slug);

  return (
    <>
      <Seo
        title={product.seoTitle ?? `${product.name} | Demakine`}
        description={product.seoDesc ?? product.summary.slice(0, 180)}
        path={`/produtos/${product.slug}`}
        image={images[0]}
        type="product"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.summary,
            image: `${site.url}${images[0]}`,
            category: categoryName(product.category),
            brand: { "@type": "Brand", name: "Demakine" },
            manufacturer: { "@type": "Organization", name: site.legal },
          },
          faqJsonLd(pageFaq),
        ]}
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
            {spin ? (
              <Spin360
                images={images}
                alt={product.name}
                index={active}
                onIndexChange={setActive}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-dm-line bg-dm-surface">
                <img
                  src={current}
                  alt={product.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            )}
            {spin && (
              <p className="mt-3 text-[13px] text-dm-gray">
                Fotos reais de fábrica em sequência: passe o mouse sobre a imagem (ou arraste no
                celular) para ver o equipamento por todos os ângulos.
              </p>
            )}
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
                linha, e adaptações sob medida quando o seu layout pede.
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <BtnWhats href={waLink(waMessage)} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Orçamento no WhatsApp
              </BtnWhats>
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

      {/* ---------------------------------------------------------------- vídeos */}
      {videos.length > 0 && <ProductVideos productName={product.name} videos={videos} />}

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
                          {m.specs[k] ?? "-"}
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

      {/* ------------------------------------------------ para qual material serve */}
      <Section>
        <Reveal>
          <p className="eyebrow text-dm-blue">Compatibilidade</p>
          <h2 className="h2 mt-3">Para qual material esse equipamento serve</h2>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">
            Guia rápido pelo tipo de carga. "Sob consulta" não é não: significa que dá para atender
            com ajuste de correia, perfil, vedação ou material da estrutura, e por isso a gente
            precisa conhecer o seu produto antes de indicar.
          </p>
        </Reveal>

        <Reveal i={1} className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => {
              const v = fit[m] as Fit;
              const meta = {
                sim: {
                  Icon: Check,
                  label: "Indicado",
                  box: "border-dm-green/35 bg-dm-green-soft/50",
                  chip: "bg-dm-green text-white",
                },
                consulta: {
                  Icon: Minus,
                  label: "Sob consulta",
                  box: "border-dm-line bg-white",
                  chip: "bg-dm-blue-soft text-dm-blue",
                },
                nao: {
                  Icon: X,
                  label: "Não indicado",
                  box: "border-dm-line bg-dm-surface",
                  chip: "bg-dm-ink/10 text-dm-ink/55",
                },
              }[v];
              return (
                <li
                  key={m}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-2xl border px-5 py-4",
                    meta.box,
                  )}
                >
                  <span className="text-[15.5px] font-bold text-dm-ink">{m}</span>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide",
                      meta.chip,
                    )}
                  >
                    <meta.Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[14px] text-dm-gray">
            Seu material não está na lista? Descreva no WhatsApp que a gente diz na hora se essa
            linha atende ou qual equipamento é o certo.
          </p>
        </Reveal>
      </Section>

      {/* --------------------------------------------------- erros que custam caro */}
      <Section tone="surface">
        <Reveal>
          <p className="eyebrow text-dm-red">Antes de comprar</p>
          <h2 className="h2 mt-3">3 erros que custam caro nessa escolha</h2>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">
            São os desencontros que mais vemos em máquina comprada às pressas. Custa pouco conferir
            antes e caro consertar depois.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {extras.mistakes.map((m, idx) => (
            <Reveal key={m.title} i={idx} className="h-full">
              <div className="h-full rounded-2xl border border-dm-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dm-red/10 text-dm-red">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16.5px] leading-snug font-bold text-dm-ink">{m.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-dm-gray">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal i={3} className="mt-7">
          <BtnWhats href={waLink(`Olá! Quero conferir se a ${product.name} é a escolha certa para a minha operação.`)} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Conferir minha escolha com um especialista
          </BtnWhats>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------ ficha de instalação */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow text-dm-blue">Ficha de instalação</p>
            <h2 className="h2 mt-3">O que deixar pronto antes da máquina chegar</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Quando o local está preparado, a máquina entra em operação no mesmo dia da chegada.
              Essa é a lista que passamos para o cliente no fechamento do pedido.
            </p>
            <div className="mt-6">
              <BtnWhats
                href={waLink(`Olá! Quero conferir a preparação do local para instalar a ${product.name}.`)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Tirar dúvida de instalação
              </BtnWhats>
            </div>
          </Reveal>

          <Reveal i={1}>
            <ol className="space-y-3">
              {extras.install.map((it, idx) => (
                <li
                  key={it.title}
                  className="flex gap-4 rounded-2xl border border-dm-line bg-white p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dm-blue text-[15px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[16px] font-bold text-dm-ink">{it.title}</span>
                    <span className="mt-1.5 block text-[14.5px] leading-relaxed text-dm-gray">
                      {it.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------- peças de reposição */}
      <Section tone="surface">
        <Reveal>
          <p className="eyebrow text-dm-blue">Pós-venda</p>
          <h2 className="h2 mt-3">Peças de reposição e consumíveis</h2>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">
            Itens de desgaste que a gente fornece para essa linha. Ter as peças críticas em estoque
            antes da safra é o que separa uma parada de horas de uma parada de dias.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extras.parts.map((pt, idx) => (
            <Reveal key={pt.title} i={idx % 3} className="h-full">
              <div className="flex h-full gap-4 rounded-2xl border border-dm-line bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Wrench className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-bold text-dm-ink">{pt.title}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-dm-gray">
                    {pt.text}
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal i={3} className="mt-8">
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-dm-line bg-white p-6 md:flex-row md:items-center md:justify-between md:p-7">
            <div>
              <p className="text-[17px] font-bold text-dm-ink">Precisa de uma peça agora?</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-dm-gray">
                Informe o equipamento e, se tiver, a foto da peça. A cotação sai direto com a
                assistência técnica.
              </p>
            </div>
            <BtnWhats
              href={waLink(`Olá! Preciso de orçamento de peça de reposição para a ${product.name}.`)}
              className="shrink-0 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Orçamento de peça
            </BtnWhats>
          </div>
        </Reveal>
      </Section>

      {/* -------------------------------------------------- manutenção em 5 minutos */}
      <Section>
        <Reveal>
          <p className="eyebrow text-dm-blue">Manutenção</p>
          <h2 className="h2 mt-3">Manutenção em 5 minutos por dia</h2>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">
            A maior parte das paradas que atendemos poderia ter sido vista antes, em uma volta rápida
            na máquina. Esse é o roteiro que recomendamos para a sua equipe.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {maintenancePlan.map((plan, idx) => (
            <Reveal key={plan.period} i={idx} className="h-full">
              <div className="h-full rounded-2xl border border-dm-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[17px] font-bold text-dm-ink">{plan.period}</h3>
                <ul className="mt-4 space-y-2.5">
                  {plan.items.map((t) => (
                    <li key={t} className="flex gap-3 text-[14.5px] leading-relaxed text-dm-ink/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-dm-green" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal i={3} className="mt-7">
          <BtnGhost href="/downloads/checklist-manutencao-demakine.pdf" external className="gap-2">
            <Printer className="h-4 w-4" />
            Baixar checklist em PDF para pendurar na fábrica
          </BtnGhost>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------ faq do produto */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <Reveal>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
              <HelpCircle className="h-6 w-6" />
            </span>
            <h2 className="h2 mt-5">Perguntas frequentes</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              O que mais perguntam sobre essa linha de equipamento.
            </p>
            <Link
              href="/faq"
              className="mt-5 inline-block text-[15px] font-bold text-dm-blue hover:underline"
            >
              Ver todas as perguntas frequentes →
            </Link>
          </Reveal>
          <Reveal i={1}>
            <FaqAccordion items={pageFaq} openFirst />
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------------ formulário */}
      <Section tone="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Orçamento</p>
            <h2 className="h2 mt-3">Peça uma proposta para a {product.name}</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Para acelerar, informe: material transportado, comprimento necessário, altura de
              descarga e capacidade desejada. Se tiver fotos do local, melhor ainda: mande no
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
