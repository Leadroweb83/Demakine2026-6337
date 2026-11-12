/**
 * Acesso ao banco do auditor de SEO (Drizzle + Postgres). Fica em arquivo separado de run-audit.ts: importar o banco
 * sem DATABASE_URL derruba o módulo, e os testes do auditor usam uma versão em memória (AuditStore).
 * Sem teste automático (não há banco nos testes): conferir com "Auditar agora" depois de aplicar a migração 0017.
 */
import { and, desc, eq, gte, isNull, lt, ne, or, sql } from "drizzle-orm";
import { db } from "../../database";
import * as schema from "../../database/schema";
import { isJobOpen } from "../jobs";
import type { Issue } from "./issues";
import { listSitePages } from "./pages";
import type { AuditStore, RunRow, StoredPage } from "./run-audit";
import { DEFAULT_RULES, validateRules } from "./rules";

export const RULES_KEY = "seo-rules";

const toRun = (r: typeof schema.seoRuns.$inferSelect): RunRow => ({
  id: r.id,
  startedAt: r.startedAt,
  finishedAt: r.finishedAt,
  kind: r.kind as RunRow["kind"],
  status: r.status as RunRow["status"],
  pagesTotal: r.pagesTotal,
  pagesAudited: r.pagesAudited,
  cursor: r.cursor,
  siteSeoScore: r.siteSeoScore,
  sectorScores: r.sectorScores as Record<string, number>,
  areaScores: r.areaScores as Record<string, number>,
  alerts: r.alerts as string[],
});

const toPage = (r: typeof schema.seoPageScores.$inferSelect): StoredPage => ({
  runId: r.runId,
  path: r.path,
  lang: r.lang as StoredPage["lang"],
  area: r.area,
  seoScore: r.seoScore,
  checks: r.checks as StoredPage["checks"],
  facts: r.facts as StoredPage["facts"],
  statusCode: r.statusCode,
  indexable: r.indexable,
  inlinks: r.inlinks,
});

const sameIssue = (i: Issue) => and(eq(schema.seoIssues.path, i.path), eq(schema.seoIssues.code, i.code), isNull(schema.seoIssues.resolvedAt));

export const dbStore: AuditStore = {
  async loadRules() {
    const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, RULES_KEY)).limit(1);
    const parsed = row ? validateRules(row.value) : null;
    return parsed?.ok ? parsed.rules : DEFAULT_RULES;
  },

  async loadPages() {
    const docs = await db.select().from(schema.contentDocs);
    const jobs = (await db.select().from(schema.jobs).where(isNull(schema.jobs.deletedAt))).filter(isJobOpen);
    return listSitePages(docs, jobs);
  },

  async abandonStale(olderThan) {
    await db
      .update(schema.seoRuns)
      .set({ status: "parcial", finishedAt: new Date() })
      .where(and(eq(schema.seoRuns.status, "em-andamento"), lt(schema.seoRuns.startedAt, olderThan)));
  },

  async findResumable(newerThan) {
    const [row] = await db
      .select()
      .from(schema.seoRuns)
      .where(and(eq(schema.seoRuns.status, "em-andamento"), gte(schema.seoRuns.startedAt, newerThan)))
      .orderBy(desc(schema.seoRuns.id))
      .limit(1);
    return row ? toRun(row) : null;
  },

  async createRun(kind, pagesTotal, startedAt) {
    const [row] = await db.insert(schema.seoRuns).values({ kind, pagesTotal, startedAt }).returning();
    return toRun(row!);
  },

  async updateRun(id, patch) {
    await db.update(schema.seoRuns).set(patch).where(eq(schema.seoRuns.id, id));
  },

  async fetchedPaths(runId) {
    const rows = await db.select({ path: schema.seoPageScores.path }).from(schema.seoPageScores).where(eq(schema.seoPageScores.runId, runId));
    return new Set(rows.map((r) => r.path));
  },

  async savePages(rows) {
    // facts de cada página pesam alguns KB: grava em grupos pequenos
    for (let i = 0; i < rows.length; i += 20) {
      await db
        .insert(schema.seoPageScores)
        .values(rows.slice(i, i + 20))
        .onConflictDoUpdate({
          target: [schema.seoPageScores.runId, schema.seoPageScores.path],
          set: {
            lang: sql`excluded.lang`,
            area: sql`excluded.area`,
            seoScore: sql`excluded.seo_score`,
            checks: sql`excluded.checks`,
            facts: sql`excluded.facts`,
            statusCode: sql`excluded.status_code`,
            indexable: sql`excluded.indexable`,
            inlinks: sql`excluded.inlinks`,
          },
        });
    }
  },

  async loadRunPages(runId) {
    return (await db.select().from(schema.seoPageScores).where(eq(schema.seoPageScores.runId, runId))).map(toPage);
  },

  async latestCompleteRun(excludeId) {
    const where = excludeId === undefined ? eq(schema.seoRuns.status, "completa") : and(eq(schema.seoRuns.status, "completa"), ne(schema.seoRuns.id, excludeId));
    const [row] = await db.select().from(schema.seoRuns).where(where).orderBy(desc(schema.seoRuns.id)).limit(1);
    return row ? toRun(row) : null;
  },

  async openIssues() {
    const rows = await db.select().from(schema.seoIssues).where(isNull(schema.seoIssues.resolvedAt));
    return rows.map((r) => ({ path: r.path, code: r.code, severity: r.severity as Issue["severity"], message: r.message }));
  },

  async applyIssues(diff, at) {
    // resolvidos: fecha em grupos (path e code juntos)
    for (let i = 0; i < diff.resolved.length; i += 50) {
      const group = diff.resolved.slice(i, i + 50).map(sameIssue);
      await db.update(schema.seoIssues).set({ resolvedAt: at }).where(or(...group));
    }
    // os que continuam: marca que ainda estavam lá nesta execução (em grupos)...
    for (let i = 0; i < diff.kept.length; i += 50) {
      await db.update(schema.seoIssues).set({ lastSeen: at }).where(or(...diff.kept.slice(i, i + 50).map(sameIssue)));
    }
    // ...e atualiza texto e gravidade só dos que mudaram
    if (diff.kept.length > 0) {
      const before = new Map((await this.openIssues()).map((o) => [`${o.path}\u0000${o.code}`, o]));
      for (const k of diff.kept) {
        const o = before.get(`${k.path}\u0000${k.code}`);
        if (o && (o.message !== k.message || o.severity !== k.severity)) {
          await db.update(schema.seoIssues).set({ message: k.message, severity: k.severity }).where(sameIssue(k));
        }
      }
    }
    for (let i = 0; i < diff.opened.length; i += 50) {
      await db
        .insert(schema.seoIssues)
        .values(diff.opened.slice(i, i + 50).map((o) => ({ ...o, firstSeen: at, lastSeen: at })))
        .onConflictDoNothing();
    }
  },
};
