/** Blocos do dashboard que cada usuário pode reordenar e esconder. */
export const KPI_BLOCKS = [
  { id: "kpi-leads", title: "Leads no período" },
  { id: "kpi-conversao", title: "Taxa de conversão" },
  { id: "kpi-aberto", title: "Em aberto" },
  { id: "kpi-contato", title: "Tempo até o 1º contato" },
] as const;

export const CARD_BLOCKS = [
  { id: "mensal", title: "Leads por mês", size: "M" },
  { id: "status", title: "Status dos leads", size: "M" },
  { id: "funil", title: "Funil do período", size: "M" },
  { id: "retorno", title: "Precisam de retorno", size: "M" },
  { id: "origem", title: "De onde vêm os leads", size: "M" },
  { id: "responsavel", title: "Carga por responsável", size: "M" },
  { id: "horario", title: "Quando os leads chegam", size: "M" },
  { id: "estado", title: "Leads por estado", size: "M" },
  { id: "produtos", title: "Produtos mais procurados", size: "S" },
  { id: "cidades", title: "Cidades com mais leads", size: "S" },
  { id: "perdas", title: "Motivos de perda", size: "S" },
  { id: "recentes", title: "Últimos leads recebidos", size: "L" },
] as const;

export type BlockId = (typeof KPI_BLOCKS)[number]["id"] | (typeof CARD_BLOCKS)[number]["id"];
export type DashboardLayout = { order: string[]; hidden: string[] };

export const SIZE_CLASS: Record<"S" | "M" | "L", string> = {
  S: "lg:col-span-4",
  M: "lg:col-span-6",
  L: "lg:col-span-12",
};

const ALL = [...KPI_BLOCKS, ...CARD_BLOCKS].map((b) => b.id as string);

export const DEFAULT_LAYOUT: DashboardLayout = { order: ALL, hidden: [] };

/** Mantém a ordem salva, descarta ids que não existem mais e acrescenta blocos novos no fim. */
export function resolveLayout(saved: DashboardLayout | null | undefined): DashboardLayout {
  if (!saved) return DEFAULT_LAYOUT;
  const known = saved.order.filter((id) => ALL.includes(id));
  const order = [...known, ...ALL.filter((id) => !known.includes(id))];
  return { order, hidden: saved.hidden.filter((id) => ALL.includes(id)) };
}
