import { useEffect, useRef, useState } from "react";
import { ChartCard } from "../charts";
import { SCORE_TONE } from "./score-ring";
import { scoreColor } from "./model";

const H = 200;
const PAD = { l: 34, r: 12, t: 12, b: 26 };
const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Nota do site por dia, com as faixas verde, amarela e vermelha ao fundo (e a mesma coisa em tabela, para leitor de tela). */
export function DailyChart({ points }: { points: { date: string; site: number }[] }) {
  // desenha na largura real do cartão: no celular o texto dos eixos continua legível em vez de encolher junto
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setW(Math.max(260, Math.round(el.clientWidth))));
    ro.observe(el);
    setW(Math.max(260, Math.round(el.clientWidth)));
    return () => ro.disconnect();
  }, []);
  const x = (i: number) => PAD.l + (points.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (points.length - 1));
  const y = (v: number) => PAD.t + ((100 - v) * (H - PAD.t - PAD.b)) / 100;
  const last = points[points.length - 1];
  const tone = last ? SCORE_TONE[scoreColor(last.site)] : SCORE_TONE.amarelo;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.site).toFixed(1)}`).join(" ");

  return (
    <ChartCard
      title="Nota do site por dia"
      hint={points.length < 2 ? "O gráfico ganha forma a partir da segunda auditoria." : `Últimos ${points.length} dias com auditoria.`}
      table={{ columns: ["Dia", "Nota"], rows: points.map((p) => [dm(p.date), p.site]) }}
    >
      <div ref={box} className="mt-3 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full" role="img" aria-label={last ? `Nota do site nos últimos dias. Hoje: ${last.site} de 100.` : "Sem dados"}>
        <rect x={PAD.l} y={y(100)} width={W - PAD.l - PAD.r} height={y(90) - y(100)} fill={SCORE_TONE.verde.soft} />
        <rect x={PAD.l} y={y(90)} width={W - PAD.l - PAD.r} height={y(50) - y(90)} fill={SCORE_TONE.amarelo.soft} opacity={0.7} />
        <rect x={PAD.l} y={y(50)} width={W - PAD.l - PAD.r} height={y(0) - y(50)} fill={SCORE_TONE.vermelho.soft} opacity={0.6} />
        {[0, 50, 90, 100].map((v) => (
          <text key={v} x={PAD.l - 6} y={y(v) + 4} textAnchor="end" className="fill-dm-ink/55 text-[11px]">
            {v}
          </text>
        ))}
        {points.length > 1 && <path d={path} fill="none" stroke={tone.stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.site)} r={points.length === 1 ? 6 : 3.5} fill="#fff" stroke={SCORE_TONE[scoreColor(p.site)].stroke} strokeWidth={2.5}>
            <title>{`${dm(p.date)}: nota ${p.site}`}</title>
          </circle>
        ))}
        {points.length > 0 && (
          <>
            <text x={x(0)} y={H - 7} textAnchor={points.length === 1 ? "middle" : "start"} className="fill-dm-ink/55 text-[11px]">
              {dm(points[0]!.date)}
            </text>
            {points.length > 1 && (
              <text x={x(points.length - 1)} y={H - 7} textAnchor="end" className="fill-dm-ink/55 text-[11px]">
                {dm(points[points.length - 1]!.date)}
              </text>
            )}
          </>
        )}
      </svg>
      </div>
    </ChartCard>
  );
}
