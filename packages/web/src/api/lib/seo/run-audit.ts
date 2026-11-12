/**
 * Auditor de SEO: busca as páginas do site no ar, pontua e grava o resultado. Funciona em DUAS fases, porque a nota
 * de cada página depende das outras (título repetido, links recebidos):
 *   1. buscar (em lotes, dentro do tempo da função) e guardar os fatos de cada página;
 *   2. quando todas foram buscadas, pontuar tudo de uma vez, abrir/fechar problemas e fechar a execução.
 * Se o tempo acaba na fase 1, a execução fica "em-andamento" e a próxima chamada continua das páginas que faltam
 * (sem duplicar o registro). O banco entra por AuditStore, para os testes usarem uma versão em memória.
 */
import { fetchPage as realFetchPage, pool, type FetchedPage } from "./crawl";
import { emptyFacts, extractFacts, type PageFacts } from "./html";
import { alertsFor, diffIssues, issuesFromChecks, type Issue } from "./issues";
import { expectedHreflangs, expectedSchema, isCommercialPath, type SitePage } from "./pages";
import type { SeoRules } from "./rules";
import { scorePage, scoreSite, type Check, type PageScore } from "./score";
import type { Lang } from "./types";

const ORIGIN = "https://www.demakine.com.br";
/** Execução em andamento com menos que isso é retomada; com mais, é abandonada. */
const RESUME_WINDOW_MS = 30 * 60_000;

export type RunRow = {
  id: number;
  startedAt: Date;
  finishedAt: Date | null;
  kind: "diaria" | "manual";
  status: "em-andamento" | "completa" | "parcial";
  pagesTotal: number;
  pagesAudited: number;
  cursor: number;
  siteSeoScore: number | null;
  sectorScores: Record<string, number>;
  areaScores: Record<string, number>;
  alerts: string[];
};

export type StoredPage = {
  runId: number;
  path: string;
  lang: Lang;
  area: string;
  seoScore: number;
  checks: Check[];
  facts: PageFacts | null;
  statusCode: number;
  indexable: boolean;
  inlinks: number;
};

export interface AuditStore {
  loadRules(): Promise<SeoRules>;
  loadPages(): Promise<SitePage[]>;
  /** execuções "em-andamento" iniciadas antes de `olderThan` passam a "parcial" */
  abandonStale(olderThan: Date): Promise<void>;
  findResumable(newerThan: Date): Promise<RunRow | null>;
  createRun(kind: RunRow["kind"], pagesTotal: number, startedAt: Date): Promise<RunRow>;
  updateRun(id: number, patch: Partial<Omit<RunRow, "id">>): Promise<void>;
  /** caminhos que já foram buscados nesta execução */
  fetchedPaths(runId: number): Promise<Set<string>>;
  /** grava ou atualiza (por execução e caminho) */
  savePages(rows: StoredPage[]): Promise<void>;
  loadRunPages(runId: number): Promise<StoredPage[]>;
  latestCompleteRun(excludeId?: number): Promise<RunRow | null>;
  openIssues(): Promise<Issue[]>;
  applyIssues(diff: { opened: Issue[]; resolved: Issue[]; kept: Issue[] }, at: Date): Promise<void>;
}

export type AuditOptions = { kind: "diaria" | "manual"; budgetMs: number; paths?: string[] };
export type AuditDeps = {
  store?: AuditStore;
  fetchPage?: (url: string) => Promise<FetchedPage>;
  now?: () => number;
  concurrency?: number;
  chunkSize?: number;
};
export type AuditResult = { runId: number; status: "completa" | "parcial"; audited: number; total: number };

const is2xx3xx = (status: number) => status >= 200 && status < 400;

type Scored = { row: StoredPage; page: SitePage; score: PageScore; ctxTechnical: boolean };

/** Pontua todas as páginas de uma execução olhando as outras (título repetido e links recebidos). */
function scoreRows(rows: StoredPage[], pagesByPath: Map<string, SitePage>, rules: SeoRules): Scored[] {
  const live = rows.filter((r) => is2xx3xx(r.statusCode) && r.facts);
  const quiet = (path: string) => {
    const p = pagesByPath.get(path);
    return Boolean(p && (p.technical || p.hiddenByPanel));
  };
  const key = (lang: string, text: string) => `${lang}\u0000${text.trim().toLowerCase()}`;
  const titles = new Map<string, number>();
  const descriptions = new Map<string, number>();
  const inlinks = new Map<string, number>();
  for (const r of live) {
    const f = r.facts!;
    if (!quiet(r.path)) {
      if (f.title) titles.set(key(r.lang, f.title), (titles.get(key(r.lang, f.title)) ?? 0) + 1);
      if (f.description) descriptions.set(key(r.lang, f.description), (descriptions.get(key(r.lang, f.description)) ?? 0) + 1);
    }
    for (const target of f.internalLinks) inlinks.set(target, (inlinks.get(target) ?? 0) + 1);
  }
  const out: Scored[] = [];
  for (const row of rows) {
    const page = pagesByPath.get(row.path);
    if (!page) continue; // a página saiu do site depois de buscada
    const f = row.facts ?? emptyFacts();
    const ctxTechnical = page.technical || page.hiddenByPanel;
    const score = scorePage(
      f,
      {
        path: row.path,
        area: page.area,
        lang: page.lang,
        statusCode: row.statusCode,
        inlinks: inlinks.get(row.path) ?? 0,
        isCommercial: isCommercialPath(row.path),
        duplicateTitle: Boolean(f.title && !ctxTechnical && (titles.get(key(row.lang, f.title)) ?? 0) > 1),
        duplicateDescription: Boolean(f.description && !ctxTechnical && (descriptions.get(key(row.lang, f.description)) ?? 0) > 1),
        expectedSchema: expectedSchema(row.path),
        expectedHreflangs: expectedHreflangs(row.path),
        technical: ctxTechnical,
      },
      rules,
      false,
    );
    out.push({ row: { ...row, seoScore: score.seo, checks: score.checks, inlinks: inlinks.get(row.path) ?? 0 }, page, score, ctxTechnical });
  }
  return out;
}

const issuesOf = (s: Scored): Issue[] => issuesFromChecks(s.row.path, s.score.checks, { indexable: s.row.indexable, technical: s.ctxTechnical });

/** O robots.txt bloqueia o site inteiro para todos os robôs (User-agent: * com Disallow: /)? */
function robotsBlocksSite(text: string): boolean {
  let inStar = false;
  let lastWasAgent = false;
  let disallowAll = false;
  let allowAll = false;
  for (const line of text.split(/\r?\n/)) {
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line.replace(/#.*/, "").trim());
    if (!m) continue;
    const k = m[1]!.toLowerCase();
    const v = m[2]!.trim();
    if (k === "user-agent") {
      inStar = (lastWasAgent && inStar) || v === "*";
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!inStar) continue;
    if (k === "disallow" && v === "/") disallowAll = true;
    if (k === "allow" && v === "/") allowAll = true;
  }
  return disallowAll && !allowAll;
}

export async function auditSite(opts: AuditOptions, deps: AuditDeps = {}): Promise<AuditResult> {
  const store = deps.store ?? (await import("./db-store")).dbStore;
  const fetchOne = deps.fetchPage ?? ((url: string) => realFetchPage(url));
  const now = deps.now ?? Date.now;
  const concurrency = deps.concurrency ?? 8;
  const chunkSize = deps.chunkSize ?? concurrency * 2;

  const rules = await store.loadRules();
  const allPages = (await store.loadPages()).slice().sort((a, b) => a.path.localeCompare(b.path));
  const pagesByPath = new Map(allPages.map((p) => [p.path, p]));

  async function fetchRow(page: SitePage, runId: number): Promise<StoredPage> {
    const url = ORIGIN + page.path;
    let r: FetchedPage;
    try {
      r = await fetchOne(url);
    } catch {
      r = { status: 0, html: "", finalUrl: url, hops: 0 }; // falha de rede: a página não respondeu
    }
    const facts = is2xx3xx(r.status) && r.html ? extractFacts(r.html, r.finalUrl) : null;
    const noindex = /noindex/i.test(facts?.robots ?? "");
    return { runId, path: page.path, lang: page.lang, area: page.area, seoScore: 0, checks: [], facts, statusCode: r.status, indexable: is2xx3xx(r.status) && !noindex, inlinks: 0 };
  }

  // -------- uma página só: atualiza a nota dela na última execução completa
  if (opts.paths) {
    const latest = await store.latestCompleteRun();
    if (!latest) throw new Error("Rode a auditoria completa primeiro");
    const targets = [...new Set(opts.paths)].map((p) => {
      const page = pagesByPath.get(p);
      if (!page) throw new Error("Página não encontrada");
      return page;
    });
    const fresh = await pool(targets, concurrency, (p) => fetchRow(p, latest.id));
    const byPath = new Map((await store.loadRunPages(latest.id)).map((r) => [r.path, r]));
    for (const row of fresh) byPath.set(row.path, row);
    const wanted = new Set(targets.map((t) => t.path));
    const scored = scoreRows([...byPath.values()], pagesByPath, rules).filter((s) => wanted.has(s.row.path));
    await store.savePages(scored.map((s) => s.row));
    const open = (await store.openIssues()).filter((i) => wanted.has(i.path));
    await store.applyIssues(diffIssues(open, scored.flatMap(issuesOf)), new Date(now()));
    return { runId: latest.id, status: "completa", audited: targets.length, total: targets.length };
  }

  // -------- execução completa, em lotes
  const startedAt = now();
  const deadline = startedAt + opts.budgetMs;
  await store.abandonStale(new Date(startedAt - RESUME_WINDOW_MS));
  const run = (await store.findResumable(new Date(startedAt - RESUME_WINDOW_MS))) ?? (await store.createRun(opts.kind, allPages.length, new Date(startedAt)));

  const done = await store.fetchedPaths(run.id);
  const fetched = new Set([...done].filter((p) => pagesByPath.has(p)));
  const pending = allPages.filter((p) => !fetched.has(p.path));
  for (let i = 0; i < pending.length; i += chunkSize) {
    if (now() >= deadline) break;
    const rows = await pool(pending.slice(i, i + chunkSize), concurrency, async (page) => (now() >= deadline ? null : fetchRow(page, run.id)));
    const ok = rows.filter((r): r is StoredPage => r !== null);
    if (ok.length === 0) break;
    await store.savePages(ok);
    for (const r of ok) fetched.add(r.path);
    await store.updateRun(run.id, { pagesAudited: fetched.size, cursor: fetched.size, pagesTotal: allPages.length });
  }
  if (fetched.size < allPages.length) return { runId: run.id, status: "parcial", audited: fetched.size, total: allPages.length };

  // -------- fase 2: pontuar tudo e fechar
  const scored = scoreRows(await store.loadRunPages(run.id), pagesByPath, rules);
  await store.savePages(scored.map((s) => s.row));

  const settle = async (path: string) => {
    try {
      return await fetchOne(ORIGIN + path);
    } catch {
      return { status: 0, html: "", finalUrl: ORIGIN + path, hops: 0 } as FetchedPage;
    }
  };
  const sitemap = await settle("/sitemap.xml");
  const robots = await settle("/robots.txt");
  const statusOf = new Map(scored.map((s) => [s.row.path, s.row.statusCode]));
  let broken = 0;
  for (const s of scored) {
    if (!s.row.facts || !is2xx3xx(s.row.statusCode)) continue;
    for (const target of s.row.facts.internalLinks) {
      const code = statusOf.get(target);
      if (code !== undefined && !is2xx3xx(code)) broken++;
    }
  }
  const site = scoreSite(
    scored.map((s) => ({ path: s.row.path, area: s.page.area, lang: s.page.lang, score: s.score, indexable: s.row.indexable, hiddenByPanel: s.ctxTechnical })),
    rules,
    {
      sitemapValid: sitemap.status === 200 && /<(urlset|sitemapindex)/i.test(sitemap.html),
      robotsBlocksSite: robots.status === 200 && robotsBlocksSite(robots.html),
      brokenInternalLinks: broken,
    },
  );

  const diff = diffIssues(await store.openIssues(), scored.flatMap(issuesOf));
  const previous = await store.latestCompleteRun(run.id);
  const drop = previous?.siteSeoScore != null ? previous.siteSeoScore - site.site : 0;
  const finishedAt = new Date(now());
  await store.applyIssues(diff, finishedAt);
  await store.updateRun(run.id, {
    status: "completa",
    finishedAt,
    pagesTotal: allPages.length,
    pagesAudited: scored.length,
    cursor: scored.length,
    siteSeoScore: site.site,
    sectorScores: site.bySector,
    areaScores: site.byArea as Record<string, number>,
    alerts: alertsFor(diff.opened, drop),
  });
  return { runId: run.id, status: "completa", audited: allPages.length, total: allPages.length };
}
