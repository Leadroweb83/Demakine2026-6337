import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { extractFacts, isInternal, normalizeInternal } from "../../src/api/lib/seo/html";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const PAGE = "https://www.demakine.com.br/esteiras-transportadoras";

describe("extractFacts: página completa", () => {
  const f = extractFacts(fixture("pagina-completa.html"), PAGE);

  test("título, descrição e H1", () => {
    expect(f.title).toBe("Esteiras Transportadoras: Fábrica e Modelos | Demakine");
    expect(f.description).toStartWith("Fábrica de esteiras transportadoras & roletes.");
    expect(f.h1s).toEqual(["Esteiras transportadoras sob medida"]);
    expect(f.h2Count).toBe(2);
  });

  test("indexação, canonical, idioma e hreflang", () => {
    expect(f.robots).toBe("index, follow");
    expect(f.canonical).toBe("https://www.demakine.com.br/esteiras-transportadoras");
    expect(f.htmlLang).toBe("pt-BR");
    expect(f.hreflangs).toContainEqual({ lang: "en", href: "https://www.demakine.com.br/en/esteiras-transportadoras" });
    expect(f.hreflangs).toHaveLength(3);
  });

  test("Open Graph", () => {
    expect(f.og.title).toBe("Esteiras Transportadoras | Demakine");
    expect(f.og.description).toBe("Esteiras sob medida");
    expect(f.og.image).toBe("https://www.demakine.com.br/og/esteiras.jpg");
  });

  test("imagens: sem alt vira null, alt vazio continua vazio", () => {
    const by = (name: string) => f.images.find((i) => i.src.endsWith(name));
    expect(by("/esteira-com-alt.webp")?.alt).toBe("Esteira transportadora em operação");
    expect(by("/sem-alt.webp")?.alt).toBeNull();
    expect(by("/alt-vazio.webp")?.alt).toBe("");
    expect(by("/sem-alt.webp")?.src).toBe("https://www.demakine.com.br/imagens/sem-alt.webp");
  });

  test("links internos: só páginas do domínio, normalizadas, sem repetir nem apontar para ela mesma", () => {
    expect(f.internalLinks).toContain("/produtos/rosca-transportadora");
    expect(f.internalLinks).toContain("/produtos");
    expect(f.internalLinks).toContain("/blog/como-escolher");
    expect(f.internalLinks).toContain("/");
    expect(f.internalLinks).not.toContain("/esteiras-transportadoras");
    expect(f.internalLinks).not.toContain("/comentario-que-nao-vale");
    expect(f.internalLinks).not.toContain("/downloads/catalogo.pdf");
    expect(f.internalLinks.some((l) => /mailto|tel:|javascript|outro\.com|#/.test(l))).toBe(false);
    expect(new Set(f.internalLinks).size).toBe(f.internalLinks.length);
  });

  test("dados estruturados lidos", () => {
    expect(f.jsonLdTypes).toContain("FAQPage");
    expect(f.jsonLdTypes).toContain("BreadcrumbList");
    expect(f.jsonLd).toHaveLength(2);
  });

  test("palavras: só o texto visível, sem script, estilo nem comentário", () => {
    expect(f.words).toBeGreaterThan(20);
    expect(f.words).toBeLessThan(45);
  });
});

describe("extractFacts: casos limite", () => {
  test("página quebrada não lança e devolve vazios", () => {
    const f = extractFacts(fixture("pagina-quebrada.html"), PAGE);
    expect(f.title).toBeNull();
    expect(f.h1s).toEqual([]);
    expect(f.jsonLd).toEqual([]);
    expect(f.jsonLdTypes).toEqual([]);
    expect(f.description).toBeNull();
    expect(f.canonical).toBeNull();
    expect(f.htmlLang).toBeNull();
  });

  test("entrada vazia ou lixo não lança", () => {
    for (const html of ["", "   ", "<", "<<<>>>", "\u0000\u0001", "<title>", "<h1>"]) {
      expect(() => extractFacts(html, PAGE)).not.toThrow();
    }
    const f = extractFacts("", PAGE);
    expect(f).toMatchObject({ title: null, description: null, h1s: [], words: 0, images: [], internalLinks: [], jsonLd: [] });
  });

  test("palavras ignoram script e estilo", () => {
    const f = extractFacts("<body><p>um dois três</p><script>x y z</script><style>.a{}</style><p>quatro</p></body>", PAGE);
    expect(f.words).toBe(4);
  });

  test("entidades são decodificadas no título", () => {
    const f = extractFacts("<title>Tom &amp; Jerry &quot;ao vivo&quot; &#x27;hoje&#x27;</title>", PAGE);
    expect(f.title).toBe(`Tom & Jerry "ao vivo" 'hoje'`);
  });

  test("H1 vazio fica na lista como texto vazio (o auditor trata como ausente)", () => {
    const f = extractFacts("<h1></h1><h1>  Olá   mundo </h1>", PAGE);
    expect(f.h1s).toEqual(["", "Olá mundo"]);
  });

  test("JSON-LD com @graph e @type em lista", () => {
    const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", name: "D" }, { "@type": ["Product", "Thing"], name: "P" }] });
    const f = extractFacts(`<script type="application/ld+json">${ld}</script>`, PAGE);
    expect(f.jsonLd).toHaveLength(2);
    expect(f.jsonLdTypes.sort()).toEqual(["Organization", "Product", "Thing"]);
  });

  test("atributos em ordem diferente e aspas simples", () => {
    const f = extractFacts(`<meta content='Texto curto' name='description'><link href='/a' rel='canonical'>`, PAGE);
    expect(f.description).toBe("Texto curto");
    expect(f.canonical).toBe("https://www.demakine.com.br/a");
  });
});

describe("isInternal e normalizeInternal", () => {
  test("isInternal", () => {
    expect(isInternal("https://outro.com/x", "https://www.demakine.com.br/")).toBe(false);
    expect(isInternal("https://demakine.com.br.evil.com/x", "https://www.demakine.com.br/")).toBe(false);
    expect(isInternal("/blog", "https://www.demakine.com.br/")).toBe(true);
    expect(isInternal("https://www.demakine.com.br/blog", "https://www.demakine.com.br/")).toBe(true);
    expect(isInternal("https://demakine.com.br/blog", "https://www.demakine.com.br/")).toBe(true);
    for (const h of ["mailto:a@b.com", "tel:+5519", "#topo", "javascript:void(0)", "", "data:text/html,x"]) {
      expect(isInternal(h, "https://www.demakine.com.br/")).toBe(false);
    }
  });

  test("normalizeInternal", () => {
    expect(normalizeInternal("/blog/?a=1#x", "https://www.demakine.com.br/")).toBe("/blog");
    expect(normalizeInternal("/", "https://www.demakine.com.br/x")).toBe("/");
    expect(normalizeInternal("https://www.demakine.com.br/en/", "https://www.demakine.com.br/")).toBe("/en");
    expect(normalizeInternal("../b", "https://www.demakine.com.br/a/c")).toBe("/b");
  });
});
