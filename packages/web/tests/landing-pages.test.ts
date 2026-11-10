import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import content from "../src/web/data/content.json";
import { landingPages, landingFor } from "../src/web/lib/landing-pages";
import { parseLandingMd, type Block } from "../src/web/lib/landing-md";
import { internalLinks, plainText } from "../src/web/lib/markdown-inline";
import { CATEGORY_PAGE, PRICE_PAGE, SOLUTIONS, WA, isVendorPage, vendorMessage } from "../src/web/lib/landing-links";
import { buildSitemap } from "../src/api/lib/sitemap";
import { buildLanding, serialize } from "../vite/landing-from-md";

const c = content as { products: { slug: string; category: string }[]; posts: { slug: string }[]; categories: { slug: string }[] };
const sitemapPaths = new Set([...buildSitemap([], []).matchAll(/<loc>https:\/\/www\.demakine\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1]!.split("?")[0]!));
const exists = (to: string) =>
  to === "/" || sitemapPaths.has(to) || c.posts.some((p) => `/blog/${p.slug}` === to) || c.products.some((p) => `/produtos/${p.slug}` === to) || to === "/ferramentas";

/** todo texto em markdown de uma página: blocos, FAQ, orçamento */
function mdOf(l: (typeof landingPages)[number]): string[] {
  const fromBlock = (b: Block): string[] => {
    switch (b.t) {
      case "p": case "quote": return [b.md];
      case "h3": return [b.text];
      case "code": return [b.text];
      case "check": return b.items;
      case "ul": case "ol": return b.items.flatMap((i) => [i.md, ...i.sub]);
      case "table": return [...b.head, ...b.rows.flat()];
    }
  };
  return [
    l.title, l.description, l.h1, l.heroNote ?? "",
    ...l.intro.flatMap(fromBlock),
    ...l.sections.flatMap((s) => [s.title, ...s.blocks.flatMap(fromBlock)]),
    ...l.faq.flatMap((f) => [f.q, f.md]),
    l.cta.title, ...l.cta.blocks.flatMap(fromBlock), l.cta.contact,
  ];
}
const SLOP = ["descubra", "transforme", "potencialize", "solução completa", "de ponta", "revolucion", "líder de mercado", "sem igual"];

describe("as 10 páginas com URL própria (texto do Marketing)", () => {
  test("são 4 categorias e 6 comerciais, com os slugs do plano do Marketing", () => {
    expect(landingPages.filter((l) => l.kind === "categoria").map((l) => l.slug).sort()).toEqual(
      ["elevadores", "esteiras-transportadoras", "maquinas-de-costurar-sacos", "roscas-transportadoras"],
    );
    expect(landingPages.filter((l) => l.kind === "comercial").map((l) => l.slug).sort()).toEqual([
      "esteira-para-carga-e-descarga-de-caminhao", "esteira-transportadora-industrial", "esteira-transportadora-preco",
      "fabricante-de-esteira-transportadora", "maquina-de-costurar-sacos-preco", "rosca-transportadora-preco",
    ]);
  });

  test("data/landing.json está em dia com os arquivos de content/landing (rode: bun run landing:build)", () => {
    const built = serialize(buildLanding().docs);
    expect(readFileSync("src/web/data/landing.json", "utf8")).toBe(built);
  });

  test("o H1 do frontmatter é o mesmo do corpo, em cada arquivo", () => {
    for (const f of readdirSync("content/landing")) {
      const raw = readFileSync(`content/landing/${f}`, "utf8");
      const h1 = raw.match(/^h1:\s*"(.*)"$/m)![1];
      expect(raw.match(/^# (.+)$/m)![1]).toBe(h1);
    }
  });

  test("as 3 perguntas marcadas [CONFIRMAR] ficam de fora, e nenhuma marca sobra na página", () => {
    const dropped = Object.fromEntries(
      readdirSync("content/landing").map((f) => [f.replace(".md", ""), parseLandingMd(readFileSync(`content/landing/${f}`, "utf8")).droppedFaq]),
    );
    expect(dropped["esteira-transportadora-preco"]).toEqual(["Existe financiamento?"]);
    expect(dropped["rosca-transportadora-preco"]).toEqual(["Vocês vendem helicoide de reposição?"]);
    expect(dropped["maquina-de-costurar-sacos-preco"]).toHaveLength(1);
    for (const l of landingPages) expect(JSON.stringify(l)).not.toContain("CONFIRMAR");
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
      test("título até 60, descrição até 155, trilha termina na própria página", () => {
        expect(l.h1.length).toBeGreaterThan(20);
        expect(readFileSync(`content/landing/${l.slug}.md`, "utf8")).toContain(`\n# ${l.h1}\n`);
        expect(l.title.length).toBeLessThanOrEqual(60);
        expect(l.title.endsWith(" | Demakine")).toBe(true);
        expect(l.description.length).toBeGreaterThanOrEqual(100);
        expect(l.description.length).toBeLessThanOrEqual(155);
        expect(l.breadcrumb[0]).toEqual(["Início", "/"]);
        expect(l.breadcrumb.at(-1)![1]).toBe(`/${l.slug}`);
      });
      test("os pais da trilha existem", () => {
        for (const [, to] of l.breadcrumb.slice(0, -1)) expect(exists(to)).toBe(true);
      });
      test("categoria lista produtos que existem e são dela; comercial não depende da lista", () => {
        for (const s of l.items) expect(c.products.some((p) => p.slug === s)).toBe(true);
        if (l.kind === "categoria") {
          expect(l.items.length).toBeGreaterThanOrEqual(2);
          const cat = Object.entries(CATEGORY_PAGE).find(([, to]) => to === `/${l.slug}`)![0];
          for (const s of l.items) expect(c.products.find((p) => p.slug === s)!.category).toBe(cat);
        }
      });
      test("a foto do topo, quando citada, existe em public/", () => {
        if (l.heroImage) expect(existsSync(`public${l.heroImage}`)).toBe(true);
        if (l.heroFallback) expect(existsSync(`public${l.heroFallback}`)).toBe(true);
      });
      test("tem FAQ, e a resposta do schema é o texto puro da resposta da página", () => {
        expect(l.faq.length).toBeGreaterThanOrEqual(4);
        for (const f of l.faq) {
          expect(f.a).toBe(plainText(f.md));
          expect(f.a).not.toMatch(/[[\]*]/);
        }
      });
      test("todo link interno do texto existe no site", () => {
        const links = mdOf(l).flatMap(internalLinks).filter((to) => to !== "/contato");
        expect(links.length).toBeGreaterThan(0);
        for (const to of links) expect(exists(to), `${l.slug} -> ${to}`).toBe(true);
      });
      test("schema: um nó de página, sem trilha nem FAQ duplicados e sem referência solta ao site", () => {
        expect(l.schema.length).toBe(1);
        expect(l.schema[0]!["@type"]).toBe(l.kind === "categoria" ? "CollectionPage" : "Service");
        const json = JSON.stringify(l.schema);
        expect(json).not.toContain("#website");
        expect(json).not.toContain('{"@id"');
      });
      test("sem travessão, sem vício de IA e sem preço, financiamento ou promessa de prazo", () => {
        const all = mdOf(l).join(" | ");
        expect(all).not.toMatch(/[—–]/);
        for (const w of SLOP) expect(all.toLowerCase()).not.toContain(w);
        expect(all).not.toMatch(/R\$|BNDES|Finame|financiamento|\bgrátis\b|\bgratuit/i);
        expect(all).not.toMatch(/\bem \d+ dias\b/i);
      });
    });
  }
});

describe("o schema das categorias lista os mesmos produtos do frontmatter", () => {
  for (const l of landingPages.filter((x) => x.kind === "categoria")) {
    test(`/${l.slug}`, () => {
      const list = (l.schema[0] as { mainEntity: { itemListElement: { url: string }[] } }).mainEntity.itemListElement;
      expect(list.map((i) => i.url.replace("https://www.demakine.com.br/produtos/", ""))).toEqual(l.items);
    });
  }
});

describe("fatos que as páginas repetem batem com as fichas do site", () => {
  const rosca = (content as unknown as { products: { slug: string; models: { specs: Record<string, string> }[] }[] }).products.find((p) => p.slug === "rosca-transportadora")!;
  const capacityRows = (slug: string) => {
    const t = landingFor(`/${slug}`)!.sections.flatMap((s) => s.blocks).find((b): b is Extract<Block, { t: "table" }> => b.t === "table" && /Cap|Diâmetro/i.test(b.head[0]! + b.head[1]!));
    return t!.rows;
  };
  for (const slug of ["roscas-transportadoras", "rosca-transportadora-preco"]) {
    test(`/${slug}: a tabela de capacidade é a da ficha, diâmetro por diâmetro`, () => {
      const specs = rosca.models[0]!.specs;
      const rows = capacityRows(slug);
      expect(rows).toHaveLength(7);
      for (const [d, cap] of rows) {
        const n = d!.replace(/\D/g, "");
        expect(specs[`Cap. Produtiva Ø${n}″`]).toBe(cap!.replace("t/h", "ton/h"));
      }
    });
  }
  test("comprimento de 5 a 15 m na ficha", () => {
    const lens = rosca.models.map((m) => m.specs["Comprimento"]);
    expect(lens[0]).toBe("5 metros");
    expect(lens.at(-1)).toBe("15 metros");
  });
});
