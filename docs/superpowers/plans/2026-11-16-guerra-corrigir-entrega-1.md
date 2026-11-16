# Guerra é Guerra: Corrigir e Copiar prompt (Entrega 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Em cada derrota do duelo, o painel explica o motivo e oferece **Corrigir** (propõe texto por regras, mostra antes e depois, aplica em lote e permite desfazer) ou **Copiar prompt** em JSON, para o que não cabe no painel.

**Architecture:** Funções puras novas em `src/api/lib/seo/` (regras de proposta, pacote de prompt, aplicar e desfazer com um `FixStore` injetado), uma tabela de lotes (`seo_fix_batches`, migração `0019`), cinco rotas em `seo-routes.ts` e uma tela de revisão no painel. A escrita usa só os caminhos que já existem (`savePageDoc` e `setImageAlt`). A Entrega 2 (IA por ida e volta de JSON) é outro plano.

**Tech Stack:** Bun, Hono (rotas encadeadas, cliente tipado `api`), Drizzle e Postgres (Supabase), React 19, TanStack Query, Tailwind 4, `bun test`, oxlint, tsc.

**Spec:** `docs/superpowers/specs/2026-11-16-guerra-corrigir-design.md`

**Onde executar:** worktree novo `~/demakine-guerra-corrigir`, branch `guerra-corrigir`, a partir de `origin/main`. Commits locais por tarefa; **push e merge só com a frase do Leandro** ("pode subir", "pode fazer o merge do PR #N").

## Global Constraints

- Só `super_admin`; a permissão é checada no servidor com o `guard = requireRole()` já usado em `seo-routes.ts`.
- Escrita só por `data.savePageDoc(seoKey(path), toSeoDoc(doc), userId)` e `data.setImageAlt(slug, src, alt, userId)`. Limites vigentes: título 120, descrição 320, alt 150 caracteres.
- Faixas das regras: título de 30 a 60 caracteres, descrição de 70 a 155, alt até 150.
- Nada vai ao ar sem revisão: **Aplicar** só grava o que o Leandro marcou. Todo lote tem **Desfazer**.
- Só páginas em português (`lang === "pt"`) com `facts` não nulos entram nas propostas.
- Migração numerada `0019` (a última existente é `0018_seo_duelo.sql`). O arquivo vai no PR; quem aplica no Supabase é o Leandro, no SQL Editor, depois de autorizar.
- As rotas novas precisam republicar o site: entram em `AFFECTS_SITE` (`src/api/lib/publish.ts`) e ganham rótulo em `src/api/lib/audit.ts`.
- Testes antes do código, `set -o pipefail` nos comandos com pipe. Antes da suíte completa, rodar o build de 3 passos (`vite build && vite build --ssr src/web/entry-server.tsx --outDir dist-ssr && bun vite/prerender.ts`).
- Texto de tela em português do Brasil, sem travessão, e passado pelo `stop-slop-pt-br`.

## Review Focus

1. **Duplo clique em Aplicar:** dois pedidos seguidos não podem gravar o mesmo lote duas vezes. Teste na Tarefa 3 (`begin` devolve null) e na 4 (índice único parcial na migração).
2. **A página mudou entre a proposta e a aplicação:** o item é pulado com o motivo, e nada é sobrescrito. Tarefa 3.
3. **Desfazer depois de edição manual:** se o valor atual não é mais o "depois", o item é pulado. Tarefa 3.
4. **Texto com tags, aspas, emoji ou espaços duplos:** o servidor limpa e recusa `<` e `>`. Tarefas 1 e 3.
5. **Páginas EN e ES, ou sem resposta na auditoria:** ficam fora das propostas, para não aplicar texto em português onde não cabe. Tarefa 1.

---

### Task 1: Regras de proposta

**Files:**
- Create: `packages/web/src/api/lib/seo/fix-rules.ts`
- Test: `packages/web/tests/seo/fix-rules.test.ts`

**Interfaces:**
- Consumes: `PageFacts` (`./html`), `Check` (`./score`), `SiteArea` e `Lang` (`./types`), `PageOverrides` (`../../../web/lib/seo-overrides`).
- Produces:
  - `type FixKind = "titulo" | "descricao" | "compartilhamento" | "imagens"` e `const FIX_KINDS: readonly FixKind[]`
  - `type FixField = "title" | "description" | "ogImage" | "alt"`
  - `type FixPage = { path: string; label: string; lang: Lang; area: SiteArea; overrides: PageOverrides; facts: PageFacts | null; checks: Check[] }`
  - `type FixItem = { id: string; kind: FixKind; path: string; label: string; field: FixField; target?: string; before: string; after: string }` (o `id` é `${kind}:${path}:${target ?? ""}`)
  - `clean(text: string): string`, `proposeTitle(label: string): string`, `proposeDescription(label: string, area: SiteArea): string`, `proposeAlt(label: string, n: number): string`
  - `currentValue(page: FixPage, field: "title" | "description" | "ogImage"): string` (`overrides[field]` primeiro, depois o valor da auditoria, senão `""`)
  - `buildProposals(kind: FixKind, pages: FixPage[]): FixItem[]`

- [ ] **Step 1: Write the failing test** em `fix-rules.test.ts`, com estes casos e valores:
  - `clean("  <b>Olá</b>  mundo   ")` devolve `"Olá mundo"`.
  - `proposeTitle("Esteira Transportadora Dalla")` devolve `"Esteira Transportadora Dalla | Demakine"`.
  - `proposeTitle("Rosca")` devolve `"Rosca | Demakine Equipamentos Agroindustriais"` (os sufixos curtos ficam abaixo de 30).
  - Um rótulo de 80 caracteres dá título com no máximo 60, terminando em `" | Demakine"`, sem cortar palavra e sem reticências.
  - Para cada `SiteArea`, `proposeDescription("Esteira Dalla", area)` tem de 70 a 155 caracteres e contém o rótulo.
  - `proposeAlt("Esteira Dalla", 2)` devolve `"Esteira Dalla Demakine, foto 2"`; com rótulo de 200 caracteres, no máximo 150.
  - `buildProposals("titulo", ...)`: inclui página pt com o check `titulo` falhando; **exclui** página `en`, página com `facts: null` e página com o check `ok` ou `skipped`; exclui item em que `after === before`.
  - `buildProposals("imagens", ...)`: só caminhos `/produtos/<slug>`, um item por foto com `alt` `null` ou `""`, `target` igual ao `src` da foto, `after` de `proposeAlt(label, posição da foto entre as fotos do produto)`.
  - `buildProposals("compartilhamento", ...)`: só quando não há `overrides.ogImage` nem `facts.og.image`; `after` é o caminho (`/img/...`) da primeira foto do próprio site; sem foto do site, nenhum item.
  - `currentValue` prefere o override ao valor auditado.

- [ ] **Step 2: Run** `cd packages/web && bun test tests/seo/fix-rules.test.ts` **Expected:** FAIL ("Export named ... not found").
- [ ] **Step 3: Implement** as funções acima em `fix-rules.ts`. `clean` tira tags, troca espaços especiais e múltiplos por um espaço e apara. `proposeTitle` testa os sufixos na ordem `" | Demakine"`, `" | Demakine Limeira/SP"`, `" | Demakine Equipamentos Agroindustriais"`, escolhendo o primeiro com total entre 30 e 60; se o nome for longo, corta por palavra até caber com `" | Demakine"`. `proposeDescription` usa um modelo por área (produtos, categorias, comerciais, blog, resto), ajustado à faixa 70 a 155.
- [ ] **Step 4: Run** o mesmo comando. **Expected:** PASS.
- [ ] **Step 5: Commit** `git add packages/web/src/api/lib/seo/fix-rules.ts packages/web/tests/seo/fix-rules.test.ts docs/superpowers && git commit -m "Guerra: regras de proposta para título, descrição, alt e compartilhamento"` (o primeiro commit também leva o desenho e este plano, copiados para o worktree novo).

---

### Task 2: Pacote de prompt

**Files:**
- Create: `packages/web/src/api/lib/seo/fix-prompt.ts`
- Test: `packages/web/tests/seo/fix-prompt.test.ts`

**Interfaces:**
- Consumes: `DuelAction` (`./duel-actions`), `Verdict` e `MetricId` (`./duel-metrics`).
- Produces: `type PromptPack = { versao: 1; tipo: "pagina" | "post" | "codigo" | "texto"; metrica: MetricId; concorrente: string; diferenca: { nos: number; eles: number; unidade: Verdict["unit"] }; objetivo: string; paginasAlvo: { path: string; label: string }[]; regras: string[]; entrega: string[] }` e `buildPromptPack(action: DuelAction, verdict: Verdict): PromptPack` e `packToJson(pack: PromptPack): string`.

- [ ] **Step 1: Write the failing test:** `tamanho` gera `tipo: "pagina"`, `blog` gera `"post"`, `h1`, `schema` e `idiomas` geram `"codigo"`, `conteudo` gera `"texto"`. `diferenca` traz `ours` e `theirs` do veredito e a unidade. `entrega` contém a frase de que o merge só acontece com a autorização do dono. `regras` cita tradução en e es. `packToJson` volta a ser o mesmo objeto com `JSON.parse`, e o texto não contém `password`, `DATABASE_URL`, `SECRET` nem `KEY`.
- [ ] **Step 2: Run** `bun test tests/seo/fix-prompt.test.ts`. **Expected:** FAIL.
- [ ] **Step 3: Implement** o mapa métrica para tipo, as listas `regras` e `entrega` como constantes (tom de voz da Demakine, SEO, tradução en e es, revisão de texto; branch, PR, preview, merge só com autorização) e `objetivo` montado de `action.title`. `paginasAlvo` vem de `action.pages`.
- [ ] **Step 4: Run.** **Expected:** PASS.
- [ ] **Step 5: Commit** `"Guerra: pacote de prompt em JSON para o que não cabe no painel"`.

---

### Task 3: Aplicar e desfazer lotes

**Files:**
- Create: `packages/web/src/api/lib/seo/fix-apply.ts`
- Test: `packages/web/tests/seo/fix-apply.test.ts`

**Interfaces:**
- Consumes: `FixItem`, `FixKind` (Tarefa 1).
- Produces:
  - `type ItemResult = "gravado" | "pulado" | "desfeito"`; `type BatchItem = FixItem & { result: ItemResult; reason?: string }`
  - `type FixBatch = { id: number; at: string; userId: string; metric: FixKind; status: "aplicando" | "aplicado" | "parcial" | "desfeito"; items: BatchItem[] }`
  - `interface FixStore { begin(userId: string, metric: FixKind): Promise<{ id: number } | null>; finish(id: number, items: BatchItem[], status: FixBatch["status"]): Promise<void>; get(id: number): Promise<FixBatch | null>; list(limit: number): Promise<FixBatch[]> }`
  - `interface FixWriters { current(item: Pick<FixItem, "path" | "field" | "target">): Promise<string>; write(item: Pick<FixItem, "path" | "field" | "target">, value: string, userId: string): Promise<void> }`
  - `validateItem(item: FixItem): string | null` (devolve o motivo da recusa ou `null`)
  - `applyFixes(items: FixItem[], deps: { store: FixStore; writers: FixWriters; userId: string; metric: FixKind; knownPaths: Set<string> }): Promise<{ batchId: number; applied: number; skipped: { id: string; reason: string }[] }>`
  - `undoBatch(batchId: number, ids: string[] | undefined, deps: { store: FixStore; writers: FixWriters; userId: string }): Promise<{ undone: number; skipped: { id: string; reason: string }[] }>`

- [ ] **Step 1: Write the failing test** com `FixStore` e `FixWriters` em memória:
  - Aplica itens e grava só os marcados; o lote termina `aplicado` (todos gravados) ou `parcial` (algum pulado).
  - `current !== before` pula com o motivo `"mudou desde a proposta"` e **não grava**.
  - `begin` devolvendo `null` lança `Error("Já existe uma aplicação em andamento")` e não grava nada.
  - `validateItem` recusa `<` e `>` no `after`, título acima de 120, descrição acima de 320, alt acima de 150, `after` vazio, `ogImage` fora de `/...` ou `https://`, e `field` incompatível com `kind`.
  - Caminho fora de `knownPaths` é pulado com `"página não encontrada"`.
  - Mais de 200 itens: lança `Error("Aplique no máximo 200 itens por vez")`.
  - `undoBatch` devolve o `before` quando `current === after`; se `current !== after`, pula com `"alterado depois da aplicação"`; um lote já `desfeito` lança `Error("Lote já desfeito")`; com `ids`, desfaz só esses itens.
- [ ] **Step 2: Run** `bun test tests/seo/fix-apply.test.ts`. **Expected:** FAIL.
- [ ] **Step 3: Implement** em `fix-apply.ts`. Fluxo: valida, `begin`, para cada item confere `current` e grava com `writers.write`, e fecha com `finish`. Um erro de escrita num item vira "pulado" com o motivo, e o lote segue.
- [ ] **Step 4: Run.** **Expected:** PASS.
- [ ] **Step 5: Commit** `"Guerra: aplicar e desfazer lotes com conferência do valor atual"`.

---

### Task 4: Persistência dos lotes e escritores

**Files:**
- Modify: `packages/web/src/api/database/schema.ts` (tabela `seoFixBatches`)
- Create: `packages/web/drizzle/0019_seo_correcoes.sql` (gerado por `bun run db:generate`, mais snapshot e journal)
- Create: `packages/web/src/api/lib/seo/fix-store.ts`
- Modify: `packages/web/src/api/lib/seo/data.ts` (campo `fix` em `SeoData`)
- Test: `packages/web/tests/seo/fix-schema.test.ts`

**Interfaces:**
- Consumes: `FixStore`, `FixWriters` (Tarefa 3), `FixPage` (Tarefa 1).
- Produces: `createFixStore(db): FixStore`, `createFixWriters(deps): FixWriters`, `currentAlt(productDoc: { imageAlts?: Record<string, string> } | undefined, codeAlts: Record<string, string> | undefined, key: string): string` e, em `SeoData`, `fix: { pages(): Promise<FixPage[]>; store: FixStore; writers: FixWriters }`.

- [ ] **Step 1: Write the failing test** `fix-schema.test.ts`: a tabela `seoFixBatches` tem as colunas `id`, `createdAt`, `userId`, `metric`, `status`, `items`; o SQL da migração contém `CREATE UNIQUE INDEX` com `WHERE status = 'aplicando'`; `currentAlt` prefere o alt do documento do produto ao do código, e devolve `""` quando não há nenhum.
- [ ] **Step 2: Run** `bun test tests/seo/fix-schema.test.ts`. **Expected:** FAIL.
- [ ] **Step 3: Implement** a tabela `seo_fix_batches` (`id serial pk`, `created_at timestamptz default now`, `user_id text`, `metric text`, `status text`, `items jsonb`), mais o índice único parcial em `status` onde `status = 'aplicando'`. `createFixStore.begin` marca como `parcial` os lotes `aplicando` com mais de 2 minutos (queda no meio) e insere um novo; uma violação do índice devolve `null`. Os escritores: `write` para `title`, `description` e `ogImage` **funde** o valor no documento de SEO existente (`overrides` da página) e chama `savePageDoc(seoKey(path), toSeoDoc(...))`; para `alt` chama `setImageAlt(slug, target, value, userId)`. `current` lê o override para os três primeiros e `currentAlt` para o alt.
- [ ] **Step 4: Run** `bun run db:generate` (confere que só nasceu a `0019`), depois o teste. **Expected:** PASS.
- [ ] **Step 5: Commit** `"Guerra: tabela de lotes de correção (migração 0019) e escritores"`. **A migração não é aplicada no Supabase aqui:** o Leandro autoriza e aplica no SQL Editor.

---

### Task 5: Rotas, rótulos e republicação

**Files:**
- Modify: `packages/web/src/api/seo-routes.ts`, `packages/web/src/api/lib/audit.ts`, `packages/web/src/api/lib/publish.ts`
- Test: `packages/web/tests/seo/routes-permissions.test.ts`

**Interfaces:**
- Consumes: `buildProposals`, `FIX_KINDS` (T1), `buildPromptPack`, `packToJson` (T2), `applyFixes`, `undoBatch` (T3), `data.fix` (T4).
- Produces: `POST /admin/seo/corrigir/propor` (corpo `{ metric }`, resposta `{ items: FixItem[] }`), `POST /admin/seo/corrigir/aplicar` (`{ metric, items }`, resposta `{ batchId, applied, skipped }`), `GET /admin/seo/corrigir/lotes` (resposta `{ batches: FixBatch[] }`, os 20 mais novos), `POST /admin/seo/corrigir/desfazer` (`{ batchId, ids? }`, resposta `{ undone, skipped }`), `POST /admin/seo/corrigir/prompt` (`{ metric }`, resposta `{ json: string }`).

- [ ] **Step 1: Write the failing test** em `routes-permissions.test.ts`: as 5 rotas entram na lista de rotas só do `super_admin` (as outras funções recebem 403, sem sessão 401); `propor` devolve itens e recusa `metric` fora de `FIX_KINDS` com 400; `aplicar` com `path` que não existe no site pula o item e **não grava**; `aplicar` com mais de 200 itens dá 400; `desfazer` de lote inexistente dá 404; `prompt` para `h1` devolve JSON válido e para um `metric` sem derrota no último duelo dá 409 com a mensagem "Rode o duelo primeiro"; `audit.ts` rotula as 5 rotas e `affectsSite` é verdadeiro para `aplicar` e `desfazer`.
- [ ] **Step 2: Run** `bun test tests/seo/routes-permissions.test.ts`. **Expected:** FAIL.
- [ ] **Step 3: Implement** as rotas encadeadas em `seo-routes.ts`, com `validator("json", ...)` no padrão das rotas vizinhas e erros em português; rótulos como "Propôs correções do duelo", "Aplicou correções do duelo", "Desfez correções do duelo", "Copiou o prompt do duelo"; adicionar `/^\/api\/admin\/seo\/corrigir\/(aplicar|desfazer)$/` a `AFFECTS_SITE`. Atualizar os fakes de `SeoData` nos testes para incluir `fix`.
- [ ] **Step 4: Run** o arquivo e depois `bun test tests/seo`. **Expected:** PASS.
- [ ] **Step 5: Commit** `"Guerra: rotas de propor, aplicar, desfazer, listar lotes e prompt"`.

---

### Task 6: Tela de revisão e botões

**Files:**
- Create: `packages/web/src/web/admin/seo-geo/fix-review.tsx`
- Modify: `packages/web/src/web/admin/seo-geo/data.ts` (hooks), `packages/web/src/web/admin/seo-geo/duel.tsx` (botões)
- Test: `packages/web/tests/seo/fix-ui-contract.test.ts`

**Interfaces:**
- Consumes: as rotas da Tarefa 5 pelo cliente tipado `api`; `FIX_KINDS` (lista espelho em `src/web/admin/seo-geo/model.ts`).
- Produces: hooks `useProporCorrecao`, `useAplicarCorrecao`, `useLotesCorrecao`, `useDesfazerCorrecao`, `useCopiarPrompt` e o componente `FixReview({ metric, explanation, onClose })`.

- [ ] **Step 1: Write the failing test** `fix-ui-contract.test.ts`: a lista de métricas "corrigíveis" do painel é igual à `FIX_KINDS` da API; `duel.tsx` mostra o botão "Corrigir" só para elas e "Copiar prompt" para todas as outras.
- [ ] **Step 2: Run** `bun test tests/seo/fix-ui-contract.test.ts`. **Expected:** FAIL.
- [ ] **Step 3: Implement.** `duel.tsx`: em cada ação, o botão **Corrigir** (abre `FixReview`) ou **Copiar prompt** (copia o JSON com `navigator.clipboard.writeText` e, sem permissão, cai num campo de texto selecionável; mostra "Prompt copiado"). `FixReview`: a explicação da derrota no alto; lista por página com caixa de marcação (todas marcadas), o antes, o depois editável com contador de caracteres e a faixa recomendada; botões **Aplicar marcadas** e **Cancelar**; depois de aplicar, mostra o resumo (gravados e pulados com o motivo) e **Desfazer este lote**. Uma seção "Lotes aplicados" no fim da aba lista os últimos 20 com **Desfazer**. Estados de carregando, vazio ("Nada para corrigir neste item") e erro em todas as telas. Textos revisados com o `stop-slop-pt-br`.
- [ ] **Step 4: Run** o teste, `bun run typecheck` e `bun run lint`. **Expected:** PASS, sem erro.
- [ ] **Step 5: Commit** `"Guerra: botões Corrigir e Copiar prompt e tela de revisão com antes e depois"`.

---

### Task 7: Verificação completa

**Files:** nenhum arquivo novo (correções só se aparecer problema).

- [ ] **Step 1:** Build de 3 passos, depois `bun test`, `bun run typecheck` e `bun run lint`. **Expected:** tudo verde (a suíte passa de 810 testes).
- [ ] **Step 2:** Verificação no navegador com o harness de API falsa: abrir a aba Guerra é Guerra, clicar **Corrigir** em Títulos, ver o antes e o depois, desmarcar um item, aplicar, ver o resumo, **Desfazer este lote**; clicar **Copiar prompt** em Tamanho do site e conferir o JSON. Conferir o celular (375 px), erro de console e foco do teclado.
- [ ] **Step 3:** Checklist de segurança dos 20 itens, em tabela ✅, ❌ e N/A (rotas só `super_admin`, validação no servidor, sem HTML gravado, sem segredo no prompt, migração com RLS conforme as demais tabelas `seo_*`).
- [ ] **Step 4:** Revisão final do branch inteiro por quem não escreveu o código (modelo mais capaz). Corrigir o que for Crítico ou Importante, cada correção com teste que falhou antes.
- [ ] **Step 5:** Abrir o PR **só com o "pode subir"** do Leandro. A migração `0019` é aplicada por ele no Supabase antes do merge, senão as rotas de lote dão erro em produção. Testar o preview da Vercel antes do merge, como combinado.
