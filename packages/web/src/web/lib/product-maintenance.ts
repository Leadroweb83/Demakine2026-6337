/**
 * Manutenção por equipamento, tirada do manual técnico da Demakine de cada um.
 * Produtos fora desta lista continuam com o roteiro geral de product-content.ts.
 */
export type MaintenanceGroup = { period: string; items: string[] };

export type ProductMaintenance = {
  intro: string;
  plan: MaintenanceGroup[];
  always: string[];
  source: string;
  checklistPdf: string;
};

const GRAXA_MENSAL = "Lubrificar os rolamentos pelas graxeiras dos mancais, com graxa comum";
const MOTOR = "Manter o motor limpo, com a ventilação livre para o ar do ventilador circular";
const LIGACOES = "Conferir as ligações elétricas e os parafusos de sustentação do motor";
const ROLAMENTOS = "Observar os rolamentos: ruído forte, vibração, aquecimento ou desgaste fora do normal";
const REDUTOR =
  "Redutor: vem de fábrica com óleo sintético, que pede pouca manutenção; manter limpo e inspecionado";

export const productMaintenance: Record<string, ProductMaintenance> = {
  "peneira-para-carvao": {
    intro:
      "Roteiro do manual técnico da peneira. O que mais pesa na vida útil dela é a lubrificação dos mancais, que trabalham sob vibração o tempo todo.",
    plan: [
      { period: "Todo mês", items: [GRAXA_MENSAL] },
      {
        period: "Periodicamente",
        items: [
          ROLAMENTOS,
          MOTOR,
          LIGACOES,
          "Limpar a estrutura com escova de cerdas macias ou pano macio, sem álcool nem solvente",
          "Manter o painel elétrico limpo e inspecionado",
        ],
      },
    ],
    always: [
      "Fazer manutenção, limpeza e ajuste só com a peneira parada e desligada",
      "Manter a peneira chumbada ao piso conforme o guia de fixação do modelo",
    ],
    source: "Manual técnico da Peneira Empacotadora para Carvão",
    checklistPdf: "/downloads/checklist-manutencao-peneira-empacotadora-para-carvao.pdf",
  },
  "rosca-transportadora-chupim": {
    intro:
      "Roteiro do manual técnico da rosca chupim. Atenção especial aos cabos de aço e às roldanas: sem inspeção, o cabo pode romper.",
    plan: [
      { period: "Todo mês", items: [GRAXA_MENSAL] },
      {
        period: "Periodicamente",
        items: [
          "Conferir se os cabos de aço estão bem fixados e sem desgaste",
          "Verificar se as roldanas giram livres e engraxá-las",
          "Examinar a rosca procurando dano ou desgaste fora do comum",
          "Reapertar parafusos, porcas, fixadores e ferragens",
          ROLAMENTOS,
          MOTOR,
          LIGACOES,
          REDUTOR,
        ],
      },
    ],
    always: [
      "Desligar e bloquear a alimentação elétrica antes de qualquer manutenção",
      "Nunca reverter a chave com o motor girando: posição 0, esperar parar e só então reverter",
      "Manter todas as proteções no lugar e em bom estado",
    ],
    source: "Manual técnico da Rosca Transportadora Chupim",
    checklistPdf: "/downloads/checklist-manutencao-rosca-transportadora-chupim.pdf",
  },
  "esteira-transportadora-dalla": {
    intro:
      "Roteiro do manual técnico da esteira Dalla. O ponto que mais dá problema quando esquecido é o alinhamento da correia.",
    plan: [
      {
        period: "Todo mês",
        items: [
          GRAXA_MENSAL,
          "Conferir o alinhamento da correia: as laterais dela devem acompanhar as laterais do rolo de tração e do rolo traseiro",
        ],
      },
      {
        period: "Periodicamente",
        items: [
          "Limpar e lubrificar com graxa comum os rodízios giratórios dos pés, quando houver",
          ROLAMENTOS,
          MOTOR,
          LIGACOES,
          REDUTOR,
        ],
      },
      {
        period: "Se a correia desalinhar",
        items: [
          "Tirar as proteções laterais e soltar as porcas dos rolos",
          "Dar meia volta, no sentido horário, no parafuso esticador do lado em que a correia encosta",
          "Esperar a correia dar uma volta completa e observar; repetir até alinhar",
          "Fazer o ajuste no rolo de tração e no movido, reapertar e recolocar as proteções",
        ],
      },
    ],
    always: [
      "Ligar a esteira vazia e não deixá-la rodando sem material por longos períodos, porque isso aumenta o desgaste",
      "No fim do turno, deixar ligada até descarregar todo o material",
    ],
    source: "Manual técnico da Esteira Transportadora Dalla",
    checklistPdf: "/downloads/checklist-manutencao-esteira-transportadora-dalla.pdf",
  },
  "elevador-de-canecas": {
    intro:
      "Roteiro do manual técnico do elevador de canecas. Lubrificação em dia e correia bem tensionada evitam a maior parte das paradas.",
    plan: [
      {
        period: "Toda semana",
        items: [
          "Nos modelos com mancal, lubrificar a graxeira de bico reto da tampa do mancal, com graxa própria para rolamentos",
        ],
      },
      {
        period: "Todo mês",
        items: [
          "Lubrificar os rolamentos, que não são blindados",
          "Reapertar todos os parafusos e porcas do equipamento",
          "Fazer uma limpeza criteriosa em todo o equipamento",
        ],
      },
      {
        period: "Periodicamente",
        items: [
          "Manter a correia bem tensionada",
          "Manter o motor limpo e com a ventilação desobstruída",
          "Limpar os detritos que grudam na máquina, com mais frequência quando o material tem muita impureza",
          "Nos modelos com mancal intermediário, limpar esse ponto com regularidade",
          "Não deixar partes da máquina em contato com o material por muito tempo, para evitar corrosão",
        ],
      },
    ],
    always: [
      "Nunca abrir a janela de manutenção com o elevador ligado",
      "Nunca retirar as tampas de proteção",
      "No fim do turno, deixar ligado até sair todo o material pela bica de saída",
    ],
    source: "Manual técnico do Elevador de Canecas",
    checklistPdf: "/downloads/checklist-manutencao-elevador-de-canecas.pdf",
  },
  "elevador-de-sacaria": {
    intro:
      "Roteiro do manual técnico do elevador de sacaria. É um equipamento de manutenção simples, que depende de reaperto e correia bem tensionada.",
    plan: [
      { period: "A cada 210 horas de uso", items: ["Lubrificar o equipamento"] },
      {
        period: "Todo mês",
        items: [
          "Reapertar todos os parafusos e porcas do equipamento",
          "Fazer uma limpeza criteriosa em todo o equipamento",
        ],
      },
      {
        period: "Periodicamente",
        items: [
          "Manter a correia bem tensionada",
          "Manter o motor limpo e com a ventilação desobstruída",
          "Limpar os detritos que grudam na máquina, com mais frequência com cimento, fertilizante ou carvão",
          "Não deixar partes da máquina em contato com o material por muito tempo, para evitar corrosão",
        ],
      },
    ],
    always: [
      "Nunca retirar as tampas de proteção",
      "Nunca colocar as mãos ou objetos na máquina com ela ligada",
      "No fim do turno, deixar o elevador desligado",
    ],
    source: "Manual técnico do Elevador de Sacaria",
    checklistPdf: "/downloads/checklist-manutencao-elevador-de-sacaria.pdf",
  },
};

export function maintenanceFor(slug: string) {
  return productMaintenance[slug];
}
