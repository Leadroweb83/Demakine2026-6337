import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, ExternalLink, ImagePlus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import type { PanelUser } from "../lib/auth";
import { DEFAULT_POSTS, EMPTY_POST, formatDate, type Post } from "@/lib/content";
import { Block } from "@/components/post-block";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";
import { MediaPicker } from "./media";

type Doc = { key: string; data: Partial<Post>; deleted: boolean; updatedAt: string; updatedBy: string | null };

type Row = { slug: string; post: Post; origin: "codigo" | "novo"; edited: boolean; hidden: boolean; doc?: Doc };

const LIST_OR_TITLE = /^(#{1,4} |- |\* |\d+\.\s)/;

/** Corpo do post em texto: linha em branco separa parágrafos; título, item e item numerado ficam um por linha. */
function blocksToText(blocks: string[]) {
  return blocks
    .map((b, i) => {
      const prev = blocks[i - 1];
      const bothList = prev && /^(- |\* |\d+\.\s)/.test(prev) && /^(- |\* |\d+\.\s)/.test(b);
      return (i === 0 ? "" : bothList ? "\n" : "\n\n") + b;
    })
    .join("");
}

function textToBlocks(text: string) {
  const out: string[] = [];
  for (const para of text.split(/\n\s*\n/)) {
    let buf: string[] = [];
    const flush = () => {
      if (buf.length) out.push(buf.join(" "));
      buf = [];
    };
    for (const raw of para.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (LIST_OR_TITLE.test(line)) {
        flush();
        out.push(line);
      } else buf.push(line);
    }
    flush();
  }
  return out;
}

const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

function usePostDocs() {
  return useQuery({
    queryKey: ["admin-conteudo", "post"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "post" } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).docs as unknown as Doc[];
    },
  });
}

/* ------------------------------------------------------------------ lista */

export function AdminBlog({ user }: { user: PanelUser }) {
  const qc = useQueryClient();
  const docs = usePostDocs();
  const [editing, setEditing] = useState<Row | "new" | null>(null);

  const rows = useMemo<Row[]>(() => {
    const bySlug = new Map((docs.data ?? []).map((d) => [d.key, d]));
    const base: Row[] = DEFAULT_POSTS.map((p) => {
      const doc = bySlug.get(p.slug);
      return {
        slug: p.slug,
        post: doc && !doc.deleted ? { ...p, ...doc.data, slug: p.slug } : p,
        origin: "codigo",
        edited: !!doc && !doc.deleted,
        hidden: !!doc?.deleted,
        doc,
      };
    });
    const known = new Set(DEFAULT_POSTS.map((p) => p.slug));
    const added: Row[] = (docs.data ?? [])
      .filter((d) => !known.has(d.key))
      .map((d) => ({ slug: d.key, post: { ...EMPTY_POST, ...d.data, slug: d.key }, origin: "novo", edited: true, hidden: d.deleted, doc: d }));
    return [...base, ...added].sort((a, b) => (b.post.date || "9999").localeCompare(a.post.date || "9999"));
  }, [docs.data]);

  const visibility = useMutation({
    mutationFn: async (row: Row) => {
      const param = { collection: "post", key: row.slug };
      const res = row.hidden
        ? row.origin === "codigo" && !row.doc?.data?.title
          ? await api.admin.conteudo[":collection"][":key"].$delete({ param })
          : await api.admin.conteudo[":collection"][":key"].$put({ param, json: { data: row.doc?.data ?? {}, deleted: false } })
        : await api.admin.conteudo[":collection"][":key"].$put({ param, json: { data: row.doc?.data ?? {}, deleted: true } });
      if (!res.ok) throw new Error("fail");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-conteudo", "post"] }),
  });

  if (editing) {
    return <PostEditor row={editing === "new" ? null : editing} user={user} rows={rows} onClose={() => setEditing(null)} />;
  }

  const canHide = user.role !== "editor";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Blog"
          hint={
            user.role === "editor"
              ? "Seus posts novos ficam como rascunho até um admin publicar."
              : "Artigos do blog. Rascunho não aparece no site; publicado aparece em até 1 minuto."
          }
        />
        <Btn onClick={() => setEditing("new")}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Novo post
          </span>
        </Btn>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {docs.isPending && <p className="p-6 text-[13.5px] text-dm-ink/55">Carregando...</p>}
        <ul className="divide-y divide-black/5">
          {rows.map((r) => (
            <li key={r.slug} className={cn("flex flex-wrap items-center gap-4 px-5 py-3.5", r.hidden && "opacity-55")}>
              <img src={r.post.cover || "/img/site/hero.jpg"} alt="" className="h-14 w-24 shrink-0 rounded-lg bg-dm-surface object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14.5px] font-bold text-dm-ink">{r.post.title || "(sem título)"}</p>
                  {r.post.draft && <Badge tone="gray">Rascunho</Badge>}
                  {r.origin === "novo" && !r.post.draft && <Badge tone="green">Novo</Badge>}
                  {r.origin === "codigo" && r.edited && <Badge>Editado</Badge>}
                  {r.hidden && <Badge tone="red">Oculto</Badge>}
                </div>
                <p className="mt-0.5 text-[12px] text-dm-ink/50">
                  {r.post.category || "Sem categoria"} · {r.post.date ? formatDate(r.post.date) : "sem data"}
                  {r.doc?.updatedBy ? ` · editado por ${r.doc.updatedBy.split(" ")[0]}` : ""}
                </p>
              </div>
              {!r.hidden && !r.post.draft && (
                <a href={`/blog/${r.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue" title="Ver no site">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Ver {r.post.title} no site</span>
                </a>
              )}
              {canHide && (
                <button
                  type="button"
                  disabled={visibility.isPending}
                  onClick={() => (r.hidden || confirm(`Ocultar "${r.post.title}" do site?`)) && visibility.mutate(r)}
                  className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-ink"
                  title={r.hidden ? "Mostrar no site" : "Ocultar do site"}
                >
                  {r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="sr-only">{r.hidden ? "Mostrar" : "Ocultar"} {r.post.title}</span>
                </button>
              )}
              <button type="button" onClick={() => setEditing(r)} className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue" title="Editar">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar {r.post.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- editor */

function PostEditor({ row, user, rows, onClose }: { row: Row | null; user: PanelUser; rows: Row[]; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !row;
  const isEditor = user.role === "editor";
  const p = row?.post ?? { ...EMPTY_POST, date: new Date().toISOString().slice(0, 10), draft: true };
  const [form, setForm] = useState({
    slug: "",
    title: p.title,
    category: p.category,
    date: p.date,
    cover: p.cover,
    images: p.images.filter((i) => i !== p.cover),
    // o primeiro "# " é o título (a página do post também o tira do corpo)
    body: blocksToText(p.blocks.filter((b, i) => !(i === 0 && b.startsWith("# ")))),
    seoTitle: p.seoTitle ?? "",
    seoDesc: p.seoDesc ?? "",
    draft: !!p.draft,
  });
  const [picking, setPicking] = useState<"cover" | "gallery" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const categories = [...new Set(rows.map((r) => r.post.category).filter(Boolean))];
  const slug = isNew ? form.slug || slugify(form.title) : row.slug;
  const blocks = useMemo(() => textToBlocks(form.body), [form.body]);

  const save = useMutation({
    mutationFn: async () => {
      const data: Partial<Post> = {
        title: form.title.trim(),
        category: form.category.trim(),
        date: form.date,
        cover: form.cover,
        blocks: [`# ${form.title.trim()}`, ...blocks],
        images: [form.cover, ...form.images].filter(Boolean),
        seoTitle: form.seoTitle.trim() || undefined,
        seoDesc: form.seoDesc.trim() || undefined,
        draft: form.draft,
      };
      const res = await api.admin.conteudo[":collection"][":key"].$put({
        param: { collection: "post", key: slug },
        json: { data, deleted: row?.hidden ?? false },
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "post"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const discard = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "post", key: slug } });
      if (!res.ok) throw new Error("Não foi possível");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "post"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const validate = () => {
    if (!form.title.trim()) return "Informe o título";
    if (!form.date) return "Informe a data";
    if (!form.category.trim()) return "Informe a categoria";
    if (!blocks.length) return "Escreva o texto do post";
    if (isNew) {
      if (!/^[a-z0-9-]{3,90}$/.test(slug)) return "Endereço inválido";
      if (rows.some((r) => r.slug === slug)) return "Já existe um post com esse endereço";
    }
    return null;
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const problem = validate();
        if (problem) return setError(problem);
        save.mutate();
      }}
    >
      <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar para o blog
      </button>
      <PageTitle title={isNew ? "Novo post" : `Editar: ${row.post.title}`} />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <div className="grid gap-5">
              <Field label="Título*">
                <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
              </Field>
              {isNew && (
                <Field label="Endereço" hint={`/blog/${slug || "..."}`}>
                  <input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder={slugify(form.title) || "gerado a partir do título"} className={inputCls} />
                </Field>
              )}
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Categoria*">
                  <input value={form.category} onChange={(e) => set("category", e.target.value)} list="post-categorias" className={inputCls} />
                  <datalist id="post-categorias">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Data*">
                  <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field
                label="Texto*"
                hint='Linha em branco entre parágrafos. "## " no começo da linha vira subtítulo, "- " vira item de lista, "1. " vira lista numerada.'
              >
                <textarea rows={22} value={form.body} onChange={(e) => set("body", e.target.value)} className={cn(inputCls, "font-mono text-[13px] leading-relaxed")} />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Imagens</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Capa</p>
                <button type="button" onClick={() => setPicking("cover")} className="mt-1.5 block w-full overflow-hidden rounded-xl border border-dashed border-black/15 bg-dm-surface">
                  {form.cover ? (
                    <img src={form.cover} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <span className="flex aspect-video items-center justify-center text-[12px] font-bold text-dm-ink/45">Escolher capa</span>
                  )}
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Galeria no fim do post</p>
                  <button type="button" onClick={() => setPicking("gallery")} className="inline-flex items-center gap-1 text-[12px] font-bold text-dm-blue hover:underline">
                    <ImagePlus className="h-4 w-4" /> Adicionar
                  </button>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {form.images.map((src, i) => (
                    <div key={src + i} className="relative overflow-hidden rounded-lg bg-dm-surface">
                      <img src={src} alt="" className="aspect-video w-full object-cover" />
                      <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-dm-red" title="Tirar da galeria">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">SEO</h2>
            <div className="mt-4 grid gap-4">
              <Field label="Título no Google" hint={`${form.seoTitle.length}/60 · vazio usa "${form.title} | Blog Demakine"`}>
                <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Descrição no Google" hint={`${form.seoDesc.length}/160 · vazio usa o primeiro parágrafo`}>
                <textarea rows={3} value={form.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </Card>
        </div>

        <Card className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto">
          <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Prévia</p>
          {form.cover && <img src={form.cover} alt="" className="mt-3 aspect-video w-full rounded-xl object-cover" />}
          <p className="mt-4 text-[12px] font-bold uppercase tracking-wide text-dm-blue">{form.category}</p>
          <h1 className="h2 mt-2">{form.title || "Título do post"}</h1>
          <div className="mt-2">
            {blocks.map((b, i) => (
              <Block key={i} text={b} />
            ))}
          </div>
        </Card>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur">
        {isEditor ? (
          <span className="text-[12.5px] text-dm-ink/60">{form.draft ? "Rascunho: um admin publica." : "Publicado"}</span>
        ) : (
          <label className="flex items-center gap-2 text-[13px] font-semibold text-dm-ink">
            <input type="checkbox" checked={!form.draft} onChange={(e) => set("draft", !e.target.checked)} className="h-4 w-4 accent-dm-blue" />
            Publicado no site
          </label>
        )}
        <Btn type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Btn>
        <Btn tone="ghost" onClick={onClose}>
          Cancelar
        </Btn>
        {error && <span className="text-[13px] font-semibold text-dm-red">{error}</span>}
        {row?.edited && !isEditor && (
          <button
            type="button"
            disabled={discard.isPending}
            onClick={() =>
              confirm(row.origin === "novo" ? `Apagar o post "${row.post.title}"?` : `Descartar as edições de "${row.post.title}"?`) && discard.mutate()
            }
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-red"
          >
            {row.origin === "novo" ? <Trash2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {row.origin === "novo" ? "Apagar post" : "Voltar ao original"}
          </button>
        )}
      </div>

      {picking && (
        <MediaPicker
          multiple={picking === "gallery"}
          onClose={() => setPicking(null)}
          onPick={(urls) => {
            if (picking === "cover") set("cover", urls[0] ?? "");
            else set("images", [...form.images, ...urls.filter((u) => !form.images.includes(u))]);
            setPicking(null);
          }}
        />
      )}
    </form>
  );
}
