# Audace Galvânica | Landing page

HTML5 + CSS3 + JavaScript puro, sem framework e sem build. Abra `index.html` no navegador.

## Estrutura

```
index.html      Estrutura semântica com todos os textos em HTML real
styles.css      Tokens da marca, layout e responsivo
script.js       Menu mobile e formulário (motions só na Fase 10)
fonts/          Libre Baskerville + Manrope auto-hospedadas (SIL OFL)
logo/           Logo oficial (não redesenhar)
reference/      approved_layout_reference.png
images/         backgrounds/, photos/, overlays/
icons/svg/      Ícones SVG fornecidos
```

## Status das fases

| Fase | Etapa | Status |
|---|---|---|
| 0 | Preparação | concluída |
| 1 | Identidade e estrutura | concluída (layout calibrado na arte aprovada) |
| 2 a 5 | Fundos das seções 1 a 5 | aplicados; faltam ícones SVG |
| 6 a 8 | Etapas, CTA, rodapé | aguardando assets |
| 9 | Validação estática | pendente |
| 10 | Motion | pendente |

## Pendências do cliente

- Assets em `logo/`, `reference/`, `images/` e `icons/svg/` com os nomes exatos do briefing.
- Confirmar a localização "São Paulo - SP" antes de publicar no rodapé.
- Links reais de Instagram e WhatsApp (hoje marcados com `data-pending-link`).
- Endpoint do formulário: preencher `data-endpoint` no `<form>`. Sem ele, o formulário valida os campos mas não simula sucesso.

## Decisões sobre os assets

- Os fundos `section_01` a `section_03` já trazem a fotografia e as formas geométricas embutidas.
  Por isso a página não sobrepõe `hero_galvanic_chain`, `consult_model`, `inspection_ring_tweezers`
  nem os overlays SVG: eles duplicariam a imagem. No mobile, o próprio fundo é recortado.
- Cada fundo é servido em WebP (arquivo original recebido) com o PNG de nome oficial como fallback.
- Logo (opção B aprovada pelo cliente): `audace_logo_negative_*` é o arquivo oficial com apenas a cor
  dos textos alterada ("Audace" #F8F6F2, "Galvânica" #BFC1C1). Símbolo, formas, proporções e
  transparência idênticos ao original. O arquivo oficial `audace_logo_transparent_4x.png` fica intacto.
- Hero: o fundo tem um corte reto entre painel e foto; um degradê em CSS suaviza a divisa como na arte.

## Sistema de medidas

No desktop (>= 1024px) todas as medidas usam `--u`: 1u = 1px da arte aprovada
(canvas de 789px). A escala acompanha a largura da tela e trava em 1.6.
Quebras de linha da arte usam `<br class="br-d">`, que somem abaixo de 1024px.
