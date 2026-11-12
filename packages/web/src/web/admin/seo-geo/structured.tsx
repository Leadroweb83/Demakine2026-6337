import { useState } from "react";
import { Card } from "../ui";
import { useEstruturados } from "./data";
import type { PanelProps } from ".";

const LEVEL = { ok: "bg-dm-green/12 text-dm-green-dark", faltando: "bg-amber-100 text-amber-900", erro: "bg-dm-red/10 text-dm-red" } as const;
const LABEL = { ok: "Ok", faltando: "Falta", erro: "Erro" } as const;

/** Dados estruturados por página: o que o Google lê e o que falta. */
export function Structured(_: PanelProps) {
  const q = useEstruturados();
  const [onlyProblems, setOnlyProblems] = useState(true);
  if (q.isPending) return <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>;
  if (q.isError) return <Card><p className="text-[13.5px] font-semibold text-dm-red">{q.error.message}</p></Card>;
  const pages = q.data.filter((p) => !onlyProblems || p.findings.some((f) => f.level !== "ok"));
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-[13px] font-semibold text-dm-ink/70">
        <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} className="h-4 w-4" /> Mostrar só páginas com problema
      </label>
      {pages.length === 0 && <Card><p className="text-[13.5px] text-dm-ink/65">{q.data.length === 0 ? "Ainda não há auditoria." : "Nenhuma página com problema de dados estruturados."}</p></Card>}
      <ul className="space-y-3">
        {pages.slice(0, 60).map((p) => (
          <li key={p.path} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-[13.5px] font-bold text-dm-ink">{p.label} <span className="font-mono text-[11.5px] font-normal text-dm-ink/45">{p.path}</span></p>
            <ul className="mt-2 space-y-1">
              {p.findings.map((f, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 text-[12.5px] text-dm-ink/75">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${LEVEL[f.level]}`}>{LABEL[f.level]}</span>
                  <span className="font-bold">{f.type}</span> {f.message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {pages.length > 60 && <p className="text-[12.5px] text-dm-ink/55">Mostrando 60 de {pages.length} páginas.</p>}
    </div>
  );
}
