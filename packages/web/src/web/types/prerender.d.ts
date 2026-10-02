/** Marca deixada no HTML pela pré-renderização (vite/prerender.ts). */
type DemakineSsrBoot = {
  /** idioma em que o HTML foi gerado (ausente = português) */
  locale?: "pt" | "en" | "es";
  /** versão do conteúdo do painel usada no build */
  version: string;
  /** cache do React Query já preenchido no build (vagas) */
  queries?: unknown;
};

declare global {
  interface Window {
    __DM_SSR__?: DemakineSsrBoot;
  }
}
export {}
