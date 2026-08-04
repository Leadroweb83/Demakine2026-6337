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
- [ ] pages/ferramentas.tsx + rota + nav + sitemap
- [ ] home: hero novo + spotlight + timeline + mapa + teasers
- [ ] produto: hotspots + cine band + compare
- [ ] produtos: checkbox comparar
- [ ] downloads: gate de lead
- [ ] build + QA 1440/390
