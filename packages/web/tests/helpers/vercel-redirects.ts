/**
 * Simula os `redirects` do vercel.json (primeira regra que casa vence; a Vercel tira a barra final com 308 antes).
 * Cobre só a sintaxe que o arquivo usa: `:nome`, `:nome(regex)`, `:nome*` e `:nome+`.
 */
import vercel from "../../vercel.json";

type Rule = { source: string; destination: string; permanent?: boolean };
export const rules = (vercel as { redirects: Rule[] }).redirects;

function compile(source: string) {
  let re = "";
  const names: string[] = [];
  for (let i = 0; i < source.length; ) {
    const ch = source[i]!;
    if (ch !== ":") {
      re += ch.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
      i++;
      continue;
    }
    const m = /^:([A-Za-z_]\w*)/.exec(source.slice(i))!;
    const name = m[1]!;
    i += m[0].length;
    let pattern = "[^/]+";
    if (source[i] === "(") {
      const end = source.indexOf(")", i);
      pattern = source.slice(i + 1, end);
      i = end + 1;
    }
    const mod = /[*+]/.test(source[i] ?? "") ? source[i++] : "";
    names.push(name);
    if (mod === "*") {
      // `/x/:p*` casa `/x` e `/x/a/b`
      re = re.endsWith("\\/") ? `${re.slice(0, -2)}(?:\\/(?<${name}>.*))?` : `${re}(?<${name}>.*)`;
    } else if (mod === "+") re += `(?<${name}>.+)`;
    else re += `(?<${name}>${pattern})`;
  }
  return new RegExp(`^${re}$`);
}

const compiled = rules.map((r) => ({ ...r, re: compile(r.source) }));

export type Hop = { from: string; to: string; permanent: boolean };

/** Segue os redirects de um caminho até uma resposta final (ou 6 saltos). */
export function follow(input: string): { final: string; hops: Hop[] } {
  const hops: Hop[] = [];
  let url = input;
  for (let n = 0; n < 6; n++) {
    const [path = "/", query] = url.split("?");
    if (path.length > 1 && path.endsWith("/")) {
      const to = path.replace(/\/+$/, "") + (query ? `?${query}` : "");
      hops.push({ from: url, to, permanent: true });
      url = to;
      continue;
    }
    const rule = compiled.find((r) => r.re.test(path));
    if (!rule) break;
    const groups = rule.re.exec(path)!.groups ?? {};
    const to = rule.destination.replace(/:([A-Za-z_]\w*)/g, (_, k: string) => groups[k] ?? "");
    hops.push({ from: url, to, permanent: rule.permanent !== false });
    url = to;
  }
  return { final: url, hops };
}
