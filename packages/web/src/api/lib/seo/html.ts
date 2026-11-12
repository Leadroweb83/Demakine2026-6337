/**
 * Lê os fatos de SEO de um HTML (título, descrição, H1, imagens, links, dados estruturados...).
 * Funções puras com expressões regulares, no mesmo estilo dos testes do site. Nunca lançam: o que não existe
 * vira null, lista vazia ou 0, e o auditor segue em frente.
 */

export type PageFacts = {
  title: string | null;
  description: string | null;
  /** texto de cada H1; H1 vazio fica na lista como "" (o auditor trata como ausente) */
  h1s: string[];
  h2Count: number;
  canonical: string | null;
  robots: string | null;
  hreflangs: { lang: string; href: string }[];
  og: { title?: string; description?: string; image?: string };
  /** src já resolvido para endereço completo; alt null = atributo ausente, "" = vazio */
  images: { src: string; alt: string | null }[];
  /** caminhos internos de páginas (sem barra final, consulta ou #), sem repetir e sem a própria página */
  internalLinks: string[];
  jsonLdTypes: string[];
  /** entidades dos blocos JSON-LD válidos (com @graph já aberto) */
  jsonLd: unknown[];
  /** palavras do texto visível */
  words: number;
  htmlLang: string | null;
};

const ENTITIES: Record<string, string> = { quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", amp: "&" };

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n: string) => ENTITIES[n.toLowerCase()] ?? m);
}

function safeChar(code: number): string {
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

const squash = (s: string) => decode(s).replace(/\s+/g, " ").trim();
const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ");

/** Atributos de uma tag: nomes em minúsculas, valores decodificados, aspas duplas, simples ou nenhuma. */
function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  const inner = tag.replace(/^<\s*[a-zA-Z0-9]+/, "").replace(/\/?>$/, "");
  for (const m of inner.matchAll(re)) {
    const name = m[1].toLowerCase();
    if (!(name in out)) out[name] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

const tags = (html: string, name: string) => html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];

/** Fatos de uma página que não respondeu ou veio vazia. */
export const emptyFacts = (): PageFacts => ({
  title: null, description: null, h1s: [], h2Count: 0, canonical: null, robots: null, hreflangs: [], og: {},
  images: [], internalLinks: [], jsonLdTypes: [], jsonLd: [], words: 0, htmlLang: null,
});

/** Arquivos que não são páginas: não entram no grafo de links internos. */
const ASSET = /\.(pdf|jpe?g|png|webp|avif|gif|svg|ico|zip|rar|xml|txt|css|js|json|mp4|webm|docx?|xlsx?|pptx?)$/i;

function resolve(href: string, pageUrl: string): URL | null {
  try {
    return new URL(href.trim(), pageUrl);
  } catch {
    return null;
  }
}

function sameSite(host: string, pageHost: string) {
  const bare = (h: string) => h.toLowerCase().replace(/^www\./, "");
  return bare(host) === bare(pageHost);
}

/** O endereço é uma página do mesmo domínio? Ignora mailto:, tel:, #, javascript: e afins. */
export function isInternal(href: string, pageUrl: string): boolean {
  const h = href.trim();
  if (!h || h.startsWith("#")) return false;
  const u = resolve(h, pageUrl);
  const base = resolve(pageUrl, pageUrl);
  if (!u || !base) return false;
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  return sameSite(u.hostname, base.hostname);
}

/** Caminho da página: sem barra final (exceto a raiz), sem consulta e sem #. */
export function normalizeInternal(href: string, pageUrl: string): string {
  const u = resolve(href, pageUrl);
  if (!u) return "/";
  const p = u.pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

function typesOf(node: unknown): string[] {
  if (typeof node !== "object" || node === null) return [];
  const t = (node as { "@type"?: unknown })["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string");
  return [];
}

function readJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      continue; // JSON-LD quebrado: o item "dados estruturados" perde nota, a auditoria segue
    }
    for (const block of Array.isArray(parsed) ? parsed : [parsed]) {
      const graph = typeof block === "object" && block !== null ? (block as { "@graph"?: unknown })["@graph"] : undefined;
      if (Array.isArray(graph)) out.push(...graph);
      else out.push(block);
    }
  }
  return out;
}

export function extractFacts(html: string, pageUrl: string): PageFacts {
  try {
    return read(String(html ?? ""), pageUrl);
  } catch {
    return emptyFacts();
  }
}

function read(raw: string, pageUrl: string): PageFacts {
  const f = emptyFacts();
  const html = raw.replace(/<!--[\s\S]*?-->/g, " ");
  const text = (s: string | undefined) => (s && s.trim() ? s : null);

  f.title = text(squash(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? ""));
  f.htmlLang = text(attrs(tags(html, "html")[0] ?? "").lang?.trim());

  for (const t of tags(html, "meta")) {
    const a = attrs(t);
    const key = (a.name ?? a.property ?? "").toLowerCase();
    const content = a.content;
    if (content === undefined) continue;
    if (key === "description" && !f.description) f.description = text(squash(content));
    else if (key === "robots" && !f.robots) f.robots = text(content.trim());
    else if (key === "og:title") f.og.title = content;
    else if (key === "og:description") f.og.description = content;
    else if (key === "og:image") f.og.image = content;
  }

  for (const t of tags(html, "link")) {
    const a = attrs(t);
    const rel = (a.rel ?? "").toLowerCase();
    if (rel === "canonical" && a.href && !f.canonical) f.canonical = resolve(a.href, pageUrl)?.href ?? null;
    else if (rel === "alternate" && a.hreflang && a.href) f.hreflangs.push({ lang: a.hreflang, href: resolve(a.href, pageUrl)?.href ?? a.href });
  }

  for (const m of html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)) f.h1s.push(squash(stripTags(m[1])));
  f.h2Count = (html.match(/<h2\b/gi) ?? []).length;

  for (const t of tags(html, "img")) {
    const a = attrs(t);
    if (!a.src) continue;
    const src = a.src.startsWith("data:") ? a.src : (resolve(a.src, pageUrl)?.href ?? a.src);
    f.images.push({ src, alt: "alt" in a ? a.alt : null });
  }

  const self = normalizeInternal(pageUrl, pageUrl);
  const links = new Set<string>();
  const body = html.replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, " ");
  for (const t of tags(body, "a")) {
    const href = attrs(t).href;
    if (!href || !isInternal(href, pageUrl)) continue;
    const path = normalizeInternal(href, pageUrl);
    if (path !== self && !ASSET.test(path)) links.add(path);
  }
  f.internalLinks = [...links];

  f.jsonLd = readJsonLd(html);
  f.jsonLdTypes = [...new Set(f.jsonLd.flatMap(typesOf))];

  const visible = body.replace(/<head\b[\s\S]*?<\/head>/i, " ");
  const bodyOnly = /<body\b[^>]*>([\s\S]*)/i.exec(visible)?.[1] ?? visible;
  f.words = squash(stripTags(bodyOnly)).split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return f;
}
