# SEO e GEO no painel, Etapa 1: Fundação e auditor — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma área "SEO e GEO" no painel, exclusiva do super admin, com dicas que mudam todo dia, que audita todas as páginas do site todo dia, dá nota de SEO por página, por setor e por área do site, guarda o histórico, avisa o que piorou e deixa editar as regras de SEO de qualquer página (inclusive ocultá-la do Google).

**Architecture:** Funções puras em `src/api/lib/seo/` (extrair fatos do HTML, pontuar, listar páginas, diferenciar problemas) testadas com HTML fixo. Um auditor busca o site no ar em lotes, grava `seo_runs`, `seo_page_scores` e `seo_issues` e é chamado por um cron novo e por um botão. Rotas `/api/admin/seo/*` em um sub-roteador só para `super_admin`. Telas novas em `src/web/admin/seo-geo/`. Regras por página reaproveitam a coleção `seo` de `content_docs`, e o site (componente `Seo`, sitemap, pré-renderização) passa a respeitá-las.

**Tech Stack:** Bun, Vite, React 19, Hono (RPC tipado), Drizzle + Postgres (Supabase), Tailwind 4, `bun test`. Sem dependência nova.

**Spec:** `docs/superpowers/specs/2026-11-11-seo-geo-admin-design.md` (seções 3A, 4 Etapa 1, 5, 6, 8, 13).

## Global Constraints

- **Acesso:** toda a área é só do `super_admin`: item de menu oculto para os outros papéis e API com `requireRole()` sem argumentos (403 para `admin`, `editor` e demais). A tela atual "SEO das páginas" continua como está.
- **Nada escondido na página:** nenhuma palavra-chave ou texto invisível ao visitante. Sem `meta keywords`.
- **Toda página nasce indexável.** Só são técnicas, e ficam `noindex`: `/obrigado` (3 idiomas), `/loja`, a página 404 e `/admin`. Qualquer outra página não indexável vira problema de severidade "atenção".
- **Cobertura total:** a lista de páginas vem da mesma fonte do sitemap mais as páginas ocultas; página nova criada no painel aparece na hora, como "não auditada".
- **Nota de SEO (soma 100):** título 15, descrição 10, H1 10, indexação 10, idiomas 5, conteúdo 10, imagens 10, links internos 10, dados estruturados 10, compartilhamento 5, velocidade 5. Sem medição de velocidade (até a Etapa 2), os 5 pontos se redistribuem proporcionalmente.
- **Limites padrão:** título 30 a 60 caracteres; descrição 70 a 155; conteúdo de página comercial 300 palavras ou mais; links internos: receber e enviar pelo menos 3.
- **Regras editáveis:** pesos somam exatamente 100; salvar com outra soma é recusado; há "voltar ao padrão".
- **Versões `/en` e `/es`:** entram na auditoria com 25% do peso de uma página em português na nota do site.
- **Segurança:** o verificador de links e o importador só acessam `demakine.com.br` e `www.demakine.com.br`. Validar toda entrada nas rotas. Nenhum segredo novo na Etapa 1 (usa o `CRON_SECRET` que já existe).
- **Texto para o usuário:** português do Brasil, direto, sem travessão.
- **Entrega:** migração SQL só é aplicada em produção com a confirmação do Leandro. `vercel.json` (cron novo) só vai para o ar depois de testado no preview da Vercel. Commit e push só depois do "pode subir"; merge só depois do "pode fazer o merge".

## Review Focus

1. **HTML quebrado ou sem `<title>`, `<h1>` ou JSON-LD:** o auditor dá 0 no item e segue; nunca derruba a auditoria (testado em `html.test.ts` e `score.test.ts`).
2. **Endereço fora do domínio no importador e no verificador** (outro site, `file:`, IP interno, `//outro.com`): recusado antes de qualquer requisição (testado em `crawl.test.ts`).
3. **Auditoria interrompida no meio** (limite de tempo da função): a próxima chamada continua do ponto em que parou, sem duplicar o registro de execução e sem publicar nota de site com páginas faltando (testado em `run-audit.test.ts`).
4. **Pesos que não somam 100 ou valores absurdos** (negativo, título mínimo maior que o máximo): rejeitados, nada é salvo (testado em `rules.test.ts`).
5. **Página nova criada no painel** aparece na lista antes de ser auditada, e página ocultada pelo painel sai da média e do sitemap sem sumir da lista (testado em `pages.test.ts`).

---

### Task 1: Tabelas do auditor e migração

**Files:**
- Modify: `packages/web/src/api/database/schema.ts` (acrescentar ao final)
- Create: `packages/web/drizzle/0017_seo_auditor.sql`
- Test: `packages/web/tests/seo/schema.test.ts`

**Interfaces:**
- Produces (exports de `schema.ts`): `seoRuns`, `seoPageScores`, `seoIssues`, com os campos:
  - `seoRuns`: `id serial`, `startedAt`, `finishedAt (nullable)`, `kind ('diaria' | 'manual')`, `status ('em-andamento' | 'completa' | 'parcial')`, `pagesTotal int`, `pagesAudited int`, `cursor int`, `siteSeoScore int (nullable)`, `sectorScores jsonb`, `areaScores jsonb`, `alerts jsonb` (lista de textos de alerta da execução).
  - `seoPageScores`: `runId`, `path`, `lang ('pt'|'en'|'es')`, `area text`, `seoScore int`, `checks jsonb`, `facts jsonb`, `statusCode int`, `indexable boolean`, `inlinks int`; índice em `(path, runId)`.
  - `seoIssues`: `id serial`, `path`, `code text`, `severity ('critico'|'atencao'|'info')`, `message text`, `firstSeen`, `lastSeen`, `resolvedAt (nullable)`; índice único em `(path, code)` onde `resolvedAt is null`.

- [ ] **Step 1: Write the failing test** em `schema.test.ts`: importa `seoRuns, seoPageScores, seoIssues` de `schema.ts` e afirma que cada um existe e que `Object.keys(seoPageScores)` contém `runId`, `path`, `seoScore`, `checks`, `inlinks`.
- [ ] **Step 2: Run** `cd packages/web && bun test tests/seo/schema.test.ts` — Expected: FAIL (exports inexistentes).
- [ ] **Step 3: Implement** as três tabelas em `schema.ts`, no estilo das tabelas existentes (`pgTable`, `timestamp(..., { withTimezone: true })`), e escrever `0017_seo_auditor.sql` com `create table` equivalente, os índices e `alter table ... enable row level security` nas três (padrão de `0014_rls_site_reviews.sql`). Não aplicar no banco.
- [ ] **Step 4: Run** `bun test tests/seo/schema.test.ts && bun run typecheck` — Expected: PASS, sem erro de tipo.
- [ ] **Step 5: Commit** `git add -A packages/web && git commit -m "SEO e GEO etapa 1: tabelas do auditor"` (só após o "pode subir").

### Task 2: Regras da nota

**Files:**
- Create: `packages/web/src/api/lib/seo/rules.ts`
- Test: `packages/web/tests/seo/rules.test.ts`

**Interfaces:**
- Produces:
  - `type SeoRules = { weights: Record<SeoItem, number>; title: { min: number; max: number }; description: { min: number; max: number }; commercialMinWords: number; minInlinks: number; minOutlinks: number; priorityPaths: string[] }`
  - `type SeoItem = 'titulo' | 'descricao' | 'h1' | 'indexacao' | 'idiomas' | 'conteudo' | 'imagens' | 'links' | 'schema' | 'compartilhamento' | 'velocidade'`
  - `const DEFAULT_RULES: SeoRules` (valores da seção Global Constraints; `priorityPaths` = as 10 páginas comerciais e `/produtos/*`)
  - `function validateRules(r: unknown): { ok: true; rules: SeoRules } | { ok: false; errors: string[] }`
  - `function effectiveWeights(r: SeoRules, speedMeasured: boolean): Record<SeoItem, number>` (soma 100; sem velocidade, os pesos restantes são escalados por 100/(100 − peso da velocidade))

- [ ] **Step 1: Write the failing tests**: `DEFAULT_RULES` soma 100; `validateRules` recusa soma 99 e 101 com mensagem "Os pesos precisam somar 100"; recusa `title.min > title.max`, peso negativo e `minInlinks` fracionário; aceita o padrão; `effectiveWeights(DEFAULT_RULES, false).velocidade === 0` e a soma é 100 (tolerância 1e-9); `effectiveWeights(DEFAULT_RULES, true)` devolve os pesos originais.
- [ ] **Step 2: Run** `bun test tests/seo/rules.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** as funções e a constante acima em `rules.ts`.
- [ ] **Step 4: Run** o teste — Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: regras da nota"`.

### Task 3: Extração de fatos do HTML

**Files:**
- Create: `packages/web/src/api/lib/seo/html.ts`
- Create: `packages/web/tests/seo/fixtures/pagina-completa.html`, `pagina-quebrada.html`
- Test: `packages/web/tests/seo/html.test.ts`

**Interfaces:**
- Produces:
  - `type PageFacts = { title: string | null; description: string | null; h1s: string[]; h2Count: number; canonical: string | null; robots: string | null; hreflangs: { lang: string; href: string }[]; og: { title?: string; description?: string; image?: string }; images: { src: string; alt: string | null }[]; internalLinks: string[]; jsonLdTypes: string[]; jsonLd: unknown[]; words: number; htmlLang: string | null }`
  - `function extractFacts(html: string, pageUrl: string): PageFacts` (nunca lança; campo ausente vira `null`, `[]` ou `0`)
  - `function isInternal(href: string, pageUrl: string): boolean` (mesmo domínio; ignora `mailto:`, `tel:`, `#`, `javascript:`)
  - `function normalizeInternal(href: string, pageUrl: string): string` (caminho sem barra final, sem `#`, sem consulta)

- [ ] **Step 1: Write the failing tests** com fixtures: na completa, `title === "Esteiras Transportadoras: Fábrica e Modelos | Demakine"`, `h1s.length === 1`, `jsonLdTypes` contém `FAQPage`, `images` inclui uma sem `alt` (`alt === null`) e uma com `alt === ""`, `internalLinks` não contém `mailto:` e tem `/produtos/rosca-transportadora`; na quebrada (sem `<title>`, sem `<h1>`, JSON-LD com sintaxe inválida): `title === null`, `h1s` vazio, `jsonLd` vazio, **sem lançar exceção**; `isInternal("https://outro.com/x", "https://www.demakine.com.br/")` é falso; `normalizeInternal("/blog/?a=1#x", ...)` é `/blog`.
- [ ] **Step 2: Run** `bun test tests/seo/html.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** em `html.ts` com expressões regulares (mesmo estilo de `tests/entrega3.test.ts`), decodificando entidades (`&amp;`, `&quot;`, `&#x27;`); `words` conta palavras do texto visível (sem `<script>` e `<style>`).
- [ ] **Step 4: Run** o teste — Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: leitura do HTML"`.

### Task 4: Pontuação por página, por setor e do site

**Files:**
- Create: `packages/web/src/api/lib/seo/score.ts`
- Test: `packages/web/tests/seo/score.test.ts`

**Interfaces:**
- Consumes: `PageFacts` (Task 3); `SeoRules`, `SeoItem`, `effectiveWeights` (Task 2).
- Produces:
  - `type PageContext = { path: string; area: SiteArea; lang: 'pt'|'en'|'es'; statusCode: number; inlinks: number; isCommercial: boolean; duplicateTitle: boolean; duplicateDescription: boolean; expectedSchema: string[]; expectedHreflangs: string[] }`
  - `type Check = { item: SeoItem; points: number; max: number; ok: boolean; message: string; fix: string }`
  - `type PageScore = { seo: number; checks: Check[]; sectors: Record<Sector, number> }`, com `type Sector = 'conteudo' | 'imagens' | 'links' | 'schema' | 'idiomas' | 'indexacao' | 'titulo-descricao' | 'compartilhamento'`
  - `function scorePage(facts: PageFacts, ctx: PageContext, rules: SeoRules, speedMeasured: boolean): PageScore`
  - `function scoreSite(pages: { path: string; area: SiteArea; lang: Lang; score: PageScore; indexable: boolean; hiddenByPanel: boolean }[], rules: SeoRules, siteChecks: { sitemapValid: boolean; robotsBlocksSite: boolean; brokenInternalLinks: number }): { site: number; byArea: Record<SiteArea, number>; bySector: Record<Sector, number> }`

- [ ] **Step 1: Write the failing tests**: (a) página perfeita (título de 45 caracteres, descrição de 120, um H1, 200, canonical próprio, schema esperado, imagens todas com `alt`, 3 links recebidos e 3 enviados, `og:*` completos) dá `seo === 100`; (b) sem `<title>` o item `titulo` perde os 15 pontos (escalados) e a mensagem cita "título"; (c) título de 70 caracteres perde pontos parciais e não zera; (d) título igual ao de outra página (`duplicateTitle`) perde pontos; (e) `statusCode: 404` zera `indexacao` e `ok` é falso; (f) imagens: 4 de 5 com `alt` dá 80% dos pontos do item; (g) página comercial com 120 palavras perde pontos de `conteudo`, página de produto não é cobrada por palavras; (h) `scoreSite`: páginas em `priorityPaths` pesam 3 vezes mais, `hiddenByPanel: true` sai da média, versão `en` pesa 0,25, e `brokenInternalLinks: 5` reduz a nota do site (penalidade máxima de 10 pontos).
- [ ] **Step 2: Run** `bun test tests/seo/score.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `scorePage` e `scoreSite` em `score.ts`; cada `Check` devolve `message` e `fix` em português (texto de cada correção fica a cargo do implementador, curto e acionável). Pontuação parcial linear dentro de cada item.
- [ ] **Step 4: Run** o teste — Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: notas"`.

### Task 5: Lista de todas as páginas e áreas

**Files:**
- Modify: `packages/web/src/api/lib/sitemap.ts` (extrair `buildEntries`; `buildSitemap` passa a usá-la, saída idêntica)
- Create: `packages/web/src/api/lib/seo/pages.ts`
- Test: `packages/web/tests/seo/pages.test.ts`

**Interfaces:**
- Produces:
  - em `sitemap.ts`: `export function buildEntries(docs: Doc[], openJobs: { slug: string; updatedAt: Date }[]): { path: string; lastmod?: string; priority: string; images?: string[] }[]` (todas as variantes de idioma já expandidas, sem o XML)
  - `type SiteArea = 'produtos' | 'categorias' | 'comerciais' | 'blog' | 'cases' | 'segmentos' | 'vagas' | 'exportacao' | 'institucional' | 'tecnica'`
  - `type SitePage = { path: string; lang: 'pt'|'en'|'es'; area: SiteArea; label: string; inSitemap: boolean; hiddenByPanel: boolean; technical: boolean; overrides: PageOverrides }`
  - `type PageOverrides = { title?: string; description?: string; canonical?: string; noindex?: boolean; noSitemap?: boolean; ogImage?: string; shortAnswer?: string; author?: string; reviewedAt?: string }`
  - `function listSitePages(docs: Doc[], openJobs: ..., seoDocs: Record<string, PageOverrides>): SitePage[]`
  - `function classify(path: string): { area: SiteArea; lang: 'pt'|'en'|'es'; technical: boolean }`
  - `function isTechnical(path: string): boolean` (verdadeiro para `/obrigado`, `/en/obrigado`, `/es/obrigado`, `/loja`, `/admin`, a 404)

- [ ] **Step 1: Write the failing tests**: `classify("/produtos/rosca-transportadora")` dá `produtos`/`pt`; `/esteiras-transportadoras` dá `categorias`; `/esteira-transportadora-preco` dá `comerciais`; `/en/blog/x` dá `blog`/`en`; `/en/export` dá `exportacao`/`en`; `/obrigado` é técnica. `buildSitemap([], [])` continua listando as mesmas 194 URLs de antes e o mesmo XML (comparar com a saída antes do refactor, guardada em fixture). **Página nova:** com um documento de produto novo em `docs` (`collection: "produto"`, `key: "produto-novo"`, nome e categoria preenchidos), `listSitePages` inclui `/produtos/produto-novo` e as versões `/en` e `/es`. **Oculta:** com `seoDocs["produtos-x"] = { noindex: true }`, a página continua na lista com `hiddenByPanel: true`, e `buildEntries` não a lista.
- [ ] **Step 2: Run** `bun test tests/seo/pages.test.ts tests/routing.test.ts tests/imagens.test.ts` — Expected: FAIL nos novos, PASS nos antigos.
- [ ] **Step 3: Implement** a extração em `sitemap.ts` (comportamento idêntico) e `pages.ts`. Em `buildEntries`, pular página com `noindex` ou `noSitemap` nas `seoDocs`: `buildSitemap` ganha um terceiro parâmetro opcional `seoDocs` (a API de sitemap já recebe `docs`, de onde vêm os documentos da coleção `seo`).
- [ ] **Step 4: Run** `bun test` completo — Expected: tudo passa, inclusive os testes de sitemap das Entregas 2, 3 e 4A.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: lista de todas as páginas"`.

### Task 6: O site respeita as regras por página

**Files:**
- Modify: `packages/web/src/web/components/seo.tsx` (campos `noindex`, `canonical` e `ogImage` vindos de `editedDoc("seo", seoKey(path))`)
- Create: `packages/web/src/web/lib/seo-overrides.ts`
- Test: `packages/web/tests/seo/overrides.test.ts`

**Interfaces:**
- Produces: `function readOverrides(doc: unknown): PageOverrides` (ignora campos de tipo errado; `canonical` só aceita endereço do próprio domínio); `function applyOverrides(base: { noindex: boolean; canonical: string; ogImage?: string }, o: PageOverrides): typeof base`.
- Consumes: `PageOverrides` (Task 5).

- [ ] **Step 1: Write the failing tests**: `readOverrides({ noindex: "sim" })` ignora o valor inválido; `readOverrides({ canonical: "https://outro.com/x" })` descarta o canonical; `applyOverrides({ noindex: false, canonical: "https://www.demakine.com.br/a" }, { noindex: true })` devolve `noindex: true`; `canonical` manual do próprio domínio substitui o padrão.
- [ ] **Step 2: Run** `bun test tests/seo/overrides.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** os dois helpers e ligá-los ao componente `Seo` (a prop `noindex` do componente continua valendo; a regra do painel só pode **acrescentar** `noindex`, nunca tirá-lo de página técnica). O HTML pré-renderizado já usa `head.canonical` e `head.meta`, então nenhuma mudança em `vite/prerender.ts` é esperada; conferir no build.
- [ ] **Step 4: Run** `bun test tests/seo/overrides.test.ts && bun run typecheck`, depois o build completo e a conferência: com um documento `seo` de teste com `noindex`, o HTML da página sai com `<meta name="robots" content="noindex, follow">` e sem `canonical` (verificar manualmente no `dist/`). Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: o site respeita as regras por página"`.

### Task 7: Rastreador e auditor em lotes

**Files:**
- Create: `packages/web/src/api/lib/seo/crawl.ts`, `packages/web/src/api/lib/seo/run-audit.ts`, `packages/web/src/api/lib/seo/issues.ts`
- Test: `packages/web/tests/seo/crawl.test.ts`, `run-audit.test.ts`, `issues.test.ts`

**Interfaces:**
- Consumes: `extractFacts` (T3), `scorePage`, `scoreSite` (T4), `listSitePages` (T5), `validateRules` (T2).
- Produces:
  - `crawl.ts`: `const ALLOWED_HOSTS = ["demakine.com.br", "www.demakine.com.br"]`; `function assertAllowedUrl(url: string): URL` (lança `Error("Endereço fora do domínio")` para outro host, esquema diferente de `https:`, IP, `//host` e `file:`); `async function fetchPage(url: string, timeoutMs?: number): Promise<{ status: number; html: string; finalUrl: string; hops: number }>`; `async function pool<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]>` (preserva a ordem, nunca passa de `limit` em paralelo)
  - `run-audit.ts`: `async function auditSite(opts: { kind: 'diaria' | 'manual'; budgetMs: number; paths?: string[] }): Promise<{ runId: number; status: 'completa' | 'parcial'; audited: number; total: number }>`; se existir execução `em-andamento` com menos de 30 minutos, **continua** dela a partir de `cursor`
  - `issues.ts`: `type Issue = { path: string; code: string; severity: 'critico' | 'atencao' | 'info'; message: string }`; `function issuesFromChecks(path: string, checks: Check[], ctx: { indexable: boolean; technical: boolean }): Issue[]`; `function diffIssues(open: Issue[], now: Issue[]): { opened: Issue[]; resolved: Issue[]; kept: Issue[] }`; `function alertsFor(opened: Issue[], scoreDrop: number): string[]` (o auditor grava o resultado em `seoRuns.alerts`)

- [ ] **Step 1: Write the failing tests**: `assertAllowedUrl` aceita `https://www.demakine.com.br/x` e recusa `http://www.demakine.com.br/`, `https://demakine.com.br.evil.com/`, `https://127.0.0.1/`, `//evil.com/`, `file:///etc/passwd`; `pool` com `limit: 2` nunca roda 3 tarefas juntas (contador de concorrência) e devolve na ordem; `auditSite` com `fetchPage` e `listSitePages` trocados por stubs: audita 10 páginas e devolve `completa`; com `budgetMs` curto devolve `parcial` com `audited < total`, **a segunda chamada continua do cursor e termina sem duplicar o registro**, e `siteSeoScore` só é gravado quando a execução fecha; uma página que responde 404 recebe a nota do item `indexacao` zerada e uma `Issue` crítica; `diffIssues` marca como resolvida a que sumiu; `alertsFor` devolve "A nota do site caiu 6 pontos" para queda maior que 5 e nada para queda de 2; uma página técnica `noindex` não gera problema, uma página comum `noindex` gera "atenção".
- [ ] **Step 2: Run** `bun test tests/seo/crawl.test.ts tests/seo/run-audit.test.ts tests/seo/issues.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** os três arquivos. `auditSite` injeta `fetchPage` e o acesso ao banco por parâmetro opcional (para teste). Concorrência 8, `User-Agent: DemakineSEOAuditor/1.0`, tempo limite de 15 s por página, no máximo 5 saltos. Duplicidade de título e descrição é calculada depois de buscar todas as páginas do lote e antes de pontuar. `inlinks` vem dos `internalLinks` de todas as páginas da execução.
- [ ] **Step 4: Run** os testes — Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: auditor"`.

### Task 8: Rotas da API, permissões e cron

**Files:**
- Create: `packages/web/src/api/seo-routes.ts`
- Modify: `packages/web/src/api/index.ts` (montar o sub-roteador e o cron), `packages/web/vercel.json` (cron)
- Test: `packages/web/tests/seo/routes-permissions.test.ts`

**Interfaces:**
- Consumes: `auditSite` (T7), `validateRules` e `DEFAULT_RULES` (T2), `listSitePages` (T5).
- Produces (todas sob `/api`, exigem `requireRole()` exceto o cron):
  - `GET /admin/seo/resumo` → `{ latest: Run | null; history: { date: string; site: number }[]; byArea; bySector; issues: Issue[]; alerts: string[]; timeline: { at: string; text: string }[] }` (a `timeline` junta `audit_log` e `seoRuns` dos últimos 30 dias, mais novo primeiro)
  - `GET /admin/seo/paginas?area=&q=&lang=` → `{ pages: (SitePage & { seoScore: number | null; audited: boolean })[] }`
  - `GET /admin/seo/pagina?path=` → `{ page: SitePage; checks: Check[]; facts: PageFacts | null; visits30d: number }`
  - `POST /admin/seo/auditar` com `{ path?: string }` → `{ runId; status; audited; total }` (com `path`, audita só aquela página e atualiza a nota dela; sem `path`, começa ou continua a execução completa)
  - `GET /admin/seo/regras`, `PUT /admin/seo/regras` (corpo validado por `validateRules`, grava em `app_settings` chave `seo-rules`, registra no `audit_log`), `DELETE /admin/seo/regras` (volta ao padrão)
  - `GET /cron/seo` (protegido por `CRON_SECRET`, mesma verificação de `/cron/diario`) → chama `auditSite({ kind: 'diaria', budgetMs })` e, ao fechar a execução, escolhe as dicas do dia (Task 15)
- `vercel.json`: acrescentar `{ "path": "/api/cron/seo", "schedule": "0 10 * * *" }` (07:00 de Brasília) em `crons`.

- [ ] **Step 1: Write the failing tests** (monta um `Hono` só com o sub-roteador e um middleware que injeta `user` falso): `super_admin` recebe 200 em `/admin/seo/regras`; `admin`, `editor`, `vendedor`, `rh` e visitante recebem 403 ou 401 em **todas** as rotas `/admin/seo/*` listadas; `PUT /admin/seo/regras` com pesos somando 99 devolve 400 e a mensagem de `validateRules`; `GET /cron/seo` sem `Authorization` devolve 401, com o segredo certo devolve 200.
- [ ] **Step 2: Run** `bun test tests/seo/routes-permissions.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `seo-routes.ts` no estilo das rotas existentes (`requireRole()`, `validator('json', ...)`) e montar em `index.ts` com `.route('/', seoRoutes)` para manter o cliente RPC tipado. `resumo` e `paginas` leem o último `seoRuns` completo e os `seoPageScores` dele; páginas sem nota saem com `audited: false`.
- [ ] **Step 4: Run** o teste e `bun run typecheck` — Expected: PASS. Conferir no preview da Vercel que o cron aparece (alteração em `vercel.json`).
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: rotas e cron"`.

### Task 9: Menu e acesso só do super admin

**Files:**
- Create: `packages/web/src/web/admin/access.ts`
- Modify: `packages/web/src/web/pages/admin.tsx` (importar `allowed` e `Area` de `access.ts`; acrescentar o item de menu)
- Create: `packages/web/src/web/admin/seo-geo/index.tsx` (casca com abas)
- Test: `packages/web/tests/seo/access.test.ts`

**Interfaces:**
- Produces: `type Area = 'livre' | 'config' | 'leads' | 'conteudo' | 'loja' | 'vagas' | 'usuarios' | 'seo-geo'`; `function allowed(role: string, area: Area): boolean` (a lógica atual de `admin.tsx` movida, mais: `seo-geo` só para `super_admin`); item de menu `{ id: "seo-geo", label: "SEO e GEO", Icon: Radar, area: "seo-geo" }`, logo abaixo de "SEO das páginas".
- Abas da casca: `Visão geral`, `Páginas`, `O que melhorar`, `Regras`, `Links`, `Endereços antigos`, `Imagens`, `Dados estruturados`, `Dicas`.

- [ ] **Step 1: Write the failing tests**: `allowed("super_admin", "seo-geo") === true`; `allowed` é falso para `admin`, `editor`, `vendedor`, `rh`; o comportamento das áreas antigas não muda (tabela: `admin` não acessa `usuarios`, `editor` acessa `conteudo` e `vagas`, `rh` só `vagas`).
- [ ] **Step 2: Run** `bun test tests/seo/access.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** a extração para `access.ts` sem alterar o comportamento antigo, o item de menu e a casca com as abas (cada aba renderiza o componente da sua tarefa; até lá, um aviso "em construção").
- [ ] **Step 4: Run** o teste, `bun run typecheck` e abrir o painel como super admin no navegador: o item aparece; com um usuário `admin`, não aparece. Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: menu exclusivo do super admin"`.

### Task 10: Visão geral (notas, histórico, setores, o que melhorar)

**Files:**
- Create: `packages/web/src/web/admin/seo-geo/overview.tsx`, `improve.tsx`, `score-ring.tsx`
- Test: `packages/web/tests/seo/overview-model.test.ts`
- Create: `packages/web/src/web/admin/seo-geo/model.ts`

**Interfaces:**
- Consumes: `GET /admin/seo/resumo` (T8); componentes de `admin/charts.tsx` e `admin/ui.tsx`.
- Produces (`model.ts`, funções puras): `function scoreColor(n: number): 'verde' | 'amarelo' | 'vermelho'` (90 a 100 verde, 50 a 89 amarelo, 0 a 49 vermelho, como o PageSpeed); `function sortIssues(issues: Issue[], pagesByPath: Map<string, { area: SiteArea }>): Issue[]` (críticos antes de atenção, comerciais antes de produtos antes do resto); `function dayDelta(history: { date: string; site: number }[]): number | null`.

- [ ] **Step 1: Write the failing tests**: `scoreColor(90)` é `verde`, `scoreColor(89)` e `scoreColor(50)` são `amarelo`, `scoreColor(49)` é `vermelho`; `sortIssues` põe um crítico em página comercial antes de um crítico em produto e ambos antes de um "atenção" comercial; `dayDelta` devolve a diferença entre os dois últimos dias, e `null` com menos de 2 pontos.
- [ ] **Step 2: Run** `bun test tests/seo/overview-model.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `model.ts` e as telas: anel grande com a nota do site e a variação do dia; gráfico diário (30 dias); cartões "Por setor" (Conteúdo, Imagens, Links, Dados estruturados, Idiomas, Indexação, Título e descrição, Compartilhamento) e "Por área do site" (Produtos, Categorias, Páginas comerciais, Blog, Cases, Segmentos, Institucional, Vagas, Exportação), cada um com anel e cor; linha do tempo do dia; faixa de **alertas** da última execução (`alerts`; sem e-mail por enquanto, só dentro do painel); botão "Auditar agora" com estado de andamento; lista "O que melhorar" com a correção ao lado e link que abre a página no editor. Estado vazio claro quando ainda não há execução.
- [ ] **Step 4: Run** o teste e conferir no navegador, computador e celular (390 px): sem rolagem lateral, cores corretas, estado vazio legível. Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: visão geral"`.

### Task 11: Todas as páginas e editor por página

**Files:**
- Create: `packages/web/src/web/admin/seo-geo/pages.tsx`, `page-editor.tsx`
- Modify: `packages/web/src/api/lib/content-docs.ts` (aceitar os campos novos da coleção `seo`), `packages/web/src/api/seo-routes.ts` (visitas dos últimos 30 dias da página)
- Test: `packages/web/tests/seo/page-doc.test.ts`

**Interfaces:**
- Consumes: `PageOverrides`, `listSitePages` (T5); `readOverrides` (T6); rota `GET /admin/seo/paginas` e `GET /admin/seo/pagina` (T8); `PUT /admin/conteudo/seo/:key` existente.
- Produces: `function toSeoDoc(o: PageOverrides): Record<string, unknown>` (remove campos vazios e valida: título até 120 caracteres, descrição até 320, `canonical` só do próprio domínio, `shortAnswer` até 600); `function warnBeforeHiding(visits30d: number, technical: boolean): string | null` ("Esta página recebeu N visitas nos últimos 30 dias. Ocultar tira ela do Google." / `null` para página técnica ou sem visitas).

- [ ] **Step 1: Write the failing tests**: `toSeoDoc` remove strings vazias, recusa `canonical: "https://outro.com"`, mantém `noindex: true`; `warnBeforeHiding(120, false)` devolve a frase com "120"; `warnBeforeHiding(0, false)` e `warnBeforeHiding(500, true)` devolvem `null`.
- [ ] **Step 2: Run** `bun test tests/seo/page-doc.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** as duas funções e as telas: lista de **todas** as páginas, com busca, filtro por área e idioma, nota e estado (indexada, oculta pelo painel, técnica, não auditada); ao abrir uma página, o editor com título, descrição, prévia do Google (computador e celular), contador de caracteres com a faixa ideal, imagem de compartilhamento, `canonical`, chaves "Aparecer no Google" e "Aparecer no sitemap" (com o aviso de `warnBeforeHiding` e a confirmação), o detalhe da nota item a item, "Auditar esta página" e o aviso "a mudança vai ao ar em cerca de 1 a 2 minutos". Salvar chama o endpoint de conteúdo existente (que republica o site).
- [ ] **Step 4: Run** o teste e conferir no navegador: criar um produto de teste no Catálogo, ver a página nova aparecer na lista como "não auditada"; ocultar uma página, ver o aviso, salvar e confirmar no `dist/` do build que sai `noindex` e que sumiu do sitemap. Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: páginas e editor"`.

### Task 12: Regras da nota

**Files:**
- Create: `packages/web/src/web/admin/seo-geo/rules.tsx`
- Modify: `packages/web/src/api/seo-routes.ts` (se faltar ajuste)
- Test: reaproveita `tests/seo/rules.test.ts` e `routes-permissions.test.ts`

**Interfaces:**
- Consumes: `GET`, `PUT` e `DELETE /admin/seo/regras` (T8); `SeoRules` (T2).
- Produces: tela com os pesos (soma ao vivo, botão salvar desabilitado fora de 100), limites de título, descrição, palavras e links, lista de páginas prioritárias (com busca na lista de páginas) e "Voltar ao padrão".

- [ ] **Step 1: Write the failing test** em `rules.test.ts`: `validateRules` recusa `priorityPaths` com endereço que não começa com `/`.
- [ ] **Step 2: Run** `bun test tests/seo/rules.test.ts` — Expected: FAIL no caso novo.
- [ ] **Step 3: Implement** a validação do caso novo e a tela, que mostra os erros devolvidos pela API em português sem perder o que a pessoa digitou.
- [ ] **Step 4: Run** os testes e conferir no navegador: pesos que somam 99 bloqueiam o botão; "Voltar ao padrão" restaura; depois de salvar, "Auditar agora" usa a regra nova. Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: regras editáveis"`.

### Task 13: Verificador de links e endereços antigos

**Files:**
- Create: `packages/web/src/api/lib/seo/links.ts`, `packages/web/src/api/lib/seo/import-old.ts`, `packages/web/src/web/admin/seo-geo/links.tsx`, `old-urls.tsx`
- Modify: `packages/web/src/api/seo-routes.ts`
- Test: `packages/web/tests/seo/links.test.ts`, `import-old.test.ts`

**Interfaces:**
- Consumes: `assertAllowedUrl`, `pool` (T7); tabela `redirects` existente.
- Produces:
  - `links.ts`: `type LinkResult = { url: string; status: number; chain: string[]; broken: boolean; foundOn: string[] }`; `async function checkLinks(urls: string[], foundOn: Map<string, string[]>, opts?: { max?: number; fetchHead?: typeof fetch }): Promise<LinkResult[]>` (HEAD, segue até 5 saltos, no máximo `max` = 800 endereços únicos)
  - `import-old.ts`: `function parseOldUrls(text: string): { valid: string[]; rejected: { raw: string; reason: string }[] }` (aceita lista com um por linha, CSV do Search Console com a coluna de endereço, endereços completos do próprio domínio e caminhos; remove duplicados, barra final e `#`); `function suggestTarget(path: string, known: string[]): string | null` (por semelhança de slug, só entre páginas existentes); `async function testOldUrls(paths: string[]): Promise<{ path: string; status: number; finalPath: string | null; needsRedirect: boolean; suggested: string | null }[]>`; `async function createRedirects(items: { from: string; to: string }[], userId: string): Promise<{ created: number; skipped: { from: string; reason: string }[] }>`
  - Rotas (só `super_admin`): `POST /admin/seo/links/verificar`, `GET /admin/seo/links`, `POST /admin/seo/importar/testar` (`{ text }`), `POST /admin/seo/importar/criar` (`{ items }`)

- [ ] **Step 1: Write the failing tests**: `parseOldUrls` com 3 linhas (`/produto/x/`, `https://www.demakine.com.br/produto/x`, `https://outro.com/y`) devolve 1 válida (duplicada fundida) e 1 rejeitada com motivo "fora do domínio"; lê um CSV com cabeçalho `Páginas principais,Cliques`; `checkLinks` com `fetchHead` falso: um 200, um 404 (`broken: true`) e um redirecionamento 301 para 200 (`chain.length === 1`, `broken: false`); um laço de redirecionamentos para em 5 saltos com `broken: true`; `max: 2` com 5 endereços só testa 2; `createRedirects` pula quem já tem redirecionamento e quem aponta para si mesmo, e recusa destino fora do domínio.
- [ ] **Step 2: Run** `bun test tests/seo/links.test.ts tests/seo/import-old.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** as quatro funções e as rotas. `createRedirects` reutiliza a lógica de validação de `lib/redirects.ts` e registra no `audit_log`. As telas: verificador com tabela (endereço, onde aparece, resposta, botão "Criar redirecionamento"); importador com caixa de colar, botão "Testar", tabela de resultado com o destino sugerido editável e "Criar os redirecionamentos selecionados".
- [ ] **Step 4: Run** os testes e conferir no navegador com 5 endereços reais do site antigo: a tabela mostra quais dão 404 e a criação grava em Redirecionamentos. Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: links e endereços antigos"`.

### Task 14: Painel de imagens e de dados estruturados

**Files:**
- Create: `packages/web/src/api/lib/seo/images.ts`, `packages/web/src/api/lib/seo/schema-check.ts`, `packages/web/src/web/admin/seo-geo/images.tsx`, `structured.tsx`
- Modify: `packages/web/src/api/seo-routes.ts`
- Test: `packages/web/tests/seo/images.test.ts`, `schema-check.test.ts`

**Interfaces:**
- Consumes: `PageFacts` (T3); `GET /admin/seo/pagina` (T8); `PUT /admin/conteudo/produto/:key` existente (campo `imageAlts`).
- Produces:
  - `images.ts`: `type ImageIssue = { src: string; page: string; problems: ('sem-alt' | 'nome-numerico' | 'pesada')[]; bytes?: number }`; `function imageIssues(pages: { path: string; images: PageFacts['images'] }[], sizes: Map<string, number>): ImageIssue[]` (nome numérico: arquivo igual a `^\d+\.(webp|jpg|png)$`; pesada: acima de 300 KB)
  - `schema-check.ts`: `type SchemaFinding = { type: string; level: 'ok' | 'faltando' | 'erro'; message: string }`; `function checkSchema(jsonLd: unknown[], expected: string[]): SchemaFinding[]` (campos obrigatórios por tipo: `Product` exige `name`, `image`, `offers`; `FAQPage` exige `mainEntity` não vazio; `BreadcrumbList` exige `itemListElement`; `Article` exige `headline`, `datePublished`; `Organization` exige `name`, `url`)

- [ ] **Step 1: Write the failing tests**: `imageIssues` marca `1.webp` como `nome-numerico`, uma imagem sem `alt` como `sem-alt` e uma de 400 KB como `pesada`, e não marca uma imagem com `alt` e nome descritivo; `checkSchema` de um `Product` sem `offers` devolve `faltando` citando "offers"; de uma `FAQPage` com `mainEntity: []` devolve `erro`; de uma página que deveria ter `Product` mas só tem `BreadcrumbList` devolve `faltando` para `Product`.
- [ ] **Step 2: Run** `bun test tests/seo/images.test.ts tests/seo/schema-check.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** as duas bibliotecas e as telas. Imagens: tabela com miniatura, página, problemas e, para foto de produto, campo para escrever a descrição direto (grava `imageAlts[caminho]` no documento do produto, no mesmo formato de `lib/product-photos.ts`). Dados estruturados: por página, os tipos encontrados, o que o Google lê e o que falta.
- [ ] **Step 4: Run** os testes e conferir no navegador: escrever a descrição de uma foto de teste, esperar a republicação e ver o `alt` novo no HTML da página de produto. Expected: PASS.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: imagens e dados estruturados"`.

### Task 15: Dicas que mudam todo dia e fechamento da etapa

**Files:**
- Create: `packages/web/src/api/lib/seo/tips.ts`, `packages/web/src/api/lib/seo/tips-library.ts`, `packages/web/src/web/admin/seo-geo/tips.tsx`
- Modify: `packages/web/src/api/seo-routes.ts` (`GET /admin/seo/dicas`), `packages/web/src/api/index.ts` (o cron `/cron/seo` escolhe as dicas do dia depois da auditoria)
- Test: `packages/web/tests/seo/tips.test.ts`

**Interfaces:**
- Consumes: `Issue` (T7); `SiteArea`, `PageOverrides` não são necessários.
- Produces:
  - `tips-library.ts`: `type Tip = { id: string; title: string; body: string; tab: 'visao-geral' | 'paginas' | 'melhorar' | 'regras' | 'links' | 'enderecos-antigos' | 'imagens' | 'dados-estruturados'; kind: 'biblioteca' | 'dado' }` e `const TIP_LIBRARY: Tip[]` com **pelo menos 60** dicas escritas à mão (as 15 combinadas em 11/11/2026 mais as demais), ids únicos, texto curto e acionável
  - `tips.ts`: `function tipsFromIssues(issues: Issue[], pagesByPath: Map<string, { label: string }>): Tip[]` (uma dica por problema real, com o nome da página e o que fazer; `id` = `dado:<codigo>:<caminho>`); `type TipsState = { date: string; ids: string[]; seen: string[] }`; `function pickDailyTips(state: TipsState | null, today: string, library: Tip[], fromIssues: Tip[], count?: number): { state: TipsState; tips: Tip[] }` (`count` padrão 15)
  - estado guardado em `app_settings` chave `seo-tips`; `GET /admin/seo/dicas` → `{ date: string; tips: Tip[] }`

- [ ] **Step 1: Write the failing tests** em `tips.test.ts`: `pickDailyTips` devolve exatamente 15; no máximo 8 vêm de problemas reais (`kind: 'dado'`) e o resto da biblioteca; **o mesmo dia devolve as mesmas dicas** (chamar duas vezes não troca); **um dia novo devolve 15 diferentes** das do dia anterior; nenhuma dica da biblioteca se repete enquanto houver dica não vista, e quando a biblioteca se esgota o ciclo recomeça sem erro; sem problemas reais, as 15 vêm da biblioteca; `TIP_LIBRARY` tem pelo menos 60 itens, ids únicos, nenhum corpo com travessão (`—` ou `–`) e todo `tab` é uma aba que existe na casca (Task 9); `tipsFromIssues` cita o nome da página no texto.
- [ ] **Step 2: Run** `bun test tests/seo/tips.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** `tips-library.ts`, `tips.ts`, a rota e a tela (lista de 15 cartões com a aba de ação como atalho, "marcar como feito" no `localStorage` do navegador, data do dia no topo). O cron chama `pickDailyTips` com os problemas abertos da execução do dia e grava o novo estado.
- [ ] **Step 4: Run** o teste e a verificação final da etapa: `bun run lint`, `bun run typecheck`, `bun test` completo, build completo e checagens no navegador de todas as abas em computador e celular. Expected: tudo verde.
- [ ] **Step 5: Commit** `"SEO e GEO etapa 1: dicas do dia e fechamento"`. Depois do "pode subir": abrir o PR, aplicar a migração `0017` em produção **com a confirmação do Leandro**, testar o preview da Vercel (cron novo) e só então pedir o merge. Depois do merge: rodar "Auditar agora" em produção e conferir a primeira nota.
