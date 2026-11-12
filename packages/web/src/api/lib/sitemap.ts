import content from "../../web/data/content.json";
import { DEFAULT_CASES } from "../../web/lib/cases";
import { segmentLps } from "../../web/lib/segmentos-lp";
import { WA } from "../../web/lib/landing-links";
import { toWebp } from "../../web/lib/images";
import landing from "../../web/data/landing.json";
import { seoKey } from "../../web/lib/seo-pages";
import { seoDocsFrom, type PageOverrides } from "../../web/lib/seo-overrides";

const ORIGIN = "https://www.demakine.com.br";

/** Idiomas com endereço próprio (português na raiz). Mesma regra de web/lib/i18n.ts. */
const LANGS = [
  { hreflang: "pt-BR", prefix: "" },
  { hreflang: "en", prefix: "/en" },
  { hreflang: "es", prefix: "/es" },
];
/** só em português: vagas e as 10 páginas de categoria e comerciais */
const LANDING_SLUGS = Object.keys(WA);
const PT_ONLY = new RegExp(`^\\/(vagas|${LANDING_SLUGS.join("|")})(\\/|$|\\?)`);
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
/** Posts que mudaram depois da data de publicação (valem no lugar dela). */
export const POST_LASTMOD: Record<string, string> = {
  "demakine-na-agrishow-2024": "2026-11-10", // recebeu o balanço e as fotos do post duplicado
  "demakine-na-5a-edicao-da-batatec": "2026-11-10",
};

const newest = (a?: string, b?: string) => (a && b ? (a > b ? a : b) : (a ?? b));
/** Exportação: uma página por idioma, cada uma com o seu endereço e apontando para a outra (hreflang). */
const EXPORT_PAGES = [
  { hreflang: "es", path: "/es/exportacion" },
  { hreflang: "en", path: "/en/export" },
];
const EXPORT_LASTMOD = "2026-11-10";
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
];

type Doc = { collection: string; key: string; data: unknown; deleted: boolean; updatedAt: Date };
type Entry = { path: string; lastmod?: string; priority: string; /** fotos da página, para o sitemap de imagens do Google */ images?: string[] };
/** Entrada já expandida por idioma, com as versões que ela declara (hreflang) e que o sitemap lista junto. */
export type SitemapEntry = Entry & { alternates: { hreflang: string; path: string }[] };

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

/** Sitemap de imagens: as fotos que a página mostra, uma vez cada, com endereço completo. */
const imageTags = (images: string[] = []) =>
  [...new Set(images.filter(Boolean).map((src) => toWebp(src)))]
    .map((src) => `<image:image><image:loc>${esc(src.startsWith("http") ? src : ORIGIN + src)}</image:loc></image:image>`)
    .join("");

/** Fotos de cada categoria e página comercial: a do topo e a primeira de cada produto listado. */
const landingImages = new Map(
  (landing as { slug: string; heroImage?: string; items: string[] }[]).map((l) => [`/${l.slug}`, { hero: l.heroImage, items: l.items }]),
);

/** Fotos do produto: as da lista editada no painel (se houver) ou as do código. */
function productImages(slug: string, docs: Doc[]): string[] {
  const edited = docs.find((d) => d.collection === "produto" && d.key === slug)?.data as { images?: string[] } | undefined;
  const base = (content as { products: { slug: string; images: string[] }[] }).products.find((p) => p.slug === slug)?.images ?? [];
  return edited?.images ?? base;
}

/** Foto do case: a editada no painel ou a do código. */
function caseImage(slug: string, docs: Doc[]): string {
  const edited = docs.find((d) => d.collection === "case" && d.key === slug)?.data as { image?: string } | undefined;
  return edited?.image ?? DEFAULT_CASES.find((x) => x.slug === slug)?.image ?? "";
}

/** Todas as páginas do sitemap, uma entrada por endereço (versões de idioma expandidas), antes de qualquer ocultação. */
export function buildAllEntries(docs: Doc[], openJobs: { slug: string; updatedAt: Date }[]): SitemapEntry[] {
  const c = content as { products: { slug: string }[]; posts: { slug: string; date: string }[] };
  const postDate = new Map(c.posts.map((p) => [p.slug, p.date]));
  const entries: Entry[] = [
    ...STATIC_PAGES.map((path) => {
      const l = landingImages.get(path);
      const photos = l && [l.hero ?? "", ...l.items.map((slug) => productImages(slug, docs)[0] ?? "")];
      return { path, lastmod: PAGE_LASTMOD[path], priority: path === "/" ? "1.0" : "0.6", ...(photos ? { images: photos } : {}) };
    }),
    ...merged(docs, "produto", c.products.map((p) => p.slug), (d) => Boolean(d.name && d.category)).map((p) => ({
      path: `/produtos/${p.key}`,
      lastmod: newest(day(p.updatedAt), PRODUCTS_LASTMOD),
      priority: "0.8",
      images: productImages(p.key, docs),
    })),
    ...merged(docs, "post", c.posts.map((p) => p.slug), (d) => Boolean(d.title && d.date)).map((p) => {
      const edited = docs.find((d) => d.collection === "post" && d.key === p.key)?.data as { date?: string } | undefined;
      return { path: `/blog/${p.key}`, lastmod: newest(day(p.updatedAt) ?? edited?.date ?? postDate.get(p.key), POST_LASTMOD[p.key]), priority: "0.6" };
    }),
    ...merged(docs, "case", DEFAULT_CASES.map((x) => x.slug), (d) => Boolean(d.title && d.segment)).map((p) => ({
      path: `/cases/${p.key}`,
      lastmod: day(p.updatedAt),
      priority: "0.5",
      images: [caseImage(p.key, docs)],
    })),
    ...openJobs.map((j) => ({ path: `/vagas/${j.slug}`, lastmod: day(j.updatedAt), priority: "0.5" })),
  ];
  return entries
    .flatMap((e): SitemapEntry[] => {
      if (PT_ONLY.test(e.path)) return [{ ...e, alternates: [] }];
      // uma linha por idioma, cada uma listando as três versões (hreflang no sitemap)
      const alternates = [...LANGS.map((l) => ({ hreflang: l.hreflang, path: inLang(e.path, l.prefix) })), { hreflang: "x-default", path: e.path }];
      return LANGS.map((l) => ({ ...e, path: inLang(e.path, l.prefix), alternates }));
    })
    .concat(
      EXPORT_PAGES.map((e) => ({
        path: e.path,
        lastmod: EXPORT_LASTMOD,
        priority: "0.6",
        alternates: [...EXPORT_PAGES.map((x) => ({ hreflang: x.hreflang, path: x.path })), { hreflang: "x-default", path: "/en/export" }],
      })),
    );
}

/** A página está escondida do sitemap pelas regras do painel (noindex ou "fora do sitemap")? */
const hiddenFromSitemap = (path: string, seoDocs: Record<string, PageOverrides>) => {
  const o = seoDocs[seoKey(path)];
  return o?.noindex === true || o?.noSitemap === true;
};

/**
 * O que vai para o sitemap: tudo de buildAllEntries menos as páginas que as regras do painel escondem. As versões
 * que sobram deixam de apontar (hreflang) para a que saiu.
 */
export function buildEntries(docs: Doc[], openJobs: { slug: string; updatedAt: Date }[], seoDocs: Record<string, PageOverrides> = seoDocsFrom(docs)): SitemapEntry[] {
  return buildAllEntries(docs, openJobs)
    .filter((e) => !hiddenFromSitemap(e.path, seoDocs))
    .map((e) => ({ ...e, alternates: e.alternates.filter((a) => !hiddenFromSitemap(a.path, seoDocs)) }));
}

export function buildSitemap(docs: Doc[], openJobs: { slug: string; updatedAt: Date }[], seoDocs: Record<string, PageOverrides> = seoDocsFrom(docs)) {
  const row = (e: SitemapEntry) => {
    const links = e.alternates.map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${esc(ORIGIN + a.path)}"/>`).join("");
    return `  <url><loc>${esc(ORIGIN + e.path)}</loc>${links}${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<priority>${e.priority}</priority>${imageTags(e.images)}</url>`;
  };
  const urls = buildEntries(docs, openJobs, seoDocs).map(row).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}
