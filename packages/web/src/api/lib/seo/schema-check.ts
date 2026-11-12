/** Confere os dados estruturados (JSON-LD) de uma página: campos obrigatórios por tipo e tipos esperados que faltam. */
export type SchemaFinding = { type: string; level: "ok" | "faltando" | "erro"; message: string };

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" : v !== undefined && v !== null);
const REQUIRED: Record<string, string[]> = {
  Product: ["name", "image", "offers"],
  BreadcrumbList: ["itemListElement"],
  Article: ["headline", "datePublished"],
  Organization: ["name", "url"],
};

function typesOf(node: unknown): string[] {
  const t = (node as { "@type"?: unknown } | null)?.["@type"];
  return typeof t === "string" ? [t] : Array.isArray(t) ? t.filter((x): x is string => typeof x === "string") : [];
}

export function checkSchema(jsonLd: unknown[], expected: string[]): SchemaFinding[] {
  const out: SchemaFinding[] = [];
  const present = new Set<string>();
  for (const node of jsonLd) {
    if (typeof node !== "object" || node === null) continue;
    for (const type of typesOf(node)) {
      present.add(type);
      const n = node as Record<string, unknown>;
      if (type === "FAQPage") {
        out.push(filled(n.mainEntity) ? { type, level: "ok", message: "FAQPage com perguntas" } : { type, level: "erro", message: "FAQPage sem perguntas (mainEntity vazio): o Google ignora" });
      } else if (REQUIRED[type]) {
        const missing = REQUIRED[type]!.filter((f) => !filled(n[f]));
        out.push(missing.length ? { type, level: "faltando", message: `${type}: falta ${missing.join(", ")}` } : { type, level: "ok", message: `${type}: completo` });
      }
    }
  }
  for (const type of expected) if (!present.has(type)) out.push({ type, level: "faltando", message: `Falta o dado estruturado ${type} nesta página` });
  return out;
}
