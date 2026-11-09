import { describe, expect, test } from "bun:test";
import content from "../src/web/data/content.json";

type Product = {
  slug: string; name: string; category: string; summary: string; description: string;
  features: string[]; applications: string[]; models: { model: string; specs: Record<string, string> }[];
  specKeys: string[]; images: string[]; seoTitle?: string; seoDesc?: string;
};
const products = (content as { products: Product[] }).products;
const roletes = products.find((p) => p.slug === "esteira-de-roletes-livres");
const noDash = (s: string) => !s.includes("—") && !s.includes("–");

describe("produto Esteira de Roletes Livres", () => {
  test("existe no catálogo, na categoria esteiras-transportadoras", () => {
    expect(roletes).toBeDefined();
    expect(roletes!.category).toBe("esteiras-transportadoras");
    expect(roletes!.name).toBe("Esteira de Roletes Livres");
  });
  test("tem os 7 modelos ERL com as medidas da página antiga", () => {
    const m = roletes!.models;
    expect(m.map((x) => x.model)).toEqual(["ERL5", "ERL6", "ERL7", "ERL8", "ERL9", "ERL10", "ERL12"]);
    expect(m[0]!.specs).toEqual({ Comprimento: "5 m", Largura: "50 ou 60 cm", "Altura mínima": "700 mm", "Altura máxima": "1.000 mm", Capacidade: "70 kg/m" });
    expect(m[6]!.specs["Comprimento"]).toBe("12 m");
  });
  test("não tem coluna Velocidade nem Motor (equipamento sem motor)", () => {
    expect(roletes!.specKeys).toEqual(["Comprimento", "Largura", "Altura mínima", "Altura máxima", "Capacidade"]);
    for (const m of roletes!.models) expect(Object.keys(m.specs)).not.toContain("Velocidade");
  });
  test("traz a ficha técnica da página antiga", () => {
    const f = roletes!.features.join(" | ").toLowerCase();
    for (const t of ["viga", "galvanizado", "rolamentos", "desmontagem rápida", "rodízios", "azul"]) expect(f).toContain(t);
  });
  test("título até 60 e descrição até 155 caracteres, com o termo", () => {
    expect(roletes!.seoTitle!.length).toBeLessThanOrEqual(60);
    expect(roletes!.seoDesc!.length).toBeLessThanOrEqual(155);
    expect(roletes!.seoTitle!.toLowerCase()).toContain("esteira de roletes livres");
  });
  test("texto sem travessão", () => {
    const all = [roletes!.summary, roletes!.description, ...roletes!.features, ...roletes!.applications, roletes!.seoTitle!, roletes!.seoDesc!];
    for (const s of all) expect(noDash(s)).toBe(true);
  });
});
