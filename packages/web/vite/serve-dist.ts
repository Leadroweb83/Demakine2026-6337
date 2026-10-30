/**
 * Servidor local parecido com a Vercel para conferir o build (dist/): cleanUrls, /admin e /loja
 * na casca do app, 404.html para o resto. /api responde 404 (o site usa o conteúdo do build).
 *
 *   bun vite/serve-dist.ts   (porta 5180)
 */
import path from "node:path";

const root = path.resolve(import.meta.dir, "..", "dist");

/** cabeçalhos do vercel.json (só as regras simples de caminho), para ver no navegador o que a CSP bloqueia */
const rules = (JSON.parse(await Bun.file(path.resolve(import.meta.dir, "..", "vercel.json")).text()).headers ?? []).map(
  (r: { source: string; headers: { key: string; value: string }[] }) => ({
    re: new RegExp(`^${r.source.replace(/\(\.\*\)/g, ".*")}$`),
    headers: r.headers,
  }),
);
/** violações da CSP que o navegador relata (só no servidor local de teste): GET /__csp mostra, DELETE zera */
const violations: string[] = [];
const withHeaders = (res: Response, pathname: string) => {
  const out = new Response(res.body, res);
  for (const r of rules) {
    if (!r.re.test(pathname)) continue;
    for (const h of r.headers) out.headers.set(h.key, h.key === "Content-Security-Policy" ? `${h.value}; report-uri /__csp` : h.value);
  }
  return out;
};

Bun.serve({
  port: 5180,
  async fetch(req) {
    const url = new URL(req.url);
    let p = decodeURIComponent(url.pathname);
    if (p === "/__csp") {
      if (req.method === "POST") {
        const body = (await req.json().catch(() => ({}))) as { "csp-report"?: Record<string, string> };
        const r = body["csp-report"] ?? {};
        violations.push(`${r["violated-directive"]} | ${r["blocked-uri"]} | ${r["document-uri"]}`);
        return new Response(null, { status: 204 });
      }
      if (req.method === "DELETE") violations.length = 0;
      return Response.json([...new Set(violations)]);
    }
    // conteúdo do painel gravado no build (o mesmo que /api/conteudo devolve em produção): faz o site hidratar como na Vercel
    if (p === "/api/conteudo") {
      const snap = [...new Bun.Glob("conteudo-*.json").scanSync(root)].sort()[0];
      if (snap) return new Response(Bun.file(path.join(root, snap)), { headers: { "content-type": "application/json" } });
    }
    if (p.startsWith("/api")) return new Response("{}", { status: 404 });
    if (p.startsWith("/admin") || p.startsWith("/loja")) p = "/_app";
    const tries = p === "/" ? ["/index.html"] : [p, `${p}.html`, `${p}/index.html`];
    for (const t of tries) {
      const f = Bun.file(root + t);
      if (await f.exists()) return withHeaders(new Response(f, { headers: { "content-type": f.type } }), url.pathname);
    }
    return withHeaders(new Response(Bun.file(path.join(root, "404.html")), { status: 404, headers: { "content-type": "text/html" } }), url.pathname);
  },
});
console.log("dist em http://localhost:5180");
