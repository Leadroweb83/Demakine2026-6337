import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { SITE_DEFAULTS, type SiteData } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Btn, Card, Field, PageTitle, inputCls } from "./ui";

type Doc = { key: string; data: Partial<SiteData>; updatedAt: string; updatedBy: string | null };

const merge = (edit?: Partial<SiteData>): SiteData => ({
  ...SITE_DEFAULTS,
  ...edit,
  hours: { ...SITE_DEFAULTS.hours, ...edit?.hours },
  social: { ...SITE_DEFAULTS.social, ...edit?.social },
  stats: { ...SITE_DEFAULTS.stats, ...edit?.stats },
  departments: edit?.departments?.length ? edit.departments : SITE_DEFAULTS.departments,
});

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="font-display text-[16px] font-extrabold text-dm-ink">{title}</h2>
      {hint && <p className="mt-1 text-[12.5px] text-dm-ink/55">{hint}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </Card>
  );
}

export function AdminSiteSettings() {
  const qc = useQueryClient();
  const docQuery = useQuery({
    queryKey: ["admin-conteudo", "site"],
    queryFn: async () => {
      const res = await api.admin.conteudo[":collection"].$get({ param: { collection: "site" } });
      if (!res.ok) throw new Error("fail");
      const docs = (await res.json()).docs as unknown as Doc[];
      return docs.find((d) => d.key === "main") ?? null;
    },
  });

  const [form, setForm] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (docQuery.isSuccess && !form) setForm(merge(docQuery.data?.data));
  }, [docQuery.isSuccess, docQuery.data, form]);

  const save = useMutation({
    mutationFn: async (data: SiteData) => {
      const res = await api.admin.conteudo[":collection"][":key"].$put({
        param: { collection: "site", key: "main" },
        json: { data },
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "site"] });
    },
    onError: (e) => setError(e.message),
  });

  const reset = useMutation({
    mutationFn: async () => {
      const res = await api.admin.conteudo[":collection"][":key"].$delete({ param: { collection: "site", key: "main" } });
      if (!res.ok) throw new Error("Não foi possível restaurar");
    },
    onSuccess: () => {
      setForm(merge());
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["admin-conteudo", "site"] });
    },
    onError: (e) => setError(e.message),
  });

  if (!form) {
    return (
      <div className="space-y-6">
        <PageTitle title="Dados do site" />
        <p className="text-[13.5px] text-dm-ink/55">{docQuery.isError ? "Não foi possível carregar." : "Carregando..."}</p>
      </div>
    );
  }

  const set = <K extends keyof SiteData>(k: K, v: SiteData[K]) => {
    setSaved(false);
    setForm((f) => (f ? { ...f, [k]: v } : f));
  };
  const text = (k: "name" | "legal" | "tagline" | "email" | "phone" | "mobile" | "whatsapp" | "cnpj" | "address" | "addressShort") => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value),
    className: inputCls,
  });
  const deps = form.departments;
  const setDep = (i: number, patch: Partial<SiteData["departments"][number]>) =>
    set("departments", deps.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const moveDep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= deps.length) return;
    const next = [...deps];
    [next[i], next[j]] = [next[j]!, next[i]!];
    set("departments", next);
  };

  const validate = () => {
    const wa = form.whatsapp.replace(/\D/g, "");
    if (wa.length < 12 || wa.length > 13) return "O WhatsApp precisa ter DDI e DDD, só números: 5519998842717";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "E-mail principal inválido";
    const s = form.stats;
    if ([s.years, s.machines, s.clients, s.rating].some((n) => !Number.isFinite(n) || n < 0)) return "Os números da home precisam ser positivos";
    if (s.rating > 5) return "A nota média vai de 0 a 5";
    if (deps.some((d) => !d.name.trim())) return "Todo departamento precisa de nome";
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
        save.mutate({ ...form, whatsapp: form.whatsapp.replace(/\D/g, "") });
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Dados do site"
          hint="Telefones, endereço, horário, redes e os números da home. Depois de salvar, o site mostra a mudança em até 1 minuto."
        />
        {docQuery.data && (
          <p className="text-[12px] text-dm-ink/50">
            Última alteração: {docQuery.data.updatedBy ?? "painel"} em{" "}
            {new Date(docQuery.data.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </p>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Contato principal" hint="Aparece no topo, no rodapé, no contato e nos botões de ligar.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Telefone fixo">
              <input {...text("phone")} placeholder="(19) 3033-9397" />
            </Field>
            <Field label="Celular">
              <input {...text("mobile")} placeholder="(19) 99884-2717" />
            </Field>
            <Field label="WhatsApp dos botões" hint="Só números, com 55 e DDD">
              <input {...text("whatsapp")} inputMode="numeric" placeholder="5519998842717" />
            </Field>
            <Field label="E-mail principal">
              <input {...text("email")} type="email" />
            </Field>
          </div>
          <Field label="CNPJ" hint="Vazio esconde a linha de CNPJ do rodapé">
            <input {...text("cnpj")} placeholder="00.000.000/0000-00" />
          </Field>
        </Section>

        <Section title="Endereço e horário" hint="O mapa e o botão Como chegar usam este endereço.">
          <Field label="Endereço completo">
            <input {...text("address")} />
          </Field>
          <Field label="Cidade (versão curta)">
            <input {...text("addressShort")} placeholder="Limeira / SP" />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Segunda a quinta">
              <input
                value={form.hours.monThu}
                onChange={(e) => set("hours", { ...form.hours, monThu: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Sexta">
              <input
                value={form.hours.fri}
                onChange={(e) => set("hours", { ...form.hours, fri: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        <Section title="Números da home" hint="Contadores animados da home e da página A Empresa.">
          <div className="grid gap-5 sm:grid-cols-2">
            {(
              [
                ["years", "Anos de mercado", 1],
                ["machines", "Máquinas entregues", 1],
                ["clients", "Clientes", 1],
                ["rating", "Nota média (0 a 5)", 0.1],
              ] as const
            ).map(([k, label, step]) => (
              <Field key={k} label={label}>
                <input
                  type="number"
                  step={step}
                  min={0}
                  value={form.stats[k]}
                  onChange={(e) => set("stats", { ...form.stats, [k]: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Redes sociais" hint="Links completos, começando com https://">
          <div className="grid gap-5 md:grid-cols-2">
            {(["instagram", "facebook", "linkedin", "youtube"] as const).map((k) => (
              <Field key={k} label={k[0]!.toUpperCase() + k.slice(1)}>
                <input
                  value={form.social[k]}
                  onChange={(e) => set("social", { ...form.social, [k]: e.target.value })}
                  className={inputCls}
                />
              </Field>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Departamentos" hint="Lista da página de contato e da assistência técnica, na ordem abaixo.">
        <div className="space-y-2">
          {deps.map((d, i) => (
            <div key={i} className="grid items-center gap-2 rounded-xl border border-black/5 p-2 md:grid-cols-[1fr_1fr_1.3fr_auto]">
              <input value={d.name} onChange={(e) => setDep(i, { name: e.target.value })} placeholder="Nome" aria-label="Nome do departamento" className={inputCls} />
              <input value={d.phone} onChange={(e) => setDep(i, { phone: e.target.value })} placeholder="Telefone" aria-label="Telefone" className={inputCls} />
              <input value={d.email} onChange={(e) => setDep(i, { email: e.target.value })} placeholder="E-mail" aria-label="E-mail" className={inputCls} />
              <div className="flex">
                <button type="button" onClick={() => moveDep(i, -1)} disabled={i === 0} className="rounded-md p-2 text-dm-ink/45 hover:bg-black/[0.04] disabled:opacity-25" title="Subir">
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Subir {d.name}</span>
                </button>
                <button type="button" onClick={() => moveDep(i, 1)} disabled={i === deps.length - 1} className="rounded-md p-2 text-dm-ink/45 hover:bg-black/[0.04] disabled:opacity-25" title="Descer">
                  <ArrowDown className="h-4 w-4" />
                  <span className="sr-only">Descer {d.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => set("departments", deps.filter((_, j) => j !== i))}
                  className="rounded-md p-2 text-dm-red/70 hover:bg-dm-red/10 hover:text-dm-red"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remover {d.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("departments", [...deps, { name: "", phone: "", email: "" }])}
          className="inline-flex items-center gap-1.5 self-start text-[12.5px] font-bold uppercase tracking-wide text-dm-blue hover:underline"
        >
          <Plus className="h-4 w-4" /> Adicionar departamento
        </button>
      </Section>

      <div
        className={cn(
          "sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur",
        )}
      >
        <Btn type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar alterações"}
        </Btn>
        {saved && !error && <span className="text-[13px] font-semibold text-dm-green">Salvo. O site atualiza em até 1 minuto.</span>}
        {error && <span className="text-[13px] font-semibold text-dm-red">{error}</span>}
        {docQuery.data && (
          <button
            type="button"
            disabled={reset.isPending}
            onClick={() => {
              if (confirm("Voltar todos os dados do site para o padrão original?")) reset.mutate();
            }}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
          </button>
        )}
      </div>
    </form>
  );
}
