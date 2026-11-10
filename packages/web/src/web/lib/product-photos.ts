/**
 * Texto alternativo (alt) das fotos de produto, para leitor de tela e para a busca por imagens do Google.
 * Cada descrição fica presa ao caminho da foto (imageAlts em content.json), e não à posição dela: o painel pode
 * reordenar, tirar ou acrescentar fotos sem trocar a descrição de lugar. Foto sem descrição recebe o nome do produto
 * com o número dela, para nunca sair vazia nem repetida.
 */
export function photoAlt(product: { name: string; imageAlts?: Record<string, string> }, src: string, index: number): string {
  return product.imageAlts?.[src]?.trim() || (index > 0 ? `${product.name}, foto ${index + 1}` : product.name);
}
