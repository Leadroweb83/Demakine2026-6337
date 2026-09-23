# Rodada 10 — /loja redesenhada na identidade LOJA TÉCNICA (blueprint)

## Feito e verificado
- `index.html`: fonte JetBrains Mono.
- `styles.css`: token `--font-mono` + bloco LOJA TÉCNICA (`.shop-mono`, `.shop-grid`, `.shop-grid-dark`, `.shop-dim`, `.shop-led`, `.shop-rail`, `.shop-ticker`, `.shop-cut`, `.shop-scan`) com `prefers-reduced-motion`.
- `lib/shop.ts`: `sku` em `ShopItem` e `MachineFit`, `situations` (3), `machineFits` (5 máquinas x 4 peças), `tickerLines` (8).
- `components/shop/chrome.tsx`: `ShopTicker`, `ShopHeader`, `ShopFooter`.
- `components/shop/cards.tsx` (novo): `StockLed`, `SpecCard`, `Rail`, `DataLine`, `TechLink`.
- `pages/loja.tsx` reescrita: hero de prancha de desenho com cotas + scan → 02 compra por situação → 03 vitrine com abas e trilho → 04 seletor de peça por máquina (checklist com total ao vivo) → 05 kits → 06 faixa dark de cotação → 07 condições + depoimentos + links do institucional → rodapé + WhatsApp verde.

## QA
- `bun run build` OK (nenhuma alteração em `src/api`, sem restart do pm2).
- Playwright `channel="chrome"`: 1440 e 390, console sem erros; `/loja` 200.
- Altura: 6255px (desktop), 11967px (mobile).
- "Comprar" incrementa o badge do carrinho (retornou 1).
- Troca de máquina no seletor e marcação de peça funcionando.
- Regressão: home e rodapé institucional em 1440 sem mudança.

## Ajustes de polimento aplicados
- Coluna de código da tabela de compatibilidade em `w-28` + `whitespace-nowrap` (o SKU quebrava em duas linhas).
- Legenda da cota do hero com `truncate` e corpo menor no mobile.

## Pendências com o cliente
- CNPJ oficial para `site.cnpj` (candidato não confirmado: 28.078.104/0001-38).
- Manter ou remover o aviso de telefone temporariamente indisponível.
- Confirmar 7.000 máquinas entregues x 8.000 clientes atendidos.
- Preços da loja continuam de EXEMPLO em `lib/shop.ts`.
