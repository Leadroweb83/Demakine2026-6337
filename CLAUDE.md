# Demakine: guia do projeto

Site e painel administrativo da Demakine (www.demakine.com.br). Responda sempre em português do Brasil.

## Negócio

- Fábrica de máquinas e equipamentos para indústria e agronegócio, em Limeira/SP (Rua Silvino del Pietro, 212).
- Linhas de produto: esteiras transportadoras, roscas transportadoras, elevadores (canecas e sacaria), empacotamento e costura de sacaria (inclui a peneira empacotadora para carvão e o Mini Sistema de Costura). Também faz projetos especiais sob medida.
- Números usados no site e no catálogo: 14 anos, 7000+ equipamentos entregues, 8000+ clientes, nota 4.9 no Google. A fonte é `packages/web/src/web/lib/site.ts`. Não invente número novo.
- Missão (texto oficial): "Desenvolver soluções com excelência na fabricação de máquinas e equipamentos para os setores da indústria e do agronegócio."
- Site em 3 idiomas: português (principal), inglês e espanhol. As páginas de categoria e as comerciais com URL própria existem só em português.
- Meta do site: gerar pedidos de orçamento (leads) por formulário e WhatsApp, e aparecer bem no Google e nas buscas de IA.

## Stack

- Monorepo com Bun workspaces. O app fica em `packages/web`.
- Front: Vite 7, React 19, wouter, Tailwind 4. Runtime de JSX próprio em `@/i18n-jsx` (traduções com `tr()`).
- API: Hono em `packages/web/src/api` (rotas encadeadas, cliente tipado `api`). Autenticação com Better Auth.
- Banco: Postgres no Supabase, acessado com Drizzle. RLS ligado nas tabelas. Migrações em `packages/web/drizzle/`.
- Arquivos: bucket do Supabase via S3 (fotos de lead). E-mail: Resend.
- Hospedagem: Vercel, projeto `demakine`. Produção é a branch `main`. Cada PR gera um preview.
- Build: `vite build`, depois build SSR e `prerender.ts`, que gera as páginas estáticas. Veja `buildCommand` em `packages/web/vercel.json`.
- Crons na Vercel (`vercel.json`), protegidos por `CRON_SECRET`: `/api/cron/diario`, `/api/cron/seo`, `/api/cron/seo-duelo`.

## Comandos (rodar em `packages/web`)

```bash
bun install
bunx vite                 # dev em http://localhost:5173
bun run typecheck
bun run lint              # oxlint com --deny-warnings
bun test                  # suíte completa
```

Para os testes que dependem de `dist/`, rode antes o build completo de 3 passos (`vite build && vite build --ssr src/web/entry-server.tsx --outDir dist-ssr && bun vite/prerender.ts`). Só `vite build` apaga as páginas pré-renderizadas e quebra esses testes.

## Estrutura

- `packages/web/src/web`: páginas (`pages/`), componentes, dicionários (`i18n/`), dados do catálogo (`data/content.json`), painel admin (`admin/`).
- `packages/web/src/api`: rotas, middleware de papéis (`middleware/roles.ts`), banco e libs. A área SEO e GEO está em `lib/seo/` e `seo-routes.ts`.
- `packages/web/tests`: testes com `bun test`. A área SEO e GEO tem a pasta `tests/seo/`.
- `packages/web/public`: imagens, PDFs (`downloads/`), `robots.txt`.
- `docs/superpowers/`: especificações e planos já escritos (SEO e GEO do painel).
- `design.md`: identidade visual (paleta, tipografia, componentes). Siga esse arquivo.
- `plano-admin.md`: papéis e permissões do painel.

## Papéis do painel

`super_admin` (único que cria usuários e vê chaves), `admin` e `editor`. A permissão é checada no servidor, nunca só escondendo botão. A área "SEO e GEO" é só do `super_admin`.

## Como trabalhar aqui

1. Crie uma branch a partir da `main` e abra um PR. Não commite na `main`.
2. Escreva o teste antes do código e rode `bun test`, `bun run typecheck` e `bun run lint` antes de pedir revisão.
3. Confira o **preview da Vercel** antes do merge. Em 10/11/2026 uma mudança em `middleware.ts` e `vercel.json` derrubou o site. Mudança nesses dois arquivos exige teste no preview.
4. O merge na `main` publica em produção. Só o dono do projeto autoriza o merge.
5. Migração de banco em produção (Supabase) só com confirmação do dono. Hoje ela é aplicada no SQL Editor do Supabase, e o arquivo vai junto no PR.
6. Mexer em DNS, variáveis da Vercel e painel do Supabase também pede confirmação.
7. Copy em português passa pelo `stop-slop-pt-br` (sem vícios de texto de IA). Todo texto novo precisa de tradução em `i18n/en.json` e `i18n/es.json`.
8. Antes de lançar algo com dados de usuário, passe pelo checklist de segurança (chaves fora do front, RLS, validação no servidor, rate limit, cookies seguros, CSP).

## Variáveis de ambiente

Nunca coloque valores no repositório nem em chat. Os nomes em uso:

`NODE_ENV`, `WEBSITE_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `VISITS_SALT`, `DEPLOY_HOOK_URL`.

Quem for convidado no projeto da Vercel puxa os valores sozinho (`vercel env pull`). O modelo está em `.env.template`.

## Site antigo e DNS

- O site anterior era WordPress na Locaweb. O DNS do domínio fica na Locaweb (nameservers `ns1`, `ns2`, `ns3`), e a raiz e o `www` apontam para a Vercel.
- O e-mail da empresa usa a Locaweb. **Não altere os registros MX e TXT** (SPF) do domínio.
- Redirecionamentos 301 das URLs do site antigo ficam em `vercel.json` e no painel (Redirecionamentos). Não crie cadeias de redirect.

## Estado em 16/11/2026

- No ar: painel com a área SEO e GEO (auditor, páginas, regras, links, URLs antigas, imagens, dados estruturados, dicas), o duelo "Guerra é Guerra" com concorrentes (PR #23, mergeado em 16/11) e o aviso de consentimento de cookies.
- Em PR, aguardando revisão: aceitar o endereço do concorrente sem `https://` (PR #24) e o botão **Corrigir** do duelo, com tela de antes e depois e **Copiar prompt** em JSON. Esse último traz a migração `0019_seo_correcoes.sql`, que o dono aplica no SQL Editor do Supabase **antes** do merge.
- Site antigo (WordPress na Locaweb): cópia de consulta em `antigo.demakine.com.br`, com `noindex`. Não é o site de produção.
- Planejado: Etapa 2B (velocidade), 3 (Google Analytics e Search Console), 4 (IA). Ver `docs/superpowers/`.
- Pendente do dono: ajustes do documento "Ajustes Site - 05/11" (lista de equipamentos do rodapé).
- Este arquivo envelhece. Confira os PRs abertos no GitHub antes de assumir o estado.
