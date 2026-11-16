/**
 * Rastreador de sites de concorrentes (Guerra é Guerra). O endereço vem do painel, então toda requisição e todo
 * redirecionamento passam por assertPublicUrl: só https, sem usuário nem porta, só nome de domínio (nunca IP) e o
 * nome precisa resolver somente para IP público. Respeita o robots.txt, faz no máximo 1 requisição por segundo por site,
 * não sai do site do concorrente e não guarda o texto das páginas.
 */
import { lookup } from "node:dns/promises";
import { extractFacts } from "./html";
import { readCapped } from "./crawl";

const USER_AGENT = "DemakineSEOAuditor/1.0";
const MAX_HOPS = 5;
const MAX_PAGES = 40;
const fail = () => new Error("Endereço não permitido");

function v4Parts(ip: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  return o.every((n) => n <= 255) ? o : null;
}

function publicV4([a, b]: number[]): boolean {
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b! >= 64 && b! <= 127) return false; // CGNAT
  if (a === 169 && b === 254) return false;
  if (a === 172 && b! >= 16 && b! <= 31) return false;
  if (a === 192 && (b === 168 || b === 0)) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  return true;
}

/** O endereço IP é da internet pública (nem rede interna, nem reservado, nem local)? */
export function isPublicIp(input: string): boolean {
  const ip = input.toLowerCase().replace(/^\[|\]$/g, "");
  const four = v4Parts(ip);
  if (four) return publicV4(four);
  if (!ip.includes(":")) return false;
  if (ip === "::" || ip === "::1") return false;
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(ip);
  if (mapped) return isPublicIp(mapped[1]!);
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(ip);
  if (hex) {
    const hi = parseInt(hex[1]!, 16);
    const lo = parseInt(hex[2]!, 16);
    return publicV4([hi >> 8, hi & 255, lo >> 8, lo & 255]);
  }
  const first = parseInt(ip.startsWith("::") ? "0" : ip.split(":")[0]!, 16);
  if (Number.isNaN(first)) return false;
  if ((first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00) return false;
  return !ip.startsWith("2001:db8");
}

type Resolver = (host: string) => Promise<string[]>;
const defaultResolve: Resolver = async (host) => (await lookup(host, { all: true })).map((a) => a.address);

/** Devolve a URL se for um site público em https; lança "Endereço não permitido" para qualquer outra coisa. */
export async function assertPublicUrl(url: string, resolve: Resolver = defaultResolve): Promise<URL> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw fail();
  }
  const host = u.hostname;
  if (u.protocol !== "https:" || u.username || u.password || u.port) throw fail();
  if (!host.includes(".") || /^[\d.]+$/.test(host) || host.startsWith("[") || /\.(local|internal|localhost|lan|home|corp)$/.test(host)) throw fail();
  let addrs: string[];
  try {
    addrs = await resolve(host);
  } catch {
    throw fail();
  }
  if (addrs.length === 0 || !addrs.every(isPublicIp)) throw fail();
  return u;
}

export type Robots = { allows(path: string): boolean; sitemaps: string[]; crawlDelayMs: number | null };

/** Lê o robots.txt para o nosso robô (o grupo dele vale mais que o "*"). Sem texto, libera tudo. */
export function parseRobots(text: string, agent: string): Robots {
  const groups: { agents: string[]; rules: { allow: boolean; pattern: string }[]; delay: number | null }[] = [];
  const sitemaps: string[] = [];
  let current: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const line of text.split(/\r?\n/)) {
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line.replace(/#.*/, "").trim());
    if (!m) continue;
    const k = m[1]!.toLowerCase();
    const v = m[2]!.trim();
    if (k === "sitemap") {
      if (v) sitemaps.push(v);
      continue;
    }
    if (k === "user-agent") {
      if (!current || !lastWasAgent) groups.push((current = { agents: [], rules: [], delay: null }));
      current.agents.push(v.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (k === "allow" || k === "disallow") current.rules.push({ allow: k === "allow", pattern: v });
    else if (k === "crawl-delay" && Number.isFinite(Number(v))) current.delay = Number(v);
  }
  const me = agent.toLowerCase();
  const group = groups.find((g) => g.agents.some((a) => a !== "*" && me.includes(a))) ?? groups.find((g) => g.agents.includes("*"));
  const rules = (group?.rules ?? []).filter((r) => r.pattern !== "");
  const matches = (pattern: string, path: string) => {
    const end = pattern.endsWith("$");
    const body = (end ? pattern.slice(0, -1) : pattern).split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    return new RegExp(`^${body}${end ? "$" : ""}`).test(path);
  };
  return {
    sitemaps,
    crawlDelayMs: group?.delay != null ? group.delay * 1000 : null,
    allows(path) {
      let best: { allow: boolean; len: number } | null = null;
      for (const r of rules) {
        if (!matches(r.pattern, path)) continue;
        const len = r.pattern.replace(/\*/g, "").length;
        if (!best || len > best.len || (len === best.len && r.allow)) best = { allow: r.allow, len };
      }
      return best ? best.allow : true;
    },
  };
}

type Got = { status: number; html: string; finalUrl: string; /** para onde o site redireciona, quando o redirecionamento sai do site e não foi seguido */ location?: string };
type Get = (url: string) => Promise<Got>;

/** robots.txt do concorrente: 404 libera tudo; null = não deu para ler (erro do servidor ou da rede). */
export async function loadRobots(origin: string, get: Get): Promise<Robots | null> {
  const r = await get(`${origin}/robots.txt`);
  if (r.status === 0 || r.status >= 500) return null;
  return parseRobots(r.status === 200 ? r.html : "", USER_AGENT);
}

export type ExternalOpts = { origin: string; fetchImpl?: typeof fetch; resolve?: Resolver; now?: () => number; sleep?: (ms: number) => Promise<void>; minGapMs?: number };
const lastRequest = new Map<string, number>();
const bare = (h: string) => h.toLowerCase().replace(/^www\./, "");

/** Busca uma página do concorrente: 1 por segundo por site, só dentro do site dele, corpo até 3 MB. Erro de rede vira status 0. */
export async function fetchExternal(url: string, opts: ExternalOpts): Promise<Got> {
  const now = opts.now ?? Date.now;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const f = opts.fetchImpl ?? fetch;
  const originHost = bare(new URL(opts.origin).hostname);
  const first = await assertPublicUrl(url, opts.resolve);
  if (bare(first.hostname) !== originHost) throw fail();
  let current = first.href;
  for (let hops = 0; ; hops++) {
    const prev = lastRequest.get(opts.origin);
    if (prev !== undefined) {
      const wait = prev + (opts.minGapMs ?? 1000) - now();
      if (wait > 0) await sleep(wait);
    }
    lastRequest.set(opts.origin, now());
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    try {
      const res = await f(current, { redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" } });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        await res.body?.cancel().catch(() => undefined);
        if (hops >= MAX_HOPS) return { status: 0, html: "", finalUrl: current };
        try {
          const next = await assertPublicUrl(new URL(location, current).href, opts.resolve);
          if (bare(next.hostname) !== originHost) throw fail();
          current = next.href;
          continue;
        } catch {
          let to: string | undefined;
          try {
            to = new URL(location, current).href;
          } catch {
            to = undefined;
          }
          return { status: res.status, html: "", finalUrl: current, ...(to ? { location: to } : {}) }; // sai do site ou vai para endereço não permitido: não seguimos
        }
      }
      const textual = /^(text\/|application\/(xml|xhtml\+xml)|[^;]*\+xml)/i.test(res.headers.get("content-type") ?? "");
      if (!textual) await res.body?.cancel().catch(() => undefined);
      return { status: res.status, html: textual ? await readCapped(res) : "", finalUrl: current };
    } catch {
      return { status: 0, html: "", finalUrl: current };
    } finally {
      clearTimeout(timer);
    }
  }
}

const ASSET = /\.(pdf|jpe?g|png|webp|avif|gif|svg|ico|zip|rar|xml|txt|css|js|json|mp4|webm|docx?|xlsx?)$/i;

export type Discovered = { paths: string[]; source: "sitemap" | "home" | "nenhuma"; total: number; lastmods: Record<string, string>; /** a home redireciona para outro site: o endereço certo é esse */ homeRedirect?: string };

function pathOf(loc: string, originHost: string): string | null {
  try {
    const u = new URL(loc.trim().replace(/&amp;/g, "&"));
    if (bare(u.hostname) !== originHost) return null;
    const p = u.pathname.replace(/\/+$/, "") || "/";
    return ASSET.test(p) ? null : p;
  } catch {
    return null;
  }
}

/** Páginas para ler: as do sitemap (ou, sem sitemap, os links da home), no máximo 40, com home e categorias primeiro. */
export async function discoverPages(origin: string, robots: Robots, get: Get): Promise<Discovered> {
  const originHost = bare(new URL(origin).hostname);
  const roots = (robots.sitemaps.length ? robots.sitemaps : [`${origin}/sitemap.xml`]).filter((u) => pathOf(u, originHost) !== null || /\.xml/i.test(u)).slice(0, 3);
  const found = new Map<string, string>();
  const readUrlset = (xml: string) => {
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
      const loc = /<loc>([\s\S]*?)<\/loc>/i.exec(m[1]!)?.[1];
      const p = loc ? pathOf(loc, originHost) : null;
      if (p && !found.has(p)) found.set(p, /<lastmod>([\s\S]*?)<\/lastmod>/i.exec(m[1]!)?.[1]?.trim().slice(0, 10) ?? "");
    }
  };
  for (const root of roots) {
    const r = await get(root);
    if (r.status !== 200) continue;
    if (/<sitemapindex/i.test(r.html)) {
      const children = [...r.html.matchAll(/<sitemap>[\s\S]*?<loc>([\s\S]*?)<\/loc>/gi)].map((m) => m[1]!.trim()).slice(0, 5);
      for (const child of children) {
        const c = await get(child);
        if (c.status === 200) readUrlset(c.html);
      }
    } else readUrlset(r.html);
  }
  let source: Discovered["source"] = "sitemap";
  let homeRedirect: string | undefined;
  if (found.size === 0) {
    const home = await get(`${origin}/`);
    if (home.status >= 300 && home.status < 400 && home.location) homeRedirect = home.location;
    const links = home.status === 200 ? extractFacts(home.html, `${origin}/`).internalLinks.filter((l) => !ASSET.test(l)) : [];
    if (links.length > 0) {
      found.set("/", "");
      for (const l of links) found.set(l, "");
      source = "home";
    } else source = "nenhuma"; // home sem nenhum link: não há o que comparar
  }
  const all = [...found.keys()];
  const paths = all
    .filter((p) => robots.allows(p))
    .map((p, i) => ({ p, i, depth: p === "/" ? 0 : p.split("/").filter(Boolean).length }))
    .sort((a, b) => a.depth - b.depth || a.i - b.i)
    .slice(0, MAX_PAGES)
    .map((x) => x.p);
  return { paths, source: paths.length ? source : "nenhuma", total: all.length, lastmods: Object.fromEntries([...found].filter(([, d]) => d)), ...(homeRedirect && paths.length === 0 ? { homeRedirect } : {}) };
}
