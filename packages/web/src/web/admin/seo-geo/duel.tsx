import { useState } from "react";
import { RefreshCw, Swords } from "lucide-react";
import { Btn, Card, inputCls } from "../ui";
import { EmptyState } from "../charts";
import { useConcorrentes, useDuelar, useSaveConcorrentes, type DuelResultRow } from "./data";
import { formatWhen } from "./model";
import { METRIC_LABELS } from "../../../api/lib/seo/duel-metrics";
import type { PanelProps } from ".";

const STATUS_TEXT: Record<string, string> = {
  "bloqueado-robots": "O site pede para robôs não lerem as páginas (robots.txt). Respeitamos e não comparamos.",
  "sem-paginas": "Não foi possível achar páginas neste site (sem sitemap e sem links na home).",
  erro: "Não foi possível ler este site agora. Tente de novo mais tarde.",
};
const EFFORT = { baixo: "Esforço baixo", medio: "Esforço médio", alto: "Esforço alto" } as const;

function Form({ initial }: { initial: { name: string; url: string }[] }) {
  const save = useSaveConcorrentes();
  const [rows, setRows] = useState([0, 1].map((i) => ({ name: initial[i]?.name ?? "", url: initial[i]?.url ?? "" })));
  const items = rows.filter((r) => r.name.trim() || r.url.trim());
  return (
    <Card>
      <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Concorrentes</h2>
      <p className="mt-1 max-w-2xl text-[12.5px] text-dm-ink/55">Informe até 2 sites. O painel lê só as páginas públicas (até 40 por site), respeita o robots.txt deles, faz 1 pedido por segundo e não copia texto. Dá para trocar quando quiser.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((r, i) => (
          <div key={i} className="space-y-2 rounded-xl bg-dm-surface/70 p-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Nome {i + 1}</span>
              <input value={r.name} maxLength={60} onChange={(e) => setRows((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} placeholder="Concorrente" className={`${inputCls} mt-1`} />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Site {i + 1}</span>
              <input value={r.url} onChange={(e) => setRows((x) => x.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)))} placeholder="https://www.concorrente.com.br" className={`${inputCls} mt-1 font-mono text-[12.5px]`} />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Btn disabled={save.isPending} onClick={() => save.mutate(items.map((r) => ({ name: r.name, url: r.url })))}>{save.isPending ? "Salvando..." : "Salvar concorrentes"}</Btn>
        {save.isSuccess && <span className="text-[12.5px] font-semibold text-dm-green-dark">Salvo. Rode o duelo para comparar.</span>}
        {save.isError && <span className="text-[12.5px] font-semibold text-dm-red" role="alert">{save.error.message}</span>}
      </div>
    </Card>
  );
}

function Result({ r, go }: { r: DuelResultRow; go: PanelProps["go"] }) {
  const sites = r.sites;
  const okSites = sites.filter((s) => s.status === "ok");
  const metrics = [...new Set(okSites.flatMap((s) => (r.verdicts[s.name] ?? []).map((v) => v.metric)))];
  const cls = { melhor: "bg-dm-green/12 text-dm-green-dark", pior: "bg-dm-red/10 text-dm-red", empate: "bg-black/5 text-dm-ink/60" } as const;
  const word = { melhor: "Você ganha", pior: "Você perde", empate: "Empate" } as const;
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {sites.map((s) => {
          const b = r.board[s.name];
          return (
            <div key={s.url} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="text-[12px] font-bold uppercase tracking-wide text-dm-ink/50">Demakine contra</p>
              <h3 className="font-display text-[19px] font-extrabold text-dm-ink">{s.name}</h3>
              {b ? (
                <p className="mt-2 text-[14px] text-dm-ink/80">
                  <strong className="text-dm-green-dark">Ganha em {b.better}</strong>, <strong className="text-dm-red">perde em {b.worse}</strong>, empata em {b.tie}.
                  <span className="mt-1 block text-[12px] text-dm-ink/50">{s.metrics?.pages} páginas lidas</span>
                </p>
              ) : (
                <p className="mt-2 text-[13px] text-dm-ink/65">{STATUS_TEXT[s.status] ?? "Sem comparação."}</p>
              )}
            </div>
          );
        })}
      </div>

      {metrics.length > 0 && (
        <section aria-labelledby="duelo-itens">
          <h2 id="duelo-itens" className="mb-3 font-display text-[15px] font-extrabold text-dm-ink">Item por item</h2>
          <ul className="space-y-2">
            {metrics.map((m) => (
              <li key={m} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-[13.5px] font-bold text-dm-ink">{METRIC_LABELS[m]}</p>
                <ul className="mt-2 space-y-1.5">
                  {okSites.map((s) => {
                    const v = (r.verdicts[s.name] ?? []).find((x) => x.metric === m);
                    if (!v) return null;
                    const unit = v.unit === "pontos" ? "" : v.unit === "paginas" ? " páginas" : " posts";
                    return (
                      <li key={s.url} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-dm-ink/75">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls[v.result]}`}>{word[v.result]}</span>
                        <span>Demakine <strong className="tabular-nums">{v.ours}{unit}</strong></span>
                        <span>{s.name} <strong className="tabular-nums">{v.theirs}{unit}</strong></span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="duelo-acoes">
        <h2 id="duelo-acoes" className="mb-1 font-display text-[15px] font-extrabold text-dm-ink">O que fazer para ganhar</h2>
        <p className="mb-3 text-[12.5px] text-dm-ink/55">Ordenado do maior buraco para o menor.</p>
        {r.actions.length === 0 ? (
          <p className="rounded-2xl bg-dm-green/10 p-4 text-[13.5px] font-semibold text-dm-green-dark">A Demakine não perde em nenhum item. Continue assim.</p>
        ) : (
          <ul className="space-y-3">
            {r.actions.map((a) => (
              <li key={a.metric} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-extrabold text-dm-ink">{a.title}</h3>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-bold text-amber-900">{EFFORT[a.effort]}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-dm-ink/70">{a.how}</p>
                {a.pages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.pages.map((p) => (
                      <button key={p.path} type="button" onClick={() => go("paginas", p.path)} className="rounded-full border border-black/10 px-3 py-1 text-[12px] font-semibold text-dm-blue hover:bg-dm-blue/5">{p.label}</button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Guerra é Guerra: cadastra até 2 concorrentes, roda o duelo e mostra o placar, item por item e o que fazer. */
export function Duel({ go }: PanelProps) {
  const q = useConcorrentes();
  const duel = useDuelar();
  if (q.isPending) return <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>;
  if (q.isError) return <Card><p className="text-[13.5px] font-semibold text-dm-red">{q.error.message}</p></Card>;
  const { competitors, latest, running } = q.data;
  const live = duel.busy ? duel.progress : running;
  return (
    <div className="space-y-6">
      <Form key={competitors.map((c) => c.url).join("|")} initial={competitors} />
      <div className="flex flex-wrap items-center gap-4">
        <Btn onClick={duel.run} disabled={duel.busy || Boolean(running) || competitors.length === 0} className="inline-flex items-center gap-2">
          <RefreshCw size={15} className={duel.busy || running ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
          {duel.busy || running ? "Duelando..." : "Duelar agora"}
        </Btn>
        <p className="text-[12.5px] text-dm-ink/60" role="status" aria-live="polite">
          {live ? `${live.done} de ${live.total} páginas lidas` : latest ? `Último duelo ${formatWhen(latest.at)}. Roda sozinho toda segunda, às 8h.` : "Roda sozinho toda segunda, às 8h."}
        </p>
        {duel.error && <p className="text-[12.5px] font-semibold text-dm-red" role="alert">{duel.error}</p>}
      </div>
      {competitors.length === 0 && <EmptyState icon={<Swords size={32} aria-hidden="true" />} title="Cadastre um concorrente" text="Informe o nome e o site de um ou dois concorrentes e clique em Duelar agora." />}
      {competitors.length > 0 && !latest && !live && <EmptyState icon={<Swords size={32} aria-hidden="true" />} title="Nenhum duelo ainda" text="Clique em Duelar agora. Leva alguns minutos, porque lemos 1 página por segundo para não incomodar o site deles." />}
      {latest && <Result r={latest} go={go} />}
    </div>
  );
}
