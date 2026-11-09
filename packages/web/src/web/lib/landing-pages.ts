/**
 * Páginas com URL própria só em português (categorias e páginas comerciais). Cada uma responde a um termo que o Google
 * já trazia para o site antigo ou que o anúncio usa. O texto só afirma o que as fichas de produto, o FAQ e os posts do
 * site já dizem: número técnico novo, preço, prazo e financiamento não entram aqui.
 */
import { WA } from "./landing-links";

export type LandingFaq = { q: string; a: string };

export type LandingPage = {
  slug: string;
  kind: "categoria" | "comercial";
  /** categoria de produto (content.json) da trilha Início › Produtos › Categoria */
  category?: string;
  seoTitle: string;
  seoDesc: string;
  eyebrow: string;
  h1: string;
  lead: string;
  /** mensagem pronta do WhatsApp e do formulário de orçamento */
  waMessage: string;
  productsEyebrow: string;
  productsTitle: string;
  /** produtos exibidos, na ordem; a foto do topo é a do primeiro */
  productSlugs: string[];
  guideEyebrow: string;
  guideTitle: string;
  guide: { title: string; text: string }[];
  table?: { title: string; head: string[]; rows: string[][]; note?: string };
  faqTitle: string;
  faq: LandingFaq[];
  quoteTitle: string;
  quoteText: string;
  related: { label: string; to: string }[];
};

const ORCAMENTO_INFO =
  "Informe o material transportado, o comprimento, a altura de descarga e a capacidade desejada. Fotos do local ajudam. O orçamento sai em até 1 dia útil.";

/** perguntas de compra comuns às páginas; o texto de cada uma já existe na página de FAQ do site */
const faqCompra = (equip: string): LandingFaq[] => [
  {
    q: "Que informações preciso para pedir um orçamento?",
    a: `Material transportado, comprimento necessário, altura de descarga e capacidade desejada. Se tiver fotos do local, mande junto: ajudam a engenharia a dimensionar ${equip}.`,
  },
  { q: "Em quanto tempo recebo o orçamento?", a: "Em até 1 dia útil, depois que você envia as informações da sua operação." },
  { q: "A Demakine entrega em todo o Brasil?", a: "Sim. Fabricamos em Limeira/SP e entregamos em todo o Brasil." },
  { q: "Tem assistência técnica e peças de reposição?", a: "Tem. A assistência técnica e as peças de reposição vêm direto do fabricante." },
];

const faqPreco = (equip: string): LandingFaq[] => [
  {
    q: "Como funciona o frete?",
    a: "O frete é cotado junto com a proposta, conforme o destino e as dimensões do equipamento. Você pode usar a nossa cotação ou a sua própria transportadora.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "As condições são apresentadas na proposta comercial, incluindo as opções para pedido com adiantamento e para faturamento. Emitimos nota fiscal para todos os pedidos.",
  },
  {
    q: "Qual é o prazo de fabricação?",
    a: `Depende de ${equip} e da fila de produção no momento do pedido. O prazo é confirmado por escrito na proposta.`,
  },
];

export const landingPages: LandingPage[] = [
  // ------------------------------------------------------------------------------------------ categorias
  {
    slug: "esteiras-transportadoras",
    kind: "categoria",
    category: "esteiras-transportadoras",
    seoTitle: "Esteiras Transportadoras para Indústria e Agro | Demakine",
    seoDesc:
      "Esteiras transportadoras fabricadas em Limeira/SP: sacaria, caixas, granel e reciclagem. Fale com um vendedor e receba o orçamento em até 1 dia útil.",
    eyebrow: "Esteiras transportadoras",
    h1: "Esteiras transportadoras para a sua operação",
    lead: "Fabricamos esteiras transportadoras em Limeira/SP para sacaria, caixas, granel, frutas, reciclagem e cargas especiais. Escolha o modelo abaixo ou fale com um vendedor, que indica o equipamento para o seu material.",
    waMessage: WA["esteiras-transportadoras"],
    productsEyebrow: "Modelos",
    productsTitle: "Esteiras para cada operação",
    productSlugs: [
      "esteira-transportadora-horizontal",
      "esteira-transportadora-para-sacaria",
      "esteira-transportadora-articulada",
      "esteira-transportadora-dalla",
      "esteira-transportadora-de-caixas",
      "esteira-transportadora-para-granel",
      "esteira-transportadora-em-v-para-cama-de-frango-aviario",
      "esteira-transportadora-para-cesta-basica",
      "esteira-para-transporte-de-frutas-e-legumes",
      "esteira-transportadora-para-reciclagem-triagem",
      "esteira-de-roletes-livres",
    ],
    guideEyebrow: "Como escolher",
    guideTitle: "Qual esteira serve para a sua carga",
    guide: [
      {
        title: "Pelo tipo de carga",
        text: "Sacaria e fardos pedem a esteira para sacaria ou a Dalla, as duas para carga e descarga junto ao caminhão. Caixas e pacotes de centro de distribuição vão na esteira de caixas e pacotes. Para picking sem motor, a de roletes livres.",
      },
      {
        title: "Pelo material a granel",
        text: "Grãos, adubo, areia, brita e minérios pedem a esteira em V para granel. Cama de frango de aviário e triagem de reciclagem têm modelo próprio.",
      },
      {
        title: "Pelo layout",
        text: "Curva, mudança de nível e espaço apertado pedem a esteira articulada. Para levar o material em linha reta entre setores, a horizontal.",
      },
      {
        title: "Quando o modelo não está na lista",
        text: "Descreva a operação: material, comprimento, altura e capacidade. A engenharia monta o projeto, e o orçamento sai em até 1 dia útil.",
      },
    ],
    faqTitle: "Dúvidas sobre esteiras transportadoras",
    faq: [
      {
        q: "O que é uma esteira transportadora?",
        a: "É um equipamento que leva material de um ponto a outro de forma contínua, sobre uma correia ou sobre roletes. Substitui o carregamento manual na carga e descarga, na linha de produção e na triagem.",
      },
      {
        q: "Qual esteira transportadora serve para carregar caminhão?",
        a: "Para sacaria, fardos, caixas e pacotes, as esteiras para sacaria, Dalla e de caixas e pacotes trabalham na carga e descarga junto ao caminhão, com menos mão de obra e mais produtividade.",
      },
      {
        q: "Qual esteira é indicada para granel?",
        a: "A esteira em V para granel, indicada para adubo, grãos, areia, brita, minérios, carvão, soja, café, sal e cereais.",
      },
      {
        q: "A Demakine faz esteira sob medida?",
        a: "Sim. Todos os modelos saem da nossa unidade em Limeira/SP e podem ser adaptados ao seu layout, material e capacidade.",
      },
      ...faqCompra("o equipamento"),
    ],
    quoteTitle: "Peça uma proposta para a sua esteira",
    quoteText: ORCAMENTO_INFO,
    related: [
      { label: "Fabricante de esteira transportadora", to: "/fabricante-de-esteira-transportadora" },
      { label: "Esteira transportadora industrial", to: "/esteira-transportadora-industrial" },
      { label: "Esteira para carga e descarga de caminhão", to: "/esteira-para-carga-e-descarga-de-caminhao" },
      { label: "Esteira transportadora: preço", to: "/esteira-transportadora-preco" },
      { label: "Catálogo completo", to: "/produtos" },
    ],
  },
  {
    slug: "roscas-transportadoras",
    kind: "categoria",
    category: "roscas-transportadoras",
    seoTitle: "Roscas Transportadoras: Helicoidal e Chupim | Demakine",
    seoDesc:
      "Rosca transportadora helicoidal, rosca chupim e calha para grãos, ração, fertilizante e pó. Fabricada em Limeira/SP. Fale com um vendedor e peça orçamento.",
    eyebrow: "Roscas transportadoras",
    h1: "Roscas transportadoras para grãos, ração e pós",
    lead: "Fabricamos a rosca transportadora helicoidal, a rosca chupim e a calha transportadora em Limeira/SP. A linha de catálogo vai de 5 a 15 metros de comprimento, com helicoide de 4″ a 16″.",
    waMessage: WA["roscas-transportadoras"],
    productsEyebrow: "Modelos",
    productsTitle: "Roscas e calha para cada processo",
    productSlugs: ["rosca-transportadora", "rosca-transportadora-chupim", "calha-transportadora"],
    guideEyebrow: "Como escolher",
    guideTitle: "Qual rosca serve para o seu material",
    guide: [
      {
        title: "Rosca helicoidal",
        text: "Leva grãos, milho, ração, farelos, fertilizantes e pós entre dois pontos, como alimentação de máquinas, moinhos e silos. A capacidade cresce com o diâmetro do helicoide: de 5 a 10 ton/h no Ø4″ até 125 a 135 ton/h no Ø16″.",
      },
      {
        title: "Rosca chupim",
        text: "É a rosca da descarga: esvazia tulha, silo e carreta, aproveita a sobra de grão e limpa a carreta. Transfere rápido, e o trabalho que levava horas passa para minutos.",
      },
      {
        title: "Calha transportadora",
        text: "Entra quando o processo pede inspeção visual do material, ventilação, limpeza frequente ou dosagem. Atende moinhos, silos, ensacadeiras, extrusoras e injetoras.",
      },
      {
        title: "Diâmetro e comprimento",
        text: "O diâmetro sai da capacidade que você precisa. O comprimento sai da distância e da altura de descarga. Informe os dois no orçamento, e a engenharia confirma o modelo.",
      },
    ],
    faqTitle: "Dúvidas sobre roscas transportadoras",
    faq: [
      {
        q: "O que é uma rosca transportadora?",
        a: "É o equipamento que move material a granel de forma contínua com um helicoide. Agiliza a carga e a descarga de moinhos, silos, caminhões, ensacadeiras, extrusoras e injetoras, e o transporte de cereais, grãos, rações, resinas plásticas granuladas e produtos químicos.",
      },
      {
        q: "Qual a diferença entre rosca helicoidal e rosca chupim?",
        a: "A helicoidal alimenta e transfere material ao longo do processo. A chupim foi feita para a descarga rápida de tulha, silo e carreta e para o aproveitamento de sobra de grão.",
      },
      {
        q: "Qual diâmetro de helicoide a Demakine fabrica?",
        a: "De 4″ a 16″, em comprimentos de 5 a 15 metros. A capacidade de cada diâmetro está na ficha da rosca transportadora.",
      },
      {
        q: "A rosca serve para ração e fertilizante?",
        a: "Sim. A rosca helicoidal atende grãos, milho, ração, farelos, fertilizantes e pós.",
      },
      {
        q: "Fazem rosca sob medida?",
        a: "Sim. Adaptamos comprimento, diâmetro e altura de descarga ao seu layout, material e capacidade.",
      },
      ...faqCompra("a rosca"),
    ],
    quoteTitle: "Peça uma proposta para a sua rosca",
    quoteText: ORCAMENTO_INFO,
    related: [
      { label: "Rosca transportadora: preço", to: "/rosca-transportadora-preco" },
      { label: "Guia completo sobre roscas transportadoras", to: "/blog/guia-completo-sobre-roscas-transportadoras" },
      { label: "Elevadores", to: "/elevadores" },
      { label: "Catálogo completo", to: "/produtos" },
    ],
  },
  {
    slug: "elevadores",
    kind: "categoria",
    category: "elevadores",
    seoTitle: "Elevador de Canecas e Elevador de Sacaria | Demakine",
    seoDesc:
      "Elevador de canecas para grãos e granel e elevador de sacaria para levantar sacos. Fabricados em Limeira/SP. Fale com um vendedor e peça orçamento.",
    eyebrow: "Elevadores",
    h1: "Elevador de canecas e elevador de sacaria",
    lead: "Fabricamos elevador de canecas, para subir grãos e produtos a granel na vertical, e elevador de sacaria, para levantar sacos. Os dois saem da nossa unidade em Limeira/SP.",
    waMessage: WA["elevadores"],
    productsEyebrow: "Modelos",
    productsTitle: "Dois elevadores, duas cargas",
    productSlugs: ["elevador-de-canecas", "elevador-de-sacaria"],
    guideEyebrow: "Como escolher",
    guideTitle: "Elevador de canecas ou de sacaria",
    guide: [
      {
        title: "Elevador de canecas",
        text: "Faz o transporte vertical de produto a granel: grãos como soja e milho, açúcar, areia, pedra, vidro quebrado, massas, produtos úmidos, lodo, argila e pó. Atende silos, armazéns, rações e farelos e beneficiamento.",
      },
      {
        title: "Elevador de sacaria",
        text: "Também chamado de levantador de sacos, ajuda a levantar sacos em geral. Tira o esforço pesado do operador, reduz o risco de acidente de trabalho e entra no empilhamento, na carga de caminhão e no armazém.",
      },
      {
        title: "Elevador ou esteira",
        text: "Quando o desnível pede subida vertical, a escolha é o elevador. Quando há distância a vencer, uma esteira com inclinação suave resolve, e o ângulo é definido no projeto, junto com a altura de descarga.",
      },
      {
        title: "Quando o modelo não está na lista",
        text: "Descreva o material, a altura e a capacidade. A engenharia monta o projeto, e o orçamento sai em até 1 dia útil.",
      },
    ],
    faqTitle: "Dúvidas sobre elevadores",
    faq: [
      {
        q: "O que é um elevador de canecas?",
        a: "É o equipamento que faz o transporte vertical de produto a granel. Serve para grãos, açúcar, areia, pedra, massas, produtos úmidos, pó e outros materiais de granulometria e densidade variadas.",
      },
      {
        q: "Para que serve o elevador de sacaria?",
        a: "Para levantar sacos em geral. Ele reduz o esforço do operador e o risco de acidente de trabalho no empilhamento, na carga de caminhão e no armazém.",
      },
      {
        q: "Qual a diferença entre elevador e esteira?",
        a: "O elevador sobe na vertical. A esteira vence distância, e pode subir com inclinação suave, definida no projeto.",
      },
      {
        q: "O elevador de canecas serve para ração e farelo?",
        a: "Sim. Rações e farelos estão entre as aplicações do elevador de canecas, junto com grãos, silos e armazéns.",
      },
      { q: "Fazem elevador sob medida?", a: "Sim. Adaptamos o equipamento à altura, ao material e à capacidade da sua operação." },
      ...faqCompra("o elevador"),
    ],
    quoteTitle: "Peça uma proposta para o seu elevador",
    quoteText: "Informe o material, a altura que precisa vencer e a capacidade desejada. Fotos do local ajudam. O orçamento sai em até 1 dia útil.",
    related: [
      { label: "Esteiras transportadoras", to: "/esteiras-transportadoras" },
      { label: "Roscas transportadoras", to: "/roscas-transportadoras" },
      { label: "Segmento de alimentos e ração", to: "/segmentos/alimentos-e-racao" },
      { label: "Catálogo completo", to: "/produtos" },
    ],
  },
  {
    slug: "maquinas-de-costurar-sacos",
    kind: "categoria",
    category: "empacotamento-e-costura",
    seoTitle: "Máquinas de Costurar Sacos: GK-26 e Siruba | Demakine",
    seoDesc:
      "Máquinas de costurar sacos portáteis GK-26 e Siruba AA-6, linha de poliéster, Cartrans e Mini Sistema de Costura. Fale com um vendedor e peça orçamento.",
    eyebrow: "Costura de sacaria",
    h1: "Máquinas de costurar sacos e equipamentos de costura",
    lead: "Máquinas portáteis para fechar sacos, linha de poliéster e equipamentos de apoio: a GK-26, a Siruba AA-6, o Cartrans e o Mini Sistema de Costura.",
    waMessage: WA["maquinas-de-costurar-sacos"],
    productsEyebrow: "Linha de costura",
    productsTitle: "Máquinas, linha e apoio para a costura",
    productSlugs: [
      "maquina-de-costurar-sacos-gk-26",
      "maquina-de-costurar-sacos-siruba-aa-6",
      "mini-sistema-de-costura",
      "cartrans-carrinho-transportador",
      "linha-fio-para-costura-de-sacaria",
    ],
    guideEyebrow: "Como escolher",
    guideTitle: "Qual equipamento de costura serve para você",
    guide: [
      {
        title: "GK-26",
        text: "Costura até 10 metros por minuto, com motor forte e polias balanceadas que evitam a vibração na mão do operador. Tem bomba de óleo, carcaça em alumínio e peças em aço carbono. É a indicada para alto volume.",
      },
      {
        title: "Siruba AA-6",
        text: "De origem tailandesa, é leve e fácil de manusear para cortar o fio e levantar o pé calçador. As peças são em aço prata tungstênio. Serve a indústrias, fazendas e quem busca qualidade na produção.",
      },
      {
        title: "Mini Sistema de Costura",
        text: "Esteira compacta com suporte para máquina portátil, para pequenas e médias produções. Costura até 2.000 sacos por dia, com regulagem de altura, guias laterais e rodízios para mudar de lugar.",
      },
      {
        title: "Cartrans e linha",
        text: "O Cartrans é o carrinho transportador para o fechamento de sacos de carvão. A linha é 100% poliéster, em cones de 250 g e 1 kg, e serve a todos os modelos de máquina de costura de sacaria.",
      },
    ],
    faqTitle: "Dúvidas sobre máquinas de costurar sacos",
    faq: [
      {
        q: "Que tipo de saco a máquina costura?",
        a: "Ráfia, nylon, papel, plástico, juta e outros. As máquinas portáteis fecham sacos de ração, grãos, sementes, fertilizante e carvão.",
      },
      {
        q: "Qual linha usar na máquina de costurar sacos?",
        a: "A linha 100% poliéster, em cones de 250 g e de 1 kg, serve a todos os modelos de máquina de costura de sacaria.",
      },
      {
        q: "Quantos sacos o Mini Sistema de Costura fecha por dia?",
        a: "Até 2.000 sacos por dia, em pequenas e médias produções.",
      },
      {
        q: "A Demakine tem peças de reposição para costura de sacaria?",
        a: "Sim. A Demakine fornece peças de reposição, inclusive itens de costura de sacaria.",
      },
      ...faqCompra("o equipamento"),
    ],
    quoteTitle: "Peça uma proposta para a sua costura",
    quoteText: "Informe o tipo de saco, o volume por dia e se a operação é fixa ou móvel. O orçamento sai em até 1 dia útil.",
    related: [
      { label: "Máquina de costurar sacos: preço", to: "/maquina-de-costurar-sacos-preco" },
      { label: "Peneira para carvão", to: "/produtos/peneira-para-carvao" },
      { label: "Esteiras transportadoras", to: "/esteiras-transportadoras" },
      { label: "Catálogo completo", to: "/produtos" },
    ],
  },

  // ------------------------------------------------------------------------------------ páginas comerciais
  {
    slug: "fabricante-de-esteira-transportadora",
    kind: "comercial",
    category: "esteiras-transportadoras",
    seoTitle: "Fabricante de Esteira Transportadora | Demakine",
    seoDesc:
      "Fabricante de esteira transportadora em Limeira/SP: projeto sob medida, fabricação própria, entrega no Brasil todo e assistência técnica. Peça orçamento.",
    eyebrow: "Fabricante",
    h1: "Fabricante de esteira transportadora em Limeira/SP",
    lead: "A Demakine projeta e fabrica as esteiras na própria unidade, em Limeira/SP. A engenharia dimensiona o equipamento para o seu material, e o orçamento sai em até 1 dia útil.",
    waMessage: WA["fabricante-de-esteira-transportadora"],
    productsEyebrow: "Linha de fábrica",
    productsTitle: "O que fabricamos",
    productSlugs: [
      "esteira-transportadora-para-granel",
      "esteira-transportadora-para-sacaria",
      "esteira-transportadora-dalla",
      "esteira-transportadora-para-reciclagem-triagem",
      "esteira-transportadora-em-v-para-cama-de-frango-aviario",
      "esteira-transportadora-de-caixas",
    ],
    guideEyebrow: "Por que a fábrica",
    guideTitle: "Comprar da Demakine é comprar do fabricante",
    guide: [
      {
        title: "Fabricação própria",
        text: "Todos os modelos saem da nossa unidade em Limeira/SP. Nada sai da fábrica sem teste de funcionamento, e o projeto e a fabricação ficam no mesmo lugar.",
      },
      {
        title: "Sob medida",
        text: "Adaptamos o equipamento ao seu layout, ao seu material e à capacidade que você precisa, em vez de empurrar um modelo de catálogo.",
      },
      {
        title: "Entrega em todo o Brasil",
        text: "Do pedido à entrega, o equipamento sai da fábrica direto para a sua operação, em qualquer estado. A logística é acompanhada pela nossa equipe.",
      },
      {
        title: "Pós-venda com quem fabricou",
        text: "Assistência técnica própria e peças de reposição direto do fabricante: correia, roletes, raspador, rolamentos, redutor e motor.",
      },
    ],
    faqTitle: "Dúvidas sobre o fabricante",
    faq: [
      {
        q: "A Demakine é fabricante ou revenda?",
        a: "Fabricante. Projetamos e fabricamos as esteiras na nossa unidade em Limeira/SP.",
      },
      {
        q: "Quais esteiras transportadoras a Demakine fabrica?",
        a: "Horizontal, articulada, para sacaria, Dalla, de caixas e pacotes, em V para granel, para cama de frango, para cesta básica, para frutas e legumes, para reciclagem e triagem, e de roletes livres.",
      },
      {
        q: "Posso pedir um modelo fora do catálogo?",
        a: "Pode. Descreva material, comprimento, altura e capacidade, e a engenharia monta um projeto sob medida.",
      },
      {
        q: "É possível visitar a fábrica?",
        a: "Sim, e recomendamos. Ver o processo de corte, solda, pintura e teste ajuda a entender o padrão de fabricação. Combine a visita com o comercial pelo WhatsApp.",
      },
      ...faqCompra("o equipamento"),
    ],
    quoteTitle: "Peça uma proposta direto da fábrica",
    quoteText: ORCAMENTO_INFO,
    related: [
      { label: "Todas as esteiras transportadoras", to: "/esteiras-transportadoras" },
      { label: "Assistência técnica", to: "/assistencia-tecnica" },
      { label: "Projetos especiais", to: "/projetos-especiais" },
      { label: "A empresa", to: "/a-empresa" },
    ],
  },
  {
    slug: "esteira-transportadora-industrial",
    kind: "comercial",
    category: "esteiras-transportadoras",
    seoTitle: "Esteira Transportadora Industrial sob Medida | Demakine",
    seoDesc:
      "Esteira transportadora industrial fabricada em Limeira/SP: linha de produção, embalagem, alimento e granel, em versão inox ou galvanizada. Peça orçamento.",
    eyebrow: "Uso industrial",
    h1: "Esteira transportadora industrial sob medida",
    lead: "Para linha de produção, embalagem, expedição, alimento e granel, a esteira industrial muda conforme o material e o ambiente. Projetamos cada uma na fábrica, em Limeira/SP.",
    waMessage: WA["esteira-transportadora-industrial"],
    productsEyebrow: "Modelos industriais",
    productsTitle: "Esteiras para a linha da sua indústria",
    productSlugs: [
      "esteira-transportadora-horizontal",
      "esteira-transportadora-de-caixas",
      "esteira-transportadora-para-sacaria",
      "esteira-transportadora-para-granel",
      "esteira-transportadora-articulada",
      "esteira-para-transporte-de-frutas-e-legumes",
      "esteira-transportadora-para-reciclagem-triagem",
      "esteira-transportadora-para-cesta-basica",
    ],
    guideEyebrow: "O que muda no projeto",
    guideTitle: "Cinco escolhas que definem a esteira industrial",
    guide: [
      {
        title: "Correia certa para o material",
        text: "Sacaria e caixas pedem correia lisa. Material solto em subida pede correia taliscada, para a carga não retornar. Granel fino rende mais em correia em V, que forma calha. Linha de alimento pede correia atóxica, fácil de higienizar.",
      },
      {
        title: "Inox, galvanizado ou estrutura padrão",
        text: "Fabricamos versões em inox e com correia sanitária para operações que exigem higienização, e galvanizado para ambiente agressivo.",
      },
      {
        title: "Velocidade no ritmo da equipe",
        text: "Em triagem e conferência, a velocidade ajustável faz diferença, porque o ritmo da esteira precisa acompanhar o ritmo de quem trabalha nela. Isso é definido na motorização.",
      },
      {
        title: "Tensão e proteções",
        text: "A motorização sai compatível com a rede da sua planta, inclusive trifásica. As proteções ficam nas partes móveis, e dá para incluir os dispositivos que a sua operação exige.",
      },
      {
        title: "Layout da planta",
        text: "Curvas, mudança de nível e espaço apertado entram no projeto. A esteira articulada resolve curva e desnível, e a horizontal liga setores em linha reta.",
      },
    ],
    faqTitle: "Dúvidas sobre esteira industrial",
    faq: [
      {
        q: "O que é uma esteira transportadora industrial?",
        a: "É a esteira projetada para a rotina de uma planta: linha de produção, embalagem, expedição, triagem ou transporte de granel. Muda a correia, a estrutura, a motorização e as proteções conforme o material e o ambiente.",
      },
      {
        q: "Vocês fabricam em inox e para linha de alimento?",
        a: "Sim. Fabricamos versões em inox e com correia sanitária para operações que exigem higienização, além de galvanizado para ambiente agressivo.",
      },
      {
        q: "Quais segmentos da indústria vocês atendem?",
        a: "Fertilizantes e insumos, reciclagem e resíduos, construção e mineração, alimentos e ração, logística e distribuição, metalúrgico, farmacêutico, plástico e embalagens.",
      },
      {
        q: "É possível variar a velocidade da esteira?",
        a: "Sim. Em triagem e conferência, a velocidade ajustável acompanha o ritmo da equipe. Isso é definido na motorização.",
      },
      {
        q: "Qual é a inclinação máxima de uma esteira?",
        a: "Depende do material e da correia. Produto embalado em correia lisa aceita inclinação suave. Acima disso é preciso talisca para segurar a carga. O ângulo final é definido no projeto, junto com a altura de descarga.",
      },
      ...faqCompra("a esteira"),
    ],
    quoteTitle: "Peça uma proposta para a sua linha",
    quoteText: ORCAMENTO_INFO,
    related: [
      { label: "Todas as esteiras transportadoras", to: "/esteiras-transportadoras" },
      { label: "Fabricante de esteira transportadora", to: "/fabricante-de-esteira-transportadora" },
      { label: "Projetos especiais", to: "/projetos-especiais" },
      { label: "Calculadora de dimensionamento", to: "/ferramentas" },
    ],
  },
  {
    slug: "esteira-para-carga-e-descarga-de-caminhao",
    kind: "comercial",
    category: "esteiras-transportadoras",
    seoTitle: "Esteira para Carregar e Descarregar Caminhão | Demakine",
    seoDesc:
      "Esteira para carga e descarga de caminhão: sacaria, caixas e granel, com menos mão de obra e mais produtividade. Fabricada em Limeira/SP. Peça orçamento.",
    eyebrow: "Carga e descarga",
    h1: "Esteira para carregar e descarregar caminhão",
    lead: "Sacaria, fardos, caixas e granel saem do caminhão e entram nele com menos gente e menos tempo parado no pátio. Fabricamos a esteira de carga e descarga em Limeira/SP.",
    waMessage: WA["esteira-para-carga-e-descarga-de-caminhao"],
    productsEyebrow: "Modelos para o caminhão",
    productsTitle: "Qual esteira usar no pátio",
    productSlugs: [
      "esteira-transportadora-para-sacaria",
      "esteira-transportadora-dalla",
      "esteira-transportadora-articulada",
      "esteira-transportadora-para-granel",
      "esteira-transportadora-de-caixas",
    ],
    guideEyebrow: "Como escolher",
    guideTitle: "O que decide a esteira de carga e descarga",
    guide: [
      {
        title: "O que vai passar",
        text: "Sacaria e fardos vão na esteira para sacaria ou na Dalla. Caixas e pacotes vão na esteira de caixas e pacotes. Adubo, grãos, areia e brita vão na esteira em V para granel.",
      },
      {
        title: "Altura da carroceria",
        text: "Meça a altura do ponto de queda em relação ao piso: borda da carroceria, boca da moega ou entrada do silo. Se a altura muda ao longo do dia, existe solução: esteira articulada, base com rodízios ou regulagem de altura.",
      },
      {
        title: "Capacidade no pico",
        text: "Dimensione pelo pico, aquele momento em que dois caminhões chegam juntos, e não pela média do dia. Assim a operação nunca vira gargalo.",
      },
      {
        title: "Pátio aberto ou galpão",
        text: "Pó, umidade e sol mudam o projeto. Descreva o ambiente no orçamento, e a engenharia ajusta a estrutura e a proteção.",
      },
    ],
    faqTitle: "Dúvidas sobre esteira para caminhão",
    faq: [
      {
        q: "Qual esteira serve para carregar caminhão?",
        a: "Para sacaria e fardos, a esteira para sacaria e a Dalla. Para caixas e pacotes, a esteira de caixas e pacotes. Para granel, a esteira em V. Todas trabalham na carga e descarga junto ao caminhão.",
      },
      {
        q: "Quanto a esteira reduz o tempo de carga?",
        a: "Na esteira para granel, o trabalho que antes levava horas passa para alguns minutos. Em cada operação, o ganho depende do material e da capacidade dimensionada.",
      },
      {
        q: "A esteira pode mudar de lugar no pátio?",
        a: "Pode. A Dalla foi pensada para a operação móvel em pátio, e dá para incluir base com rodízios em outros modelos.",
      },
      {
        q: "Como sei a capacidade que preciso?",
        a: "Parta do volume por hora que a sua operação precisa mover no pico, não na média. A calculadora do site dá um ponto de partida, e a engenharia confirma o modelo.",
      },
      ...faqCompra("a esteira"),
    ],
    quoteTitle: "Peça uma proposta para a carga do seu caminhão",
    quoteText: "Informe o material, a altura da carroceria ou do ponto de queda e a capacidade no pico. Fotos do local ajudam. O orçamento sai em até 1 dia útil.",
    related: [
      { label: "Quanto custa movimentar carga na mão", to: "/blog/quanto-custa-movimentar-carga-na-mao" },
      { label: "Como dimensionar sua esteira transportadora", to: "/blog/como-dimensionar-sua-esteira-transportadora" },
      { label: "Todas as esteiras transportadoras", to: "/esteiras-transportadoras" },
      { label: "Calculadora de dimensionamento", to: "/ferramentas" },
    ],
  },
  {
    slug: "esteira-transportadora-preco",
    kind: "comercial",
    category: "esteiras-transportadoras",
    seoTitle: "Esteira Transportadora: Preço e Orçamento | Demakine",
    seoDesc:
      "Esteira transportadora: preço definido em projeto, conforme comprimento, correia, motorização e frete. Veja o que entra no valor e peça orçamento.",
    eyebrow: "Preço",
    h1: "Esteira transportadora: preço e o que define o valor",
    lead: "Não existe preço de prateleira para esteira transportadora. O valor sai do projeto: comprimento, correia, motorização e frete. Aqui está o que entra na conta, e o que você informa para receber a proposta.",
    waMessage: WA["esteira-transportadora-preco"],
    productsEyebrow: "Modelos",
    productsTitle: "Escolha o modelo e peça a proposta",
    productSlugs: [
      "esteira-transportadora-horizontal",
      "esteira-transportadora-para-sacaria",
      "esteira-transportadora-para-granel",
      "esteira-transportadora-articulada",
      "esteira-transportadora-de-caixas",
      "esteira-transportadora-para-reciclagem-triagem",
    ],
    guideEyebrow: "O que entra no valor",
    guideTitle: "Os itens que formam o preço da esteira",
    guide: [
      {
        title: "Comprimento e altura",
        text: "Distância entre a alimentação e a descarga, e a altura do ponto de queda. É a medida que mais pesa no tamanho da máquina.",
      },
      {
        title: "Correia",
        text: "Lisa para sacaria e caixas, taliscada para subida com material solto, em V para granel, atóxica para alimento. A largura da correia entra junto.",
      },
      {
        title: "Motorização",
        text: "Potência do motor, tensão da rede da sua planta e velocidade, fixa ou ajustável.",
      },
      {
        title: "Estrutura e acessórios",
        text: "Estrutura padrão, galvanizada ou em inox, com rodízios, laterais de chapa, proteções e outros itens que a sua operação pede.",
      },
      {
        title: "Frete",
        text: "O frete é cotado junto com a proposta, conforme o destino e as dimensões do equipamento. Você pode usar a nossa cotação ou a sua própria transportadora.",
      },
    ],
    faqTitle: "Dúvidas sobre preço e compra",
    faq: [
      {
        q: "Quanto custa uma esteira transportadora?",
        a: "Depende do projeto: comprimento, correia, motorização, estrutura e frete. Por isso o valor sai na proposta, depois que você descreve a operação. O orçamento chega em até 1 dia útil.",
      },
      {
        q: "O que preciso informar para receber o preço?",
        a: "Material transportado, comprimento, altura de descarga, capacidade desejada e a tensão elétrica do local. Fotos do local ajudam a engenharia a dimensionar.",
      },
      {
        q: "Vale a pena comprar uma esteira?",
        a: "Para fazer essa conta, some o custo hora real da equipe que movimenta carga (com encargos), as horas extras de pico, afastamentos, avarias e caminhão esperando. O post Quanto custa movimentar carga na mão mostra o passo a passo, e a calculadora do site faz a conta.",
      },
      ...faqPreco("o equipamento"),
      { q: "Tem assistência técnica e peças de reposição?", a: "Tem. A assistência técnica e as peças de reposição vêm direto do fabricante." },
    ],
    quoteTitle: "Receba o preço da sua esteira",
    quoteText: ORCAMENTO_INFO,
    related: [
      { label: "Quanto custa movimentar carga na mão", to: "/blog/quanto-custa-movimentar-carga-na-mao" },
      { label: "Como dimensionar sua esteira transportadora", to: "/blog/como-dimensionar-sua-esteira-transportadora" },
      { label: "Calculadora de dimensionamento", to: "/ferramentas" },
      { label: "Todas as esteiras transportadoras", to: "/esteiras-transportadoras" },
    ],
  },
  {
    slug: "rosca-transportadora-preco",
    kind: "comercial",
    category: "roscas-transportadoras",
    seoTitle: "Rosca Transportadora: Preço e Orçamento | Demakine",
    seoDesc:
      "Rosca transportadora: preço definido em projeto, conforme diâmetro do helicoide, comprimento, motorização e frete. Veja a capacidade por diâmetro.",
    eyebrow: "Preço",
    h1: "Rosca transportadora: preço e o que define o valor",
    lead: "O preço da rosca transportadora depende do diâmetro do helicoide, do comprimento, da motorização e do frete. Abaixo está a capacidade de cada diâmetro, para você chegar ao pedido de orçamento já com o modelo em mente.",
    waMessage: WA["rosca-transportadora-preco"],
    productsEyebrow: "Modelos",
    productsTitle: "Escolha a rosca e peça a proposta",
    productSlugs: ["rosca-transportadora", "rosca-transportadora-chupim", "calha-transportadora"],
    guideEyebrow: "O que entra no valor",
    guideTitle: "Os itens que formam o preço da rosca",
    guide: [
      {
        title: "Diâmetro do helicoide",
        text: "De 4″ a 16″. Quanto maior o diâmetro, maior a capacidade (veja a tabela abaixo) e maior o equipamento.",
      },
      {
        title: "Comprimento e altura",
        text: "De 5 a 15 metros na linha de catálogo. O comprimento vem da distância entre a alimentação e a descarga, e a altura vem do ponto de descarga.",
      },
      {
        title: "Material transportado",
        text: "Grão, milho, ração, farelo, fertilizante, pó e produtos químicos têm comportamento diferente. Descreva o material, a umidade e a granulometria.",
      },
      {
        title: "Motorização e frete",
        text: "Potência do motor compatível com a rede da sua planta. O frete é cotado junto com a proposta, conforme o destino e as dimensões do equipamento.",
      },
    ],
    table: {
      title: "Capacidade produtiva por diâmetro do helicoide",
      head: ["Diâmetro", "Capacidade"],
      rows: [
        ["Ø 4″", "5 a 10 ton/h"],
        ["Ø 6″", "15 a 20 ton/h"],
        ["Ø 8″", "25 a 30 ton/h"],
        ["Ø 10″", "45 a 50 ton/h"],
        ["Ø 12″", "70 a 75 ton/h"],
        ["Ø 14″", "90 a 100 ton/h"],
        ["Ø 16″", "125 a 135 ton/h"],
      ],
      note: "Valores da ficha da rosca transportadora. A engenharia confirma o diâmetro para o seu material.",
    },
    faqTitle: "Dúvidas sobre preço e compra",
    faq: [
      {
        q: "Quanto custa uma rosca transportadora?",
        a: "Depende do projeto: diâmetro do helicoide, comprimento, motorização e frete. O valor sai na proposta, depois que você descreve a operação. O orçamento chega em até 1 dia útil.",
      },
      {
        q: "O que preciso informar para receber o preço?",
        a: "Material transportado, capacidade desejada, comprimento, altura de descarga e a tensão elétrica do local.",
      },
      {
        q: "Como escolho o diâmetro do helicoide?",
        a: "Pela capacidade que a operação precisa: de 5 a 10 ton/h no Ø4″ até 125 a 135 ton/h no Ø16″. Parta do volume por hora no pico, e a engenharia confirma o diâmetro.",
      },
      ...faqPreco("a rosca"),
      { q: "Tem assistência técnica e peças de reposição?", a: "Tem. A assistência técnica e as peças de reposição vêm direto do fabricante." },
    ],
    quoteTitle: "Receba o preço da sua rosca",
    quoteText: "Informe o material, a capacidade por hora, o comprimento e a altura de descarga. O orçamento sai em até 1 dia útil.",
    related: [
      { label: "Roscas transportadoras", to: "/roscas-transportadoras" },
      { label: "Guia completo sobre roscas transportadoras", to: "/blog/guia-completo-sobre-roscas-transportadoras" },
      { label: "Calculadora de dimensionamento", to: "/ferramentas" },
      { label: "Catálogo completo", to: "/produtos" },
    ],
  },
  {
    slug: "maquina-de-costurar-sacos-preco",
    kind: "comercial",
    category: "empacotamento-e-costura",
    seoTitle: "Máquina de Costurar Sacos: Preço e Orçamento | Demakine",
    seoDesc:
      "Máquina de costurar sacos: preço conforme o modelo (GK-26, Siruba AA-6), o Mini Sistema de Costura e a linha. Veja o que entra no valor e peça orçamento.",
    eyebrow: "Preço",
    h1: "Máquina de costurar sacos: preço e o que define o valor",
    lead: "O preço da máquina de costurar sacos muda conforme o modelo, o volume de costura e os itens de apoio, como linha e esteira. Veja o que entra na conta e peça a proposta.",
    waMessage: WA["maquina-de-costurar-sacos-preco"],
    productsEyebrow: "Modelos",
    productsTitle: "Escolha o equipamento e peça a proposta",
    productSlugs: [
      "maquina-de-costurar-sacos-gk-26",
      "maquina-de-costurar-sacos-siruba-aa-6",
      "mini-sistema-de-costura",
      "linha-fio-para-costura-de-sacaria",
    ],
    guideEyebrow: "O que entra no valor",
    guideTitle: "Os itens que formam o preço da costura de sacos",
    guide: [
      {
        title: "Modelo da máquina",
        text: "A GK-26 costura até 10 metros por minuto e atende alto volume. A Siruba AA-6 é leve e fácil de manusear. As duas são portáteis.",
      },
      {
        title: "Volume de costura",
        text: "Para pequenas e médias produções, o Mini Sistema de Costura leva a máquina portátil numa esteira compacta e fecha até 2.000 sacos por dia.",
      },
      {
        title: "Linha e reposição",
        text: "A linha 100% poliéster vem em cones de 250 g e de 1 kg. As peças de reposição de costura de sacaria também saem direto do fabricante.",
      },
      {
        title: "Frete",
        text: "O frete é cotado junto com a proposta, conforme o destino e as dimensões do equipamento. Você pode usar a nossa cotação ou a sua própria transportadora.",
      },
    ],
    faqTitle: "Dúvidas sobre preço e compra",
    faq: [
      {
        q: "Quanto custa uma máquina de costurar sacos?",
        a: "Depende do modelo e dos itens de apoio. O valor sai na proposta, e o orçamento chega em até 1 dia útil.",
      },
      {
        q: "O que preciso informar para receber o preço?",
        a: "O tipo de saco, o volume por dia, se a operação é fixa ou móvel, e se você quer só a máquina ou também a linha e o Mini Sistema de Costura.",
      },
      {
        q: "Qual máquina escolher: GK-26 ou Siruba AA-6?",
        a: "A GK-26 costura até 10 metros por minuto e atende alto volume. A Siruba AA-6 é leve e fácil de manusear. Descreva a sua operação e o vendedor indica a melhor para ela.",
      },
      ...faqPreco("o equipamento"),
    ],
    quoteTitle: "Receba o preço da sua máquina",
    quoteText: "Informe o tipo de saco, o volume por dia e o modelo de interesse. O orçamento sai em até 1 dia útil.",
    related: [
      { label: "Máquinas de costurar sacos", to: "/maquinas-de-costurar-sacos" },
      { label: "Mini Sistema de Costura", to: "/produtos/mini-sistema-de-costura" },
      { label: "Peneira para carvão", to: "/produtos/peneira-para-carvao" },
      { label: "Catálogo completo", to: "/produtos" },
    ],
  },
];

const cleanPath = (path: string) => path.split("?")[0]!.replace(/\/+$/, "");

/** `/esteiras-transportadoras` → entrada da página; qualquer outro caminho → undefined. */
export function landingFor(path: string): LandingPage | undefined {
  const clean = cleanPath(path);
  return landingPages.find((l) => `/${l.slug}` === clean);
}
