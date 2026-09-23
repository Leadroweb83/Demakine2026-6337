import { editedDoc } from "./runtime-content";

export type Department = { name: string; phone: string; email: string };

/** Dados da empresa. O painel (Dados do site) pode sobrescrever qualquer campo. */
export type SiteData = {
  name: string;
  legal: string;
  tagline: string;
  url: string;
  email: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  cnpj: string;
  address: string;
  addressShort: string;
  hours: { monThu: string; fri: string };
  social: { facebook: string; instagram: string; linkedin: string; youtube: string };
  stats: { years: number; machines: number; clients: number; rating: number };
  departments: Department[];
};

const DEFAULTS: SiteData = {
  name: "Demakine",
  legal: "Demakine Equipamentos Agroindustriais",
  tagline: "A Indústria em movimento",
  url: "https://www.demakine.com.br",
  email: "vendas@demakine.com.br",
  phone: "(19) 3033-9397",
  mobile: "(19) 99884-2717",
  whatsapp: "5519998842717",
  // Enquanto estiver vazio, o bloco institucional do rodapé não exibe a linha de CNPJ.
  cnpj: "",
  address: "Rua Silvino del Pietro, 212, Jd. Nova Limeira, Limeira/SP",
  addressShort: "Limeira / SP",
  hours: { monThu: "07h30 às 17h30", fri: "07h30 às 16h30" },
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
  departments: [
    { name: "Vendas", phone: "(19) 99884-2717", email: "vendas@demakine.com.br" },
    { name: "Assistência Técnica", phone: "(19) 99941-4129", email: "qualidade@demakine.com.br" },
    { name: "Compras", phone: "(19) 98888-1050", email: "compras@demakine.com.br" },
    { name: "Logística", phone: "(19) 98757-5273", email: "adm@demakine.com.br" },
    { name: "Financeiro", phone: "(19) 98888-5030", email: "financeiro@demakine.com.br" },
    { name: "Fiscal", phone: "(19) 98935-6672", email: "fiscal@demakine.com.br" },
    { name: "RH e Recrutamento", phone: "(19) 97141-0499", email: "rh@demakine.com.br" },
    { name: "Marketing", phone: "(19) 99893-6063", email: "marketing@demakine.com.br" },
  ],
};

export const SITE_DEFAULTS = DEFAULTS;

const telHref = (phone: string) => `tel:+55${phone.replace(/\D/g, "")}`;

function buildSite(edit: Partial<SiteData> | undefined) {
  const d = { ...DEFAULTS, ...edit };
  d.hours = { ...DEFAULTS.hours, ...edit?.hours };
  d.social = { ...DEFAULTS.social, ...edit?.social };
  d.stats = { ...DEFAULTS.stats, ...edit?.stats };
  d.departments = edit?.departments?.length ? edit.departments : DEFAULTS.departments;
  const maps = encodeURIComponent(d.address.replace(/,/g, " -"));
  return {
    ...d,
    phoneHref: telHref(d.phone),
    mobileHref: telHref(d.mobile),
    hoursLine: `Seg a Qui ${d.hours.monThu} · Sex ${d.hours.fri}`,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${maps}`,
    mapsDirections: `https://www.google.com/maps/dir/?api=1&destination=${maps}`,
    mapsEmbed: `https://www.google.com/maps?q=${maps}&z=15&output=embed`,
  };
}

export const site = buildSite(editedDoc<SiteData>("site", "main"));

export function waLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const departments = site.departments;

export const nav = [
  { label: "Home", to: "/" },
  { label: "Produtos", to: "/produtos" },
  { label: "Agro", to: "/agro" },
  { label: "Projetos Especiais", short: "Projetos", to: "/projetos-especiais" },
  { label: "Ferramentas", to: "/ferramentas" },
  { label: "A Empresa", to: "/a-empresa" },
  { label: "Clientes", to: "/clientes" },
  { label: "Assistência Técnica", short: "Assistência", to: "/assistencia-tecnica" },
  { label: "Blog", to: "/blog" },
  { label: "Vagas", to: "/vagas" },
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
