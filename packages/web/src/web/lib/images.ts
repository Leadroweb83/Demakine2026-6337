import originals from "../data/image-originals.json";

/**
 * Imagens de public/img têm uma versão WebP ao lado (vite/optimize-images.ts roda em todo build).
 * O site usa o WebP; conteúdo salvo no painel com .jpg/.png passa por aqui ao ser juntado.
 */
export function toWebp(src: string): string;
export function toWebp(src: string | undefined): string | undefined;
export function toWebp(src: string | undefined) {
  return src && /^\/img\/.+\.(jpe?g|png)$/i.test(src) ? src.replace(/\.(jpe?g|png)$/i, ".webp") : src;
}

/** Arquivo original (JPG/PNG) para o og:image: nem toda rede aceita WebP no compartilhamento. */
export function shareImage(src: string) {
  if (!/^\/img\/.+\.webp$/i.test(src)) return src;
  return (originals as Record<string, string>)[src] ?? src.replace(/\.webp$/i, ".jpg");
}
