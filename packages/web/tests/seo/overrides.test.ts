import { describe, expect, test } from "bun:test";
import { applyOverrides, readOverrides, seoDocsFrom } from "../../src/web/lib/seo-overrides";

describe("readOverrides", () => {
  test("ignora valor de tipo errado", () => {
    expect(readOverrides({ noindex: "sim" })).toEqual({});
    expect(readOverrides({ title: 42, noSitemap: 1, author: {} })).toEqual({});
  });

  test("descarta canonical de outro domínio, aceita o do próprio e converte caminho", () => {
    expect(readOverrides({ canonical: "https://outro.com/x" })).toEqual({});
    expect(readOverrides({ canonical: "//outro.com/x" })).toEqual({});
    expect(readOverrides({ canonical: "https://demakine.com.br.evil.com/x" })).toEqual({});
    expect(readOverrides({ canonical: "https://www.demakine.com.br/a" }).canonical).toBe("https://www.demakine.com.br/a");
    expect(readOverrides({ canonical: "/a" }).canonical).toBe("https://www.demakine.com.br/a");
  });

  test("lê os campos válidos, tira espaços e ignora texto vazio", () => {
    const o = readOverrides({
      title: "  Meu título ", description: "", noindex: true, noSitemap: false, ogImage: "/img/og.jpg",
      shortAnswer: "Resposta curta.", author: "Equipe Demakine", reviewedAt: "2026-11-11", lixo: 1,
    });
    expect(o).toEqual({
      title: "Meu título", noindex: true, noSitemap: false, ogImage: "/img/og.jpg",
      shortAnswer: "Resposta curta.", author: "Equipe Demakine", reviewedAt: "2026-11-11",
    });
  });

  test("data de revisão fora do formato é ignorada", () => {
    expect(readOverrides({ reviewedAt: "ontem" })).toEqual({});
  });

  test("não lança com entrada estranha", () => {
    for (const v of [null, undefined, 3, "x", [], [1]]) expect(readOverrides(v)).toEqual({});
  });
});

describe("seoDocsFrom", () => {
  test("pega só a coleção seo, ignora apagados e lê as regras de cada documento", () => {
    const docs = [
      { collection: "seo", key: "produtos-x", data: { noindex: true }, deleted: false },
      { collection: "seo", key: "blog", data: { title: "B" }, deleted: true },
      { collection: "produto", key: "x", data: { noindex: true }, deleted: false },
    ];
    expect(seoDocsFrom(docs)).toEqual({ "produtos-x": { noindex: true } });
  });
});

describe("applyOverrides", () => {
  const base = { noindex: false, canonical: "https://www.demakine.com.br/a", ogImage: "https://www.demakine.com.br/og-image.jpg" };

  test("a regra do painel liga o noindex", () => {
    expect(applyOverrides(base, { noindex: true }).noindex).toBe(true);
  });

  test("o painel nunca tira o noindex de uma página técnica", () => {
    expect(applyOverrides({ ...base, noindex: true }, { noindex: false }).noindex).toBe(true);
    expect(applyOverrides({ ...base, noindex: true }, {}).noindex).toBe(true);
  });

  test("canonical e imagem de compartilhamento manuais substituem o padrão", () => {
    const r = applyOverrides(base, { canonical: "https://www.demakine.com.br/b", ogImage: "https://www.demakine.com.br/x.jpg" });
    expect(r.canonical).toBe("https://www.demakine.com.br/b");
    expect(r.ogImage).toBe("https://www.demakine.com.br/x.jpg");
  });

  test("sem regra, nada muda", () => {
    expect(applyOverrides(base, {})).toEqual(base);
  });
});
