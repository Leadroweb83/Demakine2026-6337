/** "O que fazer para ganhar": transforma as derrotas do duelo em ações, das maiores diferenças para as menores. */
import { METRIC_LABELS, type MetricId, type Verdict } from "./duel-metrics";
import type { Check } from "./score";

export type DuelAction = { metric: MetricId; competitor: string; gap: number; effort: "baixo" | "medio" | "alto"; title: string; how: string; pages: { path: string; label: string }[] };

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
  tamanho: (r) => `${r} tem mais páginas indexáveis. Planeje novas páginas de segmento, aplicação e dúvidas, com a ajuda do mapa de conteúdo.`,
  blog: (r) => `${r} publica mais no blog. Combine um ritmo fixo de posts úteis, com um produto linkado em cada um.`,
};

const CHECK_OF: Partial<Record<MetricId, Check["item"]>> = { titulo: "titulo", descricao: "descricao", h1: "h1", conteudo: "conteudo", imagens: "imagens", schema: "schema", idiomas: "idiomas", compartilhamento: "compartilhamento" };

export function actionsFor(verdicts: Record<string, Verdict[]>, ourPages: { path: string; label: string; checks: Check[] }[]): DuelAction[] {
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
    const item = CHECK_OF[metric];
    const pages = item
      ? ourPages
          .map((p) => ({ p, c: p.checks.find((c) => c.item === item) }))
          .filter((x) => x.c && !x.c.ok && !x.c.skipped)
          .sort((a, b) => a.c!.points / (a.c!.max || 1) - b.c!.points / (b.c!.max || 1))
          .slice(0, 5)
          .map((x) => ({ path: x.p.path, label: x.p.label }))
      : [];
    out.push({ metric, competitor, gap, effort: EFFORT[metric], title: `Passar ${competitor} em ${METRIC_LABELS[metric].toLowerCase()}`, how: HOW[metric](competitor), pages });
  }
  return out.sort((a, b) => b.gap - a.gap || RANK[a.effort] - RANK[b.effort]);
}
