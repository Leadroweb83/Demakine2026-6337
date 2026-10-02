import { useEffect, useMemo, useRef, useState } from "react";
import mapRaw from "../../data/br-map.json";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Counter } from "../counter";

type MapData = {
  w: number;
  h: number;
  states: Record<string, { name: string; d: string; c: [number, number] }>;
};

const map = mapRaw as unknown as MapData;

/**
 * Foto por região (public/img/estados): imagens ilustrativas geradas por IA a partir das fotos reais
 * dos equipamentos. Os estados da mesma região mostram a mesma foto.
 */
type Region = "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul";

const REGIONS: Record<Region, { label: string; ufs: string[] }> = {
  norte: { label: "Região Norte", ufs: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"] },
  nordeste: { label: "Região Nordeste", ufs: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"] },
  "centro-oeste": { label: "Região Centro-Oeste", ufs: ["DF", "GO", "MS", "MT"] },
  sudeste: { label: "Região Sudeste", ufs: ["ES", "MG", "RJ", "SP"] },
  sul: { label: "Região Sul", ufs: ["PR", "RS", "SC"] },
};

const regionOf = (uf: string): Region =>
  (Object.keys(REGIONS) as Region[]).find((r) => REGIONS[r].ufs.includes(uf)) ?? "sudeste";

/** estados pequenos no desenho: sigla menor para não encavalar */
const SMALL = new Set(["DF", "SE", "AL", "PB", "RN", "PE", "ES", "RJ"]);

export function BrazilMap({ dark = true }: { dark?: boolean }) {
  const [active, setActive] = useState<string>("SP");

  const fill = dark ? "rgba(69,131,232,0.62)" : "rgba(16,61,148,0.6)";

  /** Origem: fábrica em Limeira/SP. */
  const origin: [number, number] = [map.states.SP.c[0] - 6, map.states.SP.c[1] - 26];

  /** Curvas da fábrica até todos os estados (a entrega é nacional), com tempos variados. */
  const routes = useMemo(() => {
    return Object.keys(map.states)
      .filter((uf) => uf !== "SP")
      .map((uf, i) => {
        const s = map.states[uf];
        const [ox, oy] = origin;
        const [tx, ty] = s.c;
        const mx = (ox + tx) / 2;
        const my = (oy + ty) / 2;
        const dx = tx - ox;
        const dy = ty - oy;
        const len = Math.hypot(dx, dy) || 1;
        // desloca o ponto de controle na perpendicular para virar arco
        const bow = Math.min(90, len * 0.24);
        const cx = mx + (-dy / len) * bow;
        const cy = my + (dx / len) * bow;
        return {
          uf,
          d: `M ${ox} ${oy} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${tx} ${ty}`,
          dur: +(2.4 + (len / 900) * 3.4).toFixed(2),
          begin: +((i % 7) * 0.55).toFixed(2),
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = map.states[active];
  const region = regionOf(active);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
      <div className="relative mx-auto w-full max-w-[420px]">
        <svg
          viewBox={`0 0 ${map.w} ${map.h}`}
          className="w-full"
          role="img"
          aria-label="Mapa do Brasil: entregas saindo da fábrica em Limeira/SP para todos os estados"
        >
          {Object.entries(map.states).map(([uf, s]) => (
            <path
              key={uf}
              d={s.d}
              className="uf-path has-data"
              fill={active === uf ? "#e4141b" : fill}
              stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(16,61,148,0.25)"}
              strokeWidth={1.6}
              onMouseEnter={() => setActive(uf)}
              onFocus={() => setActive(uf)}
              onClick={() => setActive(uf)}
              tabIndex={0}
            >
              <title>{s.name}</title>
            </path>
          ))}

          {/* rotas de logística saindo da fábrica em Limeira/SP */}
          <g pointerEvents="none">
            {routes.map((r, i) => (
              <g key={`route-${r.uf}`}>
                <path
                  id={`dm-route-${r.uf}`}
                  d={r.d}
                  fill="none"
                  stroke={
                    active === r.uf
                      ? "rgba(228,20,27,0.9)"
                      : dark
                        ? "rgba(255,255,255,0.38)"
                        : "rgba(16,61,148,0.35)"
                  }
                  strokeWidth={active === r.uf ? 2 : 1.5}
                  strokeLinecap="round"
                  className="route-line"
                  style={{ animationDelay: `${(i % 6) * 0.22}s` }}
                />
                <circle r={4.2} fill="#ff3b42" opacity={0.95} stroke="#fff" strokeWidth={1}>
                  <animateMotion
                    dur={`${r.dur}s`}
                    begin={`${r.begin}s`}
                    repeatCount="indefinite"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#dm-route-${r.uf}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.85;1"
                    dur={`${r.dur}s`}
                    begin={`${r.begin}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}
          </g>

          {Object.entries(map.states).map(([uf, s]) => (
            <text
              key={`t-${uf}`}
              x={s.c[0]}
              y={s.c[1] + 5}
              textAnchor="middle"
              fontSize={SMALL.has(uf) ? 13 : 20}
              fontFamily="Anton, sans-serif"
              fill={dark ? "#fff" : "#0a1f3d"}
              opacity={0.85}
              pointerEvents="none"
            >
              {uf}
            </text>
          ))}

          {/* fábrica em Limeira/SP */}
          <g pointerEvents="none">
            <circle cx={origin[0]} cy={origin[1]} r={9} className="dm-hub-pulse" fill="#e4141b" />
            <circle
              cx={origin[0]}
              cy={origin[1]}
              r={9}
              className="dm-hub-pulse dm-hub-pulse--2"
              fill="#e4141b"
            />
            <circle
              cx={origin[0]}
              cy={origin[1]}
              r={9}
              fill="#e4141b"
              stroke="#fff"
              strokeWidth={3}
            />
          </g>
        </svg>
        <p className={cn("mt-2 text-center text-[12px]", dark ? "text-white/40" : "text-dm-gray")}>
          ● Fábrica em Limeira/SP
        </p>
      </div>

      <div>
        <GrowthStat dark={dark} />

        <figure
          className={cn(
            "relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border",
            dark ? "border-white/10 bg-white/[0.04]" : "border-dm-line bg-dm-surface",
          )}
        >
          <img
            key={region}
            src={`/img/estados/${region}.webp`}
            alt={`Equipe trabalhando com uma esteira Demakine na ${REGIONS[region].label} (imagem ilustrativa)`}
            width={1120}
            height={844}
            loading="lazy"
            className="state-photo h-full w-full object-cover"
          />
          <figcaption
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08192f]/90 to-transparent px-5 pb-4 pt-12"
            aria-live="polite"
          >
            <span className="cine-kicker block text-[22px] leading-tight text-white">{state.name}</span>
            <span className="mt-1 block text-[13px] text-white/75">
              {REGIONS[region].label} · imagem ilustrativa
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/** alturas das barras (decorativas): só o desenho de crescimento, não são dados por ano */
const BARS = [22, 30, 38, 49, 58, 70, 84, 100];

/** Clientes atendidos (o mesmo número do topo da home): número contando e barras subindo quando a caixa entra na tela. */
function GrowthStat({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-end justify-between gap-5 rounded-xl border px-5 py-5",
        dark ? "border-white/10 bg-white/[0.04]" : "border-dm-line bg-dm-surface",
      )}
    >
      <div>
        <p className={cn("cine-kicker tabnum text-[40px] leading-none md:text-[46px]", dark ? "text-white" : "text-dm-ink")}>
          <Counter to={site.stats.clients / 1000} prefix="+ de " suffix=" mil" />
        </p>
        <p className={cn("mt-2 text-[12.5px] uppercase tracking-[0.14em]", dark ? "text-white/55" : "text-dm-gray")}>
          clientes atendidos no Brasil
        </p>
      </div>
      <div className="flex h-[72px] items-end gap-[5px]" aria-hidden="true">
        {BARS.map((h, i) => (
          <span
            key={h}
            className={cn("growth-bar w-[9px] rounded-t-[3px]", seen && "is-in", i === BARS.length - 1 ? "bg-dm-red" : dark ? "bg-white/35" : "bg-dm-blue/45")}
            style={{ height: `${h}%`, transitionDelay: `${i * 110}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
