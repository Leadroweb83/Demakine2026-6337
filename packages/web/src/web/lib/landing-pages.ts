/**
 * As 10 páginas com URL própria (4 categorias e 6 comerciais). O texto é do Marketing: fica em content/landing/*.md e
 * vira src/web/data/landing.json com `bun run landing:build`. Aqui só se junta o que depende do site (mensagem do
 * WhatsApp, empresa no schema, foto de apoio).
 */

import data from "@/data/landing.json";
import type { LandingDoc } from "./landing-md";
import { WA } from "./landing-links";
import { site } from "./site";

export type Landing = LandingDoc & {
  waMessage: string;
  /** schema da página, já com a empresa e o site escritos por extenso */
  schema: Record<string, unknown>[];
  /** foto do topo: a da nota do Marketing, senão a do primeiro produto, senão esta */
  heroFallback?: string;
};

const COMPANY = { "@type": "Organization", "@id": `${site.url}/#empresa`, name: site.name, url: site.url };
const WEBSITE = { "@type": "WebSite", "@id": `${site.url}/#site`, name: site.name, url: site.url };

/** O Marketing aponta a empresa e o site só por @id; fora da home essa referência fica solta, então ela é escrita por extenso. */
function resolveRefs(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(resolveRefs);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length === 1 && keys[0] === "@id") {
      if (String(o["@id"]).endsWith("#empresa")) return COMPANY;
      if (String(o["@id"]).endsWith("#website")) return WEBSITE;
    }
    return Object.fromEntries(Object.entries(o).map(([k, x]) => [k, resolveRefs(x)]));
  }
  return v;
}

/** Sem foto citada na nota do Marketing: a página do fabricante usa a foto da fábrica. */
const HERO_FALLBACK: Record<string, string> = {
  "fabricante-de-esteira-transportadora": "/img/site/fabrica.webp",
};

export const landingPages: Landing[] = (data as unknown as LandingDoc[]).map((d) => ({
  ...d,
  waMessage: WA[d.slug] ?? "Olá! Quero falar com um vendedor.",
  schema: d.jsonLd.map((n) => ({ "@context": "https://schema.org", ...(resolveRefs(n) as Record<string, unknown>) })),
  heroFallback: HERO_FALLBACK[d.slug],
}));

export function landingFor(path: string): Landing | undefined {
  const slug = path.split("?")[0]!.replace(/^\/+|\/+$/g, "");
  return landingPages.find((l) => l.slug === slug);
}
