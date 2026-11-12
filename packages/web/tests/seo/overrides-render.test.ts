/**
 * Ponta a ponta: o componente Seo lê a regra do painel e o HTML pré-renderizado sai com noindex, canonical e imagem
 * certos. Gera o próprio bundle de servidor (vite build --ssr, cerca de 1 s) em node_modules/.seo-ssr-test, porque o
 * prerender apaga o dist-ssr no fim.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { pathToFileURL } from "node:url";
import path from "node:path";

type Head = { meta: Map<string, { content: string }>; canonical?: string; title?: string };
type Entry = {
  render: (p: string, s: string) => Promise<{ html: string; head: Head }>;
  loadDict: (l: "pt" | "en" | "es") => Promise<Record<string, string>>;
  setLocale: (l: "pt" | "en" | "es", dict: Record<string, string>) => void;
};

let entry: Entry;
const setDocs = (seo: Record<string, unknown>) => {
  (globalThis as { __DM_CONTENT__?: unknown }).__DM_CONTENT__ = { docs: { seo }, deleted: {}, version: "teste" };
};

const ROOT = path.resolve(import.meta.dir, "../..");
const OUT = "node_modules/.seo-ssr-test";

beforeAll(async () => {
  const build = Bun.spawn(["bunx", "vite", "build", "--ssr", "src/web/entry-server.tsx", "--outDir", OUT], { cwd: ROOT, stdout: "ignore", stderr: "pipe" });
  const code = await build.exited;
  if (code !== 0) throw new Error(`vite build --ssr falhou: ${await new Response(build.stderr).text()}`);
  setDocs({});
  entry = (await import(pathToFileURL(path.join(ROOT, OUT, "entry-server.js")).href)) as Entry;
  entry.setLocale("pt", {});
}, 120_000);

describe("o site respeita as regras de SEO por página", () => {
  test("sem regra: indexável, com canonical", async () => {
    setDocs({});
    const { head } = await entry.render("/a-empresa", "");
    expect(head.meta.get("robots")).toBeUndefined();
    expect(head.canonical).toBe("https://www.demakine.com.br/a-empresa");
  });

  test("noindex do painel: robots noindex e sem canonical", async () => {
    setDocs({ "a-empresa": { noindex: true } });
    const { head } = await entry.render("/a-empresa", "");
    expect(head.meta.get("robots")?.content).toBe("noindex, follow");
    expect(head.canonical).toBeUndefined();
  });

  test("canonical manual do próprio domínio vale; de outro domínio é ignorado", async () => {
    setDocs({ "a-empresa": { canonical: "https://www.demakine.com.br/clientes" } });
    expect((await entry.render("/a-empresa", "")).head.canonical).toBe("https://www.demakine.com.br/clientes");
    setDocs({ "a-empresa": { canonical: "https://outro.com/x" } });
    expect((await entry.render("/a-empresa", "")).head.canonical).toBe("https://www.demakine.com.br/a-empresa");
  });

  test("imagem de compartilhamento do painel", async () => {
    setDocs({ "a-empresa": { ogImage: "https://www.demakine.com.br/img/site/capa.jpg" } });
    const { head } = await entry.render("/a-empresa", "");
    expect(head.meta.get("og:image")?.content).toBe("https://www.demakine.com.br/img/site/capa.jpg");
    expect(head.meta.get("twitter:image")?.content).toBe("https://www.demakine.com.br/img/site/capa.jpg");
  });

  test("título do painel continua valendo", async () => {
    setDocs({ "a-empresa": { title: "Título novo do painel" } });
    expect((await entry.render("/a-empresa", "")).head.title).toBe("Título novo do painel");
  });

  test("a regra de uma página não vaza para as outras", async () => {
    setDocs({ "a-empresa": { noindex: true } });
    const { head } = await entry.render("/clientes", "");
    expect(head.meta.get("robots")).toBeUndefined();
  });

  test("a versão em inglês tem a sua própria chave (en-...)", async () => {
    entry.setLocale("en", await entry.loadDict("en"));
    setDocs({ "en-a-empresa": { noindex: true } });
    const en = await entry.render("/en/a-empresa", "");
    expect(en.head.meta.get("robots")?.content).toBe("noindex, follow");
    entry.setLocale("pt", {});
    const pt = await entry.render("/a-empresa", "");
    expect(pt.head.meta.get("robots")).toBeUndefined();
  });
});
