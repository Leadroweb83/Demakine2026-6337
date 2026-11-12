/** Acesso ao banco dos redirecionamentos para o importador de endereços antigos. Sem teste automático (não há banco nos testes). */
import { db } from "../../database";
import * as schema from "../../database/schema";
import type { RedirectStore } from "./import-old";

export const dbRedirectStore: RedirectStore = {
  async allFrom() {
    return new Set((await db.select({ from: schema.redirects.fromPath }).from(schema.redirects)).map((r) => r.from));
  },

  async insert(rows) {
    for (let i = 0; i < rows.length; i += 100) {
      await db
        .insert(schema.redirects)
        .values(rows.slice(i, i + 100).map((r) => ({ fromPath: r.from, toPath: r.to, permanent: true, note: r.note, createdBy: r.userId })))
        .onConflictDoNothing();
    }
  },
};
