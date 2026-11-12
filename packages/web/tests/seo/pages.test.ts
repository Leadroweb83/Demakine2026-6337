import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import content from "../../src/web/data/content.json";
import { buildEntries, buildSitemap } from "../../src/api/lib/sitemap";
import { classify, expectedHreflangs, expectedSchema, isCommercialPath, isTechnical, listSitePages, prerenderPaths } from "../../src/api/lib/seo/pages";

const before = readFileSync(new URL("./fixtures/sitemap-antes.xml", import.meta.url), "utf8");
const productSlug = (content as { products: { slug: string; name: string }[] }).products[0]!;
const doc = (collection: string, key: string, data: unknown, deleted = false) => ({ collection, key, data, deleted, updatedAt: new Date("2026-11-11") });

describe("classify", () => {
  test("áreas e idiomas", () => {
    expect(classify("/produtos/rosca-transportadora")).toEqual({ area: "produtos", lang: "pt", technical: false });
    expect(classify("/esteiras-transportadoras")).toMatchObject({ area: "categorias", lang: "pt" });
    expect(classify("/produtos")).toMatchObject({ area: "categorias" });
    expect(classify("/esteira-transportadora-preco")).toMatchObject({ area: "comerciais" });
    expect(classify("/en/blog/x")).toMatchObject({ area: "blog", lang: "en" });
    expect(classify("/es/cases/y")).toMatchObject({ area: "cases", lang: "es" });
    expect(classify("/en/export")).toMatchObject({ area: "exportacao", lang: "en" });
    expect(classify("/es/exportacion")).toMatchObject({ area: "exportacao", lang: "es" });
    expect(classify("/segmentos/fertilizantes-e-insumos")).toMatchObject({ area: "segmentos" });
    expect(classify("/vagas/operador")).toMatchObject({ area: "vagas", lang: "pt" });
    expect(classify("/a-empresa")).toMatchObject({ area: "institucional" });
    expect(classify("/")).toMatchObject({ area: "institucional", lang: "pt" });
    expect(classify("/en")).toMatchObject({ area: "institucional", lang: "en" });
  });

  test("páginas técnicas", () => {
    expect(classify("/obrigado")).toEqual({ area: "tecnica", lang: "pt", technical: true });
    expect(classify("/en/obrigado")).toMatchObject({ area: "tecnica", lang: "en", technical: true });
    for (const p of ["/obrigado", "/en/obrigado", "/es/obrigado", "/loja", "/admin", "/404"]) expect(isTechnical(p), p).toBe(true);
    for (const p of ["/", "/produtos", "/en/produtos/x", "/obrigadoo", "/blog/loja"]) expect(isTechnical(p), p).toBe(false);
  });
});

describe("sitemap depois do refactor", () => {
  test("a saída é idêntica à de antes", () => {
    expect(buildSitemap([], [])).toBe(before);
  });

  test("buildEntries expande todas as versões de idioma: uma entrada por <url>", () => {
    const urls = before.split("<url>").length - 1;
    expect(buildEntries([], []).length).toBe(urls);
    expect(buildEntries([], []).map((e) => e.path)).toContain("/en/produtos");
  });

  test("página oculta pelo painel sai do sitemap, e as outras versões deixam de apontar para ela", () => {
    const hidden = { [`produtos-${productSlug.slug}`]: { noindex: true } };
    const xml = buildSitemap([], [], hidden);
    expect(xml).not.toContain(`<loc>https://www.demakine.com.br/produtos/${productSlug.slug}</loc>`);
    expect(xml).toContain(`<loc>https://www.demakine.com.br/en/produtos/${productSlug.slug}</loc>`);
    const enRow = xml.split("<url>").find((b) => b.includes(`<loc>https://www.demakine.com.br/en/produtos/${productSlug.slug}</loc>`))!;
    expect(enRow).not.toContain(`href="https://www.demakine.com.br/produtos/${productSlug.slug}"`);
    expect(buildEntries([], [], hidden).some((e) => e.path === `/produtos/${productSlug.slug}`)).toBe(false);
  });

  test("regra salva no painel (coleção seo dentro de docs) também tira do sitemap", () => {
    const xml = buildSitemap([doc("seo", `produtos-${productSlug.slug}`, { noindex: true })], []);
    expect(xml).not.toContain(`<loc>https://www.demakine.com.br/produtos/${productSlug.slug}</loc>`);
  });

  test("noSitemap tira do sitemap sem esconder do Google", () => {
    const xml = buildSitemap([], [], { [`produtos-${productSlug.slug}`]: { noSitemap: true } });
    expect(xml).not.toContain(`<loc>https://www.demakine.com.br/produtos/${productSlug.slug}</loc>`);
  });
});

describe("listSitePages", () => {
  test("cobre todas as páginas do sitemap, com os três idiomas", () => {
    const pages = listSitePages([], [], {});
    const inSitemap = pages.filter((p) => p.inSitemap);
    expect(inSitemap.length).toBe(before.split("<url>").length - 1);
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    const prod = pages.find((p) => p.path === `/produtos/${productSlug.slug}`)!;
    expect(prod).toMatchObject({ lang: "pt", area: "produtos", inSitemap: true, hiddenByPanel: false, technical: false });
    expect(prod.label).toBe(productSlug.name);
    expect(pages.find((p) => p.path === `/en/produtos/${productSlug.slug}`)?.label).toBe(`${productSlug.name} (EN)`);
    expect(pages.find((p) => p.path === "/")?.label).toBe("Home");
  });

  test("páginas técnicas aparecem fora do sitemap; /admin e a 404 não são listadas", () => {
    const pages = listSitePages([], [], {});
    for (const p of ["/obrigado", "/en/obrigado", "/es/obrigado", "/loja"]) {
      expect(pages.find((x) => x.path === p), p).toMatchObject({ technical: true, inSitemap: false, area: "tecnica" });
    }
    expect(pages.some((p) => p.path === "/admin" || p.path === "/404")).toBe(false);
  });

  test("página nova criada no painel aparece na hora, com as versões /en e /es", () => {
    const docs = [doc("produto", "produto-novo", { name: "Produto Novo", category: "esteiras-transportadoras" })];
    const pages = listSitePages(docs, [], {});
    for (const prefix of ["", "/en", "/es"]) {
      expect(pages.find((p) => p.path === `${prefix}/produtos/produto-novo`), prefix).toMatchObject({ area: "produtos", inSitemap: true });
    }
    expect(pages.find((p) => p.path === "/produtos/produto-novo")?.label).toBe("Produto Novo");
  });

  test("página ocultada pelo painel continua na lista, marcada, e fora do sitemap", () => {
    const key = `produtos-${productSlug.slug}`;
    const pages = listSitePages([], [], { [key]: { noindex: true } });
    const p = pages.find((x) => x.path === `/produtos/${productSlug.slug}`)!;
    expect(p).toMatchObject({ hiddenByPanel: true, inSitemap: false });
    expect(p.overrides.noindex).toBe(true);
    expect(buildEntries([], [], { [key]: { noindex: true } }).some((e) => e.path === p.path)).toBe(false);
  });

  test("vagas abertas entram, e as regras da coleção seo vêm dos documentos quando não são passadas", () => {
    const pages = listSitePages(
      [doc("seo", "a-empresa", { noindex: true })],
      [{ slug: "operador-de-maquinas", updatedAt: new Date("2026-11-01") }],
    );
    expect(pages.find((p) => p.path === "/vagas/operador-de-maquinas")).toMatchObject({ area: "vagas", lang: "pt" });
    expect(pages.find((p) => p.path === "/a-empresa")).toMatchObject({ hiddenByPanel: true });
  });

  test("produto apagado ou rascunho não aparece", () => {
    const docs = [doc("produto", "produto-velho", { name: "Velho", category: "x" }, true), doc("produto", "produto-rascunho", { name: "R", category: "x", draft: true })];
    const pages = listSitePages(docs, [], {});
    expect(pages.some((p) => p.path.endsWith("produto-velho") || p.path.endsWith("produto-rascunho"))).toBe(false);
  });
});

describe("prerenderPaths", () => {
  test("sem regras, são exatamente as páginas do sitemap", () => {
    const fromSitemap = [...before.matchAll(/<loc>https:\/\/www\.demakine\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
    expect(prerenderPaths([], []).sort()).toEqual(fromSitemap.sort());
  });

  test("página escondida pelo painel continua sendo pré-renderizada (para sair com noindex no HTML)", () => {
    const key = `produtos-${productSlug.slug}`;
    const paths = prerenderPaths([], [], { [key]: { noindex: true }, "a-empresa": { noSitemap: true } });
    expect(paths).toContain(`/produtos/${productSlug.slug}`);
    expect(paths).toContain("/a-empresa");
    expect(paths).not.toContain("/obrigado");
  });
});

describe("o que o auditor espera de cada página", () => {
  test("página comercial são as 10 de URL própria, não o catálogo", () => {
    expect(isCommercialPath("/esteira-transportadora-preco")).toBe(true);
    expect(isCommercialPath("/esteiras-transportadoras")).toBe(true);
    expect(isCommercialPath("/produtos")).toBe(false);
    expect(isCommercialPath("/produtos/x")).toBe(false);
    expect(isCommercialPath("/blog/x")).toBe(false);
  });

  test("dados estruturados esperados por área", () => {
    expect(expectedSchema("/")).toEqual(["Organization", "WebSite"]);
    expect(expectedSchema("/produtos/rosca-transportadora")).toEqual(["Product", "BreadcrumbList"]);
    expect(expectedSchema("/en/produtos/rosca-transportadora")).toEqual(["Product", "BreadcrumbList"]);
    expect(expectedSchema("/produtos")).toEqual(["ItemList", "BreadcrumbList"]);
    expect(expectedSchema("/esteiras-transportadoras")).toEqual(["CollectionPage", "BreadcrumbList"]);
    expect(expectedSchema("/esteira-transportadora-preco")).toEqual(["Service", "BreadcrumbList"]);
    expect(expectedSchema("/blog/x")).toEqual(["Article", "BreadcrumbList"]);
    expect(expectedSchema("/blog")).toEqual(["BreadcrumbList"]);
    expect(expectedSchema("/cases/x")).toEqual(["Article", "BreadcrumbList"]);
    expect(expectedSchema("/segmentos/x")).toEqual(["Service", "BreadcrumbList"]);
    expect(expectedSchema("/faq")).toEqual(["FAQPage", "BreadcrumbList"]);
    expect(expectedSchema("/contato")).toEqual(["ContactPage"]);
    expect(expectedSchema("/a-empresa")).toEqual(["AboutPage"]);
    expect(expectedSchema("/clientes")).toEqual(["BreadcrumbList"]);
    expect(expectedSchema("/en/export")).toEqual(["Organization"]);
    expect(expectedSchema("/obrigado")).toEqual([]);
  });

  test("idiomas esperados no hreflang", () => {
    const all = ["pt-BR", "en", "es", "x-default"];
    expect(expectedHreflangs("/produtos/x")).toEqual(all);
    expect(expectedHreflangs("/en/blog/x")).toEqual(all);
    expect(expectedHreflangs("/")).toEqual(all);
    expect(expectedHreflangs("/esteiras-transportadoras")).toEqual([]);
    expect(expectedHreflangs("/vagas/operador")).toEqual([]);
    expect(expectedHreflangs("/en/export")).toEqual(["es", "en", "x-default"]);
    expect(expectedHreflangs("/obrigado")).toEqual([]);
  });
});
