# Making TI e Marketing Digital: novo site

Reconstrução do site https://www.makingnet.com.br/ em Astro (site estático).
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
- `src/layouts/Base.astro` cabeçalho, rodapé, SEO e dados estruturados (JSON-LD)
- `src/pages/` páginas, com as mesmas URLs do site atual
- `public/img/` imagens otimizadas em WebP

## Pendências

- Direção visual: aguardando referências do cliente (o CSS atual é provisório)
- Blog (cerca de 50 artigos), materiais ricos e contador de caracteres SEO: segunda entrega
- Formulários: definir `PUBLIC_FORM_ENDPOINT`; sem ele, o envio abre o WhatsApp com a mensagem pronta
- Logo em vetor (SVG): o arquivo atual tem só 210 px de largura
- Tags de medição (GA4, Google Ads, Meta) e banner de cookies
