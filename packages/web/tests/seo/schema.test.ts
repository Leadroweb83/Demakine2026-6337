import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { getTableColumns } from "drizzle-orm";
import { seoIssues, seoPageScores, seoRuns } from "../../src/api/database/schema";

describe("tabelas do auditor de SEO", () => {
  test("seoRuns guarda a execução, o cursor e os alertas", () => {
    const cols = Object.keys(getTableColumns(seoRuns));
    for (const c of ["id", "startedAt", "finishedAt", "kind", "status", "pagesTotal", "pagesAudited", "cursor", "siteSeoScore", "sectorScores", "areaScores", "alerts"]) {
      expect(cols).toContain(c);
    }
  });

  test("seoPageScores guarda a nota e os checks de cada página por execução", () => {
    const cols = Object.keys(getTableColumns(seoPageScores));
    for (const c of ["runId", "path", "lang", "area", "seoScore", "checks", "facts", "statusCode", "indexable", "inlinks"]) {
      expect(cols).toContain(c);
    }
  });

  test("seoIssues guarda abertura e resolução do problema", () => {
    const cols = Object.keys(getTableColumns(seoIssues));
    for (const c of ["id", "path", "code", "severity", "message", "firstSeen", "lastSeen", "resolvedAt"]) {
      expect(cols).toContain(c);
    }
  });

  test("a migração 0017 cria as três tabelas com RLS ligado e índice único parcial dos problemas abertos", () => {
    const sql = readFileSync(new URL("../../drizzle/0017_seo_auditor.sql", import.meta.url), "utf8");
    for (const t of ["seo_runs", "seo_page_scores", "seo_issues"]) {
      expect(sql).toContain(`CREATE TABLE "${t}"`);
      expect(sql).toContain(`ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toMatch(/CREATE UNIQUE INDEX "seo_issues_open_uniq" ON "seo_issues"[^;]*\("path","code"\) WHERE [^;]*"resolved_at" is null/);
    expect(sql).toMatch(/CREATE INDEX "seo_page_scores_path_run_idx" ON "seo_page_scores"[^;]*\("path","run_id"\)/);
  });
});
