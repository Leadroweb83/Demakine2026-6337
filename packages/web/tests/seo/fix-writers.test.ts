import { describe, expect, test } from "bun:test";
import { createFixWriters } from "../../src/api/lib/seo/fix-store";
import type { FixPage } from "../../src/api/lib/seo/fix-rules";
import { perfectFacts } from "./helpers/facts";

const page = (over: Partial<FixPage> = {}): FixPage => ({
  path: "/a",
  label: "A",
  lang: "pt",
  area: "institucional",
  overrides: {},
  facts: perfectFacts({ title: "Título lido da página", description: "Descrição lida da página", og: { image: "https://www.demakine.com.br/og.jpg" } }),
  checks: [],
  ...over,
});

function setup(pages: FixPage[]) {
  const calls = { pages: 0, docs: [] as { key: string; doc: Record<string, unknown>; userId: string }[], alts: [] as { slug: string; src: string; alt: string; userId: string }[] };
  const writers = createFixWriters({
    pages: async () => {
      calls.pages++;
      return pages.map((p) => ({ ...p, overrides: { ...p.overrides } }));
    },
    savePageDoc: async (key, doc, userId) => void calls.docs.push({ key, doc, userId }),
    setImageAlt: async (slug, src, alt, userId) => void calls.alts.push({ slug, src, alt, userId }),
    productAlt: async (_slug, src) => (src.endsWith("/1.webp") ? "Alt do painel" : ""),
  });
  return { writers, calls };
}

describe("createFixWriters.current", () => {
  test("o override vale mais que o valor lido na página; sem os dois, vazio", async () => {
    const { writers } = setup([page({ overrides: { title: "Do painel" } }), page({ path: "/b", facts: null })]);
    expect(await writers.current({ path: "/a", field: "title" })).toBe("Do painel");
    expect(await writers.current({ path: "/a", field: "description" })).toBe("Descrição lida da página");
    expect(await writers.current({ path: "/b", field: "title" })).toBe("");
    expect(await writers.current({ path: "/nao-existe", field: "title" })).toBe("");
  });

  test("a imagem de compartilhamento vem sem o domínio do próprio site, para bater com o 'depois' da proposta", async () => {
    const { writers } = setup([page({ overrides: { ogImage: "https://www.demakine.com.br/img/a.webp" } })]);
    expect(await writers.current({ path: "/a", field: "ogImage" })).toBe("/img/a.webp");
  });

  test("o alt lê o documento do produto; caminho que não é de produto dá vazio", async () => {
    const { writers } = setup([page({ path: "/produtos/p" })]);
    expect(await writers.current({ path: "/produtos/p", field: "alt", target: "https://www.demakine.com.br/img/produtos/p/1.webp" })).toBe("Alt do painel");
    expect(await writers.current({ path: "/a", field: "alt", target: "https://www.demakine.com.br/img/produtos/p/1.webp" })).toBe("");
  });
});

describe("createFixWriters.write", () => {
  test("funde o campo no documento de SEO existente sem perder canonical, noindex e resposta curta", async () => {
    const { writers, calls } = setup([page({ overrides: { canonical: "https://www.demakine.com.br/a", noindex: true, shortAnswer: "Resposta curta", title: "Antigo" } })]);
    await writers.write({ path: "/a", field: "title" }, "Título novo do painel", "u1");
    expect(calls.docs).toHaveLength(1);
    expect(calls.docs[0]!.userId).toBe("u1");
    expect(calls.docs[0]!.doc).toMatchObject({ title: "Título novo do painel", noindex: true, shortAnswer: "Resposta curta" });
    expect(calls.docs[0]!.doc.canonical).toBeDefined();
  });

  test("texto vazio remove só aquele campo e mantém o resto", async () => {
    const { writers, calls } = setup([page({ overrides: { title: "Do painel", description: "Descrição do painel" } })]);
    await writers.write({ path: "/a", field: "title" }, "", "u1");
    expect(calls.docs[0]!.doc).toEqual({ description: "Descrição do painel" });
  });

  test("página que não existe dá erro e não grava", async () => {
    const { writers, calls } = setup([page()]);
    await expect(writers.write({ path: "/nao-existe", field: "title" }, "x", "u1")).rejects.toThrow("Página não encontrada");
    expect(calls.docs).toEqual([]);
  });

  test("alt: grava pelo slug do produto; sem slug válido ou sem foto, erro", async () => {
    const { writers, calls } = setup([page({ path: "/produtos/p" })]);
    await writers.write({ path: "/produtos/p", field: "alt", target: "https://www.demakine.com.br/img/produtos/p/1.webp" }, "Foto 1", "u1");
    expect(calls.alts).toEqual([{ slug: "p", src: "https://www.demakine.com.br/img/produtos/p/1.webp", alt: "Foto 1", userId: "u1" }]);
    await expect(writers.write({ path: "/blog/x", field: "alt", target: "https://x/y.webp" }, "x", "u1")).rejects.toThrow("Foto não encontrada neste produto");
    await expect(writers.write({ path: "/produtos/p", field: "alt" }, "x", "u1")).rejects.toThrow("Foto não encontrada neste produto");
  });
});

describe("C1: as páginas são carregadas uma vez por instância (e não duas vezes por item)", () => {
  test("20 leituras e 20 gravações carregam as páginas uma única vez e enxergam o que foi gravado", async () => {
    const pages = Array.from({ length: 20 }, (_, i) => page({ path: `/p${i}` }));
    const { writers, calls } = setup(pages);
    for (let i = 0; i < 20; i++) {
      await writers.current({ path: `/p${i}`, field: "title" });
      await writers.write({ path: `/p${i}`, field: "title" }, `Novo ${i}`, "u1");
    }
    expect(calls.pages).toBe(1);
    expect(await writers.current({ path: "/p3", field: "title" })).toBe("Novo 3");
    await writers.write({ path: "/p3", field: "title" }, "", "u1");
    expect(await writers.current({ path: "/p3", field: "title" })).toBe("Título lido da página");
  });
});
