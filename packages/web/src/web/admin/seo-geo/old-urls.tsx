import { useState } from "react";
import { Btn, Card, inputCls } from "../ui";
import { useCreateRedirects, useTestOld, type OldUrlRow } from "./data";
import type { PanelProps } from ".";

type Pick = { on: boolean; to: string };

/** Importador de endereços antigos: cola a lista, vê quais dão erro hoje e cria os 301 de uma vez. */
export function OldUrls(_: PanelProps) {
  const test = useTestOld();
  const create = useCreateRedirects();
  const [text, setText] = useState("");
  const [picks, setPicks] = useState<Record<string, Pick>>({});

  const run = () =>
    test.mutate(text, {
      onSuccess: (r) => setPicks(Object.fromEntries(r.results.filter((x) => x.needsRedirect).map((x) => [x.path, { on: Boolean(x.suggested), to: x.suggested ?? "" }]))),
    });
  const set = (path: string, patch: Partial<Pick>) => setPicks((p) => ({ ...p, [path]: { ...p[path]!, ...patch } }));
  const chosen = Object.entries(picks).filter(([, v]) => v.on && v.to.trim());
  const r = test.data;
  const label = (x: OldUrlRow) => (x.needsRedirect ? (x.status === 0 ? "Sem resposta" : `Erro ${x.status}`) : x.finalPath ? `Já vai para ${x.finalPath}` : "Página existe");

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Endereços antigos</h2>
        <p className="mt-1 max-w-2xl text-[12.5px] text-dm-ink/55">Cole os endereços do site antigo (um por linha) ou o CSV do Search Console. O painel testa cada um e sugere para onde mandar os que dão erro. Só endereços do próprio site entram.</p>
        <label className="mt-4 block">
          <span className="sr-only">Lista de endereços antigos</span>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={"/produto/esteira-antiga\nhttps://www.demakine.com.br/blog/post-velho"} className={`${inputCls} font-mono text-[12.5px]`} />
        </label>
        <Btn className="mt-3" disabled={!text.trim() || test.isPending} onClick={run}>{test.isPending ? "Testando..." : "Testar"}</Btn>
        {test.isError && <p className="mt-2 text-[13px] font-semibold text-dm-red" role="alert">{test.error.message}</p>}
      </Card>

      {r && (
        <>
          <p className="text-[13px] text-dm-ink/65" aria-live="polite">
            {r.results.length} testados, {r.results.filter((x) => x.needsRedirect).length} precisam de redirecionamento
            {r.rejected.length > 0 && `, ${r.rejected.length} linhas recusadas`}
            {r.truncated && ". A lista passou de 500: teste o resto em outra rodada"}.
          </p>
          {r.rejected.length > 0 && (
            <details className="rounded-xl bg-black/[0.03] p-3 text-[12.5px] text-dm-ink/70">
              <summary className="cursor-pointer font-bold">Ver linhas recusadas</summary>
              <ul className="mt-2 space-y-1">{r.rejected.map((x, i) => <li key={i}><span className="font-mono">{x.raw || "(resto da lista)"}</span>: {x.reason}</li>)}</ul>
            </details>
          )}
          <ul className="space-y-2">
            {r.results.map((x) => (
              <li key={x.path} className="rounded-2xl border border-black/5 bg-white p-3.5 shadow-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {x.needsRedirect && picks[x.path] && (
                    <input type="checkbox" aria-label={`Criar redirecionamento de ${x.path}`} checked={picks[x.path]!.on} onChange={(e) => set(x.path, { on: e.target.checked })} className="h-4 w-4" />
                  )}
                  <span className="break-all font-mono text-[12.5px] text-dm-ink">{x.path}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${x.needsRedirect ? "bg-dm-red/10 text-dm-red" : "bg-dm-green/12 text-dm-green-dark"}`}>{label(x)}</span>
                </div>
                {x.needsRedirect && picks[x.path] && (
                  <label className="mt-2 block">
                    <span className="sr-only">Destino de {x.path}</span>
                    <input value={picks[x.path]!.to} onChange={(e) => set(x.path, { to: e.target.value, on: Boolean(e.target.value.trim()) })} placeholder="Mandar para: /pagina-certa" className={`${inputCls} font-mono text-[12.5px]`} />
                  </label>
                )}
              </li>
            ))}
          </ul>
          {chosen.length > 0 && (
            <Btn disabled={create.isPending} onClick={() => create.mutate(chosen.map(([from, v]) => ({ from, to: v.to.trim() })))}>
              {create.isPending ? "Criando..." : `Criar os ${chosen.length} redirecionamentos selecionados`}
            </Btn>
          )}
          {create.isError && <p className="text-[13px] font-semibold text-dm-red" role="alert">{create.error.message}</p>}
          {create.data && (
            <div className="rounded-xl bg-dm-green/10 p-3.5 text-[13px] text-dm-ink/80" role="status">
              <strong>{create.data.created} criados.</strong>
              {create.data.skipped.length > 0 && (
                <ul className="mt-1 space-y-0.5">{create.data.skipped.map((s) => <li key={s.from}><span className="font-mono">{s.from}</span>: {s.reason}</li>)}</ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
