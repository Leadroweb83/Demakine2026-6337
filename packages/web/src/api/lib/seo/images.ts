/** Problemas de imagem por página (puro): sem descrição (alt), nome só com número e arquivo pesado. */
import type { PageFacts } from "./html";

export type ImageIssue = { src: string; page: string; problems: ("sem-alt" | "nome-numerico" | "pesada")[]; bytes?: number };

const MAX_BYTES = 300 * 1024;
const NUMERIC = /^\d+\.(webp|jpe?g|png)$/i;

export function imageIssues(pages: { path: string; images: PageFacts["images"] }[], sizes: Map<string, number>): ImageIssue[] {
  const out: ImageIssue[] = [];
  const seen = new Set<string>();
  for (const page of pages) {
    for (const img of page.images) {
      if (img.src.startsWith("data:")) continue;
      const key = `${page.path}\u0000${img.src}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const problems: ImageIssue["problems"] = [];
      if (!(img.alt ?? "").trim()) problems.push("sem-alt");
      if (NUMERIC.test(img.src.split("?")[0]!.split("/").pop() ?? "")) problems.push("nome-numerico");
      const bytes = sizes.get(img.src);
      if (bytes !== undefined && bytes > MAX_BYTES) problems.push("pesada");
      if (problems.length) out.push({ src: img.src, page: page.path, problems, ...(bytes !== undefined && problems.includes("pesada") ? { bytes } : {}) });
    }
  }
  return out;
}
