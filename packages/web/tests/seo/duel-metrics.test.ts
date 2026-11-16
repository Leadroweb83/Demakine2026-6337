import { describe, expect, test } from "bun:test";
import { compare, scoreboard, siteMetrics, type SiteMetrics } from "../../src/api/lib/seo/duel-metrics";
import { perfectFacts } from "./helpers/facts";

const page = (over = {}, path = "/p") => ({ path, facts: perfectFacts(over) });
const TODAY = "2026-11-12";
const noSitemap = { total: 0, blogLastmods: [] };

describe("siteMetrics: notas por item, de 0 a 100", () => {
  test("título entre 30 e 60 vale 100; curto e longo caem aos poucos; sem título vale 0", () => {
    const s = (title: string | null) => siteMetrics([page({ title })], noSitemap, TODAY).scores.titulo;
    expect(s("x".repeat(45))).toBe(100);
    expect(s("x".repeat(15))).toBe(50);
    expect(s("x".repeat(90))).toBe(50);
    expect(s(null)).toBe(0);
  });

  test("descrição segue a faixa de 70 a 155", () => {
    expect(siteMetrics([page({ description: "x".repeat(100) })], noSitemap, TODAY).scores.descricao).toBe(100);
    expect(siteMetrics([page({ description: null })], noSitemap, TODAY).scores.descricao).toBe(0);
  });

  test("H1: um vale 100, nenhum 0, mais de um 50", () => {
    const s = (h1s: string[]) => siteMetrics([page({ h1s })], noSitemap, TODAY).scores.h1;
    expect([s(["A"]), s([]), s(["A", "B"])]).toEqual([100, 0, 50]);
  });

  test("conteúdo: 300 palavras ou mais vale 100", () => {
    expect(siteMetrics([page({ words: 150 })], noSitemap, TODAY).scores.conteudo).toBe(50);
    expect(siteMetrics([page({ words: 900 })], noSitemap, TODAY).scores.conteudo).toBe(100);
  });

  test("imagens: fração com alt; página sem imagem não entra na média", () => {
    const imgs = [{ src: "https://x/a.webp", alt: "a" }, { src: "https://x/b.webp", alt: null }];
    expect(siteMetrics([page({ images: imgs })], noSitemap, TODAY).scores.imagens).toBe(50);
    expect(siteMetrics([page({ images: imgs }), page({ images: [] }, "/q")], noSitemap, TODAY).scores.imagens).toBe(50);
    expect(siteMetrics([page({ images: [] })], noSitemap, TODAY).scores.imagens).toBeUndefined();
  });

  test("dados estruturados contam tipos distintos (3 ou mais = 100); idiomas contam hreflang distintos", () => {
    expect(siteMetrics([page({ jsonLdTypes: ["A"] })], noSitemap, TODAY).scores.schema).toBe(33);
    expect(siteMetrics([page({ jsonLdTypes: ["A", "B", "C", "D"] })], noSitemap, TODAY).scores.schema).toBe(100);
    expect(siteMetrics([page({ hreflangs: [{ lang: "pt", href: "x" }] })], noSitemap, TODAY).scores.idiomas).toBe(33);
    expect(siteMetrics([page({ hreflangs: [{ lang: "pt", href: "x" }, { lang: "en", href: "x" }, { lang: "es", href: "x" }] })], noSitemap, TODAY).scores.idiomas).toBe(100);
  });

  test("compartilhamento: cada tag og vale um terço", () => {
    expect(siteMetrics([page({ og: { title: "t" } })], noSitemap, TODAY).scores.compartilhamento).toBe(33);
  });

  test("tamanho é o número de páginas do sitemap e blog conta posts dos últimos 90 dias", () => {
    const m = siteMetrics([page()], { total: 120, blogLastmods: ["2026-11-01", "2026-09-20", "2026-05-01", "2025-01-01"] }, TODAY);
    expect(m.scores.tamanho).toBe(120);
    expect(m.scores.blog).toBe(2);
    expect(m.pages).toBe(1);
  });

  test("média entre várias páginas", () => {
    const m = siteMetrics([page({ words: 300 }), page({ words: 0 }, "/q")], noSitemap, TODAY);
    expect(m.scores.conteudo).toBe(50);
    expect(m.samples).toBe(2);
  });

  test("página que pula uma métrica não entra na média dela, mas conta nas outras", () => {
    const nenhum = page({ hreflangs: [] }, "/so-pt");
    const m = siteMetrics([page({ hreflangs: [{ lang: "pt", href: "x" }, { lang: "en", href: "x" }, { lang: "es", href: "x" }] }), { ...nenhum, skip: ["idiomas" as const] }], noSitemap, TODAY);
    expect(m.scores.idiomas).toBe(100);
    expect(m.scores.titulo).toBe(100);
    expect(m.samples).toBe(2);
    expect(siteMetrics([{ ...nenhum, skip: ["idiomas" as const] }], noSitemap, TODAY).scores.idiomas).toBeUndefined();
  });

  test("zero páginas devolve amostra 0 e nenhuma nota (não zero)", () => {
    const m = siteMetrics([], { total: 0, blogLastmods: [] }, TODAY);
    expect(m.samples).toBe(0);
    expect(m.scores).toEqual({});
  });
});

const sm = (scores: SiteMetrics["scores"], samples = 5): SiteMetrics => ({ pages: samples, samples, scores });

describe("compare e scoreboard", () => {
  test("diferença de até 3 pontos é empate; acima, melhor ou pior conforme o lado", () => {
    const v = compare(sm({ titulo: 80, descricao: 60, h1: 50 }), sm({ titulo: 78, descricao: 80, h1: 20 }));
    const by = Object.fromEntries(v.map((x) => [x.metric, x]));
    expect(by.titulo).toMatchObject({ ours: 80, theirs: 78, diff: 2, result: "empate" });
    expect(by.descricao).toMatchObject({ diff: -20, result: "pior" });
    expect(by.h1).toMatchObject({ diff: 30, result: "melhor" });
  });

  test("métrica que só um lado tem sai da comparação, não vira zero", () => {
    const v = compare(sm({ titulo: 80, imagens: 90 }), sm({ titulo: 70 }));
    expect(v.map((x) => x.metric)).toEqual(["titulo"]);
  });

  test("tamanho e blog comparam por proporção (empate até 10%) e têm unidade própria", () => {
    const v = compare(sm({ tamanho: 105, blog: 4 }), sm({ tamanho: 100, blog: 10 }));
    const by = Object.fromEntries(v.map((x) => [x.metric, x]));
    expect(by.tamanho).toMatchObject({ result: "empate", unit: "paginas" });
    expect(by.blog).toMatchObject({ result: "pior", unit: "posts", diff: -6 });
  });

  test("lados sem páginas lidas não geram veredito", () => {
    expect(compare(sm({}, 0), sm({ titulo: 80 }))).toEqual([]);
  });

  test("placar", () => {
    const v = compare(sm({ titulo: 90, h1: 10, conteudo: 50 }), sm({ titulo: 50, h1: 90, conteudo: 51 }));
    expect(scoreboard(v)).toEqual({ better: 1, worse: 1, tie: 1 });
  });
});
