# Guerra é Guerra: botão Corrigir e Copiar prompt

Data: 2026-11-16. Área: painel, SEO e GEO, aba Guerra é Guerra (só `super_admin`).

## Intenção

Hoje o duelo mostra onde a Demakine perde para o concorrente e sugere uma ação em texto. Leandro quer que cada derrota venha com a explicação do motivo e um botão que **resolva**: o sistema corrige para a Demakine passar o concorrente naquele item, página a página ou em grupos de páginas com o mesmo problema. Quando a solução não cabe no painel (página nova, post, ajuste no código), o sistema entrega um **prompt pronto em JSON** para ele colar no Claude, que faz o trabalho.

## Metas

- Para cada derrota, uma explicação curta (o que está pior e por quê) e um botão de ação.
- Corrigir em lote: "todas as páginas com título fora do tamanho" numa tacada, com a lista de páginas visível.
- Nada vai ao ar sem o Leandro ver o **antes e depois** e confirmar. Tudo que foi aplicado pode ser **desfeito**.
- Funcionar sem chave de API e sem custo por uso: a IA entra por ida e volta de JSON (copiar, colar no Claude, colar a resposta no painel).

## Não metas e antimetas

- Não chamar API de IA no servidor (nesta versão). Não guardar chave.
- Não publicar automático, sem revisão. Isso seria uma falha mesmo que "funcione".
- Não gravar H1, dados estruturados nem hreflang pelo painel: ficam no código do site.
- Não criar páginas, posts nem alterar código pelo painel. Para isso o painel só entrega o prompt.
- Não mexer em `noindex`, `canonical` e nos campos protegidos de SEO fora do que a tela de página já permite.

## Restrições

- Só `super_admin`. A permissão é checada no servidor.
- Escrita só pelos caminhos que já existem: `PUT /admin/seo/pagina` (título, descrição, imagem de compartilhamento) e `PUT /admin/seo/imagem-alt` (alt das fotos). Os mesmos limites de tamanho valem (título 120, descrição 320, alt 150).
- Texto colado do Claude é **dado não confiável**: validado no servidor por esquema (JSON, versão, só páginas pedidas, tamanhos, sem HTML nem script, endereços só do próprio site).
- Migração de banco numerada `0019`: avisar quem estiver mexendo em outra migração.
- Testes antes do código. `bun test`, typecheck e lint verdes. Preview da Vercel conferido antes do merge.

## Abordagens consideradas

1. **Só regras, sem IA.** Grátis e previsível, mas o texto sai padronizado e não vence o concorrente em qualidade.
2. **IA por chave de API no servidor.** Texto melhor, mas exige chave na Vercel, tem custo por página e manda dados do catálogo para fora.
3. **Duas entregas (escolhida).** Entrega 1 com regras e o fluxo completo. Entrega 2 troca a chave de API por ida e volta de JSON com o Claude do próprio Leandro.

Leandro escolheu a abordagem 3, a variante "JSON copiado e colado" no lugar da chave, e a opção **B** (proposta e confirmação, não gravar direto).

## Mapa: o que cada derrota ganha

| Item do duelo | O botão |
|---|---|
| Título, Descrição | **Corrigir**: proposta de texto no tamanho certo, por página |
| Imagens (alt) | **Corrigir**: proposta de alt por foto sem descrição |
| Compartilhamento | **Corrigir**: título e descrição já corretos, imagem de capa da página |
| H1, Dados estruturados, Idiomas | **Copiar prompt**: ajuste no código do site |
| Conteúdo | **Copiar prompt**: texto mais completo por página |
| Tamanho do site, Blog | **Copiar prompt**: páginas novas e posts |

## Fluxo A: Corrigir (título, descrição, alt, compartilhamento)

1. Na derrota, o botão **Corrigir** abre a tela de revisão com as páginas do grupo (as piores primeiro).
2. **Entrega 1:** o sistema monta cada proposta por regras. Título: nome da página e a marca, de 30 a 60 caracteres. Descrição: o que a página já diz, de 70 a 155 caracteres. Alt: nome do produto e tipo da foto. Compartilhamento: primeira foto do produto.
3. **Entrega 2:** o botão **Copiar pedido de textos** gera o JSON (páginas, texto atual, limites, formato da resposta). O Leandro cola no Claude e cola a resposta em **Colar resposta**. O painel valida e preenche a mesma tela de revisão.
4. A tela mostra **antes e depois** por página, com caixas para tirar o que não quer e edição manual do texto. **Aplicar** grava pelos caminhos existentes.
5. Cada aplicação vira um **lote** (quem, quando, valores antes e depois). **Desfazer lote** devolve os valores de antes. Registro no histórico de atividades.

## Fluxo B: Copiar prompt (página nova, post, código)

O botão **Copiar prompt** gera um JSON que o Leandro cola no Claude. Conteúdo do pacote:

- `versao`, `tipo` (pagina, post ou codigo), `metrica`, `concorrente`, o número da derrota.
- O que o concorrente tem e a Demakine não, e assuntos reais vindos do Search Console quando houver.
- As regras do projeto: tom de voz, SEO, tradução en e es, revisão de texto, e a entrega por branch, PR e preview, com merge só com autorização do dono.
- `formatoDeResposta`, quando for texto para colar de volta.

O pacote não leva senha, chave nem dado de lead.

## O que fica para quem construir

- Os textos exatos das regras de título, descrição e alt, e a tela de revisão (layout, mensagens).
- Nomes das funções puras e das rotas (`/admin/seo/corrigir/...`), no padrão já usado em `seo-routes.ts`.
- Tabela do lote para desfazer (migração `0019`).

## Decisões minhas (marcadas, para o Leandro conferir)

- O "grupo" de uma derrota é **todas** as páginas em que aquele item falha na auditoria completa, e não só as 5 piores que a ação mostra hoje.
- A tela de revisão sempre mostra a explicação da derrota (o texto que `duel-actions.ts` já gera) acima da lista.
- O desfazer vale para o lote inteiro e por página, sem prazo de validade.
- Só um lote "aplicando" por vez, para dois cliques não gravarem em duplicidade.
- A Entrega 1 não toca em H1, dados estruturados e hreflang.
