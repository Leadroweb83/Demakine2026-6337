import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { CARD_BLOCKS, KPI_BLOCKS } from "../../web/admin/layout";

/**
 * O que cada papel enxerga no Dashboard, decidido pelo super admin (app_settings "dashboard_acesso").
 * Guarda só o que foi BLOQUEADO: bloco novo no código nasce visível. Super admin vê tudo sempre.
 * Os dados de um bloco bloqueado nem saem do servidor.
 */
export const ACCESS_ROLES = ["admin", "vendedor"] as const;
export type AccessRole = (typeof ACCESS_ROLES)[number];

/** Pseudo-bloco: sem ele, o papel só enxerga os próprios leads no Dashboard. */
export const TEAM_VIEW = "equipe";

export const ACCESS_IDS: string[] = [TEAM_VIEW, ...KPI_BLOCKS.map((b) => b.id), ...CARD_BLOCKS.map((b) => b.id)];

export type DashboardAccess = Record<AccessRole, string[]>;
const SETTINGS_KEY = "dashboard_acesso";

export async function getDashboardAccess(): Promise<DashboardAccess> {
  const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, SETTINGS_KEY));
  return cleanAccess(row?.value);
}

export function cleanAccess(v: unknown): DashboardAccess {
  const src = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const list = (x: unknown) =>
    Array.isArray(x) ? [...new Set(x.filter((id): id is string => typeof id === "string" && ACCESS_IDS.includes(id)))] : [];
  return { admin: list(src.admin), vendedor: list(src.vendedor) };
}

export async function saveDashboardAccess(value: DashboardAccess, userId: string) {
  await db
    .insert(schema.appSettings)
    .values({ key: SETTINGS_KEY, value, updatedBy: userId, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.appSettings.key, set: { value, updatedBy: userId, updatedAt: new Date() } });
}

export function blockedFor(access: DashboardAccess, role: string | null | undefined): string[] {
  if (role === "super_admin") return [];
  return (ACCESS_ROLES as readonly string[]).includes(role ?? "") ? access[role as AccessRole] : [];
}

/** Campos da resposta do Dashboard que só servem àquele bloco (os compartilhados ficam). */
const EXCLUSIVE: Record<string, (d: Record<string, any>) => void> = {
  "kpi-conversao": (d) => Object.assign(d.kpi, { conversion: null, previousConversion: null, won: 0 }),
  "kpi-aberto": (d) => Object.assign(d.kpi, { openLeads: 0, previousOpenLeads: 0 }),
  "kpi-contato": (d) => Object.assign(d.kpi, { avgFirstContactHours: null, previousAvgFirstContactHours: null }),
  "kpi-negociacao": (d) => Object.assign(d.money, { openValue: 0, openCount: 0 }),
  "kpi-fechado": (d) => Object.assign(d.money, { wonMonthValue: 0, wonMonthCount: 0, wonPeriodValue: 0, avgTicket: null }),
  retornos: (d) => (d.followUps = []),
  mensal: (d) => (d.byMonth = []),
  retorno: (d) => (d.stale = []),
  origem: (d) => (d.bySource = []),
  responsavel: (d) => Object.assign(d, { byOwner: [], unassigned: 0 }),
  horario: (d) => (d.byWeekHour = Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => 0))),
  estado: (d) => Object.assign(d, { byState: [], stateUnknown: 0 }),
  produtos: (d) => (d.topProducts = []),
  cidades: (d) => (d.topCities = []),
  perdas: (d) => (d.lossReasons = []),
  recentes: (d) => (d.recent = []),
};

export function stripDashboard<T extends object>(payload: T, blocked: string[]): T & { blocked: string[] } {
  const d = { ...payload, blocked } as Record<string, any>;
  if ("kpi" in d) d.kpi = { ...d.kpi };
  if ("money" in d) d.money = { ...d.money };
  for (const id of blocked) EXCLUSIVE[id]?.(d);
  return d as T & { blocked: string[] };
}
