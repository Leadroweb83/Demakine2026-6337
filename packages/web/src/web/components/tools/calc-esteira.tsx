import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Ruler } from "lucide-react";
import { materials, num, sizeConveyor, type MaterialKey } from "@/lib/engine";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Dimensionador: a partir de distância, altura e material,
 * indica o modelo da tabela real de fábrica.
 */
export function CalcEsteira({ dark = false }: { dark?: boolean }) {
  const [material, setMaterial] = useState<MaterialKey>("sacaria");
  const [distance, setDistance] = useState(6);
  const [height, setHeight] = useState(2.5);
  const [sanitary, setSanitary] = useState(false);

  const result = useMemo(
    () => sizeConveyor({ material, distance, height, sanitary }),
    [material, distance, height, sanitary],
  );

  const label = cn("text-[13px] font-bold uppercase tracking-wide", dark ? "text-white/55" : "text-dm-gray");
  const box = cn(
    "rounded-2xl border p-6 md:p-7",
    dark ? "border-white/12 bg-white/[0.05] backdrop-blur" : "border-dm-line bg-white shadow-sm",
  );

  const waMsg = result.model
    ? `Olá! Usei o dimensionador do site: ${result.product.name}, modelo ${result.model.model} (${num(result.needed, 1)} m, altura ${num(height, 1)} m). Quero um orçamento.`
    : `Olá! Usei o dimensionador do site e preciso de um projeto sob medida: ${result.product.name}, ${num(result.needed, 1)} m de comprimento e ${num(height, 1)} m de altura.`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
      {/* entradas */}
      <div className={box}>
        <div className="flex items-center gap-2">
          <Ruler className={cn("h-4 w-4", dark ? "text-white/60" : "text-dm-blue")} />
          <p className={label}>Sua operação</p>
        </div>

        <div className="mt-5">
          <label className={cn("block text-[14px] font-semibold", dark ? "text-white/80" : "text-dm-ink")}>
            O que você precisa transportar
          </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value as MaterialKey)}
            className={cn(
              "mt-2 w-full rounded-xl border px-4 py-3 text-[15px] outline-none",
              dark
                ? "border-white/15 bg-[#0d2a53] text-white focus:border-white/45"
                : "border-dm-line bg-white text-dm-ink focus:border-dm-blue",
            )}
          >
            {materials.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label} · {m.hint}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-6">
          <Slider
            dark={dark}
            label="Distância horizontal"
            value={distance}
            min={2}
            max={30}
            step={0.5}
            suffix=" m"
            onChange={setDistance}
          />
          <Slider
            dark={dark}
            label="Altura de descarga"
            value={height}
            min={0}
            max={12}
            step={0.1}
            suffix=" m"
            onChange={setHeight}
          />
        </div>

        <label
          className={cn(
            "mt-6 flex cursor-pointer items-center gap-3 text-[14.5px]",
            dark ? "text-white/75" : "text-dm-ink/80",
          )}
        >
          <input
            type="checkbox"
            checked={sanitary}
            onChange={(e) => setSanitary(e.target.checked)}
            className="h-4 w-4 accent-dm-red"
          />
          Preciso de versão inox / sanitária
        </label>
      </div>

      {/* resultado */}
      <div className={box}>
        <p className={label}>Indicação da engenharia</p>

        <h3
          className={cn(
            "cine-kicker mt-3 text-[26px] leading-tight md:text-[30px]",
            dark ? "text-white" : "text-dm-ink",
          )}
        >
          {result.product.name}
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Fact dark={dark} k="Comprimento necessário" v={`${num(result.needed, 1)} m`} />
          <Fact dark={dark} k="Inclinação" v={`${num(result.angle, 0)}°`} />
          <Fact
            dark={dark}
            k="Modelo indicado"
            v={result.model ? result.model.model : "Sob medida"}
            highlight
          />
          <Fact dark={dark} k="Motorização" v={result.model?.motor ?? "a definir"} />
          <Fact dark={dark} k="Correia / helicoide" v={result.model?.belt ?? "a definir"} />
          <Fact dark={dark} k="Capacidade" v={result.model?.capacity ?? "a definir"} />
        </div>

        {result.notes.length > 0 && (
          <ul className={cn("mt-5 space-y-2 text-[14px]", dark ? "text-white/65" : "text-dm-gray")}>
            {result.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-dm-red" />
                {n}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={waLink(waMsg)}
            target="_blank"
            rel="noreferrer"
            className="cine-shine inline-flex items-center justify-center gap-2 rounded-full bg-dm-green px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
          >
            Orçar este modelo
          </a>
          <Link
            href={`/produtos/${result.product.slug}`}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors",
              dark
                ? "border-white/25 text-white hover:border-white/60"
                : "border-dm-line text-dm-ink hover:border-dm-blue hover:text-dm-blue",
            )}
          >
            Ver ficha técnica
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className={cn("mt-4 text-[12.5px]", dark ? "text-white/40" : "text-dm-gray")}>
          Valores de referência das tabelas de fábrica. A confirmação final é feita pela nossa
          engenharia com os dados da sua linha.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

export function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
  dark = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
  dark?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className={cn("text-[14px] font-semibold", dark ? "text-white/80" : "text-dm-ink")}>
          {label}
        </label>
        <span
          className={cn(
            "cine-kicker tabnum text-[20px]",
            dark ? "text-white" : "text-dm-blue",
          )}
        >
          {num(value, step < 1 ? 1 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-dm-red"
      />
      <div
        className={cn(
          "mt-1 flex justify-between text-[11.5px]",
          dark ? "text-white/35" : "text-dm-gray/70",
        )}
      >
        <span>
          {num(min, 0)}
          {suffix}
        </span>
        <span>
          {num(max, 0)}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function Fact({
  k,
  v,
  dark = false,
  highlight = false,
}: {
  k: string;
  v: string;
  dark?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        dark ? "border-white/10 bg-white/[0.04]" : "border-dm-line bg-dm-surface",
        highlight && (dark ? "border-dm-red/60 bg-dm-red/10" : "border-dm-red/40 bg-dm-red/5"),
      )}
    >
      <p className={cn("text-[11.5px] uppercase tracking-wide", dark ? "text-white/45" : "text-dm-gray")}>
        {k}
      </p>
      <p
        className={cn(
          "mt-1 text-[16px] font-bold",
          dark ? "text-white" : "text-dm-ink",
          highlight && "text-dm-red",
        )}
      >
        {v}
      </p>
    </div>
  );
}
