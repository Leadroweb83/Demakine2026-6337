import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h1 className="font-display text-[26px] font-extrabold tracking-tight text-dm-ink">{title}</h1>
      {hint && <p className="mt-1 max-w-2xl text-[13.5px] text-dm-ink/60">{hint}</p>}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  type = "button",
  tone = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "primary" | "ghost" | "danger" | "green";
  disabled?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-dm-blue text-white hover:bg-[#0d3480]",
    green: "bg-dm-green text-white hover:bg-dm-green-dark",
    ghost: "border border-black/10 bg-white text-dm-ink hover:bg-black/[0.03]",
    danger: "bg-dm-red text-white hover:bg-[#c5111a]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide transition-colors disabled:opacity-60 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-[12px] text-dm-ink/50">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[14px] text-dm-ink outline-none transition-colors focus:border-dm-blue";

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "gray" | "red" }) {
  const tones: Record<string, string> = {
    blue: "bg-dm-blue/10 text-dm-blue",
    green: "bg-dm-green/12 text-dm-green-dark",
    gray: "bg-black/5 text-dm-ink/60",
    red: "bg-dm-red/10 text-dm-red",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">{label}</p>
      <p className="mt-2 font-display text-[32px] font-extrabold leading-none text-dm-ink">{value}</p>
      {hint && <p className="mt-2 text-[12.5px] text-dm-ink/55">{hint}</p>}
    </Card>
  );
}

/** Barras horizontais simples, sem dependencia de lib de grafico. */
export function BarList({
  data,
  emptyLabel = "Sem dados ainda.",
}: {
  data: { label: string; value: number }[];
  emptyLabel?: string;
}) {
  if (!data.length) return <p className="text-[13px] text-dm-ink/55">{emptyLabel}</p>;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="truncate text-[13px] font-semibold text-dm-ink">{d.label}</span>
            <span className="font-mono text-[12.5px] text-dm-ink/60">{d.value}</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-dm-blue transition-[width] duration-500"
              style={{ width: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Colunas verticais para serie temporal. */
export function ColumnChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <p className="text-[13px] text-dm-ink/55">Sem dados ainda.</p>;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <span className="font-mono text-[11px] text-dm-ink/55">{d.value}</span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-dm-blue to-[#2a63d6] transition-[height] duration-500"
            style={{ height: `${Math.max(3, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-dm-ink/50">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Variacao percentual com cor. */
export function Trend({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-[12px] text-dm-ink/45">sem base de comparação</span>;
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        up ? "bg-dm-green/12 text-dm-green-dark" : "bg-dm-red/10 text-dm-red"
      }`}
    >
      {up ? "▲" : "▼"} {Math.abs(delta)}%
    </span>
  );
}

/** Colunas com serie de comparacao (ano anterior) sobreposta. */
export function ComparisonColumns({
  data,
}: {
  data: { label: string; value: number; compare?: number; highlight?: number }[];
}) {
  const max = Math.max(...data.flatMap((d) => [d.value, d.compare ?? 0]), 1);
  return (
    <div>
      <div className="flex h-48 items-end gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="relative h-full w-full">
              {d.compare !== undefined && d.compare > 0 && (
                <div
                  className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 rounded-t border-2 border-dashed border-dm-ink/20"
                  style={{ height: `${(d.compare / max) * 100}%` }}
                />
              )}
              <div
                className="absolute bottom-0 left-0 w-full overflow-hidden rounded-t-md bg-dm-blue/85"
                style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
              >
                {!!d.highlight && (
                  <div
                    className="absolute bottom-0 left-0 w-full bg-dm-green"
                    style={{ height: `${Math.min(100, (d.highlight / Math.max(d.value, 1)) * 100)}%` }}
                  />
                )}
              </div>
            </div>
            <span className="mt-2 truncate text-center text-[9.5px] font-semibold uppercase tracking-wide text-dm-ink/45">
              {d.label}
            </span>
            <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-dm-ink px-2 py-1 text-[10.5px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {d.value} lead{d.value === 1 ? "" : "s"}
              {d.highlight ? ` · ${d.highlight} ganho${d.highlight === 1 ? "" : "s"}` : ""}
              {d.compare ? ` · ano anterior ${d.compare}` : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-dm-ink/55">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-dm-blue/85" /> leads recebidos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-dm-green" /> ganhos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-dm-ink/25" /> mesmo mês do ano anterior
        </span>
      </div>
    </div>
  );
}

/** Funil vertical de status. */
export function Funnel({
  steps,
}: {
  steps: { label: string; total: number; tone: "blue" | "amber" | "green" | "red" }[];
}) {
  const max = Math.max(...steps.map((s) => s.total), 1);
  const tones: Record<string, string> = {
    blue: "bg-dm-blue",
    amber: "bg-[#e08a12]",
    green: "bg-dm-green",
    red: "bg-dm-red",
  };
  return (
    <ul className="space-y-3">
      {steps.map((s) => (
        <li key={s.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-dm-ink">{s.label}</span>
            <span className="font-mono text-[12.5px] text-dm-ink/60">{s.total}</span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-black/[0.05]">
            <div
              className={`h-full rounded-full ${tones[s.tone]} transition-[width] duration-500`}
              style={{ width: `${Math.max(2, (s.total / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Rosca em SVG puro, sem lib. */
export function Donut({
  slices,
  center,
  label,
}: {
  slices: { label: string; value: number; color: string }[];
  center?: string | number;
  label?: string;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const r = 54;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-[140px] w-[140px] shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="16" />
          {total > 0 &&
            slices.map((s) => {
              const len = (s.value / total) * circ;
              const el = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[24px] font-extrabold leading-none text-dm-ink">
            {center ?? total}
          </span>
          {label && (
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-dm-ink/45">
              {label}
            </span>
          )}
        </div>
      </div>
      <ul className="min-w-[140px] flex-1 space-y-2">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="flex items-center gap-2 text-dm-ink/75">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-mono text-dm-ink/60">
              {s.value}
              {total ? ` · ${Math.round((s.value / total) * 100)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
