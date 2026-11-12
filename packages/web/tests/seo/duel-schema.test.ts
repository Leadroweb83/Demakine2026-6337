import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { getTableColumns } from "drizzle-orm";
import { seoCompetitors, seoDuels } from "../../src/api/database/schema";

describe("tabelas do Guerra é Guerra", () => {
  test("concorrentes", () => {
    const cols = Object.keys(getTableColumns(seoCompetitors));
    for (const c of ["id", "name", "url", "active", "createdAt"]) expect(cols).toContain(c);
  });

  test("duelos", () => {
    const cols = Object.keys(getTableColumns(seoDuels));
    for (const c of ["id", "startedAt", "finishedAt", "status", "state", "result"]) expect(cols).toContain(c);
  });

  test("a migração 0018 cria as duas tabelas com RLS ligado", () => {
    const sql = readFileSync(new URL("../../drizzle/0018_seo_duelo.sql", import.meta.url), "utf8");
    for (const t of ["seo_competitors", "seo_duels"]) {
      expect(sql).toContain(`CREATE TABLE "${t}"`);
      expect(sql).toContain(`ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY`);
    }
  });
});
