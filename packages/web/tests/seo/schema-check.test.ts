import { describe, expect, test } from "bun:test";
import { checkSchema } from "../../src/api/lib/seo/schema-check";

describe("checkSchema", () => {
  test("Product sem offers: faltando, citando offers", () => {
    const r = checkSchema([{ "@type": "Product", name: "X", image: ["a.jpg"] }], ["Product"]);
    expect(r).toEqual([{ type: "Product", level: "faltando", message: expect.stringContaining("offers") }]);
  });

  test("Product completo está ok", () => {
    const r = checkSchema([{ "@type": "Product", name: "X", image: "a.jpg", offers: { "@type": "Offer" } }], ["Product"]);
    expect(r).toEqual([{ type: "Product", level: "ok", message: expect.any(String) }]);
  });

  test("FAQPage com mainEntity vazio é erro", () => {
    expect(checkSchema([{ "@type": "FAQPage", mainEntity: [] }], [])[0]).toMatchObject({ type: "FAQPage", level: "erro" });
    expect(checkSchema([{ "@type": "FAQPage" }], [])[0]).toMatchObject({ level: "erro" });
  });

  test("tipo esperado que não existe: faltando", () => {
    const r = checkSchema([{ "@type": "BreadcrumbList", itemListElement: [{}] }], ["Product", "BreadcrumbList"]);
    expect(r.find((x) => x.type === "Product")).toMatchObject({ level: "faltando", message: expect.stringContaining("Product") });
    expect(r.find((x) => x.type === "BreadcrumbList")?.level).toBe("ok");
  });

  test("Article exige headline e datePublished; Organization exige name e url; lista de tipos", () => {
    expect(checkSchema([{ "@type": "Article", headline: "h" }], [])[0]).toMatchObject({ level: "faltando", message: expect.stringContaining("datePublished") });
    expect(checkSchema([{ "@type": ["Organization", "LocalBusiness"], name: "D", url: "https://x" }], ["Organization"])[0]).toMatchObject({ type: "Organization", level: "ok" });
  });

  test("lixo não derruba", () => {
    expect(checkSchema([null, 3, "x", {}], ["Product"])).toEqual([{ type: "Product", level: "faltando", message: expect.any(String) }]);
  });
});
