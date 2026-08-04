import { useCallback, useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type CompareSide = {
  image: string;
  label: string;
  caption: string;
};

/**
 * Slider arrastável entre duas fotos reais de projetos executados.
 * Não é "antes x depois" fictício: são duas configurações diferentes
 * do mesmo tipo de equipamento, para o visitante entender a escolha.
 */
export function CompareSlider({
  left,
  right,
  className,
}: {
  left: CompareSide;
  right: CompareSide;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(98, Math.max(2, p)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      move(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [move]);

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        className="relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-dm-line bg-dm-surface"
        onPointerDown={(e) => {
          dragging.current = true;
          move(e.clientX);
        }}
      >
        <img
          src={right.image}
          alt={right.label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <img
          src={left.image}
          alt={left.label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />

        {/* etiquetas */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-dm-blue-deep/85 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {left.label}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-dm-red/90 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {right.label}
        </span>

        {/* divisor */}
        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-white/90"
          style={{ left: `${pos}%` }}
        >
          <span
            className={cn(
              "compare-handle absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-dm-blue",
            )}
          >
            <MoveHorizontal className="h-5 w-5" />
          </span>
        </div>

        {/* acessibilidade: controle por teclado */}
        <input
          type="range"
          min={2}
          max={98}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Comparar ${left.label} com ${right.label}`}
          className="absolute bottom-3 left-1/2 h-1 w-2/3 -translate-x-1/2 cursor-ew-resize appearance-none rounded-full bg-white/35 opacity-0 focus-visible:opacity-100"
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-dm-line bg-white p-4">
          <p className="text-[13px] font-bold uppercase tracking-wide text-dm-blue">{left.label}</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-dm-gray">{left.caption}</p>
        </div>
        <div className="rounded-xl border border-dm-line bg-white p-4">
          <p className="text-[13px] font-bold uppercase tracking-wide text-dm-red">{right.label}</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-dm-gray">{right.caption}</p>
        </div>
      </div>
    </div>
  );
}
