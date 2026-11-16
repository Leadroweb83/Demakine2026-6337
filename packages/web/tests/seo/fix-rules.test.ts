import { describe, expect, test } from "bun:test";
import { buildProposals, clean, currentValue, FIX_KINDS, proposeAlt, proposeDescription, proposeTitle, type FixPage } from "../../src/api/lib/seo/fix-rules";
import type { Check } from "../../src/api/lib/seo/score";
import type { SiteArea } from "../../src/api/lib/seo/types";
import { perfectFacts } from "./helpers/facts";

const AREAS: SiteArea[] = ["produtos", "categorias", "comerciais", "blog", "cases", "segmentos", "vagas", "exportacao", "institucional", "tecnica"];

const check = (item: Check["item"], over: Partial<Check> = {}): Check => ({ item, points: 0, max: 10, ok: false, message: "ruim", fix: "arrume", ...over });
const page = (over: Partial<FixPage> = {}): FixPage => ({
  path: "/produtos/esteira-dalla",
  label: "Esteira Dalla",
  lang: "pt",
  area: "produtos",
  overrides: {},
  facts: perfectFacts({ title: "T", description: "D", images: [] }),
  checks: [],
  ...over,
});

describe("clean", () => {
  test("tira tags, espaços especiais e espaços repetidos", () => {
    expect(clean("  <b>Olá</b>  mundo   ")).toBe("Olá mundo");
  });
});

describe("proposeTitle", () => {
  test("nome com a marca no fim, de 30 a 60 caracteres", () => {
    expect(proposeTitle("Esteira Transportadora Dalla")).toBe("Esteira Transportadora Dalla | Demakine");
  });

  test("nome curto ganha o sufixo mais longo até chegar a 30", () => {
    expect(proposeTitle("Rosca")).toBe("Rosca | Demakine Equipamentos Agroindustriais");
  });

  test("nome de 80 caracteres é cortado por palavra, sem reticências", () => {
    const label = "Esteira transportadora articulada para linhas de embalagem de grande porte e capacidade";
    expect(label.length).toBeGreaterThanOrEqual(80);
    const t = proposeTitle(label);
    expect(t.length).toBeLessThanOrEqual(60);
    expect(t.endsWith(" | Demakine")).toBe(true);
    expect(t).not.toContain("…");
    const name = t.slice(0, -" | Demakine".length);
    expect(label.startsWith(name)).toBe(true);
    expect(label.slice(name.length, name.length + 1)).toBe(" ");
  });
});

describe("proposeDescription", () => {
  test("de 70 a 155 caracteres e com o nome da página, em toda área", () => {
    for (const area of AREAS) {
      const d = proposeDescription("Esteira Dalla", area);
      expect(d.length, area).toBeGreaterThanOrEqual(70);
      expect(d.length, area).toBeLessThanOrEqual(155);
      expect(d, area).toContain("Esteira Dalla");
      expect(d, area).not.toMatch(/\s{2,}/);
    }
  });

  test("nome muito longo ainda cabe na faixa", () => {
    const d = proposeDescription("Esteira transportadora articulada para linhas de embalagem de grande porte e capacidade total", "produtos");
    expect(d.length).toBeGreaterThanOrEqual(70);
    expect(d.length).toBeLessThanOrEqual(155);
  });
});

describe("proposeAlt", () => {
  test("nome, marca e número da foto", () => {
    expect(proposeAlt("Esteira Dalla", 2)).toBe("Esteira Dalla Demakine, foto 2");
  });

  test("rótulo de 200 caracteres não passa de 150", () => {
    expect(proposeAlt("x".repeat(200), 12).length).toBeLessThanOrEqual(150);
  });
});

describe("currentValue", () => {
  test("o override vale mais que o valor auditado", () => {
    const p = page({ overrides: { title: "Do painel" }, facts: perfectFacts({ title: "Da auditoria" }) });
    expect(currentValue(p, "title")).toBe("Do painel");
    expect(currentValue(page({ facts: perfectFacts({ description: "Auditada" }) }), "description")).toBe("Auditada");
    expect(currentValue(page({ facts: null }), "ogImage")).toBe("");
  });
});

describe("buildProposals: título", () => {
  test("inclui página pt com o check falhando e traz antes e depois", () => {
    const items = buildProposals("titulo", [page({ checks: [check("titulo")] })]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "titulo:/produtos/esteira-dalla:", kind: "titulo", field: "title", path: "/produtos/esteira-dalla", label: "Esteira Dalla", before: "T" });
    expect(items[0]!.after).toBe(proposeTitle("Esteira Dalla"));
  });

  test("exclui inglês, espanhol, página sem auditoria e check que passou ou foi pulado", () => {
    const items = buildProposals("titulo", [
      page({ path: "/en/a", lang: "en", checks: [check("titulo")] }),
      page({ path: "/es/a", lang: "es", checks: [check("titulo")] }),
      page({ path: "/b", facts: null, checks: [check("titulo")] }),
      page({ path: "/c", checks: [check("titulo", { ok: true })] }),
      page({ path: "/d", checks: [check("titulo", { skipped: true })] }),
      page({ path: "/e", checks: [check("descricao")] }),
    ]);
    expect(items).toEqual([]);
  });

  test("exclui o item em que o depois é igual ao antes", () => {
    const same = proposeTitle("Esteira Dalla");
    expect(buildProposals("titulo", [page({ overrides: { title: same }, checks: [check("titulo")] })])).toEqual([]);
  });

  test("o texto proposto não leva tags nem espaços repetidos mesmo com rótulo sujo", () => {
    const [it] = buildProposals("titulo", [page({ label: "  <i>Esteira</i>   Dalla ", checks: [check("titulo")] })]);
    expect(it!.after).toBe("Esteira Dalla | Demakine Limeira/SP");
  });
});

describe("buildProposals: descrição", () => {
  test("usa o campo description e a faixa de 70 a 155", () => {
    const [it] = buildProposals("descricao", [page({ checks: [check("descricao")] })]);
    expect(it).toMatchObject({ kind: "descricao", field: "description", before: "D" });
    expect(it!.after.length).toBeGreaterThanOrEqual(70);
    expect(it!.after.length).toBeLessThanOrEqual(155);
  });
});

describe("buildProposals: imagens", () => {
  const base = "https://www.demakine.com.br/img/produtos/esteira-dalla";
  const imgs = [
    { src: "https://www.demakine.com.br/img/site/logo.webp", alt: null },
    { src: `${base}/1.webp`, alt: null },
    { src: `${base}/2.webp`, alt: "Já descrita" },
    { src: `${base}/3.webp`, alt: "" },
    { src: "https://www.demakine.com.br/img/produtos/outro-produto/1.webp", alt: null },
  ];

  test("um item por foto do produto sem alt, numerada pela posição entre as fotos do próprio produto", () => {
    const items = buildProposals("imagens", [page({ facts: perfectFacts({ images: imgs }), checks: [check("imagens")] })]);
    expect(items.map((i) => [i.target, i.after, i.field, i.before])).toEqual([
      [`${base}/1.webp`, "Esteira Dalla Demakine, foto 1", "alt", ""],
      [`${base}/3.webp`, "Esteira Dalla Demakine, foto 3", "alt", ""],
    ]);
    expect(items[0]!.id).toBe(`imagens:/produtos/esteira-dalla:${base}/1.webp`);
  });

  test("só páginas de produto: outras áreas não entram", () => {
    const items = buildProposals("imagens", [page({ path: "/blog/post", area: "blog", facts: perfectFacts({ images: imgs }), checks: [check("imagens")] })]);
    expect(items).toEqual([]);
  });
});

describe("buildProposals: compartilhamento", () => {
  const own = "https://www.demakine.com.br/img/produtos/a/1.webp";

  test("sem imagem de compartilhamento, usa o caminho da primeira foto do próprio site", () => {
    const items = buildProposals("compartilhamento", [
      page({ facts: perfectFacts({ og: {}, images: [{ src: "https://cdn.outro.com/x.jpg", alt: "x" }, { src: own, alt: "a" }] }), checks: [check("compartilhamento")] }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: "compartilhamento", field: "ogImage", before: "", after: "/img/produtos/a/1.webp" });
  });

  test("não propõe quando já há imagem no override ou na página", () => {
    expect(buildProposals("compartilhamento", [page({ overrides: { ogImage: "/x.webp" }, facts: perfectFacts({ og: {}, images: [{ src: own, alt: "a" }] }), checks: [check("compartilhamento")] })])).toEqual([]);
    expect(buildProposals("compartilhamento", [page({ facts: perfectFacts({ og: { image: "https://www.demakine.com.br/og.jpg" }, images: [{ src: own, alt: "a" }] }), checks: [check("compartilhamento")] })])).toEqual([]);
  });

  test("sem foto do próprio site, nenhum item", () => {
    expect(buildProposals("compartilhamento", [page({ facts: perfectFacts({ og: {}, images: [{ src: "https://cdn.outro.com/x.jpg", alt: "x" }] }), checks: [check("compartilhamento")] })])).toEqual([]);
  });
});

test("FIX_KINDS lista os quatro tipos corrigíveis", () => {
  expect([...FIX_KINDS]).toEqual(["titulo", "descricao", "compartilhamento", "imagens"]);
});
