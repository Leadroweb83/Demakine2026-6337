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
    "Assessoria jurídica estratégica para pessoas e empresas nas áreas empresarial, civil, tributária e trabalhista.",

  contact: {
    /** Somente digitos com DDI, ex.: 5511999999999 */
    whatsapp: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
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
export const stats: { value: number; suffix?: string; label: string }[] = [];

/** Socios e advogados. Vazio = secao escondida. Foto em /public/equipe/. */
export const team: { name: string; role: string; oab: string; bio: string; photo: string }[] = [];

export const whatsappMessage =
  "Olá! Vim pelo site e gostaria de falar com a equipe da Marchi Gomes Advogados.";

export const nav = [
  { href: "/#areas", label: "Áreas de atuação" },
  { href: "/#escritorio", label: "O escritório" },
  { href: "/#como-atuamos", label: "Como atuamos" },
  { href: "/#duvidas", label: "Dúvidas" },
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
  /** Para quem e a pagina: orienta a copy e a intencao de busca. */
  audience: string;
  /** Temas tipicos da area. A VALIDAR com o escritorio antes de publicar. */
  topics: string[];
};

export const areas: Area[] = [
  {
    slug: "direito-empresarial",
    name: "Empresarial",
    title: "Direito Empresarial",
    summary: "Segurança jurídica para o crescimento do seu negócio.",
    audience: "Sócios, diretores e empresas em fase de estruturação ou expansão.",
    topics: [
      "Contratos comerciais",
      "Constituição e reorganização societária",
      "Acordos de sócios",
      "Consultoria preventiva para a operação",
    ],
  },
  {
    slug: "direito-civil",
    name: "Civil",
    title: "Direito Civil",
    summary: "Soluções para relações pessoais, patrimoniais e contratuais.",
    audience: "Pessoas e famílias que precisam proteger patrimônio e resolver conflitos.",
    topics: [
      "Contratos e obrigações",
      "Responsabilidade civil",
      "Questões patrimoniais e imobiliárias",
      "Família e sucessões",
    ],
  },
  {
    slug: "direito-tributario",
    name: "Tributário",
    title: "Direito Tributário",
    summary: "Estratégia e eficiência fiscal para o seu patrimônio.",
    audience: "Empresas e pessoas físicas que querem pagar o que é devido, com segurança.",
    topics: [
      "Planejamento tributário",
      "Revisão de tributos pagos",
      "Defesas administrativas e judiciais",
      "Regularização fiscal",
    ],
  },
  {
    slug: "direito-trabalhista",
    name: "Trabalhista",
    title: "Direito Trabalhista",
    summary: "Assessoria completa para empresas e profissionais.",
    audience: "Empresas que querem reduzir passivo e profissionais que buscam orientação.",
    topics: [
      "Consultoria preventiva para empresas",
      "Contratos de trabalho e políticas internas",
      "Defesa em reclamações trabalhistas",
      "Negociações e acordos",
    ],
  },
];

export const approach = [
  {
    title: "Orientação clara e segura",
    text: "Você entende o cenário, os riscos e as alternativas antes de decidir. Sem juridiquês e sem surpresa no meio do caminho.",
  },
  {
    title: "Atendimento personalizado",
    text: "Cada caso é conduzido de perto, por quem conhece a sua história, o seu negócio e o que está em jogo para você.",
  },
  {
    title: "Estratégia jurídica para cada necessidade",
    text: "O caminho é desenhado para o seu objetivo: prevenir, negociar ou litigar, sempre com critério técnico e ética.",
  },
];

/** Respostas a VALIDAR com o escritorio antes de publicar. */
export const faqs = [
  {
    q: "Como funciona o primeiro contato?",
    a: "Você fala com a nossa equipe pelo WhatsApp ou pelo formulário, conta a sua situação e recebe a orientação sobre os próximos passos e os documentos necessários.",
  },
  {
    q: "O escritório atende pessoas físicas e empresas?",
    a: "Sim. Atuamos para pessoas e empresas nas áreas empresarial, civil, tributária e trabalhista.",
  },
  {
    q: "Preciso estar com um processo em andamento para procurar um advogado?",
    a: "Não. Boa parte do trabalho jurídico é preventiva: revisar um contrato, organizar o patrimônio ou ajustar uma rotina da empresa costuma evitar o litígio.",
  },
  {
    q: "As minhas informações ficam protegidas?",
    a: "Sim. O sigilo profissional é dever do advogado e os dados enviados pelo site são usados apenas para retornar o seu contato.",
  },
];
