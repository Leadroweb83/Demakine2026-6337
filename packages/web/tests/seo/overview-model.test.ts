import { describe, expect, test } from "bun:test";
import { AREA_LABELS, SECTOR_LABELS, dayDelta, formatWhen, scoreColor, scoreWord, sortIssues } from "../../src/web/admin/seo-geo/model";

describe("scoreColor", () => {
  test("90 a 100 verde, 50 a 89 amarelo, 0 a 49 vermelho (como o PageSpeed)", () => {
    expect(scoreColor(100)).toBe("verde");
    expect(scoreColor(90)).toBe("verde");
    expect(scoreColor(89)).toBe("amarelo");
    expect(scoreColor(50)).toBe("amarelo");
    expect(scoreColor(49)).toBe("vermelho");
    expect(scoreColor(0)).toBe("vermelho");
  });

  test("valores fora da faixa ou quebrados não derrubam", () => {
    expect(scoreColor(150)).toBe("verde");
    expect(scoreColor(-3)).toBe("vermelho");
    expect(scoreColor(Number.NaN)).toBe("vermelho");
    expect(scoreColor(89.6)).toBe("verde"); // arredonda antes de classificar, como o número mostrado
  });

  test("a palavra que acompanha a nota", () => {
    expect(scoreWord(95)).toBe("Bom");
    expect(scoreWord(70)).toBe("Pode melhorar");
    expect(scoreWord(20)).toBe("Ruim");
  });
});

const issue = (path: string, severity: "critico" | "atencao" | "info", code = "titulo") => ({ path, code, severity, message: `${code} em ${path}` });
const pages = new Map<string, { area: "comerciais" | "categorias" | "produtos" | "blog" | "institucional" }>([
  ["/esteira-transportadora-preco", { area: "comerciais" }],
  ["/esteiras-transportadoras", { area: "categorias" }],
  ["/produtos/rosca", { area: "produtos" }],
  ["/blog/x", { area: "blog" }],
  ["/a-empresa", { area: "institucional" }],
]);

describe("sortIssues", () => {
  test("crítico em página comercial vem antes de crítico em produto, e os dois antes de atenção comercial", () => {
    const sorted = sortIssues(
      [issue("/produtos/rosca", "critico"), issue("/esteira-transportadora-preco", "atencao"), issue("/esteira-transportadora-preco", "critico")],
      pages,
    );
    expect(sorted.map((i) => `${i.severity}:${i.path}`)).toEqual([
      "critico:/esteira-transportadora-preco",
      "critico:/produtos/rosca",
      "atencao:/esteira-transportadora-preco",
    ]);
  });

  test("dentro da mesma gravidade: comerciais e categorias, depois produtos, depois o resto, e por caminho", () => {
    const sorted = sortIssues([issue("/a-empresa", "atencao"), issue("/blog/x", "atencao"), issue("/produtos/rosca", "atencao"), issue("/esteiras-transportadoras", "atencao")], pages);
    expect(sorted.map((i) => i.path)).toEqual(["/esteiras-transportadoras", "/produtos/rosca", "/a-empresa", "/blog/x"]);
  });

  test("página que saiu da lista vai para o fim do seu grupo; não altera a lista de entrada", () => {
    const input = [issue("/sumiu", "info"), issue("/a-empresa", "info")];
    const copy = structuredClone(input);
    expect(sortIssues(input, pages).map((i) => i.path)).toEqual(["/a-empresa", "/sumiu"]);
    expect(input).toEqual(copy);
  });

  test("lista vazia", () => {
    expect(sortIssues([], pages)).toEqual([]);
  });
});

describe("dayDelta", () => {
  test("diferença entre os dois últimos dias", () => {
    expect(dayDelta([{ date: "2026-11-08", site: 70 }, { date: "2026-11-09", site: 80 }, { date: "2026-11-10", site: 77 }])).toBe(-3);
    expect(dayDelta([{ date: "2026-11-09", site: 80 }, { date: "2026-11-10", site: 85 }])).toBe(5);
    expect(dayDelta([{ date: "2026-11-09", site: 80 }, { date: "2026-11-10", site: 80 }])).toBe(0);
  });

  test("menos de 2 pontos devolve null", () => {
    expect(dayDelta([])).toBeNull();
    expect(dayDelta([{ date: "2026-11-10", site: 80 }])).toBeNull();
  });
});

describe("rótulos", () => {
  test("todos os setores e áreas têm nome em português", () => {
    expect(Object.keys(SECTOR_LABELS).sort()).toEqual(["compartilhamento", "conteudo", "idiomas", "imagens", "indexacao", "links", "schema", "titulo-descricao"]);
    expect(SECTOR_LABELS.schema.title).toBe("Dados estruturados");
    expect(SECTOR_LABELS["titulo-descricao"].title).toBe("Título e descrição");
    for (const s of Object.values(SECTOR_LABELS)) expect(s.hint.length).toBeGreaterThan(10);
    expect(Object.keys(AREA_LABELS).sort()).toEqual(["blog", "cases", "categorias", "comerciais", "exportacao", "institucional", "produtos", "segmentos", "tecnica", "vagas"]);
    expect(AREA_LABELS.comerciais).toBe("Páginas comerciais");
  });

  test("nenhum texto com travessão", () => {
    const all = [...Object.values(SECTOR_LABELS).flatMap((s) => [s.title, s.hint]), ...Object.values(AREA_LABELS)];
    for (const t of all) expect(t).not.toMatch(/[—–]/);
  });
});

describe("formatWhen", () => {
  const now = new Date("2026-11-11T18:00:00-03:00");
  test("hoje, ontem e dias antigos, no horário de Brasília", () => {
    expect(formatWhen("2026-11-11T10:12:00.000Z", now)).toBe("hoje às 07:12");
    expect(formatWhen("2026-11-10T10:05:00.000Z", now)).toBe("ontem às 07:05");
    expect(formatWhen("2026-11-03T10:05:00.000Z", now)).toBe("03/11 às 07:05");
  });

  test("data inválida não quebra", () => {
    expect(formatWhen("lixo", now)).toBe("");
  });
});
