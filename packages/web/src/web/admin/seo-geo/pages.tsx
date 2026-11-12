import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Btn, Card, inputCls } from "../ui";
import { EmptyState } from "../charts";
import { usePaginas, type PageRow } from "./data";
import { AREA_LABELS, AREA_ORDER, scoreColor } from "./model";
import { PageEditor } from "./page-editor";
import { SCORE_TONE } from "./score-ring";
import type { PanelProps } from ".";

const PAGE_SIZE = 50;
type Sort = "endereco" | "menor" | "maior";

function ScoreChip({ n }: { n: number | null }) {
  if (n === null) return <span className="rounded-full bg-black/5 px-2.5 py-1 text-[12px] font-bold text-dm-ink/45" aria-label="Sem nota">–</span>;
  const tone = SCORE_TONE[scoreColor(n)];
  return (
    <span className="min-w-[44px] rounded-full px-2.5 py-1 text-center text-[13px] font-extrabold tabular-nums" style={{ background: tone.soft, color: tone.text }} aria-label={`Nota ${n}`}>
      {n}
    </span>
  );
}

function Tag({ children, tone = "gray" }: { children: string; tone?: "gray" | "red" | "blue" }) {
  const cls = tone === "red" ? "bg-dm-red/10 text-dm-red" : tone === "blue" ? "bg-dm-blue/10 text-dm-blue" : "bg-black/5 text-dm-ink/60";
  return <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${cls}`}>{children}</span>;
}

/** Estado da página para o Google, em palavras. */
export function stateTags(p: Pick<PageRow, "hiddenByPanel" | "technical" | "inSitemap" | "audited" | "lang">) {
  const tags: { text: string; tone: "gray" | "red" | "blue" }[] = [];
  if (p.hiddenByPanel) tags.push({ text: "Oculta do Google", tone: "red" });
  else if (p.technical) tags.push({ text: "Técnica", tone: "gray" });
  else if (!p.inSitemap) tags.push({ text: "Fora do sitemap", tone: "gray" });
  if (!p.audited) tags.push({ text: "Não auditada", tone: "blue" });
  if (p.lang !== "pt") tags.push({ text: p.lang, tone: "gray" });
  return tags;
}

/** Todas as páginas do site, com busca e filtros. Clicar abre o editor de SEO daquela página. */
export function Pages({ go, path }: PanelProps) {
  const q = usePaginas();
  const [term, setTerm] = useState("");
  const [area, setArea] = useState("");
  const [lang, setLang] = useState("");
  const [sort, setSort] = useState<Sort>("endereco");
  const [shown, setShown] = useState(PAGE_SIZE);

  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    const list = (q.data ?? []).filter((p) => (!area || p.area === area) && (!lang || p.lang === lang) && (!t || p.path.toLowerCase().includes(t) || p.label.toLowerCase().includes(t)));
    const score = (p: PageRow) => p.seoScore ?? (sort === "menor" ? 101 : -1);
    return [...list].sort((a, b) => (sort === "endereco" ? a.path.localeCompare(b.path) : sort === "menor" ? score(a) - score(b) : score(b) - score(a)) || a.path.localeCompare(b.path));
  }, [q.data, term, area, lang, sort]);

  if (path) return <PageEditor key={path} path={path} go={go} />;

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

  const all = q.data;
  const notAudited = all.filter((p) => !p.audited).length;
  const hidden = all.filter((p) => p.hiddenByPanel).length;
  const reset = () => setShown(PAGE_SIZE);

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-dm-ink/60">
        <strong className="text-dm-ink">{all.length}</strong> páginas no total
        {notAudited > 0 && <>, {notAudited} ainda não auditadas</>}
        {hidden > 0 && <>, {hidden} ocultas do Google</>}. Página nova criada no painel aparece aqui na hora.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Buscar página</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dm-ink/40" aria-hidden="true" />
          <input value={term} onChange={(e) => { setTerm(e.target.value); reset(); }} placeholder="Buscar por nome ou endereço" className={`${inputCls} pl-9`} />
        </label>
        <label>
          <span className="sr-only">Área</span>
          <select value={area} onChange={(e) => { setArea(e.target.value); reset(); }} className={inputCls}>
            <option value="">Todas as áreas</option>
            {[...AREA_ORDER, "tecnica" as const].map((a) => (
              <option key={a} value={a}>
                {AREA_LABELS[a]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Idioma</span>
          <select value={lang} onChange={(e) => { setLang(e.target.value); reset(); }} className={inputCls}>
            <option value="">Todos os idiomas</option>
            <option value="pt">Português</option>
            <option value="en">Inglês</option>
            <option value="es">Espanhol</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Ordem</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={inputCls}>
            <option value="endereco">Por endereço</option>
            <option value="menor">Menor nota primeiro</option>
            <option value="maior">Maior nota primeiro</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Search size={30} aria-hidden="true" />} title="Nenhuma página encontrada" text="Mude a busca ou os filtros." />
      ) : (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {rows.slice(0, shown).map((p) => (
            <li key={p.path}>
              <button type="button" onClick={() => go("paginas", p.path)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-dm-surface/70 focus-visible:bg-dm-surface/70 focus-visible:outline-none sm:px-5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold text-dm-ink">{p.label}</span>
                  <span className="block truncate font-mono text-[11.5px] text-dm-ink/45">{p.path}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11.5px] text-dm-ink/50">{AREA_LABELS[p.area]}</span>
                    {stateTags(p).map((t) => (
                      <Tag key={t.text} tone={t.tone}>
                        {t.text}
                      </Tag>
                    ))}
                  </span>
                </span>
                <ScoreChip n={p.seoScore} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {rows.length > shown && (
        <Btn tone="ghost" onClick={() => setShown((n) => n + PAGE_SIZE)}>
          Mostrar mais ({rows.length - shown})
        </Btn>
      )}
    </div>
  );
}
