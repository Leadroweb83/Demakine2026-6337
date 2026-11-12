/**
 * Problemas de SEO: transforma os itens reprovados de uma página em avisos (com gravidade), compara com os que já
 * estavam abertos e monta os alertas da execução. Funções puras.
 */
import type { Check } from "./score";

export type Issue = { path: string; code: string; severity: "critico" | "atencao" | "info"; message: string };

/**
 * Gravidade: página que não responde e título ou H1 ausentes são críticos; página comum fora do Google (noindex) é
 * atenção; o resto depende do quanto falta (menos da metade dos pontos: atenção, senão informação).
 */
function severityOf(c: Check, code: string): Issue["severity"] {
  if (code === "status") return "critico";
  if (code === "noindex") return "atencao";
  const ratio = c.max > 0 ? c.points / c.max : 1;
  if ((c.item === "titulo" || c.item === "h1") && ratio === 0) return "critico";
  return ratio < 0.5 ? "atencao" : "info";
}

/**
 * `technical`: página que fica fora do Google de propósito (obrigado, loja ou escondida pelo painel): só importa se
 * ela sumir. `indexable` falso: a página está fora do Google, então só a indexação importa.
 */
export function issuesFromChecks(path: string, checks: Check[], ctx: { indexable: boolean; technical: boolean }): Issue[] {
  const out: Issue[] = [];
  for (const c of checks) {
    if (c.ok || c.skipped) continue;
    const code = c.code ?? c.item;
    if (ctx.technical && code !== "status") continue;
    if (!ctx.indexable && c.item !== "indexacao") continue;
    out.push({ path, code, severity: severityOf(c, code), message: c.message });
  }
  return out;
}

const keyOf = (i: Issue) => `${i.path}\u0000${i.code}`;

/** O que abriu, o que foi resolvido e o que continua, comparando por página e código. */
export function diffIssues(open: Issue[], now: Issue[]): { opened: Issue[]; resolved: Issue[]; kept: Issue[] } {
  const before = new Set(open.map(keyOf));
  const after = new Set(now.map(keyOf));
  return {
    opened: now.filter((i) => !before.has(keyOf(i))),
    resolved: open.filter((i) => !after.has(keyOf(i))),
    kept: now.filter((i) => before.has(keyOf(i))),
  };
}

/** Avisos da execução (só dentro do painel): queda grande da nota e problemas críticos novos. scoreDrop > 0 é queda. */
export function alertsFor(opened: Issue[], scoreDrop: number): string[] {
  const out: string[] = [];
  if (scoreDrop > 5) out.push(`A nota do site caiu ${scoreDrop} pontos`);
  const critical = opened.filter((i) => i.severity === "critico");
  for (const i of critical.slice(0, 5)) out.push(`Problema crítico novo em ${i.path}: ${i.message}`);
  if (critical.length > 5) out.push(`E mais ${critical.length - 5} problemas críticos novos`);
  return out;
}
