import { useEffect, useMemo, useRef, useState } from "react";
import mapRaw from "../../data/br-map.json";
import { STATE_CLIENTS } from "../../data/state-clients";
import { site } from "@/lib/site";
import { clients, testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Counter } from "../counter";
import { tr } from "@/lib/i18n";

type MapData = {
  w: number;
  h: number;
  states: Record<string, { name: string; d: string; c: [number, number] }>;
};

const map = mapRaw as unknown as MapData;

/** depoimento sem empresa de verdade: aparece como tipo de cliente, não como nome */
const GENERIC = /^(aut[oô]nomo|produtor rural)$/i;
const norm = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

type StateClient = { key: string; name: string; logo?: string; city?: string };

/** máximo de clientes mostrados por estado */
const PER_STATE = 5;

/**
 * Clientes por estado, só com dado real: primeiro os logos da lista de clientes que têm o estado
 * preenchido (painel > Clientes e depoimentos), depois as empresas da planilha de pedidos
 * (data/state-clients.ts) e as que publicaram depoimento. No máximo 5 por estado.
 */
function clientsByState(): Map<string, StateClient[]> {
  const out = new Map<string, StateClient[]>();
  const add = (uf: string, c: StateClient) => {
    const list = out.get(uf) ?? [];
    if (list.length >= PER_STATE) return;
    if (!list.some((x) => norm(x.name) === norm(c.name) || (c.name.length > 4 && (norm(x.name).includes(norm(c.name)) || norm(c.name).includes(norm(x.name)))))) list.push(c);
    out.set(uf, list);
  };
  for (const c of clients) if (c.state) add(c.state.toUpperCase(), { key: `l-${c.id}`, name: c.name, logo: c.logo });
  for (const [uf, list] of Object.entries(STATE_CLIENTS)) for (const c of list) add(uf, { key: `p-${uf}-${c.name}`, name: c.name, city: c.city });
  for (const t of testimonials) {
    const uf = t.city.match(/\/\s*([A-Za-z]{2})\s*$/)?.[1]?.toUpperCase();
    if (!uf || !t.company.trim()) continue;
    const city = t.city.replace(/\s*\/\s*[A-Za-z]{2}\s*$/, "").trim();
    add(uf, { key: `t-${t.company}-${city}`, name: t.company, city });
  }
  return out;
}

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
  const byUf = useMemo(clientsByState, []);
  const here = byUf.get(active) ?? [];
  const logos = here.filter((c) => c.logo);
  const names = here.filter((c) => !c.logo);

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

        <div
          className={cn(
            "mt-4 rounded-xl border p-5",
            dark ? "border-white/10 bg-white/[0.04]" : "border-dm-line bg-dm-surface",
          )}
          aria-live="polite"
        >
          <p className={cn("cine-kicker text-[22px] leading-tight", dark ? "text-white" : "text-dm-ink")}>{state.name}</p>

          {here.length === 0 ? (
            <p className={cn("mt-2 text-[14px] leading-relaxed", dark ? "text-white/70" : "text-dm-gray")}>
              {tr("Entregamos em {estado} direto da fábrica em Limeira/SP, com logística acompanhada e assistência técnica própria.", { estado: state.name })}
            </p>
          ) : (
            <>
              <p className={cn("mt-1 text-[13px]", dark ? "text-white/60" : "text-dm-gray")}>
                {here.length === 1 ? tr("Cliente nosso neste estado") : tr("Clientes nossos neste estado")}
              </p>

              {logos.length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-2.5">
                  {logos.map((c) => (
                    <li key={c.key} className="flex h-[72px] items-center justify-center rounded-lg bg-white p-2.5" title={c.name}>
                      <img src={c.logo} alt={c.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                    </li>
                  ))}
                </ul>
              )}

              {names.length > 0 && (
                <ul className={cn("flex flex-wrap gap-2", logos.length > 0 ? "mt-3" : "mt-4")}>
                  {names.map((c) => (
                    <li
                      key={c.key}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-[13px] leading-snug",
                        dark ? "border-white/12 bg-white/[0.05] text-white" : "border-dm-line bg-white text-dm-ink",
                      )}
                    >
                      <span className="font-semibold">{GENERIC.test(c.name.trim()) ? tr(c.name) : c.name}</span>
                      {c.city && <span className={cn("block text-[12px]", dark ? "text-white/55" : "text-dm-gray")}>{c.city}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
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
