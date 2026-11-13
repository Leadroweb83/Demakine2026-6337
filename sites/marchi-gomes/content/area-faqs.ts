/**
 * Duvidas por area. Respostas gerais, de carater informativo.
 * A VALIDAR por um advogado do escritorio antes da publicacao.
 */
export const areaFaqs: Record<string, { q: string; a: string }[]> = {
  "familia-e-sucessoes": [
    { q: "Quando vale a pena organizar a sucessão em vida?", a: "Quando há patrimônio, empresa familiar ou uma composição familiar que torne a divisão menos simples. Organizar com antecedência dá previsibilidade e reduz o espaço para conflitos." },
    { q: "O inventário precisa ser feito na Justiça?", a: "Depende do caso. A lei admite o inventário em cartório em determinadas situações e exige a via judicial em outras. A análise dos herdeiros, dos bens e da existência de consenso indica o caminho." },
    { q: "O que levar para uma primeira conversa sobre família ou herança?", a: "Documentos pessoais, certidões, documentos dos bens e uma linha do tempo dos fatos. Se você ainda não reuniu tudo, pode entrar em contato da mesma forma." },
  ],
  "patrimonio-e-imoveis": [
    { q: "O que avaliar antes de comprar um imóvel?", a: "A situação do imóvel e do vendedor, a documentação existente e as condições do contrato. A verificação antes da assinatura evita surpresas depois dela." },
    { q: "Como proteger o patrimônio de forma lícita?", a: "Pela organização jurídica dos bens e das relações patrimoniais, com instrumentos previstos em lei e adequados a cada caso. Não existe um modelo único." },
    { q: "O que é regularização de imóvel?", a: "É o conjunto de medidas para que a situação do imóvel nos registros corresponda à realidade, o que dá segurança para vender, financiar ou transmitir o bem." },
  ],
  "contratos": [
    { q: "Preciso de advogado para assinar um contrato?", a: "Não é obrigatório na maioria dos casos, mas a revisão permite compreender as obrigações assumidas, as garantias e as consequências de um descumprimento antes de se comprometer." },
    { q: "É possível rever um contrato já assinado?", a: "Em algumas situações, sim, por acordo entre as partes ou pelos meios previstos em lei. A viabilidade depende do que foi contratado e do que ocorreu depois." },
    { q: "O que fazer quando a outra parte descumpre o contrato?", a: "O primeiro passo é reunir o contrato e os registros do que aconteceu. A partir daí, avalia-se a negociação, a notificação ou a medida judicial mais adequada." },
  ],
  "empresarial-e-societario": [
    { q: "Quando a empresa deve buscar assessoria jurídica?", a: "De preferência antes das decisões relevantes: entrada ou saída de sócios, contratos importantes, expansão ou reorganização. A orientação preventiva costuma custar menos que o conflito." },
    { q: "Por que formalizar as regras entre os sócios?", a: "Porque regras claras sobre decisões, resultados e saída de sócios permitem que a empresa continue operando mesmo quando há divergência." },
    { q: "A assessoria pode ser continuada?", a: "Sim. O escritório atua de forma pontual ou continuada, com responsável definido pela demanda, reuniões de acompanhamento e comunicação periódica." },
  ],
  "direito-civil": [
    { q: "O que é responsabilidade civil?", a: "É o dever de reparar um dano causado a outra pessoa. A análise considera o que aconteceu, o prejuízo sofrido e a relação entre os dois." },
    { q: "Sofri um prejuízo. O que devo guardar?", a: "Tudo o que registre o ocorrido: documentos, mensagens, fotos, comprovantes de gastos e contatos de quem presenciou os fatos." },
    { q: "Todo conflito precisa virar processo?", a: "Não. Muitas situações são resolvidas por negociação ou acordo. O processo é um dos caminhos, avaliado conforme os objetivos de cada cliente." },
  ],
  "direito-do-consumidor": [
    { q: "O que fazer quando um produto ou serviço apresenta problema?", a: "Registre o ocorrido e a tentativa de solução com o fornecedor. Guardar protocolos, notas e mensagens facilita qualquer medida posterior." },
    { q: "O escritório atende consumidores e empresas?", a: "Sim. A orientação pode ser dada tanto a quem consome quanto a empresas que desejam adequar suas práticas e responder a reclamações." },
    { q: "Vale a pena procurar orientação antes de reclamar?", a: "Em casos de maior valor ou complexidade, sim. Conhecer seus direitos e os caminhos disponíveis ajuda a escolher a medida adequada." },
  ],
  "bancario-e-financeiro": [
    { q: "É possível revisar um contrato bancário?", a: "A revisão depende das cláusulas contratadas e das circunstâncias do caso. O primeiro passo é a análise do contrato e dos extratos." },
    { q: "O que avaliar antes de assinar um financiamento?", a: "O custo total da operação, as garantias oferecidas e as consequências do atraso. Compreender esses pontos antes da assinatura evita compromissos inviáveis." },
    { q: "O escritório atua para pessoas e empresas?", a: "Sim. A orientação alcança operações de pessoas físicas e de empresas, na contratação e na renegociação." },
  ],
  "trabalho-e-previdenciario": [
    { q: "O escritório atende empresas e trabalhadores?", a: "Sim. A atuação alcança empresas, na orientação preventiva e na defesa, e profissionais que buscam compreender seus direitos." },
    { q: "Como a empresa pode reduzir riscos trabalhistas?", a: "Com contratos e rotinas adequados à legislação e orientação antes das decisões que afetam a equipe. A prevenção diminui a chance de litígios." },
    { q: "Quando procurar orientação previdenciária?", a: "Antes de requerer um benefício ou ao receber uma negativa. A análise do histórico de contribuições indica as possibilidades de cada caso." },
  ],
  "direito-tributario": [
    { q: "Planejamento tributário é legal?", a: "Sim, quando utiliza os meios previstos em lei para organizar as atividades e o patrimônio. A análise técnica distingue o que é permitido do que representa risco." },
    { q: "Recebi uma cobrança do Fisco. O que fazer?", a: "Não ignore prazos. Reúna a notificação e os documentos relacionados e busque orientação para avaliar a cobrança e as formas de resposta." },
    { q: "A orientação tributária serve para pessoa física?", a: "Sim. Questões patrimoniais, sucessórias e de rendimentos também têm efeitos tributários que merecem análise." },
  ],
  "direito-penal": [
    { q: "Fui intimado a comparecer à delegacia. Devo ir com advogado?", a: "É recomendável. A orientação prévia permite compreender a situação e garante que seus direitos sejam respeitados desde o início." },
    { q: "O atendimento é sigiloso?", a: "Sim. O sigilo profissional é dever do advogado e protege as informações compartilhadas com o escritório." },
    { q: "Em que momento a defesa deve começar?", a: "O quanto antes. A atuação desde as primeiras etapas amplia as possibilidades de defesa." },
  ],
  "direito-internacional": [
    { q: "Que tipo de questão envolve o Direito Internacional?", a: "Situações pessoais, patrimoniais ou comerciais que tenham relação com mais de um país, como contratos com partes estrangeiras ou bens no exterior." },
    { q: "Um contrato com empresa estrangeira exige cuidados específicos?", a: "Sim. É importante definir, entre outros pontos, a lei aplicável e a forma de solução de conflitos." },
    { q: "O escritório acompanha casos com partes fora do Brasil?", a: "A viabilidade e a forma de atuação são avaliadas caso a caso, conforme os países e os temas envolvidos." },
  ],
  "contencioso-estrategico": [
    { q: "O que é contencioso estratégico?", a: "É a condução de litígios de maior relevância ou complexidade com planejamento desde o início, considerando os fatos, as provas e os objetivos do cliente." },
    { q: "Como a estratégia de um processo é definida?", a: "A partir da análise dos fatos e das provas disponíveis e do que o cliente pretende alcançar, incluindo a avaliação de acordo." },
    { q: "Como acompanho o andamento do meu caso?", a: "Cada demanda tem um responsável definido, com reuniões de acompanhamento e comunicação periódica." },
  ],
};
