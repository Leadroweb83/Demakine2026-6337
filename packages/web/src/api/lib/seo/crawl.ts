/**
 * Rastreador do auditor: busca páginas do PRÓPRIO site e nada mais. Toda requisição (e todo redirecionamento) passa
 * por assertAllowedUrl: só https, só demakine.com.br e www.demakine.com.br, sem usuário, sem porta, sem IP.
 * O servidor do site é quem recebe os pedidos; nenhum endereço digitado no painel chega a uma requisição sem esse filtro.
 */

export const ALLOWED_HOSTS = ["demakine.com.br", "www.demakine.com.br"];
const USER_AGENT = "DemakineSEOAuditor/1.0";
const MAX_HOPS = 5;
const MAX_BYTES = 3_000_000;

/** Devolve a URL se for do site; lança "Endereço fora do domínio" para qualquer outra coisa. */
export function assertAllowedUrl(url: string): URL {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("Endereço fora do domínio");
  }
  const ok = u.protocol === "https:" && ALLOWED_HOSTS.includes(u.hostname) && !u.username && !u.password && !u.port;
  if (!ok) throw new Error("Endereço fora do domínio");
  return u;
}

export type FetchedPage = { status: number; html: string; finalUrl: string; hops: number };

/** Só HTML, XML, JSON e texto simples vêm com corpo (sitemap.xml e robots.txt também passam por aqui). */
const TEXTUAL = /^(text\/|application\/(xml|xhtml\+xml|json)|[^;]*\+xml)/i;

async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  const all = new Uint8Array(Math.min(size, MAX_BYTES));
  let at = 0;
  for (const c of chunks) {
    const room = all.length - at;
    if (room <= 0) break;
    all.set(c.subarray(0, room), at);
    at += Math.min(c.byteLength, room);
  }
  return new TextDecoder().decode(all);
}

/**
 * Busca uma página seguindo até 5 redirecionamentos, todos dentro do domínio. Erro de rede, tempo esgotado ou
 * laço de redirecionamentos viram status 0 (a página não respondeu); só um endereço de entrada fora do domínio lança.
 */
export async function fetchPage(url: string, timeoutMs = 15_000, fetchImpl: typeof fetch = fetch): Promise<FetchedPage> {
  let current = assertAllowedUrl(url).href;
  let hops = 0;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    for (;;) {
      const res = await fetchImpl(current, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        await res.body?.cancel().catch(() => undefined);
        if (hops >= MAX_HOPS) return { status: 0, html: "", finalUrl: current, hops };
        let next: string;
        try {
          next = assertAllowedUrl(new URL(location, current).href).href;
        } catch {
          return { status: res.status, html: "", finalUrl: current, hops }; // redireciona para fora do site: não seguimos
        }
        current = next;
        hops++;
        continue;
      }
      const textual = TEXTUAL.test(res.headers.get("content-type") ?? "");
      if (!textual) await res.body?.cancel().catch(() => undefined);
      return { status: res.status, html: textual ? await readCapped(res) : "", finalUrl: current, hops };
    }
  } catch {
    return { status: 0, html: "", finalUrl: current, hops };
  } finally {
    clearTimeout(timer);
  }
}

/** Roda fn sobre os itens, no máximo `limit` ao mesmo tempo, devolvendo os resultados na ordem dos itens. */
export async function pool<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = Array.from({ length: items.length });
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return out;
}
