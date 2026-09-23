import { clients, products, testimonials } from "./content";

/** Segmentos do agro presentes na base real de clientes. */
const agroSegments = [
  "Agronegócio",
  "Cooperativa Agrícola",
  "Cooperativa de Leite",
  "Nutrição Animal",
  "Trading Agrícola",
  "Sementes",
  "Sementes e Nutrição",
  "Bioenergia",
  "Biodiesel",
  "Avicultura",
  "Piscicultura",
  "Óleos Vegetais",
  "Óleo de Palma",
  "Farinhas",
  "Hortifrúti",
  "Suco de Laranja",
  "Cacau e Chocolate",
  "Abastecimento",
];

/** Clientes reais do agro (mesma base da página /clientes). */
export const agroClients = clients.filter((c) => agroSegments.includes(c.segment));

/** Depoimentos reais de clientes do agro (empresas identificadas na base). */
const agroCompanies = [
  "Bom Futuro",
  "Produtor Rural",
  "Rodogrãos",
  "Fazenda Barra II",
  "Campo Vale",
  "Petrofertil",
  "Agro Paiol e Vilela Carvalho",
  "Nutria Nutrição Animal",
  "Coopervass",
  "Piscicultura Puro Peixe",
  "Avigran Alimentos",
  "Floragem Grama",
];

export const agroTestimonials = testimonials.filter((t) => agroCompanies.includes(t.company));

/** Etapas da operação e o equipamento Demakine de cada uma. */
export const agroChain = [
  {
    step: "01",
    title: "Recepção e moega",
    text: "Descarga de caminhão, big bag ou tulha para dentro do processo, sem gente no braço.",
    slugs: ["esteira-transportadora-para-granel", "esteira-transportadora-em-v", "calha-transportadora"],
  },
  {
    step: "02",
    title: "Elevação e transferência",
    text: "Ganho de altura para silo, secador, misturador ou tulha de ensaque em espaço curto.",
    slugs: ["elevador-de-canecas", "rosca-transportadora", "rosca-transportadora-chupim"],
  },
  {
    step: "03",
    title: "Ensaque e embalagem",
    text: "Alimentação da bica de ensaque e transporte do saco cheio até a costura.",
    slugs: ["esteira-transportadora-para-sacaria", "esteira-transportadora-horizontal"],
  },
  {
    step: "04",
    title: "Costura e fechamento",
    text: "Fechamento do saco com máquina de costura e linha própria para sacaria.",
    slugs: [
      "maquina-de-costurar-sacos-gk-26",
      "maquina-de-costurar-sacos-siruba-aa-6",
      "linha-fio-para-costura-de-sacaria",
    ],
  },
  {
    step: "05",
    title: "Expedição e carregamento",
    text: "Saco ou fardo do armazém para dentro do caminhão, com esteira móvel ou articulada.",
    slugs: [
      "elevador-de-sacaria",
      "esteira-transportadora-articulada",
      "cartrans-carrinho-transportador",
    ],
  },
] as const;

/** Cadeias do agro atendidas, com produtos reais indicados. */
export const agroChains = [
  {
    id: "graos",
    name: "Grãos e cereais",
    text: "Soja, milho, café, arroz e feijão: do recebimento ao carregamento do caminhão.",
    slugs: ["esteira-transportadora-para-granel", "elevador-de-canecas", "esteira-transportadora-para-sacaria"],
    image: "/img/produtos/esteira-transportadora-para-granel/1.jpg",
  },
  {
    id: "fertilizantes",
    name: "Fertilizantes e insumos",
    text: "Material abrasivo e úmido pede correia e estrutura certas, é o que fazemos há 15 anos.",
    slugs: ["esteira-transportadora-em-v", "rosca-transportadora", "esteira-transportadora-para-sacaria"],
    image: "/img/produtos/esteira-transportadora-em-v/1.jpg",
  },
  {
    id: "nutricao-animal",
    name: "Nutrição animal e ração",
    text: "Alimentação de misturador, ensaque de ração e transporte de farelo entre setores.",
    slugs: ["rosca-transportadora-chupim", "elevador-de-canecas", "esteira-transportadora-horizontal"],
    image: "/img/produtos/rosca-transportadora/1.jpg",
  },
  {
    id: "sementes",
    name: "Sementes",
    text: "Transporte com pouco impacto no grão e limpeza fácil entre lotes e cultivares.",
    slugs: ["esteira-transportadora-em-v", "esteira-transportadora-para-sacaria", "calha-transportadora"],
    image: "/img/produtos/esteira-transportadora-para-sacaria/1.jpg",
  },
  {
    id: "avicultura",
    name: "Avicultura e pecuária",
    text: "Retirada de cama de frango, transporte de ração e movimentação dentro do galpão.",
    slugs: ["esteira-transportadora-em-v-para-cama-de-frango-aviario", "esteira-transportadora-horizontal"],
    image: "/img/produtos/esteira-transportadora-em-v-para-cama-de-frango-aviario/1.jpg",
  },
  {
    id: "hortifruti",
    name: "Hortifrúti e agroindústria",
    text: "Frutas, legumes e cesta básica com correia sanitária e velocidade ajustada.",
    slugs: ["esteira-para-transporte-de-frutas-e-legumes", "esteira-transportadora-para-cesta-basica"],
    image: "/img/produtos/esteira-para-transporte-de-frutas-e-legumes/1.jpg",
  },
] as const;

export function agroProducts(slugs: readonly string[]) {
  return slugs.map((s) => products.find((p) => p.slug === s)).filter((p) => !!p);
}

/** Perguntas que o pessoal do campo faz antes de fechar. */
export const agroFaq = [
  {
    q: "Vocês entregam fora de São Paulo?",
    a: "Sim. A fábrica é em Limeira/SP e entregamos em todo o Brasil. A nossa base de clientes tem operação de Rondônia ao Ceará. O frete entra na proposta junto com o equipamento.",
  },
  {
    q: "Dá para fabricar no comprimento e na altura da minha operação?",
    a: "Dá. A maior parte do que sai da fábrica é ajustada em comprimento, largura de correia, altura de descarga e tipo de correia. Se o layout pedir algo diferente do catálogo, entra como projeto especial.",
  },
  {
    q: "Qual correia usar para fertilizante, grão ou saco?",
    a: "Depende do material e da inclinação: correia lisa em trecho plano, taliscada ou em V quando há elevação e material solto, PVC sanitário para alimento. Nossa engenharia indica na proposta.",
  },
  {
    q: "Qual a melhor época para instalar?",
    a: "Recomendamos fechar o projeto na entressafra ou antes do pico de recebimento, para a montagem não disputar espaço com a operação cheia.",
  },
  {
    q: "E depois da entrega, quem dá assistência?",
    a: "O nosso próprio time. Assistência técnica, peças de reposição e orientação de manutenção preventiva ficam com a Demakine, não terceirizamos o pós-venda.",
  },
] as const;
