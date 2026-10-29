import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3, Minus, Table2 } from "lucide-react";
import mapRaw from "../data/br-map.json";
import { LEAD_STATUSES, STATUS_META, type LeadStatus } from "./lead-status";
import { RingChart, type RingSegment } from "@/components/ui/ring-chart";

/** Azul de marcas validado contra o fundo branco (o azul da marca é escuro demais para barra). */
export const MARK_BLUE = "#2f6bd8";
const MARK_GRAY = "#c5cad3";
const MARK_GREEN = STATUS_META.ganho.color;

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;

/** Teto "redondo" do eixo para contagens: 4, 8, 10, 20, 50... */
export function niceScale(max: number) {
  if (max <= 4) return { top: 4, step: 1 };
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return { top: Math.ceil(max / step) * step, step };
}

/* ------------------------------------------------------------------ numero animado */

export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    if (reduced || start === value) {
      from.current = value;
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 700);
      const v = start + (value - start) * (1 - Math.pow(1 - t, 3));
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{fmt(shown, decimals)}</>;
}

/* ------------------------------------------------------------------ tooltip */

/** Tooltip de marca: aparece no hover e no foco do teclado; o valor vem primeiro. */
function Tip({ value, label, side = "top" }: { value: ReactNode; label?: ReactNode; side?: "top" | "right" }) {
  const pos =
    side === "top"
      ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
      : "left-full top-1/2 ml-2 -translate-y-1/2";
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-lg bg-dm-ink px-2.5 py-1.5 text-left opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100 ${pos}`}
    >
      <span className="block text-[12.5px] font-bold text-white">{value}</span>
      {label && <span className="block text-[11px] text-white/65">{label}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ cartao de grafico */

export type TableView = { columns: string[]; rows: (string | number)[][] };

export function ChartCard({
  title,
  hint,
  action,
  table,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  table?: TableView;
  children: ReactNode;
  className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className={`flex flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[15px] font-extrabold text-dm-ink">{title}</h2>
          {hint && <p className="mt-1 text-[12.5px] leading-snug text-dm-ink/55">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {table && (
            <button
              type="button"
              onClick={() => setAsTable((v) => !v)}
              aria-pressed={asTable}
              title={asTable ? "Ver gráfico" : "Ver como tabela"}
              className="rounded-lg p-2 text-dm-ink/45 transition-colors hover:bg-black/[0.04] hover:text-dm-ink"
            >
              {asTable ? <BarChart3 size={16} /> : <Table2 size={16} />}
              <span className="sr-only">{asTable ? "Ver gráfico" : "Ver como tabela"}</span>
            </button>
          )}
        </div>
      </header>
      <div className="mt-5 flex-1">
        {asTable && table ? <DataTable table={table} /> : children}
      </div>
    </section>
  );
}

function DataTable({ table }: { table: TableView }) {
  if (!table.rows.length) return <p className="text-[13px] text-dm-ink/55">Sem dados no período.</p>;
  return (
    <div className="max-h-[320px] overflow-auto rounded-lg border border-black/5">
      <table className="w-full text-left text-[12.5px]">
        <thead className="sticky top-0 bg-dm-surface text-[10.5px] font-bold uppercase tracking-wide text-dm-ink/55">
          <tr>
            {table.columns.map((c, i) => (
              <th key={c} className={`px-3 py-2 ${i > 0 ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, ri) => (
            <tr key={ri} className="border-t border-black/5">
              {r.map((v, i) => (
                <td key={i} className={`px-3 py-2 ${i > 0 ? "text-right tabular-nums text-dm-ink/70" : "text-dm-ink"}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-black/10 bg-dm-surface/60 px-6 py-8 text-center">
      <span className="text-dm-ink/30">{icon}</span>
      <p className="mt-3 text-[13.5px] font-bold text-dm-ink/75">{title}</p>
      <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-dm-ink/55">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ KPI */

export function KpiTile({
  label,
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delta,
  deltaUnit = "%",
  goodWhen = "up",
  compareLabel,
  footnote,
  Icon,
  accent,
}: {
  label: string;
  value: number | null;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** undefined esconde a linha de comparação (indicador sem período anterior) */
  delta?: number | null;
  deltaUnit?: "%" | " pts" | "h" | "";
  goodWhen?: "up" | "down";
  compareLabel?: string;
  footnote?: ReactNode;
  Icon: typeof BarChart3;
  accent: string;
}) {
  const hasDelta = delta !== null && Number.isFinite(delta);
  const flat = hasDelta && delta === 0;
  const up = hasDelta && delta! > 0;
  const good = hasDelta && !flat && (goodWhen === "up" ? up : !up);
  const DeltaIcon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const deltaText = hasDelta
    ? `${up ? "+" : delta! < 0 ? "−" : ""}${fmt(Math.abs(delta!), deltaUnit === "h" ? 1 : 0)}${deltaUnit}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-dm-ink/60">{label}</p>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accent}14`, color: accent }}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-[34px] font-bold leading-none tracking-tight text-dm-ink">
        {value === null ? (
          <span className="text-[15px] font-semibold text-dm-ink/40">sem dados ainda</span>
        ) : (
          <>
            {prefix && <span className="mr-1 text-[20px] font-semibold text-dm-ink/60">{prefix}</span>}
            <AnimatedNumber value={value} decimals={decimals} />
            {suffix && <span className="ml-0.5 text-[20px] font-semibold text-dm-ink/60">{suffix}</span>}
          </>
        )}
      </p>
      {delta !== undefined && (
      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
        {deltaText ? (
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              flat ? "text-dm-ink/55" : good ? "text-dm-green-dark" : "text-dm-red"
            }`}
          >
            <DeltaIcon size={14} strokeWidth={2.5} />
            {deltaText}
          </span>
        ) : (
          <span className="font-semibold text-dm-ink/40">sem base de comparação</span>
        )}
        {deltaText && <span className="text-dm-ink/45">{compareLabel}</span>}
      </p>
      )}
      {footnote && <div className="mt-2 text-[12px] text-dm-ink/60">{footnote}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ leads por mes */

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function monthLabel(key: string, withYear = false) {
  const [y, m] = key.split("-");
  const name = MONTHS[Number(m) - 1] ?? m;
  return withYear ? `${name}/${(y ?? "").slice(2)}` : name;
}

export function MonthlyChart({
  data,
}: {
  data: { month: string; total: number; won: number; lastYear: number }[];
}) {
  const max = Math.max(...data.flatMap((d) => [d.total, d.lastYear]), 0);
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const hasLastYear = data.some((d) => d.lastYear > 0);
  const last = data[data.length - 1];
  const pct = (v: number) => `${(v / top) * 100}%`;

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative h-[180px] w-6 shrink-0">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2 text-[10.5px] tabular-nums text-dm-ink/40"
              style={{ bottom: pct(t) }}
            >
              {fmt(t)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-[180px]">
            {ticks.map((t) => (
              <span
                key={t}
                className={`absolute inset-x-0 h-px ${t === 0 ? "bg-black/20" : "bg-black/[0.06]"}`}
                style={{ bottom: pct(t) }}
              />
            ))}
            <div className="absolute inset-0 flex items-end">
              {data.map((d, i) => {
                const isLast = i === data.length - 1;
                const label = monthLabel(d.month, true);
                return (
                  <div
                    key={d.month}
                    className="group/tip relative flex h-full min-w-0 flex-1 items-end justify-center gap-[2px] rounded-md transition-colors hover:bg-dm-blue/[0.04]"
                  >
                    <div className="flex h-full w-full max-w-[18px] flex-col justify-end">
                      {isLast && d.total > 0 && (
                        <span className="mb-1 text-center text-[11px] font-bold tabular-nums text-dm-ink">
                          {d.total}
                        </span>
                      )}
                      {d.total > 0 && (
                        <div className="flex flex-col justify-end gap-[2px]" style={{ height: pct(d.total) }}>
                          {d.total > d.won && (
                            <div className="min-h-[3px] w-full flex-1 rounded-t-[4px]" style={{ background: MARK_BLUE }} />
                          )}
                          {d.won > 0 && (
                            <div
                              className={`w-full ${d.won === d.total ? "rounded-t-[4px]" : ""}`}
                              style={{ background: MARK_GREEN, height: `${(d.won / d.total) * 100}%`, minHeight: 3 }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    {hasLastYear && (
                      <div
                        className="w-full max-w-[10px] rounded-t-[4px]"
                        style={{ background: MARK_GRAY, height: d.lastYear ? pct(d.lastYear) : 0 }}
                      />
                    )}
                    <Tip
                      value={plural(d.total, "lead", "leads")}
                      label={
                        <>
                          {label} · {plural(d.won, "ganho", "ganhos")}
                          {hasLastYear ? ` · ano anterior: ${d.lastYear}` : ""}
                        </>
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex">
            {data.map((d, i) => {
              const m = Number(d.month.split("-")[1]);
              const showYear = i === 0 || m === 1;
              return (
                <span
                  key={d.month}
                  className={`min-w-0 flex-1 truncate text-center text-[10px] font-semibold uppercase tracking-wide ${
                    i === data.length - 1 ? "text-dm-ink" : "text-dm-ink/45"
                  } ${i % 2 === 1 ? "max-sm:invisible" : ""}`}
                >
                  {monthLabel(d.month, showYear)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-dm-ink/65">
        <Legend color={MARK_BLUE} label="Leads recebidos" />
        <Legend color={MARK_GREEN} label="Ganhos" />
        {hasLastYear && <Legend color={MARK_GRAY} label="Mesmo mês do ano anterior" />}
        {last && (
          <span className="ml-auto text-dm-ink/50">
            {monthLabel(last.month)} até agora: <b className="text-dm-ink">{last.total}</b>
          </span>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ rosca de status */

export function StatusDonut({
  byStatus,
  onSelect,
  showDelta,
}: {
  byStatus: { status: string; total: number; previous?: number }[];
  onSelect: (status: LeadStatus) => void;
  showDelta: boolean;
}) {
  const values = LEAD_STATUSES.map((s) => {
    const row = byStatus.find((b) => b.status === s);
    return { status: s, total: row?.total ?? 0, previous: row?.previous ?? 0 };
  });
  const total = values.reduce((a, v) => a + v.total, 0);

  const segments: RingSegment[] = values.map((v) => {
    const meta = STATUS_META[v.status];
    const d = v.total - v.previous;
    const tone = d === 0 ? "neutral" : v.status === "ganho" ? (d > 0 ? "good" : "bad") : v.status === "perdido" ? (d > 0 ? "bad" : "good") : "neutral";
    return {
      key: v.status,
      label: meta.label,
      value: v.total,
      color: meta.color,
      icon: <meta.Icon size={14} className="shrink-0 text-dm-ink/40" />,
      badge: showDelta ? { text: d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : "0", tone } : undefined,
    };
  });

  return (
    <RingChart
      segments={segments}
      centerLabel="Total"
      centerValue={<AnimatedNumber value={total} />}
      onSelect={(key) => onSelect(key as LeadStatus)}
      size={176}
      thickness={24}
    />
  );
}

/* ------------------------------------------------------------------ funil */

export function FunnelBars({ steps }: { steps: { label: string; value: number; hint: string }[] }) {
  const first = steps[0]?.value || 0;
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1]!.value : null;
        const rate = prev ? Math.round((s.value / prev) * 100) : null;
        const width = first ? Math.max(s.value ? 6 : 0, (s.value / first) * 100) : 0;
        return (
          <li key={s.label}>
            {i > 0 && (
              <p className="mb-2 flex items-center gap-2 pl-1 text-[11.5px] text-dm-ink/50">
                <span className="h-4 w-px bg-black/15" />
                {rate === null ? "sem base" : `${rate}% avançam`}
              </p>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-dm-ink">{s.label}</span>
              <span className="text-[15px] font-bold tabular-nums text-dm-ink">{s.value}</span>
            </div>
            <div className="mt-1.5 h-3 w-full rounded-full bg-dm-blue-soft">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${width}%`, background: MARK_BLUE, opacity: 1 - i * 0.18 }}
              />
            </div>
            <p className="mt-1 text-[11.5px] text-dm-ink/45">{s.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ ranking */

export function RankList({
  data,
  onSelect,
  empty,
  valueLabel = (v) => plural(v, "lead", "leads"),
}: {
  data: { label: string; value: number; sub?: string; icon?: ReactNode }[];
  onSelect?: (label: string) => void;
  empty: ReactNode;
  valueLabel?: (v: number) => string;
}) {
  if (!data.length) return <>{empty}</>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-1">
      {data.map((d) => {
        const body = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                {d.icon}
                <span className="truncate text-[13px] font-semibold text-dm-ink">{d.label}</span>
              </span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-dm-ink/60">
                <b className="text-dm-ink">{d.value}</b>
                {d.sub ? <span className="ml-1.5 text-dm-ink/45">{d.sub}</span> : null}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-black/[0.05]">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${Math.max(3, (d.value / max) * 100)}%`, background: MARK_BLUE }}
              />
            </div>
          </>
        );
        return (
          <li key={d.label}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(d.label)}
                title={`Ver ${valueLabel(d.value)} de ${d.label}`}
                className="block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-black/[0.03]"
              >
                {body}
              </button>
            ) : (
              <div className="px-2 py-2">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ mapa de calor */

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEK_LABEL = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const WEEK_FULL = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const blockLabel = (b: number) => `${String(b * 3).padStart(2, "0")}h às ${String(b * 3 + 3).padStart(2, "0")}h`;

/** Rampa sequencial de um tom só (azul Demakine), do claro ao escuro. */
const heat = (t: number) => (t <= 0 ? "#f1f3f7" : `rgba(16, 61, 148, ${0.16 + t * 0.84})`);

export function WeekHourHeatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(0, ...matrix.flat());
  const peak = useMemo(() => {
    let best = { d: 0, b: 0, v: 0 };
    matrix.forEach((row, d) => row.forEach((v, b) => v > best.v && (best = { d, b, v })));
    return best;
  }, [matrix]);

  return (
    <div>
      <div className="grid grid-cols-[34px_repeat(8,minmax(0,1fr))] gap-[3px]">
        <span />
        {Array.from({ length: 8 }, (_, b) => (
          <span key={b} className="pb-1 text-center text-[10px] font-semibold text-dm-ink/45">
            {b * 3}h
          </span>
        ))}
        {WEEK_ORDER.map((d) => (
          <div key={d} className="contents">
            <span className="flex items-center text-[11px] font-semibold text-dm-ink/55">{WEEK_LABEL[d]}</span>
            {(matrix[d] ?? []).map((v, b) => (
              <div
                key={b}
                className="group/tip relative aspect-[1.6] min-h-[22px] rounded-[5px] transition-transform hover:scale-[1.06]"
                style={{ background: heat(max ? v / max : 0) }}
              >
                <Tip value={plural(v, "lead", "leads")} label={`${WEEK_FULL[d]}, ${blockLabel(b)}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-dm-ink/55">
        <span>
          {peak.v > 0 ? (
            <>
              Pico: <b className="text-dm-ink">{WEEK_FULL[peak.d]}, {blockLabel(peak.b)}</b>
            </>
          ) : (
            "Horário de Brasília"
          )}
        </span>
        <span className="flex items-center gap-1.5">
          menos
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <span key={t} className="h-3 w-4 rounded-[3px]" style={{ background: heat(t) }} />
          ))}
          mais
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ mapa do Brasil */

type MapData = { w: number; h: number; states: Record<string, { name: string; d: string; c: [number, number] }> };
const brMap = mapRaw as unknown as MapData;

export function LeadsMap({
  byState,
  unknown,
  onSelect,
  noun = ["lead", "leads"],
  emptyText = "Nenhum lead do período com estado identificado.",
  unknownText = (n: number) => `${plural(n, "lead sem", "leads sem")} UF na cidade digitada (ex.: "Limeira/SP").`,
}: {
  byState: { label: string; total: number }[];
  unknown: number;
  /** sem onSelect o mapa só mostra (tela Visitas) */
  onSelect?: (uf: string) => void;
  /** o que está sendo contado, no singular e no plural */
  noun?: [string, string];
  emptyText?: string;
  unknownText?: (n: number) => string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const counts = useMemo(() => new Map(byState.map((s) => [s.label, s.total])), [byState]);
  const max = Math.max(1, ...byState.map((s) => s.total));
  const activeName = active ? brMap.states[active]?.name : null;

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:items-center">
      <div className="relative">
        <svg viewBox={`0 0 ${brMap.w} ${brMap.h}`} className="h-auto w-full">
          {Object.entries(brMap.states).map(([uf, s]) => {
            const v = counts.get(uf) ?? 0;
            return (
              <path
                key={uf}
                d={s.d}
                tabIndex={v ? 0 : -1}
                aria-label={`${s.name}: ${plural(v, noun[0], noun[1])}`}
                fill={v ? heat(v / max) : "#eef1f6"}
                stroke="#ffffff"
                strokeWidth={1.2}
                className={`outline-none transition-opacity ${v && onSelect ? "cursor-pointer" : ""}`}
                style={{ opacity: active && active !== uf ? 0.55 : 1 }}
                onMouseEnter={() => setActive(uf)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(uf)}
                onBlur={() => setActive(null)}
                onClick={() => v && onSelect?.(uf)}
              />
            );
          })}
        </svg>
        {activeName && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-lg bg-dm-ink px-2.5 py-1.5 shadow-lg">
            <span className="block text-[12.5px] font-bold text-white">
              {plural(counts.get(active!) ?? 0, noun[0], noun[1])}
            </span>
            <span className="block text-[11px] text-white/65">{activeName}</span>
          </span>
        )}
      </div>
      <div>
        <RankList
          data={byState.slice(0, 6).map((s) => ({ label: s.label, value: s.total, sub: brMap.states[s.label]?.name }))}
          onSelect={onSelect}
          valueLabel={(v) => plural(v, noun[0], noun[1])}
          empty={<p className="text-[12.5px] leading-relaxed text-dm-ink/55">{emptyText}</p>}
        />
        {unknown > 0 && <p className="mt-3 px-2 text-[11.5px] leading-relaxed text-dm-ink/45">{unknownText(unknown)}</p>}
      </div>
    </div>
  );
}
