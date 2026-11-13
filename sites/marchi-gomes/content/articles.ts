import { site } from "./site";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  area: string;
  date: string;
  /** Capa em /public (aparece na lista, no artigo e no compartilhamento). Opcional. */
  cover?: string;
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
  {
    slug: "recebi-uma-notificacao-do-fisco-e-agora",
    title: "Recebi uma notificação do Fisco. E agora?",
    excerpt: "Prazos, documentos e o que avaliar antes de responder a uma cobrança ou intimação tributária.",
    area: "Tributário",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Uma notificação tributária costuma gerar apreensão, mas o pior caminho é ignorá-la. Ela quase sempre vem acompanhada de um prazo, e perder esse prazo reduz as alternativas disponíveis." },
      { h: "Entenda o que está sendo cobrado", p: "O primeiro passo é identificar qual tributo, qual período e qual o fundamento da cobrança. Sem isso, não é possível avaliar se ela procede." },
      { h: "Reúna os documentos", p: "Declarações entregues, comprovantes de pagamento e a escrituração do período são a base de qualquer resposta, seja para esclarecer, corrigir ou contestar." },
      { h: "Avalie os caminhos", p: "Conforme o caso, é possível prestar esclarecimentos, regularizar a situação ou apresentar defesa. A escolha depende da análise técnica da cobrança e dos objetivos do contribuinte." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
  {
    slug: "como-a-empresa-pode-prevenir-conflitos-trabalhistas",
    title: "Como a empresa pode prevenir conflitos trabalhistas?",
    excerpt: "Contratos, rotinas e registros adequados diminuem a chance de litígio e dão segurança à gestão de pessoas.",
    area: "Trabalho e Previdenciário",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Boa parte dos conflitos trabalhistas nasce de rotinas que nunca foram formalizadas ou de regras que mudaram sem registro. A prevenção começa pela organização." },
      { h: "Contratos e políticas claros", p: "O que foi combinado com cada colaborador precisa estar escrito e ser coerente com a prática do dia a dia." },
      { h: "Registros em ordem", p: "Jornada, pagamentos e comunicações devem estar documentados. Em uma eventual discussão, é a documentação que demonstra o que realmente ocorreu." },
      { h: "Orientação antes da decisão", p: "Mudanças de função, de jornada ou desligamentos merecem análise prévia. Uma consulta antes da decisão costuma evitar um processo depois dela." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
  {
    slug: "o-que-verificar-antes-de-comprar-um-imovel",
    title: "O que verificar antes de comprar um imóvel?",
    excerpt: "A situação do imóvel, do vendedor e do contrato: três frentes de análise antes de fechar negócio.",
    area: "Patrimônio e Imóveis",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "A compra de um imóvel costuma ser uma das decisões patrimoniais mais relevantes da vida de uma pessoa ou de uma empresa. A verificação prévia protege o investimento." },
      { h: "A situação do imóvel", p: "É preciso confirmar, nos registros, quem é o proprietário e se existem ônus ou restrições sobre o bem." },
      { h: "A situação do vendedor", p: "Pendências do vendedor podem afetar o negócio. Por isso a análise não se limita ao imóvel." },
      { h: "O contrato", p: "Preço, forma de pagamento, prazos, entrega e consequências do descumprimento devem estar descritos com precisão antes da assinatura." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
  {
    slug: "problema-com-produto-ou-servico-por-onde-comecar",
    title: "Problema com produto ou serviço: por onde começar?",
    excerpt: "Registrar, comunicar e guardar comprovantes são os primeiros passos de quem enfrenta um problema de consumo.",
    area: "Consumidor",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Diante de um produto com defeito ou de um serviço mal prestado, a forma como o consumidor registra o problema faz diferença no desfecho." },
      { h: "Registre o ocorrido", p: "Guarde nota fiscal, contrato, anúncios, fotos e mensagens. Anote datas e nomes de quem atendeu." },
      { h: "Comunique o fornecedor", p: "Formalize a reclamação pelos canais da empresa e guarde os protocolos. Muitas situações se resolvem nessa etapa." },
      { h: "Quando buscar orientação", p: "Em casos de maior valor, de recusa do fornecedor ou de prejuízos que vão além do produto, a orientação jurídica ajuda a escolher a medida adequada." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
  {
    slug: "sofri-um-prejuizo-quando-ha-dever-de-indenizar",
    title: "Sofri um prejuízo. Quando há dever de indenizar?",
    excerpt: "Entenda, em linhas gerais, o que é analisado para saber se alguém deve reparar um dano.",
    area: "Civil",
    date: "2026-11-13",
    draft: true,
    body: [
      { p: "Nem todo prejuízo gera direito a indenização, e nem toda situação exige um processo. A análise jurídica começa por compreender o que aconteceu." },
      { h: "O que costuma ser avaliado", p: "De modo geral, examina-se a conduta de quem causou o dano, o prejuízo efetivamente sofrido e a ligação entre um e outro." },
      { h: "A importância das provas", p: "Documentos, mensagens, fotos, orçamentos e testemunhas ajudam a demonstrar tanto o ocorrido quanto a extensão do prejuízo." },
      { h: "Negociar ou processar", p: "Muitos casos são resolvidos por acordo. A decisão sobre o caminho considera os objetivos de quem sofreu o dano, o tempo e os custos envolvidos." },
      { p: "Este texto tem caráter informativo e não substitui a análise do seu caso por um advogado." },
    ],
  },
];

export const visibleArticles = () => articles.filter((a) => !a.draft || !site.launchReady);
