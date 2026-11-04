# Landing Page Black Guará 2026 (Guará Equipamentos)

Página estática e independente. Sem build: basta subir a pasta inteira.

## Estrutura
- `index.html`: conteúdo, SEO (meta, OG, JSON-LD) e estilos
- `js/app.js`: configuração da campanha (bloco `CONFIG` no topo), motion com GSAP/ScrollTrigger/Lenis, contagem, mapa, formulário
- `js/orbital-cards.js`: órbita das dores (scroll), com troca para "A solução tem nome: Guará Equipamentos"
- `js/brasil-map.js`: contornos dos 27 estados para o mapa
- `vendor/`: GSAP 3.12.5, ScrollTrigger 3.12.5, Lenis 1.1.13 (servidos localmente)
- `img/`: vídeo do hero (arquivo original, sem recompressão), fotos e selos

## Seções
1. Hero com vídeo em loop + contagem regressiva
2. Fitas cruzadas "Black Guará · 30% de desconto"
3. Órbita das dores, terminando na solução Guará
4. Kits e equipamentos (a solução)
5. Diferenciais 01, 02, 03
6. Manifesto ("10%? 20%? Que nada!")
7. Números (+20 anos, 27 estados)
8. Mapa do Brasil com pins caindo estado por estado
9. FAQ
10. CTA final com formulário que abre o WhatsApp

## Publicar
Suba a pasta para `guaraequipamentos.com.br/black-friday/`. Se o endereço for outro, troque `canonical`, `og:url`, `og:image` e as URLs do JSON-LD.

## Rastreamento
- Troque `GTM-XXXXXXX` pelo contêiner da Guará (só carrega após a troca).
- Cliques em WhatsApp, telefone e envio do formulário disparam `generate_lead` no dataLayer.
- UTMs da URL vão no fim da mensagem do WhatsApp.

## Acessibilidade e desempenho
- Quem ativa "reduzir movimento" vê tudo parado e completo (mapa já colorido).
- Sem JavaScript, todo o conteúdo continua visível.
- O vídeo pausa fora da tela.

## Leads por e-mail ("Lead BlackFriday")
Cada envio do formulário final abre o WhatsApp de vendas **e** manda uma cópia para `contato@guaraequipamentos.com.br`
com assunto **Lead BlackFriday** (nome, WhatsApp, e-mail, cidade, origem/UTM, página e data).

- **Padrão: FormSubmit** (`CONFIG.leadEndpoint` em `js/app.js`). No **primeiro envio** depois de publicar,
  o FormSubmit manda um e-mail de ativação para contato@guaraequipamentos.com.br: alguém precisa clicar em
  "Activate Form" uma única vez. Depois disso os leads chegam direto.
- **Alternativa: servidor próprio.** Troque `leadEndpoint` por `'enviar-lead.php'` (arquivo incluído).
  Precisa de PHP com envio de e-mail configurado no servidor.
- Campo invisível anti-robô (`_honey`) descarta envios automáticos.
