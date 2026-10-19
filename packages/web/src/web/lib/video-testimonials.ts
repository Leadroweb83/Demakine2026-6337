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
  { name: "", company: "", city: "" },
  { name: "", company: "", city: "" },
  { name: "", company: "", city: "" },
];
