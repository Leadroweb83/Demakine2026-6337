/**
 * Markdown em linha das páginas do Marketing: **negrito**, *itálico* e [texto](/endereço). Só o que os arquivos usam.
 * Serve ao conversor (texto puro do FAQ e do resumo) e ao desenho da página (components/landing-blocks.tsx).
 */

export type Inline =
  | { t: "text"; text: string }
  | { t: "b"; kids: Inline[] }
  | { t: "i"; kids: Inline[] }
  | { t: "a"; href: string; kids: Inline[] };

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", text: buf });
    buf = "";
  };
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    if (rest.startsWith("**")) {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: "b", kids: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (src[i] === "*" && src[i + 1] !== " " && src[i + 1] !== "*") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ t: "i", kids: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    if (src[i] === "[") {
      const mid = src.indexOf("](", i);
      const end = mid > -1 ? src.indexOf(")", mid) : -1;
      if (mid > i && end > mid) {
        flush();
        out.push({ t: "a", href: src.slice(mid + 2, end), kids: parseInline(src.slice(i + 1, mid)) });
        i = end + 1;
        continue;
      }
    }
    buf += src[i];
    i++;
  }
  flush();
  return out;
}

/** O mesmo texto sem as marcas: vai para o schema, para o resumo e para as contagens. */
export function plainText(src: string): string {
  const walk = (nodes: Inline[]): string => nodes.map((n) => (n.t === "text" ? n.text : walk(n.kids))).join("");
  return walk(parseInline(src));
}

/** Endereços internos citados no texto (sem consulta nem âncora), para conferir que cada link existe. */
export function internalLinks(src: string): string[] {
  const found: string[] = [];
  const walk = (nodes: Inline[]) => {
    for (const n of nodes) {
      if (n.t === "a") {
        if (n.href.startsWith("/")) found.push(n.href.split("#")[0]!.split("?")[0]!);
        walk(n.kids);
      } else if (n.t !== "text") walk(n.kids);
    }
  };
  walk(parseInline(src));
  return found;
}
