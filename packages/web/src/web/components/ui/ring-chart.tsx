import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RingSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Texto do valor na legenda e no balão (ex.: "R$ 7.600"). */
  display?: string;
  badge?: { text: string; tone: "good" | "bad" | "neutral" };
  icon?: ReactNode;
};

/**
 * Rosca leve em SVG no estilo "anel grosso + total no centro + legenda com barra".
 * Sem biblioteca de gráfico: não pesa no site público.
 */
export function RingChart({
  segments,
  centerLabel,
  centerValue,
  size = 190,
  thickness = 26,
  dark = false,
  onSelect,
  className,
}: {
  segments: RingSegment[];
  centerLabel: string;
  centerValue: ReactNode;
  size?: number;
  thickness?: number;
  dark?: boolean;
  onSelect?: (key: string) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const visible = segments.filter((s) => s.value > 0);
  const gap = visible.length > 1 ? 4 : 0;

  let acc = 0;
  const arcs = segments.map((s) => {
    const len = total ? (s.value / total) * circ : 0;
    const arc = { ...s, len: Math.max(0, len - gap), offset: acc };
    acc += len;
    return arc;
  });
  const focus = hover ? segments.find((s) => s.key === hover) : undefined;

  const ink = dark ? "text-white" : "text-dm-ink";
  const muted = dark ? "text-white/55" : "text-dm-ink/55";
  const badgeTone = {
    good: dark ? "bg-emerald-400/15 text-emerald-300" : "bg-dm-green/10 text-dm-green-dark",
    bad: dark ? "bg-red-400/15 text-red-300" : "bg-dm-red/10 text-dm-red",
    neutral: dark ? "bg-white/10 text-white/70" : "bg-black/[0.05] text-dm-ink/60",
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={dark ? "rgba(255,255,255,0.08)" : "#eef0f4"}
            strokeWidth={thickness}
          />
          {arcs.map(
            (a) =>
              a.len > 0 && (
                <circle
                  key={a.key}
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={hover === a.key ? thickness + 6 : thickness}
                  strokeDasharray={`${a.len} ${circ - a.len}`}
                  strokeDashoffset={-a.offset}
                  strokeLinecap="butt"
                  className={cn("transition-[stroke-width,opacity] duration-200", onSelect && "cursor-pointer")}
                  style={{ opacity: hover && hover !== a.key ? 0.3 : 1 }}
                  onMouseEnter={() => setHover(a.key)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onSelect?.(a.key)}
                />
              ),
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className={cn("text-[12.5px] font-medium", muted)}>{focus ? focus.label : centerLabel}</span>
          <span className={cn("mt-1 text-[22px] font-bold leading-tight tabular-nums", ink)}>
            {focus ? (focus.display ?? focus.value.toLocaleString("pt-BR")) : centerValue}
          </span>
          {focus && total > 0 && (
            <span className={cn("mt-0.5 text-[12px] font-semibold", muted)}>
              {Math.round((focus.value / total) * 100)}% do total
            </span>
          )}
        </div>
      </div>

      <ul className="w-full space-y-1">
        {segments.map((s) => {
          const Row = onSelect ? "button" : "div";
          return (
            <li key={s.key}>
              <Row
                {...(onSelect ? { type: "button" as const, onClick: () => onSelect(s.key) } : {})}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s.key)}
                onBlur={() => setHover(null)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                  onSelect && (dark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.03]"),
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="h-4 w-1 shrink-0 rounded-full" style={{ background: s.color }} />
                  {s.icon}
                  <span className={cn("truncate text-[13.5px]", dark ? "text-white/80" : "text-dm-ink/80")}>
                    {s.label}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className={cn("text-[13.5px] font-semibold tabular-nums", ink)}>
                    {s.display ?? s.value.toLocaleString("pt-BR")}
                  </span>
                  {s.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                        badgeTone[s.badge.tone],
                      )}
                    >
                      {s.badge.text}
                    </span>
                  )}
                </span>
              </Row>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
