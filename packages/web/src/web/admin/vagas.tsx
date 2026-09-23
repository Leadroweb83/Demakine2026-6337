import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import { can, type PanelUser } from "../lib/auth";
import { JOB_TYPE_LABEL, brDate } from "@/lib/vagas";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";

/* ------------------------------------------------------------------ tipos */

type Job = {
  id: number;
  slug: string;
  title: string;
  area: string;
  type: string;
  location: string;
  summary: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salary: string | null;
  showSalary: boolean;
  status: string;
  deadline: string | null;
  open: boolean;
  applications: number;
};

type Application = {
  id: number;
  jobId: number | null;
  jobTitle: string | null;
  jobSlug: string | null;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  linkedin: string | null;
  salaryExpectation: string | null;
  message: string | null;
  resumeKey: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

const JOB_STATUS: Record<string, { label: string; tone: "green" | "gray" | "red" }> = {
  aberta: { label: "Aberta", tone: "green" },
  pausada: { label: "Pausada", tone: "gray" },
  encerrada: { label: "Encerrada", tone: "red" },
};

/** Etapas da seleção, na ordem das colunas. */
export const STAGES = [
  { id: "recebido", label: "Recebido", bar: "bg-dm-blue" },
  { id: "analise", label: "Em análise", bar: "bg-[#d08000]" },
  { id: "entrevista", label: "Entrevista", bar: "bg-[#7a4fd6]" },
  { id: "aprovado", label: "Aprovado", bar: "bg-dm-green" },
  { id: "reprovado", label: "Reprovado", bar: "bg-dm-red" },
  { id: "banco", label: "Banco de talentos", bar: "bg-dm-ink/40" },
] as const;

const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;

/* -------------------------------------------------------- mensagens prontas */

function template(stage: string, a: Application) {
  const first = a.name.split(" ")[0] ?? a.name;
  const vaga = a.jobTitle ? `a vaga de ${a.jobTitle}` : "o nosso banco de talentos";
  const sign = "\n\nEquipe de RH Demakine";
  switch (stage) {
    case "entrevista":
      return `Olá, ${first}! Aqui é do RH da Demakine. Gostamos do seu perfil para ${vaga} e queremos marcar uma entrevista. Qual o melhor dia e horário para você?${sign}`;
    case "aprovado":
      return `Olá, ${first}! Temos uma ótima notícia: você foi aprovado(a) no processo seletivo para ${vaga}. Vamos combinar os próximos passos?${sign}`;
    case "reprovado":
      return `Olá, ${first}, tudo bem? Agradecemos muito o seu interesse em ${vaga}. Desta vez seguimos com outro perfil, mas o seu currículo fica no nosso banco de talentos para as próximas oportunidades. Boa sorte!${sign}`;
    case "banco":
      return `Olá, ${first}! Aqui é do RH da Demakine. O seu currículo está no nosso banco de talentos. Quando abrir uma vaga no seu perfil, entramos em contato.${sign}`;
    default:
      return `Olá, ${first}! Aqui é do RH da Demakine. Recebemos a sua candidatura para ${vaga} e ela está em análise. Retornamos em breve.${sign}`;
  }
}

function waHref(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

function mailHref(email: string, text: string) {
  return `mailto:${email}?subject=${encodeURIComponent("Sua candidatura na Demakine")}&body=${encodeURIComponent(text)}`;
}

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

/* ------------------------------------------------------------------- tela */

export function AdminVagas({ user }: { user: PanelUser }) {
  const seesCandidates = can(user.role, "candidatos");
  const [tab, setTab] = useState<"candidatos" | "vagas">(seesCandidates ? "candidatos" : "vagas");

  const jobsQuery = useQuery({
    queryKey: ["admin-vagas"],
    queryFn: async () => {
      const res = await api.admin.vagas.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()) as unknown as { jobs: Job[]; talentPool: number };
    },
  });

  return (
    <div className="space-y-6">
      <PageTitle
        title="Vagas"
        hint="Publique as vagas do site e conduza a seleção. As vagas abertas aparecem em /vagas e no Google Vagas."
      />

      {seesCandidates && (
        <div className="flex gap-1 rounded-full bg-black/[0.04] p-1 sm:inline-flex">
          {(["candidatos", "vagas"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={cn(
                "flex-1 whitespace-nowrap rounded-full px-5 py-2 text-[12.5px] font-bold uppercase tracking-wide transition-colors",
                tab === t ? "bg-white text-dm-ink shadow-sm" : "text-dm-ink/55 hover:text-dm-ink",
              )}
            >
              {t === "candidatos" ? "Candidatos" : "Vagas publicadas"}
            </button>
          ))}
        </div>
      )}

      {tab === "candidatos" && seesCandidates ? (
        <Candidates jobs={jobsQuery.data?.jobs ?? []} />
      ) : (
        <Jobs
          jobs={jobsQuery.data?.jobs ?? []}
          loading={jobsQuery.isPending}
          canDelete={seesCandidates}
          showCounts={seesCandidates}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ vagas */

const EMPTY = {
  title: "",
  area: "",
  type: "efetivo",
  location: "Limeira/SP",
  summary: "",
  description: "",
  requirements: "",
  benefits: "",
  salary: "",
  showSalary: false,
  status: "aberta",
  deadline: "",
};

type JobForm = typeof EMPTY;

function Jobs({
  jobs,
  loading,
  canDelete,
  showCounts,
}: {
  jobs: Job[];
  loading: boolean;
  canDelete: boolean;
  showCounts: boolean;
}) {
  const [editing, setEditing] = useState<Job | "new" | null>(null);

  if (editing) {
    return (
      <JobEditor
        job={editing === "new" ? null : editing}
        areas={[...new Set(jobs.map((j) => j.area))]}
        canDelete={canDelete}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-6 py-4">
        <p className="text-[13px] text-dm-ink/60">
          {jobs.filter((j) => j.open).length} abertas no site · {jobs.length} no total
        </p>
        <Btn onClick={() => setEditing("new")}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nova vaga
          </span>
        </Btn>
      </div>
      {loading && <p className="px-6 py-8 text-[13.5px] text-dm-ink/50">Carregando vagas...</p>}
      <ul className="divide-y divide-black/5">
        {jobs.map((j) => {
          const st = JOB_STATUS[j.status] ?? JOB_STATUS.aberta!;
          const expired = j.status === "aberta" && !j.open;
          return (
            <li key={j.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-bold text-dm-ink">{j.title}</p>
                  <Badge tone={expired ? "gray" : st.tone}>{expired ? "Prazo vencido" : st.label}</Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-dm-ink/55">
                  {j.area} · {JOB_TYPE_LABEL[j.type] ?? j.type} · {j.location}
                  {j.deadline && ` · até ${brDate(j.deadline)}`}
                </p>
              </div>
              {showCounts && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-dm-ink/70">
                  <Users className="h-4 w-4" /> {j.applications}
                </span>
              )}
              <a
                href={`/vagas/${j.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue"
                title="Ver no site"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Ver {j.title} no site</span>
              </a>
              <button
                type="button"
                onClick={() => setEditing(j)}
                className="rounded-lg p-2 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-blue"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar {j.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!loading && !jobs.length && (
        <p className="px-6 py-8 text-[13.5px] text-dm-ink/50">Nenhuma vaga cadastrada ainda.</p>
      )}
    </div>
  );
}

function JobEditor({
  job,
  areas,
  canDelete,
  onClose,
}: {
  job: Job | null;
  areas: string[];
  canDelete: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<JobForm>(() =>
    job
      ? {
          title: job.title,
          area: job.area,
          type: job.type,
          location: job.location,
          summary: job.summary,
          description: job.description ?? "",
          requirements: job.requirements ?? "",
          benefits: job.benefits ?? "",
          salary: job.salary ?? "",
          showSalary: job.showSalary,
          status: job.status,
          deadline: job.deadline ?? "",
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const set =
    (k: keyof JobForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: async () => {
      const res = job
        ? await api.admin.vagas[":id"].$patch({ param: { id: String(job.id) }, json: form })
        : await api.admin.vagas.$post({ json: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vagas"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const res = await api.admin.vagas[":id"].$delete({ param: { id: String(job!.id) } });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Não foi possível apagar");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vagas"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  return (
    <Card>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para a lista
      </button>
      <h2 className="mt-4 font-display text-[19px] font-extrabold text-dm-ink">
        {job ? `Editar: ${job.title}` : "Nova vaga"}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          save.mutate();
        }}
        className="mt-6 grid gap-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Título da vaga*">
            <input required value={form.title} onChange={set("title")} placeholder="Montador Soldador" className={inputCls} />
          </Field>
          <Field label="Área*" hint="Produção, Comercial, Engenharia...">
            <input required value={form.area} onChange={set("area")} list="vaga-areas" className={inputCls} />
            <datalist id="vaga-areas">
              {areas.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          <Field label="Tipo">
            <select value={form.type} onChange={set("type")} className={inputCls}>
              {Object.entries(JOB_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Local">
            <input value={form.location} onChange={set("location")} placeholder="Limeira/SP" className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set("status")} className={inputCls}>
              {Object.entries(JOB_STATUS).map(([v, s]) => (
                <option key={v} value={v}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Inscrições até" hint="Sai do site no dia seguinte">
            <input type="date" value={form.deadline} onChange={set("deadline")} className={inputCls} />
          </Field>
        </div>
        <Field label="Resumo*" hint="Aparece no cartão da lista. Até 280 caracteres.">
          <textarea required maxLength={280} rows={2} value={form.summary} onChange={set("summary")} className={inputCls} />
        </Field>
        <Field label="Descrição" hint="Como é o dia a dia da função. Deixe uma linha em branco entre parágrafos.">
          <textarea rows={5} value={form.description} onChange={set("description")} className={inputCls} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Requisitos" hint="Um por linha">
            <textarea rows={5} value={form.requirements} onChange={set("requirements")} className={inputCls} />
          </Field>
          <Field label="O que oferecemos" hint="Um por linha: salário, VR, VT, convênio...">
            <textarea rows={5} value={form.benefits} onChange={set("benefits")} className={inputCls} />
          </Field>
        </div>
        <div className="grid items-end gap-5 md:grid-cols-2">
          <Field label="Salário ou faixa" hint="Vaga com salário visível recebe mais candidatos">
            <input value={form.salary} onChange={set("salary")} placeholder="R$ 2.400 a R$ 2.900" className={inputCls} />
          </Field>
          <label className="flex items-center gap-2.5 pb-3 text-[13.5px] font-semibold text-dm-ink">
            <input
              type="checkbox"
              checked={form.showSalary}
              onChange={(e) => setForm((f) => ({ ...f, showSalary: e.target.checked }))}
              className="h-4 w-4 accent-dm-blue"
            />
            Mostrar o salário no site
          </label>
        </div>

        {error && <p className="text-[13px] font-semibold text-dm-red">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <Btn type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : job ? "Salvar" : "Publicar vaga"}
          </Btn>
          <Btn tone="ghost" onClick={onClose}>
            Cancelar
          </Btn>
          {job && canDelete && (
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm(`Apagar a vaga "${job.title}"? Se ela já tem candidatos, encerre em vez de apagar.`)) {
                  remove.mutate();
                }
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-red hover:bg-dm-red/10"
            >
              <Trash2 className="h-4 w-4" /> Apagar
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------- candidatos */

function Candidates({ jobs }: { jobs: Job[] }) {
  const [jobFilter, setJobFilter] = useState("todas");
  const [openId, setOpenId] = useState<number | null>(null);

  const appsQuery = useQuery({
    queryKey: ["admin-candidaturas"],
    queryFn: async () => {
      const res = await api.admin.candidaturas.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).applications as unknown as Application[];
    },
  });

  const all = appsQuery.data ?? [];
  const list = useMemo(
    () =>
      jobFilter === "todas"
        ? all
        : jobFilter === "banco"
          ? all.filter((a) => a.jobId === null)
          : all.filter((a) => String(a.jobId) === jobFilter),
    [all, jobFilter],
  );
  const current = all.find((a) => a.id === openId) ?? null;

  if (current) return <CandidateDetail app={current} onClose={() => setOpenId(null)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className={cn(inputCls, "w-auto min-w-[240px]")}
          aria-label="Filtrar por vaga"
        >
          <option value="todas">Todas as vagas ({all.length})</option>
          <option value="banco">Banco de talentos, sem vaga ({all.filter((a) => a.jobId === null).length})</option>
          {jobs.map((j) => (
            <option key={j.id} value={String(j.id)}>
              {j.title} ({all.filter((a) => a.jobId === j.id).length})
            </option>
          ))}
        </select>
        {appsQuery.isPending && <span className="text-[13px] text-dm-ink/50">Carregando...</span>}
      </div>

      {/* colunas por etapa */}
      <div className="-mx-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
        <div className="grid min-w-[1080px] grid-cols-6 gap-3">
          {STAGES.map((s) => {
            const items = list.filter((a) => a.status === s.id);
            return (
              <section key={s.id} className="rounded-2xl bg-black/[0.03] p-2.5" aria-label={s.label}>
                <header className="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                  <span className={cn("h-2.5 w-2.5 rounded-full", s.bar)} />
                  <h3 className="flex-1 text-[12px] font-bold uppercase tracking-wide text-dm-ink/70">{s.label}</h3>
                  <span className="text-[12px] font-bold tabular-nums text-dm-ink/50">{items.length}</span>
                </header>
                <div className="space-y-2">
                  {items.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setOpenId(a.id)}
                      className="block w-full rounded-xl border border-black/5 bg-white p-3 text-left shadow-sm transition-colors hover:border-dm-blue/40"
                    >
                      <p className="truncate text-[13.5px] font-bold text-dm-ink">{a.name}</p>
                      <p className="mt-0.5 truncate text-[12px] text-dm-ink/55">{a.jobTitle ?? "Banco de talentos"}</p>
                      <p className="mt-2 flex items-center gap-2 text-[11.5px] text-dm-ink/45">
                        <span className="shrink-0">{when(a.createdAt)}</span>
                        {a.city && <span className="truncate">· {a.city}</span>}
                        {a.resumeKey && <FileText className="ml-auto h-3.5 w-3.5 shrink-0 text-dm-blue" aria-label="Tem currículo" />}
                      </p>
                    </button>
                  ))}
                  {!items.length && <p className="px-1.5 py-3 text-[12px] text-dm-ink/35">Nenhum</p>}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CandidateDetail({ app, onClose }: { app: Application; onClose: () => void }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(app.notes ?? "");
  const [message, setMessage] = useState(() => template(app.status, app));
  const [error, setError] = useState<string | null>(null);

  const patch = useMutation({
    mutationFn: async (body: { status?: string; notes?: string }) => {
      const res = await api.admin.candidaturas[":id"].$patch({ param: { id: String(app.id) }, json: body });
      if (!res.ok) throw new Error("Não foi possível salvar");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidaturas"] });
      qc.invalidateQueries({ queryKey: ["admin-candidaturas-novas"] });
    },
    onError: (e) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const res = await api.admin.candidaturas[":id"].$delete({ param: { id: String(app.id) } });
      if (!res.ok) throw new Error("Não foi possível apagar");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidaturas"] });
      qc.invalidateQueries({ queryKey: ["admin-candidaturas-novas"] });
      qc.invalidateQueries({ queryKey: ["admin-vagas"] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const openResume = async () => {
    // abre a aba antes do await para o navegador não bloquear como pop-up
    const tab = window.open("about:blank", "_blank");
    const res = await api.admin.curriculo[":id"].$get({ param: { id: String(app.id) } });
    if (!res.ok) {
      tab?.close();
      setError("Não foi possível abrir o currículo");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    if (tab) tab.location.href = url;
  };

  const changeStage = (stage: string) => {
    setError(null);
    patch.mutate({ status: stage });
    setMessage(template(stage, app));
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para os candidatos
      </button>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <p className="text-[12px] font-bold uppercase tracking-wide text-dm-blue">
            {app.jobTitle ?? "Banco de talentos"}
          </p>
          <h2 className="mt-1 font-display text-[22px] font-extrabold text-dm-ink">{app.name}</h2>
          <p className="mt-1 text-[12.5px] text-dm-ink/50">
            Recebido em {new Date(app.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </p>

          <dl className="mt-5 grid gap-3 text-[14px] sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">WhatsApp</dt>
              <dd className="font-semibold text-dm-ink">{app.phone}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">E-mail</dt>
              <dd className="truncate font-semibold text-dm-ink">{app.email}</dd>
            </div>
            {app.city && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Cidade</dt>
                <dd className="flex items-center gap-1 font-semibold text-dm-ink">
                  <MapPin className="h-3.5 w-3.5 text-dm-ink/40" /> {app.city}
                </dd>
              </div>
            )}
            {app.salaryExpectation && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Pretensão</dt>
                <dd className="font-semibold text-dm-ink">{app.salaryExpectation}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {app.resumeKey ? (
              <Btn onClick={openResume}>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Abrir currículo
                </span>
              </Btn>
            ) : (
              <Badge tone="gray">Sem PDF, veja a experiência abaixo</Badge>
            )}
            {app.linkedin && (
              <a
                href={/^https?:\/\//.test(app.linkedin) ? app.linkedin : `https://${app.linkedin}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.03]"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
          </div>

          {app.message && (
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">
                {app.resumeKey ? "Mensagem" : "Experiência contada pelo candidato"}
              </p>
              <p className="mt-1.5 whitespace-pre-line rounded-xl bg-black/[0.03] p-4 text-[14px] leading-relaxed text-dm-ink/80">
                {app.message}
              </p>
            </div>
          )}

          <div className="mt-6">
            <Field label="Anotações internas" hint="Só a equipe vê">
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
            </Field>
            <div className="mt-2 flex items-center gap-3">
              <Btn tone="ghost" disabled={patch.isPending || notes === (app.notes ?? "")} onClick={() => patch.mutate({ notes })}>
                Salvar anotação
              </Btn>
              {patch.isSuccess && notes === (app.notes ?? "") && (
                <span className="text-[12.5px] font-semibold text-dm-green">Salvo</span>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Etapa</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => changeStage(s.id)}
                  aria-pressed={app.status === s.id}
                  disabled={patch.isPending}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold transition-colors",
                    app.status === s.id
                      ? "border-dm-blue bg-dm-blue-soft text-dm-blue"
                      : "border-black/10 text-dm-ink/70 hover:border-dm-blue/40",
                  )}
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", s.bar)} />
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">
              Responder ({stageLabel(app.status)})
            </p>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={cn(inputCls, "mt-3")}
              aria-label="Mensagem para o candidato"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={waHref(app.phone, message)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-dm-green px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white hover:bg-dm-green-dark"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={mailHref(app.email, message)}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.03]"
              >
                <Mail className="h-4 w-4" /> E-mail
              </a>
            </div>
            <p className="mt-2 text-[12px] text-dm-ink/45">
              O texto muda sozinho quando você troca a etapa. Revise antes de enviar.
            </p>
          </Card>

          {error && <p className="text-[13px] font-semibold text-dm-red">{error}</p>}

          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => {
              if (confirm(`Apagar a candidatura de ${app.name} e o currículo? Não dá para desfazer.`)) remove.mutate();
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-dm-red hover:bg-dm-red/10"
          >
            <Trash2 className="h-4 w-4" /> Apagar candidatura (LGPD)
          </button>
        </div>
      </div>
    </div>
  );
}
