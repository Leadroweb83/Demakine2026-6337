import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Mesmo domínio e mesmas URLs (com barra final) do site atual, para não perder posição no Google.
export default defineConfig({
  site: 'https://www.makingnet.com.br',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/obrigado/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
