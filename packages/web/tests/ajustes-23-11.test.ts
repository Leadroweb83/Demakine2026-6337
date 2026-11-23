/**
 * Ajustes do documento "Ajustes Site - 23/11": o texto pequeno acima do título da home some da tela (mas o H1 fica no HTML,
 * para o Google) e a caixa de clientes por estado sai da seção "Brasil inteiro", que fica só com o "+ de 8 mil".
 * Lê o HTML pré-renderizado (dist/): rode o build de 3 passos antes.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

const home = readFileSync("dist/index.html", "utf8");
const h1s = [...home.matchAll(/<h1([^>]*)>([\s\S]*?)<\/h1>/g)].map((m) => ({ attrs: m[1] ?? "", text: (m[2] ?? "").replace(/<[^>]+>/g, "").trim() }));

describe("H1 da home", () => {
  test("a home tem um único H1, e ele diz o que a empresa faz", () => {
    expect(h1s).toHaveLength(1);
    expect(h1s[0]!.text).toBe("Fábrica de Esteiras Transportadoras, Roscas e Elevadores sob medida");
  });

  test("o H1 não aparece na tela (só para leitor de tela e buscadores)", () => {
    expect(h1s[0]!.attrs).toMatch(/class="[^"]*\bsr-only\b/);
  });
});

describe("seção Brasil inteiro", () => {
  test("a caixa de clientes por estado saiu da home", () => {
    expect(home).not.toContain("Clientes nossos neste estado");
    expect(home).not.toContain("Cliente nosso neste estado");
    expect(home).not.toContain("direto da fábrica em Limeira/SP, com logística acompanhada e assistência técnica própria");
  });

  test("o cartão do total de clientes continua", () => {
    expect(home).toContain("Brasil inteiro");
    expect(home).toContain("clientes atendidos no Brasil");
  });

  test("o mapa virou desenho: nenhum estado recebe foco ou clique", () => {
    const paths = [...home.matchAll(/<path[^>]*class="uf-path[^"]*"[^>]*>/g)].map((m) => m[0]);
    expect(paths.length).toBeGreaterThanOrEqual(27);
    for (const p of paths) expect(p).not.toMatch(/tabindex/i);
  });

  test("a planilha de clientes por estado saiu do código", () => {
    expect(existsSync("src/web/data/state-clients.ts")).toBe(false);
  });
});
