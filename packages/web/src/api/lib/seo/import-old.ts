/**
 * Importador de endereços antigos: lê a lista (um por linha ou o CSV do Search Console), testa quais dão erro hoje,
 * sugere para onde mandar cada um e cria os redirecionamentos 301. Só mexe no próprio domínio, e nunca cria um
 * redirecionamento que esconda uma página que existe ou que forme cadeia.
 */
import { normalizePath, normalizeTarget } from "../redirects";
import { ALLOWED_HOSTS, fetchPage, pool } from "./crawl";

const ORIGIN = "https://www.demakine.com.br";
const MAX_LINES = 2000;
const MAX_CREATE = 500;
const NOTE = "importado do painel SEO e GEO";

const HEADERS = new Set(["page", "pages", "url", "urls", "página", "pagina", "páginas", "paginas", "endereço", "endereco", "top pages", "landing page"]);

export function parseOldUrls(text: string): { valid: string[]; rejected: { raw: string; reason: string }[] } {
  const valid: string[] = [];
  const rejected: { raw: string; reason: string }[] = [];
  const seen = new Set<string>();
  let read = 0;
  let first = true;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const cell = (line.split(/[,;\t]/)[0] ?? "").trim().replace(/^["']|["']$/g, "");
    // cabeçalho do CSV ("Páginas principais,Cliques"): endereço não tem espaço
    if (first) {
      first = false;
      if (HEADERS.has(cell.toLowerCase()) || /\s/.test(cell)) continue;
    }
    if (read >= MAX_LINES) {
      rejected.push({ raw: "", reason: `lista grande demais: só as primeiras ${MAX_LINES} linhas foram lidas` });
      break;
    }
    read++;
    const reject = (reason: string) => void rejected.push({ raw: cell, reason });
    if (cell.startsWith("//")) {
      reject("fora do domínio");
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(cell)) {
      if (!/^https?:\/\//i.test(cell)) {
        reject("só endereços http ou https");
        continue;
      }
      let host = "";
      try {
        host = new URL(cell).hostname;
      } catch {
        reject("endereço inválido");
        continue;
      }
      if (!ALLOWED_HOSTS.includes(host)) {
        reject("fora do domínio");
        continue;
      }
    } else if (/\s/.test(cell)) {
      reject("não parece um endereço");
      continue;
    }
    const path = normalizePath(cell);
    if (!path) reject("endereço inválido ou longo demais");
    else if (path === "/") reject("a página inicial não precisa de redirecionamento");
    else if (!seen.has(path)) {
      seen.add(path);
      valid.push(path);
    }
  }
  return { valid, rejected };
}

const STOP = new Set(["de", "da", "do", "das", "dos", "para", "e", "em", "a", "o", "as", "os", "com", "na", "no"]);
const lastSegment = (p: string) => p.split("/").filter(Boolean).pop() ?? "";
const tokens = (slug: string) => new Set(slug.split("-").filter((t) => t && !STOP.has(t)));

/** Página existente mais parecida com o endereço antigo (mesmo final de endereço, ou palavras em comum). Null se nenhuma serve. */
export function suggestTarget(path: string, known: string[]): string | null {
  const candidates = known.filter((k) => k !== "/" && k !== path && !/^\/(en|es)(\/|$)/.test(k));
  const slug = lastSegment(path);
  const exact = candidates.find((k) => lastSegment(k) === slug);
  if (exact) return exact;
  const mine = tokens(slug);
  if (mine.size === 0) return null;
  let best: { path: string; score: number } | null = null;
  for (const k of candidates) {
    const other = tokens(lastSegment(k));
    const common = [...mine].filter((t) => other.has(t)).length;
    const score = common / (mine.size + other.size - common);
    if (score >= 0.6 && (!best || score > best.score)) best = { path: k, score };
  }
  return best?.path ?? null;
}

export type OldUrlResult = { path: string; status: number; finalPath: string | null; needsRedirect: boolean; suggested: string | null };

/** Pede cada endereço antigo ao site: o que dá erro precisa de redirecionamento; o que já responde ou já redireciona, não. */
export async function testOldUrls(paths: string[], opts: { known?: string[]; fetchImpl?: typeof fetch } = {}): Promise<OldUrlResult[]> {
  const known = opts.known ?? [];
  const safe = paths.filter((p) => p.startsWith("/") && !p.startsWith("//"));
  return pool(safe, 6, async (path) => {
    const r = await fetchPage(ORIGIN + path, 10_000, opts.fetchImpl);
    const final = r.hops > 0 ? (normalizePath(new URL(r.finalUrl).pathname) ?? null) : null;
    const needsRedirect = !(r.status >= 200 && r.status < 400);
    return { path, status: r.status, finalPath: final && final !== path ? final : null, needsRedirect, suggested: needsRedirect ? suggestTarget(path, known) : null };
  });
}

export interface RedirectStore {
  /** todos os endereços de origem que já têm redirecionamento */
  allFrom(): Promise<Set<string>>;
  insert(rows: { from: string; to: string; userId: string; note: string }[]): Promise<void>;
}

/** Destino como caminho do próprio site: "/x" fica, endereço completo do site vira caminho, o resto é recusado. */
function ownTarget(input: string): string | null {
  const t = normalizeTarget(input ?? "");
  if (!t) return null;
  if (t.startsWith("/")) return normalizePath(t);
  try {
    const u = new URL(t);
    return u.protocol === "https:" && ALLOWED_HOSTS.includes(u.hostname) ? normalizePath(u.pathname) : null;
  } catch {
    return null;
  }
}

/** Cria os redirecionamentos 301 aprovados, pulando (com o motivo) os que não podem ser criados. */
export async function createRedirects(
  items: { from: string; to: string }[],
  userId: string,
  deps: { store?: RedirectStore; known?: Set<string> } = {},
): Promise<{ created: number; skipped: { from: string; reason: string }[] }> {
  if (items.length > MAX_CREATE) throw new Error(`No máximo ${MAX_CREATE} redirecionamentos por vez`);
  const store = deps.store ?? (await import("./redirect-store")).dbRedirectStore;
  const known = deps.known ?? new Set((await (await import("./db-store")).dbStore.loadPages()).map((p) => p.path));
  const existing = await store.allFrom();
  const inputFroms = new Set(items.map((i) => normalizePath(i.from ?? "")).filter((f): f is string => Boolean(f) && f !== "/"));
  const seen = new Set<string>();
  const rows: { from: string; to: string; userId: string; note: string }[] = [];
  const skipped: { from: string; reason: string }[] = [];

  for (const item of items) {
    const from = normalizePath(item.from ?? "");
    if (!from || from === "/") {
      skipped.push({ from: String(item.from ?? ""), reason: "endereço antigo inválido" });
      continue;
    }
    const skip = (reason: string) => void skipped.push({ from, reason });
    if (seen.has(from)) {
      skip("este endereço aparece mais de uma vez na lista");
      continue;
    }
    seen.add(from);
    const to = ownTarget(item.to);
    if (!to) skip("o destino precisa ser uma página do próprio site");
    else if (to === from) skip("o destino é igual à origem");
    else if (existing.has(from)) skip("já existe um redirecionamento para este endereço");
    else if (known.has(from)) skip("essa página existe no site: redirecionar esconderia ela");
    else if (existing.has(to) || inputFroms.has(to)) skip("o destino também é redirecionado: aponte direto para a página final");
    else rows.push({ from, to, userId, note: NOTE });
  }
  if (rows.length > 0) await store.insert(rows);
  return { created: rows.length, skipped };
}
