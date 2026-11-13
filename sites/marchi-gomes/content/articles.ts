import { site } from "./site";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  area: string;
  date: string;
  /** Rascunho: aparece so enquanto o site esta em pre-lancamento. */
  draft: boolean;
  body: { h?: string; p: string }[];
};

/**
 * Rascunhos de conteudo informativo escritos para o lancamento.
 * NENHUM pode ir ao ar sem revisao e assinatura de um advogado do escritorio.
 * Quando o Sanity for ligado, esta lista passa a vir do painel.
 */
export const articles: Article[] = [
  {
    slug: "quando-comecar-a-organizar-a-sucessao",
    title: "Quando começar a organizar a sucessão da família?",
    excerpt: "A sucessão organizada com antecedência reduz conflitos e dá previsibilidade a quem fica. Veja os sinais de que é hora de tratar do assunto.",
    area: "Família e Sucessões",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Muitas famílias só tratam da sucessão quando ela já se tornou urgente. Nesse momento, as decisões costumam ser tomadas sob pressão, com menos alternativas e mais espaço para desentendimentos." },
      { h: "Por que tratar disso antes", p: "Organizar a sucessão é decidir, com calma, como o patrimônio e as responsabilidades serão transmitidos. Quando essa conversa acontece no tempo certo, a família conhece as regras, entende os motivos de cada escolha e evita que um momento de perda se transforme também em disputa." },
      { h: "Sinais de que é hora de começar", p: "Alguns momentos pedem atenção: a compra de um imóvel relevante, a entrada de filhos na empresa da família, um novo casamento ou união, ou simplesmente o crescimento do patrimônio a ponto de sua divisão deixar de ser simples." },
      { h: "O que uma orientação jurídica avalia", p: "Cada família tem uma composição, um patrimônio e objetivos próprios. Por isso não existe um modelo único. A análise considera quem são as pessoas envolvidas, quais bens existem, quais são os desejos de quem organiza a sucessão e quais instrumentos previstos em lei fazem sentido para aquele caso." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
  {
    slug: "o-que-revisar-antes-de-assinar-um-contrato",
    title: "O que revisar antes de assinar um contrato?",
    excerpt: "Obrigações, garantias, prazos e saída: quatro pontos que merecem leitura cuidadosa antes da assinatura.",
    area: "Contratos",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Um contrato registra o que as partes combinaram e, principalmente, o que acontece quando algo não sai como o esperado. É por isso que a revisão antes da assinatura costuma custar muito menos do que a discussão depois dela." },
      { h: "Obrigações de cada parte", p: "O texto deve deixar claro quem faz o quê, em que prazo e com que padrão de qualidade. Cláusulas vagas são a origem mais comum de conflitos." },
      { h: "Garantias e responsabilidades", p: "Vale entender quais garantias estão sendo oferecidas, quem responde por eventuais prejuízos e se existem limites para essa responsabilidade." },
      { h: "Prazo, renovação e saída", p: "Verifique por quanto tempo o contrato vale, se a renovação é automática e em que condições é possível encerrá-lo, incluindo avisos prévios e multas." },
      { h: "Efeitos práticos", p: "Além da leitura jurídica, é importante avaliar como cada cláusula funciona no dia a dia: ela é viável para a sua rotina ou para a operação da sua empresa?" },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
  {
    slug: "relacao-entre-socios-por-que-definir-as-regras-antes",
    title: "Relação entre sócios: por que definir as regras antes do conflito?",
    excerpt: "Combinar por escrito como a sociedade decide, distribui resultados e lida com a saída de um sócio protege a empresa e a relação.",
    area: "Empresarial e Societário",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Sociedades costumam começar em um momento de entusiasmo e confiança. É justamente nessa fase, quando o diálogo é fácil, que vale definir como serão tomadas as decisões difíceis." },
      { h: "O que normalmente precisa estar combinado", p: "Entre os pontos que merecem definição estão a forma de tomar decisões relevantes, o papel de cada sócio na operação, a política de distribuição de resultados e o que acontece se alguém quiser sair, falecer ou vender a sua participação." },
      { h: "Por que isso protege a empresa", p: "Quando as regras estão claras, um desentendimento entre sócios deixa de paralisar o negócio. A empresa segue operando enquanto a divergência é tratada pelo caminho previamente combinado." },
      { h: "O momento certo", p: "O melhor momento para tratar da relação societária é antes do conflito. Depois dele, a negociação tende a ser mais longa, mais cara e menos equilibrada." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
];

export const visibleArticles = () => articles.filter((a) => !a.draft || !site.launchReady);
