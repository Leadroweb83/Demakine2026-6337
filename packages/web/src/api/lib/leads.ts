export const LEAD_STATUSES = ["novo", "em_contato", "ganho", "perdido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const isLeadStatus = (v: unknown): v is LeadStatus =>
  typeof v === "string" && (LEAD_STATUSES as readonly string[]).includes(v);

/** Tipos de registro do histórico do lead. */
export const LEAD_EVENT_TYPES = ["status", "responsavel", "nota", "contato"] as const;
