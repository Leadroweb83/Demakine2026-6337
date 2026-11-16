/** "O que fazer para ganhar": transforma as derrotas do duelo em ações, das maiores diferenças para as menores. */
import { METRIC_LABELS, SCHEMA_TYPES_TARGET, type MetricId, type Verdict } from "./duel-metrics";
import type { Check } from "./score";

export type DuelAction = { metric: MetricId; competitor: string; gap: number; effort: "baixo" | "medio" | "alto"; title: string; how: string; pages: { path: string; label: string }[] };
/** Página da Demakine no duelo. `schemaTypes`: quantos tipos distintos de JSON-LD ela já emite (quando o duelo guarda isso). */
export type OurPage = { path: string; label: string; checks: Check[]; schemaTypes?: number };
const MAX_PAGES = 5;

const EFFORT: Record<MetricId, DuelAction["effort"]> = {
  titulo: "baixo", descricao: "baixo", h1: "baixo", imagens: "baixo", compartilhamento: "baixo",
  conteudo: "medio", schema: "medio", idiomas: "medio", tamanho: "alto", blog: "alto",
};
const RANK = { baixo: 0, medio: 1, alto: 2 };

const HOW: Record<MetricId, (rival: string) => string> = {
  titulo: (r) => `Os títulos de ${r} estão mais bem escritos. Deixe cada título com 30 a 60 caracteres e o assunto principal no começo.`,
  descricao: (r) => `As descrições de ${r} aproveitam melhor o espaço. Escreva de 70 a 155 caracteres e diga o que a pessoa ganha ao clicar.`,
  h1: (r) => `${r} acerta mais o título principal das páginas. Deixe um único H1 por página, com o assunto dela.`,
  conteudo: (r) => `As páginas de ${r} têm mais texto. Explique o produto, para quem serve, prazos e dúvidas comuns, buscando 300 palavras ou mais.`,
  imagens: (r) => `${r} descreve mais fotos que a Demakine. Escreva o alt de cada foto, começando pelas páginas da lista.`,
  schema: (r) => `${r} usa mais tipos de dados estruturados. Confira a aba Dados estruturados e complete o que falta (Product, FAQ, trilha).`,
  idiomas: (r) => `${r} liga mais versões de idioma. Complete o hreflang e traduza título e descrição das páginas.`,
  compartilhamento: (r) => `${r} cuida melhor da prévia do link no WhatsApp. Preencha título, descrição e imagem de compartilhamento.`,
  tamanho: (r) => `${r} tem mais páginas indexáveis. Planeje novas páginas de segmento, aplicação e dúvidas que tenham busca real, sem repetir assunto que o site já cobre.`,
  blog: (r) => `${r} publica mais no blog. Combine um ritmo fixo de posts úteis, com um produto linkado em cada um.`,
};

const CHECK_OF: Partial<Record<MetricId, Check["item"]>> = { titulo: "titulo", descricao: "descricao", h1: "h1", conteudo: "conteudo", imagens: "imagens", schema: "schema", idiomas: "idiomas", compartilhamento: "compartilhamento" };

/** Páginas que a ação deve apontar: as piores no item da auditoria; em dados estruturados, as com menos de 3 tipos (a nota do duelo conta tipos, não o que a auditoria espera). */
function targetPages(metric: MetricId, ourPages: OurPage[]): { path: string; label: string }[] {
  if (metric === "schema" && ourPages.some((p) => p.schemaTypes !== undefined)) {
    return ourPages
      .filter((p) => (p.schemaTypes ?? SCHEMA_TYPES_TARGET) < SCHEMA_TYPES_TARGET)
      .sort((a, b) => (a.schemaTypes ?? 0) - (b.schemaTypes ?? 0))
      .slice(0, MAX_PAGES)
      .map((p) => ({ path: p.path, label: p.label }));
  }
  const item = CHECK_OF[metric];
  if (!item) return [];
  return ourPages
    .map((p) => ({ p, c: p.checks.find((c) => c.item === item) }))
    .filter((x) => x.c && !x.c.ok && !x.c.skipped)
    .sort((a, b) => a.c!.points / (a.c!.max || 1) - b.c!.points / (b.c!.max || 1))
    .slice(0, MAX_PAGES)
    .map((x) => ({ path: x.p.path, label: x.p.label }));
}

export function actionsFor(verdicts: Record<string, Verdict[]>, ourPages: OurPage[]): DuelAction[] {
  const best = new Map<MetricId, { competitor: string; gap: number }>();
  for (const [competitor, list] of Object.entries(verdicts)) {
    for (const x of list) {
      if (x.result !== "pior") continue;
      const gap = x.unit === "pontos" ? Math.abs(x.diff) : Math.round((Math.abs(x.diff) / Math.max(x.ours, x.theirs)) * 100);
      if (!best.has(x.metric) || gap > best.get(x.metric)!.gap) best.set(x.metric, { competitor, gap });
    }
  }
  const out: DuelAction[] = [];
  for (const [metric, { competitor, gap }] of best) {
    out.push({ metric, competitor, gap, effort: EFFORT[metric], title: `Passar ${competitor} em ${METRIC_LABELS[metric].toLowerCase()}`, how: HOW[metric](competitor), pages: targetPages(metric, ourPages) });
  }
  return out.sort((a, b) => b.gap - a.gap || RANK[a.effort] - RANK[b.effort]);
}
