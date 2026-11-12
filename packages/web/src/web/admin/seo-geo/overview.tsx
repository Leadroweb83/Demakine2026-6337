import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, Radar, RefreshCw, TriangleAlert } from "lucide-react";
import { Btn, Card } from "../ui";
import { EmptyState } from "../charts";
import { DailyChart } from "./daily-chart";
import { useAudit, useResumo, type Resumo } from "./data";
import { AREA_LABELS, AREA_ORDER, SECTOR_LABELS, SECTOR_ORDER, dayDelta, formatWhen, scoreColor, scoreWord } from "./model";
import { SCORE_TONE, ScoreRing } from "./score-ring";

function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando a visão geral">
      <div className="h-[200px] animate-pulse rounded-2xl bg-black/[0.06]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl bg-black/[0.06]" />
        ))}
      </div>
    </div>
  );
}

/** "Auditar agora" com o andamento ("Auditando 80 de 197 páginas") e o erro, se houver. */
export function AuditButton({ running }: { running?: Resumo["running"] }) {
  const audit = useAudit();
  const live = audit.busy ? audit.progress : running;
  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Btn onClick={audit.run} disabled={audit.busy || Boolean(running)} tone="primary" className="inline-flex items-center gap-2">
        <RefreshCw size={15} className={audit.busy || running ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
        {audit.busy || running ? "Auditando..." : "Auditar agora"}
      </Btn>
      <p className="min-h-[18px] text-[12px] text-dm-ink/60" role="status" aria-live="polite">
        {live ? `${live.audited} de ${live.total} páginas` : audit.busy ? "Começando..." : ""}
      </p>
      {audit.error && (
        <p className="max-w-xs text-[12.5px] font-semibold text-dm-red" role="alert">
          {audit.error}
        </p>
      )}
    </div>
  );
}

function Delta({ n }: { n: number | null }) {
  if (n === null) return null;
  const up = n > 0;
  const Icon = n === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const cls = n === 0 ? "bg-black/5 text-dm-ink/60" : up ? "bg-dm-green/12 text-dm-green-dark" : "bg-dm-red/10 text-dm-red";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${cls}`}>
      <Icon size={14} aria-hidden="true" />
      {n === 0 ? "igual a ontem" : `${up ? "+" : ""}${n} desde ontem`}
    </span>
  );
}

function MiniScore({ title, hint, value }: { title: string; hint?: string; value: number }) {
  const tone = SCORE_TONE[scoreColor(value)];
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <ScoreRing value={value} size={64} label={title} />
      <div className="min-w-0 pt-0.5">
        <h3 className="text-[13.5px] font-extrabold leading-tight text-dm-ink">{title}</h3>
        <p className="mt-0.5 text-[11.5px] font-bold" style={{ color: tone.text }}>
          {scoreWord(value)}
        </p>
        {hint && <p className="mt-1 text-[12px] leading-snug text-dm-ink/55">{hint}</p>}
      </div>
    </div>
  );
}

/** Visão geral: nota do site, evolução, notas por setor e por área, alertas e linha do tempo. */
export function Overview() {
  const q = useResumo();
  const [allTimeline, setAllTimeline] = useState(false);

  if (q.isPending) return <Skeleton />;
  if (q.isError) {
    return (
      <Card>
        <p className="text-[13.5px] font-semibold text-dm-red">{q.error.message}</p>
        <Btn tone="ghost" onClick={() => q.refetch()} className="mt-3">
          Tentar de novo
        </Btn>
      </Card>
    );
  }
  const r = q.data;

  if (!r.latest) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Radar size={34} aria-hidden="true" />}
          title={r.running ? "A primeira auditoria está rodando" : "Nenhuma auditoria feita ainda"}
          text={r.running ? `${r.running.audited} de ${r.running.total} páginas lidas até agora. Esta tela se atualiza sozinha.` : "A auditoria lê todas as páginas do site no ar, dá uma nota de SEO para cada uma e mostra o que melhorar. Leva menos de um minuto. Depois disso, ela roda sozinha todo dia às 7h."}
        />
        <div className="flex justify-center">
          <AuditButton running={r.running} />
        </div>
      </div>
    );
  }

  const delta = dayDelta(r.history);
  const score = r.latest.siteSeoScore;
  const sectors = SECTOR_ORDER.filter((s) => r.bySector[s] !== undefined);
  const areas = AREA_ORDER.filter((a) => r.byArea[a] !== undefined);
  const timeline = allTimeline ? r.timeline : r.timeline.slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-6">
          <ScoreRing value={score} size={132} label="Nota de SEO do site" />
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-wide text-dm-ink/50">Nota de SEO do site</p>
            <p className="mt-1 font-display text-[24px] font-extrabold leading-tight text-dm-ink">{score === null ? "Sem nota" : scoreWord(score)}</p>
            <div className="mt-2">
              <Delta n={delta} />
            </div>
            <p className="mt-3 text-[12.5px] leading-snug text-dm-ink/60">
              Última auditoria {formatWhen(r.latest.finishedAt ?? r.latest.startedAt)}
              <br />
              {r.latest.pagesAudited} páginas lidas, {r.latest.kind === "diaria" ? "rotina diária" : "pedido manual"}
            </p>
          </div>
        </div>
        <AuditButton running={r.running} />
      </section>

      {r.alerts.length > 0 && (
        <section className="rounded-2xl border border-amber-300/70 bg-amber-50 p-5" aria-label="Alertas da última auditoria">
          <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-amber-900">
            <TriangleAlert size={17} aria-hidden="true" />
            {r.alerts.length === 1 ? "1 alerta" : `${r.alerts.length} alertas`} da última auditoria
          </h2>
          <ul className="mt-2 space-y-1 text-[13.5px] text-amber-900/90">
            {r.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      <DailyChart points={r.history} />

      {sectors.length > 0 && (
        <section aria-labelledby="seo-setores">
          <h2 id="seo-setores" className="mb-3 font-display text-[15px] font-extrabold text-dm-ink">
            Por setor
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {sectors.map((s) => (
              <MiniScore key={s} title={SECTOR_LABELS[s].title} hint={SECTOR_LABELS[s].hint} value={r.bySector[s]!} />
            ))}
          </div>
        </section>
      )}

      {areas.length > 0 && (
        <section aria-labelledby="seo-areas">
          <h2 id="seo-areas" className="mb-3 font-display text-[15px] font-extrabold text-dm-ink">
            Por área do site
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {areas.map((a) => (
              <MiniScore key={a} title={AREA_LABELS[a]} value={r.byArea[a]!} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="seo-linha" className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="seo-linha" className="font-display text-[15px] font-extrabold text-dm-ink">
          Linha do tempo
        </h2>
        <p className="mt-1 text-[12.5px] text-dm-ink/55">Auditorias e alterações de SEO dos últimos 30 dias.</p>
        {timeline.length === 0 ? (
          <p className="mt-4 text-[13px] text-dm-ink/55">Nada registrado ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {timeline.map((t, i) => (
              <li key={`${t.at}-${i}`} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
                <span className="w-36 shrink-0 text-[12px] font-bold text-dm-ink/50">{formatWhen(t.at)}</span>
                <span className="text-[13.5px] text-dm-ink/85">{t.text}</span>
              </li>
            ))}
          </ul>
        )}
        {r.timeline.length > 8 && (
          <Btn tone="ghost" onClick={() => setAllTimeline((v) => !v)} className="mt-3">
            {allTimeline ? "Mostrar menos" : `Mostrar tudo (${r.timeline.length})`}
          </Btn>
        )}
      </section>
    </div>
  );
}
