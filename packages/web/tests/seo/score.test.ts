import { describe, expect, test } from "bun:test";
import { DEFAULT_RULES, type SeoItem, type SeoRules } from "../../src/api/lib/seo/rules";
import type { PageFacts } from "../../src/api/lib/seo/html";
import { scorePage, scoreSite, type PageContext, type PageScore } from "../../src/api/lib/seo/score";

const text = (n: number) => "a".repeat(n);

const perfectFacts = (): PageFacts => ({
  title: text(45),
  description: text(120),
  h1s: ["Um título principal"],
  h2Count: 3,
  canonical: "https://www.demakine.com.br/esteiras-transportadoras",
  robots: "index, follow",
  hreflangs: [
    { lang: "pt-BR", href: "x" }, { lang: "en", href: "x" }, { lang: "es", href: "x" }, { lang: "x-default", href: "x" },
  ],
  og: { title: "t", description: "d", image: "https://www.demakine.com.br/og.jpg" },
  images: Array.from({ length: 5 }, (_, i) => ({ src: `https://www.demakine.com.br/i${i}.webp`, alt: `Foto ${i}` })),
  internalLinks: ["/a", "/b", "/c"],
  jsonLdTypes: ["Product", "BreadcrumbList"],
  jsonLd: [{ "@type": "Product" }, { "@type": "BreadcrumbList" }],
  words: 200,
  htmlLang: "pt-BR",
});

const perfectCtx = (): PageContext => ({
  path: "/esteiras-transportadoras",
  area: "categorias",
  lang: "pt",
  statusCode: 200,
  inlinks: 3,
  isCommercial: false,
  duplicateTitle: false,
  duplicateDescription: false,
  expectedSchema: ["Product"],
  expectedHreflangs: ["pt-BR", "en", "es", "x-default"],
});

const score = (f: Partial<PageFacts> = {}, c: Partial<PageContext> = {}, rules: SeoRules = DEFAULT_RULES, speed = false) =>
  scorePage({ ...perfectFacts(), ...f }, { ...perfectCtx(), ...c }, rules, speed);
const check = (s: PageScore, item: SeoItem) => s.checks.find((c) => c.item === item)!;

describe("scorePage", () => {
  test("página perfeita dá 100, todos os itens ok e todos os setores 100", () => {
    const s = score();
    expect(s.seo).toBe(100);
    expect(s.checks.every((c) => c.ok)).toBe(true);
    expect(Object.values(s.sectors).every((v) => v === 100)).toBe(true);
    expect(s.checks.find((c) => c.item === "velocidade")).toBeUndefined();
  });

  test("sem título perde os 15 pontos já escalados e a mensagem cita o título", () => {
    const s = score({ title: null });
    const c = check(s, "titulo");
    expect(c.points).toBe(0);
    expect(c.max).toBeCloseTo(15 * (100 / 95), 9);
    expect(c.ok).toBe(false);
    expect(c.message.toLowerCase()).toContain("título");
    expect(c.fix.length).toBeGreaterThan(10);
    expect(s.seo).toBe(84);
  });

  test("título de 70 caracteres perde pontos parciais e não zera", () => {
    const c = check(score({ title: text(70) }), "titulo");
    expect(c.points).toBeGreaterThan(0);
    expect(c.points).toBeLessThan(c.max);
    expect(c.ok).toBe(false);
  });

  test("título curto demais perde pontos parciais", () => {
    const c = check(score({ title: text(15) }), "titulo");
    expect(c.points).toBeCloseTo(c.max * 0.5, 9);
  });

  test("título ou descrição iguais aos de outra página perdem pontos", () => {
    const t = check(score({}, { duplicateTitle: true }), "titulo");
    expect(t.points).toBeLessThan(t.max);
    expect(t.message.toLowerCase()).toContain("outra página");
    const d = check(score({}, { duplicateDescription: true }), "descricao");
    expect(d.points).toBeLessThan(d.max);
  });

  test("sem descrição zera o item", () => {
    expect(check(score({ description: null }), "descricao").points).toBe(0);
  });

  test("H1: ausente zera, H1 vazio vale como ausente, mais de um perde metade", () => {
    expect(check(score({ h1s: [] }), "h1").points).toBe(0);
    expect(check(score({ h1s: [""] }), "h1").points).toBe(0);
    const two = check(score({ h1s: ["A", "B"] }), "h1");
    expect(two.points).toBeCloseTo(two.max / 2, 9);
  });

  test("resposta 404 zera a indexação, o item não fica ok e os demais não são avaliados", () => {
    const s = score({}, { statusCode: 404 });
    const i = check(s, "indexacao");
    expect(i.points).toBe(0);
    expect(i.ok).toBe(false);
    expect(i.message).toContain("404");
    expect(s.seo).toBe(0);
    expect(s.checks.filter((c) => c.item !== "indexacao").every((c) => c.skipped === true)).toBe(true);
  });

  test("noindex zera a indexação, mas é esperado em página técnica", () => {
    expect(check(score({ robots: "noindex, follow" }), "indexacao").points).toBe(0);
    const t = check(score({ robots: "noindex, follow" }, { technical: true }), "indexacao");
    expect(t.ok).toBe(true);
    expect(t.points).toBe(t.max);
  });

  test("canonical apontando para outra página perde pontos", () => {
    const c = check(score({ canonical: "https://www.demakine.com.br/outra" }), "indexacao");
    expect(c.points).toBeGreaterThan(0);
    expect(c.points).toBeLessThan(c.max);
  });

  test("imagens: 4 de 5 com alt dá 80% dos pontos do item", () => {
    const images = perfectFacts().images.map((i, n) => (n === 0 ? { ...i, alt: null } : i));
    const c = check(score({ images }), "imagens");
    expect(c.points).toBeCloseTo(c.max * 0.8, 9);
    expect(c.ok).toBe(false);
  });

  test("alt vazio conta como imagem sem descrição, e imagem embutida (data:) não conta", () => {
    const images = [{ src: "https://x/a.webp", alt: "" }, { src: "data:image/gif;base64,R0lG", alt: null }];
    expect(check(score({ images }), "imagens").points).toBe(0);
    expect(check(score({ images: [{ src: "data:image/gif;base64,R0lG", alt: null }] }), "imagens").ok).toBe(true);
  });

  test("página comercial com 120 palavras perde pontos de conteúdo; produto não é cobrado por palavras", () => {
    const comercial = check(score({ words: 120 }, { isCommercial: true }), "conteudo");
    expect(comercial.points).toBeCloseTo(comercial.max * (120 / 300), 9);
    const produto = check(score({ words: 120 }, { isCommercial: false }), "conteudo");
    expect(produto.points).toBe(produto.max);
  });

  test("links: poucos recebidos ou enviados perdem pontos proporcionais", () => {
    const c = check(score({ internalLinks: ["/a"] }, { inlinks: 0 }), "links");
    expect(c.points).toBeCloseTo(c.max * 0.5 * (1 / 3), 9);
  });

  test("dados estruturados: falta o tipo esperado", () => {
    const c = check(score({ jsonLdTypes: ["BreadcrumbList"] }, { expectedSchema: ["Product", "FAQPage"] }), "schema");
    expect(c.points).toBe(0);
    expect(c.message).toContain("Product");
  });

  test("compartilhamento: cada tag og vale um terço", () => {
    const c = check(score({ og: { title: "t" } }), "compartilhamento");
    expect(c.points).toBeCloseTo(c.max / 3, 9);
  });

  test("idiomas: hreflang faltando perde pontos", () => {
    const c = check(score({ hreflangs: [{ lang: "pt-BR", href: "x" }] }), "idiomas");
    expect(c.points).toBeLessThan(c.max);
    expect(c.points).toBeGreaterThan(0);
  });

  test("velocidade medida entra com o peso original e usa a nota informada", () => {
    const s = score({}, { speedScore: 50 }, DEFAULT_RULES, true);
    const v = check(s, "velocidade");
    expect(v.max).toBe(5);
    expect(v.points).toBe(2.5);
    expect(s.seo).toBe(98);
  });

  test("setores resumem os itens e o conteúdo inclui o H1", () => {
    const s = score({ title: null, h1s: [] });
    expect(s.sectors["titulo-descricao"]).toBe(40);
    expect(s.sectors.conteudo).toBe(50);
    expect(s.sectors.imagens).toBe(100);
  });

  test("HTML sem nada não derruba: nota baixa, sem exceção", () => {
    const empty: PageFacts = {
      title: null, description: null, h1s: [], h2Count: 0, canonical: null, robots: null, hreflangs: [], og: {},
      images: [], internalLinks: [], jsonLdTypes: [], jsonLd: [], words: 0, htmlLang: null,
    };
    const s = scorePage(empty, perfectCtx(), DEFAULT_RULES, false);
    expect(s.seo).toBeLessThan(40);
    expect(s.seo).toBeGreaterThanOrEqual(0);
  });
});

const page = (path: string, seo: number, extra: Partial<Parameters<typeof scoreSite>[0][number]> = {}) => ({
  path,
  area: "produtos" as const,
  lang: "pt" as const,
  score: { seo, checks: [], sectors: { conteudo: seo, imagens: seo, links: seo, schema: seo, idiomas: seo, indexacao: seo, "titulo-descricao": seo, compartilhamento: seo } },
  indexable: true,
  hiddenByPanel: false,
  ...extra,
});
const OK = { sitemapValid: true, robotsBlocksSite: false, brokenInternalLinks: 0 };

describe("scoreSite", () => {
  test("média simples de páginas comuns", () => {
    expect(scoreSite([page("/a", 100), page("/b", 50)], DEFAULT_RULES, OK).site).toBe(75);
  });

  test("páginas prioritárias pesam 3 vezes mais, inclusive as versões em outro idioma", () => {
    const r = scoreSite([page("/esteiras-transportadoras", 100), page("/a-empresa", 0)], DEFAULT_RULES, OK);
    expect(r.site).toBe(75);
    const prod = scoreSite([page("/produtos/x", 100), page("/a-empresa", 0)], DEFAULT_RULES, OK);
    expect(prod.site).toBe(75);
  });

  test("página oculta pelo painel sai da média", () => {
    const r = scoreSite([page("/a", 100), page("/b", 0, { hiddenByPanel: true })], DEFAULT_RULES, OK);
    expect(r.site).toBe(100);
  });

  test("versão em inglês pesa 25% de uma em português", () => {
    const r = scoreSite([page("/a", 100), page("/en/a", 0, { lang: "en" })], DEFAULT_RULES, OK);
    expect(r.site).toBe(80);
  });

  test("links internos quebrados reduzem a nota, com penalidade máxima de 10 pontos", () => {
    const base = scoreSite([page("/a", 100)], DEFAULT_RULES, OK).site;
    expect(scoreSite([page("/a", 100)], DEFAULT_RULES, { ...OK, brokenInternalLinks: 5 }).site).toBeLessThan(base);
    expect(scoreSite([page("/a", 100)], DEFAULT_RULES, { ...OK, brokenInternalLinks: 500 }).site).toBe(90);
  });

  test("sitemap inválido e robots que bloqueia o site derrubam a nota, sem passar de 0", () => {
    expect(scoreSite([page("/a", 100)], DEFAULT_RULES, { ...OK, sitemapValid: false }).site).toBe(95);
    expect(scoreSite([page("/a", 40)], DEFAULT_RULES, { ...OK, robotsBlocksSite: true }).site).toBe(0);
  });

  test("por área e por setor", () => {
    const r = scoreSite(
      [page("/a", 100), page("/b", 50, { area: "blog" }), page("/c", 0, { area: "blog" })],
      DEFAULT_RULES,
      OK,
    );
    expect(r.byArea.produtos).toBe(100);
    expect(r.byArea.blog).toBe(25);
    expect(r.byArea.cases).toBeUndefined();
    expect(r.bySector.links).toBe(50);
  });

  test("sem páginas devolve nota 0 sem lançar", () => {
    const r = scoreSite([], DEFAULT_RULES, OK);
    expect(r.site).toBe(0);
    expect(r.bySector.conteudo).toBe(0);
  });
});

describe("códigos dos problemas", () => {
  test("cada item usa o próprio nome como código, e a indexação diferencia o motivo", () => {
    expect(check(score({ title: null }), "titulo").code).toBe("titulo");
    expect(check(score({}, { statusCode: 404 }), "indexacao").code).toBe("status");
    expect(check(score({ robots: "noindex" }), "indexacao").code).toBe("noindex");
    expect(check(score({ canonical: null }), "indexacao").code).toBe("canonical-ausente");
    expect(check(score({ canonical: "https://www.demakine.com.br/outra" }), "indexacao").code).toBe("canonical-outro");
    expect(check(score(), "indexacao").code).toBe("indexacao");
  });
});
