/**
 * Métricas comparáveis do duelo (puras): as mesmas contas para a Demakine e para o concorrente, só com o que dá para
 * medir de fora. Nota de 0 a 100 por item (média das páginas lidas); "tamanho" e "blog" são contagens.
 */
import type { PageFacts } from "./html";
import { DEFAULT_RULES } from "./rules";

export type MetricId = "titulo" | "descricao" | "h1" | "conteudo" | "imagens" | "schema" | "idiomas" | "compartilhamento" | "tamanho" | "blog";
export const METRICS: MetricId[] = ["titulo", "descricao", "h1", "conteudo", "imagens", "schema", "idiomas", "compartilhamento", "tamanho", "blog"];
export const METRIC_LABELS: Record<MetricId, string> = {
  titulo: "Títulos",
  descricao: "Descrições",
  h1: "Título principal (H1)",
  conteudo: "Quantidade de texto",
  imagens: "Imagens com descrição",
  schema: "Dados estruturados",
  idiomas: "Idiomas",
  compartilhamento: "Compartilhamento",
  tamanho: "Tamanho do site",
  blog: "Blog nos últimos 90 dias",
};

export type SiteMetrics = { pages: number; samples: number; scores: Partial<Record<MetricId, number>> };

const clamp = (n: number) => Math.max(0, Math.min(100, n));
function lengthScore(text: string | null, min: number, max: number): number {
  if (!text) return 0;
  const n = text.length;
  return n >= min && n <= max ? 100 : n < min ? clamp((n / min) * 100) : clamp((1 - (n - max) / max) * 100);
}

function pageScores(f: PageFacts): Partial<Record<MetricId, number>> {
  const filled = f.h1s.filter((h) => h.trim()).length;
  const imgs = f.images.filter((i) => !i.src.startsWith("data:"));
  return {
    titulo: lengthScore(f.title, DEFAULT_RULES.title.min, DEFAULT_RULES.title.max),
    descricao: lengthScore(f.description, DEFAULT_RULES.description.min, DEFAULT_RULES.description.max),
    h1: filled === 1 ? 100 : filled === 0 ? 0 : 50,
    conteudo: clamp((f.words / 300) * 100),
    ...(imgs.length ? { imagens: (imgs.filter((i) => (i.alt ?? "").trim()).length / imgs.length) * 100 } : {}),
    schema: clamp((f.jsonLdTypes.length / 3) * 100),
    idiomas: clamp((new Set(f.hreflangs.map((h) => h.lang.toLowerCase())).size / 3) * 100),
    compartilhamento: ([f.og.title, f.og.description, f.og.image].filter(Boolean).length / 3) * 100,
  };
}

/** `skip`: métricas que não se aplicam àquela página (ex.: idiomas numa página só em português de propósito). */
export function siteMetrics(pages: { path: string; facts: PageFacts; skip?: MetricId[] }[], sitemap: { total: number; blogLastmods: string[] }, today: string): SiteMetrics {
  const sums = new Map<MetricId, { sum: number; n: number }>();
  for (const p of pages) {
    for (const [k, v] of Object.entries(pageScores(p.facts)) as [MetricId, number][]) {
      if (p.skip?.includes(k)) continue;
      const cur = sums.get(k) ?? { sum: 0, n: 0 };
      sums.set(k, { sum: cur.sum + v, n: cur.n + 1 });
    }
  }
  const scores: Partial<Record<MetricId, number>> = {};
  for (const [k, { sum, n }] of sums) scores[k] = Math.round(sum / n);
  if (pages.length > 0) {
    if (sitemap.total > 0) scores.tamanho = sitemap.total;
    if (sitemap.total > 0) {
      const limit = new Date(`${today}T00:00:00Z`).getTime() - 90 * 86_400_000;
      scores.blog = sitemap.blogLastmods.filter((d) => new Date(`${d.slice(0, 10)}T00:00:00Z`).getTime() >= limit).length;
    }
  }
  return { pages: pages.length, samples: pages.length, scores };
}

export type Verdict = { metric: MetricId; ours: number; theirs: number; diff: number; result: "melhor" | "pior" | "empate"; unit: "pontos" | "paginas" | "posts" };

export function compare(ours: SiteMetrics, theirs: SiteMetrics): Verdict[] {
  if (ours.samples === 0 || theirs.samples === 0) return [];
  const out: Verdict[] = [];
  for (const metric of METRICS) {
    const a = ours.scores[metric];
    const b = theirs.scores[metric];
    if (a === undefined || b === undefined) continue;
    const count = metric === "tamanho" || metric === "blog";
    const diff = a - b;
    const tie = count ? Math.abs(diff) <= Math.max(a, b) * 0.1 : Math.abs(diff) <= 3;
    out.push({ metric, ours: a, theirs: b, diff, result: tie ? "empate" : diff > 0 ? "melhor" : "pior", unit: !count ? "pontos" : metric === "tamanho" ? "paginas" : "posts" });
  }
  return out;
}

export function scoreboard(v: Verdict[]): { better: number; worse: number; tie: number } {
  return { better: v.filter((x) => x.result === "melhor").length, worse: v.filter((x) => x.result === "pior").length, tie: v.filter((x) => x.result === "empate").length };
}
