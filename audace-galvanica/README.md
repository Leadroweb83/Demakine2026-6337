# Audace Galvânica | Landing page

HTML5 + CSS3 + JavaScript puro, sem framework e sem build. Abra `index.html` no navegador.

## Estrutura

```
index.html      Estrutura semântica com todos os textos em HTML real
styles.css      Tokens da marca, layout e responsivo
script.js       Menu mobile e formulário (motions só na Fase 10)
logo/           Logo oficial (não redesenhar)
reference/      approved_layout_reference.png
images/         backgrounds/, photos/, overlays/
icons/svg/      Ícones SVG fornecidos
```

## Status das fases

| Fase | Etapa | Status |
|---|---|---|
| 0 | Preparação | concluída |
| 1 | Identidade e estrutura | aguardando assets |
| 2 a 8 | Seções | aguardando assets |
| 9 | Validação estática | pendente |
| 10 | Motion | pendente |

## Pendências do cliente

- Assets em `logo/`, `reference/`, `images/` e `icons/svg/` com os nomes exatos do briefing.
- Confirmar a localização "São Paulo - SP" antes de publicar no rodapé.
- Links reais de Instagram e WhatsApp (hoje marcados com `data-pending-link`).
- Endpoint do formulário: preencher `data-endpoint` no `<form>`. Sem ele, o formulário valida os campos mas não simula sucesso.
