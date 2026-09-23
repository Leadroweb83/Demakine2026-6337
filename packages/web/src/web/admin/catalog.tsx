import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  ExternalLink,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { DEFAULT_PRODUCTS, EMPTY_PRODUCT, categories, type Model, type Product } from "@/lib/content";
import { productVideos, type ProductVideo } from "@/lib/product-videos";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";
import { MediaPicker } from "./media";

type Doc = { key: string; data: Partial<Product>; deleted: boolean; updatedAt: string; updatedBy: string | null };

type Row = {
  slug: string;
  product: Product;
  origin: "codigo" | "novo";
  edited: boolean;
  hidden: boolean;
  doc?: Doc;
};

const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
const paragraphs = (t: string) => t.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

/** Aceita o link do YouTube inteiro ou só o código do vídeo. */
function youtubeId(input: string) {
  const t = input.trim();
  const m = t.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  if (m) return m[1]!;
  return /^[\w-]{11}$/.test(t) ? t : null;
}

function useProductDocs() {
  return useQuery({
    queryKey: ["admin-conteudo", "produto"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "produto" } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).docs as unknown as Doc[];
    },
  });
}

/* ------------------------------------------------------------------ lista */

export function AdminCatalog() {
  const qc = useQueryClient();
  const docs = useProductDocs();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [cat, setCat] = useState("todas");

  const rows = useMemo<Row[]>(() => {
    const bySlug = new Map((docs.data ?? []).map((d) => [d.key, d]));
    const base: Row[] = DEFAULT_PRODUCTS.map((p) => {
      const doc = bySlug.get(p.slug);
      return {
        slug: p.slug,
        product: doc && !doc.deleted ? { ...p, ...doc.data, slug: p.slug } : p,
        origin: "codigo",
        edited: !!doc && !doc.deleted,
        hidden: !!doc?.deleted,
        doc,
      };
    });
    const known = new Set(DEFAULT_PRODUCTS.map((p) => p.slug));
    const added: Row[] = (docs.data ?? [])
      .filter((d) => !known.has(d.key))
      .map((d) => ({
        slug: d.key,
        product: { ...EMPTY_PRODUCT, ...d.data, slug: d.key },
        origin: "novo",
        edited: true,
        hidden: d.deleted,
        doc: d,
      }));
    return [...base, ...added].sort((a, b) => a.product.name.localeCompare(b.product.name, "pt-BR"));
  }, [docs.data]);

  const visibility = useMutation({
    mutationFn: async (row: Row) => {
      const param = { collection: "produto", key: row.slug };
      const res = row.hidden
        ? row.origin === "codigo" && !row.doc?.data?.name
          ? await api.admin.conteudo[":collection"][":key"].$delete({ param })
          : await api.admin.conteudo[":collection"][":key"].$put({ param, json: { data: row.doc?.data ?? {}, deleted: false } })
        : await api.admin.conteudo[":collection"][":key"].$put({ param, json: { data: row.doc?.data ?? {}, deleted: true } });
      if (!res.ok) throw new Error("fail");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-conteudo", "produto"] }),
  });

  if (editing) {
    return (
      <ProductEditor
        row={editing === "new" ? null : editing}
        takenSlugs={rows.map((r) => r.slug)}
        onClose={() => setEditing(null)}
      />
    );
  }

  const shown = rows.filter((r) => cat === "todas" || r.product.category === cat);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Catálogo"
          hint="Produtos do site: textos, fotos, tabela de modelos, vídeos e SEO. As mudanças aparecem no site em até 1 minuto."
        />
        <Btn onClick={() => setEditing("new")}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Novo produto
          </span>
        </Btn>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ slug: "todas", name: "Todas" }, ...categories].map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCat(c.slug)}
            aria-pressed={cat === c.slug}
            className={cn(
              "rounded-full border px-4 py-2 text-[12.5px] font-bold transition-colors",
              cat === c.slug ? "border-dm-blue bg-dm-blue text-white" : "border-black/10 bg-white text-dm-ink/70 hover:border-dm-blue/40",
            )}
          >
            {c.name} ({c.slug === "todas" ? rows.length : rows.filter((r) => r.product.category === c.slug).length})
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {docs.isPending && <p className="p-6 text-[13.5px] text-dm-ink/55">Carregando...</p>}
        <ul className="divide-y divide-black/5">
          {shown.map((r) => (
            <li key={r.slug} className={cn("flex flex-wrap items-center gap-4 px-5 py-3.5", r.hidden && "opacity-55")}>
              <img
                src={r.product.images[0] ?? "/img/site/hero.jpg"}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg border border-black/5 bg-dm-surface object-contain"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14.5px] font-bold text-dm-ink">{r.product.name}</p>
                  {r.origin === "novo" && <Badge tone="green">Novo</Badge>}
                  {r.origin === "codigo" && r.edited && <Badge>Editado</Badge>}
                  {r.hidden && <Badge tone="red">Oculto</Badge>}
                </div>
                <p className="mt-0.5 text-[12px] text-dm-ink/50">
                  {categories.find((c) => c.slug === r.product.category)?.name ?? "Sem categoria"} ·{" "}
                  {r.product.models.length} modelos · {r.product.images.length} fotos ·{" "}
                  {(r.product.videos ?? productVideos[r.slug] ?? []).length} vídeos
                </p>
              </div>
              {!r.hidden && (
                <a href={`/produtos/${r.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue" title="Ver no site">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Ver {r.product.name} no site</span>
                </a>
              )}
              <button
                type="button"
                disabled={visibility.isPending}
                onClick={() =>
                  (r.hidden || confirm(`Ocultar "${r.product.name}" do site? Dá para mostrar de novo depois.`)) && visibility.mutate(r)
                }
                className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-ink"
                title={r.hidden ? "Mostrar no site" : "Ocultar do site"}
              >
                {r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="sr-only">{r.hidden ? "Mostrar" : "Ocultar"} {r.product.name}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditing(r)}
                className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar {r.product.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- editor */

type Form = {
  slug: string;
  name: string;
  title: string;
  category: string;
  tag: string;
  summary: string;
  applications: string;
  description: string;
  features: string;
  images: string[];
  specKeys: string[];
  models: Model[];
  videos: ProductVideo[];
  seoTitle: string;
  seoDesc: string;
};

const toForm = (p: Product, slug: string): Form => ({
  slug,
  name: p.name,
  title: p.title ?? "",
  category: p.category,
  tag: p.tag ?? "",
  summary: p.summary,
  applications: p.applications.join("\n"),
  description: p.description.join("\n\n"),
  features: p.features.join("\n"),
  images: [...p.images],
  specKeys: [...p.specKeys],
  models: p.models.map((m) => ({ model: m.model, specs: { ...m.specs } })),
  videos: [...(p.videos ?? productVideos[slug] ?? [])],
  seoTitle: p.seoTitle ?? "",
  seoDesc: p.seoDesc ?? "",
});

function ProductEditor({ row, takenSlugs, onClose }: { row: Row | null; takenSlugs: string[]; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !row;
  const [form, setForm] = useState<Form>(() =>
    row ? toForm(row.product, row.slug) : toForm({ ...EMPTY_PRODUCT, category: categories[0]?.slug ?? "" }, ""),
  );
  const [picking, setPicking] = useState(false);
  const [videoInput, setVideoInput] = useState({ url: "", title: "" });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const text = (k: "name" | "title" | "tag" | "summary" | "applications" | "description" | "features" | "seoTitle" | "seoDesc") => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
    className: inputCls,
  });

  const slug = isNew ? form.slug || slugify(form.name) : row.slug;

  const save = useMutation({
    mutationFn: async () => {
      const data: Partial<Product> = {
        name: form.name.trim(),
        title: form.title.trim() || form.name.trim(),
        category: form.category,
        tag: form.tag.trim() || undefined,
        summary: form.summary.trim(),
        applications: lines(form.applications),
        description: paragraphs(form.description),
        features: lines(form.features),
        images: form.images,
        specKeys: form.specKeys.map((k) => k.trim()).filter(Boolean),
        models: form.models
          .filter((m) => m.model.trim())
          .map((m) => ({ model: m.model.trim(), specs: Object.fromEntries(form.specKeys.map((k) => [k.trim(), (m.specs[k] ?? "").trim()])) })),
        videos: form.videos,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDesc: form.seoDesc.trim() || undefined,
      };
      const res = await api.admin.conteudo[":collection"][":key"].$put({
        param: { collection: "produto", key: slug },
        json: { data, deleted: row?.hidden ?? false },
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "produto"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const discard = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "produto", key: slug } });
      if (!res.ok) throw new Error("Não foi possível");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "produto"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const validate = () => {
    if (!form.name.trim()) return "Informe o nome do produto";
    if (!form.category) return "Escolha a categoria";
    if (!form.summary.trim()) return "Escreva o resumo";
    if (isNew) {
      if (!/^[a-z0-9-]{3,90}$/.test(slug)) return "Endereço inválido: use letras minúsculas, números e hífen";
      if (takenSlugs.includes(slug)) return "Já existe um produto com esse endereço";
    }
    return null;
  };

  const moveImg = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= form.images.length) return;
    const next = [...form.images];
    [next[i], next[j]] = [next[j]!, next[i]!];
    set("images", next);
  };

  const setSpec = (row: number, key: string, value: string) =>
    set(
      "models",
      form.models.map((m, i) => (i === row ? { ...m, specs: { ...m.specs, [key]: value } } : m)),
    );
  const renameKey = (i: number, name: string) => {
    const old = form.specKeys[i]!;
    setForm((f) => ({
      ...f,
      specKeys: f.specKeys.map((k, j) => (j === i ? name : k)),
      models: f.models.map((m) => {
        const { [old]: v, ...rest } = m.specs;
        return { ...m, specs: { ...rest, [name]: v ?? "" } };
      }),
    }));
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
        <ArrowLeft className="h-4 w-4" /> Voltar para o catálogo
      </button>
      <PageTitle title={isNew ? "Novo produto" : `Editar: ${row.product.name}`} />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nome*">
                  <input required {...text("name")} />
                </Field>
                <Field label="Categoria*">
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {isNew && (
                <Field label="Endereço da página" hint={`/produtos/${slug || "..."}`}>
                  <input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder={slugify(form.name) || "gerado a partir do nome"} className={inputCls} />
                </Field>
              )}
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Título da página" hint="Vazio usa o nome">
                  <input {...text("title")} />
                </Field>
                <Field label="Selo" hint="Ex.: Linha de produção">
                  <input {...text("tag")} />
                </Field>
              </div>
              <Field label="Resumo*" hint="Aparece nos cartões e no topo da página">
                <textarea rows={3} {...text("summary")} />
              </Field>
              <Field label="Descrição" hint="Deixe uma linha em branco entre parágrafos">
                <textarea rows={6} {...text("description")} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Características" hint="Uma por linha">
                  <textarea rows={7} {...text("features")} />
                </Field>
                <Field label="Aplicações" hint="Uma por linha">
                  <textarea rows={7} {...text("applications")} />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Tabela de modelos</h2>
              <div className="flex gap-2">
                <Btn tone="ghost" onClick={() => set("specKeys", [...form.specKeys, `Coluna ${form.specKeys.length + 1}`])}>
                  + Coluna
                </Btn>
                <Btn tone="ghost" onClick={() => set("models", [...form.models, { model: "", specs: {} }])}>
                  + Modelo
                </Btn>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">Modelo</th>
                    {form.specKeys.map((k, i) => (
                      <th key={i} className="p-1">
                        <div className="flex items-center gap-1">
                          <input value={k} onChange={(e) => renameKey(i, e.target.value)} aria-label={`Nome da coluna ${i + 1}`} className={cn(inputCls, "px-2 py-1.5 text-[12px] font-bold")} />
                          <button
                            type="button"
                            onClick={() => set("specKeys", form.specKeys.filter((_, j) => j !== i))}
                            className="rounded p-1 text-dm-ink/35 hover:text-dm-red"
                            title="Remover coluna"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {form.models.map((m, r) => (
                    <tr key={r}>
                      <td className="p-1">
                        <input
                          value={m.model}
                          onChange={(e) => set("models", form.models.map((x, i) => (i === r ? { ...x, model: e.target.value } : x)))}
                          aria-label={`Modelo ${r + 1}`}
                          className={cn(inputCls, "px-2 py-1.5 text-[12.5px] font-semibold")}
                        />
                      </td>
                      {form.specKeys.map((k, i) => (
                        <td key={i} className="p-1">
                          <input value={m.specs[k] ?? ""} onChange={(e) => setSpec(r, k, e.target.value)} aria-label={`${k} do modelo ${m.model}`} className={cn(inputCls, "px-2 py-1.5 text-[12.5px]")} />
                        </td>
                      ))}
                      <td className="p-1">
                        <button
                          type="button"
                          onClick={() => set("models", form.models.filter((_, i) => i !== r))}
                          className="rounded p-1.5 text-dm-ink/35 hover:text-dm-red"
                          title="Remover modelo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!form.models.length && <p className="py-4 text-[13px] text-dm-ink/45">Sem tabela de modelos. A página mostra só a descrição.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Fotos</h2>
              <Btn tone="ghost" onClick={() => setPicking(true)}>
                <span className="inline-flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4" /> Adicionar
                </span>
              </Btn>
            </div>
            <p className="mt-1 text-[12px] text-dm-ink/50">A primeira é a capa. Use as setas para mudar a ordem.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {form.images.map((src, i) => (
                <div key={src + i} className={cn("group relative overflow-hidden rounded-lg border bg-dm-surface", i === 0 ? "border-dm-blue" : "border-black/5")}>
                  <img src={src} alt="" className="aspect-[4/3] w-full object-contain" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-dm-blue px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Capa</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 bg-white/90 py-0.5">
                    <button type="button" onClick={() => moveImg(i, -1)} disabled={i === 0} className="rounded p-1 text-dm-ink/60 disabled:opacity-25" title="Para a esquerda">
                      <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button type="button" onClick={() => moveImg(i, 1)} disabled={i === form.images.length - 1} className="rounded p-1 text-dm-ink/60 disabled:opacity-25" title="Para a direita">
                      <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="rounded p-1 text-dm-red/70" title="Tirar do produto">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!form.images.length && <p className="mt-3 text-[13px] text-dm-ink/45">Sem fotos: o site usa a foto da fábrica.</p>}
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Vídeos do YouTube</h2>
            <ul className="mt-3 space-y-2">
              {form.videos.map((v, i) => (
                <li key={v.id + i} className="flex items-center gap-2 rounded-lg border border-black/5 p-2">
                  <img src={`https://i.ytimg.com/vi/${v.id}/default.jpg`} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                  <input
                    value={v.title}
                    onChange={(e) => set("videos", form.videos.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                    aria-label="Título do vídeo"
                    className={cn(inputCls, "py-1.5 text-[12.5px]")}
                  />
                  <button type="button" onClick={() => set("videos", form.videos.filter((_, j) => j !== i))} className="rounded p-1.5 text-dm-ink/35 hover:text-dm-red" title="Remover vídeo">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2">
              <input value={videoInput.url} onChange={(e) => setVideoInput((v) => ({ ...v, url: e.target.value }))} placeholder="Link do vídeo no YouTube" aria-label="Link do vídeo" className={inputCls} />
              <div className="flex gap-2">
                <input value={videoInput.title} onChange={(e) => setVideoInput((v) => ({ ...v, title: e.target.value }))} placeholder="Título que aparece na página" aria-label="Título do vídeo novo" className={inputCls} />
                <Btn
                  tone="ghost"
                  onClick={() => {
                    const id = youtubeId(videoInput.url);
                    if (!id) return setError("Link do YouTube inválido");
                    setError(null);
                    set("videos", [...form.videos, { id, title: videoInput.title.trim() || form.name }]);
                    setVideoInput({ url: "", title: "" });
                  }}
                >
                  Incluir
                </Btn>
              </div>
              <p className="text-[12px] text-dm-ink/45">O vídeo precisa estar público e com incorporação liberada no YouTube.</p>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">SEO</h2>
            <div className="mt-4 grid gap-4">
              <Field label="Título no Google" hint={`${form.seoTitle.length}/60 caracteres`}>
                <input {...text("seoTitle")} placeholder={`${form.name} | Demakine`} />
              </Field>
              <Field label="Descrição no Google" hint={`${form.seoDesc.length}/160 caracteres`}>
                <textarea rows={3} {...text("seoDesc")} placeholder="Vazio usa o começo do resumo" />
              </Field>
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Btn type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : isNew ? "Criar produto" : "Salvar produto"}
        </Btn>
        <Btn tone="ghost" onClick={onClose}>
          Cancelar
        </Btn>
        {error && <span className="text-[13px] font-semibold text-dm-red">{error}</span>}
        {row?.edited && (
          <button
            type="button"
            disabled={discard.isPending}
            onClick={() =>
              confirm(
                row.origin === "novo"
                  ? `Apagar o produto "${row.product.name}"? Não dá para desfazer.`
                  : `Descartar as edições e voltar "${row.product.name}" ao original?`,
              ) && discard.mutate()
            }
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-red"
          >
            {row.origin === "novo" ? <Trash2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {row.origin === "novo" ? "Apagar produto" : "Voltar ao original"}
          </button>
        )}
      </div>

      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(urls) => {
            set("images", [...form.images, ...urls.filter((u) => !form.images.includes(u))]);
            setPicking(false);
          }}
        />
      )}
    </form>
  );
}
