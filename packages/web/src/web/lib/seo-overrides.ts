/**
 * Regras de SEO por página, guardadas na coleção "seo" (painel "SEO e GEO"). Leitura tolerante: valor de tipo
 * errado é ignorado, e o canonical só vale se for do próprio domínio. Sem dependência de navegador nem de banco,
 * para o site, o sitemap e o painel usarem a mesma leitura.
 */

export type PageOverrides = {
  title?: string;
  description?: string;
  canonical?: string;
  /** esconde a página do Google (meta robots noindex) */
  noindex?: boolean;
  /** tira a página do sitemap, sem esconder do Google */
  noSitemap?: boolean;
  ogImage?: string;
  /** "Resposta curta" visível no topo da página (GEO) */
  shortAnswer?: string;
  author?: string;
  /** AAAA-MM-DD */
  reviewedAt?: string;
};

const ORIGIN = "https://www.demakine.com.br";
const OWN_HOSTS = new Set(["www.demakine.com.br", "demakine.com.br"]);

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Endereço do próprio domínio (ou caminho "/x"), sempre devolvido com https e www. */
function ownUrl(v: string): string | undefined {
  if (v.startsWith("/") && !v.startsWith("//")) return ORIGIN + v;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" || !OWN_HOSTS.has(u.hostname)) return undefined;
    return ORIGIN + u.pathname + u.search;
  } catch {
    return undefined;
  }
}

export function readOverrides(doc: unknown): PageOverrides {
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) return {};
  const d = doc as Record<string, unknown>;
  const out: PageOverrides = {};
  const title = str(d.title);
  if (title) out.title = title;
  const description = str(d.description);
  if (description) out.description = description;
  const canonical = str(d.canonical);
  const own = canonical ? ownUrl(canonical) : undefined;
  if (own) out.canonical = own;
  if (typeof d.noindex === "boolean") out.noindex = d.noindex;
  if (typeof d.noSitemap === "boolean") out.noSitemap = d.noSitemap;
  const og = str(d.ogImage);
  if (og && ((og.startsWith("/") && !og.startsWith("//")) || og.startsWith("https://"))) out.ogImage = og;
  const shortAnswer = str(d.shortAnswer);
  if (shortAnswer) out.shortAnswer = shortAnswer;
  const author = str(d.author);
  if (author) out.author = author;
  const reviewedAt = str(d.reviewedAt);
  if (reviewedAt && /^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) out.reviewedAt = reviewedAt;
  return out;
}

/** Regras de todas as páginas, por chave do documento (ver seoKey), a partir dos documentos do painel. */
export function seoDocsFrom(docs: { collection: string; key: string; data: unknown; deleted: boolean }[]): Record<string, PageOverrides> {
  const out: Record<string, PageOverrides> = {};
  for (const d of docs) if (d.collection === "seo" && !d.deleted) out[d.key] = readOverrides(d.data);
  return out;
}

/**
 * Junta o padrão da página com a regra do painel. O painel só pode ACRESCENTAR noindex (nunca tirar de uma página
 * técnica, que já nasce noindex); canonical e imagem de compartilhamento manuais substituem o padrão.
 */
export function applyOverrides<T extends { noindex: boolean; canonical: string; ogImage?: string }>(base: T, o: PageOverrides): T {
  return {
    ...base,
    noindex: base.noindex || o.noindex === true,
    canonical: o.canonical ?? base.canonical,
    ...(o.ogImage !== undefined || base.ogImage !== undefined ? { ogImage: o.ogImage ?? base.ogImage } : {}),
  };
}

/** Erro de validação das regras de uma página; a mensagem já vem em português para mostrar na tela. */
export class SeoDocError extends Error {}

const LIMITS = { title: 120, description: 320, shortAnswer: 600, author: 80 } as const;
const LIMIT_TEXT: Record<keyof typeof LIMITS, string> = {
  title: "O título pode ter até 120 caracteres",
  description: "A descrição pode ter até 320 caracteres",
  shortAnswer: "A resposta curta pode ter até 600 caracteres",
  author: "O nome do autor pode ter até 80 caracteres",
};

/**
 * Documento que vai para o banco (coleção "seo"): tira o que está vazio, valida tamanhos e endereços e recusa o que
 * não for do próprio site. noindex e noSitemap só são guardados quando ligados (ausente = padrão). Lança SeoDocError.
 */
export function toSeoDoc(o: PageOverrides | Record<string, unknown>): Record<string, unknown> {
  const raw = o as Record<string, unknown>;
  const text = (key: string): string | undefined => {
    const v = raw[key];
    if (v === undefined || v === null) return undefined;
    if (typeof v !== "string") throw new SeoDocError(`Campo inválido: ${key}`);
    return v.trim() || undefined;
  };
  const flag = (key: string): boolean => {
    const v = raw[key];
    if (v === undefined || v === null) return false;
    if (typeof v !== "boolean") throw new SeoDocError(`Campo inválido: ${key}`);
    return v;
  };
  const out: Record<string, unknown> = {};
  for (const key of ["title", "description", "shortAnswer", "author"] as const) {
    const v = text(key);
    if (v === undefined) continue;
    if (v.length > LIMITS[key]) throw new SeoDocError(LIMIT_TEXT[key]);
    out[key] = v;
  }
  const canonical = text("canonical");
  if (canonical !== undefined) {
    const own = ownUrl(canonical);
    if (!own) throw new SeoDocError("O endereço canônico precisa ser do próprio site");
    out.canonical = own;
  }
  const og = text("ogImage");
  if (og !== undefined) {
    if (!((og.startsWith("/") && !og.startsWith("//")) || og.startsWith("https://"))) {
      throw new SeoDocError("A imagem de compartilhamento precisa ser um caminho do site (/img/...) ou um endereço https");
    }
    out.ogImage = og;
  }
  const reviewedAt = text("reviewedAt");
  if (reviewedAt !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) throw new SeoDocError("A data de revisão precisa estar no formato AAAA-MM-DD");
    out.reviewedAt = reviewedAt;
  }
  if (flag("noindex")) out.noindex = true;
  if (flag("noSitemap")) out.noSitemap = true;
  return out;
}
