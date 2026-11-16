import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { getTableColumns } from "drizzle-orm";
import { seoFixBatches } from "../../src/api/database/schema";
import { currentAlt, normalizeOgValue } from "../../src/api/lib/seo/fix-store";

describe("tabela de lotes de correção", () => {
  test("colunas", () => {
    const cols = Object.keys(getTableColumns(seoFixBatches));
    for (const c of ["id", "createdAt", "userId", "metric", "status", "items"]) expect(cols).toContain(c);
  });

  test("a migração 0019 cria a tabela com RLS ligado e um índice único parcial para um lote aplicando por vez", () => {
    const sql = readFileSync(new URL("../../drizzle/0019_seo_correcoes.sql", import.meta.url), "utf8");
    expect(sql).toContain('CREATE TABLE "seo_fix_batches"');
    expect(sql).toContain('ALTER TABLE "seo_fix_batches" ENABLE ROW LEVEL SECURITY');
    expect(sql).toMatch(/CREATE UNIQUE INDEX "seo_fix_batches_one_running"[^;]*WHERE status = 'aplicando'/);
  });
});

describe("currentAlt", () => {
  test("o alt do documento do produto vale mais que o do código", () => {
    expect(currentAlt({ imageAlts: { "/img/a/1.webp": "Do painel" } }, { "/img/a/1.webp": "Do código" }, "/img/a/1.webp")).toBe("Do painel");
  });

  test("sem documento, vale o do código; sem nenhum, vazio", () => {
    expect(currentAlt(undefined, { "/img/a/1.webp": "Do código" }, "/img/a/1.webp")).toBe("Do código");
    expect(currentAlt({}, undefined, "/img/a/1.webp")).toBe("");
    expect(currentAlt({ imageAlts: { "/img/a/2.webp": "Outra" } }, {}, "/img/a/1.webp")).toBe("");
  });
});

describe("normalizeOgValue", () => {
  test("tira o domínio do próprio site e deixa o resto como está", () => {
    expect(normalizeOgValue("https://www.demakine.com.br/img/a.webp")).toBe("/img/a.webp");
    expect(normalizeOgValue("https://demakine.com.br/img/a.webp")).toBe("/img/a.webp");
    expect(normalizeOgValue("/img/a.webp")).toBe("/img/a.webp");
    expect(normalizeOgValue("https://cdn.outro.com/y.jpg")).toBe("https://cdn.outro.com/y.jpg");
    expect(normalizeOgValue("")).toBe("");
  });
});
