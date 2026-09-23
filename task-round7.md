# Rodada 7 - pacote de conteúdo (concluída)

Build OK, console sem erros, QA 1440 e 390, `POST /api/leads` 201, `/admin` 200.

## Entregue

1. **Pseudo-360** - `components/spin-360.tsx`. Mouse X sobre a foto percorre as imagens em sequência,
   arraste no mobile, auto-spin lento até a primeira interação, badge "360°", barra de posição vermelha,
   pré-carregamento das fotos. Ativa em `pages/produto.tsx` quando o produto tem 4+ fotos (17 dos 21).
   Keyframe `.spin-hint` em `styles.css`, dentro do bloco `prefers-reduced-motion`.
2. **FAQ** - `lib/faq.ts` (3 grupos, 24 perguntas), `components/faq.tsx` (`FaqAccordion`),
   `pages/faq.tsx` com índice lateral sticky e card de contato. Rota `/faq` em `app.tsx`,
   link no rodapé (Institucional), entrada no `sitemap.xml`, `FAQPage` no JSON-LD.
3. **Para qual material serve** - matriz produto x material (7 materiais) em `lib/product-content.ts`,
   renderizada em cards indicado / sob consulta / não indicado na página do produto.
4. **Erros que custam caro** - 3 blocos por linha de equipamento + CTA "conferir minha escolha".
5. **Ficha de instalação** - 5 itens numerados do que o cliente deixa pronto + CTA de dúvida.
6. **Peças de reposição e consumíveis** - grid por linha + faixa com CTA "Orçamento de peça".
7. **Manutenção em 5 minutos por dia** - diário / semanal / mensal + link do PDF para imprimir.
8. **Conteúdo de ferramenta** - 2 posts novos em `data/content.json`:
   `como-dimensionar-sua-esteira-transportadora` (termina na `CalcEsteira`) e
   `quanto-custa-movimentar-carga-na-mao` (termina na `CalcRoi`). Calculadora renderizada inline
   no fim do artigo em `pages/post.tsx`. Ambos no `sitemap.xml`, com fotos reais de produto.
9. **Central de materiais** - `pages/downloads.tsx` reescrita: 3 downloads diretos sem cadastro
   (catálogo, checklist de manutenção, guia de correias) + kit atrás do formulário
   (checklist antes de comprar, catálogo, calculadoras) + manual e desenho dimensional
   seguem em "sob solicitação".
10. **Compartilhar no blog** - `components/share.tsx` (WhatsApp, Facebook, LinkedIn, e-mail, copiar link),
    no topo do artigo (compacto) e no fim, em `pages/post.tsx`.

## PDFs gerados

Script `tools/gen-pdfs.py` (HTML + Chrome headless, logo azul, identidade Demakine):
- `public/downloads/checklist-manutencao-demakine.pdf` (2 páginas: checklist + folha de registro)
- `public/downloads/tabela-de-correias-demakine.pdf` (1 página: 7 tipos de correia x aplicação)
- `public/downloads/checklist-antes-de-comprar-uma-esteira.pdf` (3 páginas: 27 conferências + erros)

## Decisões mantidas

- Sem prazo, preço, percentual ou condição de garantia publicados: tudo remetido à proposta.
- Manual de operação e desenho dimensional continuam "sob solicitação" (não existem arquivos reais).
- Nada de dado inventado de cliente, número ou selo.

## Perguntas ainda sem resposta do cliente

1. Manter algum aviso de "telefone temporariamente indisponível"? (hoje: sem banner)
2. Confirmar os números 7.000 máquinas x 8.000 clientes? (hoje: como estão no conteúdo)
