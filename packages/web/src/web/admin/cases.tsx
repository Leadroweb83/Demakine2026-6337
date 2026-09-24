import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, CircleDashed, Eye, EyeOff, ExternalLink, ImagePlus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import type { PanelUser } from "../lib/auth";
import { products } from "@/lib/content";
import { DEFAULT_CASES, EMPTY_CASE, casePending, hasRealData, type CaseReal, type CaseStudy } from "@/lib/cases";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";
import { MediaPicker } from "./media";

type Doc = { key: string; data: Partial<CaseStudy>; deleted: boolean; updatedAt: string; updatedBy: string | null };
type Row = { slug: string; item: CaseStudy; origin: "codigo" | "novo"; edited: boolean; hidden: boolean; doc?: Doc };

const EMPTY_REAL: CaseReal = { client: "", authorized: false, results: [], photos: [] };
const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

function useCaseDocs() {
  return useQuery({
    queryKey: ["admin-conteudo", "case"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "case" } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).docs as unknown as Doc[];
    },
  });
}

function Checklist({ item }: { item: CaseStudy }) {
  return (
    <ul className="space-y-3">
      {casePending(item).map((p) => (
        <li key={p.field} className="flex gap-3">
          {p.done ? (
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-dm-green" />
          ) : (
            <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-dm-red" />
          )}
          <span>
            <span className={cn("block text-[13.5px] font-bold", p.done ? "text-dm-ink/55 line-through" : "text-dm-ink")}>{p.field}</span>
            {!p.done && <span className="block text-[12.5px] leading-relaxed text-dm-ink/60">{p.why}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ lista */

export function AdminCases({ user }: { user: PanelUser }) {
  const qc = useQueryClient();
  const docs = useCaseDocs();
  const [editing, setEditing] = useState<Row | "new" | null>(null);

  const rows = useMemo<Row[]>(() => {
    const bySlug = new Map((docs.data ?? []).map((d) => [d.key, d]));
    const base: Row[] = DEFAULT_CASES.map((c) => {
      const doc = bySlug.get(c.slug);
      return {
        slug: c.slug,
        item: doc && !doc.deleted ? { ...c, ...doc.data, slug: c.slug } : c,
        origin: "codigo",
        edited: !!doc && !doc.deleted,
        hidden: !!doc?.deleted,
        doc,
      };
    });
    const known = new Set(DEFAULT_CASES.map((c) => c.slug));
    const added: Row[] = (docs.data ?? [])
      .filter((d) => !known.has(d.key))
      .map((d) => ({ slug: d.key, item: { ...EMPTY_CASE, ...d.data, slug: d.key }, origin: "novo", edited: true, hidden: d.deleted, doc: d }));
    return [...base, ...added];
  }, [docs.data]);

  const visibility = useMutation({
    mutationFn: async (row: Row) => {
      const param = { collection: "case", key: row.slug };
      const res = row.hidden
        ? row.origin === "codigo" && !row.doc?.data?.title
          ? await api.admin.conteudo[":collection"][":key"].$delete({ param })
          : await api.admin.conteudo[":collection"][":key"].$put({ param, json: { data: row.doc?.data ?? {}, deleted: false } })
        : await api.admin.conteudo[":collection"][":key"].$put({ param, json: { data: row.doc?.data ?? {}, deleted: true } });
      if (!res.ok) throw new Error("fail");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-conteudo", "case"] }),
  });

  if (editing) return <CaseEditor row={editing === "new" ? null : editing} user={user} rows={rows} onClose={() => setEditing(null)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Cases"
          hint="Aplicações típicas com cenário simulado. Número, nome e foto de cliente só aparecem no site depois que a autorização por escrito é registrada aqui."
        />
        <Btn onClick={() => setEditing("new")}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Novo case
          </span>
        </Btn>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((r) => {
          const real = hasRealData(r.item);
          const missing = casePending(r.item).filter((p) => !p.done).length;
          return (
            <Card key={r.slug} className={cn(r.hidden && "opacity-60")}>
              <div className="flex items-start gap-4">
                <img src={r.item.image || "/img/site/hero.webp"} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge>{r.item.segment || "Sem setor"}</Badge>
                    {real ? <Badge tone="green">Case real</Badge> : <Badge tone="gray">Aplicação típica</Badge>}
                    {r.item.draft && <Badge tone="gray">Rascunho</Badge>}
                    {r.hidden && <Badge tone="red">Oculto</Badge>}
                  </div>
                  <h3 className="mt-2 font-display text-[16px] font-bold text-dm-ink">{r.item.title || "(sem título)"}</h3>
                  <p className="mt-1 text-[12.5px] text-dm-ink/55">
                    {missing ? `${missing} de 5 itens faltando para virar case real` : "Todos os itens de case real preenchidos"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 border-t border-black/5 pt-3">
                <Btn tone="ghost" onClick={() => setEditing(r)}>
                  <span className="inline-flex items-center gap-1.5">
                    <Pencil className="h-4 w-4" /> Editar
                  </span>
                </Btn>
                {!r.hidden && !r.item.draft && (
                  <a href={`/cases/${r.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue" title="Ver no site">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {user.role !== "editor" && (
                  <button
                    type="button"
                    disabled={visibility.isPending}
                    onClick={() => (r.hidden || confirm(`Ocultar "${r.item.title}" do site?`)) && visibility.mutate(r)}
                    className="ml-auto rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-ink"
                    title={r.hidden ? "Mostrar no site" : "Ocultar do site"}
                  >
                    {r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- editor */

function CaseEditor({ row, user, rows, onClose }: { row: Row | null; user: PanelUser; rows: Row[]; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !row;
  const canAuthorize = user.role === "super_admin" || user.role === "admin";
  const base = row?.item ?? { ...EMPTY_CASE, draft: true };
  const [c, setC] = useState<CaseStudy>({ ...base, real: { ...EMPTY_REAL, ...base.real } });
  const [slugInput, setSlugInput] = useState("");
  const [challenge, setChallenge] = useState(base.challenge.join("\n"));
  const [picking, setPicking] = useState<"image" | "photos" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof CaseStudy>(k: K, v: CaseStudy[K]) => setC((x) => ({ ...x, [k]: v }));
  const real = c.real!;
  const setReal = (patch: Partial<CaseReal>) => setC((x) => ({ ...x, real: { ...x.real!, ...patch } }));
  const slug = isNew ? slugInput || slugify(c.title) : row.slug;
  const preview = { ...c, challenge: lines(challenge) };

  const save = useMutation({
    mutationFn: async () => {
      const data: Partial<CaseStudy> = {
        ...c,
        challenge: lines(challenge),
        solution: c.solution.filter((s) => s.step.trim() || s.text.trim()),
        real: {
          ...real,
          results: real.results.filter((r) => r.label.trim()),
          testimonial: real.testimonial?.text.trim() ? real.testimonial : undefined,
        },
      };
      delete (data as { slug?: string }).slug;
      delete (data as { pending?: unknown }).pending;
      const res = await api.admin.conteudo[":collection"][":key"].$put({
        param: { collection: "case", key: slug },
        json: { data, deleted: row?.hidden ?? false },
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "case"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const discard = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "case", key: slug } });
      if (!res.ok) throw new Error("Não foi possível");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "case"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const validate = () => {
    if (!c.title.trim()) return "Informe o título";
    if (!c.segment.trim()) return "Informe o setor";
    if (!c.intro.trim()) return "Escreva a introdução";
    if (isNew) {
      if (!/^[a-z0-9-]{3,90}$/.test(slug)) return "Endereço inválido";
      if (rows.some((r) => r.slug === slug)) return "Já existe um case com esse endereço";
    }
    if (real.authorized && !real.client.trim()) return "Para marcar a autorização, informe o cliente";
    return null;
  };

  const sim = c.simulation;
  const simField = (k: "volumePerDay" | "people" | "peopleAfter" | "costPerPerson" | "daysPerMonth", label: string) => (
    <Field label={label}>
      <input type="number" min={0} value={sim[k]} onChange={(e) => set("simulation", { ...sim, [k]: Number(e.target.value) })} className={inputCls} />
    </Field>
  );

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
        <ArrowLeft className="h-4 w-4" /> Voltar para os cases
      </button>
      <PageTitle title={isNew ? "Novo case" : `Editar: ${row.item.title}`} />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Aplicação</h2>
            <div className="mt-5 grid gap-5">
              <Field label="Título*" hint="Sem nome de cliente: descreva a aplicação">
                <input value={c.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
              </Field>
              {isNew && (
                <Field label="Endereço" hint={`/cases/${slug || "..."}`}>
                  <input value={slugInput} onChange={(e) => setSlugInput(slugify(e.target.value))} placeholder={slugify(c.title) || "gerado a partir do título"} className={inputCls} />
                </Field>
              )}
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Setor*">
                  <input value={c.segment} onChange={(e) => set("segment", e.target.value)} placeholder="Agro e grãos" className={inputCls} />
                </Field>
                <Field label="Região" hint="Genérica, sem identificar a empresa">
                  <input value={c.region} onChange={(e) => set("region", e.target.value)} placeholder="Interior de São Paulo" className={inputCls} />
                </Field>
              </div>
              <Field label="Introdução*">
                <textarea rows={3} value={c.intro} onChange={(e) => set("intro", e.target.value)} className={inputCls} />
              </Field>
              <Field label="O que costuma travar essa operação" hint="Um problema por linha">
                <textarea rows={4} value={challenge} onChange={(e) => setChallenge(e.target.value)} className={inputCls} />
              </Field>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Etapas da configuração</p>
                <div className="mt-2 space-y-2">
                  {c.solution.map((s, i) => (
                    <div key={i} className="grid gap-2 rounded-xl border border-black/5 p-2 md:grid-cols-[180px_1fr_auto]">
                      <input value={s.step} onChange={(e) => set("solution", c.solution.map((x, j) => (j === i ? { ...x, step: e.target.value } : x)))} placeholder="Etapa" aria-label="Nome da etapa" className={inputCls} />
                      <input value={s.text} onChange={(e) => set("solution", c.solution.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} placeholder="O que a fábrica entrega nessa etapa" aria-label="Descrição da etapa" className={inputCls} />
                      <button type="button" onClick={() => set("solution", c.solution.filter((_, j) => j !== i))} className="rounded p-2 text-dm-ink/35 hover:text-dm-red" title="Remover etapa">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => set("solution", [...c.solution, { step: "", text: "" }])} className="mt-2 text-[12.5px] font-bold uppercase tracking-wide text-dm-blue hover:underline">
                  + Etapa
                </button>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Equipamentos do case</p>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {products.map((p) => (
                    <label key={p.slug} className="flex items-center gap-2 text-[13px] text-dm-ink/80">
                      <input
                        type="checkbox"
                        checked={c.products.includes(p.slug)}
                        onChange={(e) => set("products", e.target.checked ? [...c.products, p.slug] : c.products.filter((s) => s !== p.slug))}
                        className="h-4 w-4 accent-dm-blue"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Cenário simulado</h2>
            <p className="mt-1 text-[12.5px] text-dm-ink/55">Aparece rotulado como simulação, com as premissas visíveis. Não é resultado de cliente.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {simField("volumePerDay", "Volumes por dia")}
              {simField("daysPerMonth", "Dias por mês")}
              {simField("costPerPerson", "Custo mensal por pessoa (R$)")}
              {simField("people", "Pessoas hoje")}
              {simField("peopleAfter", "Pessoas depois")}
            </div>
            <Field label="Nota das premissas">
              <input value={sim.note} onChange={(e) => set("simulation", { ...sim, note: e.target.value })} className={cn(inputCls, "mt-1")} />
            </Field>
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Dados reais do cliente</h2>
            <p className="mt-1 text-[12.5px] text-dm-ink/55">
              Preencha à vontade: nada daqui vai para o site sem a autorização marcada no fim desta caixa.
            </p>
            <div className="mt-5 grid gap-5">
              <Field label="Cliente (nome da empresa)">
                <input value={real.client} onChange={(e) => setReal({ client: e.target.value })} className={inputCls} />
              </Field>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Resultados medidos</p>
                <div className="mt-2 space-y-2">
                  {real.results.map((r, i) => (
                    <div key={i} className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
                      <input value={r.label} onChange={(e) => setReal({ results: real.results.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="O que foi medido" aria-label="O que foi medido" className={inputCls} />
                      <input value={r.before} onChange={(e) => setReal({ results: real.results.map((x, j) => (j === i ? { ...x, before: e.target.value } : x)) })} placeholder="Antes" aria-label="Antes" className={inputCls} />
                      <input value={r.after} onChange={(e) => setReal({ results: real.results.map((x, j) => (j === i ? { ...x, after: e.target.value } : x)) })} placeholder="Depois" aria-label="Depois" className={inputCls} />
                      <button type="button" onClick={() => setReal({ results: real.results.filter((_, j) => j !== i) })} className="rounded p-2 text-dm-ink/35 hover:text-dm-red" title="Remover">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setReal({ results: [...real.results, { label: "", before: "", after: "" }] })} className="mt-2 text-[12.5px] font-bold uppercase tracking-wide text-dm-blue hover:underline">
                  + Resultado
                </button>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Depoimento: nome">
                  <input value={real.testimonial?.name ?? ""} onChange={(e) => setReal({ testimonial: { name: e.target.value, role: real.testimonial?.role ?? "", text: real.testimonial?.text ?? "" } })} className={inputCls} />
                </Field>
                <Field label="Cargo">
                  <input value={real.testimonial?.role ?? ""} onChange={(e) => setReal({ testimonial: { name: real.testimonial?.name ?? "", role: e.target.value, text: real.testimonial?.text ?? "" } })} className={inputCls} />
                </Field>
              </div>
              <Field label="Depoimento" hint="Palavras do cliente, sem editar o sentido">
                <textarea rows={3} value={real.testimonial?.text ?? ""} onChange={(e) => setReal({ testimonial: { name: real.testimonial?.name ?? "", role: real.testimonial?.role ?? "", text: e.target.value } })} className={inputCls} />
              </Field>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Fotos da instalação no cliente</p>
                  <button type="button" onClick={() => setPicking("photos")} className="inline-flex items-center gap-1 text-[12px] font-bold text-dm-blue hover:underline">
                    <ImagePlus className="h-4 w-4" /> Adicionar
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {real.photos.map((src, i) => (
                    <div key={src + i} className="relative overflow-hidden rounded-lg bg-dm-surface">
                      <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                      <button type="button" onClick={() => setReal({ photos: real.photos.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-dm-red" title="Remover foto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className={cn("flex items-start gap-3 rounded-xl border p-4", real.authorized ? "border-dm-green/40 bg-dm-green/[0.05]" : "border-dm-red/20 bg-dm-red/[0.03]", !canAuthorize && "opacity-70")}>
                <input
                  type="checkbox"
                  checked={real.authorized}
                  disabled={!canAuthorize}
                  onChange={(e) =>
                    setReal(
                      e.target.checked
                        ? { authorized: true, authorizedAt: new Date().toISOString(), authorizedBy: user.name }
                        : { authorized: false, authorizedAt: undefined, authorizedBy: undefined },
                    )
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-dm-green"
                />
                <span className="text-[13px] leading-relaxed text-dm-ink/80">
                  <span className="block font-bold text-dm-ink">A Demakine tem autorização por escrito do cliente</span>
                  para publicar o nome, os números medidos, o depoimento e as fotos acima. Guarde o documento: é ele que protege a empresa.
                  {real.authorized && real.authorizedBy && (
                    <span className="mt-1 block text-[12px] text-dm-green-dark">
                      Marcado por {real.authorizedBy}
                      {real.authorizedAt ? ` em ${new Date(real.authorizedAt).toLocaleDateString("pt-BR")}` : ""}.
                    </span>
                  )}
                  {!canAuthorize && <span className="mt-1 block text-[12px]">Só admin marca a autorização.</span>}
                </span>
              </label>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Imagem principal</h2>
            <button type="button" onClick={() => setPicking("image")} className="mt-3 block w-full overflow-hidden rounded-xl border border-dashed border-black/15 bg-dm-surface">
              {c.image ? (
                <img src={c.image} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <span className="flex aspect-video items-center justify-center text-[12px] font-bold text-dm-ink/45">Escolher imagem</span>
              )}
            </button>
          </Card>
          <Card className="xl:sticky xl:top-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[16px] font-extrabold text-dm-ink">Para virar case real</h2>
              {hasRealData(preview) ? <Badge tone="green">No site como case real</Badge> : <Badge tone="gray">Aplicação típica</Badge>}
            </div>
            <div className="mt-4">
              <Checklist item={preview} />
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur">
        {canAuthorize ? (
          <label className="flex items-center gap-2 text-[13px] font-semibold text-dm-ink">
            <input type="checkbox" checked={!c.draft} onChange={(e) => set("draft", !e.target.checked)} className="h-4 w-4 accent-dm-blue" />
            Publicado no site
          </label>
        ) : (
          <span className="text-[12.5px] text-dm-ink/60">{c.draft ? "Rascunho: um admin publica." : "Publicado"}</span>
        )}
        <Btn type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Btn>
        <Btn tone="ghost" onClick={onClose}>
          Cancelar
        </Btn>
        {error && <span className="text-[13px] font-semibold text-dm-red">{error}</span>}
        {row?.edited && canAuthorize && (
          <button
            type="button"
            disabled={discard.isPending}
            onClick={() => confirm(row.origin === "novo" ? `Apagar o case "${row.item.title}"?` : `Descartar as edições de "${row.item.title}"?`) && discard.mutate()}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-red"
          >
            {row.origin === "novo" ? <Trash2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {row.origin === "novo" ? "Apagar case" : "Voltar ao original"}
          </button>
        )}
      </div>

      {picking && (
        <MediaPicker
          multiple={picking === "photos"}
          onClose={() => setPicking(null)}
          onPick={(urls) => {
            if (picking === "image") set("image", urls[0] ?? "");
            else setReal({ photos: [...real.photos, ...urls.filter((u) => !real.photos.includes(u))] });
            setPicking(null);
          }}
        />
      )}
    </form>
  );
}
