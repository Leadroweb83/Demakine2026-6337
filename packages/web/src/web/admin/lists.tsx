import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { DEFAULT_CLIENTS, DEFAULT_TESTIMONIALS, type Client, type Testimonial } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Btn, PageTitle, inputCls } from "./ui";
import { MediaPicker } from "./media";

type Doc = { key: string; data: { items?: unknown[] }; updatedAt: string; updatedBy: string | null };

function useLists() {
  return useQuery({
    queryKey: ["admin-conteudo", "lista"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "lista" } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).docs as unknown as Doc[];
    },
  });
}

function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

function SaveBar({ listKey, items, edited, onReset }: { listKey: string; items: unknown[]; edited: boolean; onReset: () => void }) {
  const qc = useQueryClient();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$put({ param: { collection: "lista", key: listKey }, json: { data: { items } } });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Não foi possível salvar");
    },
    onSuccess: () => {
      setMsg({ ok: true, text: "Salvo. O site atualiza em até 1 minuto." });
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "lista"] });
    },
    onError: (e) => setMsg({ ok: false, text: e.message }),
  });
  const reset = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "lista", key: listKey } });
      if (!res.ok) throw new Error("Não foi possível restaurar");
    },
    onSuccess: () => {
      onReset();
      setMsg({ ok: true, text: "Voltou à lista original." });
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "lista"] });
    },
  });
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur">
      <Btn onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending ? "Salvando..." : "Salvar lista"}
      </Btn>
      <span className="text-[12.5px] text-dm-ink/55">{items.length} itens</span>
      {msg && <span className={`text-[13px] font-semibold ${msg.ok ? "text-dm-green" : "text-dm-red"}`}>{msg.text}</span>}
      {edited && (
        <button
          type="button"
          onClick={() => confirm("Voltar para a lista original do site?") && reset.mutate()}
          className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Voltar ao original
        </button>
      )}
    </div>
  );
}

export function AdminLists() {
  const docs = useLists();
  const [tab, setTab] = useState<"clientes" | "depoimentos">("clientes");
  const doc = (k: string) => docs.data?.find((d) => d.key === k);

  return (
    <div className="space-y-6">
      <PageTitle title="Clientes e depoimentos" hint="Logos da faixa de clientes e da página Clientes, e os depoimentos exibidos no site." />
      <div className="flex gap-1 rounded-full bg-black/[0.04] p-1 sm:inline-flex">
        {(
          [
            ["clientes", "Logos de clientes"],
            ["depoimentos", "Depoimentos"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className={cn(
              "flex-1 whitespace-nowrap rounded-full px-5 py-2 text-[12.5px] font-bold uppercase tracking-wide",
              tab === k ? "bg-white text-dm-ink shadow-sm" : "text-dm-ink/55 hover:text-dm-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {docs.isPending ? (
        <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>
      ) : tab === "clientes" ? (
        <ClientsEditor key={doc("clientes")?.updatedAt ?? "original"} initial={(doc("clientes")?.data.items as Client[] | undefined) ?? [...DEFAULT_CLIENTS]} edited={!!doc("clientes")} />
      ) : (
        <TestimonialsEditor
          key={doc("depoimentos")?.updatedAt ?? "original"}
          initial={(doc("depoimentos")?.data.items as Testimonial[] | undefined) ?? [...DEFAULT_TESTIMONIALS]}
          edited={!!doc("depoimentos")}
        />
      )}
    </div>
  );
}

function ClientsEditor({ initial, edited }: { initial: Client[]; edited: boolean }) {
  const [items, setItems] = useState(initial);
  const [picking, setPicking] = useState<number | null>(null);
  const segments = [...new Set(items.map((c) => c.segment).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const set = (i: number, patch: Partial<Client>) => setItems((l) => l.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <>
      <datalist id="segmentos-clientes">
        {segments.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => (
          <div key={c.id} className="flex gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
            <button type="button" onClick={() => setPicking(i)} className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-black/15 bg-white" title="Trocar logo">
              {c.logo ? <img src={c.logo} alt={c.name} className="max-h-full max-w-full object-contain p-1" /> : <ImagePlus className="h-5 w-5 text-dm-ink/35" />}
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              <input value={c.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Nome" aria-label="Nome do cliente" className={cn(inputCls, "py-1.5 text-[13px] font-semibold")} />
              <input value={c.segment} onChange={(e) => set(i, { segment: e.target.value })} list="segmentos-clientes" placeholder="Setor" aria-label="Setor" className={cn(inputCls, "py-1.5 text-[12.5px]")} />
              <div className="flex">
                <button type="button" onClick={() => setItems((l) => move(l, i, -1))} className="rounded p-1 text-dm-ink/45 hover:text-dm-ink" title="Antes">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setItems((l) => move(l, i, 1))} className="rounded p-1 text-dm-ink/45 hover:text-dm-ink" title="Depois">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} className="ml-auto rounded p-1 text-dm-red/70 hover:text-dm-red" title="Remover">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((l) => [...l, { id: Math.max(0, ...l.map((c) => c.id)) + 1, name: "", segment: "", logo: "" }])}
          className="flex min-h-[104px] items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 text-[13px] font-bold text-dm-blue hover:border-dm-blue/40"
        >
          <Plus className="h-4 w-4" /> Adicionar cliente
        </button>
      </div>
      <SaveBar listKey="clientes" items={items.filter((c) => c.name.trim())} edited={edited} onReset={() => setItems([...DEFAULT_CLIENTS])} />
      {picking !== null && (
        <MediaPicker
          multiple={false}
          onClose={() => setPicking(null)}
          onPick={(urls) => {
            if (urls[0]) set(picking, { logo: urls[0] });
            setPicking(null);
          }}
        />
      )}
    </>
  );
}

function TestimonialsEditor({ initial, edited }: { initial: Testimonial[]; edited: boolean }) {
  const [items, setItems] = useState(initial);
  const set = (i: number, patch: Partial<Testimonial>) => setItems((l) => l.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  return (
    <>
      <div className="space-y-3">
        {items.map((t, i) => (
          <div key={i} className="grid gap-2 rounded-2xl border border-black/5 bg-white p-4 shadow-sm lg:grid-cols-[1fr_2fr_auto]">
            <div className="space-y-1.5">
              <input value={t.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Nome" aria-label="Nome" className={cn(inputCls, "py-1.5 text-[13px] font-semibold")} />
              <input value={t.company} onChange={(e) => set(i, { company: e.target.value })} placeholder="Empresa" aria-label="Empresa" className={cn(inputCls, "py-1.5 text-[12.5px]")} />
              <input value={t.city} onChange={(e) => set(i, { city: e.target.value })} placeholder="Cidade/UF" aria-label="Cidade" className={cn(inputCls, "py-1.5 text-[12.5px]")} />
            </div>
            <textarea value={t.text} onChange={(e) => set(i, { text: e.target.value })} rows={4} placeholder="Depoimento, com as palavras do cliente" aria-label="Depoimento" className={inputCls} />
            <div className="flex lg:flex-col">
              <button type="button" onClick={() => setItems((l) => move(l, i, -1))} className="rounded p-1.5 text-dm-ink/45 hover:text-dm-ink" title="Subir">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setItems((l) => move(l, i, 1))} className="rounded p-1.5 text-dm-ink/45 hover:text-dm-ink" title="Descer">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} className="rounded p-1.5 text-dm-red/70 hover:text-dm-red" title="Remover">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((l) => [{ name: "", company: "", city: "", text: "" }, ...l])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 py-4 text-[13px] font-bold text-dm-blue hover:border-dm-blue/40"
        >
          <Plus className="h-4 w-4" /> Adicionar depoimento
        </button>
      </div>
      <SaveBar listKey="depoimentos" items={items.filter((t) => t.name.trim() && t.text.trim())} edited={edited} onReset={() => setItems([...DEFAULT_TESTIMONIALS])} />
    </>
  );
}
