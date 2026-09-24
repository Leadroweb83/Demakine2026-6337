import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { categories, productsByCategory } from "@/lib/content";
import { segmentLps } from "@/lib/segmentos-lp";
import { cn } from "@/lib/utils";

/**
 * Mega menu de Produtos: as 4 linhas do catálogo com a lista de equipamentos e a
 * foto da máquina correspondente aparecendo ao passar o mouse.
 */
export function ProductsMega({ onNavigate }: { onNavigate?: () => void }) {
  const [cat, setCat] = useState(categories[0]!.slug);
  const [hover, setHover] = useState<string | null>(null);

  const list = useMemo(() => productsByCategory(cat), [cat]);
  const shown = useMemo(
    () => list.find((p) => p.slug === hover) ?? list[0],
    [list, hover],
  );

  return (
    <div className="mega-panel border-t border-dm-line bg-white shadow-[0_28px_60px_rgba(17,19,24,0.14)]">
      <div className="dm-container grid gap-8 py-8 lg:grid-cols-[236px_1fr_320px]">
        {/* linhas do catálogo */}
        <div>
          <p className="eyebrow text-dm-gray">Linhas</p>
          <ul className="mt-4 space-y-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onMouseEnter={() => {
                    setCat(c.slug);
                    setHover(null);
                  }}
                  onFocus={() => {
                    setCat(c.slug);
                    setHover(null);
                  }}
                  onClick={() => setCat(c.slug)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-bold transition-colors",
                    cat === c.slug
                      ? "bg-dm-blue-soft text-dm-blue"
                      : "text-dm-ink/80 hover:bg-dm-surface hover:text-dm-blue",
                  )}
                >
                  {c.name}
                  <ArrowRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-opacity",
                      cat === c.slug ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/produtos"
            onClick={onNavigate}
            className="mt-4 inline-flex items-center gap-1.5 px-3 text-[13.5px] font-bold text-dm-blue hover:underline"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* equipamentos da linha ativa */}
        <div className="min-w-0">
          <p className="eyebrow text-dm-gray">Equipamentos</p>
          <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {list.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/produtos/${p.slug}`}
                  onMouseEnter={() => setHover(p.slug)}
                  onFocus={() => setHover(p.slug)}
                  onClick={onNavigate}
                  className={cn(
                    "block truncate rounded-lg px-2.5 py-2 text-[14px] font-semibold transition-colors",
                    hover === p.slug
                      ? "bg-dm-surface text-dm-blue"
                      : "text-dm-ink/75 hover:text-dm-blue",
                  )}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-dm-line pt-4">
            <p className="eyebrow text-dm-gray">Segmentos</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {segmentLps.map((s) => (
                <Link
                  key={s.slug}
                  href={`/segmentos/${s.slug}`}
                  onClick={onNavigate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dm-blue/25 bg-dm-blue-soft px-2.5 py-1.5 text-[12.5px] font-bold text-dm-blue transition-colors hover:border-dm-blue/60"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                  {s.name}
                </Link>
              ))}
              <Link
                href="/agro"
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5 rounded-full border border-dm-blue/25 bg-dm-blue-soft px-2.5 py-1.5 text-[12.5px] font-bold text-dm-blue transition-colors hover:border-dm-blue/60"
              >
                Agro e grãos
              </Link>
            </div>
          </div>
        </div>

        {/* máquina correspondente */}
        {shown && (
          <Link
            href={`/produtos/${shown.slug}`}
            onClick={onNavigate}
            className="group block overflow-hidden rounded-2xl border border-dm-line bg-dm-surface"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                key={shown.slug}
                src={shown.images[0]}
                alt={shown.name}
                loading="lazy"
                className="mega-img h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-dm-blue">
                {shown.tag ?? "Em destaque"}
              </p>
              <p className="mt-1.5 text-[15.5px] font-bold leading-snug text-dm-ink">{shown.name}</p>
              <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-dm-gray">
                {shown.summary}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
