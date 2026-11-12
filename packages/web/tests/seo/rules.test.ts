import { describe, expect, test } from "bun:test";
import { DEFAULT_RULES, effectiveWeights, isPriorityPath, validateRules, type SeoRules } from "../../src/api/lib/seo/rules";

const sum = (w: Record<string, number>) => Object.values(w).reduce((a, b) => a + b, 0);
const clone = (): SeoRules => structuredClone(DEFAULT_RULES);

describe("regras da nota de SEO", () => {
  test("o padrão soma exatamente 100 e usa os limites combinados", () => {
    expect(sum(DEFAULT_RULES.weights)).toBe(100);
    expect(DEFAULT_RULES.title).toEqual({ min: 30, max: 60 });
    expect(DEFAULT_RULES.description).toEqual({ min: 70, max: 155 });
    expect(DEFAULT_RULES.commercialMinWords).toBe(300);
    expect(DEFAULT_RULES.minInlinks).toBe(3);
    expect(DEFAULT_RULES.minOutlinks).toBe(3);
  });

  test("as páginas prioritárias padrão são as 10 comerciais e os produtos", () => {
    expect(DEFAULT_RULES.priorityPaths).toContain("/produtos/*");
    expect(DEFAULT_RULES.priorityPaths).toContain("/esteira-transportadora-preco");
    expect(DEFAULT_RULES.priorityPaths).toHaveLength(11);
    expect(isPriorityPath("/produtos/rosca-transportadora", DEFAULT_RULES)).toBe(true);
    expect(isPriorityPath("/esteiras-transportadoras", DEFAULT_RULES)).toBe(true);
    expect(isPriorityPath("/blog/x", DEFAULT_RULES)).toBe(false);
  });

  test("aceita o padrão", () => {
    const r = validateRules(DEFAULT_RULES);
    expect(r.ok).toBe(true);
  });

  test("recusa pesos que somam 99 ou 101", () => {
    for (const delta of [-1, 1]) {
      const r = clone();
      r.weights.titulo += delta;
      const v = validateRules(r);
      expect(v.ok).toBe(false);
      if (!v.ok) expect(v.errors).toContain("Os pesos precisam somar 100");
    }
  });

  test("recusa título mínimo maior que o máximo, peso negativo e link mínimo fracionário", () => {
    const a = clone();
    a.title = { min: 80, max: 60 };
    expect(validateRules(a).ok).toBe(false);

    const b = clone();
    b.weights.titulo = -5;
    b.weights.descricao += 20; // soma continua 100, mas o peso negativo é inválido
    expect(validateRules(b).ok).toBe(false);

    const c = clone();
    c.minInlinks = 2.5;
    expect(validateRules(c).ok).toBe(false);
  });

  test("recusa páginas prioritárias que não são endereços do site", () => {
    for (const bad of ["produtos", "https://outro.com/x", "//outro.com", "/com espaço", "/" + "x".repeat(250), "", "  "]) {
      const r = clone();
      r.priorityPaths = ["/ok", bad];
      const v = validateRules(r);
      // texto vazio é descartado (não é erro); o resto é recusado
      if (bad.trim() === "") expect(v.ok, JSON.stringify(bad)).toBe(true);
      else {
        expect(v.ok, bad).toBe(false);
        if (!v.ok) expect(v.errors[0]).toBe("Cada página prioritária precisa ser um endereço do site que começa com / e não tem espaços");
      }
    }
    const r = clone();
    r.priorityPaths = ["/a-empresa", "/produtos/*", "/blog/x"];
    expect(validateRules(r).ok).toBe(true);
  });

  test("curinga só vale no fim do endereço", () => {
    const r = clone();
    r.priorityPaths = ["/pro*dutos/x"];
    expect(validateRules(r).ok).toBe(false);
  });

  test("a mensagem de peso inválido usa o nome do item, não o código", () => {
    const r = clone() as unknown as { weights: Record<string, unknown> };
    r.weights.titulo = "muito";
    r.weights.h1 = Number.NaN;
    const v = validateRules(r);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errors).toContain('O peso de "Título" precisa ser um número de 0 a 100');
      expect(v.errors).toContain('O peso de "Título principal (H1)" precisa ser um número de 0 a 100');
      expect(v.errors.join(" ")).not.toContain("titulo");
    }
  });

  test("recusa lixo que não é objeto de regras", () => {
    expect(validateRules(null).ok).toBe(false);
    expect(validateRules("oi").ok).toBe(false);
    expect(validateRules({}).ok).toBe(false);
  });

  test("sem medição de velocidade, os 5 pontos se redistribuem e a soma continua 100", () => {
    const w = effectiveWeights(DEFAULT_RULES, false);
    expect(w.velocidade).toBe(0);
    expect(Math.abs(sum(w) - 100)).toBeLessThan(1e-9);
    expect(w.titulo).toBeCloseTo(15 * (100 / 95), 9);
  });

  test("com velocidade medida, devolve os pesos originais", () => {
    expect(effectiveWeights(DEFAULT_RULES, true)).toEqual(DEFAULT_RULES.weights);
  });
});
