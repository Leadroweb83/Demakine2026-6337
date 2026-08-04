# Site Demakine v2 — status

## Concluído (verificado)
- index.html (Montserrat + DM Sans, SEO/OG base, lang pt-BR)
- schema.ts ampliado (email, city, product) + db:push OK
- api/index.ts POST /leads ampliado — testado 201
- lib/site.ts (contatos por departamento + vagas), lib/content.ts
- components: reveal, seo (head + JSON-LD), counter, lead-form, kit, whatsapp-float
- components/layout: header (busca, menu mobile, CTA), footer, shell
- pages: index, produtos, produto, projetos-especiais, a-empresa, clientes,
  assistencia-tecnica, blog, post, downloads, contato, trabalhe-conosco, admin (atualizado), 404
- app.tsx com todas as rotas (/produtos/:slug, /blog/:slug)
- sitemap.xml (42 URLs) + robots.txt
- public/downloads/catalogo-demakine.pdf
- Hero/fábrica/oficina/projetos trocados por fotos reais de fábrica (a-empresa)
- Fixes: min-w-0 no grid do produto (overflow), colunas "Definir" ocultas na tabela,
  header em 1024px, logo do admin
- bun run build OK · dev server porta 5173 · QA desktop 1440 + mobile 390
- lead de teste removido do banco

## Pendências para o cliente
- Confirmar se mantém aviso "telefone temporariamente indisponível" (hoje NÃO está no site novo)
- Confirmar 7.000 máquinas vs 8.000 clientes
- Sem selos BNDES/FINAME (não confirmados)
- Backup v1 em /home/user/demakine/backup-site-v1
