import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Mesmo domínio e mesmas URLs (com barra final) do site atual, para não perder posição no Google.
export default defineConfig({
  site: 'https://www.makingnet.com.br',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/obrigado/'),
    }),
  ],
});
