import { useEffect, useMemo, useRef, useState } from "react";
import mapRaw from "../../data/br-map.json";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Counter } from "../counter";

type MapData = {
  w: number;
  h: number;
  states: Record<string, { name: string; d: string; c: [number, number] }>;
};

const map = mapRaw as unknown as MapData;

/** Agrega os depoimentos reais por UF (a cidade vem no formato "Cidade/UF"). */
function useByState() {
  return useMemo(() => {
    const acc: Record<string, { count: number; names: string[] }> = {};
    for (const t of testimonials) {
      const uf = t.city.split("/")[1]?.trim().toUpperCase();
      if (!uf || !map.states[uf]) continue;
      acc[uf] ??= { count: 0, names: [] };
      acc[uf].count += 1;
      acc[uf].names.push(`${t.company || t.name} · ${t.city}`);
    }
    return acc;
  }, []);
}

export function BrazilMap({ dark = true }: { dark?: boolean }) {
  const byState = useByState();
  const [active, setActive] = useState<string | null>("SP");

  const maxCount = Math.max(1, ...Object.values(byState).map((v) => v.count));

  const fillFor = (uf: string) => {
    const data = byState[uf];
    if (!data) return dark ? "rgba(255,255,255,0.06)" : "#eef1f6";
    const t = data.count / maxCount;
    const alpha = 0.28 + t * 0.62;
    return dark ? `rgba(69,131,232,${alpha})` : `rgba(16,61,148,${alpha})`;
  };

  const activeData = active ? byState[active] : undefined;

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
              className={cn("uf-path", byState[uf] && "has-data")}
              fill={active === uf && byState[uf] ? "#e4141b" : fillFor(uf)}
              stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(16,61,148,0.25)"}
              strokeWidth={1.6}
              onMouseEnter={() => byState[uf] && setActive(uf)}
              onFocus={() => byState[uf] && setActive(uf)}
              onClick={() => byState[uf] && setActive(uf)}
              tabIndex={byState[uf] ? 0 : -1}
            >
              <title>{`${s.name}${byState[uf] ? `: ${byState[uf].count} cliente(s)` : ""}`}</title>
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
                        ? // estado sem depoimento público: linha mais discreta, para o mapa não virar um emaranhado
                          `rgba(255,255,255,${byState[r.uf] ? 0.45 : 0.24})`
                        : `rgba(16,61,148,${byState[r.uf] ? 0.4 : 0.22})`
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

          {Object.entries(byState).map(([uf]) => {
            const s = map.states[uf];
            return (
              <text
                key={`t-${uf}`}
                x={s.c[0]}
                y={s.c[1] + 5}
                textAnchor="middle"
                fontSize={20}
                fontFamily="Anton, sans-serif"
                fill={dark ? "#fff" : "#0a1f3d"}
                opacity={0.85}
                pointerEvents="none"
              >
                {uf}
              </text>
            );
          })}

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

        <div
          className={cn(
            "mt-4 min-h-[170px] rounded-xl border p-5",
            dark ? "border-white/10 bg-white/[0.04]" : "border-dm-line bg-white",
          )}
        >
          {activeData && active ? (
            <>
              <p className={cn("cine-kicker text-[22px]", dark ? "text-white" : "text-dm-ink")}>
                {map.states[active].name}
              </p>
              <ul className={cn("mt-3 space-y-1.5 text-[14px]", dark ? "text-white/70" : "text-dm-gray")}>
                {activeData.names.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-dm-red" />
                    {n}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={cn("text-[14.5px]", dark ? "text-white/60" : "text-dm-gray")}>
              Passe o mouse nos estados destacados para ver quem já opera com equipamentos Demakine.
            </p>
          )}
        </div>

        <p className={cn("mt-3 text-[12.5px]", dark ? "text-white/40" : "text-dm-gray/85")}>
          O mapa mostra apenas os clientes que autorizaram depoimento público. A entrega é feita em
          todo o território nacional.
        </p>
      </div>
    </div>
  );
}

/** alturas das barras (decorativas): só o desenho de crescimento, não são dados por ano */
const BARS = [22, 30, 38, 49, 58, 70, 84, 100];

/** "+ de 2 mil clientes atendidos": número contando e barras subindo quando a caixa entra na tela. */
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
          <Counter to={2000} prefix="+" />
        </p>
        <p className={cn("mt-2 text-[12.5px] uppercase tracking-[0.14em]", dark ? "text-white/55" : "text-dm-gray")}>
          clientes atendidos
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
