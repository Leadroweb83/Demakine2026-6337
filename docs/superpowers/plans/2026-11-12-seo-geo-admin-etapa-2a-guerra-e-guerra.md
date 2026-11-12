# SEO e GEO no painel, Etapa 2A: "Guerra é Guerra" (duelo com concorrentes) — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma aba "Guerra é Guerra" em SEO e GEO onde o super admin cadastra até 2 concorrentes, o painel lê as páginas públicas deles (até 40 por site), compara com a Demakine na mesma régua e mostra onde a Demakine está melhor e pior, com uma lista "o que fazer para ganhar".

**Architecture:** Um rastreador externo seguro (`crawl-external.ts`) busca só páginas públicas, respeitando `robots.txt`, 1 requisição por segundo, https e sem endereços internos. Os fatos de cada página reaproveitam `extractFacts` (Etapa 1). Funções puras calculam as métricas comparáveis, o placar e a lista de ações. O duelo roda em lotes retomáveis (como o auditor) e guarda o resultado em `seo_duels`. Rotas novas sob o mesmo guarda `requireRole()` (só super admin). Cron semanal novo.

**Tech Stack:** Bun, Hono (RPC tipado), Drizzle + Postgres, React 19, Tailwind 4, `bun test`. Sem dependência nova.

**Spec:** `docs/superpowers/specs/2026-11-11-seo-geo-admin-design.md` (item D1 e item 3 das observações). Base: PR #22 (Etapa 1), que este plano estende.

## Fora desta parte (decidido por mim, o Leandro pode mudar)

- **Velocidade (PageSpeed) do concorrente:** não entra aqui. Precisa de chave da API do Google e de cota; vira a parte 2B junto com o painel de velocidade da Demakine.
- **IA (D3), posições no Google (D2), backlinks e tráfego do concorrente:** ficam em outras etapas ou exigem ferramenta paga.

## Global Constraints

- **Acesso:** só `super_admin`; toda rota nova usa `requireRole()` sem argumentos (o teste de permissões da Etapa 1 enumera as rotas `/admin/seo*` e passa a cobrir as novas sozinho).
- **Só páginas públicas, com educação:** respeitar o `robots.txt` do concorrente (se bloquear o nosso robô, o site é pulado e o painel avisa); no máximo **1 requisição por segundo** por site; `User-Agent: DemakineSEOAuditor/1.0`; no máximo **40 páginas** por concorrente; tempo limite de 15 s por requisição; corpo até 3 MB; não guarda nem copia o texto das páginas (só números e tipos).
- **Segurança (SSRF):** o endereço do concorrente vem do painel, então toda requisição e todo redirecionamento passam por `assertPublicUrl`: só `https:`, sem usuário nem porta, host com ponto, o nome resolve só para IP público (recusa `10.*`, `172.16-31.*`, `192.168.*`, `127.*`, `169.254.*`, `0.*`, `::1`, `fc00::/7`, `fe80::/10`, IPv4 embutido em IPv6) e o IP usado na conexão é o mesmo validado. Mesmo domínio do concorrente em redirecionamentos (sem sair do site dele). Não seguir mais de 5 redirecionamentos.
- **Sem segredo novo.** Usa o `CRON_SECRET` que já existe no cron.
- **Máximo 2 concorrentes ativos.** Trocar um apaga o duelo dele (o histórico fica 12 duelos).
- **Texto para o usuário:** português do Brasil, direto, sem travessão.
- **Entrega:** migração SQL só é aplicada em produção com a confirmação do Leandro; o `vercel.json` (cron semanal) só vai para o ar depois de testado no preview; commit e push só depois do "pode subir"; merge só depois do "pode fazer o merge".

## Review Focus

1. **Endereço interno ou perigoso** (`https://127.0.0.1`, `https://localhost`, IP em decimal ou hexadecimal, domínio que resolve para IP privado, redirecionamento para fora do site do concorrente): recusado antes de qualquer conexão (testado em `crawl-external.test.ts`).
2. **`robots.txt` do concorrente bloqueando o robô** ou fora do ar (404 conta como "tudo liberado", 5xx conta como "não consegui ler" e o site é pulado): o duelo avisa e não trava (testado em `crawl-external.test.ts`).
3. **Duelo interrompido no meio** (limite de tempo da função): a próxima chamada continua de onde parou, sem refazer páginas e sem gravar placar com páginas faltando (testado em `run-duel.test.ts`).
4. **Comparação injusta:** a Demakine e o concorrente são pontuados pela mesma função, só com os itens que dá para medir no site de fora (nada de links recebidos nem de dado esperado por tipo de página); item que um dos lados não tem sai da comparação, não vira 0 (testado em `metrics.test.ts`).
5. **Concorrente com pouquíssimas páginas ou sitemap quebrado:** descobrir páginas por links da home quando o sitemap falha; se não achar nenhuma, o duelo mostra "não foi possível ler este site" em vez de nota 0 (testado em `run-duel.test.ts`).

---

### Task 1: Tabelas dos concorrentes e dos duelos

**Files:**
- Modify: `packages/web/src/api/database/schema.ts`
- Create: `packages/web/drizzle/0018_seo_duelo.sql` (gerado com `drizzle-kit generate`, mais `ENABLE ROW LEVEL SECURITY` nas duas)
- Test: `packages/web/tests/seo/duel-schema.test.ts`

**Interfaces:**
- Produces: `seoCompetitors` (`id serial`, `name text`, `url text` = origem `https://host`, `active boolean`, `createdAt`) e `seoDuels` (`id serial`, `startedAt`, `finishedAt nullable`, `status` `'em-andamento'|'completa'`, `state jsonb` = andamento por concorrente, `result jsonb nullable` = placar final).

- [ ] **Step 1: Write the failing test:** colunas das duas tabelas existem; a migração tem `CREATE TABLE` e `ENABLE ROW LEVEL SECURITY` para `seo_competitors` e `seo_duels`.
- [ ] **Step 2: Run** `cd packages/web && bun test tests/seo/duel-schema.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** as tabelas e gerar a migração.
- [ ] **Step 4: Run** o teste e `bun run typecheck` — Expected: PASS.

### Task 2: Rastreador externo seguro

**Files:**
- Create: `packages/web/src/api/lib/seo/crawl-external.ts`
- Test: `packages/web/tests/seo/crawl-external.test.ts`

**Interfaces:**
- Produces:
  - `assertPublicUrl(url: string, resolve?: (host: string) => Promise<string[]>): Promise<URL>` (lança `Error("Endereço não permitido")`)
  - `isPublicIp(ip: string): boolean`
  - `parseRobots(text: string, agent: string): { allows(path: string): boolean; sitemaps: string[]; crawlDelayMs: number | null }`
  - `fetchExternal(url: string, opts: { origin: string; fetchImpl?: typeof fetch; resolve?: ...; now?: () => number; sleep?: (ms: number) => Promise<void> }): Promise<{ status: number; html: string; finalUrl: string }>` (cada chamada espera para manter 1 requisição por segundo por origem; redirecionamento só dentro do mesmo host)
  - `discoverPages(origin: string, deps): Promise<{ paths: string[]; source: 'sitemap' | 'home' | 'nenhuma'; lastmods: Record<string, string> }>` (lê o sitemap pelo `robots.txt` ou `/sitemap.xml`, segue um nível de sitemap-índice; sem sitemap, usa links da home; devolve no máximo 40 caminhos escolhidos por prioridade: home, categorias (poucos segmentos), produtos, blog)

- [ ] **Step 1: Write the failing tests:** `isPublicIp` recusa `127.0.0.1`, `10.1.2.3`, `172.16.0.1`, `192.168.1.1`, `169.254.169.254`, `0.0.0.0`, `::1`, `fc00::1`, `fe80::1`, `::ffff:10.0.0.1` e aceita `8.8.8.8`; `assertPublicUrl` recusa `http://`, `https://user:x@a.com`, `https://a.com:8443`, `https://localhost`, `https://2130706433` (IP em decimal), `https://0x7f.1`, um domínio cujo `resolve` devolve IP privado e um que devolve um IP público e outro privado; `parseRobots` respeita `User-agent: *` e `DemakineSEOAuditor`, `Disallow: /` bloqueia tudo, `Allow` mais específico vence, `Crawl-delay` vira milissegundos, sem arquivo (404) libera tudo; `fetchExternal` com `sleep` falso espera ao menos 1000 ms entre duas chamadas da mesma origem, não segue redirecionamento para outro host, recusa corpo acima de 3 MB; `discoverPages` com sitemap de 120 URLs devolve 40 com a home primeiro, usa os links da home quando o sitemap dá 404 e devolve `source: 'nenhuma'` quando nada funciona.
- [ ] **Step 2: Run** `bun test tests/seo/crawl-external.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** o arquivo. `resolve` padrão usa `node:dns/promises` (`lookup` com `all: true`). A conexão usa o IP validado (sem segunda resolução).
- [ ] **Step 4: Run** o teste — Expected: PASS.

### Task 3: Métricas comparáveis e placar

**Files:**
- Create: `packages/web/src/api/lib/seo/duel-metrics.ts`
- Test: `packages/web/tests/seo/duel-metrics.test.ts`

**Interfaces:**
- Consumes: `PageFacts` (Etapa 1).
- Produces:
  - `type MetricId = 'titulo' | 'descricao' | 'h1' | 'conteudo' | 'imagens' | 'schema' | 'idiomas' | 'compartilhamento' | 'tamanho' | 'blog'`
  - `type SiteMetrics = { pages: number; scores: Partial<Record<MetricId, number>>; samples: number }` (cada nota de 0 a 100, média das páginas lidas; `tamanho` = número de páginas do sitemap; `blog` = posts publicados nos últimos 90 dias pelo `lastmod`)
  - `function siteMetrics(pages: { path: string; facts: PageFacts }[], sitemap: { total: number; blogLastmods: string[] }, today: string): SiteMetrics`
  - `type Verdict = { metric: MetricId; ours: number; theirs: number; diff: number; result: 'melhor' | 'pior' | 'empate' }`
  - `function compare(ours: SiteMetrics, theirs: SiteMetrics): Verdict[]` (empate até 3 pontos de diferença; métrica ausente de um dos lados sai da lista)
  - `function scoreboard(v: Verdict[]): { better: number; worse: number; tie: number }`

- [ ] **Step 1: Write the failing tests:** título de 30 a 60 caracteres vale 100 e fora disso cai linear (mesma lógica de `scorePage`); `conteudo` mede palavras (300 ou mais = 100); `imagens` é a fração com alt; `schema` conta tipos distintos (3 ou mais = 100); `idiomas` conta hreflang distintos (3 ou mais = 100); `compartilhamento` conta og:title, og:description e og:image; `blog` conta só posts dos últimos 90 dias; `compare` com diferença de 2 pontos dá `empate`, de 10 dá `melhor` ou `pior` conforme o lado, ignora métrica com `undefined`; `siteMetrics` de zero páginas devolve `samples: 0` e nenhuma nota (não 0).
- [ ] **Step 2: Run** `bun test tests/seo/duel-metrics.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** reaproveitando os limites de `DEFAULT_RULES` (título 30 a 60, descrição 70 a 155).
- [ ] **Step 4: Run** o teste — Expected: PASS.

### Task 4: "O que fazer para ganhar"

**Files:**
- Create: `packages/web/src/api/lib/seo/duel-actions.ts`
- Test: `packages/web/tests/seo/duel-actions.test.ts`

**Interfaces:**
- Consumes: `Verdict` (Task 3), `PageScore`/`Check` (Etapa 1).
- Produces: `type DuelAction = { metric: MetricId; competitor: string; gap: number; effort: 'baixo' | 'medio' | 'alto'; title: string; how: string; pages: { path: string; label: string }[] }` e `function actionsFor(verdicts: Record<string, Verdict[]>, ourPages: { path: string; label: string; checks: Check[] }[]): DuelAction[]` (só métricas em que perdemos para algum concorrente; ordenadas por `gap` decrescente e, em empate, por esforço crescente; `pages` = até 5 páginas da Demakine com a pior nota daquele item; texto em português, sem travessão, com o nome do concorrente).

- [ ] **Step 1: Write the failing tests:** perder em `imagens` por 20 pontos gera ação de esforço `baixo` apontando as páginas com mais foto sem alt; perder em `tamanho` ou `blog` gera esforço `alto`; métrica em que ganhamos ou empatamos não gera ação; ordem por tamanho da diferença; com 2 concorrentes a mesma métrica aparece uma vez, citando o que ganha de nós por mais; nenhum texto tem travessão.
- [ ] **Step 2: Run** `bun test tests/seo/duel-actions.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** com um dicionário de textos por métrica (curtos e acionáveis).
- [ ] **Step 4: Run** o teste — Expected: PASS.

### Task 5: Execução do duelo em lotes

**Files:**
- Create: `packages/web/src/api/lib/seo/run-duel.ts`, `packages/web/src/api/lib/seo/duel-store.ts` (banco)
- Test: `packages/web/tests/seo/run-duel.test.ts`

**Interfaces:**
- Consumes: `fetchExternal`, `discoverPages`, `parseRobots` (T2), `extractFacts` (Etapa 1), `siteMetrics`, `compare` (T3), `actionsFor` (T4), `AuditStore` (Etapa 1, para ler as páginas e notas da Demakine da última auditoria completa).
- Produces: `interface DuelStore` (`competitors()`, `findResumable()`, `create()`, `saveState()`, `finish(result)`) e `async function runDuel(opts: { budgetMs: number }, deps?): Promise<{ duelId: number; status: 'completa' | 'parcial'; done: number; total: number }>`; resultado final `DuelResult = { at: string; sites: { name: string; url: string; status: 'ok' | 'bloqueado-robots' | 'sem-paginas' | 'erro'; metrics: SiteMetrics | null }[]; ours: SiteMetrics; verdicts: Record<string, Verdict[]>; board: Record<string, ReturnType<typeof scoreboard>>; actions: DuelAction[] }`.

- [ ] **Step 1: Write the failing tests** (com `fetchExternal`, relógio e banco falsos): dois concorrentes com 10 páginas cada terminam como `completa`; com `budgetMs` curto devolve `parcial`, a segunda chamada continua sem refazer páginas e o placar só é gravado ao fechar; concorrente que bloqueia o robô no `robots.txt` vira `bloqueado-robots` e o outro segue; site sem sitemap e sem links vira `sem-paginas`; sem auditoria completa da Demakine devolve erro "Rode a auditoria completa primeiro"; duelo com 0 concorrentes cadastrados devolve erro "Cadastre um concorrente primeiro".
- [ ] **Step 2: Run** `bun test tests/seo/run-duel.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `runDuel` (mesma ideia do auditor: fatos por lote guardados em `state`, cálculo no fim) e o `duel-store.ts` com Drizzle.
- [ ] **Step 4: Run** o teste — Expected: PASS.

### Task 6: Rotas e permissões

**Files:**
- Modify: `packages/web/src/api/seo-routes.ts`, `packages/web/src/api/lib/seo/data.ts`, `packages/web/src/api/lib/audit.ts`
- Test: `packages/web/tests/seo/routes-permissions.test.ts` (estender)

**Interfaces:**
- Produces (todas sob `requireRole()`):
  - `GET /admin/seo/concorrentes` → `{ competitors: { id; name; url }[]; latest: DuelResult | null; running: { done; total } | null }`
  - `PUT /admin/seo/concorrentes` com `{ items: { name: string; url: string }[] }` (até 2; `url` validada por `assertPublicUrl`, vira só a origem `https://host`; trocar apaga o duelo do concorrente removido)
  - `POST /admin/seo/duelar` → `{ duelId; status; done; total }` (como `auditar`: o navegador repete até `completa`)
  - `GET /cron/seo-duelo` (protegido por `CRON_SECRET`, igual ao `/cron/seo`)

- [ ] **Step 1: Write the failing tests:** super admin vence em todas as rotas novas, os demais papéis recebem 401 ou 403 (o teste existente que enumera `/admin/seo*` já cobre); `PUT` recusa mais de 2 itens, `http://`, `https://127.0.0.1`, nome vazio ou com mais de 60 caracteres (400 com mensagem); só guarda a origem (`https://concorrente.com.br/x?y=1` vira `https://concorrente.com.br`); `POST /admin/seo/duelar` sem concorrente devolve 409 "Cadastre um concorrente primeiro"; `GET /cron/seo-duelo` sem segredo devolve 401; descrição no registro de alterações ("Alterou os concorrentes do duelo", "Rodou o duelo com concorrentes").
- [ ] **Step 2: Run** `bun test tests/seo/routes-permissions.test.ts` — Expected: FAIL nos casos novos.
- [ ] **Step 3: Implement** as rotas, a camada de dados e as descrições do registro.
- [ ] **Step 4: Run** o teste e `bun run typecheck` — Expected: PASS.

### Task 7: Aba "Guerra é Guerra"

**Files:**
- Modify: `packages/web/src/web/admin/seo-geo/tabs.ts` (décima aba `guerra`, logo depois de "Dicas"), `index.tsx`, `data.ts`
- Create: `packages/web/src/web/admin/seo-geo/duel.tsx`
- Test: `packages/web/tests/seo/access.test.ts` (estender: 10 abas, ordem, e o teste de abas das dicas continua válido)

**Interfaces:**
- Consumes: as rotas da Task 6.

- [ ] **Step 1: Write the failing test:** `SEO_GEO_TABS` tem 10 abas e a última é `{ id: "guerra", label: "Guerra é Guerra" }`; a casca desenha as 10.
- [ ] **Step 2: Run** `bun test tests/seo/access.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** a tela: cadastro dos 2 concorrentes (nome e endereço, com a explicação do que o painel lê e que respeita o `robots.txt`); botão "Duelar agora" com andamento; **placar** no topo (por concorrente: "Você ganha em X, perde em Y, empata em Z"); **tabela métrica a métrica** com as duas notas lado a lado e a diferença, em verde (melhor), vermelho (pior) ou cinza (empate); **"O que fazer para ganhar"** com as ações ordenadas, esforço e links para as páginas da Demakine (abrem o editor); avisos para site bloqueado ou sem páginas; estados vazio, carregando e erro; funciona sem rolagem lateral a 390 px.
- [ ] **Step 4: Run** o teste, `bun run typecheck` e conferir no navegador, computador e celular, com dados de exemplo. Expected: PASS.

### Task 8: Cron semanal e fechamento

**Files:**
- Modify: `packages/web/vercel.json`
- Test: `packages/web/tests/seo/routes-permissions.test.ts` (estender a checagem de fiação)

- [ ] **Step 1: Write the failing test:** `vercel.json` tem o cron `{ "path": "/api/cron/seo-duelo", "schedule": "0 11 * * 1" }` (segunda, 08h de Brasília) e os crons antigos continuam.
- [ ] **Step 2: Run** o teste — Expected: FAIL.
- [ ] **Step 3: Implement** o cron e rodar a verificação final: `bun run lint`, `bun run typecheck`, `bun test` completo, build completo e o bundle do servidor. Checar o checklist de segurança dos 20 itens (rotas novas, SSRF, entrada validada, erro genérico).
- [ ] **Step 4: Run** tudo — Expected: tudo verde.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 2A: Guerra é Guerra"` (só depois do "pode subir"). Depois: aplicar a migração `0018` em produção **com a confirmação do Leandro**, testar o preview (cron novo) e só então pedir o merge. Depois do merge: cadastrar os 2 concorrentes que o Leandro escolher e rodar "Duelar agora".
