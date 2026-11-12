import { useEffect, useState } from "react";
import { scoreColor, scoreWord, type ScoreColor } from "./model";

/** Cores das faixas (verde, amarelo, vermelho), escolhidas para ter contraste de texto sobre o fundo branco. */
export const SCORE_TONE: Record<ScoreColor, { stroke: string; text: string; soft: string }> = {
  verde: { stroke: "#0b8a4a", text: "#0a6b3a", soft: "#e6f4ec" },
  amarelo: { stroke: "#d97706", text: "#9a4f04", soft: "#fdf1de" },
  vermelho: { stroke: "#d4141b", text: "#b10f15", soft: "#fde8e9" },
};

/** Anel de nota 0 a 100 no estilo do PageSpeed: o arco se desenha ao abrir (sem movimento se a pessoa pediu menos). */
export function ScoreRing({
  value,
  size = 120,
  label,
  className = "",
}: {
  /** null = ainda não auditado */
  value: number | null;
  size?: number;
  label?: string;
  className?: string;
}) {
  const stroke = Math.max(6, Math.round(size * 0.085));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const has = value !== null && Number.isFinite(value);
  const n = has ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  const tone = SCORE_TONE[scoreColor(n)];
  const offset = c * (1 - (drawn ? n : 0) / 100);
  const aria = has ? `${label ? `${label}: ` : ""}nota ${n} de 100, ${scoreWord(n).toLowerCase()}` : `${label ? `${label}: ` : ""}ainda não auditado`;

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }} role="img" aria-label={aria}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8ebf0" strokeWidth={stroke} strokeDasharray={has ? undefined : "3 7"} strokeLinecap="round" />
        {has && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-[900ms] ease-out motion-reduce:transition-none"
          />
        )}
      </svg>
      <span className="absolute font-display font-extrabold tabular-nums leading-none" style={{ fontSize: Math.round(size * 0.32), color: has ? tone.text : "#8a93a3" }}>
        {has ? n : "–"}
      </span>
    </div>
  );
}
