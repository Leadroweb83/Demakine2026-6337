import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Ruler } from "lucide-react";
import { materials, maxAngleFor, num, sizeConveyor, type MaterialKey } from "@/lib/engine";
import { quoteHref } from "@/lib/site";
import { Fact, Slider } from "./calc-esteira";
import { tr } from "@/lib/i18n";

/**
 * Dimensionador do topo da home: material e altura de descarga numa caixa só, com a indicação
 * do modelo logo abaixo. Sem a distância: sai o menor modelo da tabela que alcança a altura.
 */
export function HeroCalc() {
  const [material, setMaterial] = useState<MaterialKey>("sacaria");
  const [height, setHeight] = useState(2.5);
  const [sanitary, setSanitary] = useState(false);
  const flat = maxAngleFor(material) === 0;

  const result = useMemo(() => sizeConveyor({ material, height, sanitary }), [material, height, sanitary]);

  const waMsg = result.model
    ? tr("Olá! Usei o dimensionador do site: {produto}, modelo {modelo} (altura de descarga {altura} m). Quero um orçamento.", { produto: tr(result.product.name), modelo: result.model.model, altura: num(flat ? 0 : height, 1) })
    : tr("Olá! Usei o dimensionador do site e preciso de um projeto sob medida: {produto}, altura de descarga {altura} m.", { produto: tr(result.product.name), altura: num(flat ? 0 : height, 1) });

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur md:p-6">
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-white/60" />
        <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/55">Sua operação</p>
      </div>

      <label className="mt-4 block text-[14px] font-semibold text-white/80" htmlFor="hc-material">
        O que você precisa transportar
      </label>
      <select
        id="hc-material"
        value={material}
        onChange={(e) => setMaterial(e.target.value as MaterialKey)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d2a53] px-3.5 py-3 text-[14.5px] text-white outline-none transition-colors focus:border-white/50"
      >
        {materials.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label} · {m.hint}
          </option>
        ))}
      </select>

      {/* esteira de triagem é horizontal: altura de descarga não se aplica */}
      {flat ? (
        <p className="mt-5 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[14px] text-white/75">
          Esteira de triagem trabalha na horizontal.
        </p>
      ) : (
        <div className="mt-5">
          <Slider dark label="Altura de descarga" value={height} min={0} max={12} step={0.1} suffix=" m" onChange={setHeight} />
        </div>
      )}

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px] text-white/75">
        <input
          type="checkbox"
          checked={sanitary}
          onChange={(e) => setSanitary(e.target.checked)}
          className="h-4 w-4 accent-dm-red"
        />
        Preciso de versão inox / sanitária
      </label>

      <div className="mt-5 border-t border-white/12 pt-5" aria-live="polite">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/55">Indicação da engenharia</p>
        <p className="cine-kicker mt-2 text-[22px] leading-tight text-white md:text-[24px]">{result.product.name}</p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Fact dark k="Modelo indicado" v={result.model ? result.model.model : "Sob medida"} highlight />
          {/* sem modelo de tabela (sob medida), comprimento e inclinação saem do projeto, não de conta */}
          <Fact dark k="Comprimento" v={result.model ? `${num(result.needed, 1)} m` : "a definir"} />
          <Fact dark k="Inclinação" v={flat ? tr("0° (horizontal)") : result.model ? `${num(result.angle, 0)}°` : "a definir"} />
          <Fact dark k="Motorização" v={result.model?.motor ?? "a definir"} />
          <Fact dark k="Correia / helicoide" v={result.model?.belt ?? "a definir"} />
          <Fact dark k="Capacidade" v={result.model?.capacity ?? "a definir"} />
        </div>

        {result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-[13.5px] text-white/65">
            {result.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-dm-red" />
                {n}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href={quoteHref({ produto: result.product.name, mensagem: waMsg })}
            className="cine-shine inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-dm-red px-5 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-red-dark"
          >
            Orçar este modelo
          </Link>
          <Link
            href={`/produtos/${result.product.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:border-white/60"
          >
            Ver ficha técnica
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
