import { describe, expect, test } from "bun:test";
import type { DuelAction } from "../../src/api/lib/seo/duel-actions";
import type { MetricId, Verdict } from "../../src/api/lib/seo/duel-metrics";
import { buildPromptPack, packToJson } from "../../src/api/lib/seo/fix-prompt";

const action = (metric: MetricId, over: Partial<DuelAction> = {}): DuelAction => ({
  metric,
  competitor: "Jumak",
  gap: 30,
  effort: "alto",
  title: "Passar Jumak em tamanho do site",
  how: "A Jumak tem mais páginas indexáveis.",
  pages: [{ path: "/produtos", label: "Produtos" }],
  ...over,
});
const verdict = (metric: MetricId, unit: Verdict["unit"] = "paginas"): Verdict => ({ metric, ours: 90, theirs: 120, diff: -30, result: "pior", unit });

describe("buildPromptPack", () => {
  test("o tipo do pedido segue a métrica", () => {
    const tipo = (m: MetricId) => buildPromptPack(action(m), verdict(m)).tipo;
    expect(tipo("tamanho")).toBe("pagina");
    expect(tipo("blog")).toBe("post");
    for (const m of ["h1", "schema", "idiomas"] as const) expect(tipo(m)).toBe("codigo");
    expect(tipo("conteudo")).toBe("texto");
  });

  test("traz o concorrente, os números e as páginas alvo", () => {
    const p = buildPromptPack(action("tamanho"), verdict("tamanho"));
    expect(p).toMatchObject({ versao: 1, metrica: "tamanho", concorrente: "Jumak", diferenca: { nos: 90, eles: 120, unidade: "paginas" } });
    expect(p.paginasAlvo).toEqual([{ path: "/produtos", label: "Produtos" }]);
    expect(p.objetivo).toContain("Passar Jumak em tamanho do site");
    expect(p.objetivo).toContain("A Jumak tem mais páginas indexáveis.");
  });

  test("as regras pedem tradução em inglês e espanhol e a entrega só vai ao ar com a autorização do dono", () => {
    const p = buildPromptPack(action("blog"), verdict("blog", "posts"));
    expect(p.regras.join(" ")).toMatch(/en\.json/);
    expect(p.regras.join(" ")).toMatch(/es\.json/);
    expect(p.entrega.join(" ")).toContain("merge só acontece com a autorização do dono");
    expect(p.entrega.join(" ")).toMatch(/branch/);
    expect(p.entrega.join(" ")).toMatch(/preview/);
  });
});

describe("packToJson", () => {
  test("é JSON válido que volta a ser o mesmo pacote", () => {
    const p = buildPromptPack(action("tamanho"), verdict("tamanho"));
    expect(JSON.parse(packToJson(p))).toEqual(p);
  });

  test("não leva segredo, senha nem variável de ambiente", () => {
    const text = packToJson(buildPromptPack(action("schema"), verdict("schema", "pontos")));
    for (const bad of ["password", "DATABASE_URL", "SECRET", "KEY", "token", "Bearer"]) expect(text, bad).not.toContain(bad);
  });
});
