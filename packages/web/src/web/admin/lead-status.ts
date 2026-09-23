import { CircleDot, CircleX, PhoneCall, Trophy } from "lucide-react";

export type LeadStatus = "novo" | "em_contato" | "ganho" | "perdido";

export const LEAD_STATUSES: LeadStatus[] = ["novo", "em_contato", "ganho", "perdido"];

/** Cores validadas para daltonismo (sempre com rótulo e ícone ao lado). */
export const STATUS_META: Record<LeadStatus, { label: string; color: string; Icon: typeof CircleDot }> = {
  novo: { label: "Novo", color: "#2f6bd8", Icon: CircleDot },
  em_contato: { label: "Em contato", color: "#d08000", Icon: PhoneCall },
  ganho: { label: "Ganho", color: "#17864f", Icon: Trophy },
  perdido: { label: "Perdido", color: "#e4141b", Icon: CircleX },
};

export function statusMeta(status: string | null | undefined) {
  return STATUS_META[(status ?? "novo") as LeadStatus] ?? STATUS_META.novo;
}
