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

/**
 * Troca de responsável. Sem esta trava, quem assumisse o lead de um colega passaria a ver o valor dele.
 * Lead que já tem dono (inclusive o próprio): só o super admin troca.
 * Lead sem dono: o vendedor assume para si; o admin distribui para a equipe.
 */
export function ownerChangeError(
  me: { id: string; role?: string | null },
  lead: { ownerId: string | null },
  next: string | null,
) {
  if (me.role === "super_admin") return null;
  if (lead.ownerId) return "Este lead já tem responsável. Só o super admin pode trocar.";
  if (me.role === "vendedor" && next && next !== me.id) return "Vendedor só assume o lead para si.";
  return null;
}
