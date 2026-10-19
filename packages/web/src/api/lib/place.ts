/** Cidade e estado vêm em campos separados; este módulo limpa os dois antes de gravar. */

export const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

/** estado para quem é de fora do Brasil */
export const ABROAD = "Exterior";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** "sp" -> "SP"; "Exterior" -> "Exterior"; qualquer outra coisa -> null */
export function cleanState(v: unknown): string | null {
  const s = clip(v, 20);
  if (!s) return null;
  if (s.toLowerCase() === ABROAD.toLowerCase()) return ABROAD;
  const uf = s.toUpperCase();
  return UFS.has(uf) ? uf : null;
}

/**
 * Cidade e estado prontos para gravar. Se o estado não veio (formulário antigo ainda aberto no
 * navegador), tenta tirá-lo do fim da cidade: "Limeira / SP", "Limeira - SP", "Limeira SP".
 */
export function placeFrom(city: unknown, state: unknown): { city: string | null; state: string | null } {
  let c = clip(city, 80);
  let st = cleanState(state);
  if (!st && c) {
    const m = c.match(/^(.*?)\s*(?:[/,–-]\s*|\s)([A-Za-z]{2})\.?$/);
    const uf = m?.[2]?.toUpperCase();
    if (m && uf && UFS.has(uf)) {
      c = m[1]!.trim();
      st = uf;
    } else if (/\(exterior\)\s*$/i.test(c)) {
      c = c.replace(/\s*\(exterior\)\s*$/i, "").trim();
      st = ABROAD;
    }
  }
  return { city: c || null, state: st };
}
