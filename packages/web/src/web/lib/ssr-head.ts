/**
 * Cabeçalho coletado durante a pré-renderização (vite/prerender.ts). No navegador fica nulo e o
 * componente Seo escreve direto em document.head; no build, os efeitos não rodam, então o Seo
 * registra aqui o que a página declarou e o script monta as tags no HTML.
 */
export type SsrHead = {
  title?: string;
  meta: Map<string, { attr: "name" | "property"; content: string }>;
  canonical?: string;
  alternates: { hreflang: string; href: string }[];
  jsonLd: unknown[];
  htmlLang?: string;
  /** imagem principal (LCP) que o React não detecta sozinho, como a capa de um vídeo */
  preloadImage?: string;
};

let current: SsrHead | null = null;

export function beginSsrHead(): SsrHead {
  current = { meta: new Map(), alternates: [], jsonLd: [] };
  return current;
}

export function ssrHead(): SsrHead | null {
  return current;
}
