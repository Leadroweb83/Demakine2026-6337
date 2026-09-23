# Rodada 12 — Fase 1 do painel (auth + papéis + shell)

## Decisões aprovadas
- Um único super admin criado por mim: Leandro / leandroweb83@gmail.com. Ele cria os demais no painel.
- 4 papéis: super_admin, admin, editor, vendedor (vendedor = só leads e vagas).
- Site 100% administrável (fase 3), área de vagas (fase 4), imagens/mídia (seção 4B do plano), 30 ideias aprovadas.
- Plano v2 entregue em `plano-admin.md`.

## Feito nesta rodada
- [x] `bun add better-auth@1.6.19` em packages/web
- [x] `src/api/auth.ts` — email/senha, disableSignUp, campos extra role/active/mustChangePassword, ROLES
- [x] `auth-schema.ts` gerado pelo CLI (com `set -a; . ../../.env` — `bun --env-file` NÃO funciona no jiti), re-export em schema.ts, `db:push` OK
- [x] `src/api/middleware/auth.ts` — authMiddleware, requireAuth, requireRole(...roles) (super_admin sempre passa)
- [x] `src/api/lib/users.ts` — createPanelUser (ctx.internalAdapter + ctx.password.hash), setUserPassword, randomPassword, isRole
- [x] `src/api/index.ts` reescrito: auth montado antes do basePath; removidos /admin/login, /admin/logout antigos; /admin/me agora devolve user; /admin/leads e /admin/attachment com requireRole('admin','vendedor'); novos /admin/overview, /admin/change-password, /admin/users (GET/POST), PATCH /admin/users/:id, POST /admin/users/:id/password (só super_admin via requireRole())
- [x] `src/web/lib/auth.ts` — authClient better-auth/react com bearer em localStorage (iframe), ROLE_LABEL, can()
- [x] `src/web/lib/api.ts` — manda Authorization Bearer
- [x] `src/web/admin/ui.tsx` — Card, PageTitle, Btn, Field, inputCls, Badge, Stat, BarList, ColumnChart
- [x] `src/web/admin/login.tsx` — login por e-mail e senha
- [x] `src/web/admin/overview.tsx` — stats + gráfico de colunas (leads/mês) + barras (origens)
- [x] `src/web/admin/leads.tsx` — tabela com busca e filtro de origem + AttachmentCell

## Também concluído
- [x] `src/web/admin/users.tsx` — criar usuário, trocar papel inline, ativar/desativar, gerar nova senha
- [x] `src/web/admin/account.tsx` — trocar senha (banner de senha provisória, abre nessa seção no 1º acesso)
- [x] `pages/admin.tsx` — shell: sidebar recolhível (desktop) + drawer com overlay (mobile), menu filtrado por papel, itens de fase futura marcados "FASE", CasesPending virou seção
- [x] Seed: super admin criado — Leandro / leandroweb83@gmail.com, senha provisória gerada (SUPER_ADMIN_PASSWORD não foi enviado no form de secret), mustChangePassword=true. Script: `packages/web/seed-superadmin.ts`
- [x] ADMIN_PASSWORD removido do .env (login antigo de senha única não existe mais)
- [x] CookieConsent não renderiza em /admin (o banner z-[70] interceptava o clique no menu mobile)
- [x] ColumnChart: coluna precisa de `h-full justify-end`, senão a barra fica com altura 0

## QA feito (aprovado)
- curl: sign-in 200 + set-auth-token; /admin/me com role; editor 403 em /admin/leads e /admin/users; vendedor 200 em leads e 403 em users; sign-up público 400 (disableSignUp); sem token 401
- Playwright chrome 1440x900 e 390x844: login OK, todas as seções abrem, drawer mobile abre e fecha, menu oculta o que o papel não pode ver, zero erro de console, zero imagem quebrada
- Usuários de teste (@teste.local) apagados; restou só o super admin
- Site público segue 200 em /, /loja, /produtos, /cases

## Cuidados
- Porta 4200 serve o dist: sempre `bun run build`.
- Mudança em src/api exige `bunx pm2 restart web-app`.
- Nunca chamar app_init.
