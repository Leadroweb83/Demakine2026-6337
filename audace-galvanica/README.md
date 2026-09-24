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
| 2 a 5 | Hero, consultoria, estratégia, benefícios | concluídas (fundos + ícones SVG) |
| 6 a 8 | Etapas, CTA, rodapé | concluídas (assets oficiais da Drive) |
| 9 | Validação estática | pendente |
| 10 | Motion | pendente |

## Dados do cliente (confirmados)

- Endereço: Av. Marechal Floriano Peixoto, 176 - Parque Hipolyto, Limeira - SP, 13486-554.
  Rodapé mostra "Limeira - SP" (como na arte) com link para o mapa; endereço completo no JSON-LD.
- WhatsApp: (19) 99455-5679. Instagram: https://www.instagram.com/audacegalvanica/
- Formulário: valida os 7 campos e abre o WhatsApp da Audace com todos os dados preenchidos
  (`data-whatsapp` no `<form>`). Sem backend: a confirmação só diz que o WhatsApp foi aberto.
- "Qual é a sua principal necessidade?" virou lista. As opções foram propostas pelo desenvolvimento
  e aguardam validação do cliente.

## Decisões sobre os assets

- Os fundos `section_01` a `section_03` já trazem a fotografia e as formas geométricas embutidas.
  Por isso a página não sobrepõe `hero_galvanic_chain`, `consult_model`, `inspection_ring_tweezers`
  nem os overlays SVG: eles duplicariam a imagem. No mobile, o próprio fundo é recortado.
- Todos os assets vêm do pacote oficial na Drive (fundos em 3156 px). A página serve WebP em 1600w/3156w
  (≈640 KB no total) com o PNG de nome oficial como fallback.
- CTA: o fundo `section_06` traz os anéis muito ampliados, com um corte vertical, atrás da frase. Um véu
  escuro em CSS garante a leitura e `cta_rings_4x` (recorte exato da arte, 390×164u) ocupa o canto inferior.
- Logo, versão negativa: além da cor dos textos (opção B), a borda do símbolo teve a sobra do fundo branco
  removida (cor pura + transparência) e 45 manchas de ruído < 170 px foram apagadas; glifos e estrelas intactos.
- Estratégia: palavras laterais descem para a faixa mais escura do fundo, abaixo do anel (aprovado).
- Logo (opção B aprovada pelo cliente): `audace_logo_negative_*` é o arquivo oficial com apenas a cor
  dos textos alterada ("Audace" #F8F6F2, "Galvânica" #BFC1C1). Símbolo, formas, proporções e
  transparência idênticos ao original. O arquivo oficial `audace_logo_transparent_4x.png` fica intacto.
- Textos seguem `copy/copy.json` do pacote na Drive (descrições dos benefícios em minúscula; todos os
  campos do formulário obrigatórios). "Qual é a sua principal necessidade?" segue como texto livre
  porque o copy.json pede um select mas não traz as opções.
- Hero: o fundo tem um corte reto entre painel e foto; um degradê em CSS suaviza a divisa como na arte.

## Sistema de medidas

No desktop (>= 1024px) todas as medidas usam `--u`: 1u = 1px da arte aprovada
(canvas de 789px). A escala acompanha a largura da tela e trava em 1.6.
Quebras de linha da arte usam `<br class="br-d">`, que somem abaixo de 1024px.
