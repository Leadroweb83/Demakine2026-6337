import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visualizador pseudo-360: percorre as fotos reais do equipamento conforme o
 * cursor atravessa a área da imagem (ou o dedo arrasta, no mobile). Não é um
 * scan 3D: é a sequência de fotos de fábrica dando sensação de giro.
 */
export function Spin360({
  images,
  alt,
  className,
  onIndexChange,
  index,
}: {
  images: string[];
  alt: string;
  className?: string;
  index?: number;
  onIndexChange?: (i: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);
  const [touched, setTouched] = useState(false);
  const auto = useRef<number | null>(null);

  const cur = index !== undefined ? Math.min(index, images.length - 1) : i;

  const set = (next: number) => {
    const n = ((next % images.length) + images.length) % images.length;
    setI(n);
    onIndexChange?.(n);
  };

  // as outras fotos só baixam depois que a página carregou (a primeira é a imagem principal, LCP);
  // o giro automático começa quando elas já estão no cache, para não piscar
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const warmUp = () => {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
      setWarm(true);
    };
    if (document.readyState === "complete") {
      const t = window.setTimeout(warmUp, 300);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("load", warmUp, { once: true });
    return () => window.removeEventListener("load", warmUp);
  }, [images]);

  // auto-spin lento enquanto ninguém interagiu, para mostrar que gira
  useEffect(() => {
    if (!warm || touched || images.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    auto.current = window.setInterval(() => {
      setI((v) => (v + 1) % images.length);
    }, 900);
    return () => {
      if (auto.current) window.clearInterval(auto.current);
    };
  }, [warm, touched, images.length]);

  const fromX = (clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    set(Math.round(pct * (images.length - 1)));
  };

  const engage = () => {
    setTouched(true);
    setWarm(true);
    if (auto.current) window.clearInterval(auto.current);
  };

  return (
    <div className={cn("min-w-0", className)}>
      <div
        ref={boxRef}
        className="relative touch-pan-y overflow-hidden rounded-2xl border border-dm-line bg-dm-surface select-none"
        onMouseEnter={() => {
          engage();
          setActive(true);
        }}
        onMouseLeave={() => setActive(false)}
        onMouseMove={(e) => fromX(e.clientX)}
        onTouchStart={(e) => {
          engage();
          setActive(true);
          fromX(e.touches[0].clientX);
        }}
        onTouchMove={(e) => fromX(e.touches[0].clientX)}
        onTouchEnd={() => setActive(false)}
      >
        {images.map((src, idx) => (
          <img
            key={src}
            // só a primeira foto baixa de início: as outras disputariam a conexão com ela (LCP)
            src={idx === 0 || warm ? src : undefined}
            fetchPriority={idx === 0 ? "high" : "low"}
            alt={idx === 0 ? alt : ""}
            className={cn(
              "aspect-[4/3] w-full object-cover transition-opacity duration-100",
              idx === cur ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
            )}
          />
        ))}

        <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-dm-ink/80 px-3 py-1.5 text-[11.5px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
          <RotateCcw className={cn("h-3.5 w-3.5", !touched && "spin-hint")} />
          360°
        </span>

        <span
          className={cn(
            "pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3.5 py-1.5 text-[12.5px] font-semibold text-dm-ink shadow-sm transition-opacity",
            active ? "opacity-0" : "opacity-100",
          )}
        >
          <span className="hidden sm:inline">Passe o mouse para girar</span>
          <span className="sm:hidden">Arraste para girar</span>
        </span>

        {/* trilha de posição */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-dm-ink/10">
          <div
            className="h-full bg-dm-red transition-[width] duration-100"
            style={{ width: `${((cur + 1) / images.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
