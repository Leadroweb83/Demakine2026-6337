/**
 * Fonte unica de conteudo do site.
 * Textos vindos das pecas da marca enviadas pelo cliente estao como estao.
 * Campos vazios ("") sao dados que ainda faltam: o site esconde o bloco
 * correspondente em vez de inventar. Veja PENDENCIAS.md.
 */

export const site = {
  /** Enquanto false: robots bloqueia tudo e as paginas saem com noindex. */
  launchReady: false as boolean,

  name: "Marchi Gomes Advogados",
  shortName: "Marchi Gomes",
  tagline: "Tradição que impulsiona novos caminhos.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Escritório de advocacia em Limeira, SP, fundado em 1996. Assessoria jurídica consultiva, preventiva e contenciosa para pessoas, famílias e empresas.",
  founded: 1996,

  contact: {
    /** Somente digitos com DDI, ex.: 5511999999999 */
    whatsapp: "5519981843010",
    phone: "(19) 98184-3010",
    email: "",
    street: "R. Valdir Dalfré, 57 - Jardim Porto Real II",
    city: "Limeira",
    state: "SP",
    zip: "13485-402",
    hours: "",
    /** Registro da sociedade na OAB, ex.: OAB/SP 00.000 */
    oab: "",
  },

  social: { instagram: "", linkedin: "" },
};

/** Caminhos em /public. Vazio = o site usa o fundo de luz e o monograma. */
export const images = { hero: "", firm: "" };

/** Palavras das lombadas dos livros nas pecas da marca. */
export const marquee = ["Direito", "Estratégia", "Ética", "Patrimônio", "Negócios", "Confiança"];

/** Numeros reais do escritorio. Vazio = bloco escondido. Ex.: { value: 20, suffix: "+", label: "anos de atuação" } */
export const stats: { value: number; suffix?: string; label: string }[] = [
  { value: new Date().getFullYear() - 1996, label: "anos de advocacia em Limeira" },
  { value: 12, label: "áreas do Direito atendidas" },
  { value: 3, label: "frentes: consultiva, preventiva e contenciosa" },
];

/** Socios e advogados. Vazio = secao escondida. Foto em /public/equipe/. */
export const team: { name: string; role: string; oab: string; bio: string; photo: string }[] = [
  { name: "Gisele Marchi", role: "Sócia fundadora", oab: "", bio: "", photo: "" },
  { name: "Gabriel Gomes", role: "Sócio fundador", oab: "", bio: "", photo: "" },
];

export const whatsappMessage =
  "Olá! Vim pelo site e gostaria de falar com a equipe da Marchi Gomes Advogados.";

/** Integracoes: IDs publicos vem do .env; vazio = recurso desligado. */
export const integrations = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
  /** Link do Calendly ou da pagina de agendamento do Google Agenda. */
  schedulingUrl: process.env.NEXT_PUBLIC_SCHEDULING_URL ?? "",
};

export const nav = [
  { href: "/#areas", label: "Áreas de atuação" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/escritorio", label: "O escritório" },
  { href: "/artigos", label: "Artigos" },
  { href: "/#contato", label: "Contato" },
];

export const pillars = [
  { title: "Pessoas", text: "em primeiro lugar" },
  { title: "Segurança", text: "nas decisões" },
  { title: "Resultados", text: "com consistência" },
  { title: "Confiança", text: "em todas as etapas" },
];

export type Area = {
  slug: string;
  name: string;
  title: string;
  summary: string;
  /** Texto de abertura da pagina da frente, a partir do material do escritorio. */
  intro: string;
  /** Foto da frente em /public (aparece ao lado do cursor). Opcional. */
  image?: string;
};

/**
 * Frentes em destaque. O escritorio sugeriu priorizar tres ou quatro; estas
 * seguem a enfase do texto institucional ("questoes familiares, protecao
 * patrimonial, contratos e decisoes empresariais"). A CONFIRMAR com os socios.
 */
export const areas: Area[] = [
  {
    slug: "familia-e-sucessoes",
    name: "Família e Sucessões",
    title: "Direito de Família e Sucessões",
    summary: "Orientação para questões familiares e para a organização de uma sucessão antes que surjam conflitos.",
    intro: "Questões familiares demandam uma compreensão que vai além do processo. Exigem atenção às relações envolvidas, aos objetivos de cada pessoa e aos efeitos de cada medida.",
  },
  {
    slug: "patrimonio-e-imoveis",
    name: "Patrimônio e Imóveis",
    title: "Direito Imobiliário e Patrimonial",
    summary: "Proteção patrimonial e organização jurídica dos bens, conforme as necessidades de cada caso.",
    intro: "A proteção do patrimônio começa pela organização jurídica das escolhas: estruturar relações patrimoniais e avaliar riscos antes de assumir cada compromisso.",
  },
  {
    slug: "contratos",
    name: "Contratos",
    title: "Direito Contratual",
    summary: "Elaboração, revisão e negociação de contratos, com atenção aos efeitos práticos de cada cláusula.",
    intro: "Um contrato define obrigações, garantias e consequências. O trabalho é elaborar, revisar e negociar cada instrumento para que o cliente saiba exatamente o que está assumindo.",
  },
  {
    slug: "empresarial-e-societario",
    name: "Empresarial e Societário",
    title: "Direito Empresarial e Societário",
    summary: "Recomendações que consideram a operação do negócio e podem ser aplicadas na gestão da empresa.",
    intro: "Para o cliente empresarial, a orientação jurídica considera a operação do negócio, seus compromissos comerciais e os efeitos econômicos das decisões, incluindo a definição segura das relações societárias.",
  },
];

/** Lista completa, como informada pelo escritorio. */
export const allAreas = [
  "Direito Civil e Responsabilidade Civil",
  "Direito de Família e Sucessões",
  "Direito Contratual",
  "Direito Empresarial e Societário",
  "Direito do Consumidor",
  "Direito Imobiliário e Patrimonial",
  "Direito Bancário e Financeiro",
  "Direito do Trabalho e Previdenciário",
  "Direito Tributário",
  "Direito Penal",
  "Direito Internacional",
  "Contencioso estratégico",
];

export const services = [
  { title: "Consultoria e assessoria jurídica", text: "Orientação para decisões pessoais, patrimoniais e empresariais, de forma pontual ou continuada." },
  { title: "Contratos e negociações", text: "Elaboração, revisão e negociação de instrumentos, com atenção às obrigações assumidas, às garantias e aos efeitos práticos de cada cláusula." },
  { title: "Planejamento e organização jurídica", text: "Estruturação de relações familiares, patrimoniais, societárias e empresariais, conforme as necessidades de cada caso." },
  { title: "Prevenção e resolução de conflitos", text: "Avaliação de riscos, condução de negociações e construção de acordos." },
  { title: "Representação judicial e administrativa", text: "Atuação na defesa dos interesses do cliente, com estratégia definida a partir dos fatos, das provas e dos objetivos envolvidos." },
];

export const approach = [
  {
    title: "Compreender o contexto",
    text: "O trabalho começa por entender quais são os seus objetivos, quais interesses precisam ser preservados e quais consequências cada alternativa pode produzir.",
  },
  {
    title: "Definir a estratégia",
    text: "A partir dessa análise, o escritório define o caminho e explica cada recomendação. A linguagem é clara e a análise, tecnicamente consistente, para que você tenha informação para decidir.",
  },
  {
    title: "Conduzir de perto",
    text: "Os sócios participam, cada demanda tem um responsável definido, e você acompanha o andamento em reuniões e comunicações periódicas.",
  },
];

export const history = {
  title: "Duas trajetórias, um legado de responsabilidade e uma visão compartilhada da advocacia.",
  paragraphs: [
    "A Marchi Gomes Advogados nasce da união profissional entre Gisele Marchi e Gabriel Gomes. Fundado em 1996, em Limeira, o escritório reúne experiências complementares com um propósito definido: oferecer orientação jurídica rigorosa, atendimento próximo e estratégia alinhada à realidade de cada cliente.",
    "Antes da constituição da sociedade, Gisele Marchi e Gabriel Gomes desenvolveram percursos próprios, com atuação em Administração Pública e bancária. A convivência profissional revelou uma afinidade de princípios e uma oportunidade concreta: reunir competências para acompanhar pessoas, famílias e empresas em decisões que exigem análise cuidadosa, capacidade de negociação e responsabilidade.",
    "A Marchi Gomes foi criada para atuar tanto na solução de conflitos quanto na organização jurídica das escolhas que os antecedem. Questões familiares, proteção patrimonial, contratos e decisões empresariais demandam uma compreensão que vai além do processo. Exigem atenção às relações envolvidas, aos objetivos do cliente e aos efeitos de cada medida.",
    "Os sobrenomes dos fundadores expressam essa responsabilidade pessoal. Cada orientação leva consigo o compromisso de compreender o que está em jogo, apresentar os caminhos disponíveis e conduzir o trabalho com clareza e franqueza.",
    "É sobre essa base que o escritório constrói sua identidade: respeito ao legado, independência de julgamento e uma advocacia atenta às necessidades de quem lhe confia decisões relevantes.",
  ],
};

export const legacy = {
  name: "Dr. João Jair Marchi",
  /** Foto em /public. Vazio = bloco sem imagem. */
  photo: "",
  paragraphs: [
    "A história do escritório encontra inspiração na tradição jurídica da família Marchi, com uma referência que merece especial reconhecimento: Dr. João Jair Marchi. Após aposentar-se como Delegado de Polícia, passou a dedicar sua experiência à advocacia, construindo uma trajetória de destaque na região de Limeira e na advocacia paulista pela atuação na defesa dos direitos das pessoas.",
    "Seu legado ocupa um lugar especial nessa construção. A seriedade no exercício profissional, a firmeza na defesa de direitos e o respeito por quem busca orientação jurídica constituem referências para os valores que a Marchi Gomes deseja preservar e transmitir às próximas gerações.",
  ],
};

export const future = {
  title: "Crescer com consistência e preservar a proximidade que dá sentido ao trabalho.",
  statement: "Pessoas, negócios, patrimônio e futuro orientam essa construção. O legado inspira; a atuação diária sustenta a confiança.",
  paragraphs: [
    "A Marchi Gomes pretende consolidar uma atuação reconhecida pelo rigor técnico, pela clareza das orientações e pela responsabilidade na condução de cada demanda. O crescimento será orientado pela capacidade de atender bem e de acompanhar questões de maior complexidade.",
    "Isso envolve aprofundar conhecimentos, aperfeiçoar processos internos e incorporar tecnologia com finalidade prática: organizar informações, dar agilidade ao trabalho e melhorar a comunicação com o cliente. A análise dos sócios e a atenção às particularidades de cada caso permanecem centrais.",
    "O escritório também pretende ampliar a presença da advocacia preventiva nas decisões de pessoas e empresas. Uma orientação recebida no momento adequado pode permitir a revisão de um contrato, a organização de uma sucessão ou a definição mais segura de uma relação societária antes que surjam conflitos.",
    "A ambição é construir relações duradouras, nas quais o cliente encontre uma referência de confiança para decisões relevantes ao longo do tempo.",
  ],
};

/** Respostas a VALIDAR com o escritorio antes de publicar. */
export const faqs = [
  {
    q: "Como funciona o primeiro contato?",
    a: "Você fala com a nossa equipe pelo WhatsApp ou pelo formulário, conta a sua situação e recebe a orientação sobre os próximos passos e os documentos necessários.",
  },
  {
    q: "O escritório atende pessoas físicas e empresas?",
    a: "Sim. A Marchi Gomes atende pessoas, famílias e empresas nas frentes consultiva, preventiva e contenciosa.",
  },
  {
    q: "Preciso estar com um processo em andamento para procurar um advogado?",
    a: "Não. Uma orientação recebida no momento adequado pode permitir a revisão de um contrato, a organização de uma sucessão ou a definição mais segura de uma relação societária antes que surjam conflitos.",
  },
  {
    q: "Onde fica o escritório?",
    a: "Em Limeira, no interior de São Paulo, onde o escritório foi fundado em 1996.",
  },
  {
    q: "As minhas informações ficam protegidas?",
    a: "Sim. O sigilo profissional é dever do advogado e os dados enviados pelo site são usados apenas para retornar o seu contato.",
  },
];
