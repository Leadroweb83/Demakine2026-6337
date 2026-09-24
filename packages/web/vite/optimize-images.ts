/**
 * Gera uma versão WebP ao lado de cada JPG/PNG de public/img (mesmo nome, até 1600 px de largura).
 * O site usa o WebP (lib/images.ts troca a extensão); o original fica para o compartilhamento em
 * redes que não aceitam WebP (og:image). Só converte o que ainda não tem WebP, então no build da
 * Vercel quase sempre é instantâneo. Uso: bun vite/optimize-images.ts
 *
 * Também grava src/web/data/image-originals.json: extensão original das imagens que não são .jpg,
 * para o og:image voltar ao arquivo certo.
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dir, "..");
const IMG = path.join(ROOT, "public", "img");
const MANIFEST = path.join(ROOT, "src", "web", "data", "image-originals.json");
const MAX_WIDTH = 1600;

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function main() {
  const t0 = Date.now();
  const files = (await walk(IMG)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const originals: Record<string, string> = {};
  let made = 0;
  let before = 0;
  let after = 0;
  for (const file of files) {
    const webp = file.replace(/\.(jpe?g|png)$/i, ".webp");
    const publicPath = (p: string) => "/" + path.relative(path.join(ROOT, "public"), p).split(path.sep).join("/");
    if (!/\.jpg$/.test(file)) originals[publicPath(webp)] = publicPath(file);
    const src = await stat(file);
    // no clone do Git as datas dos arquivos não dizem nada: se o WebP existe, vale
    // (trocou a foto mantendo o nome? apague o .webp e rode de novo)
    if (await stat(webp).catch(() => null)) continue;
    const img = sharp(file);
    const meta = await img.metadata();
    await img
      .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: 80, alphaQuality: 90, effort: 5 })
      .toFile(webp);
    before += src.size;
    after += (await stat(webp)).size;
    made++;
  }
  const sorted = Object.fromEntries(Object.entries(originals).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
  const saved = made ? ` (${(before / 1e6).toFixed(1)} MB para ${(after / 1e6).toFixed(1)} MB)` : "";
  console.log(`[imagens] ${made} convertidas para WebP de ${files.length}${saved} em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

main().catch((err) => {
  console.error("[imagens] falhou:", err);
  process.exit(1);
});
