/** Siglas dos estados brasileiros, em ordem alfabética, para os formulários. */
export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

/** opção para quem é de fora do Brasil (site em inglês e espanhol) */
export const ABROAD = "Exterior";

/**
 * Cidade e estado vão para o banco no mesmo campo, como "Limeira / SP": é o formato que o painel
 * já lê para contar pedidos por estado, então o banco não precisou mudar.
 */
export function cityWithUf(city: string, uf: string): string {
  const c = city.trim();
  if (!uf) return c;
  if (uf === ABROAD) return c ? `${c} (exterior)` : "Exterior";
  return c ? `${c} / ${uf}` : uf;
}

/** tira o estado do objeto do formulário: ele já vai junto da cidade */
export function withoutUf<T extends { uf: string }>(form: T): Omit<T, "uf"> {
  const { uf: _uf, ...rest } = form;
  return rest;
}
