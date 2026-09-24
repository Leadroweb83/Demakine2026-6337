/**
 * Páginas fixas com título e descrição editáveis no painel (SEO > coleção "seo").
 * title/description aqui são só a referência mostrada no painel: o padrão de verdade
 * continua em cada página; se mudar lá, atualize aqui também.
 */
export const STATIC_SEO = [
  { path: "/", label: "Home", title: "Demakine | Esteiras, Roscas, Elevadores e Máquinas de Costurar Sacos", description: "Fábrica de esteiras transportadoras, roscas, elevadores, máquinas de costurar sacos e projetos especiais sob medida. +15 anos e 7.000 máquinas entregues em todo o Brasil. Limeira/SP." },
  { path: "/produtos", label: "Catálogo", title: "Catálogo de Equipamentos | Demakine", description: "Equipamentos agroindustriais: esteiras transportadoras, roscas, elevadores de canecas e de sacaria, máquinas de costurar sacos e peneiras. Especificações, modelos e capacidades." },
  { path: "/agro", label: "Agro", title: "Equipamentos para o Agro: Esteiras, Roscas e Elevadores | Demakine", description: "Linha agro Demakine: esteiras transportadoras, roscas, elevadores de canecas e máquinas de costurar sacos para grãos, fertilizantes, sementes, ração e hortifrúti." },
  { path: "/projetos-especiais", label: "Projetos Especiais", title: "Projetos Especiais: Equipamentos sob medida | Demakine", description: "Esteiras em Z, moegas para big bag, inox sanitário, galvanizadas, com trilho e contador de sacos. Mais de 20 configurações especiais projetadas e entregues pela Demakine." },
  { path: "/a-empresa", label: "A Empresa", title: "A Empresa | Demakine Equipamentos Agroindustriais", description: "Há mais de 15 anos em Limeira/SP, a Demakine fabrica máquinas e equipamentos para a indústria e o agronegócio. Missão, visão, valores e propósito social." },
  { path: "/clientes", label: "Clientes", title: "Nossos Clientes e Depoimentos | Demakine", description: "Indústrias de todos os portes e segmentos em todo o Brasil movimentam sua produção com equipamentos Demakine. Veja clientes e depoimentos reais." },
  { path: "/assistencia-tecnica", label: "Assistência Técnica", title: "Assistência Técnica e SAC | Demakine", description: "Assistência técnica especializada, peças de reposição e parcerias técnicas em todo o Brasil para equipamentos Demakine. Suporte do projeto ao pós-venda." },
  { path: "/ferramentas", label: "Ferramentas", title: "Ferramentas de engenharia: dimensione sua esteira | Demakine", description: "Dimensione o transportador, configure a máquina, calcule o retorno da automação e receba a recomendação do equipamento certo." },
  { path: "/blog", label: "Blog", title: "Blog Demakine | Guias técnicos sobre transporte industrial", description: "Guias completos sobre esteiras e roscas transportadoras, manutenção preventiva, escolha de equipamento e presença da Demakine nas feiras do agronegócio." },
  { path: "/cases", label: "Cases", title: "Aplicações e cases | Demakine", description: "Configurações de equipamento que a Demakine entrega por tipo de operação." },
  { path: "/downloads", label: "Downloads", title: "Central de materiais: catálogo, checklists e guias | Demakine", description: "Baixe o catálogo Demakine, checklists de manutenção e guias técnicos." },
  { path: "/faq", label: "Perguntas frequentes", title: "Perguntas frequentes | Demakine", description: "Prazo, frete, correia, inclinação, instalação, peças de reposição e assistência técnica." },
  { path: "/vagas", label: "Vagas", title: "Vagas | Trabalhe na Demakine", description: "Vagas abertas na fábrica da Demakine em Limeira/SP. Candidate-se online ou cadastre seu currículo no banco de talentos." },
  { path: "/contato", label: "Contato", title: "Contato | Demakine Equipamentos Agroindustriais", description: "Fale com a Demakine por telefone, WhatsApp ou e-mail. Contatos por departamento, endereço da fábrica em Limeira/SP e formulário de orçamento." },
] as const;

/** Chave do documento de SEO para um caminho: "/" vira "home", "/a-empresa" vira "a-empresa". */
export function seoKey(path: string) {
  const p = path.split("?")[0]!.replace(/^\/+|\/+$/g, "");
  return p ? p.replace(/[^a-z0-9]+/gi, "-").toLowerCase() : "home";
}
