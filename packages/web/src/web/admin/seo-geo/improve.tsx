import { useMemo, useState } from "react";
import { CircleCheck, ExternalLink } from "lucide-react";
import { Btn, Card } from "../ui";
import { EmptyState } from "../charts";
import { usePaginas, useResumo, type IssueRow } from "./data";
import { sortIssues } from "./model";
import type { PanelProps } from ".";

const SEVERITY = {
  critico: { label: "Crítico", cls: "bg-dm-red/10 text-dm-red" },
  atencao: { label: "Atenção", cls: "bg-amber-100 text-amber-900" },
  info: { label: "Informação", cls: "bg-dm-blue/10 text-dm-blue" },
} as const;

type Filter = "todos" | IssueRow["severity"];
const PAGE_SIZE = 40;

/** O que melhorar: problemas abertos, os mais importantes primeiro, cada um com a correção e o atalho para a página. */
export function Improve({ go }: PanelProps) {
  const resumo = useResumo();
  const paginas = usePaginas();
  const [filter, setFilter] = useState<Filter>("todos");
  const [shown, setShown] = useState(PAGE_SIZE);

  const pagesByPath = useMemo(() => new Map((paginas.data ?? []).map((p) => [p.path, p])), [paginas.data]);
  const issues = useMemo(() => sortIssues(resumo.data?.issues ?? [], pagesByPath), [resumo.data, pagesByPath]);

  if (resumo.isPending) return <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>;
  if (resumo.isError) {
    return (
      <Card>
        <p className="text-[13.5px] font-semibold text-dm-red">{resumo.error.message}</p>
      </Card>
    );
  }
  if (!resumo.data.latest) {
    return (
      <EmptyState
        icon={<CircleCheck size={32} aria-hidden="true" />}
        title="Ainda não há auditoria"
        text="Faça a primeira auditoria na aba Visão geral. Depois, os problemas encontrados aparecem aqui, do mais importante para o menos importante."
      />
    );
  }

  const count = (s: IssueRow["severity"]) => issues.filter((i) => i.severity === s).length;
  const filtered = filter === "todos" ? issues : issues.filter((i) => i.severity === filter);
  const chips: { id: Filter; label: string; n: number }[] = [
    { id: "todos", label: "Todos", n: issues.length },
    { id: "critico", label: "Críticos", n: count("critico") },
    { id: "atencao", label: "Atenção", n: count("atencao") },
    { id: "info", label: "Informação", n: count("info") },
  ];

  if (issues.length === 0) {
    return (
      <EmptyState
        icon={<CircleCheck size={32} aria-hidden="true" />}
        title="Nada para melhorar agora"
        text="A última auditoria não achou problemas. Se alguém mudar uma página, a próxima auditoria avisa."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por gravidade">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filter === c.id}
            onClick={() => {
              setFilter(c.id);
              setShown(PAGE_SIZE);
            }}
            className={`min-h-[38px] rounded-full px-4 text-[12.5px] font-bold transition-colors ${filter === c.id ? "bg-dm-blue text-white" : "bg-white text-dm-ink/70 shadow-sm hover:bg-black/[0.04]"}`}
          >
            {c.label} <span className="tabular-nums opacity-70">{c.n}</span>
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.slice(0, shown).map((i) => {
          const page = pagesByPath.get(i.path);
          const sev = SEVERITY[i.severity];
          return (
            <li key={`${i.path}-${i.code}`} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${sev.cls}`}>{sev.label}</span>
                <span className="text-[13px] font-extrabold text-dm-ink">{page?.label ?? i.path}</span>
                <span className="break-all font-mono text-[11.5px] text-dm-ink/45">{i.path}</span>
              </div>
              <p className="mt-2 text-[14px] font-semibold text-dm-ink">{i.message}</p>
              {i.fix && (
                <p className="mt-1 text-[13px] leading-relaxed text-dm-ink/65">
                  <span className="font-bold text-dm-ink/80">Como resolver: </span>
                  {i.fix}
                </p>
              )}
              <Btn tone="ghost" onClick={() => go("paginas", i.path)} className="mt-3 inline-flex items-center gap-2">
                <ExternalLink size={14} aria-hidden="true" />
                Abrir a página
              </Btn>
            </li>
          );
        })}
      </ul>

      {filtered.length > shown && (
        <Btn tone="ghost" onClick={() => setShown((n) => n + PAGE_SIZE)}>
          Mostrar mais ({filtered.length - shown})
        </Btn>
      )}
    </div>
  );
}
