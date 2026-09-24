import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { segmentList } from "@/lib/segments";
import { cn } from "@/lib/utils";

/**
 * Segmentos atendidos: chips com ícone e cor própria de cada segmento navegam o
 * carrossel, e cada card aponta para o equipamento real que indicamos.
 */
export function SegmentsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const go = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    const card = cardRefs.current[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - 8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* chips: um por segmento, com a cor padrão do segmento */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {segmentList.map((s, i) => {
          const Icon = s.icon;
          const on = i === active;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver equipamento indicado para ${s.name}`}
              className={cn(
                "seg-chip group flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left transition-all duration-300",
                on
                  ? "border-transparent shadow-[0_10px_26px_rgba(17,19,24,0.1)]"
                  : "border-dm-line hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(17,19,24,0.07)]",
              )}
              style={{
                borderColor: on ? s.color : undefined,
                boxShadow: on ? `inset 0 0 0 1px ${s.color}` : undefined,
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{
                  backgroundColor: on ? s.color : `${s.color}14`,
                  color: on ? "#fff" : s.color,
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span
                className="min-w-0 text-[13px] font-bold leading-tight"
                style={{ color: on ? s.color : undefined }}
              >
                {s.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 mb-5 flex items-center justify-between gap-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dm-gray">
          {String(active + 1).padStart(2, "0")} / {segmentList.length} ·{" "}
          <span style={{ color: segmentList[active]?.color }}>{segmentList[active]?.name}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Segmento anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dm-line bg-white text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próximo segmento"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dm-line bg-white text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="seg-track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
      >
        {segmentList.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.slug}
              href={`/produtos/${c.productSlug}`}
              ref={(el: HTMLAnchorElement | null) => {
                cardRefs.current[i] = el;
              }}
              className="group w-[268px] shrink-0 snap-start overflow-hidden rounded-2xl border border-dm-line bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(17,19,24,0.14)] sm:w-[300px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-dm-surface">
                <img
                  src={`/img/produtos/${c.productSlug}/1.webp`}
                  alt={`${c.name}: ${c.product} Demakine`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white"
                  style={{ backgroundColor: c.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c.name}
                </span>
                <span
                  className="absolute inset-x-0 bottom-0 h-1"
                  style={{ backgroundColor: c.color }}
                />
              </div>
              <div className="p-5">
                <p className="text-[14.5px] leading-relaxed text-dm-gray">{c.text}</p>
                <p
                  className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold"
                  style={{ color: c.color }}
                >
                  {c.product}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
