import { describe, expect, test } from "bun:test";
import { assertPublicUrl, discoverPages, fetchExternal, isPublicIp, loadRobots, parseRobots } from "../../src/api/lib/seo/crawl-external";

const pub = async () => ["93.184.216.34"];
const res = (status: number, body = "", headers: Record<string, string> = {}) => new Response(body, { status, headers: { "content-type": "text/html", ...headers } });

describe("isPublicIp", () => {
  test("recusa endereços internos e reservados", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "224.0.0.1", "::1", "::", "fc00::1", "fd12::1", "fe80::1", "ff02::1", "::ffff:10.0.0.1", "::ffff:7f00:1", "2001:db8::1"]) {
      expect(isPublicIp(ip), ip).toBe(false);
    }
  });

  test("aceita endereços públicos", () => {
    for (const ip of ["8.8.8.8", "93.184.216.34", "172.32.0.1", "2606:4700:4700::1111"]) expect(isPublicIp(ip), ip).toBe(true);
  });
});

describe("assertPublicUrl", () => {
  test("recusa o que não é um site público em https, antes de qualquer conexão", async () => {
    const bad = ["http://concorrente.com.br/", "https://user:x@concorrente.com.br/", "https://concorrente.com.br:8443/", "https://localhost/", "https://intranet/", "https://2130706433/", "https://0x7f.1/", "https://127.0.0.1/", "https://[::1]/", "https://8.8.8.8/", "https://servidor.local/", "file:///etc/passwd", "//concorrente.com.br", "", "nada"];
    for (const u of bad) await expect(assertPublicUrl(u, pub), u).rejects.toThrow("Endereço não permitido");
  });

  test("recusa domínio que resolve para IP privado, ou para público e privado juntos", async () => {
    await expect(assertPublicUrl("https://x.com.br/", async () => ["10.0.0.5"])).rejects.toThrow("Endereço não permitido");
    await expect(assertPublicUrl("https://x.com.br/", async () => ["93.184.216.34", "192.168.0.9"])).rejects.toThrow("Endereço não permitido");
    await expect(assertPublicUrl("https://x.com.br/", async () => [])).rejects.toThrow("Endereço não permitido");
    await expect(assertPublicUrl("https://x.com.br/", async () => { throw new Error("ENOTFOUND"); })).rejects.toThrow("Endereço não permitido");
  });

  test("aceita site público", async () => {
    expect((await assertPublicUrl("https://www.concorrente.com.br/produtos", pub)).hostname).toBe("www.concorrente.com.br");
  });
});

describe("parseRobots", () => {
  test("sem arquivo libera tudo", () => {
    const r = parseRobots("", "DemakineSEOAuditor");
    expect(r.allows("/qualquer")).toBe(true);
    expect(r.sitemaps).toEqual([]);
  });

  test("Disallow: / para todos bloqueia tudo; grupo do nosso robô vale mais que o *", () => {
    expect(parseRobots("User-agent: *\nDisallow: /", "DemakineSEOAuditor").allows("/")).toBe(false);
    const r = parseRobots("User-agent: *\nDisallow: /\n\nUser-agent: DemakineSEOAuditor\nAllow: /", "DemakineSEOAuditor");
    expect(r.allows("/produtos")).toBe(true);
    expect(parseRobots("User-agent: DemakineSEOAuditor\nDisallow: /", "DemakineSEOAuditor").allows("/x")).toBe(false);
  });

  test("regra mais específica vence, Allow ganha o empate, coringa e fim de endereço", () => {
    const r = parseRobots("User-agent: *\nDisallow: /privado/\nAllow: /privado/publico\nDisallow: /*.pdf$", "x");
    expect(r.allows("/privado/segredo")).toBe(false);
    expect(r.allows("/privado/publico/a")).toBe(true);
    expect(r.allows("/a.pdf")).toBe(false);
    expect(r.allows("/a.pdf?x")).toBe(true);
    expect(r.allows("/ok")).toBe(true);
  });

  test("Sitemap e Crawl-delay", () => {
    const r = parseRobots("User-agent: *\nCrawl-delay: 5\nSitemap: https://a.com/s.xml\n# comentário\nsitemap: https://a.com/t.xml", "x");
    expect(r.sitemaps).toEqual(["https://a.com/s.xml", "https://a.com/t.xml"]);
    expect(r.crawlDelayMs).toBe(5000);
  });
});

describe("loadRobots", () => {
  const get = (status: number, html = "") => async () => ({ status, html, finalUrl: "" });
  test("404 libera tudo; 200 lê; 5xx e erro devolvem null (não deu para ler)", async () => {
    expect((await loadRobots("https://a.com", get(404)))?.allows("/x")).toBe(true);
    expect((await loadRobots("https://a.com", get(200, "User-agent: *\nDisallow: /")))?.allows("/x")).toBe(false);
    expect(await loadRobots("https://a.com", get(503))).toBeNull();
    expect(await loadRobots("https://a.com", get(0))).toBeNull();
  });
});

describe("fetchExternal", () => {
  test("espera ao menos 1 segundo entre duas chamadas da mesma origem", async () => {
    let t = 1_000_000;
    const sleeps: number[] = [];
    const opts = { origin: "https://rate.com.br", resolve: pub, fetchImpl: (async () => res(200, "ok")) as unknown as typeof fetch, now: () => t, sleep: async (ms: number) => { sleeps.push(ms); t += ms; } };
    await fetchExternal("https://rate.com.br/a", opts);
    await fetchExternal("https://rate.com.br/b", opts);
    expect(sleeps.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(1000);
  });

  test("segue redirecionamento só dentro do mesmo site (www conta como o mesmo)", async () => {
    const calls: string[] = [];
    const f = (async (url: string | URL | Request) => {
      calls.push(String(url));
      if (String(url).endsWith("/velho")) return res(301, "", { location: "https://www.dentro.com.br/novo" });
      return res(200, "ok");
    }) as unknown as typeof fetch;
    const r = await fetchExternal("https://dentro.com.br/velho", { origin: "https://dentro.com.br", resolve: pub, fetchImpl: f, sleep: async () => {}, now: () => 0 });
    expect(r).toMatchObject({ status: 200, finalUrl: "https://www.dentro.com.br/novo" });
  });

  test("redirecionamento para outro site ou para endereço interno não é seguido", async () => {
    for (const loc of ["https://outro.com.br/x", "https://127.0.0.1/x", "http://dentro2.com.br/x"]) {
      const calls: string[] = [];
      const f = (async (url: string | URL | Request) => {
        calls.push(String(url));
        return res(302, "", { location: loc });
      }) as unknown as typeof fetch;
      const r = await fetchExternal("https://dentro2.com.br/a", { origin: "https://dentro2.com.br", resolve: pub, fetchImpl: f, sleep: async () => {}, now: () => 0 });
      expect(calls).toEqual(["https://dentro2.com.br/a"]);
      expect(r.status).toBe(302);
      expect(r.html).toBe("");
    }
  });

  test("endereço de outro site que não o da origem lança; corpo gigante é cortado; erro de rede vira status 0", async () => {
    const base = { origin: "https://base.com.br", resolve: pub, sleep: async () => {}, now: () => 0 };
    await expect(fetchExternal("https://outro.com.br/", { ...base, fetchImpl: (async () => res(200)) as unknown as typeof fetch })).rejects.toThrow("Endereço não permitido");
    const big = await fetchExternal("https://base.com.br/", { ...base, fetchImpl: (async () => res(200, "a".repeat(4_000_000))) as unknown as typeof fetch });
    expect(big.html.length).toBeLessThanOrEqual(3_000_000);
    const boom = await fetchExternal("https://base.com.br/", { ...base, fetchImpl: (async () => { throw new Error("ECONNRESET"); }) as unknown as typeof fetch });
    expect(boom.status).toBe(0);
  });
});

describe("discoverPages", () => {
  const O = "https://site.com.br";
  const robotsOk = parseRobots("", "x");
  const urlset = (paths: string[]) => `<urlset>${paths.map((p, i) => `<url><loc>${O}${p}</loc><lastmod>2026-0${(i % 9) + 1}-10</lastmod></url>`).join("")}</urlset>`;
  const getter = (map: Record<string, { status: number; html: string }>) => async (url: string) => ({ ...(map[url] ?? { status: 404, html: "" }), finalUrl: url });

  test("sitemap com 120 URLs devolve 40, home primeiro, categorias antes de produtos", async () => {
    const paths = ["/", ...Array.from({ length: 100 }, (_, i) => `/produtos/p${i}/x`), "/categoria-a", "/categoria-b", ...Array.from({ length: 17 }, (_, i) => `/blog/post-${i}`)];
    const r = await discoverPages(O, robotsOk, getter({ [`${O}/sitemap.xml`]: { status: 200, html: urlset(paths) } }));
    expect(r.source).toBe("sitemap");
    expect(r.paths).toHaveLength(40);
    expect(r.paths[0]).toBe("/");
    expect(r.paths.slice(1, 3).sort()).toEqual(["/categoria-a", "/categoria-b"]);
    expect(r.total).toBe(120);
    expect(Object.keys(r.lastmods).length).toBeGreaterThan(0);
  });

  test("sitemap-índice abre os filhos; respeita o robots; ignora outro domínio", async () => {
    const idx = `<sitemapindex><sitemap><loc>${O}/s1.xml</loc></sitemap></sitemapindex>`;
    const child = `<urlset><url><loc>${O}/a</loc></url><url><loc>${O}/privado/b</loc></url><url><loc>https://outro.com/c</loc></url></urlset>`;
    const robots = parseRobots("User-agent: *\nDisallow: /privado/", "x");
    const r = await discoverPages(O, robots, getter({ [`${O}/sitemap.xml`]: { status: 200, html: idx }, [`${O}/s1.xml`]: { status: 200, html: child } }));
    expect(r.paths).toEqual(["/a"]);
  });

  test("sem sitemap usa os links da home; sem nada devolve 'nenhuma'", async () => {
    const home = `<html><body><a href="/produtos">P</a><a href="/sobre">S</a><a href="https://outro.com/x">O</a></body></html>`;
    const r = await discoverPages(O, robotsOk, getter({ [`${O}/`]: { status: 200, html: home } }));
    expect(r.source).toBe("home");
    expect(r.paths).toEqual(["/", "/produtos", "/sobre"]);
    const none = await discoverPages(O, robotsOk, getter({}));
    expect(none).toMatchObject({ source: "nenhuma", paths: [] });
  });
});
