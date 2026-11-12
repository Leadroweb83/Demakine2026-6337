import { describe, expect, test } from "bun:test";
import { ALLOWED_HOSTS, assertAllowedUrl, fetchPage, pool } from "../../src/api/lib/seo/crawl";

describe("assertAllowedUrl: só o domínio do próprio site", () => {
  test("aceita os dois hosts em https", () => {
    expect(ALLOWED_HOSTS).toEqual(["demakine.com.br", "www.demakine.com.br"]);
    expect(assertAllowedUrl("https://www.demakine.com.br/x").pathname).toBe("/x");
    expect(assertAllowedUrl("https://demakine.com.br/").hostname).toBe("demakine.com.br");
  });

  test("recusa tudo o que não é o site, antes de qualquer requisição", () => {
    const bad = [
      "http://www.demakine.com.br/",
      "https://demakine.com.br.evil.com/",
      "https://evil.com/?https://www.demakine.com.br/",
      "https://www.demakine.com.br@evil.com/",
      "https://user:pass@www.demakine.com.br/",
      "https://www.demakine.com.br:8443/",
      "https://127.0.0.1/",
      "https://[::1]/",
      "https://10.0.0.1/",
      "https://localhost/",
      "//evil.com/",
      "file:///etc/passwd",
      "javascript:alert(1)",
      "ftp://www.demakine.com.br/",
      "",
      "não é endereço",
    ];
    for (const url of bad) expect(() => assertAllowedUrl(url), url).toThrow("Endereço fora do domínio");
  });
});

describe("pool", () => {
  test("com limite 2 nunca roda 3 tarefas juntas e devolve na ordem", async () => {
    let running = 0;
    let peak = 0;
    const out = await pool([5, 1, 4, 2, 3, 6], 2, async (n) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, n));
      running--;
      return n * 10;
    });
    expect(peak).toBe(2);
    expect(out).toEqual([50, 10, 40, 20, 30, 60]);
  });

  test("lista vazia e limite maior que a lista", async () => {
    expect(await pool([], 4, async (x) => x)).toEqual([]);
    expect(await pool([1, 2], 10, async (x) => x + 1)).toEqual([2, 3]);
  });
});

const res = (status: number, body = "", headers: Record<string, string> = {}) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });

describe("fetchPage", () => {
  test("200 devolve o HTML, o endereço final e zero saltos", async () => {
    const seen: string[] = [];
    const fake = async (url: string | URL | Request, init?: RequestInit) => {
      seen.push(String(url));
      expect(new Headers(init?.headers).get("user-agent")).toBe("DemakineSEOAuditor/1.0");
      expect(init?.redirect).toBe("manual");
      return res(200, "<title>Oi</title>");
    };
    const r = await fetchPage("https://www.demakine.com.br/a", 1000, fake as typeof fetch);
    expect(r).toEqual({ status: 200, html: "<title>Oi</title>", finalUrl: "https://www.demakine.com.br/a", hops: 0 });
    expect(seen).toEqual(["https://www.demakine.com.br/a"]);
  });

  test("segue redirecionamento dentro do domínio e conta os saltos", async () => {
    const fake = async (url: string | URL | Request) => {
      const u = String(url);
      if (u.endsWith("/velho")) return res(301, "", { location: "/novo" });
      return res(200, "ok");
    };
    const r = await fetchPage("https://www.demakine.com.br/velho", 1000, fake as typeof fetch);
    expect(r).toMatchObject({ status: 200, finalUrl: "https://www.demakine.com.br/novo", hops: 1 });
  });

  test("redirecionamento para outro site não é seguido", async () => {
    const calls: string[] = [];
    const fake = async (url: string | URL | Request) => {
      calls.push(String(url));
      return res(302, "", { location: "https://evil.com/x" });
    };
    const r = await fetchPage("https://www.demakine.com.br/a", 1000, fake as typeof fetch);
    expect(calls).toEqual(["https://www.demakine.com.br/a"]);
    expect(r.status).toBe(302);
    expect(r.html).toBe("");
  });

  test("laço de redirecionamentos para em 5 saltos", async () => {
    let n = 0;
    const fake = async () => {
      n++;
      return res(301, "", { location: "/volta" });
    };
    const r = await fetchPage("https://www.demakine.com.br/volta", 1000, fake as typeof fetch);
    expect(r.hops).toBe(5);
    expect(r.status).toBe(0);
    expect(n).toBe(6);
  });

  test("erro de rede e tempo esgotado viram status 0, sem lançar", async () => {
    const boom = async () => {
      throw new Error("ECONNRESET");
    };
    expect((await fetchPage("https://www.demakine.com.br/a", 1000, boom as unknown as typeof fetch)).status).toBe(0);
    const slow = (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_ok, fail) => init?.signal?.addEventListener("abort", () => fail(new Error("abortado"))));
    const r = await fetchPage("https://www.demakine.com.br/a", 20, slow as typeof fetch);
    expect(r.status).toBe(0);
  });

  test("conteúdo que não é texto (PDF, imagem) volta sem corpo; XML e texto simples voltam com corpo", async () => {
    const pdf = async () => res(200, "%PDF", { "content-type": "application/pdf" });
    expect((await fetchPage("https://www.demakine.com.br/a.pdf", 1000, pdf as typeof fetch)).html).toBe("");
    const xml = async () => res(200, "<urlset/>", { "content-type": "application/xml" });
    expect((await fetchPage("https://www.demakine.com.br/sitemap.xml", 1000, xml as typeof fetch)).html).toBe("<urlset/>");
    const txt = async () => res(200, "User-agent: *", { "content-type": "text/plain" });
    expect((await fetchPage("https://www.demakine.com.br/robots.txt", 1000, txt as typeof fetch)).html).toBe("User-agent: *");
  });

  test("endereço fora do domínio lança antes de pedir", async () => {
    let called = false;
    const fake = async () => {
      called = true;
      return res(200);
    };
    await expect(fetchPage("https://evil.com/", 1000, fake as typeof fetch)).rejects.toThrow("Endereço fora do domínio");
    expect(called).toBe(false);
  });

  test("corpo gigante é cortado em 3 MB", async () => {
    const big = async () => res(200, "a".repeat(4_000_000));
    const r = await fetchPage("https://www.demakine.com.br/a", 5000, big as typeof fetch);
    expect(r.html.length).toBeLessThanOrEqual(3_000_000);
  });
});
