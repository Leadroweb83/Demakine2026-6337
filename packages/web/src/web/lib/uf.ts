/** Siglas dos estados brasileiros, em ordem alfabética, para os formulários. */
export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

/** opção para quem é de fora do Brasil (site em inglês e espanhol) */
export const ABROAD = "Exterior";

/** troca o nome do campo do formulário (uf) pelo que a API espera (state) */
export function withState<T extends { uf: string }>(form: T): Omit<T, "uf"> & { state: string } {
  const { uf, ...rest } = form;
  return { ...rest, state: uf };
}

/** "Limeira / SP" para mostrar no painel; cidade e estado ficam em campos separados no banco */
export function placeLabel(city?: string | null, state?: string | null): string {
  const c = (city ?? "").trim();
  const s = (state ?? "").trim();
  if (c && s) return `${c} / ${s}`;
  return c || s;
}
