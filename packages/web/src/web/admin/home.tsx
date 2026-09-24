import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { HOME_DEFAULTS, type BestSellerSlide, type HomeData } from "@/lib/home";
import { products } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Btn, Card, Field, PageTitle, inputCls } from "./ui";

type Doc = { key: string; data: Partial<HomeData>; updatedAt: string };

export function AdminHome() {
  const q = useQuery({
    queryKey: ["admin-conteudo", "home"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "home" } });
      if (!res.ok) throw new Error("fail");
      return ((await res.json()).docs as unknown as Doc[]).find((d) => d.key === "main") ?? null;
    },
  });
  if (q.isPending) return <PageTitle title="Home" hint="Carregando..." />;
  return <HomeEditor key={q.data?.updatedAt ?? "padrao"} doc={q.data ?? null} />;
}

function HomeEditor({ doc }: { doc: Doc | null }) {
  const qc = useQueryClient();
  const base: HomeData = { ...HOME_DEFAULTS, ...doc?.data };
  const [heroText, setHeroText] = useState(base.heroText);
  const [words, setWords] = useState(base.heroWords.join(", "));
  const [agroLink, setAgroLink] = useState(base.agroLink);
  const [slides, setSlides] = useState<BestSellerSlide[]>(base.bestSellers.map((s) => ({ ...s, lines: [...s.lines] as [string, string] })));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setSlide = (i: number, patch: Partial<BestSellerSlide>) => setSlides((l) => l.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const moveSlide = (i: number, dir: -1 | 1) =>
    setSlides((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const save = useMutation({
    mutationFn: async () => {
      const heroWords = words.split(",").map((w) => w.trim()).filter(Boolean);
      if (!heroWords.length) throw new Error("Informe ao menos uma palavra");
      if (slides.length < 2) throw new Error("A vitrine precisa de pelo menos 2 produtos");
      if (slides.some((s) => !s.lines[0].trim() || !s.tab.trim())) throw new Error("Cada produto da vitrine precisa de título e nome da aba");
      const data: HomeData = { heroText: heroText.trim(), heroWords, agroLink: agroLink.trim(), bestSellers: slides };
      const res = await api.admin.conteudo[":collection"][":key"].$put({ param: { collection: "home", key: "main" }, json: { data } });
      if (!res.ok) throw new Error("Não foi possível salvar");
    },
    onSuccess: () => {
      setMsg({ ok: true, text: "Salvo. A home atualiza em até 1 minuto." });
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "home"] });
    },
    onError: (e) => setMsg({ ok: false, text: e.message }),
  });

  const reset = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "home", key: "main" } });
      if (!res.ok) throw new Error("Não foi possível restaurar");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-conteudo", "home"] }),
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        save.mutate();
      }}
    >
      <PageTitle title="Home" hint="Textos do topo e a vitrine de campeãs de vendas. Os números (anos, máquinas, clientes) ficam em Dados do site." />

      <Card>
        <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Topo da página</h2>
        <div className="mt-5 grid gap-5">
          <Field label='Palavras depois de "para"' hint="Separadas por vírgula. Trocam sozinhas no título: A indústria em movimento para ...">
            <input value={words} onChange={(e) => setWords(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Texto de apresentação" hint={`${heroText.length} caracteres. Até uns 220 cabe bem no celular.`}>
            <textarea rows={3} value={heroText} onChange={(e) => setHeroText(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Link para a página Agro">
            <input value={agroLink} onChange={(e) => setAgroLink(e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Campeãs de vendas</h2>
            <p className="mt-1 text-[12.5px] text-dm-ink/55">Troca de produto a cada 10 segundos. De 2 a 6 produtos.</p>
          </div>
          {slides.length < 6 && (
            <Btn
              tone="ghost"
              onClick={() => {
                const p = products.find((x) => !slides.some((s) => s.slug === x.slug)) ?? products[0]!;
                setSlides((l) => [...l, { slug: p.slug, lines: [p.name, ""], tab: p.name.split(" ").slice(-1)[0] ?? p.name }]);
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Produto
              </span>
            </Btn>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {slides.map((s, i) => (
            <div key={i} className="grid items-center gap-2 rounded-xl border border-black/5 p-2 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto]">
              <select value={s.slug} onChange={(e) => setSlide(i, { slug: e.target.value })} aria-label="Produto" className={inputCls}>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input value={s.lines[0]} onChange={(e) => setSlide(i, { lines: [e.target.value, s.lines[1]] })} placeholder="Título, linha 1" aria-label="Título linha 1" className={inputCls} />
              <input value={s.lines[1]} onChange={(e) => setSlide(i, { lines: [s.lines[0], e.target.value] })} placeholder="Título, linha 2" aria-label="Título linha 2" className={inputCls} />
              <input value={s.tab} onChange={(e) => setSlide(i, { tab: e.target.value })} placeholder="Nome na aba" aria-label="Nome na aba" className={inputCls} />
              <div className="flex">
                <button type="button" onClick={() => moveSlide(i, -1)} className="rounded p-2 text-dm-ink/45 hover:text-dm-ink" title="Subir">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveSlide(i, 1)} className="rounded p-2 text-dm-ink/45 hover:text-dm-ink" title="Descer">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" disabled={slides.length <= 2} onClick={() => setSlides((l) => l.filter((_, j) => j !== i))} className="rounded p-2 text-dm-red/70 hover:text-dm-red disabled:opacity-30" title="Remover">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className={cn("sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur")}>
        <Btn type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Btn>
        {msg && <span className={`text-[13px] font-semibold ${msg.ok ? "text-dm-green" : "text-dm-red"}`}>{msg.text}</span>}
        {doc && (
          <button
            type="button"
            onClick={() => confirm("Voltar a home para os textos e a vitrine originais?") && reset.mutate()}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Voltar ao original
          </button>
        )}
      </div>
    </form>
  );
}
