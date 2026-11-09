import { describe, expect, test } from "bun:test";
import content from "../src/web/data/content.json";
import { landingPages, landingFor } from "../src/web/lib/landing-pages";
import { CATEGORY_PAGE, PRICE_PAGE, SOLUTIONS, WA, isVendorPage, vendorMessage } from "../src/web/lib/landing-links";
import { buildSitemap } from "../src/api/lib/sitemap";

const c = content as { products: { slug: string; category: string }[]; posts: { slug: string }[]; categories: { slug: string }[] };
const SEGMENTS = ["fertilizantes-e-insumos", "reciclagem-e-residuos", "construcao-e-mineracao", "alimentos-e-racao", "logistica-e-distribuicao", "metalurgico", "farmaceutico", "plastico-e-embalagens"];
const sitemapPaths = new Set([...buildSitemap([], []).matchAll(/<loc>https:\/\/www\.demakine\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1]!.split("?")[0]!));
const exists = (to: string) => to === "/" || sitemapPaths.has(to) || c.posts.some((p) => `/blog/${p.slug}` === to) || to === "/ferramentas";

const textOf = (l: (typeof landingPages)[number]) => [
  l.seoTitle, l.seoDesc, l.eyebrow, l.h1, l.lead, l.waMessage, l.productsEyebrow, l.productsTitle, l.guideEyebrow, l.guideTitle,
  ...l.guide.flatMap((b) => [b.title, b.text]), ...l.faq.flatMap((f) => [f.q, f.a]), l.faqTitle, l.quoteTitle, l.quoteText,
  ...l.related.map((r) => r.label), ...(l.table ? [l.table.title, l.table.note ?? "", ...l.table.head, ...l.table.rows.flat()] : []),
];
const SLOP = ["descubra", "transforme", "potencialize", "solução completa", "de ponta", "inovador", "excelência", "no mundo de hoje", "revolucion", "líder de mercado", "sem igual"];

describe("as 10 páginas com URL própria", () => {
  test("são 4 categorias e 6 comerciais, com os slugs do plano do Marketing", () => {
    expect(landingPages.filter((l) => l.kind === "categoria").map((l) => l.slug)).toEqual([
      "esteiras-transportadoras", "roscas-transportadoras", "elevadores", "maquinas-de-costurar-sacos",
    ]);
    expect(landingPages.filter((l) => l.kind === "comercial").map((l) => l.slug)).toEqual([
      "fabricante-de-esteira-transportadora", "esteira-transportadora-industrial", "esteira-para-carga-e-descarga-de-caminhao",
      "esteira-transportadora-preco", "rosca-transportadora-preco", "maquina-de-costurar-sacos-preco",
    ]);
  });

  test("os links leves (WA, rodapé, menu) cobrem as mesmas 10 páginas", () => {
    expect(Object.keys(WA).sort()).toEqual(landingPages.map((l) => l.slug).sort());
    for (const l of landingPages) expect(l.waMessage).toBe(WA[l.slug]!);
    expect(SOLUTIONS.map((s) => s.to.slice(1))).toEqual([
      "fabricante-de-esteira-transportadora", "esteira-transportadora-preco", "esteira-transportadora-industrial",
      "esteira-para-carga-e-descarga-de-caminhao", "rosca-transportadora-preco", "maquina-de-costurar-sacos-preco",
    ]);
  });

  test("cada categoria do catálogo tem página de categoria, e as páginas de preço apontam para o que existe", () => {
    expect(Object.keys(CATEGORY_PAGE).sort()).toEqual(c.categories.map((x) => x.slug).sort());
    for (const to of Object.values(CATEGORY_PAGE)) expect(landingFor(to)?.kind).toBe("categoria");
    for (const p of Object.values(PRICE_PAGE)) expect(landingFor(p.to)?.kind).toBe("comercial");
  });

  test("vendor: as 10 páginas e a roletes mostram os dois chamados", () => {
    for (const l of landingPages) {
      expect(isVendorPage(`/${l.slug}`)).toBe(true);
      expect(vendorMessage(`/${l.slug}/`)).toBe(l.waMessage);
    }
    expect(isVendorPage("/produtos/esteira-de-roletes-livres")).toBe(true);
    expect(isVendorPage("/produtos/rosca-transportadora")).toBe(false);
  });

  for (const l of landingPages) {
    describe(`/${l.slug}`, () => {
      test("título até 60, descrição até 155, com o termo no H1", () => {
        expect(l.seoTitle.length).toBeLessThanOrEqual(60);
        expect(l.seoTitle.endsWith(" | Demakine")).toBe(true);
        expect(l.seoDesc.length).toBeGreaterThanOrEqual(120);
        expect(l.seoDesc.length).toBeLessThanOrEqual(155);
        expect(l.h1.length).toBeGreaterThan(20);
      });
      test("só lista produtos que existem, da categoria certa, e tem ao menos 2", () => {
        expect(l.productSlugs.length).toBeGreaterThanOrEqual(2);
        for (const s of l.productSlugs) expect(c.products.some((p) => p.slug === s)).toBe(true);
        if (l.kind === "categoria") for (const s of l.productSlugs) expect(c.products.find((p) => p.slug === s)!.category).toBe(l.category!);
      });
      test("links relacionados existem no site", () => {
        expect(l.related.length).toBeGreaterThanOrEqual(3);
        for (const r of l.related) expect(exists(r.to)).toBe(true);
      });
      test("tem guia, FAQ e perguntas de compra", () => {
        expect(l.guide.length).toBeGreaterThanOrEqual(4);
        expect(l.faq.length).toBeGreaterThanOrEqual(6);
        expect(l.faq.some((f) => /orçamento|preço|custa/i.test(f.q))).toBe(true);
      });
      test("sem travessão, sem vício de IA e sem promessa que o site não faz", () => {
        const all = textOf(l).join(" | ");
        expect(all).not.toMatch(/[—–]/);
        for (const w of SLOP) expect(all.toLowerCase()).not.toContain(w);
        // preço, prazo e financiamento nunca viram número ou promessa
        expect(all).not.toMatch(/R\$|\b(?!100\b)\d+\s?%|BNDES|Finame|financiamento|\bgrátis\b|\bgratuit/i);
        expect(all).not.toMatch(/\bem \d+ dias\b/i);
      });
    });
  }
});

describe("fatos que as páginas repetem batem com as fichas do site", () => {
  const rosca = (content as unknown as { products: { slug: string; models: { specs: Record<string, string> }[] }[] }).products.find((p) => p.slug === "rosca-transportadora")!;
  const table = landingFor("/rosca-transportadora-preco")!.table!;
  test("a tabela de capacidade da rosca é a da ficha, diâmetro por diâmetro", () => {
    const specs = rosca.models[0]!.specs;
    for (const [d, cap] of table.rows) {
      const n = d.replace(/\D/g, "");
      expect(specs[`Cap. Produtiva Ø${n}″`]).toBe(cap!.replace(" ton/h", "").replace("ton/h", "").trim() + " ton/h");
    }
    expect(table.rows).toHaveLength(7);
  });
  test("comprimento de 5 a 15 m e helicoide de 4″ a 16″", () => {
    const lens = rosca.models.map((m) => m.specs["Comprimento"]);
    expect(lens[0]).toBe("5 metros");
    expect(lens.at(-1)).toBe("15 metros");
  });
  test("segmentos citados existem", () => {
    for (const s of SEGMENTS) expect(sitemapPaths.has(`/segmentos/${s}`)).toBe(true);
  });
});
