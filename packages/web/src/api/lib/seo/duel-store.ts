/** Acesso ao banco do duelo (Drizzle). Sem teste automático (não há banco nos testes): conferir com "Duelar agora" depois da migração 0018. */
import { and, asc, desc, eq, gte, isNotNull, lt } from "drizzle-orm";
import { db } from "../../database";
import * as schema from "../../database/schema";
import type { DuelResult, DuelRow, DuelState, DuelStore } from "./run-duel";

const toRow = (r: typeof schema.seoDuels.$inferSelect): DuelRow => ({ id: r.id, startedAt: r.startedAt, status: r.status as DuelRow["status"], state: r.state as DuelState });

export const dbDuelStore: DuelStore = {
  async competitors() {
    return db.select({ id: schema.seoCompetitors.id, name: schema.seoCompetitors.name, url: schema.seoCompetitors.url }).from(schema.seoCompetitors).where(eq(schema.seoCompetitors.active, true)).orderBy(asc(schema.seoCompetitors.id));
  },
  async abandonStale(olderThan) {
    await db.update(schema.seoDuels).set({ status: "completa", finishedAt: new Date() }).where(and(eq(schema.seoDuels.status, "em-andamento"), lt(schema.seoDuels.startedAt, olderThan)));
  },
  async findResumable(newerThan) {
    const [row] = await db.select().from(schema.seoDuels).where(and(eq(schema.seoDuels.status, "em-andamento"), gte(schema.seoDuels.startedAt, newerThan))).orderBy(desc(schema.seoDuels.id)).limit(1);
    return row ? toRow(row) : null;
  },
  async create(startedAt) {
    const [row] = await db.insert(schema.seoDuels).values({ startedAt, state: { sites: {} } }).returning();
    return toRow(row!);
  },
  async saveState(id, state) {
    await db.update(schema.seoDuels).set({ state }).where(eq(schema.seoDuels.id, id));
  },
  async finish(id, result: DuelResult, at) {
    await db.update(schema.seoDuels).set({ status: "completa", finishedAt: at, result }).where(eq(schema.seoDuels.id, id));
    // guarda os 12 duelos mais recentes
    const old = await db.select({ id: schema.seoDuels.id }).from(schema.seoDuels).orderBy(desc(schema.seoDuels.id)).offset(12);
    for (const o of old) await db.delete(schema.seoDuels).where(eq(schema.seoDuels.id, o.id));
  },
  async latest() {
    const [row] = await db.select({ result: schema.seoDuels.result }).from(schema.seoDuels).where(isNotNull(schema.seoDuels.result)).orderBy(desc(schema.seoDuels.id)).limit(1);
    return (row?.result as DuelResult | undefined) ?? null;
  },
};
