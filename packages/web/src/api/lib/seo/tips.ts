/** Dicas do dia (puro): 15 por dia, até 8 vindas de problemas reais, o resto da biblioteca sem repetir até esgotar. */
import type { Issue } from "./issues";
import type { Tip, TipTab } from "./tips-library";

export type TipsState = { date: string; ids: string[]; seen: string[] };

const TAB_OF: Record<string, TipTab> = { imagens: "imagens", schema: "dados-estruturados" };

/** Uma dica por problema real, com o nome da página e o que fazer. */
export function tipsFromIssues(issues: (Issue & { fix?: string })[], pagesByPath: Map<string, { label: string }>): Tip[] {
  return issues.map((i) => ({
    id: `dado:${i.code}:${i.path}`,
    kind: "dado" as const,
    tab: TAB_OF[i.code] ?? "melhorar",
    title: `Corrigir: ${pagesByPath.get(i.path)?.label ?? i.path}`,
    body: `Na página "${pagesByPath.get(i.path)?.label ?? i.path}": ${i.message}.${i.fix ? ` ${i.fix}` : ""}`,
  }));
}

/** Embaralhamento estável pelo dia: o mesmo dia sempre dá a mesma ordem, dias diferentes dão ordens diferentes. */
function rank(id: string, day: string): number {
  let h = 2166136261;
  for (const ch of `${day}|${id}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}
const byDay = (day: string) => (a: Tip, b: Tip) => rank(a.id, day) - rank(b.id, day);

export function pickDailyTips(state: TipsState | null, today: string, library: Tip[], fromIssues: Tip[], count = 15): { state: TipsState; tips: Tip[] } {
  const all = new Map([...library, ...fromIssues].map((t) => [t.id, t]));
  if (state?.date === today) {
    const same = state.ids.map((id) => all.get(id)).filter((t): t is Tip => Boolean(t));
    if (same.length >= Math.min(count, library.length)) return { state, tips: same };
  }
  const yesterday = new Set(state?.ids ?? []);
  const picked: Tip[] = [];
  const take = (list: Tip[], max: number) => {
    for (const t of [...list].sort(byDay(today))) {
      if (picked.length >= max) break;
      if (!picked.some((p) => p.id === t.id)) picked.push(t);
    }
  };
  take(fromIssues.filter((t) => !yesterday.has(t.id)), Math.min(8, count));
  let seen = new Set(state?.seen ?? []);
  const fresh = (s: Set<string>) => library.filter((t) => !s.has(t.id) && !yesterday.has(t.id));
  take(fresh(seen), count);
  if (picked.length < count) {
    seen = new Set(); // biblioteca esgotada: o ciclo recomeça
    take(fresh(seen), count);
  }
  if (picked.length < count) take(library, count); // biblioteca muito pequena: aceita repetir as de ontem
  const libIds = picked.filter((t) => t.kind === "biblioteca").map((t) => t.id);
  return { state: { date: today, ids: picked.map((t) => t.id), seen: [...seen, ...libIds] }, tips: picked };
}
