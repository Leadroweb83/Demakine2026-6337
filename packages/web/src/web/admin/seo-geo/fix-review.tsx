import { useEffect, useRef, useState } from "react";
import { ClipboardCopy, Undo2 } from "lucide-react";
import { Badge, Btn, Card, inputCls } from "../ui";
import { METRIC_LABELS } from "../../../api/lib/seo/duel-metrics";
import { useAplicarCorrecao, useDesfazerCorrecao, useLotesCorrecao, useProposals, usePromptPack, type FixItemRow, type FixOutcome } from "./data";
import { bandText, formatWhen, lengthState, type Fixable } from "./model";

const STATE_CLS = { ok: "text-dm-green-dark", curto: "text-amber-700", longo: "text-amber-700" } as const;
const STATE_WORD = { ok: "dentro da faixa", curto: "curto", longo: "longo" } as const;

function Row({ item, checked, value, onCheck, onText }: { item: FixItemRow; checked: boolean; value: string; onCheck: (v: boolean) => void; onText: (v: string) => void }) {
  const state = lengthState(item.field, value);
  const band = bandText(item.field);
  const long = item.field === "description";
  return (
    <li className="rounded-xl bg-dm-surface/70 p-3">
      <label className="flex items-start gap-2">
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} className="mt-1 h-4 w-4" />
        <span className="min-w-0">
          <strong className="text-[13.5px] text-dm-ink">{item.label}</strong> <span className="font-mono text-[11.5px] text-dm-ink/50">{item.path}</span>
        </span>
      </label>
      {item.field === "alt" && item.target && <img src={item.target} alt="" loading="lazy" width={56} height={56} className="mt-2 h-14 w-14 rounded-lg bg-white object-cover" />}
      <p className="mt-2 text-[12.5px] text-dm-ink/70">
        <span className="mr-2 text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">Antes</span>
        {item.before || "(vazio)"}
      </p>
      <label className="mt-1 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Depois</span>
        {long ? (
          <textarea value={value} rows={3} maxLength={400} onChange={(e) => onText(e.target.value)} className={`${inputCls} mt-1`} />
        ) : (
          <input value={value} maxLength={item.field === "title" ? 150 : 520} onChange={(e) => onText(e.target.value)} className={`${inputCls} mt-1 ${item.field === "ogImage" ? "font-mono text-[12.5px]" : ""}`} />
        )}
      </label>
      <p className={`mt-1 text-[12px] font-semibold ${STATE_CLS[state]}`}>
        {value.trim().length} caracteres{band ? `, ideal ${band}` : ""} ({STATE_WORD[state]})
      </p>
    </li>
  );
}

/** Tela de revisão do "Corrigir": antes e depois de cada página do grupo, aplicar só o marcado e desfazer o lote. */
export function FixReview({ metric, title, explanation, onClose }: { metric: Fixable; title: string; explanation: string; onClose: () => void }) {
  const q = useProposals(metric);
  const apply = useAplicarCorrecao(metric);
  const undo = useDesfazerCorrecao();
  const [text, setText] = useState<Record<string, string>>({});
  const [off, setOff] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<FixOutcome | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  const items = q.data?.items ?? [];
  const failing = q.data?.failing ?? 0;
  const valueOf = (i: FixItemRow) => text[i.id] ?? i.after;
  const chosen = items.filter((i) => !off.has(i.id)).map((i) => ({ ...i, after: valueOf(i).trim() }));
  const label = (id: string) => items.find((i) => i.id === id)?.label ?? id;
  const toggle = (id: string, on: boolean) => setOff((s) => { const n = new Set(s); if (on) n.delete(id); else n.add(id); return n; });

  return (
    <Card className="mt-3 border-dm-blue/25">
      <h3 ref={heading} tabIndex={-1} className="font-display text-[15px] font-extrabold text-dm-ink outline-none">Corrigir: {title}</h3>
      <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-dm-ink/70">{explanation}</p>

      {q.isPending && <p className="mt-3 text-[13px] text-dm-ink/55">Montando as propostas...</p>}
      {q.isError && <p className="mt-3 text-[13px] font-semibold text-dm-red" role="alert">{q.error.message}</p>}
      {q.isSuccess && items.length === 0 && !done && failing === 0 && <p className="mt-3 text-[13px] text-dm-ink/65">Nada para corrigir neste item. A auditoria mais recente não achou página com esse problema.</p>}
      {q.isSuccess && items.length === 0 && !done && failing > 0 && (
        <div className="mt-3">
          <p className="max-w-3xl text-[13px] leading-relaxed text-dm-ink/75">
            {failing} {failing === 1 ? "página tem" : "páginas têm"} esse problema, mas a correção é no código do site e não dá para fazer pelo painel (por exemplo, imagens do tema, como logo e ícones). Copie o prompt e cole no Claude.
          </p>
          <PromptButton metric={metric} />
          <div className="mt-3">
            <Btn tone="ghost" onClick={onClose}>Fechar</Btn>
          </div>
        </div>
      )}

      {!done && items.length > 0 && (
        <>
          <p className="mt-3 text-[12.5px] text-dm-ink/60">{items.length} {items.length === 1 ? "item" : "itens"} no grupo. Desmarque o que você não quer mudar e edite o texto se preferir. Nada vai ao ar antes de você clicar em Aplicar.</p>
          <label className="mt-2 flex items-center gap-2 text-[12.5px] font-semibold text-dm-ink/75">
            <input type="checkbox" checked={off.size === 0} onChange={(e) => setOff(e.target.checked ? new Set() : new Set(items.map((i) => i.id)))} className="h-4 w-4" />
            Marcar todos
          </label>
          <ul className="mt-2 space-y-3">
            {items.map((i) => <Row key={i.id} item={i} checked={!off.has(i.id)} value={valueOf(i)} onCheck={(on) => toggle(i.id, on)} onText={(v) => setText((t) => ({ ...t, [i.id]: v }))} />)}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn disabled={apply.isPending || chosen.length === 0} onClick={() => apply.mutate(chosen, { onSuccess: setDone })}>
              {apply.isPending ? "Aplicando..." : `Aplicar marcados (${chosen.length})`}
            </Btn>
            <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
            {apply.isError && <p className="text-[12.5px] font-semibold text-dm-red" role="alert">{apply.error.message}</p>}
          </div>
        </>
      )}

      {done && (
        <div className="mt-3 space-y-3" role="status" aria-live="polite">
          <p className="text-[13.5px] text-dm-ink">
            <strong className="text-dm-green-dark">{done.applied} {done.applied === 1 ? "gravado" : "gravados"}</strong>
            {done.skipped.length > 0 && <>, <strong className="text-amber-700">{done.skipped.length} {done.skipped.length === 1 ? "pulado" : "pulados"}</strong></>}. O site é republicado em até 1 minuto.
          </p>
          {done.skipped.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-[12.5px] text-dm-ink/70">
              {done.skipped.map((s) => <li key={s.id}>{label(s.id)}: {s.reason}</li>)}
            </ul>
          )}
          {undo.data && <p className="text-[12.5px] font-semibold text-dm-green-dark">Desfeito em {undo.data.undone} {undo.data.undone === 1 ? "item" : "itens"}{undo.data.skipped.length > 0 ? `. Pulados: ${undo.data.skipped.map((s) => `${label(s.id)} (${s.reason})`).join("; ")}` : ""}.</p>}
          {undo.isError && <p className="text-[12.5px] font-semibold text-dm-red" role="alert">{undo.error.message}</p>}
          <div className="flex flex-wrap gap-3">
            {done.applied > 0 && !undo.data && (
              <Btn tone="ghost" disabled={undo.isPending} onClick={() => undo.mutate({ batchId: done.batchId })} className="inline-flex items-center gap-2">
                <Undo2 size={14} aria-hidden="true" />
                {undo.isPending ? "Desfazendo..." : "Desfazer este lote"}
              </Btn>
            )}
            <Btn tone="ghost" onClick={onClose}>Fechar</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

/** "Copiar prompt": gera o pacote em JSON da derrota para colar no Claude. Sem permissão da área de transferência, mostra o texto para copiar à mão. */
export function PromptButton({ metric }: { metric: string }) {
  const pack = usePromptPack();
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [text, setText] = useState("");

  async function copy() {
    setState("idle");
    let json: string;
    try {
      json = await pack.mutateAsync(metric);
    } catch {
      return; // o erro aparece abaixo (pack.error)
    }
    setText(json);
    try {
      await navigator.clipboard.writeText(json);
      setState("copied");
    } catch {
      setState("manual");
    }
  }

  return (
    <div className="mt-2">
      <Btn tone="ghost" disabled={pack.isPending} onClick={copy} className="inline-flex items-center gap-2">
        <ClipboardCopy size={14} aria-hidden="true" />
        {pack.isPending ? "Montando..." : "Copiar prompt"}
      </Btn>
      <span className="ml-3 text-[12.5px]" role="status" aria-live="polite">
        {state === "copied" && <span className="font-semibold text-dm-green-dark">Prompt copiado. Cole no Claude.</span>}
        {pack.isError && <span className="font-semibold text-dm-red">{pack.error.message}</span>}
      </span>
      {state === "manual" && (
        <div className="mt-2">
          <p className="text-[12.5px] text-dm-ink/65">Não deu para copiar sozinho. Selecione o texto abaixo e copie.</p>
          <textarea readOnly value={text} rows={8} onFocus={(e) => e.currentTarget.select()} className={`${inputCls} mt-1 font-mono text-[12px]`} aria-label="Prompt em JSON" />
        </div>
      )}
    </div>
  );
}

const STATUS = { aplicando: ["Aplicando", "gray"], aplicado: ["Aplicado", "green"], parcial: ["Parcial", "blue"], desfeito: ["Desfeito", "gray"] } as const;

/** Últimos lotes aplicados, com Desfazer. Some quando ainda não houve nenhum. */
export function Lotes() {
  const q = useLotesCorrecao();
  const undo = useDesfazerCorrecao();
  if (q.isPending) return null;
  if (q.isError) return <p className="text-[12.5px] font-semibold text-dm-red" role="alert">{q.error.message}</p>;
  if (q.data.length === 0) return null;
  return (
    <section aria-labelledby="duelo-lotes">
      <h2 id="duelo-lotes" className="mb-1 font-display text-[15px] font-extrabold text-dm-ink">Correções aplicadas</h2>
      <p className="mb-3 text-[12.5px] text-dm-ink/55">Os 20 lotes mais recentes. Desfazer devolve o texto de antes, só onde ninguém mexeu depois.</p>
      <ul className="space-y-2">
        {q.data.map((b) => {
          const wrote = b.items.filter((i) => i.result !== "pulado").length;
          const [word, tone] = STATUS[b.status];
          return (
            <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-black/5 bg-white p-3 text-[13px] text-dm-ink/80 shadow-sm">
              <Badge tone={tone}>{word}</Badge>
              <span className="font-semibold text-dm-ink">{METRIC_LABELS[b.metric]}</span>
              <span>{formatWhen(b.at)}</span>
              <span>{wrote} {wrote === 1 ? "item" : "itens"}{b.items.length > wrote ? `, ${b.items.length - wrote} pulados` : ""}</span>
              <Btn tone="ghost" disabled={b.status === "desfeito" || b.status === "aplicando" || undo.isPending || wrote === 0} onClick={() => undo.mutate({ batchId: b.id })} className="ml-auto inline-flex items-center gap-1.5">
                <Undo2 size={13} aria-hidden="true" />
                Desfazer
              </Btn>
            </li>
          );
        })}
      </ul>
      {undo.isError && <p className="mt-2 text-[12.5px] font-semibold text-dm-red" role="alert">{undo.error.message}</p>}
      {undo.data && <p className="mt-2 text-[12.5px] font-semibold text-dm-green-dark" role="status">Desfeito em {undo.data.undone} {undo.data.undone === 1 ? "item" : "itens"}{undo.data.skipped.length > 0 ? `, ${undo.data.skipped.length} pulados por edição posterior` : ""}.</p>}
    </section>
  );
}
