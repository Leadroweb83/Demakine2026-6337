/**
 * FAQ do site. As respostas ficam no nível do que a Demakine confirma
 * publicamente (fábrica própria, atendimento nacional, assistência técnica,
 * projetos sob medida). Números de prazo, garantia e preço são sempre remetidos
 * à proposta comercial, para não publicar informação que muda por projeto.
 */
export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; title: string; intro: string; items: FaqItem[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "comercial",
    title: "Compra e orçamento",
    intro: "Como funciona o processo desde o primeiro contato até o pedido fechado.",
    items: [
      {
        q: "Como peço um orçamento?",
        a: "Pelo WhatsApp, telefone, e-mail ou por qualquer formulário do site. Para agilizar, informe o material transportado, a distância a vencer, a altura de descarga e a capacidade desejada. Se puder mandar foto ou vídeo do local, o dimensionamento sai mais preciso.",
      },
      {
        q: "Qual é o prazo de fabricação?",
        a: "Depende do equipamento e da fila de produção no momento do pedido. O prazo é confirmado por escrito na proposta e acompanhado pelo mesmo especialista que atendeu você. Cumprir prazo é um compromisso nosso: quando algo muda, avisamos antes.",
      },
      {
        q: "Vocês vendem para todo o Brasil?",
        a: "Sim. A fábrica fica em Limeira/SP e entregamos em todo o território nacional, com a logística acompanhada pela nossa equipe até a máquina chegar.",
      },
      {
        q: "Atendem pessoa física e pequenas operações?",
        a: "Sim. Atendemos desde produtores e pequenas agroindústrias até plantas grandes. O equipamento é dimensionado para o porte da operação, sem empurrar máquina maior do que você precisa.",
      },
      {
        q: "Como funciona o frete?",
        a: "O frete é cotado junto com a proposta, conforme o destino e as dimensões do equipamento. Você pode usar a nossa cotação ou a sua própria transportadora.",
      },
      {
        q: "Quais são as formas de pagamento?",
        a: "As condições são apresentadas na proposta comercial, incluindo as opções para pedido com adiantamento e para faturamento. Emitimos nota fiscal para todos os pedidos.",
      },
      {
        q: "Participam de processos de compra e cadastro de fornecedor?",
        a: "Sim. Enviamos a documentação da empresa para homologação de fornecedor e atendemos processos de cotação de indústrias, cooperativas e integradoras.",
      },
      {
        q: "É possível visitar a fábrica?",
        a: "Sim, e recomendamos. Ver o processo de corte, solda, pintura e teste ajuda a entender o padrão de fabricação. Combine a visita com o comercial pelo WhatsApp.",
      },
    ],
  },
  {
    id: "tecnico",
    title: "Dúvidas técnicas",
    intro: "Correia, inclinação, capacidade e as escolhas que definem o projeto.",
    items: [
      {
        q: "Qual correia usar para cada material?",
        a: "Sacaria e caixas pedem correia lisa; material solto em subida pede correia taliscada, para a carga não retornar; granel fino rende mais em correia em V, que forma calha; linha de alimento pede correia atóxica, fácil de higienizar. Na dúvida, descreva o material e a gente indica.",
      },
      {
        q: "Qual é a inclinação máxima de uma esteira?",
        a: "Depende do material e da correia. Produto embalado em correia lisa aceita inclinação suave; acima disso é preciso talisca para segurar a carga. Grão solto escorrega antes de material fardado. O ângulo final é definido no projeto, junto com a altura de descarga.",
      },
      {
        q: "Como sei a capacidade que preciso?",
        a: "Parta do volume por hora que a sua operação precisa mover em pico, não na média. A capacidade vem da combinação de largura de correia, velocidade e tipo de perfil. Nossa calculadora dá um ponto de partida e a engenharia confirma o modelo.",
      },
      {
        q: "Vocês fabricam em inox e para linha de alimento?",
        a: "Sim. Fabricamos versões em inox e com correia sanitária para operações que exigem higienização, além de galvanizado para ambiente agressivo.",
      },
      {
        q: "Os equipamentos podem ser feitos sob medida?",
        a: "Sim, e é uma boa parte do que fabricamos. Esteiras em Z, moegas para big bag, estruturas com trilho, elevações específicas e adaptações de comprimento, largura e inclinação para caber no seu layout.",
      },
      {
        q: "Qual tensão elétrica é usada?",
        a: "Trabalhamos com motorização compatível com a rede disponível na sua planta, inclusive trifásica. Informe a tensão do local no orçamento para o motor sair correto de fábrica.",
      },
      {
        q: "É possível variar a velocidade da esteira?",
        a: "Sim. Em operações de triagem e conferência a velocidade ajustável faz diferença, porque o ritmo da esteira precisa acompanhar o ritmo da equipe. Isso é definido na motorização.",
      },
      {
        q: "Os equipamentos têm proteções de segurança?",
        a: "As máquinas são fabricadas com proteções nas partes móveis e podem receber os dispositivos que a sua operação exige. Informe os requisitos de segurança da sua planta no orçamento.",
      },
    ],
  },
  {
    id: "pos-venda",
    title: "Instalação, manutenção e pós-venda",
    intro: "O que acontece depois da entrega: instalação, peças e assistência.",
    items: [
      {
        q: "A máquina chega pronta para usar?",
        a: "Nada sai da fábrica sem teste de funcionamento. Equipamentos maiores podem chegar em partes para transporte e são montados no local conforme a orientação que enviamos junto.",
      },
      {
        q: "O que eu preciso deixar pronto antes da entrega?",
        a: "Espaço livre no piso, piso firme e nivelado, ponto elétrico na tensão correta, altura livre suficiente e acesso para a descarga do caminhão. Cada página de produto tem a ficha de instalação com esses itens.",
      },
      {
        q: "Vocês fazem instalação e treinamento?",
        a: "Damos a orientação de instalação e de operação para a sua equipe. Para projetos maiores, avaliamos o acompanhamento em campo. Combine no fechamento do pedido.",
      },
      {
        q: "Como funciona a assistência técnica?",
        a: "Temos assistência técnica própria e canal direto para abrir atendimento. Quando dá para resolver por orientação remota, resolvemos; quando precisa de peça ou visita, encaminhamos.",
      },
      {
        q: "Vocês fornecem peças de reposição?",
        a: "Sim. Correia, roletes, raspador, rolamentos, redutor, motor e itens de costura de sacaria. Ter as peças de desgaste em estoque evita parada de linha em safra.",
      },
      {
        q: "Que manutenção a máquina exige?",
        a: "Rotina simples: inspeção diária de correia e raspador, verificação semanal de tensionamento e alinhamento, e lubrificação e revisão de rolamentos no plano mensal. Cada página de produto tem o checklist, e há um PDF para imprimir e pendurar na fábrica.",
      },
      {
        q: "E a garantia?",
        a: "Todo equipamento tem garantia de fábrica, com as condições descritas na proposta e na documentação de entrega. Desgaste natural de itens de consumo, como correia, não entra em garantia.",
      },
      {
        q: "Fazem manutenção em equipamento antigo da Demakine?",
        a: "Sim. Reformamos e recuperamos equipamentos nossos, inclusive troca de correia, reforço de estrutura e substituição de motorização.",
      },
    ],
  },
];

export const faqFlat: FaqItem[] = faqGroups.flatMap((g) => g.items);

/** Schema.org FAQPage a partir de qualquer lista de perguntas. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
