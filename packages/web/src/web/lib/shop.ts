/**
 * Dados da LOJA VIRTUAL (rota /loja).
 *
 * IMPORTANTE
 * - Fotos: todas reais, do acervo em /img/produtos.
 * - PREÇOS: são valores de EXEMPLO para o layout da vitrine. Antes de publicar,
 *   substituir por preço, estoque e frete reais vindos da plataforma.
 *   Itens de alto valor (máquinas grandes) NÃO têm preço: seguem por cotação,
 *   que é a estratégia recomendada para ticket alto no B2B.
 */

export type ShopItem = {
  slug: string;
  /** código interno de vitrine, no estilo desenho técnico. */
  sku?: string;
  name: string;
  brandLine: string;
  image: string;
  /** preço à vista no pix, em reais. undefined = produto por cotação. */
  price?: number;
  /** preço "de", para mostrar desconto. */
  listPrice?: number;
  installments?: number;
  badge?: string;
  freeShipping?: boolean;
  stock: "pronta-entrega" | "sob-encomenda" | "cotacao";
  rating: number;
  reviews: number;
};

export type ShopCategory = {
  slug: string;
  name: string;
  image: string;
  count: number;
};

export const shopCategories: ShopCategory[] = [
  {
    slug: "pecas-de-reposicao",
    name: "Peças de reposição",
    image: "/img/produtos/esteira-transportadora-horizontal/4.jpg",
    count: 128,
  },
  {
    slug: "correias-e-lonas",
    name: "Correias e lonas",
    image: "/img/produtos/esteira-transportadora-para-granel/3.jpg",
    count: 46,
  },
  {
    slug: "costura-de-sacaria",
    name: "Costura de sacaria",
    image: "/img/produtos/maquina-de-costurar-sacos-gk-26/1.jpg",
    count: 22,
  },
  {
    slug: "consumiveis",
    name: "Consumíveis e linhas",
    image: "/img/produtos/linha-fio-para-costura-de-sacaria/1.jpg",
    count: 34,
  },
  {
    slug: "movimentacao-leve",
    name: "Movimentação leve",
    image: "/img/produtos/cartrans-carrinho-transportador/1.jpg",
    count: 18,
  },
  {
    slug: "esteiras-e-roscas",
    name: "Esteiras e roscas",
    image: "/img/produtos/esteira-transportadora-para-sacaria/1.jpg",
    count: 21,
  },
];

/** Prateleira principal: giro rápido, ticket que fecha no cartão. */
export const bestSellers: ShopItem[] = [
  {
    slug: "maquina-de-costurar-sacos-gk-26",
    sku: "CS-GK26",
    name: "Máquina de Costurar Sacos GK-26",
    brandLine: "Costura de sacaria",
    image: "/img/produtos/maquina-de-costurar-sacos-gk-26/1.jpg",
    price: 1290,
    listPrice: 1490,
    installments: 12,
    badge: "Mais vendida",
    freeShipping: true,
    stock: "pronta-entrega",
    rating: 4.9,
    reviews: 87,
  },
  {
    slug: "maquina-de-costurar-sacos-siruba-aa-6",
    sku: "CS-AA6",
    name: "Máquina de Costurar Sacos Siruba AA-6",
    brandLine: "Costura de sacaria",
    image: "/img/produtos/maquina-de-costurar-sacos-siruba-aa-6/1.jpg",
    price: 2190,
    listPrice: 2490,
    installments: 12,
    freeShipping: true,
    stock: "pronta-entrega",
    rating: 4.8,
    reviews: 41,
  },
  {
    slug: "linha-fio-para-costura-de-sacaria",
    sku: "CS-LIN-200",
    name: "Linha para Costura de Sacaria (cone 200g)",
    brandLine: "Consumíveis",
    image: "/img/produtos/linha-fio-para-costura-de-sacaria/1.jpg",
    price: 39.9,
    listPrice: 49.9,
    installments: 3,
    badge: "Compra recorrente",
    stock: "pronta-entrega",
    rating: 4.9,
    reviews: 213,
  },
  {
    slug: "cartrans-carrinho-transportador",
    sku: "MV-CTR-001",
    name: "Cartrans Carrinho Transportador",
    brandLine: "Movimentação leve",
    image: "/img/produtos/cartrans-carrinho-transportador/1.jpg",
    price: 3480,
    installments: 12,
    stock: "pronta-entrega",
    rating: 5,
    reviews: 19,
  },
  {
    slug: "kit-manutencao-esteira",
    sku: "KT-MNT-ESM",
    name: "Kit Manutenção de Esteira (roletes + raspador)",
    brandLine: "Peças de reposição",
    image: "/img/produtos/esteira-transportadora-horizontal/6.jpg",
    price: 890,
    listPrice: 1040,
    installments: 10,
    badge: "Kit econômico",
    stock: "pronta-entrega",
    rating: 4.7,
    reviews: 33,
  },
  {
    slug: "correia-lisa-pvc",
    sku: "CR-LIS-002",
    name: "Correia Lisa PVC 2 lonas (metro linear)",
    brandLine: "Correias e lonas",
    image: "/img/produtos/esteira-transportadora-para-granel/4.jpg",
    price: 148,
    installments: 6,
    stock: "pronta-entrega",
    rating: 4.8,
    reviews: 64,
  },
  {
    slug: "correia-taliscada",
    sku: "CR-TAL-004",
    name: "Correia Taliscada para Granel (metro linear)",
    brandLine: "Correias e lonas",
    image: "/img/produtos/esteira-transportadora-para-granel/6.jpg",
    price: 224,
    installments: 6,
    stock: "sob-encomenda",
    rating: 4.9,
    reviews: 28,
  },
  {
    slug: "peneira-para-carvao",
    sku: "BF-PNC-010",
    name: "Peneira Empacotadora para Carvão",
    brandLine: "Beneficiamento",
    image: "/img/produtos/peneira-para-carvao/1.jpg",
    price: 7900,
    installments: 12,
    stock: "sob-encomenda",
    rating: 4.8,
    reviews: 12,
  },
];

/** Ticket alto: vitrine com cotação, sem preço exposto. */
export const quoteItems: ShopItem[] = [
  {
    slug: "esteira-transportadora-para-sacaria",
    sku: "ET-SAC-000",
    name: "Esteira Transportadora para Sacaria",
    brandLine: "Linha esteiras",
    image: "/img/produtos/esteira-transportadora-para-sacaria/1.jpg",
    stock: "cotacao",
    rating: 5,
    reviews: 54,
  },
  {
    slug: "esteira-transportadora-para-granel",
    sku: "ET-GRA-000",
    name: "Esteira Transportadora para Granel",
    brandLine: "Linha esteiras",
    image: "/img/produtos/esteira-transportadora-para-granel/1.jpg",
    stock: "cotacao",
    rating: 4.9,
    reviews: 37,
  },
  {
    slug: "rosca-transportadora",
    sku: "RT-STD-000",
    name: "Rosca Transportadora",
    brandLine: "Linha roscas",
    image: "/img/produtos/rosca-transportadora/1.jpg",
    stock: "cotacao",
    rating: 4.9,
    reviews: 26,
  },
  {
    slug: "elevador-de-canecas",
    sku: "EL-CAN-000",
    name: "Elevador de Canecas",
    brandLine: "Linha elevadores",
    image: "/img/produtos/elevador-de-canecas/1.jpg",
    stock: "cotacao",
    rating: 4.8,
    reviews: 21,
  },
];

export const shopBanners = [
  {
    eyebrow: "Safra sem parada",
    title: "Costura de sacaria pronta para embarcar",
    text: "Máquina, linha e peça de reposição no mesmo pedido. Nota fiscal e envio para todo o Brasil.",
    cta: "Ver linha de costura",
    href: "#vitrine",
    image: "/img/produtos/maquina-de-costurar-sacos-gk-26/1.jpg",
    tint: "from-[#0A1F3D] via-[#0d2f6b] to-[#103D94]",
  },
  {
    eyebrow: "Parou a linha?",
    title: "Peça de reposição com envio em 24h",
    text: "Rolete, raspador, correia e motorização das máquinas Demakine, direto da fábrica em Limeira/SP.",
    cta: "Ver peças em estoque",
    href: "#pecas",
    image: "/img/produtos/esteira-transportadora-horizontal/4.jpg",
    tint: "from-[#2b0a0d] via-[#7d1016] to-[#e4141b]",
  },
  {
    eyebrow: "Pequeno e médio produtor",
    title: "Movimente grão, ração e sacaria sem braço extra",
    text: "Equipamentos de pequeno porte com preço fechado no site e cotação de esteira sob medida.",
    cta: "Ver equipamentos",
    href: "#vitrine",
    image: "/img/produtos/esteira-transportadora-para-granel/1.jpg",
    tint: "from-[#0c2a17] via-[#14603a] to-[#17864f]",
  },
];

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


/* ------------------------------------------------------- compra por situação */

export type Situation = {
  slug: string;
  code: string;
  title: string;
  text: string;
  cta: string;
  tone: "red" | "blue" | "green";
  image: string;
};

export const situations: Situation[] = [
  {
    slug: "parou",
    code: "SIT.01",
    title: "Parou a linha agora",
    text: "Peça de reposição identificada pela foto e despachada no mesmo dia.",
    cta: "Resolver hoje",
    tone: "red",
    image: "/img/produtos/esteira-transportadora-horizontal/4.jpg",
  },
  {
    slug: "safra",
    code: "SIT.02",
    title: "Vai começar a safra",
    text: "Costura de sacaria, linha, agulha e consumível para aguentar o pico.",
    cta: "Montar meu kit",
    tone: "blue",
    image: "/img/produtos/maquina-de-costurar-sacos-gk-26/1.jpg",
  },
  {
    slug: "crescer",
    code: "SIT.03",
    title: "Preciso tirar o braço da carga",
    text: "Equipamento de movimentação dimensionado pela engenharia da fábrica.",
    cta: "Pedir dimensionamento",
    tone: "green",
    image: "/img/produtos/esteira-transportadora-para-granel/1.jpg",
  },
];

/* ------------------------------------------- peças compatíveis por máquina */

export type MachineFit = {
  slug: string;
  sku?: string;
  name: string;
  image: string;
  parts: { sku: string; name: string; price: number; stock: "pronta-entrega" | "sob-encomenda" }[];
};

export const machineFits: MachineFit[] = [
  {
    slug: "esteira-transportadora-para-sacaria",
    sku: "ET-SAC-000",
    name: "Esteira para Sacaria",
    image: "/img/produtos/esteira-transportadora-para-sacaria/1.jpg",
    parts: [
      { sku: "PC-ROL-076", name: "Rolete de carga Ø76mm", price: 168, stock: "pronta-entrega" },
      { sku: "PC-RSP-012", name: "Raspador de correia", price: 245, stock: "pronta-entrega" },
      { sku: "CR-LIS-002", name: "Correia lisa PVC 2 lonas (m)", price: 148, stock: "pronta-entrega" },
      { sku: "PC-MNC-030", name: "Mancal com rolamento", price: 132, stock: "pronta-entrega" },
    ],
  },
  {
    slug: "esteira-transportadora-para-granel",
    sku: "ET-GRA-000",
    name: "Esteira para Granel",
    image: "/img/produtos/esteira-transportadora-para-granel/1.jpg",
    parts: [
      { sku: "CR-TAL-004", name: "Correia taliscada (m)", price: 224, stock: "sob-encomenda" },
      { sku: "PC-SAN-008", name: "Sanfona lateral de contenção", price: 96, stock: "pronta-entrega" },
      { sku: "PC-ROL-076", name: "Rolete de carga Ø76mm", price: 168, stock: "pronta-entrega" },
      { sku: "PC-EMD-001", name: "Kit de emenda de correia", price: 78, stock: "pronta-entrega" },
    ],
  },
  {
    slug: "rosca-transportadora",
    sku: "RT-STD-000",
    name: "Rosca Transportadora",
    image: "/img/produtos/rosca-transportadora/1.jpg",
    parts: [
      { sku: "PC-HEL-220", name: "Segmento de hélice", price: 410, stock: "sob-encomenda" },
      { sku: "PC-BUC-014", name: "Bucha de mancal intermediário", price: 118, stock: "pronta-entrega" },
      { sku: "PC-VED-006", name: "Kit de vedação de eixo", price: 89, stock: "pronta-entrega" },
      { sku: "PC-MTR-150", name: "Motoredutor de reposição", price: 2380, stock: "sob-encomenda" },
    ],
  },
  {
    slug: "elevador-de-canecas",
    sku: "EL-CAN-000",
    name: "Elevador de Canecas",
    image: "/img/produtos/elevador-de-canecas/1.jpg",
    parts: [
      { sku: "PC-CAN-018", name: "Caneca em polietileno (un)", price: 34, stock: "pronta-entrega" },
      { sku: "CR-COR-009", name: "Correia de canecas (m)", price: 196, stock: "sob-encomenda" },
      { sku: "PC-PAR-045", name: "Kit parafuso de caneca (50 un)", price: 62, stock: "pronta-entrega" },
      { sku: "PC-TAM-003", name: "Tampa de inspeção", price: 88, stock: "pronta-entrega" },
    ],
  },
  {
    slug: "maquina-de-costurar-sacos-gk-26",
    sku: "CS-GK26",
    name: "Costuradeira GK-26",
    image: "/img/produtos/maquina-de-costurar-sacos-gk-26/1.jpg",
    parts: [
      { sku: "CS-AGU-026", name: "Agulha GK-26 (cartela 10 un)", price: 58, stock: "pronta-entrega" },
      { sku: "CS-LIN-200", name: "Linha para sacaria cone 200g", price: 39.9, stock: "pronta-entrega" },
      { sku: "CS-FAC-004", name: "Faca de corte de linha", price: 74, stock: "pronta-entrega" },
      { sku: "CS-OLE-001", name: "Óleo lubrificante 500ml", price: 32, stock: "pronta-entrega" },
    ],
  },
];

/** Linha de dados que corre no ticker do topo. */
export const tickerLines = [
  "FÁBRICA PRÓPRIA · LIMEIRA/SP",
  "ENVIO EM 24H NAS PEÇAS DE ESTOQUE",
  "PIX COM 5% DE DESCONTO",
  "12X SEM JUROS NO CARTÃO",
  "NOTA FISCAL EM TODO PEDIDO",
  "BOLETO PARA CNPJ",
  "SUPORTE TÉCNICO NO WHATSAPP",
  "+15 ANOS DE MERCADO",
];
