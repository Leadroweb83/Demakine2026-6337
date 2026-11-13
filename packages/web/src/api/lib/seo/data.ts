/**
 * Dados do painel "SEO e GEO" vindos do banco (Drizzle). Sem teste automático (não há banco nos testes); as rotas
 * são testadas com uma versão em memória de SeoData. Conferir com o painel depois de aplicar a migração 0017.
 */
import { and, count, desc, eq, gte, inArray, isNull, like, or } from "drizzle-orm";
import { db } from "../../database";
import * as schema from "../../database/schema";
import type { SeoData } from "../../seo-routes";
import { dbStore, RULES_KEY } from "./db-store";
import content from "../../../web/data/content.json";
import { toWebp } from "../../../web/lib/images";
import { isJobOpen } from "../jobs";
import { dbDuelStore } from "./duel-store";
import { runDuel } from "./run-duel";
import { buildAllEntries } from "../sitemap";
import { auditSite } from "./run-audit";
import { checkLinks, type LinkReport } from "./links";
import { createRedirects, testOldUrls } from "./import-old";
import { TIP_LIBRARY, type Tip } from "./tips-library";
import { pickDailyTips, tipsFromIssues, type TipsState } from "./tips";

const LINKS_KEY = "seo-links";
const TIPS_KEY = "seo-tips";

/** Escolhe (ou devolve) as dicas de hoje e guarda o estado, para o mesmo dia mostrar as mesmas e o próximo trazer novas. */
async function dailyTips(): Promise<{ date: string; tips: Tip[] }> {
  const today = spDay(new Date());
  const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, TIPS_KEY)).limit(1);
  const state = (row?.value as TipsState | undefined) ?? null;
  const labels = new Map((await dbStore.loadPages()).map((p) => [p.path, { label: p.label }]));
  const picked = pickDailyTips(state, today, TIP_LIBRARY, tipsFromIssues(await dbStore.openIssues(), labels));
  if (picked.state !== state) {
    await db
      .insert(schema.appSettings)
      .values({ key: TIPS_KEY, value: picked.state, updatedAt: new Date() })
      .onConflictDoUpdate({ target: schema.appSettings.key, set: { value: picked.state, updatedAt: new Date() } });
  }
  return { date: today, tips: picked.tips };
}
const ORIGIN = "https://www.demakine.com.br";

const DAY = 86_400_000;
const spDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);

export const dbSeoData: SeoData = {
  store: dbStore,

  async history(days) {
    const rows = await db
      .select({ at: schema.seoRuns.finishedAt, score: schema.seoRuns.siteSeoScore })
      .from(schema.seoRuns)
      .where(and(eq(schema.seoRuns.status, "completa"), gte(schema.seoRuns.finishedAt, new Date(Date.now() - days * DAY))))
      .orderBy(schema.seoRuns.finishedAt);
    const byDay = new Map<string, number>(); // a última execução do dia vale
    for (const r of rows) if (r.at && r.score !== null) byDay.set(spDay(r.at), r.score);
    return [...byDay].map(([date, site]) => ({ date, site }));
  },

  async timeline(days) {
    const since = new Date(Date.now() - days * DAY);
    const runs = await db
      .select()
      .from(schema.seoRuns)
      .where(and(eq(schema.seoRuns.status, "completa"), gte(schema.seoRuns.finishedAt, since)))
      .orderBy(desc(schema.seoRuns.finishedAt))
      .limit(40);
    const edits = await db
      .select()
      .from(schema.auditLog)
      .where(
        and(
          gte(schema.auditLog.createdAt, since),
          or(like(schema.auditLog.path, "/api/admin/seo/%"), like(schema.auditLog.path, "/api/admin/conteudo/%"), like(schema.auditLog.path, "/api/admin/redirecionamentos%")),
        ),
      )
      .orderBy(desc(schema.auditLog.createdAt))
      .limit(40);
    return [
      ...runs.map((r) => ({ at: (r.finishedAt ?? r.startedAt).toISOString(), text: `Auditoria ${r.kind === "diaria" ? "diária" : "manual"} completa: nota ${r.siteSeoScore ?? "-"}, ${r.pagesAudited} páginas` })),
      ...edits.map((e) => ({ at: e.createdAt.toISOString(), text: `${e.userName ?? "Alguém"}: ${e.summary}` })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 40);
  },

  async visits(path, days) {
    const [row] = await db
      .select({ n: count() })
      .from(schema.pageViews)
      .where(and(inArray(schema.pageViews.path, [path]), gte(schema.pageViews.createdAt, new Date(Date.now() - days * DAY))));
    return row?.n ?? 0;
  },

  async savePageDoc(key, doc, userId) {
    const where = and(eq(schema.contentDocs.collection, "seo"), eq(schema.contentDocs.key, key));
    if (Object.keys(doc).length === 0) {
      await db.delete(schema.contentDocs).where(where);
      return;
    }
    const values = { collection: "seo", key, data: doc, deleted: false, updatedBy: userId, updatedAt: new Date() };
    await db
      .insert(schema.contentDocs)
      .values(values)
      .onConflictDoUpdate({
        target: [schema.contentDocs.collection, schema.contentDocs.key],
        set: { data: values.data, deleted: false, updatedBy: userId, updatedAt: values.updatedAt },
      });
  },

  async saveRules(rules, userId) {
    await db
      .insert(schema.appSettings)
      .values({ key: RULES_KEY, value: rules, updatedBy: userId, updatedAt: new Date() })
      .onConflictDoUpdate({ target: schema.appSettings.key, set: { value: rules, updatedBy: userId, updatedAt: new Date() } });
  },

  async resetRules() {
    await db.delete(schema.appSettings).where(eq(schema.appSettings.key, RULES_KEY));
  },

  audit: (opts) => auditSite(opts, { store: dbStore }),
  tips: { today: dailyTips },

  duel: {
    competitors: () => dbDuelStore.competitors(),
    async save(items) {
      // troca a lista inteira (no máximo 2)
      await db.delete(schema.seoCompetitors);
      if (items.length) await db.insert(schema.seoCompetitors).values(items.map((i) => ({ name: i.name, url: i.url })));
    },
    latest: () => dbDuelStore.latest(),
    async running() {
      const row = await dbDuelStore.findResumable(new Date(Date.now() - 30 * 60_000));
      if (!row) return null;
      const sites = Object.values(row.state.sites ?? {});
      return { done: sites.reduce((a, s) => a + s.pages.length, 0), total: sites.reduce((a, s) => a + (s.paths.length || 40), 0) };
    },
    async run(opts) {
      const docs = await db.select().from(schema.contentDocs);
      const jobs = (await db.select().from(schema.jobs).where(isNull(schema.jobs.deletedAt))).filter(isJobOpen);
      return runDuel(opts, {
        store: dbDuelStore,
        audit: dbStore,
        ourSitemap: async () => {
          const entries = buildAllEntries(docs, jobs);
          return { total: entries.length, blogLastmods: entries.filter((e) => e.path.startsWith("/blog/") && e.lastmod).map((e) => e.lastmod!) };
        },
      });
    },
  },
  // fechou a auditoria diária: já escolhe as dicas do dia com os problemas abertos
  onAuditClosed: async () => void (await dailyTips()),

  async setImageAlt(slug, src, alt, userId) {
    const code = (content as { products: { slug: string; images: string[]; imageAlts?: Record<string, string> }[] }).products.find((p) => p.slug === slug);
    const [row] = await db.select().from(schema.contentDocs).where(and(eq(schema.contentDocs.collection, "produto"), eq(schema.contentDocs.key, slug)));
    const doc = (row?.data ?? {}) as { images?: string[]; imageAlts?: Record<string, string> };
    if (!code && !row) throw new Error("Produto não encontrado");
    const path = src.replace(/^https?:\/\/[^/]+/, "").split("?")[0]!;
    const key = (doc.images ?? code?.images ?? []).find((k) => k === path || toWebp(k) === path);
    if (!key) throw new Error("Foto não encontrada neste produto");
    const imageAlts = { ...code?.imageAlts, ...doc.imageAlts, [key]: alt };
    const data = { ...doc, imageAlts };
    await db
      .insert(schema.contentDocs)
      .values({ collection: "produto", key: slug, data, deleted: false, updatedBy: userId, updatedAt: new Date() })
      .onConflictDoUpdate({ target: [schema.contentDocs.collection, schema.contentDocs.key], set: { data, updatedBy: userId, updatedAt: new Date() } });
  },

  links: {
    async latest() {
      const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, LINKS_KEY)).limit(1);
      return (row?.value as LinkReport | undefined) ?? null;
    },
    async verify() {
      const run = await dbStore.latestCompleteRun();
      if (!run) throw new Error("Rode a auditoria completa primeiro");
      const foundOn = new Map<string, string[]>();
      for (const r of await dbStore.loadRunPages(run.id)) {
        for (const t of r.facts?.internalLinks ?? []) {
          const list = foundOn.get(ORIGIN + t) ?? [];
          if (list.length < 20) list.push(r.path);
          foundOn.set(ORIGIN + t, list);
        }
      }
      const urls = [...foundOn.keys()];
      const results = await checkLinks(urls, foundOn);
      const report: LinkReport = {
        at: new Date().toISOString(),
        checked: results.length,
        truncated: urls.length > results.length,
        broken: results.filter((r) => r.broken),
        redirected: results.filter((r) => !r.broken && r.chain.length > 0),
      };
      await db
        .insert(schema.appSettings)
        .values({ key: LINKS_KEY, value: report, updatedAt: new Date() })
        .onConflictDoUpdate({ target: schema.appSettings.key, set: { value: report, updatedAt: new Date() } });
      return report;
    },
  },

  importOld: {
    async test(paths) {
      return testOldUrls(paths, { known: (await dbStore.loadPages()).map((p) => p.path) });
    },
    create: (items, userId) => createRedirects(items, userId),
  },
};
