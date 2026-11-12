import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Btn, Card, inputCls } from "../ui";
import { EmptyState } from "../charts";
import { useImagens, useSaveAlt, type ImageIssueRow } from "./data";
import type { PanelProps } from ".";

const PROBLEM = { "sem-alt": "Sem descrição (alt)", "nome-numerico": "Nome do arquivo só com número", pesada: "Arquivo pesado" } as const;
const PAGE_SIZE = 40;

function Row({ issue }: { issue: ImageIssueRow }) {
  const save = useSaveAlt();
  const [alt, setAlt] = useState("");
  return (
    <li className="flex gap-3 rounded-2xl border border-black/5 bg-white p-3.5 shadow-sm">
      <img src={issue.src} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg border border-black/10 object-cover" />
      <div className="min-w-0 flex-1">
        <p className="break-all font-mono text-[11.5px] text-dm-ink/55">{issue.src.replace("https://www.demakine.com.br", "")}</p>
        <p className="mt-0.5 text-[12px] text-dm-ink/60">Em {issue.page}</p>
        <p className="mt-1 flex flex-wrap gap-1.5">
          {issue.problems.map((p) => (
            <span key={p} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-bold text-amber-900">
              {PROBLEM[p]}
              {p === "pesada" && issue.bytes ? ` (${Math.round(issue.bytes / 1024)} KB)` : ""}
            </span>
          ))}
        </p>
        {issue.product && issue.problems.includes("sem-alt") && (
          <div className="mt-2 flex flex-wrap gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Descrição da foto</span>
              <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={150} placeholder="O que a foto mostra, em uma frase" className={inputCls} />
            </label>
            <Btn disabled={!alt.trim() || save.isPending || save.isSuccess} onClick={() => save.mutate({ slug: issue.product!, src: issue.src, alt })}>
              {save.isSuccess ? "Salvo" : "Salvar"}
            </Btn>
          </div>
        )}
        {save.isSuccess && <p className="mt-1 text-[12px] font-semibold text-dm-green-dark">Salvo. Vai ao ar em cerca de 1 a 2 minutos.</p>}
        {save.isError && <p className="mt-1 text-[12px] font-semibold text-dm-red">{save.error.message}</p>}
      </div>
    </li>
  );
}

/** Imagens com problema (sem descrição, nome numérico, pesadas); nas fotos de produto dá para escrever a descrição aqui. */
export function Images(_: PanelProps) {
  const q = useImagens();
  const [shown, setShown] = useState(PAGE_SIZE);
  if (q.isPending) return <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>;
  if (q.isError) return <Card><p className="text-[13.5px] font-semibold text-dm-red">{q.error.message}</p></Card>;
  if (q.data.length === 0) return <EmptyState icon={<ImageOff size={32} aria-hidden="true" />} title="Nenhuma imagem com problema" text="Ou a auditoria ainda não rodou, ou todas as fotos estão com descrição e nome bom." />;
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-dm-ink/60">{q.data.length} imagens com problema. A descrição (alt) ajuda o Google a entender a foto e a mostrá-la na busca de imagens.</p>
      <ul className="space-y-3">{q.data.slice(0, shown).map((i) => <Row key={`${i.page}-${i.src}`} issue={i} />)}</ul>
      {q.data.length > shown && <Btn tone="ghost" onClick={() => setShown((n) => n + PAGE_SIZE)}>Mostrar mais ({q.data.length - shown})</Btn>}
    </div>
  );
}
