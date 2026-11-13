import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Marchi Gomes Advogados";

export default function Image() {
  return ogImage("Seu patrimônio, seus negócios e seus planos em boas mãos.");
}
