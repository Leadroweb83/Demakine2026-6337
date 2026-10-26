/**
 * Depoimentos em vídeo da página Clientes.
 *
 * Cada item vira um cartão. Sem `src` nem `youtube`, o cartão aparece como espaço reservado
 * ("em breve"). Quando o vídeo chegar, é só preencher o item:
 *
 *   { name: "Nome do cliente", company: "Empresa", city: "Cidade/UF",
 *     src: "/video/depoimentos/empresa.mp4", poster: "/img/depoimentos/empresa.webp" }
 *
 * ou, se o vídeo estiver no YouTube:  youtube: "ID_DO_VIDEO"
 */
export type VideoTestimonial = {
  name: string;
  company: string;
  city: string;
  /** arquivo de vídeo em public/ (mp4) */
  src?: string;
  /** id de vídeo do YouTube */
  youtube?: string;
  /** imagem de capa (public/) */
  poster?: string;
};

export const videoTestimonials: VideoTestimonial[] = [
  {
    name: "Piscicultura Puro Peixe",
    company: "",
    city: "Santa Clara do Oeste/SP",
    youtube: "fcGIPV8F4WE",
    poster: "/img/depoimentos/puro-peixe.webp",
  },
  {
    name: "Visita pós-venda",
    company: "Demakine",
    city: "",
    youtube: "LildGrx8bDI",
    poster: "/img/depoimentos/visita-pos-venda.webp",
  },
  {
    name: "Esteiras para reciclagem",
    company: "Demakine",
    city: "",
    youtube: "clWrBNdMV6Y",
    poster: "/img/depoimentos/reciclagem.webp",
  },
];
