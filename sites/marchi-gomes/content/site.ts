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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.marchigomes.adv.br",
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
export const images = {
  hero: "/img/hero-escritorio.webp",
  /** Recorte vertical do hero para celular. */
  heroMobile: "/img/hero-escritorio-vertical.webp",
  /** Faixa de tres imagens entre secoes. */
  strip: ["/img/faixa-livros.webp", "/img/justica.webp", "/img/faixa-janela.webp"],
  detail: "/img/detalhe-pasta.webp",
  /** Video do hero (mp4 sem som). Vazio = o hero usa a foto. */
  heroVideo: "/img/hero-video.mp4",
  /** Versao vertical e menor do video, para celular. */
  heroVideoMobile: "/img/hero-video-mobile.mp4",
  /** Primeiro quadro do video: aparece enquanto ele carrega e e o LCP da pagina. */
  heroPoster: "/img/hero-video-poster.webp",
  heroPosterMobile: "/img/hero-video-poster-mobile.webp",
  firm: "/img/justica.webp",
};

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

const mapsQuery = encodeURIComponent("R. Valdir Dalfré, 57 - Jardim Porto Real II, Limeira - SP, 13485-402");
export const maps = {
  directions: `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`,
  embed: `https://www.google.com/maps?q=${mapsQuery}&output=embed`,
};

export const whatsappMessage =
  "Olá! Vim pelo site e gostaria de falar com a equipe da Marchi Gomes Advogados.";

/** Integracoes: IDs publicos vem do .env; vazio = recurso desligado. */
export const integrations = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
  /** Link do Calendly ou da pagina de agendamento do Google Agenda. */
  schedulingUrl: process.env.NEXT_PUBLIC_SCHEDULING_URL ?? "",
  /** Cloudflare Turnstile (anti-spam invisivel). Exige tambem TURNSTILE_SECRET_KEY no servidor. */
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
};

/**
 * Cidades vizinhas atendidas. Vazio = nenhuma pagina gerada. Preencher so com
 * cidades confirmadas pelo escritorio, ex.: { slug: "americana", name: "Americana" }.
 */
export const cities: { slug: string; name: string }[] = [];

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
  /** Termo de busca principal, usado no titulo da pagina: "<keyword> em Limeira". */
  keyword: string;
  /** Frente em destaque na home. */
  featured?: boolean;
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
    image: "/img/justica.webp",
    featured: true,
    keyword: "Advogado de família e sucessões",
    name: "Família e Sucessões",
    title: "Direito de Família e Sucessões",
    summary: "Orientação para questões familiares e para a organização de uma sucessão antes que surjam conflitos.",
    intro: "Questões familiares demandam uma compreensão que vai além do processo. Exigem atenção às relações envolvidas, aos objetivos de cada pessoa e aos efeitos de cada medida.",
  },
  {
    slug: "patrimonio-e-imoveis",
    image: "/img/area-livros.webp",
    featured: true,
    keyword: "Advogado imobiliário",
    name: "Patrimônio e Imóveis",
    title: "Direito Imobiliário e Patrimonial",
    summary: "Proteção patrimonial e organização jurídica dos bens, conforme as necessidades de cada caso.",
    intro: "A proteção do patrimônio começa pela organização jurídica das escolhas: estruturar relações patrimoniais e avaliar riscos antes de assumir cada compromisso.",
  },
  {
    slug: "contratos",
    image: "/img/area-pasta.webp",
    featured: true,
    keyword: "Advogado de contratos",
    name: "Contratos",
    title: "Direito Contratual",
    summary: "Elaboração, revisão e negociação de contratos, com atenção aos efeitos práticos de cada cláusula.",
    intro: "Um contrato define obrigações, garantias e consequências. O trabalho é elaborar, revisar e negociar cada instrumento para que o cliente saiba exatamente o que está assumindo.",
  },
  {
    slug: "empresarial-e-societario",
    image: "/img/area-janela.webp",
    featured: true,
    keyword: "Advogado empresarial",
    name: "Empresarial e Societário",
    title: "Direito Empresarial e Societário",
    summary: "Recomendações que consideram a operação do negócio e podem ser aplicadas na gestão da empresa.",
    intro: "Para o cliente empresarial, a orientação jurídica considera a operação do negócio, seus compromissos comerciais e os efeitos econômicos das decisões, incluindo a definição segura das relações societárias.",
  },
  // Demais areas informadas pelo escritorio. Resumos descritivos, A VALIDAR com os socios.
  {
    slug: "direito-civil",
    keyword: "Advogado cível",
    name: "Civil",
    title: "Direito Civil e Responsabilidade Civil",
    summary: "Relações entre pessoas, obrigações assumidas e reparação de danos, da orientação preventiva à defesa em juízo.",
    intro: "O Direito Civil trata das relações do dia a dia entre pessoas e empresas: obrigações assumidas, danos sofridos ou causados e os direitos que decorrem dessas situações.",
  },
  {
    slug: "direito-do-consumidor",
    keyword: "Advogado do consumidor",
    name: "Consumidor",
    title: "Direito do Consumidor",
    summary: "Relações de consumo analisadas com atenção aos direitos e deveres de cada parte.",
    intro: "As relações de consumo têm regras próprias de informação, qualidade e responsabilidade. A orientação começa pela compreensão do que foi contratado e do que efetivamente ocorreu.",
  },
  {
    slug: "bancario-e-financeiro",
    keyword: "Advogado bancário",
    name: "Bancário e Financeiro",
    title: "Direito Bancário e Financeiro",
    summary: "Contratos bancários, financiamentos e operações de crédito examinados com atenção a cada cláusula.",
    intro: "Operações bancárias e financeiras envolvem contratos extensos e efeitos de longo prazo. A experiência dos sócios no setor bancário contribui para uma leitura prática dessas relações.",
  },
  {
    slug: "trabalho-e-previdenciario",
    keyword: "Advogado trabalhista e previdenciário",
    name: "Trabalho e Previdenciário",
    title: "Direito do Trabalho e Previdenciário",
    summary: "Relações de trabalho e questões previdenciárias, para empresas e profissionais.",
    intro: "As relações de trabalho e os direitos previdenciários afetam diretamente a vida das pessoas e a rotina das empresas. A orientação considera os dois lados dessa relação.",
  },
  {
    slug: "direito-tributario",
    keyword: "Advogado tributário",
    name: "Tributário",
    title: "Direito Tributário",
    summary: "Questões tributárias de pessoas e empresas, com análise técnica e linguagem clara.",
    intro: "A tributação influencia decisões patrimoniais e empresariais. A análise jurídica ajuda a compreender as obrigações existentes e os caminhos previstos em lei.",
  },
  {
    slug: "direito-penal",
    keyword: "Advogado criminalista",
    name: "Penal",
    title: "Direito Penal",
    summary: "Orientação e defesa técnica em matéria penal, com sigilo e responsabilidade.",
    intro: "Em matéria penal, a orientação precoce e a defesa técnica são decisivas para que os direitos da pessoa sejam respeitados em cada etapa.",
  },
  {
    slug: "direito-internacional",
    keyword: "Advogado de direito internacional",
    name: "Internacional",
    title: "Direito Internacional",
    summary: "Questões jurídicas de pessoas e negócios que envolvem mais de um país.",
    intro: "Relações pessoais, patrimoniais e comerciais que ultrapassam fronteiras exigem atenção às regras de cada país envolvido.",
  },
  {
    slug: "contencioso-estrategico",
    keyword: "Contencioso estratégico",
    name: "Contencioso estratégico",
    title: "Contencioso Estratégico",
    summary: "Condução de litígios relevantes, com estratégia definida a partir dos fatos, das provas e dos objetivos envolvidos.",
    intro: "Há conflitos cuja condução exige planejamento desde o primeiro movimento. A estratégia é definida a partir dos fatos, das provas e dos objetivos do cliente.",
  },
];

export const featuredAreas = areas.filter((a) => a.featured);

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
  /** Depoimento real e identificado. Vazio = bloco escondido. */
  testimonial: { quote: "", author: "", role: "" },
  /** Foto em /public. Vazio = bloco sem imagem. */
  photo: "",
  paragraphs: [
    "A história do escritório encontra inspiração na tradição jurídica da família Marchi, com uma referência que merece especial reconhecimento: Dr. João Jair Marchi. Após aposentar-se como Delegado de Polícia, passou a dedicar sua experiência à advocacia, construindo uma trajetória de destaque na região de Limeira e na advocacia paulista pela atuação na defesa dos direitos das pessoas.",
    "Seu legado ocupa um lugar especial nessa construção. A seriedade no exercício profissional, a firmeza na defesa de direitos e o respeito por quem busca orientação jurídica constituem referências para os valores que a Marchi Gomes deseja preservar e transmitir às próximas gerações.",
  ],
};

/**
 * Capitulos da historia. So "1996" e data informada pelo escritorio; os demais
 * marcos nao tem ano porque o documento nao informa. Completar com os socios.
 */
export const timeline = [
  { when: "As origens", title: "A tradição da família Marchi", text: "Depois de se aposentar como Delegado de Polícia, o Dr. João Jair Marchi dedica sua experiência à advocacia e constrói uma trajetória de destaque na região de Limeira." },
  { when: "Antes da sociedade", title: "Dois percursos próprios", text: "Gisele Marchi e Gabriel Gomes desenvolvem suas carreiras com atuação em Administração Pública e bancária. A convivência profissional revela uma afinidade de princípios." },
  { when: "1996", title: "Fundação em Limeira", text: "Nasce a Marchi Gomes Advogados, para atuar tanto na solução de conflitos quanto na organização jurídica das escolhas que os antecedem." },
  { when: "Hoje", title: "Nova identidade, a mesma essência", text: "A marca evolui para refletir o propósito do escritório: tradição, ética e soluções que impulsionam novos caminhos." },
  { when: "Adiante", title: "Crescer com consistência", text: "Ampliar a presença da advocacia preventiva e preservar a proximidade que dá sentido ao trabalho." },
];

/** Passo a passo do primeiro contato, a partir do modo de trabalho descrito pelo escritorio. */
export const firstContact = [
  { title: "Você entra em contato", text: "Pelo WhatsApp ou pelo formulário do site. Basta contar, em poucas linhas, o que está acontecendo. O contato é sigiloso." },
  { title: "Entendemos o contexto", text: "A conversa inicial serve para compreender os seus objetivos, quais interesses precisam ser preservados e o que está em jogo." },
  { title: "Você conhece os caminhos", text: "O escritório apresenta as alternativas disponíveis e as consequências de cada uma, em linguagem clara, para que você tenha informação para decidir." },
  { title: "A estratégia é definida", text: "Com a sua decisão, define-se a estratégia e um responsável pela demanda. Os sócios participam e você recebe comunicações periódicas sobre o andamento." },
];

export const business = {
  title: "Orientação jurídica que cabe na gestão do negócio.",
  lead: "Para o cliente empresarial, a orientação jurídica considera também a operação do negócio, seus compromissos comerciais e os efeitos econômicos das decisões. O objetivo é oferecer recomendações que possam ser compreendidas e aplicadas na gestão da empresa.",
  routine: [
    { title: "Participação dos sócios", text: "Os sócios do escritório acompanham as demandas e participam das definições de estratégia." },
    { title: "Responsável por demanda", text: "Cada assunto tem um responsável definido, para que a empresa saiba a quem recorrer." },
    { title: "Reuniões de acompanhamento", text: "Encontros periódicos para revisar o andamento e antecipar decisões." },
    { title: "Comunicação periódica", text: "Informações regulares sobre cada demanda, com a seriedade e a transparência necessárias." },
  ],
  backoffice: ["Controle de prazos", "Revisão técnica", "Gestão documental", "Proteção de informações", "Critérios de prioridade conforme urgência e complexidade"],
  /** Respostas a VALIDAR com os socios. */
  faqs: [
    { q: "A assessoria é contratada por demanda ou de forma contínua?", a: "Das duas formas. A consultoria pode ser pontual, para uma decisão específica, ou continuada, acompanhando a rotina da empresa. O escopo é definido em contrato, conforme a necessidade." },
    { q: "Como a empresa acompanha as demandas?", a: "Cada assunto tem um responsável definido, com reuniões de acompanhamento e comunicação periódica sobre o andamento." },
    { q: "Os sócios do escritório participam do atendimento?", a: "Sim. A participação dos sócios faz parte do modo de trabalho do escritório, em especial na definição da estratégia." },
    { q: "Como as informações da empresa são protegidas?", a: "Além do sigilo profissional, a organização interna do escritório inclui gestão documental e proteção de informações." },
  ],
  areaSlugs: ["empresarial-e-societario", "contratos", "direito-tributario", "trabalho-e-previdenciario", "bancario-e-financeiro"],
};

export const firstContactChecklist = [
  "Documentos pessoais ou da empresa relacionados ao assunto",
  "Contratos, notificações, e-mails ou mensagens que registrem o que foi combinado",
  "Uma linha do tempo simples: o que aconteceu e quando",
  "O que você espera resolver",
];

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
