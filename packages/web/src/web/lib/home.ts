import { editedDoc } from "./runtime-content";

export type BestSellerSlide = { slug: string; lines: [string, string]; tab: string };

/** Textos da home editáveis no painel (coleção "home", chave "main"). */
export type HomeData = {
  heroText: string;
  heroWords: string[];
  agroLink: string;
  bestSellers: BestSellerSlide[];
};

export const HOME_DEFAULTS: HomeData = {
  heroText:
    "Esteiras transportadoras, roscas, elevadores, máquinas de costurar sacos e projetos especiais fabricados sob medida na nossa fábrica em Limeira/SP. Menos gente carregando no braço, mais produtividade na linha.",
  heroWords: ["grãos", "fertilizantes", "reciclagem", "construção", "alimentos"],
  agroLink: "É do agro? Veja a linha para grãos, fertilizantes e ração",
  bestSellers: [
    { slug: "esteira-transportadora-para-sacaria", lines: ["Esteira para", "sacaria e fardos"], tab: "Sacaria" },
    { slug: "esteira-transportadora-para-granel", lines: ["Esteira em V", "para granel"], tab: "Granel" },
    { slug: "esteira-transportadora-horizontal", lines: ["Esteira", "horizontal"], tab: "Horizontal" },
    { slug: "rosca-transportadora", lines: ["Rosca", "transportadora"], tab: "Rosca" },
  ],
};

const edit = editedDoc<HomeData>("home", "main");

export const home: HomeData = {
  ...HOME_DEFAULTS,
  ...edit,
  heroWords: edit?.heroWords?.length ? edit.heroWords : HOME_DEFAULTS.heroWords,
  bestSellers: edit?.bestSellers?.length ? edit.bestSellers : HOME_DEFAULTS.bestSellers,
};
