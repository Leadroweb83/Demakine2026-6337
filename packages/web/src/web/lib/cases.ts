/**
 * /cases — estrutura de case da Demakine.
 *
 * REGRA CENTRAL (não quebrar)
 * Nenhum número aqui é resultado de cliente. O site não afirma que uma empresa
 * específica economizou X ou ganhou Y, porque não existe medição nem autorização
 * registrada para isso. O que a página publica é:
 *   1. a APLICAÇÃO TÍPICA: a configuração de equipamento que a fábrica entrega
 *      para aquele tipo de operação, descrita como configuração e não como case;
 *   2. um CENÁRIO SIMULADO, rotulado como simulação, com todas as premissas à
 *      vista, calculado pela mesma lógica da calculadora de /ferramentas.
 *
 * Os campos de `pending` são o que falta para virar case de verdade: nome do
 * cliente, autorização de uso, número medido e foto da instalação. Eles aparecem
 * SÓ no /admin, como checklist para o cliente preencher. Nunca no site público.
 */

import type { RoiInput } from "./engine";
import { deletedKeys, editedDocs } from "./runtime-content";
import { toWebp } from "./images";

export type CasePending = {
  /** o que falta ser preenchido pelo cliente */
  field: string;
  /** por que isso é necessário antes de publicar */
  why: string;
};

export type CaseStudy = {
  slug: string;
  /** título da aplicação, sem nome de cliente */
  title: string;
  /** setor */
  segment: string;
  /** região genérica, sem identificar a empresa */
  region: string;
  eyebrow: string;
  intro: string;
  /** foto real do acervo */
  image: string;
  /** o cenário operacional que motiva esse conjunto de equipamento */
  challenge: string[];
  /** a configuração que a fábrica entrega para esse cenário */
  solution: { step: string; text: string }[];
  /** produtos reais envolvidos */
  products: string[];
  /** premissas do cenário simulado */
  simulation: RoiInput & { note: string };
  /** legado: o checklist agora é calculado por casePending() */
  pending?: CasePending[];
  /** dados reais do cliente; só aparecem no site com autorização registrada (ver hasRealData) */
  real?: CaseReal;
  /** rascunho salvo no painel: não aparece no site */
  draft?: boolean;
};

export type CaseReal = {
  client: string;
  /** marcado no painel por quem tem a autorização por escrito do cliente */
  authorized: boolean;
  authorizedAt?: string;
  authorizedBy?: string;
  results: { label: string; before: string; after: string }[];
  testimonial?: { name: string; role: string; text: string };
  /** fotos da instalação no cliente */
  photos: string[];
};

/** Dado real só vai para o site com cliente identificado, autorização marcada e algo medido ou dito por ele. */
export function hasRealData(c: CaseStudy) {
  const r = c.real;
  return Boolean(r?.authorized && r.client.trim() && (r.results.length || r.testimonial?.text.trim()));
}

/** O que ainda falta para o case virar case de verdade (checklist do painel). */
export function casePending(c: CaseStudy) {
  const r = c.real;
  const done = [
    Boolean(r?.client.trim()),
    Boolean(r?.authorized),
    Boolean(r?.results.length),
    Boolean(r?.photos.length),
    Boolean(r?.testimonial?.name.trim() && r.testimonial.text.trim()),
  ];
  return casePendingDefaults.map((p, i) => ({ ...p, done: done[i]! }));
}

export const casePendingDefaults: CasePending[] = [
  {
    field: "Nome e CNPJ do cliente",
    why: "Sem identificar a empresa o texto não pode ser chamado de case, só de aplicação típica.",
  },
  {
    field: "Autorização de uso de nome e imagem (por escrito)",
    why: "Publicar nome ou foto de cliente sem autorização registrada expõe a Demakine.",
  },
  {
    field: "Números medidos antes e depois",
    why: "Volume por hora, pessoas na operação e horas de máquina. Sem medição, o número não pode ser publicado como resultado.",
  },
  {
    field: "Fotos da instalação no cliente",
    why: "Foto de fábrica não comprova a instalação. Precisa da foto no local.",
  },
  {
    field: "Depoimento do responsável (nome e cargo)",
    why: "Depoimento anônimo não sustenta um case e não pode ser inventado.",
  },
];

/** Cases como vêm no código, sem as edições do painel. */
export const DEFAULT_CASES: CaseStudy[] = [
  {
    slug: "recebimento-e-ensaque-de-graos",
    title: "Recebimento e ensaque de grãos em cooperativa",
    segment: "Agro e grãos",
    region: "Interior de São Paulo",
    eyebrow: "Aplicação típica",
    intro:
      "Configuração usada quando a cooperativa recebe carreta na moega, precisa elevar o grão para o silo e fechar sacaria no fim da linha, tudo no mesmo galpão e sem parar na safra.",
    image: "/img/produtos/elevador-de-canecas/1.webp",
    challenge: [
      "Descarga concentrada em poucas semanas de safra, com fila de caminhão no pátio.",
      "Elevação do grão até a boca do silo feita com equipamento improvisado ou no braço.",
      "Ensaque no fim da linha travando por costura manual e sacaria rompendo no transporte.",
    ],
    solution: [
      {
        step: "Moega e recebimento",
        text: "Esteira de granel na moega, com largura e inclinação definidas pelo volume de descarga.",
      },
      {
        step: "Elevação",
        text: "Elevador de canecas dimensionado para a altura do silo, com canecas escolhidas pelo grão.",
      },
      {
        step: "Transferência",
        text: "Rosca transportadora fechada entre setores, para reduzir perda e poeira no galpão.",
      },
      {
        step: "Ensaque e costura",
        text: "Esteira de sacaria e máquina de costurar sacos no fim da linha, com linha adequada à sacaria.",
      },
    ],
    products: [
      "esteira-transportadora-para-granel",
      "elevador-de-canecas",
      "rosca-transportadora",
      "esteira-transportadora-para-sacaria",
      "maquina-de-costurar-sacos-gk-26",
    ],
    simulation: {
      volumePerDay: 1800,
      people: 5,
      peopleAfter: 2,
      costPerPerson: 3800,
      daysPerMonth: 22,
      note: "Premissas de exemplo para uma operação de 1.800 volumes por dia. Troque pelos seus números na calculadora.",
    },
    pending: casePendingDefaults,
  },
  {
    slug: "triagem-de-residuos-reciclaveis",
    title: "Linha de triagem em central de resíduos recicláveis",
    segment: "Reciclagem e resíduos",
    region: "Região metropolitana",
    eyebrow: "Aplicação típica",
    intro:
      "Configuração para central de triagem onde a esteira é o posto de trabalho da equipe: a altura, a largura e a velocidade da correia definem quanto sai separado por hora.",
    image: "/img/produtos/esteira-transportadora-para-reciclagem-triagem/1.webp",
    challenge: [
      "Material heterogêneo chegando em volume irregular ao longo do turno.",
      "Equipe separando no chão ou em bancada, com esforço e postura ruins.",
      "Velocidade de correia sem ajuste, gerando material passando sem triagem ou fila na linha.",
    ],
    solution: [
      {
        step: "Alimentação",
        text: "Esteira de alimentação recebendo o material da descarga e regulando a entrada na linha.",
      },
      {
        step: "Triagem",
        text: "Esteira de triagem com altura de trabalho e largura definidas pelo número de operadores por lado.",
      },
      {
        step: "Velocidade",
        text: "Acionamento com ajuste de velocidade, para acompanhar o ritmo real da equipe.",
      },
      {
        step: "Saída do rejeito",
        text: "Esteira de saída levando o rejeito direto para a prensa ou para a caçamba.",
      },
    ],
    products: [
      "esteira-transportadora-para-reciclagem-triagem",
      "esteira-transportadora-para-granel",
      "calha-transportadora",
    ],
    simulation: {
      volumePerDay: 1200,
      people: 6,
      peopleAfter: 4,
      costPerPerson: 3200,
      daysPerMonth: 24,
      note: "Premissas de exemplo para uma linha de triagem com 6 pessoas. Troque pelos seus números na calculadora.",
    },
    pending: casePendingDefaults,
  },
  {
    slug: "ensaque-em-fabrica-de-racao",
    title: "Ensaque e paletização em fábrica de ração",
    segment: "Alimentos e ração",
    region: "Interior de São Paulo",
    eyebrow: "Aplicação típica",
    intro:
      "Configuração de fim de linha para fábrica de ração: sacaria saindo da ensacadeira, costura, transporte até a expedição e carregamento do caminhão.",
    image: "/img/produtos/esteira-transportadora-para-sacaria/1.webp",
    challenge: [
      "Saco saindo da ensacadeira e sendo carregado no braço até o palete.",
      "Costura manual travando a linha e gerando saco rompido no transporte.",
      "Carregamento de caminhão consumindo equipe inteira no fim do turno.",
    ],
    solution: [
      {
        step: "Saída da ensacadeira",
        text: "Esteira de sacaria recebendo o saco cheio e conduzindo em ritmo constante.",
      },
      {
        step: "Costura",
        text: "Máquina de costurar sacos posicionada na linha, com linha e ponto adequados à sacaria.",
      },
      {
        step: "Transporte interno",
        text: "Esteira de sacaria levando o saco costurado até a área de paletização.",
      },
      {
        step: "Carregamento",
        text: "Esteira móvel de sacaria para carregar o caminhão na expedição.",
      },
    ],
    products: [
      "esteira-transportadora-para-sacaria",
      "maquina-de-costurar-sacos-siruba-aa-6",
      "linha-fio-para-costura-de-sacaria",
      "elevador-de-sacaria",
    ],
    simulation: {
      volumePerDay: 2400,
      people: 6,
      peopleAfter: 3,
      costPerPerson: 3600,
      daysPerMonth: 22,
      note: "Premissas de exemplo para 2.400 sacos por dia. Troque pelos seus números na calculadora.",
    },
    pending: casePendingDefaults,
  },
  {
    slug: "carga-e-descarga-em-centro-de-distribuicao",
    title: "Carga e descarga de caminhão em centro de distribuição",
    segment: "Logística e distribuição",
    region: "Grande São Paulo",
    eyebrow: "Aplicação típica",
    intro:
      "Configuração para doca onde a carreta é descarregada volume por volume: esteira móvel entrando no baú e transporte contínuo até a separação.",
    image: "/img/produtos/esteira-transportadora-para-cesta-basica/1.webp",
    challenge: [
      "Descarga de carreta feita em corrente humana, com volume passando de mão em mão.",
      "Tempo de doca alto e caminhão parado esperando liberação.",
      "Afastamento por esforço repetitivo em equipe que faz o mesmo movimento o turno inteiro.",
    ],
    solution: [
      {
        step: "Doca",
        text: "Esteira móvel entrando no baú, acompanhando o avanço da descarga.",
      },
      {
        step: "Transporte",
        text: "Esteira de volumes conduzindo a carga da doca até a área de conferência.",
      },
      {
        step: "Ganho de altura",
        text: "Trecho inclinado ou elevador de sacaria quando a separação fica em outro nível.",
      },
      {
        step: "Expedição",
        text: "Esteira móvel na saída para carregar o veículo de distribuição.",
      },
    ],
    products: [
      "esteira-transportadora-para-cesta-basica",
      "esteira-transportadora-para-sacaria",
      "elevador-de-sacaria",
      "cartrans-carrinho-transportador",
    ],
    simulation: {
      volumePerDay: 3000,
      people: 8,
      peopleAfter: 4,
      costPerPerson: 3400,
      daysPerMonth: 25,
      note: "Premissas de exemplo para 3.000 volumes por dia em duas docas. Troque pelos seus números na calculadora.",
    },
    pending: casePendingDefaults,
  },
];

export const EMPTY_CASE: CaseStudy = {
  slug: "",
  title: "",
  segment: "",
  region: "",
  eyebrow: "Aplicação típica",
  intro: "",
  image: "",
  challenge: [],
  solution: [],
  products: [],
  simulation: { volumePerDay: 1000, people: 4, peopleAfter: 2, costPerPerson: 3500, daysPerMonth: 22, note: "" },
};

function withPanelEdits(base: CaseStudy[]) {
  const edits = editedDocs<CaseStudy>("case");
  const hidden = new Set(deletedKeys("case"));
  const known = new Set(base.map((c) => c.slug));
  const merged = base.map((c) => (edits[c.slug] ? { ...c, ...edits[c.slug], slug: c.slug } : c));
  for (const [slug, doc] of Object.entries(edits)) {
    if (!known.has(slug) && doc.title && doc.segment) merged.push({ ...EMPTY_CASE, ...doc, slug });
  }
  return merged.filter((c) => !hidden.has(c.slug) && !c.draft);
}

export const caseStudies = withPanelEdits(DEFAULT_CASES).map((c) => ({ ...c, image: toWebp(c.image) }));

export function getCase(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
