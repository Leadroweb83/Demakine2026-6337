import { DEFAULT_RULES, type SeoRules } from "../../../src/api/lib/seo/rules";
import type { Issue } from "../../../src/api/lib/seo/issues";
import type { SitePage } from "../../../src/api/lib/seo/pages";
import type { AuditStore, RunRow, StoredPage } from "../../../src/api/lib/seo/run-audit";

export const sitePage = (path: string, over: Partial<SitePage> = {}): SitePage => ({
  path, lang: "pt", area: "institucional", label: path, inSitemap: true, hiddenByPanel: false, technical: false, overrides: {}, ...over,
});

type HtmlOpts = {
  title?: string | null;
  description?: string | null;
  h1?: string | null;
  robots?: string;
  links?: string[];
  words?: number;
  images?: string;
};

/** HTML de uma página sem problema de SEO (para o caminho dado), com ajustes pontuais. */
export function pageHtml(path: string, o: HtmlOpts = {}): string {
  const title = o.title === undefined ? `Título da página ${path} do site Demakine para teste` : o.title;
  const description = o.description === undefined ? `Descrição única da página ${path} com tamanho suficiente para passar na regra de setenta caracteres.` : o.description;
  const h1 = o.h1 === undefined ? `Assunto de ${path}` : o.h1;
  const origin = "https://www.demakine.com.br";
  const alt = ["pt-BR", "en", "es", "x-default"].map((l) => `<link rel="alternate" hreflang="${l}" href="${origin}${path}">`).join("");
  return `<!doctype html><html lang="pt-BR"><head>
${title === null ? "" : `<title>${title}</title>`}
${description === null ? "" : `<meta name="description" content="${description}">`}
${o.robots ? `<meta name="robots" content="${o.robots}">` : ""}
<link rel="canonical" href="${origin}${path}">${alt}
<meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="${origin}/og.jpg">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Início"}]}</script>
</head><body>${h1 === null ? "" : `<h1>${h1}</h1>`}<p>${"palavra ".repeat(o.words ?? 120)}</p>
${(o.links ?? []).map((l) => `<a href="${l}">link</a>`).join("")}${o.images ?? `<img src="/i.webp" alt="Foto">`}</body></html>`;
}

/** n páginas /p0../p{n-1}, cada uma linkando as 3 seguintes em círculo (todas recebem 3 links). */
export const ring = (n: number) => Array.from({ length: n }, (_, i) => `/p${i}`);
export const ringLinks = (i: number, n: number) => [1, 2, 3].map((k) => `/p${(i + k) % n}`);

export type FakeSite = {
  /** o que cada caminho responde; o que não está aqui responde a página padrão (ou 404 se `missing`) */
  overrides: Record<string, { status?: number; html?: string; throws?: boolean }>;
  /** caminhos pedidos, na ordem (inclui /sitemap.xml e /robots.txt) */
  calls: string[];
  clock: { t: number; step: number };
  fetchPage: (url: string) => Promise<{ status: number; html: string; finalUrl: string; hops: number }>;
  now: () => number;
};

export function fakeSite(count: number, base: Record<string, { status?: number; html?: string; throws?: boolean }> = {}, step = 10): FakeSite {
  const site: FakeSite = {
    overrides: base,
    calls: [],
    clock: { t: 1_000_000, step },
    now: () => site.clock.t,
    fetchPage: async (url) => {
      const path = new URL(url).pathname;
      site.calls.push(path);
      const finalUrl = url;
      if (path === "/sitemap.xml") return { status: 200, html: "<urlset></urlset>", finalUrl, hops: 0 };
      if (path === "/robots.txt") return { status: 200, html: "User-agent: *\nAllow: /\n", finalUrl, hops: 0 };
      site.clock.t += site.clock.step;
      const o = site.overrides[path];
      if (o?.throws) throw new Error("falha de rede");
      const i = Number(/^\/p(\d+)$/.exec(path)?.[1] ?? 0);
      return { status: o?.status ?? 200, html: o?.html ?? pageHtml(path, { links: ringLinks(i, count) }), finalUrl, hops: 0 };
    },
  };
  return site;
}

export type MemoryStore = AuditStore & {
  rules: SeoRules;
  pages: SitePage[];
  runs: RunRow[];
  rows: StoredPage[];
  issues: (Issue & { resolvedAt: Date | null; firstSeen: Date; lastSeen: Date })[];
};

export function memoryStore(pages: SitePage[], seed: { runs?: RunRow[]; rules?: SeoRules } = {}): MemoryStore {
  const s: MemoryStore = {
    rules: seed.rules ?? DEFAULT_RULES,
    pages,
    runs: seed.runs ?? [],
    rows: [],
    issues: [],
    loadRules: async () => s.rules,
    loadPages: async () => s.pages,
    abandonStale: async (olderThan) => {
      for (const r of s.runs) if (r.status === "em-andamento" && r.startedAt < olderThan) Object.assign(r, { status: "parcial", finishedAt: olderThan });
    },
    findResumable: async (newerThan) => [...s.runs].reverse().find((r) => r.status === "em-andamento" && r.startedAt >= newerThan) ?? null,
    createRun: async (kind, pagesTotal, startedAt) => {
      const run: RunRow = {
        id: Math.max(0, ...s.runs.map((r) => r.id)) + 1, startedAt, finishedAt: null, kind, status: "em-andamento", pagesTotal,
        pagesAudited: 0, cursor: 0, siteSeoScore: null, sectorScores: {}, areaScores: {}, alerts: [],
      };
      s.runs.push(run);
      return { ...run };
    },
    updateRun: async (id, patch) => {
      Object.assign(s.runs.find((r) => r.id === id)!, patch);
    },
    fetchedPaths: async (runId) => new Set(s.rows.filter((r) => r.runId === runId).map((r) => r.path)),
    savePages: async (rows) => {
      for (const row of rows) {
        const i = s.rows.findIndex((r) => r.runId === row.runId && r.path === row.path);
        if (i >= 0) s.rows[i] = structuredClone(row);
        else s.rows.push(structuredClone(row));
      }
    },
    loadRunPages: async (runId) => structuredClone(s.rows.filter((r) => r.runId === runId)),
    latestCompleteRun: async (excludeId) => [...s.runs].reverse().find((r) => r.status === "completa" && r.id !== excludeId) ?? null,
    openIssues: async () => s.issues.filter((i) => i.resolvedAt === null).map(({ path, code, severity, message }) => ({ path, code, severity, message })),
    applyIssues: async (diff, at) => {
      for (const i of diff.opened) s.issues.push({ ...i, resolvedAt: null, firstSeen: at, lastSeen: at });
      for (const i of diff.kept) {
        const row = s.issues.find((x) => x.path === i.path && x.code === i.code && x.resolvedAt === null);
        if (row) Object.assign(row, { lastSeen: at, severity: i.severity, message: i.message });
      }
      for (const i of diff.resolved) {
        const row = s.issues.find((x) => x.path === i.path && x.code === i.code && x.resolvedAt === null);
        if (row) row.resolvedAt = at;
      }
    },
  };
  return s;
}

export const completeRun = (id: number, siteSeoScore: number, startedAt: Date): RunRow => ({
  id, startedAt, finishedAt: startedAt, kind: "diaria", status: "completa", pagesTotal: 10, pagesAudited: 10, cursor: 10,
  siteSeoScore, sectorScores: {}, areaScores: {}, alerts: [],
});
