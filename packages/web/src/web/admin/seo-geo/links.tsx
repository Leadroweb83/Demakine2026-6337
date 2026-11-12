import { useState } from "react";
import { Link2Off, RefreshCw } from "lucide-react";
import { Btn, Card, inputCls } from "../ui";
import { EmptyState } from "../charts";
import { formatWhen } from "./model";
import { useCreateRedirects, useLinks, useVerifyLinks, type LinkResultRow } from "./data";
import type { PanelProps } from ".";

const ORIGIN = "https://www.demakine.com.br";
const pathOf = (url: string) => url.replace(ORIGIN, "") || "/";

function BrokenRow({ link }: { link: LinkResultRow }) {
  const create = useCreateRedirects();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const result = create.data;
  return (
    <li className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-dm-red/10 px-2.5 py-1 text-[11px] font-bold text-dm-red">{link.status === 0 ? "Sem resposta" : `Erro ${link.status}`}</span>
        <span className="break-all font-mono text-[12.5px] text-dm-ink">{pathOf(link.url)}</span>
      </div>
      <p className="mt-2 text-[12.5px] text-dm-ink/60">
        Aparece em: {link.foundOn.slice(0, 3).join(", ") || "não informado"}
        {link.foundOn.length > 3 && ` e mais ${link.foundOn.length - 3}`}
      </p>
      {result ? (
        <p className="mt-2 text-[12.5px] font-semibold text-dm-green-dark" role="status">
          {result.created > 0 ? "Redirecionamento criado." : `Não foi criado: ${result.skipped[0]?.reason ?? "motivo desconhecido"}.`}
        </p>
      ) : open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Mandar para</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="/pagina-certa" className={`${inputCls} font-mono`} />
          </label>
          <Btn disabled={!to.trim() || create.isPending} onClick={() => create.mutate([{ from: pathOf(link.url), to: to.trim() }])}>
            Criar 301
          </Btn>
        </div>
      ) : (
        <Btn tone="ghost" onClick={() => setOpen(true)} className="mt-3">
          Criar redirecionamento
        </Btn>
      )}
      {create.isError && <p className="mt-2 text-[12.5px] font-semibold text-dm-red">{create.error.message}</p>}
    </li>
  );
}

/** Verificador de links: testa os links internos que as páginas mostram e lista os quebrados. */
export function Links(_: PanelProps) {
  const q = useLinks();
  const verify = useVerifyLinks();
  const r = q.data;
  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Links do site</h2>
          <p className="mt-1 text-[12.5px] text-dm-ink/55">Testa os links que as páginas mostram (até 800 endereços) e acha os que dão erro. Precisa de uma auditoria completa feita antes.</p>
          {r && <p className="mt-2 text-[12.5px] text-dm-ink/60">Última verificação {formatWhen(r.at)}: {r.checked} endereços testados{r.truncated && " (a lista foi cortada em 800)"}.</p>}
        </div>
        <Btn onClick={() => verify.mutate()} disabled={verify.isPending} className="inline-flex items-center gap-2">
          <RefreshCw size={15} className={verify.isPending ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
          {verify.isPending ? "Verificando..." : "Verificar agora"}
        </Btn>
      </Card>
      {verify.isError && <p className="text-[13px] font-semibold text-dm-red" role="alert">{verify.error.message}</p>}
      {q.isPending && <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>}
      {q.isSuccess && !r && <EmptyState icon={<Link2Off size={32} aria-hidden="true" />} title="Nenhuma verificação ainda" text="Clique em Verificar agora. Leva menos de um minuto." />}
      {r && r.broken.length === 0 && <EmptyState icon={<Link2Off size={32} aria-hidden="true" />} title="Nenhum link quebrado" text="Todos os links testados responderam." />}
      {r && r.broken.length > 0 && (
        <section aria-labelledby="links-quebrados">
          <h2 id="links-quebrados" className="mb-3 font-display text-[15px] font-extrabold text-dm-ink">Links quebrados ({r.broken.length})</h2>
          <ul className="space-y-3">{r.broken.map((l) => <BrokenRow key={l.url} link={l} />)}</ul>
        </section>
      )}
      {r && r.redirected.length > 0 && (
        <section aria-labelledby="links-redirecionados">
          <h2 id="links-redirecionados" className="mb-1 font-display text-[15px] font-extrabold text-dm-ink">Links que passam por redirecionamento ({r.redirected.length})</h2>
          <p className="mb-3 text-[12.5px] text-dm-ink/55">Funcionam, mas é melhor trocar pelo endereço final.</p>
          <ul className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
            {r.redirected.slice(0, 50).map((l) => (
              <li key={l.url} className="px-4 py-3 font-mono text-[12px] text-dm-ink/75 break-all">{pathOf(l.url)} → {pathOf(l.chain[l.chain.length - 1] ?? l.url)}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
