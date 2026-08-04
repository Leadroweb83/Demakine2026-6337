import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { materials, sizeConveyor, type MaterialKey } from "@/lib/engine";

const distances = [
  { value: 5, label: "até 5 m" },
  { value: 8, label: "5 a 10 m" },
  { value: 14, label: "10 a 15 m" },
  { value: 22, label: "mais de 15 m" },
];

const heights = [
  { value: 1.2, label: "no piso" },
  { value: 3, label: "até 3 m" },
  { value: 5.5, label: "3 a 6 m" },
  { value: 9, label: "mais de 6 m" },
];

/**
 * Atalho de qualificação dentro do hero: 3 escolhas e o visitante
 * já cai na ficha do equipamento certo.
 */
export function QuickSelector() {
  const [, navigate] = useLocation();
  const [material, setMaterial] = useState<MaterialKey>("sacaria");
  const [distance, setDistance] = useState(8);
  const [height, setHeight] = useState(3);

  const select =
    "w-full rounded-xl border border-white/15 bg-[#0d2a53]/90 px-3.5 py-3 text-[14.5px] text-white outline-none transition-colors focus:border-white/50";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const r = sizeConveyor({ material, distance, height });
        navigate(`/produtos/${r.product.slug}`);
      }}
      className="rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur md:p-5"
    >
      <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/55">
        Descubra em 5 segundos qual máquina resolve
      </p>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
        <div>
        <label className="mb-1.5 block text-[12.5px] text-white/60" htmlFor="qs-material">
          O que você movimenta
        </label>
        <select
          id="qs-material"
          value={material}
          onChange={(e) => setMaterial(e.target.value as MaterialKey)}
          className={select}
        >
          {materials.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>

        </div>

        <div>
        <label className="mb-1.5 block text-[12.5px] text-white/60" htmlFor="qs-dist">
          Distância a vencer
        </label>
        <select
          id="qs-dist"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className={select}
        >
          {distances.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        </div>

        <div>
        <label className="mb-1.5 block text-[12.5px] text-white/60" htmlFor="qs-height">
          Altura de descarga
        </label>
        <select
          id="qs-height"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className={select}
        >
          {heights.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>

        </div>

        <button
          type="submit"
          className="cine-shine inline-flex items-center justify-center gap-2 self-end rounded-xl bg-dm-red px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017]"
        >
          Ver máquina
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
