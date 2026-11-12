# Área "SEO e GEO" do painel administrativo da Demakine: desenho

Data: 11/11/2026. Autor: Claude, a pedido do Leandro. Estado: **aprovado pelo Leandro em 11/11/2026, com os ajustes da seção 13**. Nada foi construído ainda.

## 1. Intenção e porquê

O Leandro quer abrir o painel e, sem depender de ninguém, saber **como está o SEO do site, se está melhorando, o que consertar primeiro e se a Demakine aparece nas respostas das IAs** (ChatGPT, Gemini, Perplexity, Claude, respostas de IA do Google). Hoje o painel só edita título e descrição de 14 páginas.

O problema que isso resolve: nos dias 9 e 10/11 foram corrigidos dezenas de itens de SEO que ninguém via. Eles só apareceram porque o Marketing auditou o site à mão. A área nova faz essa auditoria sozinha, todo dia, e guarda o histórico.

## 2. Objetivos, não objetivos e antiobjetivos

**Objetivos**
- Uma **nota de SEO e uma nota de GEO**, de 0 a 100, por página e para o site, com o cálculo aberto (quanto cada item vale e por que perdeu pontos).
- **Histórico diário** das notas, com a linha do tempo do que mudou em cada dia.
- Lista **"o que melhorar"** ordenada por impacto, com a correção sugerida ao lado.
- **Ligação com o Google Analytics (GA4) e o Search Console**: cliques, impressões, posições, conversões do orgânico, indexação.
- **Controle por página**: ocultar do Google, tirar do sitemap, endereço oficial (canonical), resposta curta, autor, data de revisão.
- **Lista privada de palavras-chave** com posição acompanhada.
- **Alertas** por e-mail quando algo piora.
- **Dicas de uso** dentro da própria tela.

**Não objetivos**
- Não promete posição nem citação por IA. As notas são uma medida de saúde, não uma garantia.
- Não substitui o Search Console para pedir indexação (o Google não deixa automatizar).
- Alertas por WhatsApp ficam de fora: só e-mail e aviso no painel.
- Não edita o texto das páginas comerciais escritas pelo Marketing (`content/landing/*.md`): só sinaliza e sugere.

**Antiobjetivos (o que faria isso falhar)**
- **Texto ou palavra-chave escondida dentro da página** (invisível ao visitante, visível ao Google): viola as diretrizes do Google e pode derrubar o site. As palavras-chave "ocultas" do pedido viram uma **lista privada do painel**, nunca texto na página. A etiqueta `meta keywords` não é usada (o Google a ignora).
- Uma nota que o Leandro não consegue explicar. Se não dá para mostrar de onde veio cada ponto, a nota não entra.
- Segredos do Google ou de IA no navegador, no Git ou em log.
- Auditor que derruba o site ou estoura o custo.

## 3. Restrições e o que já existe (conferido no código)

- **Stack:** Bun, Vite, React, Hono na API, Drizzle com Postgres (Supabase, projeto `jxgzlkekxgtnkusefzlh`), Vercel. O banco é acessado direto pelo servidor (RLS ligado, sem policies).
- **Painel:** `src/web/pages/admin.tsx` registra cada seção (`id`, `label`, ícone, `area`). Telas em `src/web/admin/*.tsx`. Já existem `seo.tsx` (título e descrição de 14 páginas), `redirects.tsx`, `visits.tsx` (medição própria), `activity.tsx` (registro de atividades).
- **API:** `src/api/index.ts`, rotas `/api/admin/*` com `requireRole(...)`. Papéis: `super_admin`, `admin`, `editor`, `vendedor`, `rh`.
- **Conteúdo editável:** tabela `content_docs(collection, key, data jsonb)`. A coleção `seo` guarda título e descrição por página (`seoKey(path)`). Editar chama `lib/publish.ts`, que dispara o Deploy Hook da Vercel (no máximo 1 build por minuto) e refaz o HTML pré-renderizado.
- **Cron:** `vercel.json` já tem `/api/cron/diario` (11:00 UTC) protegido por `CRON_SECRET`.
- **E-mail:** `src/api/lib/email.ts` (`sendEmail`, `emailLayout`) e avisos configuráveis em `/api/admin/avisos`.
- **Dados próprios:** `page_views` (caminho, origem, referrer, aparelho, cidade), `leads` (mensagens), `site_reviews` (avaliações), `audit_log`.
- **Sitemap:** `src/api/lib/sitemap.ts` (`buildSitemap(docs, jobs)`), servido pela API.
- **Regras do projeto:** alteração de `vercel.json` e de middleware só vai para o ar depois de testada no preview da Vercel. Escrita em banco de produção e variável de ambiente pedem a confirmação do Leandro. Nada de dependência nova sem benefício claro.

## 3A. Cobertura total das páginas e regras editáveis (pedido do Leandro)

- **Toda página do site aparece na área, sem exceção:** produtos, categorias, as 10 páginas comerciais, blog, cases, segmentos, vagas, páginas institucionais, exportação e as versões em inglês e espanhol. Cada uma tem a sua nota, as suas regras de SEO e de GEO editáveis e o seu estado de indexação.
- **Página nova entra sozinha.** A lista de páginas não é fixa: vem da mesma fonte do sitemap (`buildSitemap`) mais as páginas que o painel oculta. Quando o Leandro cria um produto, post, case ou vaga no painel, a página aparece na área na hora, com a nota "ainda não auditada" até a próxima auditoria (ou até clicar em "Auditar agora" naquela página).
- **Toda página nasce indexável.** O padrão é aparecer no Google. O painel nunca esconde nada sozinho. Só ficam fora do Google as páginas técnicas: `/obrigado` (3 idiomas, para não contaminar a contagem de conversões), `/loja` enquanto estiver "em breve", a página de erro 404 e o `/admin`. Qualquer outra página que apareça como não indexável é marcada como **atenção** na lista "o que melhorar".
- **Regras editáveis em dois níveis:**
  1. **Por página:** título, descrição, canonical, indexar ou não, estar ou não no sitemap, imagem de compartilhamento, resposta curta, autor, data de revisão.
  2. **Do site inteiro ("Regras da nota"):** limites (por exemplo, o tamanho ideal do título), o peso de cada item da nota (a soma tem de dar 100) e quais páginas são prioritárias. Há um botão "voltar ao padrão". Mudar uma regra recalcula as notas na próxima auditoria e fica registrado no histórico.

## 4. As 27 funções e a divisão em 4 etapas

São quatro projetos independentes. Cada etapa vai ao ar sozinha, com PR, testes e conferência em produção, antes da próxima.

### Etapa 1: Fundação e auditor do site (só com o que o site já tem)
Entrega valor no primeiro dia e não depende de ninguém.
- **S1** Nota de SEO por página e do site, com cálculo aberto.
- **S2** Histórico diário + linha do tempo (o que mudou em cada dia).
- **S3** Alertas por e-mail e no painel (eventos do site: nota caiu, página saiu do ar, 404 novo, sitemap inválido).
- **S4** Editor de SEO de **qualquer** página (produtos, posts, cases, as 10 páginas novas), com prévia do Google (computador e celular), contador de caracteres e imagem de compartilhamento.
- **S5** Visibilidade por página: ocultar do Google (`noindex`), tirar do sitemap, canonical manual, com aviso se a página recebe visitas.
- **S10** Verificador de links quebrados e redirecionamentos em cadeia, com botão "criar redirecionamento".
- **S11** Importador de endereços antigos em lote (cola a lista, testa cada um, mostra os 404, cria os redirecionamentos).
- **S12** Painel de imagens: sem descrição, nome só de número, peso, e **editor de `alt` por foto** no painel.
- **S13** Painel de dados estruturados: o que o Google lê de cada página e o que falta.
- **Dicas que mudam sozinhas:** todo dia o cron escolhe **15 dicas novas**. Parte vem dos problemas reais que o auditor achou naquele dia (sempre atuais, sem custo) e parte de uma biblioteca de dicas escritas à mão (pelo menos 60 no começo, crescendo com o tempo), sem repetir uma dica até a biblioteca inteira ser usada. Cada dica diz em que aba agir e tem "marcar como feito". Com a Etapa 4 (IA) as dicas passam a ser escritas também sob medida para o site.

### Etapa 2: GEO com os dados do site
- **G5** Nota GEO por página e do site.
- **G6** Campo "Resposta curta" (40 a 60 palavras) em cada página, **exibido na própria página**, logo abaixo do título. O mesmo vale para o autor e para "Revisado em": tudo que o painel guarda para as IAs aparece também para o visitante. Nada fica escondido.
- **G9** Frescor: data da última revisão, lista dos conteúdos antigos e lembrete a cada 6 meses.
- **G2** Tráfego vindo de IA (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai), usando a tabela `page_views`.
- **G3** Controle dos robôs de IA no `robots.txt` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended e outros), com aviso do que cada bloqueio custa.
- **G4** Gerador de `llms.txt` a partir do catálogo (bônus de baixo custo; nenhum buscador confirma que usa).
- **G8** Consistência da marca: nome, endereço, telefone e redes iguais no site e nos dados estruturados.
- **G11** Reputação e provas: avaliações e cases ligados ao schema; páginas sem prova social.
- **G12** Vídeos prontos para citação: título, descrição e texto de apoio na página.
- **D1 "Guerra é Guerra": duelo com 2 concorrentes, com dados públicos.** O Leandro informa os sites de 2 concorrentes (dá para trocar quando quiser). O painel aplica o **mesmo auditor** nas páginas públicas deles (home, categorias e produtos, descobertas pelo sitemap deles, no máximo 40 páginas por concorrente) e mostra, setor por setor e área por área, **onde a Demakine está melhor e onde está pior**: nota de SEO, velocidade (PageSpeed), conteúdo (palavras, perguntas e respostas com schema, tabelas), imagens (descrição das fotos), dados estruturados, idiomas, frequência de publicação no blog (datas do sitemap deles) e tamanho do site (número de páginas). O resultado é um placar, com um **"o que fazer para ganhar"**: lista de ações ordenada por tamanho da diferença e esforço, cada uma apontando a página da Demakine a corrigir. Rodada semanal e botão "Duelar agora". Só lê páginas públicas, respeita o `robots.txt` deles, faz no máximo 1 requisição por segundo e identifica o robô; não copia conteúdo.
- **V1 Painel de velocidade e notas por setor, no estilo do PageSpeed Insights do Google.** Para cada página, no celular e no computador:
  - As **4 notas do Lighthouse** (as mesmas do PageSpeed): Desempenho, Acessibilidade, Boas práticas e SEO.
  - Os **Core Web Vitals**: LCP, INP e CLS, mais FCP e TTFB, com o semáforo verde, amarelo e vermelho do Google e o dado de usuários reais quando o Google tiver.
  - A lista de **oportunidades e diagnósticos** (o que atrasa a página e quanto tempo ganha ao corrigir).
  - **Notas dos setores próprios da Demakine**, calculadas pelo auditor: Conteúdo, Imagens, Links, Dados estruturados, Idiomas, Segurança (cabeçalhos e política de segurança) e GEO.
  - **Visão por área do site:** nota média de Produtos, Categorias, Páginas comerciais, Blog, Cases, Segmentos, Institucional, Vagas e Exportação.
  - **Histórico** de cada nota e alerta se piorar. Usa a API gratuita PageSpeed Insights (chave grátis do Google Cloud; sem chave vale a cota gratuita, mais limitada). As medições rodam por cron em lotes, porque cada página leva cerca de 20 a 60 segundos.

### Etapa 3: Ligação com o Google (Analytics, Search Console, PageSpeed)
Depende de o Leandro dar o acesso (seção 7). Enquanto isso, as etapas 1 e 2 andam.
- **S6** Palavras-chave privadas, com página-alvo, meta e posição. **Posição no Google, de duas formas:** (a) **Search Console (grátis, é a base):** posição média de cada página e de cada busca, atualizada a cada dia com 2 a 3 dias de atraso, e só para buscas que já mostraram a Demakine pelo menos uma vez; (b) **rastreador de posição por API (opcional, pago por consulta, com teto):** a posição exata de cada palavra da lista em uma data e cidade escolhidas, inclusive para quem ainda não aparece. Começa só com (a).
- **S6a Alertas de queda de posição.** Regras padrão (editáveis): uma palavra da lista perde 3 ou mais posições em relação à média da semana anterior; uma página sai do top 10; uma página perde 30% dos cliques ou das impressões na semana; uma palavra da lista deixa de aparecer. Aviso no painel e, quando houver e-mail, por e-mail. O painel mostra o tamanho da amostra e avisa quando a variação é ruído (poucas impressões).
- **S7** Monitor de indexação: quais páginas estão no Google, quais ficaram de fora e por quê.
- **S8** Oportunidades: páginas "quase lá" (posição 8 a 20), CTR baixo, buscas sem página própria, páginas disputando a mesma busca (canibalização).
- **S15** Conversões do orgânico por página (GA4) + relatório semanal automático por e-mail.
- **S14** Velocidade e Core Web Vitals: já entregue na Etapa 2 (V1). Na Etapa 3 só entram os alertas de queda.
- **S3 (extensão)** Alertas de indexação e de queda de posição (S6a).
- **D2 Duelo com posições:** a Etapa 1 do duelo ganha a comparação de visibilidade nas buscas das palavras da lista (quem aparece para cada termo) usando o rastreador por API (S6, forma b), e o placar passa a incluir posição.

### Etapa 4: IA (chamadas pagas, com teto de gasto)
Depende de chaves e de um teto mensal definido pelo Leandro.
- **S9** Sugestão de título e descrição (3 versões dentro do limite).
- **G7** Perguntas reais dos clientes (mensagens de formulário e WhatsApp, **anonimizadas**) viram rascunho de FAQ.
- **G1** "Aparecemos nas IAs?": perguntas-chave feitas toda semana a ChatGPT, Gemini, Perplexity e Claude; registra se a Demakine foi citada, a posição e os concorrentes. Cada pergunta é repetida várias vezes e o painel mostra a média, porque a resposta varia.
- **G10** Menções fora do site e alvos de contato.
- **D3 Duelo nas IAs:** em que perguntas as IAs citam o concorrente em vez da Demakine, e o que mudar no conteúdo para ser citada. Mais a explicação em texto do "o que fazer" do duelo, escrita pela IA.

## 5. Como funciona o auditor (Etapa 1)

**O que é auditado:** as páginas do `sitemap.xml` (cerca de 194 endereços) mais as ocultas pelo painel. A página é buscada **do site no ar**, o mesmo HTML que o Google vê. Uma fonte única de verdade: nada de reimplementar o que a página mostra.

**Como roda:** a função `auditSite()` busca as páginas com concorrência de 8, extrai título, descrição, H1, canonical, robots, hreflang, imagens, links internos, dados estruturados (JSON-LD) e contagem de palavras, grava o resultado e calcula as notas. Roda em dois momentos: **cron diário às 07:00 de Brasília** (`/api/cron/seo`, protegido por `CRON_SECRET`) e **botão "Auditar agora"** (papel `admin`). Para caber no tempo da função, o trabalho é dividido em lotes com cursor, e uma execução incompleta continua na seguinte.

**Verificador de links (S10):** reúne os links internos de todas as páginas, testa cada endereço único com `HEAD` (no máximo 800 por execução, com cache de 24 h) e segue redirecionamentos até 5 saltos. Só acessa o próprio domínio (proteção contra SSRF).

### Nota de SEO por página (soma 100)
| Item | Pontos | Como pontua |
|---|---|---|
| Título | 15 | existe, 30 a 60 caracteres, não repetido em outra página, com a palavra-chave-alvo se houver |
| Descrição | 10 | 70 a 155 caracteres, não repetida |
| H1 | 10 | exatamente um, não vazio |
| Indexação | 10 | responde 200, canonical próprio, sem `noindex` indevido |
| Idiomas | 5 | hreflang coerente com as versões que existem |
| Conteúdo | 10 | páginas comerciais com 300 palavras ou mais e subtítulos |
| Imagens | 10 | % com `alt`, sem arquivo gigante |
| Links internos | 10 | a página recebe pelo menos 3 links de outras e envia pelo menos 3 |
| Dados estruturados | 10 | o tipo esperado para a página, com os campos obrigatórios |
| Compartilhamento | 5 | `og:title`, `og:description`, `og:image` |
| Velocidade | 5 | só na Etapa 3; até lá os 5 pontos se redistribuem |

### Nota de GEO por página (soma 100)
Resposta curta no topo (20), FAQ com schema (15), tabela ou dados numéricos citáveis (15), frescor, revisão em até 12 meses (10), autoria e entidade clara (10), consistência da marca (10), schema coerente (10), prova social (5), vídeo ou mídia de apoio (5).

### Nota do site
Média das páginas, com **peso maior** para as 10 páginas comerciais e os produtos (as "prioritárias", ajustáveis no painel), menos penalidades técnicas do site inteiro: sitemap inválido, `robots.txt` bloqueando, links internos quebrados. Páginas ocultas pelo painel ficam fora da média.

As versões em inglês e espanhol entram na auditoria (hreflang, texto sem tradução, descrição repetida), com peso de 25% do de uma página em português (decisão minha, ajustável).

## 6. Modelo de dados

Novas tabelas (migração SQL, aplicada só com a confirmação do Leandro):
- `seo_runs(id, started_at, finished_at, kind, pages_audited, site_seo_score, site_geo_score, status)`
- `seo_page_scores(run_id, path, lang, seo_score, geo_score, checks jsonb, title, description, h1, words, status_code, indexable, inlinks, schema_types)` com índice em `(path, run_id)`
- `seo_issues(id, path, code, severity, first_seen, last_seen, resolved_at)`: alimenta "o que melhorar" e os alertas
- `seo_keywords(id, term, target_path, goal_position, notes, archived)` e `seo_keyword_positions(keyword_id, date, position, clicks, impressions)`
- `gsc_page_daily(date, path, clicks, impressions, position)`, `gsc_query_daily(date, query, path, clicks, impressions, position)` (só as melhores consultas), `ga4_page_daily(date, path, channel, sessions, key_events)`
- `seo_pagespeed(run_id, path, strategy, perf, a11y, best_practices, seo, lcp, inp, cls, fcp, ttfb, opportunities jsonb)`
- `geo_prompts(id, text, category, active)` e `geo_runs(id, at, engine, prompt_id, sample, mentioned, position, cited_urls, competitors, excerpt, cost_cents)`

Reaproveitado: `content_docs` coleção `seo` ganha `noindex`, `noSitemap`, `canonical`, `ogImage`, `shortAnswer`, `author`, `reviewedAt`; `app_settings` chave `seo` guarda limites de alerta, destinatários, páginas prioritárias, teto de gasto de IA; `audit_log` alimenta a linha do tempo; `page_views` alimenta o tráfego de IA.

**Efeito no site:** ocultar uma página é uma edição de conteúdo. O fluxo existente (`publish.ts`) republica o site, e o HTML pré-renderizado sai com `noindex`; o sitemap deixa de listar a página. O painel avisa que leva cerca de 1 a 2 minutos.

## 7. Integrações externas

- **Google (Etapa 3):** uma **conta de serviço** do Google Cloud, adicionada como usuária de leitura no GA4 e no Search Console. O JSON da chave fica em variável de ambiente do servidor (`GOOGLE_SERVICE_ACCOUNT_JSON`), mais `GA4_PROPERTY_ID` e `GSC_SITE_URL`. A autenticação usa JWT assinado com o `crypto` do Node, sem biblioteca nova. APIs: GA4 Data API, Search Console (consultas de desempenho, sitemaps, inspeção de URL com a cota diária do Google) e PageSpeed Insights (chave gratuita `PSI_API_KEY`). Os dados são sincronizados por cron, para a tela não depender do tempo de resposta do Google.
- **IA (Etapa 4):** `ANTHROPIC_API_KEY` para sugestões e rascunhos; para o monitor de citações, as chaves dos mecanismos que têm busca na web (Perplexity, OpenAI, Gemini, Claude). Cada chamada é registrada com o custo. Um **teto mensal em reais** (definido pelo Leandro) interrompe as chamadas quando atinge, e o painel mostra a estimativa de gasto **antes** de ligar qualquer monitor.

## 8. Segurança, privacidade e permissões

- **A área inteira de SEO e GEO é só do `super_admin`:** ver, editar regras, ocultar páginas, palavras-chave, integrações, chaves e teto de gasto. `admin`, `editor` e os demais papéis nem veem o item no menu, e a API responde 403 para eles (`requireRole()` sem argumentos, como em `/admin/avisos`). A tela atual "SEO das páginas" (título e descrição das 14 páginas) continua como está para `admin` e `editor`; as duas telas gravam na mesma coleção `seo`, então não se contradizem.
- Todas as rotas em `/api/admin/seo/*` exigem `requireRole`; o cron exige `CRON_SECRET`. Mudanças de visibilidade e de redirecionamento entram no `audit_log`.
- O verificador e o importador só acessam `demakine.com.br` (lista de domínios permitidos). Validação de entrada com schema nas rotas.
- Segredos só em variável de ambiente do servidor. Nenhum segredo em log, resposta de API ou Git.
- **LGPD:** os dados do GA4 e do Search Console são agregados, sem pessoa identificada. As mensagens de clientes usadas em G7 passam por limpeza antes de sair do servidor (nome, e-mail, telefone, empresa e endereço são removidos); só o texto da dúvida segue para a IA.
- Os dados de monitoramento de IA e as palavras-chave são internos: nada disso aparece no site.

## 9. Como será testado e entregue

- Cálculo das notas em funções puras, com testes (uma página perfeita dá 100; cada item perde os pontos certos).
- Auditor testado com páginas de exemplo (HTML fixo) e conferido contra o site real.
- Cada etapa: branch própria, PR, preview da Vercel testado (inclusive o cron e qualquer mudança em `vercel.json`), migração SQL aplicada com confirmação, conferência em produção depois do merge.
- Telas conferidas no navegador, em computador e celular.

## 10. Decisões minhas (o Leandro pode trocar)

- Palavras-chave "ocultas" = lista privada do painel, sem texto escondido na página.
- A nota é "saúde", não promessa de posição.
- E-mail como único canal de alerta (WhatsApp fora).
- Auditor busca o site no ar, em vez de simular a página.
- Notas e páginas prioritárias começam com as 10 páginas comerciais + produtos; dá para ajustar.
- `llms.txt` entra como bônus de baixo custo.
- Ordem: 1, 2, 3, 4, com a Etapa 3 podendo andar assim que o acesso ao Google existir.

## 11. O que fica para o construtor

Nomes de tela e de componentes, forma exata dos gráficos, textos das dicas, parâmetros finos do auditor (concorrência, tamanho dos lotes), e os textos de cada correção sugerida.

## 12. Perguntas que só o Leandro responde

Respondidas em 11/11/2026 (seção 13).

## 13. Decisões do Leandro (11/11/2026)

1. **Acesso ao Google:** sim, o Leandro cria a conta de serviço (com o guia passo a passo) e libera o GA4 e o Search Console. A Etapa 3 segue como planejado.
2. **IA e custo:** "não sei". Vale o padrão seguro: **teto de R$ 0, nenhuma mensagem de cliente usada, Etapa 4 desligada** até ele decidir. A Etapa 4 só é planejada em detalhe depois.
3. **Alertas:** o e-mail fica para depois; até lá, só aviso dentro do painel. **A área é exclusiva do super admin.**
4. **Aprovação:** desenho e ordem 1, 2, 3, 4 aprovados.
5. **Todas as páginas** na área, regras editáveis por página e do site, e página nova aparecendo sozinha (seção 3A).
6. **Painel parecido com o PageSpeed Insights**, com notas por setor (função V1, Etapa 2).
7. Onde o Leandro pediu "notas de vários setores", o desenho entrega **as duas leituras**: por setor da avaliação (Desempenho, Acessibilidade, Conteúdo, Segurança...) e por área do site (Produtos, Blog, Segmentos...). Se ele quis só uma delas, é só dizer.

## 14. Pedidos do Leandro em 11/11/2026 (parte 2)

1. **Dicas:** devem mudar sozinhas, 15 novas por dia, pelo cron (seção 4, Etapa 1).
2. **Posição no Google e alerta de queda:** sim, pelo Search Console (grátis, média, com atraso) e, opcionalmente, por um rastreador pago (posição exata). Alertas de queda com regras editáveis (S6 e S6a, Etapa 3).
3. **"Guerra é Guerra":** duelo com 2 concorrentes, mostrando onde a Demakine está melhor e pior e o que fazer (D1 na Etapa 2, D2 na Etapa 3, D3 na Etapa 4).
4. **O que o duelo NÃO consegue com dados públicos e grátis:** tráfego real do concorrente, links que apontam para ele (backlinks) e as palavras para as quais ele aparece. Isso exige ferramentas pagas (Ahrefs, Semrush, Similarweb), que ficam fora do desenho até o Leandro decidir assinar alguma.
