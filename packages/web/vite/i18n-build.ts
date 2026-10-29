/**
 * Dicionários de tradução (inglês e espanhol).
 *
 * Fontes em i18n-src/:
 *   keys.json   { id: "texto em português" }            todo texto que precisa de tradução
 *   keep.json   ["texto que fica igual", ...]            nomes, modelos, medidas
 *   en/*.json   { id: "translation" }                    traduções por id (em partes)
 *   es/*.json   { id: "traducción" }
 *
 * Saída: src/web/i18n/en.json e es.json ("texto em português" -> tradução), usados pelo site.
 *
 *   bun vite/i18n-build.ts            gera os dicionários e diz quantos textos faltam
 *   bun vite/i18n-build.ts --add      soma a keys.json os textos novos sem tradução encontrados no
 *                                     último build com I18N_REPORT=1 (i18n-missing-en.json)
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const SRC = path.join(ROOT, "i18n-src");
const OUT = path.join(ROOT, "src", "web", "i18n");
const json = async <T>(file: string, fallback: T): Promise<T> => {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
};

const keys = await json<Record<string, string>>(path.join(SRC, "keys.json"), {});
const keep = await json<string[]>(path.join(SRC, "keep.json"), []);

if (process.argv.includes("--add")) {
  const known = new Set([...Object.values(keys), ...keep]);
  const found = [
    ...(await json<string[]>(path.join(ROOT, "i18n-missing-en.json"), [])),
    ...(await json<string[]>(path.join(ROOT, "i18n-missing-es.json"), [])),
    ...(await json<string[]>(path.join(ROOT, "i18n-extra.json"), [])),
  ];
  let n = Object.keys(keys).length;
  let added = 0;
  for (const text of found) {
    if (known.has(text)) continue;
    known.add(text);
    keys[`k${String(++n).padStart(5, "0")}`] = text;
    added++;
  }
  await writeFile(path.join(SRC, "keys.json"), JSON.stringify(keys, null, 1));
  console.log(`[i18n] ${added} textos novos em keys.json (total ${n})`);
}

for (const lang of ["en", "es"]) {
  const dir = path.join(SRC, lang);
  const byId: Record<string, string> = {};
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".json")).sort()) {
    const part = await json<Record<string, string>>(path.join(dir, f), {});
    for (const [raw, text] of Object.entries(part)) {
      // nas partes o id pode vir curto ("12" = k00012)
      const id = /^\d+$/.test(raw) ? `k${raw.padStart(5, "0")}` : raw;
      if (!(id in keys)) console.warn(`[i18n] ${lang}/${f}: id desconhecido ${id}`);
      byId[id] = text;
    }
  }
  const dict: Record<string, string> = {};
  const missing: string[] = [];
  for (const [id, pt] of Object.entries(keys)) {
    const t = byId[id];
    if (t === undefined) missing.push(id);
    // texto que fica igual também entra: assim a conferência do build sabe que ele já foi visto
    else dict[pt] = t;
  }
  await writeFile(path.join(OUT, `${lang}.json`), JSON.stringify(dict));
  console.log(`[i18n] ${lang}: ${Object.keys(dict).length} traduções, ${missing.length} faltando${missing.length ? ` (de ${missing[0]} a ${missing[missing.length - 1]})` : ""}`);
}
