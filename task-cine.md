# (nota interna) implantação das 15 ideias + camada Cine

Cine = identidade do Catálogo V2 (azul #0A1F3D, feixe de luz, tag vermelha, Anton).
Limite: ~25% das seções. Resto clean.

## Seções cine escolhidas
1. Home hero (vídeo + rotator + credibilidade + seletor rápido)
2. Home spotlight do produto campeão (bullets + QR-like CTA, layout slide-07)
3. Home projetos especiais (restyle cine)
4. Home mapa do Brasil + ferramentas (cine)
5. Produto: faixa cine com hotspots
6. Ferramentas: hero cine

## Feito
- [x] hero-loop.mp4 (13s, 660KB) em public/video
- [x] br-map.json em src/web/data
- [x] Anton no index.html
- [x] styles.css: bloco CINE + animações
- [x] lib/engine.ts (sizing, ROI, quiz, configurador)
- [x] components/cine.tsx
- [x] tools/calc-esteira.tsx

## A fazer
- [x] tools/calc-roi.tsx
- [x] tools/configurator.tsx (SVG animado)
- [x] tools/quiz.tsx
- [x] tools/quick-selector.tsx (hero)
- [x] tools/brazil-map.tsx
- [x] tools/hotspots.tsx
- [x] tools/compare-slider.tsx
- [x] compare.tsx (contexto + barra + modal)
- [x] rotator.tsx, sticky-cta.tsx (+ScrollProgress), timeline.tsx
- [x] pages/ferramentas.tsx + rota + nav + sitemap
- [x] home: hero novo + spotlight + timeline + mapa + teasers
- [x] produto: hotspots + cine band + compare
- [x] produtos: botao comparar + barra + modal
- [x] downloads: gate de lead
- [x] build + QA 1440/390 (hero, spotlight, comparador arrastavel, mapa, ferramentas, hotspots, sticky CTA mobile)
- [x] POST /api/leads => 201, /admin => 200
- [x] fix: .cine-bullets tinha `margin: 0` sem layer e anulava utilitarios mt-* (removido)
- nota: o servidor na porta 4200 serve o `dist` buildado; sempre rodar `bun run build` antes de conferir no navegador.

## Rodada 3 — agro + hero criativo + motion scroll
- [x] `motion@12` instalado (packages/web)
- [x] `components/scroll-text.tsx` — texto cinético com useScroll/useTransform/useSpring, 4 linhas alternando direção (Demakine / Indústria outline / em MOVIMENTO / Demakine outline) + fade nas pontas
- [x] `components/hero.tsx` — hero novo: vídeo com parallax no scroll (y+scale), marca d'água Anton com drift, hero-slash vermelho, correia SVG com sacos andando, ticker infinito de diferenciais, link agro dourado, mantém tag/título/rotator/regra/parágrafo/CTAs/stats/QuickSelector
- [x] `lib/agro.ts` — dados agro só com base real: 24 clientes por segmento, 12 depoimentos reais, 5 etapas da cadeia mapeadas em produtos reais, 6 cadeias, FAQ
- [x] `pages/agro.tsx` — paleta agro (#0f2c1a/#1d5230/#d8a02a) + hero com parallax na foto, faixa de credibilidade, 5 etapas, 6 cadeias, logos, depoimentos, FAQ acordeão, LeadForm source="agro" com CTA dourado
- [x] `components/agro-band.tsx` — faixa agro na home levando pra /agro
- [x] rota /agro + nav + sitemap (priority 0.9) + footer (herda do nav)
- [x] styles.css: .kinetic-row/.kinetic-outline, .hero-mark, .hero-slash, .ticker, .belt-sack, tema .agro-* , tokens ag-*
- [x] build OK, POST /api/leads source=agro => 201, QA 1440 + 390 (playwright p/ mobile: mb --width não muda o viewport do JS)

## Favicon (rodada 4)
- Favicon trocado do padrão do template pelo símbolo do globo/folha da logo Demakine (recortado de img/site/logo-blue.png).
- `favicon.ico` multi-size (16/24/32/48/64/128/256) montado com ImageMagick — PIL não escreve multi-size direito.
- 16 e 24px são desenhados à mão (disco azul + equador + meridiano brancos), porque o globo detalhado vira mancha nesse tamanho.
- `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` (180, azul sobre branco), `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (21% de padding) e `site.webmanifest`.
- NÃO usar img/site/logo-white.png para ícone: o símbolo dele é um disco branco maciço, os detalhes não existem.
- index.html: links de icon/apple-touch-icon/manifest. theme-color #103D94 já existia.

## Rodada 5 (anexos 1-7 + depoimentos) — concluída
1. Logos do marquee: h-12/14 -> h-[68px]/md:h-[92px], gap 14/16, py 12/14, opacidade 70 + scale no hover.
2. Travessões: 61 ocorrências removidas (tsx/ts/content.json). Titles SEO com "|", prose reescrita, placeholders de tabela viraram "-". grep "—" = 0.
3. CineShot: wrapper overflow-hidden + rounded-3xl na imagem.
4. CineStat: variante `boxed` (.cine-stat-box) com borda, gradiente, barra vermelha que cresce no hover, translateY. Usada nos 3 stats do spotlight em grid-cols-3. Tipografia responsiva p/ não cortar labels no mobile.
5. Faixa agro: máquina recortada (rembg + trim + tratamento) em /img/site/agro-esteira-cut.png preenchendo o 6º slot da grade, com gradiente na base, cine-float e link p/ o produto.
6. Entrelinha: h1..h5 line-height 1.08 -> 1.32; .cine-title 1 -> 1.18.
7. Segmentos: nova seção (cabeçalho + stats + chips) + SegmentsCarousel (12 segmentos -> foto real do produto indicado, snap scroll, setas, dots, scrollbar estilizada).
8. Depoimentos: components/ui/{avatar,infinite-slider}.tsx + components/testimonials.tsx (TestimonialsWall) com 3 colunas verticais (speed 30/50/35, hover 15/25/17), cards rounded-3xl shadow-lg, AvatarFallback com iniciais, máscara linear-gradient, colunas 2/3 escondidas em md/lg. Substituiu TestimonialGrid na home.

QA: bun run build OK; 1440 e 390 (Chrome/Playwright) OK; scrollWidth 390 (sem overflow); POST /api/leads 201 (id 5); /admin 200; /, /clientes, /agro, /produtos, /ferramentas, /produtos/... 200.
