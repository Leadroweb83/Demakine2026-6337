/** Caminho comparável: sem domínio, sem barra no fim, minúsculo e sem query. */
export function normalizePath(input: string) {
  let p = input.trim();
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch {
    return null;
  }
  p = p.split("?")[0]!.split("#")[0]!;
  try {
    p = decodeURI(p);
  } catch {
    /* mantém como veio */
  }
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.toLowerCase().replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p.length <= 300 ? p : null;
}

/** Destino: caminho do próprio site ("/produtos/x") ou endereço completo https. */
export function normalizeTarget(input: string) {
  const t = input.trim();
  if (/^https:\/\/[^\s]+$/i.test(t)) return t.slice(0, 500);
  if (t.startsWith("/") && !t.startsWith("//") && !/\s/.test(t)) return t.slice(0, 500);
  return null;
}
