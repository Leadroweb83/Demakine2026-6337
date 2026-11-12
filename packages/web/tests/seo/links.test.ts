import { describe, expect, test } from "bun:test";
import { checkLinks } from "../../src/api/lib/seo/links";

const res = (status: number, headers: Record<string, string> = {}) => new Response(null, { status, headers });
type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;
const fakeFetch = (h: Handler, calls: string[] = []) =>
  (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push(`${init?.method ?? "GET"} ${String(url)}`);
    return h(String(url), init);
  }) as typeof fetch;
const O = "https://www.demakine.com.br";

describe("checkLinks", () => {
  test("200 está bom, 404 está quebrado, 301 para 200 passa por um salto", async () => {
    const fetchHead = fakeFetch((url) => (url.endsWith("/ok") ? res(200) : url.endsWith("/sumiu") ? res(404) : url.endsWith("/velho") ? res(301, { location: "/novo" }) : res(200)));
    const found = new Map([[`${O}/sumiu`, ["/a", "/b"]]]);
    const r = await checkLinks([`${O}/ok`, `${O}/sumiu`, `${O}/velho`], found, { fetchHead });
    const by = Object.fromEntries(r.map((x) => [x.url.replace(O, ""), x]));
    expect(by["/ok"]).toMatchObject({ status: 200, broken: false, chain: [] });
    expect(by["/sumiu"]).toMatchObject({ status: 404, broken: true, foundOn: ["/a", "/b"] });
    expect(by["/velho"]).toMatchObject({ status: 200, broken: false, chain: [`${O}/novo`] });
    expect(by["/velho"]!.chain).toHaveLength(1);
  });

  test("laço de redirecionamentos para em 5 saltos e conta como quebrado", async () => {
    const calls: string[] = [];
    const fetchHead = fakeFetch(() => res(301, { location: "/volta" }), calls);
    const [r] = await checkLinks([`${O}/volta`], new Map(), { fetchHead });
    expect(r).toMatchObject({ broken: true, status: 0 });
    expect(r!.chain).toHaveLength(5);
    expect(calls.length).toBe(6);
  });

  test("com max 2 e 5 endereços testa só 2; repetidos contam uma vez", async () => {
    const calls: string[] = [];
    const fetchHead = fakeFetch(() => res(200), calls);
    const urls = [`${O}/a`, `${O}/a`, `${O}/b`, `${O}/c`, `${O}/d`, `${O}/e`];
    const r = await checkLinks(urls, new Map(), { max: 2, fetchHead });
    expect(r).toHaveLength(2);
    expect(r.map((x) => x.url)).toEqual([`${O}/a`, `${O}/b`]);
    expect(calls).toHaveLength(2);
  });

  test("o limite padrão é 800 endereços únicos", async () => {
    const urls = Array.from({ length: 900 }, (_, i) => `${O}/p${i}`);
    const r = await checkLinks(urls, new Map(), { fetchHead: fakeFetch(() => res(200)) });
    expect(r).toHaveLength(800);
  });

  test("endereço de outro site não é pedido e não aparece no resultado; caminho vira endereço completo", async () => {
    const calls: string[] = [];
    const fetchHead = fakeFetch(() => res(200), calls);
    const r = await checkLinks(["https://evil.com/x", "//evil.com/y", "file:///etc/passwd", "http://www.demakine.com.br/a", "/ok"], new Map(), { fetchHead });
    expect(r.map((x) => x.url)).toEqual([`${O}/ok`]);
    expect(calls).toEqual([`HEAD ${O}/ok`]);
  });

  test("redirecionamento para fora do site não é seguido", async () => {
    const calls: string[] = [];
    const fetchHead = fakeFetch(() => res(302, { location: "https://evil.com/x" }), calls);
    const [r] = await checkLinks([`${O}/a`], new Map(), { fetchHead });
    expect(calls).toEqual([`HEAD ${O}/a`]);
    expect(r).toMatchObject({ status: 302, broken: false, chain: [] });
  });

  test("servidor que não aceita HEAD (405) é testado de novo com GET", async () => {
    const calls: string[] = [];
    const fetchHead = fakeFetch((_u, init) => (init?.method === "HEAD" ? res(405) : res(200)), calls);
    const [r] = await checkLinks([`${O}/a`], new Map(), { fetchHead });
    expect(r).toMatchObject({ status: 200, broken: false });
    expect(calls).toEqual([`HEAD ${O}/a`, `GET ${O}/a`]);
  });

  test("erro de rede vira quebrado com status 0, sem derrubar a lista", async () => {
    const fetchHead = fakeFetch((url) => {
      if (url.endsWith("/cai")) throw new Error("ECONNRESET");
      return res(200);
    });
    const r = await checkLinks([`${O}/cai`, `${O}/ok`], new Map(), { fetchHead });
    expect(r.find((x) => x.url.endsWith("/cai"))).toMatchObject({ status: 0, broken: true });
    expect(r.find((x) => x.url.endsWith("/ok"))).toMatchObject({ status: 200, broken: false });
  });

  test("lista vazia", async () => {
    expect(await checkLinks([], new Map(), { fetchHead: fakeFetch(() => res(200)) })).toEqual([]);
  });
});
