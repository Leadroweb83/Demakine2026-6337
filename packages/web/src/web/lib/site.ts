export const site = {
  name: "Demakine",
  legal: "Demakine Equipamentos Agroindustriais",
  tagline: "A Indústria em movimento",
  url: "https://www.demakine.com.br",
  email: "vendas@demakine.com.br",
  phone: "(19) 3033-9397",
  phoneHref: "tel:+551930339397",
  mobile: "(19) 99884-2717",
  mobileHref: "tel:+5519998842717",
  whatsapp: "5519998842717",
  // CNPJ: preencher com o numero oficial confirmado pelo cliente.
  // Enquanto estiver vazio, o bloco institucional do rodape nao exibe a linha de CNPJ.
  cnpj: "" as string,
  address: "Rua Silvino del Pietro, 212, Jd. Nova Limeira, Limeira/SP",
  addressShort: "Limeira / SP",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rua+Silvino+del+Pietro,+212+-+Jd.+Nova+Limeira+-+Limeira+SP",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Rua+Silvino+del+Pietro,+212+-+Jd.+Nova+Limeira+-+Limeira+SP",
  mapsEmbed:
    "https://www.google.com/maps?q=Rua+Silvino+del+Pietro,+212+-+Jd.+Nova+Limeira+-+Limeira+SP&z=15&output=embed",
  social: {
    facebook: "https://www.facebook.com/demakineindustrial/",
    instagram: "https://instagram.com/demakineindustrial",
    linkedin: "https://www.linkedin.com/company/demakineagroindustrial/",
    youtube: "https://www.youtube.com/@demakineindustrial",
  },
  stats: {
    years: 15,
    machines: 7000,
    clients: 8000,
    rating: 4.9,
  },
} as const;

export function waLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const departments = [
  { name: "Vendas", phone: "(19) 99884-2717", email: "vendas@demakine.com.br" },
  { name: "Assistência Técnica", phone: "(19) 99941-4129", email: "qualidade@demakine.com.br" },
  { name: "Compras", phone: "(19) 98888-1050", email: "compras@demakine.com.br" },
  { name: "Logística", phone: "(19) 98757-5273", email: "adm@demakine.com.br" },
  { name: "Financeiro", phone: "(19) 98888-5030", email: "financeiro@demakine.com.br" },
  { name: "Fiscal", phone: "(19) 98935-6672", email: "fiscal@demakine.com.br" },
  { name: "RH e Recrutamento", phone: "(19) 97141-0499", email: "rh@demakine.com.br" },
  { name: "Marketing", phone: "(19) 99893-6063", email: "marketing@demakine.com.br" },
] as const;

export const jobs = [
  {
    title: "Ajudante de Produção",
    area: "Produção",
    type: "Efetivo · Limeira/SP",
    desc: "Apoio na montagem, movimentação de materiais e organização do setor produtivo.",
  },
  {
    title: "Montador Soldador",
    area: "Produção",
    type: "Efetivo · Limeira/SP",
    desc: "Leitura de desenho técnico, montagem de estruturas e solda MIG/eletrodo.",
  },
  {
    title: "Vendedor",
    area: "Comercial",
    type: "Efetivo · Limeira/SP",
    desc: "Atendimento técnico-comercial, prospecção e acompanhamento de propostas.",
  },
] as const;

export const nav = [
  { label: "Home", to: "/" },
  { label: "Produtos", to: "/produtos" },
  { label: "Agro", to: "/agro" },
  { label: "Projetos Especiais", to: "/projetos-especiais" },
  { label: "Ferramentas", to: "/ferramentas" },
  { label: "A Empresa", to: "/a-empresa" },
  { label: "Clientes", to: "/clientes" },
  { label: "Assistência Técnica", to: "/assistencia-tecnica" },
  { label: "Blog", to: "/blog" },
  { label: "Contato", to: "/contato" },
] as const;

export const segments = [
  "Alimentício",
  "Agronegócio",
  "Reciclagem",
  "Metalúrgico",
  "Farmacêutico",
  "Plástico e Embalagens",
  "Logística e Armazenagem",
  "Automotivo",
  "Bioenergia",
  "Celulose e Papel",
  "Construção",
  "Cooperativas",
] as const;
