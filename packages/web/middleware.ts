import { next, rewrite } from "@vercel/functions";

/**
 * Redirecionamentos cadastrados no painel (endereço antigo -> novo), aplicados na borda
 * da Vercel antes de a página carregar, com o código 301 que o Google usa para
 * transferir a posição do endereço antigo. A lista vem de /api/redirects (cache de 60 s).
 */
export const config = {
  matcher: ["/((?!api/|assets/|img/|downloads/|fonts/|favicon|robots\\.txt|sitemap\\.xml).+)"],
};

type Rule = { to: string; permanent: boolean };
let cache: { at: number; rules: Map<string, Rule> } | null = null;

async function rules(origin: string) {
  if (cache && Date.now() - cache.at < 60_000) return cache.rules;
  try {
    const res = await fetch(`${origin}/api/redirects`);
    if (!res.ok) return cache?.rules ?? new Map<string, Rule>();
    const { items } = (await res.json()) as { items: { from: string; to: string; permanent: boolean }[] };
    cache = { at: Date.now(), rules: new Map(items.map((i) => [i.from, { to: i.to, permanent: i.permanent }])) };
    return cache.rules;
  } catch {
    return cache?.rules ?? new Map<string, Rule>();
  }
}

/** Mesma normalização da API: minúsculo, sem barra no fim. */
function key(pathname: string) {
  let p = pathname;
  try {
    p = decodeURI(p);
  } catch {
    /* mantém */
  }
  p = p.toLowerCase().replace(/\/{2,}/g, "/");
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  // página de exportação: a versão em inglês é outro HTML pré-renderizado (export-en.html)
  if (url.pathname === "/export" && url.searchParams.get("lang") === "en") return rewrite(new URL("/export-en", url));
  // arquivos do build (js, css, imagens) passam direto; .html e .php podem ser endereço antigo
  if (/\.(?!html?$|php$)[a-z0-9]{2,5}$/i.test(url.pathname)) return next();
  const rule = (await rules(url.origin)).get(key(url.pathname));
  if (!rule) return next();
  const target = new URL(rule.to, url.origin);
  if (!target.search && url.search) target.search = url.search;
  return new Response(null, {
    status: rule.permanent ? 301 : 302,
    headers: { Location: target.toString(), "Cache-Control": "public, max-age=300" },
  });
}
