export const LEAD_STATUSES = ["novo", "em_contato", "ganho", "perdido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const isLeadStatus = (v: unknown): v is LeadStatus =>
  typeof v === "string" && (LEAD_STATUSES as readonly string[]).includes(v);

/** Tipos de registro do histórico do lead. */
export const LEAD_EVENT_TYPES = ["status", "responsavel", "nota", "contato", "retorno", "valor"] as const;

/** Valor da proposta: só o super admin vê de todos; os demais só dos leads em que são responsáveis. */
export function canSeeLeadValue(me: { id: string; role?: string | null }, lead: { ownerId: string | null }) {
  return me.role === "super_admin" || lead.ownerId === me.id;
}
