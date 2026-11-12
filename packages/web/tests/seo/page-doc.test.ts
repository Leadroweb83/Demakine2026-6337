import { describe, expect, test } from "bun:test";
import { SeoDocError, readOverrides, toSeoDoc } from "../../src/web/lib/seo-overrides";
import { warnBeforeHiding } from "../../src/web/admin/seo-geo/model";
import { seoKey } from "../../src/web/lib/seo-pages";
import { listSitePages } from "../../src/api/lib/seo/pages";
import { CONTENT_KEY_RE, SEO_PROTECTED_FIELDS, mergeSeoDoc, protectedOnly } from "../../src/api/lib/content-docs";

describe("toSeoDoc", () => {
  test("remove texto vazio e espaços, e só guarda noindex quando é true", () => {
    expect(toSeoDoc({ title: "  Título  ", description: "   ", noindex: false, noSitemap: false })).toEqual({ title: "Título" });
    expect(toSeoDoc({ noindex: true })).toEqual({ noindex: true });
    expect(toSeoDoc({ noSitemap: true, ogImage: "/img/og.jpg" })).toEqual({ noSitemap: true, ogImage: "/img/og.jpg" });
    expect(toSeoDoc({})).toEqual({});
  });

  test("recusa canonical de outro domínio, mas aceita o do próprio site (e converte caminho)", () => {
    expect(() => toSeoDoc({ canonical: "https://outro.com" })).toThrow(SeoDocError);
    expect(() => toSeoDoc({ canonical: "https://outro.com" })).toThrow("O endereço canônico precisa ser do próprio site");
    expect(() => toSeoDoc({ canonical: "//outro.com/x" })).toThrow(SeoDocError);
    expect(toSeoDoc({ canonical: "https://www.demakine.com.br/a" })).toEqual({ canonical: "https://www.demakine.com.br/a" });
    expect(toSeoDoc({ canonical: "/a" })).toEqual({ canonical: "https://www.demakine.com.br/a" });
  });

  test("limites: título 120, descrição 320, resposta curta 600", () => {
    expect(() => toSeoDoc({ title: "x".repeat(121) })).toThrow("O título pode ter até 120 caracteres");
    expect(toSeoDoc({ title: "x".repeat(120) }).title).toHaveLength(120);
    expect(() => toSeoDoc({ description: "x".repeat(321) })).toThrow("A descrição pode ter até 320 caracteres");
    expect(() => toSeoDoc({ shortAnswer: "x".repeat(601) })).toThrow("A resposta curta pode ter até 600 caracteres");
  });

  test("imagem de compartilhamento só caminho do site ou https; data de revisão no formato AAAA-MM-DD", () => {
    expect(() => toSeoDoc({ ogImage: "javascript:alert(1)" })).toThrow(SeoDocError);
    expect(() => toSeoDoc({ ogImage: "//outro.com/a.jpg" })).toThrow(SeoDocError);
    expect(toSeoDoc({ ogImage: "https://www.demakine.com.br/a.jpg" })).toEqual({ ogImage: "https://www.demakine.com.br/a.jpg" });
    expect(() => toSeoDoc({ reviewedAt: "ontem" })).toThrow(SeoDocError);
    expect(toSeoDoc({ reviewedAt: "2026-11-11", author: "Equipe" })).toEqual({ reviewedAt: "2026-11-11", author: "Equipe" });
  });

  test("o que toSeoDoc grava é o que readOverrides lê de volta", () => {
    const o = { title: "T", description: "D", noindex: true, canonical: "https://www.demakine.com.br/x", ogImage: "/o.jpg" };
    expect(readOverrides(toSeoDoc(o))).toEqual(o);
  });
});

describe("warnBeforeHiding", () => {
  test("avisa com o número de visitas, no singular e no plural", () => {
    expect(warnBeforeHiding(120, false)).toBe("Esta página recebeu 120 visitas nos últimos 30 dias. Ocultar tira ela do Google.");
    expect(warnBeforeHiding(1, false)).toBe("Esta página recebeu 1 visita nos últimos 30 dias. Ocultar tira ela do Google.");
  });

  test("sem visitas ou página técnica, nenhum aviso", () => {
    expect(warnBeforeHiding(0, false)).toBeNull();
    expect(warnBeforeHiding(500, true)).toBeNull();
  });
});

describe("chaves dos documentos de SEO", () => {
  const pages = listSitePages([], []);
  test("toda página da lista tem uma chave válida, de até 100 caracteres, e nenhuma se repete", () => {
    const keys = pages.map((p) => seoKey(p.path));
    for (const k of keys) expect(CONTENT_KEY_RE.test(k), k).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("mergeSeoDoc: o endpoint genérico de conteúdo nunca muda os campos protegidos", () => {
  const prev = { title: "Antigo", description: "Desc", noindex: true, canonical: "https://www.demakine.com.br/x", ogImage: "/og.jpg" };

  test("título e descrição vêm do que foi enviado; os protegidos continuam os de antes", () => {
    expect(mergeSeoDoc(prev, { title: "Novo", description: undefined })).toEqual({ title: "Novo", description: undefined, noindex: true, canonical: "https://www.demakine.com.br/x", ogImage: "/og.jpg" });
  });

  test("campo protegido enviado é ignorado", () => {
    expect(mergeSeoDoc(prev, { title: "N", noindex: false, canonical: "https://evil.com" }).noindex).toBe(true);
    expect(mergeSeoDoc(prev, { title: "N", canonical: "https://evil.com" }).canonical).toBe("https://www.demakine.com.br/x");
    expect(mergeSeoDoc(undefined, { title: "N", noindex: true })).toEqual({ title: "N" });
    expect(mergeSeoDoc({ title: "A" }, { title: "B", noSitemap: true })).toEqual({ title: "B" });
  });

  test("protectedOnly guarda só os protegidos (para o 'usar o padrão' da tela antiga)", () => {
    expect(protectedOnly(prev)).toEqual({ noindex: true, canonical: "https://www.demakine.com.br/x", ogImage: "/og.jpg" });
    expect(protectedOnly({ title: "só texto" })).toEqual({});
    expect(protectedOnly(undefined)).toEqual({});
    expect([...SEO_PROTECTED_FIELDS].sort()).toEqual(["author", "canonical", "noSitemap", "noindex", "ogImage", "reviewedAt", "shortAnswer"]);
  });

  test("index.ts usa as duas funções no PUT e no DELETE da coleção seo", async () => {
    const src = await Bun.file(new URL("../../src/api/index.ts", import.meta.url)).text();
    expect(src).toContain("mergeSeoDoc(");
    expect(src).toContain("protectedOnly(");
  });
});
