import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { METRICS } from "../../src/api/lib/seo/duel-metrics";
import { FIX_KINDS } from "../../src/api/lib/seo/fix-rules";
import { actionKind, FIXABLE, lengthState } from "../../src/web/admin/seo-geo/model";

const src = (f: string) => readFileSync(new URL(`../../src/web/admin/seo-geo/${f}`, import.meta.url), "utf8");

describe("contrato do botão Corrigir no painel", () => {
  test("a lista de métricas corrigíveis do painel é igual à FIX_KINDS da API", () => {
    expect([...FIXABLE]).toEqual([...FIX_KINDS]);
  });

  test("Corrigir para as corrigíveis e Copiar prompt para todas as outras métricas do duelo", () => {
    for (const m of METRICS) expect(actionKind(m), m).toBe(FIX_KINDS.some((k) => k === m) ? "corrigir" : "prompt");
  });

  test("duel.tsx decide o botão por actionKind e usa os dois componentes", () => {
    const duel = src("duel.tsx");
    expect(duel).toContain("actionKind(");
    expect(duel).toContain("<FixReview");
    expect(duel).toContain("<PromptButton");
    expect(duel).toContain("<Lotes");
    const review = src("fix-review.tsx");
    expect(review).toContain("Corrigir");
    expect(review).toContain("Copiar prompt");
    expect(review).toContain("Desfazer");
    expect(review).toContain("a correção é no código");
    expect(review).toMatch(/failing > 0[\s\S]*<PromptButton/);
  });
});

describe("lengthState (contador de caracteres da tela de revisão)", () => {
  test("título de 30 a 60", () => {
    expect(lengthState("title", "a".repeat(29))).toBe("curto");
    expect(lengthState("title", "a".repeat(30))).toBe("ok");
    expect(lengthState("title", "a".repeat(60))).toBe("ok");
    expect(lengthState("title", "a".repeat(61))).toBe("longo");
  });
  test("descrição de 70 a 155 e alt até 150", () => {
    expect(lengthState("description", "a".repeat(69))).toBe("curto");
    expect(lengthState("description", "a".repeat(155))).toBe("ok");
    expect(lengthState("description", "a".repeat(156))).toBe("longo");
    expect(lengthState("alt", "a")).toBe("ok");
    expect(lengthState("alt", "a".repeat(151))).toBe("longo");
    expect(lengthState("alt", "")).toBe("curto");
  });
  test("imagem de compartilhamento só precisa não estar vazia", () => {
    expect(lengthState("ogImage", "")).toBe("curto");
    expect(lengthState("ogImage", "/img/a.webp")).toBe("ok");
  });
});
