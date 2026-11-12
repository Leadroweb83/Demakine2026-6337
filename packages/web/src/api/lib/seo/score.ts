/**
 * Nota de SEO por página, por setor, por área e do site. Funções puras: recebem os fatos da página (html.ts),
 * o contexto (status, links recebidos, duplicidade...) e as regras editáveis (rules.ts).
 * Cada item da nota é parcial e linear: quanto mais perto do ideal, mais pontos.
 */
import { isInternal, normalizeInternal, type PageFacts } from "./html";
import { effectiveWeights, isPriorityPath, SEO_ITEMS, type SeoItem, type SeoRules } from "./rules";
import type { Lang, SiteArea } from "./types";

const ORIGIN = "https://www.demakine.com.br";

export type Sector =
  | "conteudo"
  | "imagens"
  | "links"
  | "schema"
  | "idiomas"
  | "indexacao"
  | "titulo-descricao"
  | "compartilhamento";

export const SECTORS: Sector[] = ["conteudo", "imagens", "links", "schema", "idiomas", "indexacao", "titulo-descricao", "compartilhamento"];

/** Item da nota -> setor. A velocidade não tem setor próprio até a Etapa 2. */
const SECTOR_OF: Partial<Record<SeoItem, Sector>> = {
  titulo: "titulo-descricao",
  descricao: "titulo-descricao",
  h1: "conteudo",
  conteudo: "conteudo",
  imagens: "imagens",
  links: "links",
  schema: "schema",
  idiomas: "idiomas",
  indexacao: "indexacao",
  compartilhamento: "compartilhamento",
};

export type PageContext = {
  path: string;
  area: SiteArea;
  lang: Lang;
  statusCode: number;
  /** quantas outras páginas do site linkam para esta */
  inlinks: number;
  isCommercial: boolean;
  duplicateTitle: boolean;
  duplicateDescription: boolean;
  /** tipos de dados estruturados que a página deveria ter (Product, FAQPage...) */
  expectedSchema: string[];
  /** idiomas que o hreflang deveria listar (pt-BR, en, es, x-default); vazio = página só em português */
  expectedHreflangs: string[];
  /** página técnica (obrigado, loja...): noindex é o esperado */
  technical?: boolean;
  /** nota de velocidade 0 a 100 (Etapa 2) */
  speedScore?: number;
};

export type Check = {
  item: SeoItem;
  points: number;
  max: number;
  ok: boolean;
  message: string;
  fix: string;
  /** não avaliado porque a página não respondeu */
  skipped?: boolean;
  /** código estável do problema: o próprio item ou, na indexação, status | noindex | canonical-ausente | canonical-outro */
  code?: string;
};

export type PageScore = { seo: number; checks: Check[]; sectors: Record<Sector, number> };

type Verdict = { ratio: number; message: string; fix: string; code?: string };
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const ok = (message: string): Verdict => ({ ratio: 1, message, fix: "" });

/** Título e descrição: dentro da faixa vale tudo; fora, perde proporcionalmente. */
function lengthRatio(len: number, min: number, max: number) {
  if (len >= min && len <= max) return 1;
  if (len < min) return clamp01(len / min);
  return clamp01(1 - (len - max) / max);
}

function titleVerdict(f: PageFacts, c: PageContext, r: SeoRules): Verdict {
  if (!f.title) {
    return { ratio: 0, message: "A página está sem título (title)", fix: `Escreva um título de ${r.title.min} a ${r.title.max} caracteres, com o assunto principal no começo.` };
  }
  const len = f.title.length;
  let ratio = lengthRatio(len, r.title.min, r.title.max);
  if (len > r.title.max) return { ratio: c.duplicateTitle ? ratio / 2 : ratio, message: `Título longo demais (${len} caracteres, o Google corta depois de ${r.title.max})`, fix: `Corte o título para até ${r.title.max} caracteres.` };
  if (len < r.title.min) return { ratio: c.duplicateTitle ? ratio / 2 : ratio, message: `Título curto demais (${len} caracteres)`, fix: `Use de ${r.title.min} a ${r.title.max} caracteres para dizer mais sobre a página.` };
  if (c.duplicateTitle) {
    ratio /= 2;
    return { ratio, message: "O título é igual ao de outra página", fix: "Dê um título único a cada página: o Google fica sem saber qual mostrar." };
  }
  return ok(`Título com ${len} caracteres`);
}

function descriptionVerdict(f: PageFacts, c: PageContext, r: SeoRules): Verdict {
  if (!f.description) {
    return { ratio: 0, message: "A página está sem descrição (meta description)", fix: `Escreva uma descrição de ${r.description.min} a ${r.description.max} caracteres que convença a pessoa a clicar.` };
  }
  const len = f.description.length;
  const ratio = lengthRatio(len, r.description.min, r.description.max);
  const half = (x: number) => (c.duplicateDescription ? x / 2 : x);
  if (len > r.description.max) return { ratio: half(ratio), message: `Descrição longa demais (${len} caracteres)`, fix: `Corte a descrição para até ${r.description.max} caracteres.` };
  if (len < r.description.min) return { ratio: half(ratio), message: `Descrição curta demais (${len} caracteres)`, fix: `Use de ${r.description.min} a ${r.description.max} caracteres.` };
  if (c.duplicateDescription) return { ratio: ratio / 2, message: "A descrição é igual à de outra página", fix: "Escreva uma descrição própria para esta página." };
  return ok(`Descrição com ${len} caracteres`);
}

function h1Verdict(f: PageFacts): Verdict {
  const filled = f.h1s.filter((h) => h.trim()).length;
  if (filled === 0) return { ratio: 0, message: "A página está sem H1 (título principal visível)", fix: "Coloque um único H1 com o assunto da página." };
  if (filled > 1) return { ratio: 0.5, message: `A página tem ${filled} H1`, fix: "Deixe só um H1 por página; os demais viram H2." };
  return ok("Um H1 na página");
}

function indexVerdict(f: PageFacts, c: PageContext): Verdict {
  if (c.statusCode < 200 || c.statusCode >= 400) {
    const what = c.statusCode === 0 ? "A página não respondeu" : `A página respondeu ${c.statusCode}`;
    return { ratio: 0, message: what, fix: "Corrija o endereço, republique a página ou crie um redirecionamento 301 para a página certa.", code: "status" };
  }
  if (/noindex/i.test(f.robots ?? "")) {
    return c.technical
      ? ok("Página técnica, fora do Google de propósito")
      : { ratio: 0, message: "A página pede para ficar fora do Google (noindex)", fix: 'Se ela deve aparecer, ligue "Aparecer no Google" na edição da página.', code: "noindex" };
  }
  if (!f.canonical) return { ratio: 0.8, message: "A página não informa o endereço canônico", fix: "Acrescente o canonical apontando para o endereço da própria página.", code: "canonical-ausente" };
  const own = normalizeInternal(c.path, ORIGIN);
  if (!isInternal(f.canonical, ORIGIN + c.path) || normalizeInternal(f.canonical, ORIGIN + c.path) !== own) {
    return { ratio: 0.5, message: "O canonical aponta para outra página", fix: "Confira o canonical: ele diz ao Google que a página principal é outra.", code: "canonical-outro" };
  }
  return ok("Pode ser indexada e o canonical é o endereço dela");
}

function languagesVerdict(f: PageFacts, c: PageContext): Verdict {
  const hasLang = Boolean(f.htmlLang);
  if (c.expectedHreflangs.length === 0) {
    return hasLang ? ok("Página só em português, com idioma declarado") : { ratio: 0.8, message: "O HTML não declara o idioma (lang)", fix: 'Coloque lang="pt-BR" na tag html.' };
  }
  const found = new Set(f.hreflangs.map((h) => h.lang.toLowerCase()));
  const missing = c.expectedHreflangs.filter((l) => !found.has(l.toLowerCase()));
  const cover = 1 - missing.length / c.expectedHreflangs.length;
  const ratio = 0.8 * cover + 0.2 * (hasLang ? 1 : 0);
  if (ratio >= 0.999) return ok("Todas as versões de idioma estão ligadas entre si");
  const what = missing.length ? `Faltam links de idioma (hreflang): ${missing.join(", ")}` : "O HTML não declara o idioma (lang)";
  return { ratio, message: what, fix: "Ligue as versões em português, inglês e espanhol com hreflang e declare o idioma na tag html." };
}

function contentVerdict(f: PageFacts, c: PageContext, r: SeoRules): Verdict {
  const need = c.isCommercial ? r.commercialMinWords : 50;
  const ratio = need === 0 ? 1 : clamp01(f.words / need);
  if (ratio >= 1) return ok(`${f.words} palavras de conteúdo`);
  return {
    ratio,
    message: c.isCommercial ? `Pouco texto para uma página comercial (${f.words} de ${need} palavras)` : `Quase sem texto (${f.words} palavras)`,
    fix: c.isCommercial ? "Explique o produto, para quem serve, prazos e dúvidas comuns: o Google e as IAs precisam de texto para entender a página." : "Acrescente um texto que explique a página.",
  };
}

function imagesVerdict(f: PageFacts): Verdict {
  const relevant = f.images.filter((i) => !i.src.startsWith("data:"));
  if (relevant.length === 0) return ok("Sem imagens para descrever");
  const good = relevant.filter((i) => (i.alt ?? "").trim() !== "").length;
  if (good === relevant.length) return ok(`Todas as ${good} imagens têm descrição (alt)`);
  return {
    ratio: good / relevant.length,
    message: `${relevant.length - good} de ${relevant.length} imagens sem descrição (alt)`,
    fix: "Descreva cada foto em uma frase curta, com o que ela mostra. Dá para escrever no painel de imagens.",
  };
}

function linksVerdict(f: PageFacts, c: PageContext, r: SeoRules): Verdict {
  const part = (n: number, min: number) => (min === 0 ? 1 : clamp01(n / min));
  const out = f.internalLinks.length;
  const ratio = 0.5 * part(c.inlinks, r.minInlinks) + 0.5 * part(out, r.minOutlinks);
  if (ratio >= 0.999) return ok(`${c.inlinks} links recebidos e ${out} enviados`);
  return {
    ratio,
    message: `Poucos links internos (recebe ${c.inlinks}, envia ${out}; o mínimo é ${r.minInlinks} e ${r.minOutlinks})`,
    fix: "Linke esta página a partir de textos de outras páginas do assunto e mostre links para páginas relacionadas.",
  };
}

function schemaVerdict(f: PageFacts, c: PageContext): Verdict {
  if (c.expectedSchema.length === 0) return ok("Nenhum dado estruturado esperado");
  const have = new Set(f.jsonLdTypes);
  const missing = c.expectedSchema.filter((t) => !have.has(t));
  if (missing.length === 0) return ok(`Dados estruturados presentes: ${c.expectedSchema.join(", ")}`);
  return {
    ratio: 1 - missing.length / c.expectedSchema.length,
    message: `Faltam dados estruturados: ${missing.join(", ")}`,
    fix: "Acrescente o JSON-LD do tipo que falta para o Google mostrar a página com destaque nos resultados.",
  };
}

function shareVerdict(f: PageFacts): Verdict {
  const missing = (["title", "description", "image"] as const).filter((k) => !f.og[k]);
  if (missing.length === 0) return ok("Pré-visualização de compartilhamento completa");
  return {
    ratio: 1 - missing.length / 3,
    message: `Compartilhamento incompleto (faltam og:${missing.join(", og:")})`,
    fix: "Preencha título, descrição e imagem de compartilhamento: é o cartão que aparece no WhatsApp e nas redes.",
  };
}

function speedVerdict(c: PageContext): Verdict & { skipped?: boolean } {
  if (c.speedScore === undefined) return { ratio: 0, message: "Velocidade ainda não medida", fix: "", skipped: true };
  const ratio = clamp01(c.speedScore / 100);
  return ratio >= 0.9 ? ok(`Velocidade ${Math.round(c.speedScore)}`) : { ratio, message: `Velocidade ${Math.round(c.speedScore)} (o ideal é 90 ou mais)`, fix: "Reduza o peso de imagens e de scripts da página." };
}

export function scorePage(facts: PageFacts, ctx: PageContext, rules: SeoRules, speedMeasured: boolean): PageScore {
  const weights = effectiveWeights(rules, speedMeasured);
  const failed = ctx.statusCode < 200 || ctx.statusCode >= 400;
  const verdicts: Record<SeoItem, () => Verdict & { skipped?: boolean }> = {
    titulo: () => titleVerdict(facts, ctx, rules),
    descricao: () => descriptionVerdict(facts, ctx, rules),
    h1: () => h1Verdict(facts),
    indexacao: () => indexVerdict(facts, ctx),
    idiomas: () => languagesVerdict(facts, ctx),
    conteudo: () => contentVerdict(facts, ctx, rules),
    imagens: () => imagesVerdict(facts),
    links: () => linksVerdict(facts, ctx, rules),
    schema: () => schemaVerdict(facts, ctx),
    compartilhamento: () => shareVerdict(facts),
    velocidade: () => speedVerdict(ctx),
  };

  const checks: Check[] = [];
  for (const item of SEO_ITEMS) {
    const max = weights[item];
    if (max <= 0) continue; // peso 0: a pessoa tirou o item da nota
    if (failed && item !== "indexacao") {
      checks.push({ item, points: 0, max, ok: false, skipped: true, message: "Não avaliado: a página não respondeu", fix: "", code: item });
      continue;
    }
    const v = verdicts[item]();
    const points = max * clamp01(v.ratio);
    checks.push({ item, points, max, ok: v.ratio >= 0.999, message: v.message, fix: v.fix, code: v.code ?? item, ...(v.skipped ? { skipped: true } : {}) });
  }

  const sectors = Object.fromEntries(SECTORS.map((s) => [s, 0])) as Record<Sector, number>;
  for (const s of SECTORS) {
    const mine = checks.filter((c) => SECTOR_OF[c.item] === s);
    const max = mine.reduce((a, c) => a + c.max, 0);
    sectors[s] = max > 0 ? Math.round((mine.reduce((a, c) => a + c.points, 0) / max) * 100) : 0;
  }
  const seo = Math.round(checks.reduce((a, c) => a + c.points, 0));
  return { seo: Math.max(0, Math.min(100, seo)), checks, sectors };
}

export type SitePageScore = { path: string; area: SiteArea; lang: Lang; score: PageScore; indexable: boolean; hiddenByPanel: boolean };

const LANG_PREFIX = /^\/(en|es)(?=\/|$)/;

/** Peso da página na média do site: prioritária 3x, versão em inglês ou espanhol 0,25x. */
function pageWeight(p: SitePageScore, rules: SeoRules) {
  const ptPath = p.path.replace(LANG_PREFIX, "") || "/";
  return (isPriorityPath(ptPath, rules) ? 3 : 1) * (p.lang === "pt" ? 1 : 0.25);
}

function weightedAvg(rows: { weight: number; value: number }[]) {
  const total = rows.reduce((a, r) => a + r.weight, 0);
  return total === 0 ? 0 : rows.reduce((a, r) => a + r.weight * r.value, 0) / total;
}

export function scoreSite(
  pages: SitePageScore[],
  rules: SeoRules,
  siteChecks: { sitemapValid: boolean; robotsBlocksSite: boolean; brokenInternalLinks: number },
): { site: number; byArea: Partial<Record<SiteArea, number>>; bySector: Record<Sector, number> } {
  const counted = pages.filter((p) => !p.hiddenByPanel);
  const weighted = counted.map((p) => ({ p, weight: pageWeight(p, rules) }));

  let site = weightedAvg(weighted.map(({ p, weight }) => ({ weight, value: p.score.seo })));
  if (weighted.length > 0) {
    site -= Math.min(10, siteChecks.brokenInternalLinks); // 1 ponto por link quebrado, no máximo 10
    if (!siteChecks.sitemapValid) site -= 5;
    if (siteChecks.robotsBlocksSite) site -= 50;
  }

  const byArea: Partial<Record<SiteArea, number>> = {};
  for (const area of new Set(counted.map((p) => p.area))) {
    byArea[area] = Math.round(weightedAvg(weighted.filter(({ p }) => p.area === area).map(({ p, weight }) => ({ weight, value: p.score.seo }))));
  }

  const bySector = Object.fromEntries(
    SECTORS.map((s) => [s, Math.round(weightedAvg(weighted.map(({ p, weight }) => ({ weight, value: p.score.sectors[s] }))))]),
  ) as Record<Sector, number>;

  return { site: Math.max(0, Math.min(100, Math.round(site))), byArea, bySector };
}
