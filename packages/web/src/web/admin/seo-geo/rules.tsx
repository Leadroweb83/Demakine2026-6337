import { useMemo, useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import { SEO_ITEMS, validateRules, type SeoItem, type SeoRules } from "../../../api/lib/seo/rules";
import { Btn, Card, inputCls } from "../ui";
import { usePaginas, useRegras, useResetRegras, useSaveRegras } from "./data";
import { ITEM_HINTS, ITEM_LABELS } from "./model";

/** Regras em texto, para a pessoa poder apagar o campo e digitar de novo sem a tela brigar. */
type Draft = {
  weights: Record<SeoItem, string>;
  titleMin: string;
  titleMax: string;
  descMin: string;
  descMax: string;
  words: string;
  inlinks: string;
  outlinks: string;
  priority: string[];
};

const toDraft = (r: SeoRules): Draft => ({
  weights: Object.fromEntries(SEO_ITEMS.map((k) => [k, String(r.weights[k])])) as Record<SeoItem, string>,
  titleMin: String(r.title.min),
  titleMax: String(r.title.max),
  descMin: String(r.description.min),
  descMax: String(r.description.max),
  words: String(r.commercialMinWords),
  inlinks: String(r.minInlinks),
  outlinks: String(r.minOutlinks),
  priority: r.priorityPaths,
});

const num = (s: string) => (s.trim() === "" ? Number.NaN : Number(s));
const fromDraft = (d: Draft): unknown => ({
  weights: Object.fromEntries(SEO_ITEMS.map((k) => [k, num(d.weights[k])])),
  title: { min: num(d.titleMin), max: num(d.titleMax) },
  description: { min: num(d.descMin), max: num(d.descMax) },
  commercialMinWords: num(d.words),
  minInlinks: num(d.inlinks),
  minOutlinks: num(d.outlinks),
  priorityPaths: d.priority,
});

function NumberField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">{label}</span>
      <input type="number" inputMode="numeric" min={0} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} mt-1.5`} />
      {hint && <span className="mt-1 block text-[12px] text-dm-ink/50">{hint}</span>}
    </label>
  );
}

function Editor({ initial, defaults }: { initial: SeoRules; defaults: SeoRules }) {
  const save = useSaveRegras();
  const reset = useResetRegras();
  const pages = usePaginas();
  const [saved, setSaved] = useState<SeoRules>(initial);
  const [d, setD] = useState<Draft>(() => toDraft(initial));
  const [newPath, setNewPath] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const parsed = useMemo(() => validateRules(fromDraft(d)), [d]);
  const total = SEO_ITEMS.reduce((s, k) => s + (Number.isFinite(num(d.weights[k])) ? num(d.weights[k]) : 0), 0);
  const dirty = JSON.stringify(parsed.ok ? parsed.rules : fromDraft(d)) !== JSON.stringify(saved);
  const setWeight = (k: SeoItem, v: string) => {
    setD((x) => ({ ...x, weights: { ...x.weights, [k]: v } }));
    setDone(null);
  };
  const set = (patch: Partial<Draft>) => {
    setD((x) => ({ ...x, ...patch }));
    setDone(null);
  };
  const addPath = () => {
    const p = newPath.trim();
    if (!p) return;
    if (!d.priority.includes(p)) set({ priority: [...d.priority, p] });
    setNewPath("");
  };
  const sumOk = Math.abs(total - 100) < 1e-9;

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Pesos da nota</h2>
            <p className="mt-1 max-w-xl text-[12.5px] text-dm-ink/55">Quantos pontos cada item vale na nota de 0 a 100 de cada página. A soma precisa dar exatamente 100.</p>
          </div>
          <p className={`rounded-full px-3 py-1.5 text-[13px] font-extrabold tabular-nums ${sumOk ? "bg-dm-green/12 text-dm-green-dark" : "bg-dm-red/10 text-dm-red"}`} role="status" aria-live="polite">
            Soma: {total}
            {!sumOk && ` (${total < 100 ? `faltam ${100 - total}` : `passou ${total - 100}`})`}
          </p>
        </div>
        <ul className="mt-4 divide-y divide-black/5">
          {SEO_ITEMS.map((k) => (
            <li key={k} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <label htmlFor={`peso-${k}`} className="block text-[13.5px] font-bold text-dm-ink">
                  {ITEM_LABELS[k]}
                </label>
                <p className="text-[12px] leading-snug text-dm-ink/55">{ITEM_HINTS[k]}</p>
              </div>
              <input id={`peso-${k}`} type="number" inputMode="numeric" min={0} max={100} value={d.weights[k]} onChange={(e) => setWeight(k, e.target.value)} className={`${inputCls} !w-20 shrink-0 text-center tabular-nums`} />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Limites</h2>
        <p className="mt-1 text-[12.5px] text-dm-ink/55">O que conta como tamanho certo. Fora da faixa, a página perde pontos aos poucos, não tudo de uma vez.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="Título: mínimo" value={d.titleMin} onChange={(v) => set({ titleMin: v })} hint="caracteres" />
          <NumberField label="Título: máximo" value={d.titleMax} onChange={(v) => set({ titleMax: v })} hint="caracteres" />
          <NumberField label="Descrição: mínimo" value={d.descMin} onChange={(v) => set({ descMin: v })} hint="caracteres" />
          <NumberField label="Descrição: máximo" value={d.descMax} onChange={(v) => set({ descMax: v })} hint="caracteres" />
          <NumberField label="Texto da página comercial" value={d.words} onChange={(v) => set({ words: v })} hint="palavras, no mínimo" />
          <NumberField label="Links que a página recebe" value={d.inlinks} onChange={(v) => set({ inlinks: v })} hint="de outras páginas, no mínimo" />
          <NumberField label="Links que a página envia" value={d.outlinks} onChange={(v) => set({ outlinks: v })} hint="para outras páginas, no mínimo" />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Páginas prioritárias</h2>
        <p className="mt-1 max-w-xl text-[12.5px] text-dm-ink/55">Contam 3 vezes mais na nota do site. Use o endereço da página, ou termine com /* para valer para tudo abaixo (por exemplo, /produtos/*).</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Páginas prioritárias">
          {d.priority.map((p) => (
            <li key={p} className="inline-flex items-center gap-1.5 rounded-full bg-dm-blue/10 py-1 pl-3 pr-1.5 font-mono text-[12px] text-dm-blue">
              {p}
              <button type="button" aria-label={`Remover ${p}`} onClick={() => set({ priority: d.priority.filter((x) => x !== p) })} className="rounded-full p-1 hover:bg-dm-blue/15">
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
          {d.priority.length === 0 && <li className="text-[12.5px] text-dm-ink/50">Nenhuma: todas as páginas pesam igual.</li>}
        </ul>
        <div className="mt-3 flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Endereço da página prioritária</span>
            <input value={newPath} onChange={(e) => setNewPath(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPath())} list="seo-paginas-lista" placeholder="/a-empresa" className={`${inputCls} font-mono`} />
          </label>
          <datalist id="seo-paginas-lista">
            {(pages.data ?? []).slice(0, 400).map((p) => (
              <option key={p.path} value={p.path}>
                {p.label}
              </option>
            ))}
          </datalist>
          <Btn tone="ghost" onClick={addPath} className="inline-flex shrink-0 items-center gap-1.5">
            <Plus size={14} aria-hidden="true" /> Adicionar
          </Btn>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Btn
          disabled={!parsed.ok || !dirty || save.isPending}
          onClick={() => {
            if (!parsed.ok) return;
            save.mutate(parsed.rules, {
              onSuccess: () => {
                setSaved(parsed.rules);
                setDone("Regras salvas. A próxima auditoria já usa elas: na Visão geral, clique em Auditar agora para ver o efeito.");
              },
            });
          }}
        >
          {save.isPending ? "Salvando..." : "Salvar regras"}
        </Btn>
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-dm-ink/55 hover:text-dm-ink">
            <RotateCcw size={14} aria-hidden="true" /> Voltar ao padrão
          </button>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-2 text-[12.5px] text-dm-ink/70">
            Descartar as regras salvas e usar o padrão?
            <Btn
              tone="danger"
              disabled={reset.isPending}
              onClick={() =>
                reset.mutate(undefined, {
                  onSuccess: (rules) => {
                    setD(toDraft(rules));
                    setSaved(rules);
                    setConfirmReset(false);
                    setDone("Voltou ao padrão.");
                  },
                })
              }
            >
              Sim, voltar
            </Btn>
            <Btn tone="ghost" onClick={() => setConfirmReset(false)}>
              Não
            </Btn>
          </span>
        )}
      </div>

      <div aria-live="polite" className="space-y-1">
        {!parsed.ok && (
          <ul className="space-y-0.5">
            {parsed.errors.map((e) => (
              <li key={e} className="text-[12.5px] font-semibold text-dm-red">
                {e}
              </li>
            ))}
          </ul>
        )}
        {save.isError && <p className="text-[12.5px] font-semibold text-dm-red">{save.error.message}</p>}
        {reset.isError && <p className="text-[12.5px] font-semibold text-dm-red">{reset.error.message}</p>}
        {done && !dirty && <p className="text-[12.5px] font-semibold text-dm-green-dark">{done}</p>}
        <p className="text-[12px] text-dm-ink/45">Padrão: título {defaults.title.min} a {defaults.title.max}, descrição {defaults.description.min} a {defaults.description.max}, {defaults.commercialMinWords} palavras em página comercial.</p>
      </div>
    </div>
  );
}

/** Regras da nota de SEO: pesos (somam 100), limites e páginas prioritárias. Salvar com soma errada é recusado. */
export function Rules() {
  const q = useRegras();
  if (q.isPending) return <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>;
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
  return <Editor initial={q.data.rules} defaults={q.data.defaults} />;
}
