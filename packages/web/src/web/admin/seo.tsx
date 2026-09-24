import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, RotateCcw } from "lucide-react";
import { api } from "../lib/api";
import { STATIC_SEO, seoKey } from "@/lib/seo-pages";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, PageTitle, inputCls } from "./ui";

type Doc = { key: string; data: { title?: string; description?: string }; updatedAt: string };

export function AdminSeo() {
  const q = useQuery({
    queryKey: ["admin-conteudo", "seo"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "seo" } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).docs as unknown as Doc[];
    },
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="SEO das páginas"
        hint="Título e descrição que aparecem no Google para as páginas fixas do site. Vazio usa o padrão de cada página. Produtos, posts e cases têm o SEO no próprio editor."
      />
      {q.isPending && <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {q.isSuccess &&
          STATIC_SEO.map((page) => {
            const doc = q.data.find((d) => d.key === seoKey(page.path));
            return <SeoCard key={`${page.path}-${doc?.updatedAt ?? "padrao"}`} page={page} doc={doc} />;
          })}
      </div>
    </div>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={cn("tabular-nums", n > max ? "font-bold text-dm-red" : "text-dm-ink/45")}>{n}/{max}</span>;
}

function SeoCard({ page, doc }: { page: (typeof STATIC_SEO)[number]; doc?: Doc }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(doc?.data.title ?? "");
  const [description, setDescription] = useState(doc?.data.description ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const key = seoKey(page.path);
  const shownTitle = title.trim() || page.title;
  const shownDesc = description.trim() || page.description;

  const save = useMutation({
    mutationFn: async () => {
      const res =
        title.trim() || description.trim()
          ? await api.admin.conteudo[":collection"][":key"].$put({
              param: { collection: "seo", key },
              json: { data: { title: title.trim() || undefined, description: description.trim() || undefined } },
            })
          : await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "seo", key } });
      if (!res.ok) throw new Error("Não foi possível salvar");
    },
    onSuccess: () => {
      setMsg("Salvo");
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "seo"] });
    },
    onError: (e) => setMsg(e.message),
  });

  const changed = title !== (doc?.data.title ?? "") || description !== (doc?.data.description ?? "");

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[15px] font-extrabold text-dm-ink">{page.label}</h2>
          {doc ? <Badge>Personalizado</Badge> : <Badge tone="gray">Padrão</Badge>}
        </div>
        <a href={page.path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-semibold text-dm-ink/50 hover:text-dm-blue">
          {page.path} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* prévia do resultado no Google */}
      <div className="mt-4 rounded-xl border border-black/5 bg-dm-surface/60 p-3.5">
        <p className="truncate text-[12px] text-[#1a7f37]">
          {site.url.replace(/^https?:\/\//, "")}
          {page.path === "/" ? "" : page.path}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[16px] text-[#1a0dab]">{shownTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-dm-ink/65">{shownDesc}</p>
      </div>

      <label className="mt-4 block">
        <span className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
          Título <Counter n={shownTitle.length} max={60} />
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={page.title} className={cn(inputCls, "mt-1.5")} />
      </label>
      <label className="mt-3 block">
        <span className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
          Descrição <Counter n={shownDesc.length} max={160} />
        </span>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={page.description} className={cn(inputCls, "mt-1.5")} />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Btn tone="ghost" disabled={save.isPending || !changed} onClick={() => save.mutate()}>
          Salvar
        </Btn>
        {doc && (
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setDescription("");
            }}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-dm-ink/50 hover:text-dm-ink"
            title="Apaga o texto personalizado; salve para voltar ao padrão"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Usar o padrão
          </button>
        )}
        {msg && <span className="text-[12.5px] font-semibold text-dm-green">{msg}</span>}
      </div>
    </Card>
  );
}
