/** Vaga como a API pública devolve (salário só vem quando a vaga manda mostrar). */
export type PublicJob = {
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
  status: string;
  deadline: string | null;
  createdAt: string;
  open: boolean;
};

export const JOB_TYPE_LABEL: Record<string, string> = {
  efetivo: "Efetivo (CLT)",
  estagio: "Estágio",
  temporario: "Temporário",
  pj: "PJ",
};

/** Para o Google Vagas (schema.org JobPosting employmentType). */
export const JOB_TYPE_SCHEMA: Record<string, string> = {
  efetivo: "FULL_TIME",
  estagio: "INTERN",
  temporario: "TEMPORARY",
  pj: "CONTRACTOR",
};

/** Texto com um item por linha vira lista; linhas vazias e marcadores ("-", "•") saem. */
export function lines(text: string | null | undefined) {
  return (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** "2026-10-15" -> "15/10/2026" sem passar por fuso. */
export function brDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
