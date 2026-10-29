/**
 * Servidor local parecido com a Vercel para conferir o build (dist/): cleanUrls, /admin e /loja
 * na casca do app, 404.html para o resto. /api responde 404 (o site usa o conteúdo do build).
 *
 *   bun vite/serve-dist.ts   (porta 5180)
 */
import path from "node:path";

const root = path.resolve(import.meta.dir, "..", "dist");

Bun.serve({
  port: 5180,
  async fetch(req) {
    const url = new URL(req.url);
    let p = decodeURIComponent(url.pathname);
    if (p.startsWith("/api")) return new Response("{}", { status: 404 });
    if (p.startsWith("/admin") || p.startsWith("/loja")) p = "/_app";
    const tries = p === "/" ? ["/index.html"] : [p, `${p}.html`, `${p}/index.html`];
    for (const t of tries) {
      const f = Bun.file(root + t);
      if (await f.exists()) return new Response(f);
    }
    return new Response(Bun.file(path.join(root, "404.html")), { status: 404, headers: { "content-type": "text/html" } });
  },
});
console.log("dist em http://localhost:5180");
