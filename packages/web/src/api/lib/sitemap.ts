import content from "../../web/data/content.json";
import { DEFAULT_CASES } from "../../web/lib/cases";

const ORIGIN = "https://www.demakine.com.br";

/** Páginas fixas do site (as de produto, blog, case e vaga vêm do conteúdo). */
const STATIC_PAGES = [
  "/", "/produtos", "/projetos-especiais", "/a-empresa", "/clientes", "/assistencia-tecnica", "/blog",
  "/faq", "/downloads", "/ferramentas", "/agro", "/contato", "/vagas", "/cases",
  "/politica-de-privacidade", "/termos-de-uso",
  "/segmentos/fertilizantes-e-insumos", "/segmentos/reciclagem-e-residuos", "/segmentos/construcao-e-mineracao",
  "/segmentos/alimentos-e-racao", "/segmentos/logistica-e-distribuicao",
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
    ...STATIC_PAGES.map((path) => ({ path, priority: path === "/" ? "1.0" : "0.6" })),
    ...merged(docs, "produto", c.products.map((p) => p.slug), (d) => Boolean(d.name && d.category)).map((p) => ({
      path: `/produtos/${p.key}`,
      lastmod: day(p.updatedAt),
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
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${esc(ORIGIN + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<priority>${e.priority}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
