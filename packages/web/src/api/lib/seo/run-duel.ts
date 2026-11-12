/**
 * Duelo com concorrentes (Guerra é Guerra), em lotes retomáveis como o auditor: lê robots.txt e sitemap de cada
 * concorrente, depois as páginas (1 por segundo, no máximo 40), e só quando tudo foi lido calcula o placar e grava o
 * resultado. Se o tempo da função acaba, a próxima chamada continua da página seguinte, sem reler nada.
 */
import { actionsFor, type DuelAction } from "./duel-actions";
import { compare, scoreboard, siteMetrics, type SiteMetrics, type Verdict } from "./duel-metrics";
import { discoverPages, fetchExternal as realFetch, loadRobots } from "./crawl-external";
import { extractFacts, type PageFacts } from "./html";
import type { AuditStore } from "./run-audit";

const RESUME_WINDOW_MS = 30 * 60_000;
const ESTIMATE_PAGES = 40;
const BLOG = /^\/(blog|noticias|artigos|novidades|news|posts?)\//i;

export type SiteStatus = "pendente" | "lendo" | "ok" | "bloqueado-robots" | "sem-paginas" | "erro";
export type SiteState = { name: string; status: SiteStatus; paths: string[]; total: number; lastmods: Record<string, string>; pages: { path: string; facts: PageFacts | null }[] };
export type DuelState = { sites: Record<string, SiteState> };
export type DuelRow = { id: number; startedAt: Date; status: "em-andamento" | "completa"; state: DuelState };

export type DuelResult = {
  at: string;
  sites: { name: string; url: string; status: SiteStatus; metrics: SiteMetrics | null }[];
  ours: SiteMetrics;
  verdicts: Record<string, Verdict[]>;
  board: Record<string, { better: number; worse: number; tie: number }>;
  actions: DuelAction[];
};

export interface DuelStore {
  competitors(): Promise<{ id: number; name: string; url: string }[]>;
  abandonStale(olderThan: Date): Promise<void>;
  findResumable(newerThan: Date): Promise<DuelRow | null>;
  create(startedAt: Date): Promise<DuelRow>;
  saveState(id: number, state: DuelState): Promise<void>;
  finish(id: number, result: DuelResult, at: Date): Promise<void>;
  latest(): Promise<DuelResult | null>;
}

export type DuelDeps = {
  store: DuelStore;
  audit: AuditStore;
  /** tamanho do sitemap da Demakine e datas dos posts do blog */
  ourSitemap: () => Promise<{ total: number; blogLastmods: string[] }>;
  fetchExternal?: (url: string, origin: string) => Promise<{ status: number; html: string; finalUrl: string }>;
  now?: () => number;
};

/** Guarda só o que o duelo usa: o corpo do JSON-LD e os links ficam de fora, para o estado caber no banco. */
const slim = (f: PageFacts): PageFacts => ({ ...f, jsonLd: [], internalLinks: [], images: f.images.slice(0, 60) });
const isFinal = (s: SiteStatus) => s !== "pendente" && s !== "lendo";

export async function runDuel(opts: { budgetMs: number }, deps: DuelDeps): Promise<{ duelId: number; status: "completa" | "parcial"; done: number; total: number }> {
  const now = deps.now ?? Date.now;
  const get = deps.fetchExternal ?? ((url: string, origin: string) => realFetch(url, { origin }));
  const comps = await deps.store.competitors();
  if (comps.length === 0) throw new Error("Cadastre um concorrente primeiro");
  const latestRun = await deps.audit.latestCompleteRun();
  if (!latestRun) throw new Error("Rode a auditoria completa primeiro");

  const start = now();
  const deadline = start + opts.budgetMs;
  await deps.store.abandonStale(new Date(start - RESUME_WINDOW_MS));
  const duel = (await deps.store.findResumable(new Date(start - RESUME_WINDOW_MS))) ?? (await deps.store.create(new Date(start)));
  const state: DuelState = duel.state?.sites ? duel.state : { sites: {} };
  for (const c of comps) state.sites[c.url] ??= { name: c.name, status: "pendente", paths: [], total: 0, lastmods: {}, pages: [] };
  const progress = () => {
    const sites = comps.map((c) => state.sites[c.url]!);
    return { done: sites.reduce((a, s) => a + s.pages.length, 0), total: sites.reduce((a, s) => a + (s.paths.length || (isFinal(s.status) ? 0 : ESTIMATE_PAGES)), 0) };
  };
  const partial = async () => {
    await deps.store.saveState(duel.id, state);
    return { duelId: duel.id, status: "parcial" as const, ...progress() };
  };

  for (const c of comps) {
    const s = state.sites[c.url]!;
    const getHere = (url: string) => get(url, c.url);
    if (s.status === "pendente") {
      if (now() >= deadline) return partial();
      const robots = await loadRobots(c.url, getHere);
      if (robots === null) s.status = "erro";
      else if (!robots.allows("/")) s.status = "bloqueado-robots";
      else {
        const found = await discoverPages(c.url, robots, getHere);
        if (found.paths.length === 0) s.status = "sem-paginas";
        else Object.assign(s, { status: "lendo", paths: found.paths, total: found.total, lastmods: found.lastmods });
      }
    }
    while (s.status === "lendo" && s.pages.length < s.paths.length) {
      if (now() >= deadline) return partial();
      const path = s.paths[s.pages.length]!;
      const r = await getHere(c.url + (path === "/" ? "/" : path));
      s.pages.push({ path, facts: r.status === 200 && r.html ? slim(extractFacts(r.html, r.finalUrl)) : null });
    }
    if (s.status === "lendo") s.status = s.pages.some((p) => p.facts) ? "ok" : "erro";
    await deps.store.saveState(duel.id, state);
  }

  // todos lidos: monta a Demakine (páginas em português, auditadas e abertas ao Google) e compara
  const siteInfo = new Map((await deps.audit.loadPages()).map((p) => [p.path, p]));
  const rows = (await deps.audit.loadRunPages(latestRun.id)).filter((r) => {
    const p = siteInfo.get(r.path);
    return Boolean(p && p.lang === "pt" && !p.technical && !p.hiddenByPanel && r.facts && r.statusCode >= 200 && r.statusCode < 400);
  });
  const sitemap = await deps.ourSitemap();
  const today = new Date(now()).toISOString().slice(0, 10);
  const ours = siteMetrics(rows.map((r) => ({ path: r.path, facts: r.facts! })), sitemap, today);

  const verdicts: Record<string, Verdict[]> = {};
  const board: DuelResult["board"] = {};
  const sites: DuelResult["sites"] = comps.map((c) => {
    const s = state.sites[c.url]!;
    let metrics: SiteMetrics | null = null;
    if (s.status === "ok") {
      const blogLastmods = Object.entries(s.lastmods).filter(([p]) => BLOG.test(p)).map(([, d]) => d);
      metrics = siteMetrics(s.pages.filter((p) => p.facts).map((p) => ({ path: p.path, facts: p.facts! })), { total: s.total, blogLastmods }, today);
      verdicts[c.name] = compare(ours, metrics);
      board[c.name] = scoreboard(verdicts[c.name]!);
    }
    return { name: c.name, url: c.url, status: s.status, metrics };
  });
  const actions = actionsFor(verdicts, rows.map((r) => ({ path: r.path, label: siteInfo.get(r.path)?.label ?? r.path, checks: r.checks })));
  const result: DuelResult = { at: new Date(now()).toISOString(), sites, ours, verdicts, board, actions };
  await deps.store.finish(duel.id, result, new Date(now()));
  return { duelId: duel.id, status: "completa", ...progress() };
}
