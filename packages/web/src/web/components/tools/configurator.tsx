import { useMemo, useState } from "react";
import { Link } from "wouter";
import { configure, num } from "@/lib/engine";
import { Fact, Slider } from "./calc-esteira";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type Family = "sacaria" | "granel" | "caixas" | "reciclagem";

const families: { key: Family; label: string; belt: string }[] = [
  { key: "sacaria", label: "Sacaria", belt: "Correia taliscada" },
  { key: "granel", label: "Granel", belt: "Correia em V / calha" },
  { key: "caixas", label: "Caixas", belt: "Correia lisa" },
  { key: "reciclagem", label: "Reciclagem", belt: "Correia lisa 1 m" },
];

/**
 * Configurador visual: os sliders redesenham a esteira em SVG em tempo real
 * e a indicação de modelo vem da tabela real do produto.
 */
export function Configurator({ dark = true }: { dark?: boolean }) {
  const [length, setLength] = useState(8);
  const [angle, setAngle] = useState(22);
  const [family, setFamily] = useState<Family>("sacaria");
  const [wheels, setWheels] = useState(true);

  const cfg = useMemo(() => configure({ length, angle, family }), [length, angle, family]);

  // ---- geometria do desenho ----------------------------------------------
  const W = 900;
  const H = 380;
  const pxPerM = 30; // escala do desenho
  const baseY = H - 62;
  const x0 = 70;
  const rad = (angle * Math.PI) / 180;
  const beltLen = length * pxPerM;
  const x1 = x0 + Math.cos(rad) * beltLen;
  const y1 = baseY - Math.sin(rad) * beltLen;
  // escala de encaixe: o desenho cresce até preencher a área útil do card
  const fitW = (W - 340) / Math.max(1, x1 - x0);
  const fitH = (H - 170) / Math.max(1, baseY - y1);
  const scale = Math.max(0.5, Math.min(fitW, fitH, 2.2));
  /** texto do desenho não deve crescer junto com a escala */
  const fs = 17 / scale;
  /** deslocamentos das cotas compensados pela escala do grupo */
  const off = (v: number) => v / scale;
  const beltId = "belt-path";

  const box = cn(
    "rounded-2xl border p-5 md:p-6",
    dark ? "border-white/12 bg-white/[0.05] backdrop-blur" : "border-dm-line bg-white shadow-sm",
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
      {/* desenho */}
      <div className={cn(box, "flex flex-col")}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="my-auto w-full"
          role="img"
          aria-label={`Esteira de ${num(length, 1)} metros com ${num(angle, 0)} graus de inclinação`}
        >
          <defs>
            <linearGradient id="cfg-frame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f6fd8" />
              <stop offset="100%" stopColor="#103d94" />
            </linearGradient>
            <linearGradient id="cfg-floor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={dark ? "#ffffff" : "#111318"} stopOpacity="0" />
              <stop offset="35%" stopColor={dark ? "#ffffff" : "#111318"} stopOpacity="0.28" />
              <stop offset="100%" stopColor={dark ? "#ffffff" : "#111318"} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* piso */}
          <rect x={0} y={baseY + 22} width={W} height={2} fill="url(#cfg-floor)" />

          <g
            transform={`translate(${x0} ${baseY}) scale(${scale}) translate(${-x0} ${-baseY})`}
          >
            {/* cota de altura */}
            <g stroke={dark ? "rgba(255,255,255,.35)" : "rgba(17,19,24,.3)"} strokeWidth={1}>
              <line x1={x1 + off(34)} y1={y1} x2={x1 + off(34)} y2={baseY} strokeDasharray="5 5" />
              <line x1={x1} y1={y1} x2={x1 + off(40)} y2={y1} strokeDasharray="5 5" />
            </g>
            <text
              x={x1 + off(42)}
              y={(y1 + baseY) / 2}
              fill={dark ? "#fff" : "#111318"}
              fontSize={fs}
              fontFamily="Anton, sans-serif"
            >
              {num(cfg.discharge, 1)} m
            </text>

            {/* cota de comprimento */}
            <line
              x1={x0}
              y1={baseY + off(34)}
              x2={x1}
              y2={baseY + off(34)}
              stroke={dark ? "rgba(255,255,255,.35)" : "rgba(17,19,24,.3)"}
              strokeWidth={1}
              strokeDasharray="5 5"
            />
            <text
              x={(x0 + x1) / 2}
              y={baseY + off(52)}
              textAnchor="middle"
              fill={dark ? "#fff" : "#111318"}
              fontSize={fs}
              fontFamily="Anton, sans-serif"
            >
              {num(length, 1)} m
            </text>

            {/* chassi inferior */}
            <line
              x1={x0}
              y1={baseY}
              x2={x1}
              y2={y1}
              stroke="url(#cfg-frame)"
              strokeWidth={16}
              strokeLinecap="round"
            />
            {/* correia */}
            <path
              id={beltId}
              d={`M ${x0} ${baseY - 14} L ${x1} ${y1 - 14}`}
              fill="none"
              stroke="#14181f"
              strokeWidth={13}
              strokeLinecap="round"
            />
            <path
              d={`M ${x0} ${baseY - 14} L ${x1} ${y1 - 14}`}
              fill="none"
              stroke={family === "granel" ? "#7ea6ea" : "#93a2b8"}
              strokeWidth={3}
              className="belt-run"
            />

            {/* volume andando na correia */}
            {[0, 1, 2].map((k) => (
              <rect
                key={k}
                width={family === "caixas" ? 26 : 30}
                height={family === "caixas" ? 20 : 14}
                rx={family === "caixas" ? 3 : 7}
                fill={family === "granel" ? "#c8a26a" : family === "caixas" ? "#cfa06a" : "#e8e2d4"}
                stroke="rgba(0,0,0,.35)"
                className="sack-move"
                style={{
                  offsetPath: `path("M ${x0} ${baseY - 30} L ${x1} ${y1 - 30}")`,
                  offsetRotate: `${-angle}deg`,
                  animationDelay: `${k * 0.95}s`,
                }}
              />
            ))}

            {/* estrutura de apoio */}
            <line
              x1={x0 + (x1 - x0) * 0.62}
              y1={baseY - Math.sin(rad) * beltLen * 0.62}
              x2={x0 + (x1 - x0) * 0.62}
              y2={baseY}
              stroke="url(#cfg-frame)"
              strokeWidth={9}
            />
            <line
              x1={x0 + (x1 - x0) * 0.62}
              y1={baseY}
              x2={x0 + (x1 - x0) * 0.44}
              y2={baseY}
              stroke="url(#cfg-frame)"
              strokeWidth={7}
            />

            {/* tambores */}
            <circle cx={x0} cy={baseY - 14} r={13} fill="#0e1218" stroke="#2f6fd8" strokeWidth={3} />
            <circle cx={x1} cy={y1 - 14} r={13} fill="#0e1218" stroke="#2f6fd8" strokeWidth={3} />

            {/* motoredutor */}
            <rect x={x1 - 6} y={y1 - 44} width={30} height={22} rx={4} fill="#e4141b" />

            {/* rodas */}
            {wheels && (
              <>
                <g className="wheel-spin">
                  <circle cx={x0 + (x1 - x0) * 0.62} cy={baseY + 12} r={16} fill="#14181f" />
                  <circle
                    cx={x0 + (x1 - x0) * 0.62}
                    cy={baseY + 12}
                    r={6}
                    fill="none"
                    stroke="#6b7686"
                    strokeWidth={3}
                  />
                </g>
                <g className="wheel-spin">
                  <circle cx={x0 + 14} cy={baseY + 10} r={11} fill="#14181f" />
                  <circle cx={x0 + 14} cy={baseY + 10} r={4} fill="none" stroke="#6b7686" strokeWidth={2} />
                </g>
              </>
            )}
          </g>
        </svg>

        <p className={cn("mt-1 text-[12.5px]", dark ? "text-white/40" : "text-dm-gray")}>
          Desenho esquemático em escala aproximada, só para você visualizar o encaixe no layout.
        </p>
      </div>

      {/* controles */}
      <div className={box}>
        <div className="flex flex-wrap gap-2">
          {families.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFamily(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-bold uppercase tracking-wide transition-colors",
                family === f.key
                  ? "border-dm-red bg-dm-red text-white"
                  : dark
                    ? "border-white/20 text-white/70 hover:border-white/50"
                    : "border-dm-line text-dm-ink/70 hover:border-dm-blue",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-6">
          <Slider
            dark={dark}
            label="Comprimento"
            value={length}
            min={3}
            max={25}
            step={0.5}
            suffix=" m"
            onChange={setLength}
          />
          <Slider
            dark={dark}
            label="Inclinação"
            value={angle}
            min={0}
            max={40}
            step={1}
            suffix="°"
            onChange={setAngle}
          />
        </div>

        <label
          className={cn(
            "mt-5 flex cursor-pointer items-center gap-3 text-[14.5px]",
            dark ? "text-white/75" : "text-dm-ink/80",
          )}
        >
          <input
            type="checkbox"
            checked={wheels}
            onChange={(e) => setWheels(e.target.checked)}
            className="h-4 w-4 accent-dm-red"
          />
          Com rodas e pneus para deslocar no pátio
        </label>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Fact
            dark={dark}
            k="Modelo"
            v={cfg.model && !cfg.custom ? cfg.model.model : "Sob medida"}
            highlight
          />
          <Fact dark={dark} k="Altura de descarga" v={`${num(cfg.discharge, 1)} m`} />
          <Fact dark={dark} k="Motorização" v={cfg.model?.motor ?? "a definir"} />
          <Fact
            dark={dark}
            k="Correia"
            v={families.find((f) => f.key === family)?.belt ?? "-"}
          />
        </div>

        {cfg.custom && (
          <p className={cn("mt-4 text-[13.5px]", dark ? "text-white/60" : "text-dm-gray")}>
            {cfg.overHeight
              ? "Nessa inclinação a altura passa do limite do modelo padrão, por isso fabricamos reforçado sob medida."
              : `A linha padrão vai até ${num(cfg.maxLen, 0)} m; acima disso fabricamos em módulos ou sob medida.`}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={waLink(
              `Olá! Configurei no site: ${cfg.product.name}, ${num(length, 1)} m, ${num(angle, 0)}° de inclinação, descarga a ${num(cfg.discharge, 1)} m${wheels ? ", com rodas" : ""}. Quero um orçamento.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="cine-shine inline-flex items-center justify-center rounded-full bg-dm-green px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
          >
            Orçar esta configuração
          </a>
          <Link
            href={`/produtos/${cfg.product.slug}`}
            className={cn(
              "inline-flex items-center justify-center rounded-full border px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors",
              dark
                ? "border-white/25 text-white hover:border-white/60"
                : "border-dm-line text-dm-ink hover:border-dm-blue hover:text-dm-blue",
            )}
          >
            {cfg.product.name.split(" ").slice(0, 3).join(" ")}
          </Link>
        </div>
      </div>
    </div>
  );
}
