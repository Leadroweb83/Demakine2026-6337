import { StrictMode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider, dehydrate } from "@tanstack/react-query";
import App from "./app";
import { beginSsrHead } from "./lib/ssr-head";

/**
 * Pré-renderização (vite/prerender.ts): mesma árvore de main.tsx, com o endereço fixo e o cache
 * do React Query já preenchido. O conteúdo do painel precisa estar em globalThis.__DM_CONTENT__
 * antes de este módulo ser importado (content.ts e site.ts leem na primeira avaliação).
 * As páginas são carregadas sob demanda (lazy), então espera tudo ficar pronto (allReady).
 */
export async function render(path: string, search: string, prefill: [unknown[], unknown][] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  for (const [key, data] of prefill) queryClient.setQueryData(key, data);
  const head = beginSsrHead();
  const stream = await renderToReadableStream(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router ssrPath={path} ssrSearch={search}>
          <App />
        </Router>
      </QueryClientProvider>
    </StrictMode>,
    {
      onError: (err) => {
        throw err;
      },
    },
  );
  await stream.allReady;
  const html = await new Response(stream).text();
  return { html, head, queries: dehydrate(queryClient) };
}
