/**
 * Lista de TODAS as páginas do site para o painel "SEO e GEO": as do sitemap, as que o painel escondeu do Google
 * (continuam na lista, marcadas) e as técnicas. Página nova criada no painel entra sozinha, porque a fonte é a
 * mesma do sitemap. Funções puras: recebem os documentos e as regras, sem banco.
 */
import content from "../../../web/data/content.json";
import landing from "../../../web/data/landing.json";
import { DEFAULT_CASES } from "../../../web/lib/cases";
import { CATEGORY_PAGE } from "../../../web/lib/landing-links";
import { segmentLps } from "../../../web/lib/segmentos-lp";
import { seoKey, STATIC_SEO } from "../../../web/lib/seo-pages";
import { seoDocsFrom, type PageOverrides } from "../../../web/lib/seo-overrides";
import { buildAllEntries } from "../sitemap";
import type { Lang, SiteArea } from "./types";

export type { Lang, SiteArea } from "./types";
export type { PageOverrides } from "../../../web/lib/seo-overrides";

export type SitePage = {
  path: string;
  lang: Lang;
  area: SiteArea;
  label: string;
  /** está no sitemap agora (não escondida e sem "fora do sitemap") */
  inSitemap: boolean;
  /** escondida do Google pelo painel (noindex) */
  hiddenByPanel: boolean;
  /** página que fica fora do Google de propósito (obrigado, loja...) */
  technical: boolean;
  overrides: PageOverrides;
};

type Doc = { collection: string; key: string; data: unknown; deleted: boolean; updatedAt: Date };

const TECHNICAL = new Set(["/obrigado", "/en/obrigado", "/es/obrigado", "/loja", "/admin", "/404"]);
/** As técnicas que existem como página para abrir e conferir. /admin e a 404 não entram na lista. */
const LISTED_TECHNICAL = ["/obrigado", "/en/obrigado", "/es/obrigado", "/loja"];

const trimEnd = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path) || "/";

export function isTechnical(path: string): boolean {
  return TECHNICAL.has(trimEnd(path));
}

const LANG_PREFIX = /^\/(en|es)(?=\/|$)/;
const stripLang = (path: string) => path.replace(LANG_PREFIX, "") || "/";
const CATEGORY_PATHS = new Set(Object.values(CATEGORY_PAGE));

export function classify(path: string): { area: SiteArea; lang: Lang; technical: boolean } {
  const p = trimEnd(path);
  const lang = (LANG_PREFIX.exec(p)?.[1] as Lang | undefined) ?? "pt";
  if (isTechnical(p)) return { area: "tecnica", lang, technical: true };
  const base = stripLang(p);
  const area = ((): SiteArea => {
    if (base === "/export" || base === "/exportacion") return "exportacao";
    if (base === "/produtos") return "categorias";
    if (base.startsWith("/produtos/")) return "produtos";
    if (CATEGORY_PATHS.has(base)) return "categorias";
    if (landingSlugs.has(base)) return "comerciais";
    if (base === "/blog" || base.startsWith("/blog/")) return "blog";
    if (base === "/cases" || base.startsWith("/cases/")) return "cases";
    if (base.startsWith("/segmentos/")) return "segmentos";
    if (base === "/vagas" || base.startsWith("/vagas/")) return "vagas";
    return "institucional";
  })();
  return { area, lang, technical: false };
}

const landingRows = landing as unknown as { slug: string; breadcrumb: string[][] }[];
const landingSlugs = new Set(landingRows.map((l) => `/${l.slug}`));

const FIXED_LABELS: Record<string, string> = {
  ...Object.fromEntries(STATIC_SEO.map((s) => [s.path, s.label])),
  "/politica-de-privacidade": "Política de privacidade",
  "/termos-de-uso": "Termos de uso",
  "/export": "Exportação",
  "/exportacion": "Exportação",
  "/obrigado": "Obrigado",
  "/loja": "Loja técnica",
};
for (const l of landingRows) FIXED_LABELS[`/${l.slug}`] = l.breadcrumb[l.breadcrumb.length - 1]?.[0] ?? l.slug;

/** Nome da página para a lista: o nome editado no painel vale mais que o do código. */
function labelOf(path: string, docs: Doc[]): string {
  const lang = LANG_PREFIX.exec(path)?.[1];
  const base = stripLang(path);
  const edited = (collection: string, key: string, field: string) => {
    const d = docs.find((x) => x.collection === collection && x.key === key && !x.deleted)?.data as Record<string, unknown> | undefined;
    return typeof d?.[field] === "string" && d[field] ? (d[field] as string) : undefined;
  };
  const [, section, slug] = /^\/([^/]+)\/([^/]+)$/.exec(base) ?? [];
  const name =
    FIXED_LABELS[base] ??
    (section === "produtos" && slug
      ? (edited("produto", slug, "name") ?? (content as { products: { slug: string; name: string }[] }).products.find((p) => p.slug === slug)?.name)
      : section === "blog" && slug
        ? (edited("post", slug, "title") ?? (content as { posts: { slug: string; title: string }[] }).posts.find((p) => p.slug === slug)?.title)
        : section === "cases" && slug
          ? (edited("case", slug, "title") ?? DEFAULT_CASES.find((c) => c.slug === slug)?.title)
          : section === "segmentos" && slug
            ? segmentLps.find((s) => s.slug === slug)?.name
            : section === "vagas" && slug
              ? `Vaga: ${slug}`
              : undefined) ??
    base;
  return lang ? `${name} (${lang.toUpperCase()})` : name;
}

export function listSitePages(
  docs: Doc[],
  openJobs: { slug: string; updatedAt: Date }[],
  seoDocs: Record<string, PageOverrides> = seoDocsFrom(docs),
): SitePage[] {
  const paths = new Set(buildAllEntries(docs, openJobs).map((e) => e.path));
  const out: SitePage[] = [];
  for (const path of [...paths, ...LISTED_TECHNICAL.filter((t) => !paths.has(t))]) {
    const { area, lang, technical } = classify(path);
    const overrides = seoDocs[seoKey(path)] ?? {};
    const hiddenByPanel = !technical && overrides.noindex === true;
    out.push({
      path,
      lang,
      area,
      label: labelOf(path, docs),
      inSitemap: !technical && !hiddenByPanel && overrides.noSitemap !== true,
      hiddenByPanel,
      technical,
      overrides,
    });
  }
  return out;
}

/**
 * Páginas que o build pré-renderiza: todas as do site, inclusive as que o painel escondeu do Google ou do sitemap
 * (o HTML delas precisa sair com noindex, ou normal, e não como a casca do aplicativo). As técnicas têm tratamento
 * próprio no prerender.
 */
export function prerenderPaths(docs: Doc[], openJobs: { slug: string; updatedAt: Date }[], seoDocs: Record<string, PageOverrides> = seoDocsFrom(docs)): string[] {
  return listSitePages(docs, openJobs, seoDocs).filter((p) => !p.technical).map((p) => p.path);
}

/** Página comercial (cobra texto mínimo na nota): as 10 de URL própria, não o catálogo nem os produtos. */
export function isCommercialPath(path: string): boolean {
  return landingSlugs.has(stripLang(trimEnd(path)));
}

/**
 * Dados estruturados que cada tipo de página deve ter. Vem do que o site realmente publica (o teste
 * schema-expectations.test.ts confere com o HTML pré-renderizado): se o site mudar, este mapa muda junto.
 */
export function expectedSchema(path: string): string[] {
  if (isTechnical(path)) return [];
  const base = stripLang(trimEnd(path));
  if (base === "/") return ["Organization", "WebSite"];
  if (base.startsWith("/produtos/")) return ["Product", "BreadcrumbList"];
  if (base === "/produtos") return ["ItemList", "BreadcrumbList"];
  if (CATEGORY_PATHS.has(base)) return ["CollectionPage", "BreadcrumbList"];
  if (landingSlugs.has(base)) return ["Service", "BreadcrumbList"];
  if (base.startsWith("/blog/") || base.startsWith("/cases/")) return ["Article", "BreadcrumbList"];
  if (base.startsWith("/segmentos/")) return ["Service", "BreadcrumbList"];
  if (base === "/faq") return ["FAQPage", "BreadcrumbList"];
  if (base === "/contato") return ["ContactPage"];
  if (base === "/a-empresa") return ["AboutPage"];
  if (base === "/export" || base === "/exportacion") return ["Organization"];
  return ["BreadcrumbList"];
}

/** Idiomas que o hreflang da página deve listar (vazio = página só em português ou técnica). */
export function expectedHreflangs(path: string): string[] {
  if (isTechnical(path)) return [];
  const base = stripLang(trimEnd(path));
  if (base === "/export" || base === "/exportacion") return ["es", "en", "x-default"];
  if (landingSlugs.has(base) || base === "/vagas" || base.startsWith("/vagas/")) return [];
  return ["pt-BR", "en", "es", "x-default"];
}
