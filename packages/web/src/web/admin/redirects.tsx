import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Search, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";

type Item = { id: number; fromPath: string; toPath: string; permanent: boolean; note: string | null; updatedAt: string };

export function AdminRedirects() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-redirecionamentos"],
    queryFn: async () => {
      const res = await api.admin.redirecionamentos.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).items as unknown as Item[];
    },
  });
  const [form, setForm] = useState({ from: "", to: "", permanent: true });
  const [bulk, setBulk] = useState("");
  const [term, setTerm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-redirecionamentos"] });

  const add = useMutation({
    mutationFn: async () => {
      const res = await api.admin.redirecionamentos.$post({ json: form });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível salvar");
    },
    onSuccess: () => {
      setForm({ from: "", to: "", permanent: true });
      setMsg({ ok: true, text: "Redirecionamento salvo. Vale no site em até 1 minuto." });
      refresh();
    },
    onError: (e) => setMsg({ ok: false, text: e.message }),
  });

  const importBulk = useMutation({
    mutationFn: async () => {
      const res = await api.admin.redirecionamentos.lote.$post({ json: { text: bulk } });
      if (!res.ok) throw new Error("Não foi possível importar");
      return (await res.json()) as { saved: number; invalid: string[] };
    },
    onSuccess: (r) => {
      setBulk(r.invalid.join("\n"));
      setMsg({
        ok: !r.invalid.length,
        text: `${r.saved} importados.${r.invalid.length ? ` ${r.invalid.length} linhas com problema ficaram na caixa para corrigir.` : ""}`,
      });
      refresh();
    },
    onError: (e) => setMsg({ ok: false, text: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.admin.redirecionamentos[":id"].$delete({ param: { id: String(id) } });
      if (!res.ok) throw new Error("fail");
    },
    onSuccess: refresh,
  });

  const items = useMemo(
    () => (q.data ?? []).filter((i) => !term.trim() || `${i.fromPath} ${i.toPath}`.toLowerCase().includes(term.trim().toLowerCase())),
    [q.data, term],
  );

  return (
    <div className="space-y-6">
      <PageTitle
        title="Redirecionamentos"
        hint="Quando um endereço muda, mande quem chega pelo antigo para o novo. O redirecionamento permanente (301) faz o Google transferir a posição do endereço antigo."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Novo redirecionamento</h2>
          <form
            className="mt-4 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setMsg(null);
              add.mutate();
            }}
          >
            <Field label="Endereço antigo" hint="Pode colar o link inteiro: /esteira-transportadora-horizontal">
              <input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Vai para" hint="Página do site (/produtos/...) ou link completo com https://">
              <input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className={inputCls} />
            </Field>
            <label className="flex items-center gap-2 text-[13px] text-dm-ink/75">
              <input type="checkbox" checked={form.permanent} onChange={(e) => setForm({ ...form, permanent: e.target.checked })} className="h-4 w-4 accent-dm-blue" />
              Permanente (301). Desmarque só para redirecionamento temporário.
            </label>
            <div>
              <Btn type="submit" disabled={add.isPending || !form.from.trim() || !form.to.trim()}>
                Salvar
              </Btn>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Importar vários</h2>
          <p className="mt-1 text-[12.5px] text-dm-ink/55">
            Um por linha, no formato <code className="rounded bg-black/5 px-1">antigo -&gt; novo</code>. Endereço antigo repetido é atualizado.
          </p>
          <textarea
            rows={7}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={"/esteira-transportadora-horizontal -> /produtos/esteira-transportadora-horizontal\n/produto/rosca-transportadora -> /produtos/rosca-transportadora"}
            aria-label="Lista de redirecionamentos"
            className={cn(inputCls, "mt-3 font-mono text-[12.5px]")}
          />
          <div className="mt-3">
            <Btn tone="ghost" disabled={importBulk.isPending || !bulk.trim()} onClick={() => importBulk.mutate()}>
              Importar
            </Btn>
          </div>
        </Card>
      </div>

      {msg && <p className={`text-[13px] font-semibold ${msg.ok ? "text-dm-green" : "text-dm-red"}`}>{msg.text}</p>}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dm-ink/40" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar endereço" aria-label="Buscar redirecionamento" className={cn(inputCls, "pl-10")} />
          </label>
          <span className="text-[13px] text-dm-ink/55">{q.data?.length ?? 0} cadastrados</span>
        </div>
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-[13px]">
              <a href={i.fromPath} target="_blank" rel="noreferrer" className="min-w-0 break-all font-mono text-dm-ink/70 hover:text-dm-blue" title="Testar">
                {i.fromPath}
              </a>
              <ArrowRight className="h-4 w-4 shrink-0 text-dm-ink/35" />
              <span className="min-w-0 flex-1 break-all font-mono text-dm-ink">{i.toPath}</span>
              <Badge tone={i.permanent ? "blue" : "gray"}>{i.permanent ? "301" : "302"}</Badge>
              <button
                type="button"
                onClick={() => confirm(`Apagar o redirecionamento de ${i.fromPath}?`) && remove.mutate(i.id)}
                className="rounded-md p-1.5 text-dm-red/70 hover:bg-dm-red/10 hover:text-dm-red"
                title="Apagar"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Apagar {i.fromPath}</span>
              </button>
            </li>
          ))}
          {q.isSuccess && !items.length && <li className="px-5 py-8 text-center text-[13.5px] text-dm-ink/50">Nenhum redirecionamento.</li>}
        </ul>
      </div>
    </div>
  );
}
