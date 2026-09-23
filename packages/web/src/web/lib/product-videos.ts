/**
 * Vídeos reais do canal Demakine Industrial (youtube.com/@demakineindustrial) por produto.
 * Só entram vídeos públicos com incorporação liberada; a capa fica em /img/videos/<id>.webp
 * para a página não chamar o YouTube antes do clique.
 */
export type ProductVideo = { id: string; title: string };

export const productVideos: Record<string, ProductVideo[]> = {
  "esteira-transportadora-horizontal": [
    { id: "hD4snO8Fcf8", title: "Esteiras transportadoras horizontais" },
    { id: "Vey2n-rdQg8", title: "Esteira horizontal com mesas laterais para apoio à montagem" },
    { id: "ppaEIt1ob9A", title: "Esteira horizontal com ponta articulada" },
  ],
  "esteira-transportadora-para-sacaria": [
    { id: "lVDqFq63OpI", title: "Esteira transportadora para sacaria" },
  ],
  "esteira-transportadora-articulada": [
    { id: "ubn5l4ipH4w", title: "Esteira transportadora articulada" },
    { id: "ppaEIt1ob9A", title: "Esteira horizontal com ponta articulada" },
  ],
  "esteira-transportadora-de-caixas": [
    { id: "a7Kgiz062mQ", title: "Esteira para transporte de caixas e pacotes" },
  ],
  "esteira-transportadora-em-v": [
    { id: "a-NygthhN6s", title: "Esteira transportadora em V para grãos e granel" },
  ],
  "esteira-transportadora-para-granel": [
    { id: "57Hgk90y_oQ", title: "Esteira transportadora para granel dentro da NR-10 e NR-12" },
    { id: "aWztsf8pIJ0", title: "Esteira transportadora de grãos, milho e ração" },
    { id: "a-NygthhN6s", title: "Esteira transportadora em V para grãos e granel" },
  ],
  "esteira-transportadora-para-cesta-basica": [
    { id: "XvCFS1S1j8c", title: "Esteira transportadora para cesta básica" },
  ],
  "esteira-transportadora-para-reciclagem-triagem": [
    { id: "tCCjTq8k0gY", title: "Esteira para triagem de material reciclável" },
    { id: "Ca_aoptrwjA", title: "Esteira transportadora para reciclagem e triagem" },
  ],
  "rosca-transportadora-chupim": [
    { id: "7TZnY2zvgNo", title: "Rosca chupim para grãos" },
  ],
  "rosca-transportadora": [
    { id: "IcCjsKHfVns", title: "Rosca helicoidal para grãos, milho e ração" },
    { id: "j53AoWVr1D8", title: "Rosca transportadora helicoidal em inox" },
    { id: "7TZnY2zvgNo", title: "Rosca chupim para grãos" },
  ],
};

export function videosFor(slug: string) {
  return productVideos[slug] ?? [];
}
