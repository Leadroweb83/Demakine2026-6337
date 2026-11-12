import { describe, expect, test } from "bun:test";
import { DEFAULT_RULES } from "../../src/api/lib/seo/rules";
import { scorePage } from "../../src/api/lib/seo/score";
import { alertsFor, diffIssues, issuesFromChecks, type Issue } from "../../src/api/lib/seo/issues";
import { perfectCtx, perfectFacts } from "./helpers/facts";

const checksOf = (facts = {}, ctx = {}) => scorePage(perfectFacts(facts), perfectCtx(ctx), DEFAULT_RULES, false).checks;
const issues = (facts = {}, ctx = {}, flags = { indexable: true, technical: false }) => issuesFromChecks("/pagina", checksOf(facts, ctx), flags);

describe("issuesFromChecks", () => {
  test("página perfeita não gera problema", () => {
    expect(issues()).toEqual([]);
  });

  test("página que respondeu 404 gera um problema crítico, só da indexação", () => {
    const r = issues({}, { statusCode: 404 }, { indexable: false, technical: false });
    expect(r).toEqual([{ path: "/pagina", code: "status", severity: "critico", message: "A página respondeu 404" }]);
  });

  test("sem título e sem H1 são críticos; sem descrição é atenção", () => {
    const r = issues({ title: null, h1s: [], description: null });
    expect(r.find((i) => i.code === "titulo")?.severity).toBe("critico");
    expect(r.find((i) => i.code === "h1")?.severity).toBe("critico");
    expect(r.find((i) => i.code === "descricao")?.severity).toBe("atencao");
  });

  test("falha leve (descrição um pouco curta) é só informação", () => {
    const r = issues({ description: "x".repeat(60) });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ code: "descricao", severity: "info" });
  });

  test("página comum com noindex vira atenção; página técnica noindex não gera problema", () => {
    const comum = issuesFromChecks("/pagina", checksOf({ robots: "noindex" }), { indexable: false, technical: false });
    expect(comum).toEqual([expect.objectContaining({ code: "noindex", severity: "atencao" })]);
    const tecnica = issuesFromChecks("/obrigado", checksOf({ robots: "noindex", title: null }, { technical: true }), { indexable: false, technical: true });
    expect(tecnica).toEqual([]);
  });

  test("página técnica que sumiu (404) continua sendo problema crítico", () => {
    const r = issuesFromChecks("/obrigado", checksOf({}, { statusCode: 404, technical: true }), { indexable: false, technical: true });
    expect(r).toEqual([expect.objectContaining({ code: "status", severity: "critico" })]);
  });

  test("página fora do Google por engano só reclama da indexação, não de imagem ou texto", () => {
    const r = issuesFromChecks("/pagina", checksOf({ robots: "noindex", images: [{ src: "https://x/a.webp", alt: null }] }), { indexable: false, technical: false });
    expect(r.map((i) => i.code)).toEqual(["noindex"]);
  });

  test("a mensagem vem do item e o caminho é o da página", () => {
    const r = issues({ images: [{ src: "https://x/a.webp", alt: null }] });
    expect(r).toEqual([expect.objectContaining({ path: "/pagina", code: "imagens", message: expect.stringContaining("sem descrição") })]);
  });
});

const issue = (path: string, code: string, severity: Issue["severity"] = "atencao"): Issue => ({ path, code, severity, message: `${code} em ${path}` });

describe("diffIssues", () => {
  test("separa o que abriu, o que resolveu e o que continua", () => {
    const a = issue("/a", "titulo");
    const b = issue("/b", "h1");
    const c = issue("/c", "imagens");
    const d = diffIssues([a, b], [b, c]);
    expect(d.opened).toEqual([c]);
    expect(d.resolved).toEqual([a]);
    expect(d.kept).toEqual([b]);
  });

  test("o mesmo código em páginas diferentes são problemas diferentes", () => {
    const d = diffIssues([issue("/a", "titulo")], [issue("/a", "titulo"), issue("/b", "titulo")]);
    expect(d.opened).toEqual([issue("/b", "titulo")]);
    expect(d.kept).toHaveLength(1);
  });

  test("listas vazias", () => {
    expect(diffIssues([], [])).toEqual({ opened: [], resolved: [], kept: [] });
  });
});

describe("alertsFor", () => {
  test("queda maior que 5 pontos avisa, queda de 2 não", () => {
    expect(alertsFor([], 6)).toEqual(["A nota do site caiu 6 pontos"]);
    expect(alertsFor([], 5)).toEqual([]);
    expect(alertsFor([], 2)).toEqual([]);
    expect(alertsFor([], -4)).toEqual([]);
  });

  test("problema crítico novo avisa; os que não são críticos não", () => {
    const out = alertsFor([issue("/a", "status", "critico"), issue("/b", "imagens", "atencao")], 0);
    expect(out).toEqual(["Problema crítico novo em /a: status em /a"]);
  });

  test("muitos críticos novos viram um resumo", () => {
    const many = Array.from({ length: 8 }, (_, i) => issue(`/p${i}`, "status", "critico"));
    const out = alertsFor(many, 0);
    expect(out).toHaveLength(6);
    expect(out.at(-1)).toBe("E mais 3 problemas críticos novos");
  });

  test("nenhum texto com travessão", () => {
    const out = alertsFor([issue("/a", "status", "critico")], 9);
    expect(out.join(" ")).not.toMatch(/[—–]/);
  });
});
