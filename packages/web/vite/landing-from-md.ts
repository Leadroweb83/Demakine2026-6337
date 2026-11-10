/**
 * Converte as páginas do Marketing (content/landing/*.md) em src/web/data/landing.json, que é o que o site lê.
 * Rodar depois de qualquer edição nos .md:  bun run landing:build
 * O teste tests/landing-pages.test.ts falha se o JSON ficar fora de sincronia com os arquivos.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseLandingMd, type LandingDoc } from "../src/web/lib/landing-md";

const root = join(import.meta.dir, "..");

export function buildLanding(): { docs: LandingDoc[]; dropped: Record<string, string[]> } {
  const dir = join(root, "content/landing");
  const docs: LandingDoc[] = [];
  const dropped: Record<string, string[]> = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const { doc, droppedFaq } = parseLandingMd(readFileSync(join(dir, file), "utf8"), {
      imageExists: (p) => existsSync(join(root, "public", p)),
    });
    docs.push(doc);
    if (droppedFaq.length) dropped[doc.slug] = droppedFaq;
  }
  return { docs, dropped };
}

export const serialize = (docs: LandingDoc[]) => JSON.stringify(docs, null, 1) + "\n";

if (import.meta.main) {
  const { docs, dropped } = buildLanding();
  writeFileSync(join(root, "src/web/data/landing.json"), serialize(docs));
  console.log(`${docs.length} páginas escritas em src/web/data/landing.json`);
  for (const [slug, qs] of Object.entries(dropped)) console.log(`  FAQ fora por [CONFIRMAR] em ${slug}: ${qs.join(" | ")}`);
}
