import type { FaqItem } from "@/lib/faq";
import { getProduct } from "@/lib/content";

/**
 * Conteúdo editorial por linha de equipamento: matriz de materiais, erros comuns,
 * ficha de instalação, peças de desgaste, plano de manutenção e FAQ contextual.
 * Tudo qualitativo e ligado ao que a Demakine fabrica de fato: nada de número de
 * prazo, preço ou garantia, que variam por projeto e ficam na proposta.
 */

export type Fit = "sim" | "consulta" | "nao";

export const materials = [
  "Grão e granel",
  "Sacaria",
  "Caixa e pacote",
  "Resíduo e reciclagem",
  "Areia e brita",
  "Carvão",
  "Fruta e legume",
] as const;

export type MaterialKey = (typeof materials)[number];

/** Matriz produto x material. Ausência de entrada = "consulta". */
const fitBySlug: Record<string, Partial<Record<MaterialKey, Fit>>> = {
  "esteira-transportadora-para-sacaria": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "nao",
    Carvão: "consulta",
    "Fruta e legume": "consulta",
  },
  "esteira-transportadora-para-granel": {
    "Grão e granel": "sim",
    Sacaria: "consulta",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "sim",
    "Areia e brita": "sim",
    Carvão: "sim",
    "Fruta e legume": "consulta",
  },
  "esteira-transportadora-horizontal": {
    "Grão e granel": "consulta",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "sim",
    "Areia e brita": "consulta",
    Carvão: "consulta",
    "Fruta e legume": "sim",
  },
  "esteira-transportadora-de-caixas": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "nao",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "consulta",
  },
  "esteira-transportadora-articulada": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "sim",
  },
  "esteira-transportadora-dalla": {
    "Grão e granel": "consulta",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "consulta",
    Carvão: "consulta",
    "Fruta e legume": "consulta",
  },
  "esteira-transportadora-para-reciclagem-triagem": {
    "Grão e granel": "consulta",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "sim",
    "Areia e brita": "nao",
    Carvão: "consulta",
    "Fruta e legume": "consulta",
  },
  "esteira-para-transporte-de-frutas-e-legumes": {
    "Grão e granel": "consulta",
    Sacaria: "consulta",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "nao",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "sim",
  },
  "esteira-transportadora-para-cesta-basica": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "nao",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "sim",
  },
  "esteira-transportadora-em-v-para-cama-de-frango-aviario": {
    "Grão e granel": "sim",
    Sacaria: "nao",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "sim",
    "Areia e brita": "consulta",
    Carvão: "consulta",
    "Fruta e legume": "nao",
  },
  "rosca-transportadora": {
    "Grão e granel": "sim",
    Sacaria: "nao",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "sim",
    Carvão: "sim",
    "Fruta e legume": "nao",
  },
  "rosca-transportadora-chupim": {
    "Grão e granel": "sim",
    Sacaria: "nao",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "consulta",
    Carvão: "consulta",
    "Fruta e legume": "nao",
  },
  "calha-transportadora": {
    "Grão e granel": "sim",
    Sacaria: "nao",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "sim",
    Carvão: "sim",
    "Fruta e legume": "nao",
  },
  "elevador-de-canecas": {
    "Grão e granel": "sim",
    Sacaria: "nao",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "sim",
    Carvão: "sim",
    "Fruta e legume": "nao",
  },
  "elevador-de-sacaria": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "consulta",
  },
  "peneira-para-carvao": {
    "Grão e granel": "consulta",
    Sacaria: "nao",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "consulta",
    Carvão: "sim",
    "Fruta e legume": "nao",
  },
  "cartrans-carrinho-transportador": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "sim",
    "Resíduo e reciclagem": "consulta",
    "Areia e brita": "nao",
    Carvão: "consulta",
    "Fruta e legume": "consulta",
  },
  "maquina-de-costurar-sacos-gk-26": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "nao",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "nao",
  },
  "maquina-de-costurar-sacos-siruba-aa-6": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "nao",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "nao",
  },
  "linha-fio-para-costura-de-sacaria": {
    "Grão e granel": "nao",
    Sacaria: "sim",
    "Caixa e pacote": "nao",
    "Resíduo e reciclagem": "nao",
    "Areia e brita": "nao",
    Carvão: "nao",
    "Fruta e legume": "nao",
  },
};

export function materialFit(slug: string): Record<MaterialKey, Fit> {
  const base = fitBySlug[slug] ?? {};
  return materials.reduce(
    (acc, m) => {
      acc[m] = base[m] ?? "consulta";
      return acc;
    },
    {} as Record<MaterialKey, Fit>,
  );
}

/** Produtos que já têm a matriz preenchida, para a tabela geral do site. */
export function matrixProducts() {
  return Object.keys(fitBySlug)
    .map((slug) => getProduct(slug))
    .filter((p): p is NonNullable<ReturnType<typeof getProduct>> => Boolean(p));
}

/* ------------------------------------------------------------------ conteúdo */

type Block = { title: string; text: string };

const belt: {
  mistakes: Block[];
  install: Block[];
  parts: Block[];
  faq: FaqItem[];
} = {
  mistakes: [
    {
      title: "Largura de correia subdimensionada",
      text: "Escolher a correia pelo preço e não pela carga faz o produto transbordar na lateral e a linha virar limpeza constante. Dimensione pela peça maior que vai passar e pelo pico de volume, não pela média do dia.",
    },
    {
      title: "Motor trabalhando no limite",
      text: "Motor apertado esquenta, desarma no meio do turno e leva o redutor junto. Vale sobrar folga de motorização, principalmente em subida, com carga cheia e partidas frequentes.",
    },
    {
      title: "Correia errada para o material",
      text: "Correia lisa em subida forte com material solto devolve carga para o pé da esteira. Material solto em inclinação pede talisca; granel fino rende mais em perfil em V; linha de alimento pede correia atóxica.",
    },
  ],
  install: [
    {
      title: "Espaço e altura livre",
      text: "Confira o comprimento total com a estrutura e a área para operar em volta, além da altura livre até telhado, viga ou tubulação no ponto de descarga.",
    },
    {
      title: "Piso firme e nivelado",
      text: "Base plana e firme nos pés de apoio. Piso irregular desalinha a correia e faz a estrutura trabalhar torcida.",
    },
    {
      title: "Ponto elétrico na tensão correta",
      text: "Deixe o ponto pronto na tensão informada no pedido, com disjuntor e aterramento. Informe se a rede é trifásica antes da fabricação do motor.",
    },
    {
      title: "Acesso para descarga",
      text: "Verifique portão, corredor e pé-direito no caminho do caminhão até o ponto de montagem. Equipamento longo pode chegar em partes.",
    },
    {
      title: "Ponto de entrada e de saída definidos",
      text: "Marque onde o produto entra e onde cai. Moega, mesa de alimentação ou bica de descarga precisam estar previstas antes de fixar o equipamento.",
    },
  ],
  parts: [
    { title: "Correia", text: "Item de desgaste principal. Lisa, taliscada, em V, PVC ou atóxica." },
    { title: "Roletes e tambores", text: "Rolete de carga, de retorno e tambor de acionamento e retorno." },
    { title: "Raspador", text: "Limpa a correia e evita acúmulo que suja o ambiente e desalinha." },
    { title: "Rolamentos e mancais", text: "Troca preventiva no plano mensal, principalmente em ambiente com pó." },
    { title: "Motor e redutor", text: "Reposição e reforma de motorização, inclusive troca por versão com variação de velocidade." },
    { title: "Emenda de correia", text: "Grampo, vulcanização e kit de emenda para reparo rápido em campo." },
  ],
  faq: [
    {
      q: "Essa esteira pode ser feita com outro comprimento?",
      a: "Sim. Comprimento, largura de correia, inclinação e altura de descarga são ajustados no projeto para caber no seu layout.",
    },
    {
      q: "Dá para trabalhar em ambiente úmido ou com lavagem?",
      a: "Fabricamos versões em inox e galvanizado, com correia adequada à higienização. Informe o tipo de limpeza usada na sua planta.",
    },
    {
      q: "Quanto tempo dura a correia?",
      a: "Depende do material, da carga por hora e da limpeza. Correia bem tensionada, alinhada e com raspador funcionando dura muito mais. Mantemos correia e emenda como peça de reposição.",
    },
  ],
};

const screw: typeof belt = {
  mistakes: [
    {
      title: "Diâmetro e passo escolhidos sem o material real",
      text: "Produto úmido, empedrado ou fibroso se comporta diferente de grão seco. Informe umidade e granulometria para o passo do helicoide sair certo.",
    },
    {
      title: "Motorização no limite em partida cheia",
      text: "Rosca que dá partida com o tubo carregado exige torque maior. Sem folga de motorização, a partida vira desarme.",
    },
    {
      title: "Inclinação alta sem revisar a capacidade",
      text: "Quanto mais inclinada a rosca, menor a vazão real. Se a inclinação subir depois do projeto, a capacidade precisa ser recalculada.",
    },
  ],
  install: [
    { title: "Espaço para o tubo e para a boca de carga", text: "Confira o vão do tubo inteiro, a posição da boca de carga e da boca de descarga." },
    { title: "Base firme nos apoios", text: "Apoios nivelados evitam esforço no eixo e desgaste desigual no helicoide." },
    { title: "Ponto elétrico na tensão correta", text: "Disjuntor, aterramento e tensão conferidos antes da entrega do motor." },
    { title: "Altura livre e acesso", text: "Verifique altura para o ponto de descarga e o caminho até o local de montagem." },
    { title: "Alimentação constante", text: "Defina como o produto chega à boca de carga. Alimentação irregular derruba a vazão." },
  ],
  parts: [
    { title: "Helicoide", text: "Reposição e recuperação do helicoide desgastado." },
    { title: "Mancais e rolamentos", text: "Itens de rotina no plano de manutenção." },
    { title: "Buchas e eixos intermediários", text: "Desgaste normal em roscas longas." },
    { title: "Motor e redutor", text: "Reposição ou troca por outra relação de motorização." },
    { title: "Vedação e flanges", text: "Evitam vazamento de pó e entrada de contaminação." },
  ],
  faq: [
    {
      q: "Rosca ou esteira: qual é melhor para o meu caso?",
      a: "Rosca é fechada, ocupa pouco espaço e é ótima para pó e granel fino. Esteira é melhor para produto embalado, volumes grandes e distâncias longas. Descreva o material e a distância que a gente indica.",
    },
    {
      q: "A rosca pode ser fabricada em inox?",
      a: "Sim, para produtos que exigem higienização ou em ambiente corrosivo.",
    },
    {
      q: "Dá para transportar produto úmido?",
      a: "Depende do grau de umidade e da tendência a empastar. Informe o material real e, se possível, mande foto. Em alguns casos indicamos passo e acabamento diferentes.",
    },
  ],
};

const elevator: typeof belt = {
  mistakes: [
    {
      title: "Altura definida sem contar a descarga",
      text: "A altura útil precisa considerar onde o produto cai, não só o topo do equipamento. Errar isso obriga adaptar bica depois, na correria.",
    },
    {
      title: "Capacidade calculada na média",
      text: "Elevador é gargalo em pico de recebimento. Dimensione pela hora mais cheia da safra.",
    },
    {
      title: "Alimentação irregular no pé",
      text: "Caneca meio cheia derruba a vazão e aumenta retorno de produto. A alimentação no pé precisa ser constante.",
    },
  ],
  install: [
    { title: "Altura livre confirmada", text: "Meça do piso até a estrutura mais baixa acima do ponto de instalação." },
    { title: "Base e fixação", text: "Piso firme e fixação prevista, além de amarração da estrutura quando a altura pede." },
    { title: "Ponto elétrico na tensão correta", text: "Motor, disjuntor e aterramento conforme a rede da planta." },
    { title: "Acesso para montagem", text: "Elevadores chegam em partes. Confira acesso, espaço de içamento e área de montagem." },
    { title: "Pontos de carga e descarga", text: "Defina a moega no pé e o destino no topo antes de fixar." },
  ],
  parts: [
    { title: "Canecas", text: "Item de desgaste, com reposição por conjunto." },
    { title: "Correia ou corrente do elevador", text: "Reposição e ajuste de tensionamento." },
    { title: "Rolamentos e mancais", text: "Revisão preventiva no pé e no topo." },
    { title: "Motor e redutor", text: "Reposição e reforma de motorização." },
    { title: "Revestimento e vedação", text: "Reduz retorno de produto e vazamento de pó." },
  ],
  faq: [
    {
      q: "Qual altura vocês fabricam?",
      a: "A altura é definida por projeto, conforme o pé-direito e o ponto de descarga da sua planta. Informe a altura útil necessária no orçamento.",
    },
    {
      q: "Serve para fertilizante e produto abrasivo?",
      a: "Sim, com o acabamento adequado. Produto abrasivo ou corrosivo muda a especificação de canecas e revestimento.",
    },
    {
      q: "Dá para integrar com rosca e esteira?",
      a: "Sim. A maior parte dos projetos combina recebimento, elevação e distribuição. Podemos desenhar o conjunto todo.",
    },
  ],
};

const packing: typeof belt = {
  mistakes: [
    {
      title: "Máquina escolhida sem olhar o tipo de saco",
      text: "Ráfia, papel, laminado e saco com valvula pedem agulha, ponto e fio diferentes. Informe o saco real que você usa.",
    },
    {
      title: "Fio e agulha fora da especificação",
      text: "Metade dos problemas de costura solta vem de fio errado ou agulha gasta, não da máquina. Manter fio e agulha certos é o que garante costura firme.",
    },
    {
      title: "Posto de trabalho sem apoio",
      text: "Costurar com o saco na mão cansa o operador e sai torto. Esteira, mesa ou carrinho na altura certa muda o resultado do turno.",
    },
  ],
  install: [
    { title: "Bancada ou apoio na altura do operador", text: "Defina a altura de trabalho para reduzir esforço e melhorar o acabamento." },
    { title: "Ponto elétrico próximo", text: "Tomada na tensão correta, sem extensão improvisada." },
    { title: "Espaço para o fluxo do saco", text: "Entrada e saída livres, para o operador não girar a carga na mão." },
    { title: "Estoque de fio e agulha", text: "Tenha consumível na fábrica antes de iniciar a produção." },
    { title: "Iluminação no ponto de costura", text: "Boa luz sobre a boca do saco evita costura fora do lugar." },
  ],
  parts: [
    { title: "Agulhas", text: "Reposição por tipo de saco e de ponto." },
    { title: "Fio e linha para costura", text: "Consumível de linha, disponível em várias gramaturas." },
    { title: "Laçadeira e peças de costura", text: "Itens de desgaste do conjunto de costura." },
    { title: "Correia de acionamento", text: "Reposição da transmissão da máquina." },
    { title: "Kit de manutenção", text: "Peças de reposição do dia a dia da operação." },
  ],
  faq: [
    {
      q: "Serve para qualquer tipo de saco?",
      a: "Atende os sacos mais usados em ração, grão, fertilizante e alimento. Informe o material e a gramatura do saco para confirmarmos agulha, fio e ponto.",
    },
    {
      q: "Vocês fornecem fio e agulha?",
      a: "Sim. Trabalhamos com linha e fio para costura de sacaria e peças de reposição da máquina.",
    },
    {
      q: "Dá para integrar com esteira de saída?",
      a: "Sim. É a combinação mais comum: esteira levando o saco até o posto de costura e daí para o palete ou caminhão.",
    },
  ],
};

const byCategory: Record<string, typeof belt> = {
  "esteiras-transportadoras": belt,
  "roscas-transportadoras": screw,
  elevadores: elevator,
  "empacotamento-e-costura": packing,
};

export function productExtras(category: string) {
  return byCategory[category] ?? belt;
}

/** Plano de manutenção: igual para todas as linhas, com foco no que trava linha. */
export const maintenancePlan = [
  {
    period: "Todo dia, 5 minutos",
    items: [
      "Olhar a correia ou o helicoide procurando corte, rasgo e desgaste fora do normal",
      "Conferir se o raspador está encostado e se há acúmulo de material embaixo do equipamento",
      "Ouvir ruído diferente em rolamento, motor e redutor com a máquina vazia",
      "Verificar se há produto vazando fora do ponto de descarga",
      "Checar se as proteções estão no lugar antes de liberar a operação",
    ],
  },
  {
    period: "Toda semana",
    items: [
      "Conferir tensionamento e alinhamento da correia, sem apertar mais do que o necessário",
      "Limpar tambor, rolete e área do raspador",
      "Verificar aperto de parafusos de estrutura, mancais e base do motor",
      "Conferir se a estrutura continua nivelada e apoiada",
      "Testar botoeira, parada de emergência e comando",
    ],
  },
  {
    period: "Todo mês",
    items: [
      "Lubrificar rolamentos e mancais conforme a orientação do manual",
      "Revisar redutor: nível de óleo, vazamento e temperatura de trabalho",
      "Inspecionar emenda de correia e programar troca antes que rompa",
      "Revisar motor: corrente, aquecimento, ventilação e fixação",
      "Registrar o que foi trocado e programar as peças de desgaste para a próxima safra",
    ],
  },
];
