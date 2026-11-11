import { describe, expect, test } from "bun:test";
import content from "../src/web/data/content.json";
import en from "../src/web/i18n/en.json";
import es from "../src/web/i18n/es.json";
import vercel from "../vercel.json";
import { PAGE_LASTMOD, PRODUCTS_LASTMOD, buildSitemap } from "../src/api/lib/sitemap";
import { PRIMARY_SKU, productCommerce } from "../src/web/lib/product-schema";

type Product = { slug: string; seoTitle?: string; models: { model: string }[] };
const products = (content as { products: Product[] }).products;

/** title novo de cada produto, conforme o plano de SEO de 09/11/2026 */
const NEW_TITLES: Record<string, string> = {
  "esteira-transportadora-horizontal": "Esteira Transportadora Horizontal de 5 a 15 m | Demakine",
  "esteira-transportadora-para-sacaria": "Esteira Transportadora para Sacaria e Fardos | Demakine",
  "esteira-transportadora-articulada": "Esteira Transportadora Articulada para Caminhão | Demakine",
  "esteira-transportadora-de-caixas": "Esteira Transportadora para Caixas e Pacotes | Demakine",
  "esteira-transportadora-para-granel": "Esteira Transportadora em V para Granel | Demakine",
  "esteira-para-transporte-de-frutas-e-legumes": "Esteira para Frutas e Legumes: Hortifrúti | Demakine",
  "esteira-transportadora-para-reciclagem-triagem": "Esteira de Triagem para Reciclagem de 8 a 25 m | Demakine",
  "calha-transportadora": "Calha Transportadora para Grãos e Ração | Demakine",
  "rosca-transportadora-chupim": "Rosca Chupim para Grãos, Tulha e Carreta | Demakine",
  "rosca-transportadora": "Rosca Transportadora Helicoidal de 4″ a 16″ | Demakine",
  "elevador-de-canecas": "Elevador de Canecas para Grãos: Fabricante | Demakine",
  "linha-fio-para-costura-de-sacaria": "Linha para Costura de Sacaria em Poliéster | Demakine",
  "maquina-de-costurar-sacos-gk-26": "Máquina de Costurar Sacos GK-26 Portátil | Demakine",
  "mini-sistema-de-costura": "Mini Sistema de Costura de Sacaria com Esteira | Demakine",
};
const KEPT = [
  "esteira-transportadora-dalla",
  "esteira-transportadora-em-v-para-cama-de-frango-aviario",
  "esteira-transportadora-para-cesta-basica",
  "elevador-de-sacaria",
  "cartrans-carrinho-transportador",
  "maquina-de-costurar-sacos-siruba-aa-6",
  "peneira-para-carvao",
  "esteira-de-roletes-livres",
];

describe("titles dos produtos", () => {
  for (const [slug, title] of Object.entries(NEW_TITLES)) {
    test(`${slug}: title novo, até 60 caracteres e traduzido`, () => {
      const p = products.find((x) => x.slug === slug)!;
      expect(p.seoTitle).toBe(title);
      expect(title.length).toBeLessThanOrEqual(60);
      expect((en as Record<string, string>)[title]).toBeTruthy();
      expect((es as Record<string, string>)[title]).toBeTruthy();
    });
  }

  test("os produtos que o Marketing mandou manter (e a roletes livres, nova) têm title com a marca", () => {
    expect(KEPT.every((s) => products.some((p) => p.slug === s))).toBe(true);
    expect(KEPT.every((s) => products.find((p) => p.slug === s)!.seoTitle?.endsWith(" | Demakine"))).toBe(true);
  });

  test("todo produto está num dos dois grupos e nenhum title passa de 60 caracteres", () => {
    for (const p of products) {
      expect(p.slug in NEW_TITLES || KEPT.includes(p.slug)).toBe(true);
      expect(p.seoTitle!.length).toBeLessThanOrEqual(60);
    }
  });

  test("a calha não é chamada de vibratória (o site não descreve assim)", () => {
    expect(products.find((p) => p.slug === "calha-transportadora")!.seoTitle).not.toMatch(/vibrat/i);
  });
});

describe("schema Product: offers sem preço", () => {
  const url = "https://www.demakine.com.br/produtos/esteira-transportadora-para-sacaria";
  const c = productCommerce("esteira-transportadora-para-sacaria", url);

  test("tem url, sku e offers completos", () => {
    expect(c.url).toBe(url);
    expect((c as { sku?: string }).sku).toBe("ETD8");
    expect(c.offers).toMatchObject({
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": "https://www.demakine.com.br/#empresa" },
    });
    expect(c.offers.priceSpecification.description).toMatch(/sob consulta/i);
  });

  test("nunca declara price (nem 0): preço é sob consulta", () => {
    const json = JSON.stringify(productCommerce("rosca-transportadora", url));
    expect(json).not.toMatch(/"price"\s*:/);
    expect(json).not.toMatch(/"lowPrice"|"highPrice"/);
  });

  test("sku só para quem tem esse modelo; o resto vai sem sku", () => {
    for (const [slug, sku] of Object.entries(PRIMARY_SKU)) {
      expect(products.find((p) => p.slug === slug)!.models.some((m) => m.model === sku)).toBe(true);
    }
    expect("sku" in productCommerce("calha-transportadora", url)).toBe(false);
  });

  test("a descrição do preço tem tradução", () => {
    const text = c.offers.priceSpecification.description;
    expect((en as Record<string, string>)[text]).toBeTruthy();
    expect((es as Record<string, string>)[text]).toBeTruthy();
  });
});

describe("sitemap com lastmod", () => {
  const xml = buildSitemap([], []);
  const lastmodOf = (loc: string) =>
    new RegExp(`<loc>https://www\\.demakine\\.com\\.br${loc}</loc>.*?(?:<lastmod>([^<]+)</lastmod>)?<priority>`).exec(xml)?.[1];

  test("a home e todos os produtos têm a data da última edição", () => {
    expect(PAGE_LASTMOD["/"]).toBe("2026-11-09");
    expect(lastmodOf("/")).toBe("2026-11-09");
    for (const p of products) expect(lastmodOf(`/produtos/${p.slug}`)).toBe(PRODUCTS_LASTMOD);
  });

  test("edição do painel mais recente vence a data do código", () => {
    const docs = [{ collection: "produto", key: products[0]!.slug, data: { name: "x", category: "y" }, deleted: false, updatedAt: new Date("2027-01-15") }];
    expect(buildSitemap(docs, [])).toContain("<lastmod>2027-01-15</lastmod>");
  });

  test("página que não mudou não ganha data inventada", () => {
    expect(lastmodOf("/contato")).toBeUndefined();
  });
});

describe("cabeçalhos de cache", () => {
  const headers = (vercel as { headers: { source: string; headers: { key: string; value: string }[] }[] }).headers;
  const cache = (source: string) => headers.find((h) => h.source === source)?.headers.find((x) => x.key === "Cache-Control")?.value;

  test("/assets (nome com hash) fica 1 ano, imutável", () => expect(cache("/assets/(.*)")).toBe("public, max-age=31536000, immutable"));
  test("/img (nome fixo) fica 1 dia e revalida em segundo plano", () => {
    expect(cache("/img/(.*)")).toBe("public, max-age=604800, stale-while-revalidate=86400");
  });
  test("o painel continua sem cache", () => expect(cache("/admin/(.*)")).toBe("no-store"));
});
