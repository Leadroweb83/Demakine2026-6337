import {
  Car,
  Factory,
  Flame,
  HardHat,
  Package,
  Pill,
  Recycle,
  Scroll,
  Truck,
  UtensilsCrossed,
  Users,
  Wheat,
  type LucideIcon,
} from "lucide-react";

/**
 * Fonte única dos segmentos atendidos: nome, cor, ícone e o equipamento real
 * que a engenharia indica para cada um. A cor é o padrão do segmento em todo o
 * site (chips, carrossel, páginas de produto).
 */
export type Segment = {
  name: string;
  slug: string;
  color: string;
  icon: LucideIcon;
  text: string;
  product: string;
  productSlug: string;
};

export const segmentList: Segment[] = [
  {
    name: "Alimentício",
    slug: "alimenticio",
    color: "#c2410c",
    icon: UtensilsCrossed,
    text: "Linhas de montagem e conferência com correia atóxica e limpeza fácil.",
    product: "Esteira para Cesta Básica",
    productSlug: "esteira-transportadora-para-cesta-basica",
  },
  {
    name: "Agronegócio",
    slug: "agronegocio",
    color: "#2f7a3f",
    icon: Wheat,
    text: "Grãos, sementes e fertilizantes do recebimento ao carregamento.",
    product: "Esteira para Granel",
    productSlug: "esteira-transportadora-para-granel",
  },
  {
    name: "Reciclagem",
    slug: "reciclagem",
    color: "#0f766e",
    icon: Recycle,
    text: "Triagem de resíduos com velocidade ajustada ao ritmo da equipe.",
    product: "Esteira para Reciclagem e Triagem",
    productSlug: "esteira-transportadora-para-reciclagem-triagem",
  },
  {
    name: "Metalúrgico",
    slug: "metalurgico",
    color: "#475569",
    icon: Factory,
    text: "Peças e fardos entre setores, com estrutura reforçada.",
    product: "Esteira Transportadora Horizontal",
    productSlug: "esteira-transportadora-horizontal",
  },
  {
    name: "Farmacêutico",
    slug: "farmaceutico",
    color: "#0e7490",
    icon: Pill,
    text: "Caixas e pacotes na expedição, com transporte suave e contínuo.",
    product: "Esteira para Caixas e Pacotes",
    productSlug: "esteira-transportadora-de-caixas",
  },
  {
    name: "Plástico e Embalagens",
    slug: "plastico-embalagens",
    color: "#7c3aed",
    icon: Package,
    text: "Layouts com curva e mudança de nível em espaços apertados.",
    product: "Esteira Transportadora Articulada",
    productSlug: "esteira-transportadora-articulada",
  },
  {
    name: "Logística e Armazenagem",
    slug: "logistica-armazenagem",
    color: "#103d94",
    icon: Truck,
    text: "Carga e descarga de caminhão com equipamento móvel de pátio.",
    product: "Esteira Transportadora Dalla",
    productSlug: "esteira-transportadora-dalla",
  },
  {
    name: "Automotivo",
    slug: "automotivo",
    color: "#1e293b",
    icon: Car,
    text: "Movimentação interna de peças e apoio às estações de trabalho.",
    product: "Cartrans Carrinho Transportador",
    productSlug: "cartrans-carrinho-transportador",
  },
  {
    name: "Bioenergia",
    slug: "bioenergia",
    color: "#b45309",
    icon: Flame,
    text: "Classificação de carvão e separação de finos antes do ensaque.",
    product: "Peneira para Carvão",
    productSlug: "peneira-para-carvao",
  },
  {
    name: "Celulose e Papel",
    slug: "celulose-papel",
    color: "#a16207",
    icon: Scroll,
    text: "Processo com inspeção visual e material que pede ventilação.",
    product: "Calha Transportadora",
    productSlug: "calha-transportadora",
  },
  {
    name: "Construção",
    slug: "construcao",
    color: "#d97706",
    icon: HardHat,
    text: "Areia, brita e agregados com maior volume por metro de correia.",
    product: "Esteira Transportadora em V para Granel",
    productSlug: "esteira-transportadora-para-granel",
  },
  {
    name: "Cooperativas",
    slug: "cooperativas",
    color: "#15803d",
    icon: Users,
    text: "Ganho de altura para grãos, rações e farelos em silos e armazéns.",
    product: "Elevador de Canecas",
    productSlug: "elevador-de-canecas",
  },
];

export function segmentByName(name: string) {
  return segmentList.find((s) => s.name === name);
}
