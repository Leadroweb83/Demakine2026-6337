import { useMemo, useState } from "react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { CtaBand, PageHero, Section, SectionHead, TestimonialGrid } from "@/components/kit";
import { clients, testimonials } from "@/lib/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function Clientes() {
  const segmentList = useMemo(() => {
    const set = new Map<string, number>();
    for (const c of clients) set.set(c.segment, (set.get(c.segment) ?? 0) + 1);
    return [...set.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const [filter, setFilter] = useState("all");
  const list = filter === "all" ? clients : clients.filter((c) => c.segment === filter);
  const [showAllTestimonials, setShowAll] = useState(false);

  return (
    <>
      <Seo
        title="Nossos Clientes e Depoimentos | Demakine"
        description="Indústrias de todos os portes e segmentos em todo o Brasil movimentam sua produção com equipamentos Demakine. Veja clientes e 29 depoimentos reais."
        path="/clientes"
      />

      <PageHero
        eyebrow="Nossos clientes"
        title="Quem está por trás da nossa história"
        text="Indústrias de diferentes portes e segmentos em todo o Brasil. Mais do que equipamentos, entregamos consultoria técnica, agilidade e suporte pós-venda."
        image="/img/site/fabrica.jpg"
        crumbs={[{ label: "Clientes" }]}
      />

      <div className="border-b border-dm-line bg-white">
        <div className="dm-container grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {[
            { value: <Counter to={site.stats.clients} suffix="+" />, label: "clientes atendidos" },
            { value: <Counter to={site.stats.machines} suffix="+" />, label: "máquinas entregues" },
            { value: <Counter to={testimonials.length} />, label: "depoimentos publicados" },
            { value: <Counter to={site.stats.rating} decimals={1} suffix="★" />, label: "nota média" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-dm-blue md:text-4xl">{s.value}</p>
              <p className="mt-1 text-[13px] uppercase tracking-wide text-dm-gray">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Section>
        <SectionHead
          eyebrow="Parcerias"
          title={`${clients.length} marcas que confiam na nossa engenharia`}
          text="Do setor alimentício ao farmacêutico, do agronegócio à reciclagem: nossa tecnologia movimenta o crescimento dos nossos parceiros diariamente."
        />

        <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
              filter === "all"
                ? "border-dm-blue bg-dm-blue text-white"
                : "border-dm-line bg-white text-dm-ink/75 hover:border-dm-blue/50 hover:text-dm-blue",
            )}
          >
            Todos <span className="ml-1 text-[12px] opacity-70">{clients.length}</span>
          </button>
          {segmentList.map(([seg, count]) => (
            <button
              key={seg}
              type="button"
              onClick={() => setFilter(seg)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
                filter === seg
                  ? "border-dm-blue bg-dm-blue text-white"
                  : "border-dm-line bg-white text-dm-ink/75 hover:border-dm-blue/50 hover:text-dm-blue",
              )}
            >
              {seg} <span className="ml-1 text-[12px] opacity-70">{count}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((c, idx) => (
            <Reveal key={c.id} i={idx % 5}>
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dm-line bg-white p-5 transition-shadow hover:shadow-md">
                <img
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  className="h-16 w-auto object-contain opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                />
                <div className="text-center">
                  <p className="text-[13.5px] font-bold leading-tight text-dm-ink">{c.name}</p>
                  <p className="mt-0.5 text-[12px] text-dm-gray">{c.segment}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead
          eyebrow="Depoimentos"
          title="O que os clientes falam da Demakine"
          text="Nota média 4,9. Boa parte dos nossos negócios chega por indicação de quem já comprou."
        />
        <div className="mt-12">
          <TestimonialGrid limit={showAllTestimonials ? testimonials.length : 9} />
        </div>
        {!showAllTestimonials && testimonials.length > 9 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-full border border-dm-line bg-white px-7 py-3.5 text-[13px] font-bold uppercase tracking-wide text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
            >
              Ver todos os {testimonials.length} depoimentos
            </button>
          </div>
        )}
      </Section>

      <CtaBand
        title="Quer ser o próximo case?"
        text="Conte sua necessidade e mostramos como equipamentos Demakine resolveram operações parecidas com a sua."
      />
    </>
  );
}
