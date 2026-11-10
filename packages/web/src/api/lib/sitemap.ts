import content from "../../web/data/content.json";
import { DEFAULT_CASES } from "../../web/lib/cases";
import { segmentLps } from "../../web/lib/segmentos-lp";
import { WA } from "../../web/lib/landing-links";

const ORIGIN = "https://www.demakine.com.br";

/** Idiomas com endereço próprio (português na raiz). Mesma regra de web/lib/i18n.ts. */
const LANGS = [
  { hreflang: "pt-BR", prefix: "" },
  { hreflang: "en", prefix: "/en" },
  { hreflang: "es", prefix: "/es" },
];
/** só em português: vagas, a página de exportação (que já é uma página em espanhol e inglês) e as 10 páginas de categoria e comerciais */
const LANDING_SLUGS = Object.keys(WA);
const PT_ONLY = new RegExp(`^\\/(vagas|export|${LANDING_SLUGS.join("|")})(\\/|$|\\?)`);
/**
 * Data da última edição de cada página. Só entra aqui página que mudou de verdade: lastmod inventado faz o Google
 * ignorar o campo. Mexeu numa página fixa ou no conteúdo dos produtos, atualize a data junto.
 * Produto editado no painel vale pela data do painel quando ela for mais recente.
 */
export const PAGE_LASTMOD: Record<string, string> = {
  "/": "2026-11-09", // H1 novo
  ...Object.fromEntries(LANDING_SLUGS.map((slug) => [`/${slug}`, "2026-11-10"])), // texto do Marketing publicado em 10/11
};
export const PRODUCTS_LASTMOD = "2026-11-09"; // titles e schema Product com offers

const newest = (a?: string, b?: string) => (a && b ? (a > b ? a : b) : (a ?? b));
const inLang = (path: string, prefix: string) => (!prefix ? path : path === "/" ? prefix : prefix + path);

/** Páginas fixas do site (as de produto, blog, case e vaga vêm do conteúdo). */
const STATIC_PAGES = [
  "/", "/produtos", "/projetos-especiais", "/a-empresa", "/clientes", "/assistencia-tecnica", "/blog",
  "/faq", "/downloads", "/ferramentas", "/agro", "/contato", "/vagas", "/cases",
  "/politica-de-privacidade", "/termos-de-uso",
  // categorias e páginas comerciais com URL própria (só português)
  ...LANDING_SLUGS.map((slug) => `/${slug}`),
  // páginas de segmento vêm da lista do site (segmento novo entra sozinho)
  ...segmentLps.map((s) => `/segmentos/${s.slug}`),
  "/export?lang=es", "/export?lang=en",
];

type Doc = { collection: string; key: string; data: unknown; deleted: boolean; updatedAt: Date };
type Entry = { path: string; lastmod?: string; priority: string };

/** Itens do código + edições do painel: tira oculto e rascunho, soma os novos que estão completos. */
function merged(docs: Doc[], collection: string, base: string[], isComplete: (d: Record<string, unknown>) => boolean) {
  const mine = docs.filter((d) => d.collection === collection);
  const byKey = new Map(mine.map((d) => [d.key, d]));
  const keys = new Set(base);
  for (const d of mine) if (isComplete(d.data as Record<string, unknown>)) keys.add(d.key);
  return [...keys]
    .filter((k) => {
      const d = byKey.get(k);
      return !d?.deleted && (d?.data as { draft?: boolean } | undefined)?.draft !== true;
    })
    .map((k) => ({ key: k, updatedAt: byKey.get(k)?.updatedAt }));
}

const day = (d?: Date | string) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
const esc = (s: string) => s.replace(/&/g, "&amp;");

export function buildSitemap(docs: Doc[], openJobs: { slug: string; updatedAt: Date }[]) {
  const c = content as { products: { slug: string }[]; posts: { slug: string; date: string }[] };
  const postDate = new Map(c.posts.map((p) => [p.slug, p.date]));
  const entries: Entry[] = [
    ...STATIC_PAGES.map((path) => ({ path, lastmod: PAGE_LASTMOD[path], priority: path === "/" ? "1.0" : "0.6" })),
    ...merged(docs, "produto", c.products.map((p) => p.slug), (d) => Boolean(d.name && d.category)).map((p) => ({
      path: `/produtos/${p.key}`,
      lastmod: newest(day(p.updatedAt), PRODUCTS_LASTMOD),
      priority: "0.8",
    })),
    ...merged(docs, "post", c.posts.map((p) => p.slug), (d) => Boolean(d.title && d.date)).map((p) => {
      const edited = docs.find((d) => d.collection === "post" && d.key === p.key)?.data as { date?: string } | undefined;
      return { path: `/blog/${p.key}`, lastmod: day(p.updatedAt) ?? edited?.date ?? postDate.get(p.key), priority: "0.6" };
    }),
    ...merged(docs, "case", DEFAULT_CASES.map((x) => x.slug), (d) => Boolean(d.title && d.segment)).map((p) => ({
      path: `/cases/${p.key}`,
      lastmod: day(p.updatedAt),
      priority: "0.5",
    })),
    ...openJobs.map((j) => ({ path: `/vagas/${j.slug}`, lastmod: day(j.updatedAt), priority: "0.5" })),
  ];
  const row = (e: Entry, loc: string, links = "") =>
    `  <url><loc>${esc(ORIGIN + loc)}</loc>${links}${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<priority>${e.priority}</priority></url>`;
  const urls = entries
    .flatMap((e) => {
      if (PT_ONLY.test(e.path)) return [row(e, e.path)];
      // uma linha por idioma, cada uma listando as três versões (hreflang no sitemap)
      const links = [...LANGS.map((l) => [l.hreflang, inLang(e.path, l.prefix)] as const), ["x-default", e.path] as const]
        .map(([lang, p]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${esc(ORIGIN + p)}"/>`)
        .join("");
      return LANGS.map((l) => row(e, inLang(e.path, l.prefix), links));
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}
