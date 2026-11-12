/**
 * Verificador de links: testa se os endereços do próprio site respondem. Só acessa demakine.com.br e
 * www.demakine.com.br (assertAllowedUrl em toda requisição e em todo redirecionamento); qualquer outro endereço
 * da lista é ignorado sem ser pedido.
 */
import { assertAllowedUrl, pool } from "./crawl";

const ORIGIN = "https://www.demakine.com.br";
const MAX_HOPS = 5;
const DEFAULT_MAX = 800;
const TIMEOUT_MS = 10_000;

export type LinkReport = { at: string; checked: number; truncated: boolean; broken: LinkResult[]; redirected: LinkResult[] };

export type LinkResult = {
  /** endereço completo testado */
  url: string;
  /** resposta final, depois dos redirecionamentos (0 = não respondeu ou laço de redirecionamentos) */
  status: number;
  /** destinos dos redirecionamentos seguidos, na ordem (vazio = respondeu direto) */
  chain: string[];
  broken: boolean;
  /** páginas do site onde o link aparece */
  foundOn: string[];
};

/** Caminho ("/x") ou endereço do próprio site em https; o resto vira null. */
function toAllowedUrl(input: string): string | null {
  const t = input.trim();
  try {
    return assertAllowedUrl(t.startsWith("/") && !t.startsWith("//") ? ORIGIN + t : t).href;
  } catch {
    return null;
  }
}

type Reply = { status: number; location: string | null };

async function ask(url: string, method: "HEAD" | "GET", fetchHead: typeof fetch): Promise<Reply> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetchHead(url, { method, redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": "DemakineSEOAuditor/1.0" } });
    await res.body?.cancel().catch(() => undefined);
    return { status: res.status, location: res.headers.get("location") };
  } catch {
    return { status: 0, location: null };
  } finally {
    clearTimeout(timer);
  }
}

async function checkOne(url: string, fetchHead: typeof fetch): Promise<{ status: number; chain: string[] }> {
  const chain: string[] = [];
  let current = url;
  for (;;) {
    let r = await ask(current, "HEAD", fetchHead);
    if (r.status === 405 || r.status === 501) r = await ask(current, "GET", fetchHead); // servidor sem HEAD
    if (r.status >= 300 && r.status < 400 && r.location) {
      if (chain.length >= MAX_HOPS) return { status: 0, chain }; // laço de redirecionamentos
      let next: string;
      try {
        next = assertAllowedUrl(new URL(r.location, current).href).href;
      } catch {
        return { status: r.status, chain }; // redireciona para fora do site: não seguimos
      }
      chain.push(next);
      current = next;
      continue;
    }
    return { status: r.status, chain };
  }
}

/** Testa até `max` (800) endereços únicos, 8 por vez. `foundOn` diz em quais páginas cada link aparece. */
export async function checkLinks(urls: string[], foundOn: Map<string, string[]>, opts: { max?: number; fetchHead?: typeof fetch } = {}): Promise<LinkResult[]> {
  const fetchHead = opts.fetchHead ?? fetch;
  const unique = [...new Set(urls.map(toAllowedUrl).filter((u): u is string => u !== null))].slice(0, opts.max ?? DEFAULT_MAX);
  return pool(unique, 8, async (url) => {
    const { status, chain } = await checkOne(url, fetchHead);
    return { url, status, chain, broken: status === 0 || status >= 400, foundOn: foundOn.get(url) ?? foundOn.get(url.replace(ORIGIN, "")) ?? [] };
  });
}
