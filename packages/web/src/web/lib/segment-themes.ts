/**
 * Visual de cada página de segmento (topo e faixa escura), no mesmo espírito da página Agro:
 * fundo escuro da cor do setor, brilho, uma textura que lembra o material e um tom de destaque.
 *
 * Cores: "accent" é usado como texto sobre o fundo escuro (contraste acima de 4,5:1) e como fundo
 * da etiqueta, com "accentInk" por cima. A cor clara do setor (sobre branco) fica em segmentos-lp.ts.
 */
export type SegmentTexture = "granulos" | "ciclo" | "obra" | "limpo" | "docas" | "metal" | "cruz" | "hex";

export type SegmentTheme = {
  /** fundo escuro principal e o tom mais fundo do degradê */
  base: string;
  deep: string;
  /** brilho no canto superior */
  glow: string;
  /** destaque sobre o fundo escuro */
  accent: string;
  /** texto sobre a etiqueta de destaque */
  accentInk: string;
  texture: SegmentTexture;
  /** trecho do título pintado com o destaque */
  highlight: string;
  /** três vantagens do topo */
  bullets: [string, string, string];
  /** faixa de credibilidade abaixo do topo */
  strip: [string, string, string, string];
  /** legenda da foto do topo */
  note: string;
  /** o setor numa frase: "Equipamentos para {sector}", "equipamento para {sector}" */
  sector: string;
};

export const SEGMENT_THEMES: Record<string, SegmentTheme> = {
  "fertilizantes-e-insumos": {
    base: "#24170b",
    deep: "#170e06",
    glow: "#6b4415",
    accent: "#e8a85a",
    accentInk: "#24170b",
    texture: "granulos",
    highlight: "fertilizantes",
    bullets: [
      "Correia e revestimento escolhidos para material que empasta",
      "Sistema fechado quando o produto solta pó",
      "Acesso de limpeza para trocar de formulação",
    ],
    strip: ["Ureia, NPK e corretivos", "Da moega ao ensaque", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Esteira em V: descarga de caminhão e moega com material a granel.",
    sector: "fertilizantes e insumos",
  },
  "reciclagem-e-residuos": {
    base: "#082524",
    deep: "#041615",
    glow: "#0f5c55",
    accent: "#5eead4",
    accentInk: "#062220",
    texture: "ciclo",
    highlight: "reciclagem",
    bullets: [
      "Velocidade e altura da correia pensadas para a equipe de triagem",
      "Correia de 1 m e modelos de 8 a 25 m",
      "Estrutura para material misturado e cortante",
    ],
    strip: ["Cooperativas e usinas", "Triagem manual", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Esteira de triagem: a correia é o posto de trabalho da equipe.",
    sector: "reciclagem e resíduos",
  },
  "construcao-e-mineracao": {
    base: "#1b1b1e",
    deep: "#111113",
    glow: "#4a4217",
    accent: "#facc15",
    accentInk: "#1b1b1e",
    texture: "obra",
    highlight: "agregados",
    bullets: [
      "Correia para material abrasivo e impacto na alimentação",
      "Perfil em V para levar mais volume por metro",
      "Estrutura para trabalho pesado no pátio",
    ],
    strip: ["Areia, brita e minério", "Pátio e britagem", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Esteira para granel carregando caminhão com agregado.",
    sector: "construção e mineração",
  },
  "alimentos-e-racao": {
    base: "#1a2410",
    deep: "#10170a",
    glow: "#44621a",
    accent: "#bef264",
    accentInk: "#1a2410",
    texture: "limpo",
    highlight: "alimentos",
    bullets: [
      "Correia sanitária em PVC quando o produto pede",
      "Transporte cuidadoso para produto que amassa",
      "Montagem de kits e cestas sem carregar no braço",
    ],
    strip: ["Ração, grãos e embalados", "Correia sanitária", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Esteira para cesta básica: kit montado em fila, sem carregar caixa.",
    sector: "alimentos e ração",
  },
  "logistica-e-distribuicao": {
    base: "#0a1830",
    deep: "#060f20",
    glow: "#1b4488",
    accent: "#7cb4ff",
    accentInk: "#0a1830",
    texture: "docas",
    highlight: "centro de distribuição",
    bullets: [
      "Esteira móvel que entra no baú da carreta",
      "Transporte contínuo da doca até a separação",
      "Menos gente carregando volume no braço",
    ],
    strip: ["CDs e atacados", "Doca e expedição", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Esteira Dalla na doca: carga e descarga direto no caminhão.",
    sector: "logística e distribuição",
  },
  metalurgico: {
    base: "#1a1f27",
    deep: "#10141a",
    glow: "#5a3218",
    accent: "#fb923c",
    accentInk: "#1a1f27",
    texture: "metal",
    highlight: "metalúrgica",
    bullets: [
      "Estrutura e motor dimensionados pelo peso por metro",
      "Roletes ou correia conforme a peça, o óleo e a aresta",
      "Linha entre máquinas, com curva e mudança de nível",
    ],
    strip: ["Usinagem, estamparia e solda", "Entre máquinas e expedição", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Transportador de roletes: peça e caixa pesada rolando entre setores.",
    sector: "a indústria metalúrgica",
  },
  farmaceutico: {
    base: "#082432",
    deep: "#041620",
    glow: "#0e5670",
    accent: "#67e8f9",
    accentInk: "#082432",
    texture: "cruz",
    highlight: "farmacêutica",
    bullets: [
      "Fim de linha e expedição sem carregar caixa no braço",
      "Posto de conferência na altura certa para a equipe",
      "Estrutura em inox sob consulta para área controlada",
    ],
    strip: ["Indústrias e distribuidoras", "Embalagem e conferência", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Esteira de caixas: expedição contínua até a doca.",
    sector: "a indústria farmacêutica",
  },
  "plastico-e-embalagens": {
    base: "#1d1433",
    deep: "#120c22",
    glow: "#48307e",
    accent: "#c4b5fd",
    accentInk: "#1d1433",
    texture: "hex",
    highlight: "plástico",
    bullets: [
      "Rosca para abastecer resina granulada sem erguer saco",
      "Esteira na saída da injetora e da extrusora",
      "Caixa e fardo seguindo direto para a expedição",
    ],
    strip: ["Injeção, extrusão e sopro", "Resina, peça e embalagem", "Projeto sob medida", "Entrega em todo o Brasil"],
    note: "Rosca transportadora: abastecimento contínuo de material granulado.",
    sector: "a indústria do plástico e de embalagens",
  },
};

/** Tema de reserva (azul Demakine) para segmento novo cadastrado sem tema. */
export const DEFAULT_SEGMENT_THEME: SegmentTheme = {
  base: "#0a1830",
  deep: "#060f20",
  glow: "#1b4488",
  accent: "#7cb4ff",
  accentInk: "#0a1830",
  texture: "docas",
  highlight: "",
  bullets: ["Projeto sob medida para o seu material", "Fabricação própria em Limeira/SP", "Assistência técnica e peças de reposição"],
  strip: ["Projeto sob medida", "Fabricação própria", "Assistência técnica", "Entrega em todo o Brasil"],
  note: "Equipamento Demakine fabricado em Limeira/SP.",
  sector: "o seu setor",
};
