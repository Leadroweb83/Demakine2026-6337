import { describe, expect, test } from "bun:test";
import { actionsFor, type DuelAction } from "../../src/api/lib/seo/duel-actions";
import { METRICS, type MetricId, type Verdict } from "../../src/api/lib/seo/duel-metrics";
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

/** Pacote montado com o texto REAL da ação (o do duelo), não com o texto de mentira do helper `action`. */
const real = (m: MetricId): ReturnType<typeof buildPromptPack> => {
  const unit: Verdict["unit"] = m === "tamanho" ? "paginas" : m === "blog" ? "posts" : "pontos";
  const vd: Verdict = { metric: m, ours: 78, theirs: 100, diff: -22, result: "pior", unit };
  const [a] = actionsFor({ "Demakine Antigo": [vd] }, []);
  return buildPromptPack(a!, vd);
};
const regras = (m: MetricId) => real(m).regras.join("\n");
const contexto = (m: MetricId) => real(m).contexto.join("\n");

describe("prompt feito para quem recebe o JSON fora do painel", () => {
  test("nenhum objetivo manda olhar uma aba do painel nem o mapa de conteúdo", () => {
    for (const m of METRICS) expect(real(m).objetivo, m).not.toMatch(/\baba\b|mapa de conte[úu]do/i);
  });

  test("a regra de título, descrição e H1 só vai onde faz sentido", () => {
    for (const m of ["schema", "idiomas"] as const) expect(regras(m), m).not.toMatch(/30 a 60|70 a 155/);
    for (const m of ["tamanho", "blog", "titulo", "descricao"] as const) expect(regras(m), m).toMatch(/30 a 60|70 a 155/);
  });

  test("dados estruturados: meta de 3 tipos, sem inventar conteúdo, validação e arquivos certos", () => {
    expect(regras("schema")).toMatch(/3 tipos/);
    expect(regras("schema")).toMatch(/FAQPage só com perguntas e respostas que já estão visíveis/);
    expect(regras("schema")).toMatch(/Rich Results/);
    const c = contexto("schema");
    expect(c).toContain("src/web/components/seo.tsx");
    expect(c).toContain("src/web/lib/schema.ts");
    expect(c).toContain("expectedSchema");
    expect(c).toContain("src/api/lib/seo/pages.ts");
    expect(c).toContain("schema-expectations");
    expect(c).toMatch(/78/);
    expect(c).toMatch(/Demakine Antigo 100/);
  });

  test("dados estruturados: explica a conta da nota e o que fazer quando a lista de páginas vem vazia", () => {
    const c = contexto("schema");
    expect(c).toMatch(/min\(tipos/);
    expect(c).toMatch(/paginasAlvo/);
  });

  test("tamanho: meta por busca real, aviso contra página fina e sitemap para não duplicar assunto", () => {
    const r = regras("tamanho");
    expect(r).toMatch(/demanda de busca/i);
    expect(r).toMatch(/página fina/i);
    expect(r).toContain("sitemap.xml");
    const c = contexto("tamanho");
    expect(c).toMatch(/não é igualar o número/i);
    expect(c).toContain("https://www.demakine.com.br/sitemap.xml");
  });

  test("tamanho: diz onde criar cada tipo de página e que as de URL própria ficam só em português", () => {
    const c = contexto("tamanho");
    expect(c).toContain("content/landing/*.md");
    expect(c).toContain("bun run landing:build");
    expect(c).toContain("/segmentos/:slug");
    const i18n = real("tamanho").regras.find((r) => r.includes("en.json"))!;
    expect(i18n).toMatch(/só em português/);
    expect(i18n).toMatch(/produto, segmento e post/);
  });

  test("as outras métricas seguem com a regra de tradução inteira", () => {
    for (const m of ["blog", "idiomas", "conteudo"] as const) expect(regras(m), m).toMatch(/en\.json[\s\S]*es\.json|es\.json[\s\S]*en\.json/);
  });

  test("nenhum pacote, de nenhuma métrica, leva segredo, senha ou variável de ambiente", () => {
    for (const m of METRICS) {
      const text = packToJson(real(m));
      for (const bad of ["password", "DATABASE_URL", "SECRET", "KEY", "token", "Bearer"]) expect(text, `${m}/${bad}`).not.toContain(bad);
    }
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
