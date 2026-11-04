# Landing Page Black Guará 2026 (Guará Equipamentos)

Página estática e independente (HTML único + pasta `img/`). Não depende do site da Demakine.

## Publicar
Suba a pasta inteira para `guaraequipamentos.com.br/black-friday/` (ou subdomínio).
Se o endereço final for outro, troque o `canonical`, `og:url`, `og:image` e as URLs do JSON-LD no `<head>`.

## Editar rápido
Tudo que muda com frequência fica no bloco `CONFIG` no fim do `index.html`:
- `whatsapp`: número de vendas (hoje 19 99336-9331)
- `fimCampanha`: data/hora de encerramento do contador
- `produtos`: equipamentos exibidos (nome, categoria, imagem, descrição)
- `segmentos`: chips de público

## Rastreamento
- Troque `GTM-XXXXXXX` pelo contêiner da Guará (o GTM só carrega após essa troca).
- Todo clique em WhatsApp/telefone dispara `generate_lead` no dataLayer com `lead_origin`, `product_name` e `campaign`.
- UTMs da URL são anexadas à mensagem do WhatsApp (`[origem: meta / bf]`).

## Pendências (aguardando materiais do cliente)
- Composição e % real de cada kit
- Depoimentos/cases e logos de clientes
- Mais fotos/vídeos reais (selo, palco, 2 fotos de kits e vídeo do banner já aplicados)
- Confirmar segmentos atendidos (hotéis, motéis, lavanderias comerciais)
