import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Search, X } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { CtaBand, PageHero, ProductCard, Section } from "@/components/kit";
import { categories, categoryName, products } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function Produtos() {
  const search = useSearch();
  const initialCat = new URLSearchParams(search).get("cat") ?? "all";
  const [cat, setCat] = useState(initialCat);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!q) return true;
      return [p.name, p.summary, p.tag ?? "", p.applications.join(" "), categoryName(p.category)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [cat, query]);

  const filters = [{ slug: "all", name: "Todos", count: products.length }].concat(
    categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: products.filter((p) => p.category === c.slug).length,
    })),
  );

  return (
    <>
      <Seo
        title="Catálogo de Equipamentos | Demakine"
        description={`${products.length} equipamentos agroindustriais: esteiras, roscas, elevadores, máquinas de costurar sacos e peneiras, com modelos, medidas e capacidades.`}
        path="/produtos"
      />

      <PageHero
        eyebrow="Catálogo"
        title="Equipamentos para transportar, elevar, empacotar e costurar"
        text="Todos os modelos são fabricados na nossa unidade em Limeira/SP e podem ser adaptados ao seu layout, material e capacidade."
        image="/img/site/hero.webp"
        crumbs={[{ label: "Produtos" }]}
      />

      <Section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
            {filters.map((f) => (
              <button
                key={f.slug}
                type="button"
                onClick={() => setCat(f.slug)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
                  cat === f.slug
                    ? "border-dm-blue bg-dm-blue text-white"
                    : "border-dm-line bg-white text-dm-ink/75 hover:border-dm-blue/50 hover:text-dm-blue",
                )}
              >
                {f.name}
                <span className={cn("ml-1.5 text-[12px]", cat === f.slug ? "text-white/60" : "text-dm-gray/70")}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dm-gray" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no catálogo..."
              aria-label="Buscar no catálogo"
              className="w-full rounded-full border border-dm-line bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-dm-blue"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dm-gray hover:text-dm-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-dm-gray">
            {list.length} {list.length === 1 ? "equipamento" : "equipamentos"}
            {cat !== "all" && ` em ${categoryName(cat)}`}
          </p>
          <p className="text-[13.5px] text-dm-gray">
            Marque <strong className="font-semibold text-dm-ink">Comparar</strong> em até 3 cards para
            ver as especificações lado a lado.
          </p>
        </div>

        {list.length === 0 ? (
          <Reveal className="mt-10 rounded-2xl border border-dm-line bg-dm-surface p-10 text-center">
            <h3 className="h3">Nenhum equipamento com esse filtro</h3>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-dm-gray">
              Fabricamos também sob medida. Descreva sua necessidade e nossa engenharia projeta a
              solução.
            </p>
          </Reveal>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p, idx) => (
              <ProductCard key={p.slug} product={p} i={idx % 4} compare />
            ))}
          </div>
        )}
      </Section>

      <CtaBand />
    </>
  );
}
