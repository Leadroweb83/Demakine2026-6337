/**
 * O que o auditor espera de dados estruturados e hreflang tem de bater com o que o site realmente publica,
 * senão a primeira auditoria nasce toda vermelha. Lê o HTML pré-renderizado (dist/), como os testes de imagens.
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { extractFacts } from "../../src/api/lib/seo/html";
import { expectedHreflangs, expectedSchema, listSitePages } from "../../src/api/lib/seo/pages";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : f.endsWith(".html") ? [join(dir, f)] : []));
const pathOf = (file: string) => {
  const p = "/" + file.slice("dist/".length).replace(/\.html$/, "");
  return p === "/index" ? "/" : p.replace(/\/index$/, "") || "/";
};

describe("expectativas do auditor x HTML publicado", () => {
  const pages = listSitePages([], []).filter((p) => p.inSitemap);
  test("cada página do sitemap tem os dados estruturados e o hreflang esperados", () => {
    const wrong: string[] = [];
    for (const page of pages) {
      const file = page.path === "/" ? "dist/index.html" : `dist${page.path}.html`;
      const facts = extractFacts(readFileSync(file, "utf8"), `https://www.demakine.com.br${page.path}`);
      const missingSchema = expectedSchema(page.path).filter((t) => !facts.jsonLdTypes.includes(t));
      if (missingSchema.length) wrong.push(`${page.path}: faltam ${missingSchema.join(", ")}`);
      const langs = new Set(facts.hreflangs.map((h) => h.lang));
      const missingLang = expectedHreflangs(page.path).filter((l) => !langs.has(l));
      if (missingLang.length) wrong.push(`${page.path}: hreflang sem ${missingLang.join(", ")}`);
    }
    expect(wrong).toEqual([]);
  });

  test("o HTML publicado de cada página do sitemap existe", () => {
    expect(walk("dist").length).toBeGreaterThanOrEqual(pages.length);
    for (const p of pages.slice(0, 5)) expect(pathOf(p.path === "/" ? "dist/index.html" : `dist${p.path}.html`)).toBe(p.path);
  });
});
