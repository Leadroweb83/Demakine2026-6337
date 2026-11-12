import { describe, expect, test } from "bun:test";
import { createRedirects, parseOldUrls, suggestTarget, testOldUrls, type RedirectStore } from "../../src/api/lib/seo/import-old";

describe("parseOldUrls", () => {
  test("lista de endereços: funde repetidos, tira barra final, e rejeita outro domínio com o motivo", () => {
    const r = parseOldUrls(["/produto/x/", "https://www.demakine.com.br/produto/x", "https://outro.com/y"].join("\n"));
    expect(r.valid).toEqual(["/produto/x"]);
    expect(r.rejected).toEqual([{ raw: "https://outro.com/y", reason: "fora do domínio" }]);
  });

  test("CSV do Search Console: pula o cabeçalho e lê a coluna do endereço", () => {
    const csv = "Páginas principais,Cliques,Impressões\nhttps://www.demakine.com.br/produto/a/,12,300\nhttps://www.demakine.com.br/blog/b?utm=1#topo,3,40\n";
    const r = parseOldUrls(csv);
    expect(r.valid).toEqual(["/produto/a", "/blog/b"]);
    expect(r.rejected).toEqual([]);
  });

  test("aceita ; e tab, caminho sem barra inicial e maiúsculas", () => {
    expect(parseOldUrls("/A-B;10\n/c-d\t5\nE-F").valid).toEqual(["/a-b", "/c-d", "/e-f"]);
  });

  test("página inicial, linha que não parece endereço e endereço fora do padrão são rejeitados", () => {
    const r = parseOldUrls("/\nhttps://www.demakine.com.br/\njavascript:alert(1)\nftp://www.demakine.com.br/x\n//outro.com/z");
    expect(r.valid).toEqual([]);
    expect(r.rejected.map((x) => x.raw)).toEqual(["/", "https://www.demakine.com.br/", "javascript:alert(1)", "ftp://www.demakine.com.br/x", "//outro.com/z"]);
    expect(r.rejected[0]!.reason).toBe("a página inicial não precisa de redirecionamento");
  });

  test("hosts parecidos com o do site não passam", () => {
    const r = parseOldUrls("https://demakine.com.br.evil.com/a\nhttps://www.demakine.com.br@evil.com/b\nhttp://demakine.com.br/c");
    expect(r.valid).toEqual(["/c"]); // http do próprio site vale como endereço antigo (o servidor refaz em https)
    expect(r.rejected).toHaveLength(2);
  });

  test("limite de 2000 linhas", () => {
    const text = Array.from({ length: 2100 }, (_, i) => `/p${i}`).join("\n");
    const r = parseOldUrls(text);
    expect(r.valid).toHaveLength(2000);
    expect(r.rejected.at(-1)?.reason).toBe("lista grande demais: só as primeiras 2000 linhas foram lidas");
  });

  test("texto vazio", () => {
    expect(parseOldUrls("")).toEqual({ valid: [], rejected: [] });
    expect(parseOldUrls("  \n \n")).toEqual({ valid: [], rejected: [] });
  });
});

describe("suggestTarget", () => {
  const known = ["/", "/produtos/esteira-transportadora-para-sacaria", "/produtos/rosca-transportadora", "/blog/como-escolher-a-esteira", "/en/produtos/rosca-transportadora", "/esteiras-transportadoras"];

  test("mesmo final de endereço em outra seção vira sugestão exata", () => {
    expect(suggestTarget("/produto/rosca-transportadora", known)).toBe("/produtos/rosca-transportadora");
    expect(suggestTarget("/antigo/blog-x/como-escolher-a-esteira", known)).toBe("/blog/como-escolher-a-esteira");
  });

  test("parecido pelas palavras do endereço, só entre páginas que existem", () => {
    expect(suggestTarget("/produto/esteira-transportadora-sacaria-inox", known)).toBe("/produtos/esteira-transportadora-para-sacaria");
  });

  test("sem semelhança suficiente devolve null; não sugere a própria página nem versões em outro idioma", () => {
    expect(suggestTarget("/maquina-de-laranja-paint", known)).toBeNull();
    expect(suggestTarget("/produtos/rosca-transportadora", known)).toBeNull(); // é a própria página
    expect(suggestTarget("/en/rosca-transportadora-x", ["/en/produtos/rosca-transportadora"])).toBeNull();
    expect(suggestTarget("/x", [])).toBeNull();
  });
});

const O = "https://www.demakine.com.br";
const res = (status: number, headers: Record<string, string> = {}) => new Response("", { status, headers: { "content-type": "text/html", ...headers } });

describe("testOldUrls", () => {
  const fetchImpl = (async (url: string | URL | Request) => {
    const u = String(url);
    if (u.endsWith("/velho-404")) return res(404);
    if (u.endsWith("/ja-redireciona")) return res(301, { location: "/produtos/rosca-transportadora" });
    if (u.endsWith("/existe")) return res(200);
    if (u.endsWith("/produtos/rosca-transportadora")) return res(200);
    return res(404);
  }) as typeof fetch;
  const known = ["/produtos/rosca-transportadora"];

  test("404 precisa de redirecionamento e traz sugestão; o que já redireciona ou existe não precisa", async () => {
    const r = await testOldUrls(["/velho-404", "/ja-redireciona", "/existe", "/produto/rosca-transportadora"], { known, fetchImpl });
    const by = Object.fromEntries(r.map((x) => [x.path, x]));
    expect(by["/velho-404"]).toMatchObject({ status: 404, finalPath: null, needsRedirect: true, suggested: null });
    expect(by["/ja-redireciona"]).toMatchObject({ status: 200, finalPath: "/produtos/rosca-transportadora", needsRedirect: false, suggested: null });
    expect(by["/existe"]).toMatchObject({ status: 200, finalPath: null, needsRedirect: false });
    expect(by["/produto/rosca-transportadora"]).toMatchObject({ status: 404, needsRedirect: true, suggested: "/produtos/rosca-transportadora" });
  });

  test("devolve na ordem pedida e não pede nada fora do site", async () => {
    const calls: string[] = [];
    const spy = (async (url: string | URL | Request) => {
      calls.push(String(url));
      return res(404);
    }) as typeof fetch;
    const r = await testOldUrls(["/b", "/a"], { known: [], fetchImpl: spy });
    expect(r.map((x) => x.path)).toEqual(["/b", "/a"]);
    expect(calls.every((c) => c.startsWith(O))).toBe(true);
  });

  test("erro de rede conta como precisa de redirecionamento com status 0", async () => {
    const boom = (async () => {
      throw new Error("ECONNRESET");
    }) as unknown as typeof fetch;
    const [r] = await testOldUrls(["/x"], { known: [], fetchImpl: boom });
    expect(r).toMatchObject({ status: 0, needsRedirect: true });
  });
});

function memoryStore(existing: string[] = []): RedirectStore & { rows: { from: string; to: string; userId: string; note: string }[] } {
  const s = {
    rows: [] as { from: string; to: string; userId: string; note: string }[],
    existing: async (froms: string[]) => new Set(froms.filter((f) => existing.includes(f))),
    allFrom: async () => new Set(existing),
    insert: async (rows: { from: string; to: string; userId: string; note: string }[]) => void s.rows.push(...rows),
  };
  return s;
}

describe("createRedirects", () => {
  test("cria os válidos e explica por que pulou os outros", async () => {
    const store = memoryStore(["/ja-existe"]);
    const r = await createRedirects(
      [
        { from: "/produto/x", to: "/produtos/x" },
        { from: "/ja-existe", to: "/produtos/y" },
        { from: "/mesmo", to: "/mesmo" },
        { from: "/fora", to: "https://outro.com/z" },
        { from: "/pagina-viva", to: "/produtos/x" },
        { from: "/A-Maiuscula/", to: "https://www.demakine.com.br/produtos/z" },
      ],
      "u1",
      { store, known: new Set(["/pagina-viva", "/produtos/x", "/produtos/z"]) },
    );
    expect(r.created).toBe(2);
    expect(store.rows).toEqual([
      { from: "/produto/x", to: "/produtos/x", userId: "u1", note: "importado do painel SEO e GEO" },
      { from: "/a-maiuscula", to: "/produtos/z", userId: "u1", note: "importado do painel SEO e GEO" },
    ]);
    expect(r.skipped).toEqual([
      { from: "/ja-existe", reason: "já existe um redirecionamento para este endereço" },
      { from: "/mesmo", reason: "o destino é igual à origem" },
      { from: "/fora", reason: "o destino precisa ser uma página do próprio site" },
      { from: "/pagina-viva", reason: "essa página existe no site: redirecionar esconderia ela" },
    ]);
  });

  test("recusa cadeia: destino que também é redirecionado (do banco ou da própria lista)", async () => {
    const store = memoryStore(["/b"]);
    const r = await createRedirects(
      [
        { from: "/a", to: "/b" },
        { from: "/c", to: "/d" },
        { from: "/d", to: "/e" },
      ],
      "u1",
      { store, known: new Set() },
    );
    expect(r.skipped.find((x) => x.from === "/a")?.reason).toBe("o destino também é redirecionado: aponte direto para a página final");
    expect(r.skipped.find((x) => x.from === "/c")?.reason).toBe("o destino também é redirecionado: aponte direto para a página final");
    expect(r.created).toBe(1);
    expect(store.rows.map((x) => x.from)).toEqual(["/d"]);
  });

  test("origem inválida ou página inicial é pulada; mais de 500 itens é recusado", async () => {
    const store = memoryStore();
    const r = await createRedirects([{ from: "/", to: "/x" }, { from: "", to: "/x" }], "u1", { store, known: new Set() });
    expect(r.created).toBe(0);
    expect(r.skipped).toHaveLength(2);
    const many = Array.from({ length: 501 }, (_, i) => ({ from: `/p${i}`, to: "/x" }));
    await expect(createRedirects(many, "u1", { store, known: new Set() })).rejects.toThrow("No máximo 500 redirecionamentos por vez");
  });

  test("destino repetido em itens da mesma lista e origens repetidas criam uma vez", async () => {
    const store = memoryStore();
    const r = await createRedirects([{ from: "/a", to: "/x" }, { from: "/a", to: "/y" }, { from: "/b", to: "/x" }], "u1", { store, known: new Set() });
    expect(r.created).toBe(2);
    expect(r.skipped).toEqual([{ from: "/a", reason: "este endereço aparece mais de uma vez na lista" }]);
  });
});
