import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Lock, RotateCcw } from "lucide-react";
import { api } from "../lib/api";
import {
  PAGE_SECTIONS,
  resolveLayout,
  sectionBackgrounds,
  type LayoutData,
  type LayoutPage,
  type SectionBg,
} from "@/lib/page-layout";
import { products } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Btn, PageTitle } from "./ui";

type Doc = { key: string; data: Partial<LayoutData>; updatedAt: string };
type Msg = { ok: boolean; text: string } | null;

const PAGES: { id: LayoutPage; label: string; top: string; preview: string }[] = [
  { id: "home", label: "Home", top: "Topo com título animado", preview: "/" },
  {
    id: "produto",
    label: "Páginas de produto",
    top: "Fotos, nome e botões de orçamento",
    preview: `/produtos/${products[0]?.slug ?? ""}`,
  },
];

const BG: Record<SectionBg, { label: string; swatch: string }> = {
  white: { label: "Fundo branco", swatch: "bg-white" },
  surface: { label: "Fundo cinza", swatch: "bg-dm-surface" },
  dark: { label: "Fundo escuro", swatch: "bg-dm-blue-deep" },
  strip: { label: "Faixa", swatch: "bg-white" },
};

export function AdminSections() {
  const [page, setPage] = useState<LayoutPage>("home");
  // fica aqui em cima: o editor é recriado quando o conteúdo salvo muda, e a mensagem precisa sobreviver
  const [msg, setMsg] = useState<Msg>(null);
  const q = useQuery({
    queryKey: ["admin-conteudo", "layout"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "layout" } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).docs as unknown as Doc[];
    },
  });
  const doc = q.data?.find((d) => d.key === page) ?? null;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Ordem das seções"
        hint="Mude a ordem ou esconda seções da home e das páginas de produto. O topo de cada página fica fixo. O fundo branco e cinza se ajusta sozinho para as seções não ficarem da mesma cor coladas."
      />
      <div className="inline-flex rounded-full bg-black/[0.05] p-1">
        {PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPage(p.id);
              setMsg(null);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-[12.5px] font-bold uppercase tracking-wide transition-colors",
              page === p.id ? "bg-white text-dm-ink shadow-sm" : "text-dm-ink/55 hover:text-dm-ink",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {q.isPending ? (
        <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>
      ) : (
        <SectionsEditor key={`${page}-${doc?.updatedAt ?? "padrao"}`} page={page} doc={doc} msg={msg} setMsg={setMsg} />
      )}
    </div>
  );
}

function SectionsEditor({
  page,
  doc,
  msg,
  setMsg,
}: {
  page: LayoutPage;
  doc: Doc | null;
  msg: Msg;
  setMsg: (m: Msg) => void;
}) {
  const qc = useQueryClient();
  const meta = PAGES.find((p) => p.id === page)!;
  const defs = new Map(PAGE_SECTIONS[page].map((d) => [d.id, d]));
  const initial = resolveLayout(page, doc?.data);
  const [order, setOrder] = useState(initial.order);
  const [hidden, setHidden] = useState(initial.hidden);
  const dirty = order.join() !== initial.order.join() || [...hidden].sort().join() !== [...initial.hidden].sort().join();
  const bg = sectionBackgrounds(page, order.filter((id) => !hidden.includes(id)));

  const move = (i: number, dir: -1 | 1) => {
    setMsg(null);
    setOrder((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  };
  const toggle = (id: string) => {
    setMsg(null);
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  };

  const save = useMutation({
    mutationFn: async () => {
      const data: LayoutData = { order, hidden };
      const res = await api.admin.conteudo[":collection"][":key"].$put({ param: { collection: "layout", key: page }, json: { data } });
      if (!res.ok) throw new Error("Não foi possível salvar");
    },
    onSuccess: () => {
      setMsg({ ok: true, text: "Salvo. O site atualiza em até 1 minuto." });
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "layout"] });
    },
    onError: (e) => setMsg({ ok: false, text: e.message }),
  });
  const reset = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "layout", key: page } });
      if (!res.ok) throw new Error("Não foi possível restaurar");
    },
    onSuccess: () => {
      setMsg({ ok: true, text: "Ordem original restaurada." });
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "layout"] });
    },
  });

  return (
    <div className="space-y-4">
      <ol className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <li className="flex items-center gap-3 border-b border-black/5 bg-black/[0.02] px-5 py-3.5">
          <span className="w-6 text-center text-[12px] font-bold text-dm-ink/35">
            <Lock className="mx-auto h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-dm-ink/60">Topo da página</p>
            <p className="text-[12px] text-dm-ink/45">{meta.top}. Sempre em primeiro.</p>
          </div>
        </li>
        {order.map((id, i) => {
          const def = defs.get(id)!;
          const off = hidden.includes(id);
          const tone = bg.get(id);
          return (
            <li
              key={id}
              className={cn("flex flex-wrap items-center gap-3 border-b border-black/5 px-5 py-3 last:border-b-0", off && "bg-black/[0.02]")}
            >
              <span className="w-6 text-center text-[12px] font-bold tabular-nums text-dm-ink/40">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-[14px] font-bold", off ? "text-dm-ink/40 line-through" : "text-dm-ink")}>{def.label}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-[12px] text-dm-ink/50">
                  {off ? (
                    <span>Escondida</span>
                  ) : (
                    tone && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("h-2.5 w-2.5 rounded-full border border-black/15", BG[tone].swatch)} />
                        {BG[tone].label}
                      </span>
                    )
                  )}
                  {def.note && <span>· {def.note}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-md p-2 text-dm-ink/55 hover:bg-black/5 hover:text-dm-ink disabled:opacity-25"
                  aria-label={`Subir ${def.label}`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  className="rounded-md p-2 text-dm-ink/55 hover:bg-black/5 hover:text-dm-ink disabled:opacity-25"
                  aria-label={`Descer ${def.label}`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                {def.locked ? (
                  <span className="p-2 text-dm-ink/30" title="Formulário de orçamento não pode ser escondido">
                    <Lock className="h-4 w-4" />
                    <span className="sr-only">Não pode ser escondida</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className={cn("rounded-md p-2 hover:bg-black/5", off ? "text-dm-ink/35 hover:text-dm-ink" : "text-dm-blue")}
                    aria-label={off ? `Mostrar ${def.label}` : `Esconder ${def.label}`}
                    title={off ? "Mostrar" : "Esconder"}
                  >
                    {off ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Btn disabled={save.isPending || !dirty} onClick={() => save.mutate()}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Btn>
        <a
          href={meta.preview}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-blue hover:underline"
        >
          Ver no site <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {msg && <span className={`text-[13px] font-semibold ${msg.ok ? "text-dm-green" : "text-dm-red"}`}>{msg.text}</span>}
        {dirty && !msg && <span className="text-[13px] text-dm-ink/55">Alterações não salvas</span>}
        {doc && (
          <button
            type="button"
            onClick={() => confirm(`Voltar ${page === "home" ? "a home" : "as páginas de produto"} para a ordem original?`) && reset.mutate()}
            className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Ordem original
          </button>
        )}
      </div>
    </div>
  );
}
