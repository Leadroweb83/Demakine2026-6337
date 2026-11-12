# Making TI e Marketing Digital: novo site

Reconstrução do site https://www.makingnet.com.br/ em Astro (site estático), com React, Tailwind CSS v4 e TypeScript para os componentes animados.
Projeto isolado: não compartilha código nem dependências com o restante deste repositório.

## Rodar

```bash
cd makingnet
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
```

## Estrutura

- `src/data/` conteúdo: dados da empresa, serviços, Velosys, clientes e portfólio (migrados do site atual)
- `src/components/ui/` componentes React no padrão shadcn (alias `@/components/ui`): hero com troca de frente de atuação (GSAP) e túnel 3D do portfólio (Framer Motion)
- `src/styles/` `tailwind.css` (entrada) e `global.css` (tema escuro e estilos base)
- `public/img/tema/` fotos espaciais do Unsplash (licença livre)
- `src/data/blog/` 265 artigos migrados (um JSON por artigo); `tools/migrar-blog.py` refaz a migração a partir do WordPress
- `vercel.json` redirecionamentos 301 das URLs antigas do blog (`/slug/` para `/blog/slug/`)
- `src/layouts/Base.astro` cabeçalho, rodapé, SEO e dados estruturados (JSON-LD)
- `src/pages/` páginas, com as mesmas URLs do site atual
- `public/img/` imagens otimizadas em WebP

## Pendências

- Contador de caracteres SEO (ferramenta do site atual) ainda não foi recriado
- Newsletter do rodapé antigo: definir a ferramenta de envio
- Formulários: definir `PUBLIC_FORM_ENDPOINT`; sem ele, o envio abre o WhatsApp com a mensagem pronta
- Logo em vetor (SVG): o arquivo atual tem só 210 px de largura
- Tags de medição (GA4, Google Ads, Meta) e banner de cookies
