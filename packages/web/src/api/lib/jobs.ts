export const JOB_TYPES = ["efetivo", "estagio", "temporario", "pj"] as const;
export const JOB_STATUSES = ["aberta", "pausada", "encerrada"] as const;
export const APPLICATION_STATUSES = ["recebido", "analise", "entrevista", "aprovado", "reprovado", "banco"] as const;

/** `AAAA-MM/<uuid>.pdf`, gerada pelo próprio servidor no presign. */
export const RESUME_KEY_RE = /^\d{4}-\d{2}\/[0-9a-f-]{36}\.pdf$/;

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Data de hoje no fuso da fábrica, no formato da coluna date (AAAA-MM-DD). */
export function todaySP() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function isJobOpen(job: { status: string; deadline: string | null }) {
  return job.status === "aberta" && (!job.deadline || job.deadline >= todaySP());
}

/** O que o site pode ver de uma vaga: salário só quando a vaga manda mostrar. */
export function publicJob<
  T extends { salary: string | null; showSalary: boolean; status: string; deadline: string | null },
>(job: T) {
  const { salary, showSalary, ...rest } = job;
  return { ...rest, salary: showSalary ? salary : null, open: isJobOpen(job) };
}

export type JobInput = {
  title?: string;
  area?: string;
  type?: string;
  location?: string;
  summary?: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  salary?: string | null;
  showSalary?: boolean;
  status?: string;
  deadline?: string | null;
};

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;

/**
 * Valida e normaliza o corpo de criação/edição de vaga.
 * `partial` aceita só os campos enviados (PATCH).
 */
export function parseJobInput(body: JobInput, partial: boolean) {
  const out: Record<string, unknown> = {};
  const has = (k: keyof JobInput) => !partial || body[k] !== undefined;

  if (has("title")) {
    const title = clean(body.title, 120);
    if (!title) return { error: "Informe o título da vaga" } as const;
    out.title = title;
  }
  if (has("area")) {
    const area = clean(body.area, 60);
    if (!area) return { error: "Informe a área" } as const;
    out.area = area;
  }
  if (has("summary")) {
    const summary = clean(body.summary, 280);
    if (!summary) return { error: "Escreva um resumo curto da vaga" } as const;
    out.summary = summary;
  }
  if (has("type")) {
    const type = body.type ?? "efetivo";
    if (!(JOB_TYPES as readonly string[]).includes(type)) return { error: "Tipo de vaga inválido" } as const;
    out.type = type;
  }
  if (has("status")) {
    const status = body.status ?? "aberta";
    if (!(JOB_STATUSES as readonly string[]).includes(status)) return { error: "Status inválido" } as const;
    out.status = status;
  }
  if (has("location")) out.location = clean(body.location, 80) ?? "Limeira/SP";
  if (has("description")) out.description = clean(body.description, 6000);
  if (has("requirements")) out.requirements = clean(body.requirements, 4000);
  if (has("benefits")) out.benefits = clean(body.benefits, 4000);
  if (has("salary")) out.salary = clean(body.salary, 80);
  if (has("showSalary")) out.showSalary = body.showSalary === true;
  if (has("deadline")) {
    const d = body.deadline ?? null;
    if (d !== null && d !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return { error: "Data limite inválida" } as const;
    out.deadline = d || null;
  }
  return { data: out } as const;
}
