# Audace Galvânica | Landing page

HTML5 + CSS3 + JavaScript puro, sem framework e sem build. Abra `index.html` no navegador.

## Estrutura

```
index.html      Estrutura semântica com todos os textos em HTML real
styles.css      Tokens da marca, layout e responsivo
script.js       Menu mobile e formulário (motions só na Fase 10)
fonts/          Libre Baskerville + Manrope auto-hospedadas (SIL OFL)
logo/           Logo oficial, versão negativa usada na página
images/         fotos/ (ensaio da marca), og/, overlays/
icons/svg/      Ícones SVG fornecidos
robots.txt      Rastreamento liberado (linha do sitemap entra com o domínio)
404.html        Página de erro com a marca (noindex)
vercel.json     Vercel: noindex só em *.vercel.app (link de teste) e cache longo para imagens/fontes
```

Fora da pasta publicada, em `../audace-galvanica-fonte/`: a arte aprovada (`reference/`), os arquivos
originais do pacote (`originais/`) e o logo oficial transparente (`logo/`). Nada disso vai para o ar.

## Status das fases

| Fase | Etapa | Status |
|---|---|---|
| 0 | Preparação | concluída |
| 1 | Identidade e estrutura | concluída (layout calibrado na arte aprovada) |
| 2 a 5 | Hero, consultoria, estratégia, benefícios | concluídas (fundos + ícones SVG) |
| 6 a 8 | Etapas, CTA, rodapé | concluídas (assets oficiais da Drive) |
| 9 | Validação estática | concluída: 390, 820, 1024, 1262, 1440 e 1920 px; Lighthouse 100/100/100/100 (desktop) e 99/100/100/100 (mobile) |
| 10 | Motion | concluída: Tier 1 + parte do Tier 2 (ver abaixo); Lighthouse mantido, CLS 0 |

## Dados do cliente (confirmados)

- Endereço: Av. Marechal Floriano Peixoto, 176 - Parque Hipolyto, Limeira - SP, 13486-554.
  Rodapé mostra "Limeira - SP" (como na arte) com link para o mapa; endereço completo no JSON-LD.
- WhatsApp: (19) 99455-5679. Instagram: https://www.instagram.com/audacegalvanica/
- Formulário: valida os 7 campos e abre o WhatsApp da Audace com todos os dados preenchidos
  (`data-whatsapp` no `<form>`). Sem backend: a confirmação só diz que o WhatsApp foi aberto.
- "Qual é a sua principal necessidade?" virou lista. As opções foram propostas pelo desenvolvimento
  e aguardam validação do cliente.

## Paleta e fotos (atualização do cliente)

- Paleta aplicada em tudo o que não é texto: fundos #0A0A0A e grafite #1C1C1E, off-white #F7F6F1 nas
  seções claras, dourados #C3AA68 e #887040 em botões, linhas, bordas e ícones, vermelho #C01920 e azul
  #193D89 na barra de leitura e nos brilhos, cinza #4D4D4D nas bordas dos campos. **Textos, cores dos
  textos e fontes não mudaram** (inclusive o dourado #C9A35D das frases em destaque).
- Fotos do ensaio em `images/fotos/` (WebP 420w/700w/860w/1122w + JPG de fallback):
  hero `kit-rodio-pedra-agua`; consultoria `modelo-semijoias-rodio-luz-azul`; estratégia
  `processo-banho-galvanico-correntes`; etapas `modelo-semijoias-rodio-olhar`, `kit-semijoias-rodio-zirconias`,
  `conjunto-semijoias-douradas-floral`; formulário `kit-semijoias-pedra-luz-azul`; Instagram (vitrine até o
  Behold entrar) `modelo-semijoias-rodio-fundo-cinza`, `modelo-colar-corrente-rodio`,
  `modelo-semijoias-rodio-fundo-azul`, `kit-semijoias-rodio-zirconias`, `conjunto-semijoias-douradas-floral`.
- As fotos ficam do lado oposto ao texto e se fundem ao preto por máscara, mantendo as posições dos textos da arte.
  No hero a foto fica entre o texto e as palavras laterais, para "Brilho / Qualidade..." não cobrir os brincos.
  No celular, a foto do hero ocupa o topo e o texto entra logo abaixo.
- Imagem de compartilhamento (OG) refeita com a foto nova do hero.
- Os fundos e recortes anteriores (arte aprovada) saíram do ar e estão em `../audace-galvanica-fonte/imagens-anteriores/`.
- Lighthouse após a troca: mobile 98/100/100/100, desktop 100/100/100/100, CLS 0.

## Decisões sobre os assets (versão anterior, histórico)

- Os fundos `section_01` a `section_03` já trazem a fotografia e as formas geométricas embutidas.
  Por isso a página não sobrepõe `hero_galvanic_chain`, `consult_model`, `inspection_ring_tweezers`
  nem os overlays SVG: eles duplicariam a imagem. No mobile, o próprio fundo é recortado.
- Todos os assets vêm do pacote oficial na Drive (fundos em 3156 px). A página serve WebP em 1600w/3156w
  (≈640 KB no total) com o PNG de nome oficial como fallback.
- Nitidez (aprovado pelo cliente): os arquivos "4x" do pacote eram só a arte de 789 px ampliada (medido:
  0,08/255 de detalhe a mais). Hero, consultoria, estratégia, CTA, anéis e etapas foram reconstruídos com
  super-resolução Real-ESRGAN x4plus (ONNX, CPU), a partir do tamanho real de cada imagem. A IA recria
  texturas finas; feições e composição não mudam. Os arquivos originais do pacote ficam em `../audace-galvanica-fonte/originais/`.
  Fundos servidos em WebP 900w/1600w/3156w.
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
- Hero e consultoria reconstruídos a partir da própria arte aprovada: o fundo `section_01` do pacote trazia
  a corrente ampliada fora do enquadramento aprovado e o `section_02` uma forma geométrica serrilhada que
  não existe na arte. As áreas de texto da arte foram removidas por preenchimento (OpenCV Telea) sobre
  fundo desfocado; hero usa o painel escuro do pacote à esquerda. Depois, Real-ESRGAN x4.

## Motion (Fase 10)

Implementados (números do briefing): 1 parallax do hero, 2 zoom lento, 3 título por máscara, 5 brilho no CTA,
6 micro-lift, 9 parallax da modelo, 11/24 dourado progressivo, 13 palavras laterais em sequência, 14 ícones
desenhados, 15 benefícios em sequência, 16 hover dos benefícios, 17 números por máscara, 18 linha de progresso
das etapas, 19 cortina nas fotos, 20 etapa ativa, 21 luz do cursor nas joias, 25 entrada do formulário,
26 foco dourado nos campos, 28 estado do envio, 29 barra de leitura, 30 entrada do logo, 31/32 cabeçalho
de vidro compacto, 33 sublinhado do menu, 35 grão, 36 brilho atmosférico, 38 fade das imagens, 39 âncoras
suaves com compensação, 40 WhatsApp flutuante, 41 pulso único do CTA, 43 rodapé em sequência, 44 hover social,
45 movimento reduzido.

Fora de propósito: 4 e 42 (reflexo/varredura extra competiria com o brilho do CTA), 8 (as formas já estão
no fundo), 10/37 (as seções já fazem a transição de tom), 12 (a estratégia já tem a entrada do texto),
23 (a seção do CTA é curta demais para texto fixo na rolagem), 34 (cursor customizado atrapalha o uso).

Regras: estados iniciais só sob `.js-motion`, definida no `<head>` quando há JS, IntersectionObserver e
o usuário não pediu movimento reduzido; se `script.js` não carregar em 4 s, tudo aparece. Só transform e
opacity animam; parallax e luz do cursor apenas em desktop com mouse.

## Seções adicionadas após a aprovação

Ordem final: hero, consultoria, estratégia, diferenciais, como funciona, **Instagram**, formulário,
**perguntas frequentes**, **onde estamos (mapa)**, rodapé. As três novas não existem na arte e seguem
o mesmo sistema visual.

- Instagram (feed automático via Behold): crie o feed em https://behold.so conectando @audacegalvanica,
  copie o Feed ID e cole em `data-behold-feed-id` no `index.html`. Sem ID, a seção mostra um cartão com
  link para o perfil (nenhuma imagem inventada). O widget só carrega quando a seção se aproxima da tela.
- Perguntas frequentes: 6 perguntas com dados estruturados FAQPage. As respostas 4 (ouro, prata e ródio)
  e 5 (durabilidade) são informação técnica geral do setor e **devem ser validadas pelo time técnico**.
- Onde estamos: mapa do Google (iframe com carregamento tardio, em tom escuro), endereço completo,
  WhatsApp e botão "Como chegar".

## Publicação (teste)

Vercel, projeto `audace-galvanica` (conta Leandrweb83), raiz `audace-galvanica/`, saída `.`, sem build.
Link público de teste: https://audace-galvanica-leandrweb83.vercel.app (noindex via `vercel.json`).
O projeto não está ligado ao Git para deploy automático: cada atualização é publicada sob demanda.
Proteção de acesso da Vercel desligada a pedido do cliente (link público).

## SEO (auditoria pré-lançamento)

Feito: title com Limeira-SP (54) e description (155) no tamanho; um H1 e hierarquia H2/H3 correta; 100% das imagens com
alt ou alt vazio decorativo e dimensões; JSON-LD ProfessionalService com endereço, telefone, contato,
serviço e Instagram; meta robots com prévia grande de imagem; Open Graph e Twitter Card com imagem
1200×630; robots.txt; 404 com a marca; arte e arquivos-fonte fora da pasta publicada.
Lighthouse SEO 100.

Pendente do domínio definitivo: `<link rel="canonical">`, `og:url`, `og:image`/`twitter:image` com URL
absoluta, `url`/`logo`/`image` no JSON-LD, `sitemap.xml` + linha no robots.txt, redirecionamentos 301
(http→https e www↔sem www), cabeçalhos de cache/compressão no servidor e conferir que o noindex do
endereço de teste não vai para produção.

## Sistema de medidas

No desktop (>= 1024px) todas as medidas usam `--u`: 1u = 1px da arte aprovada
(canvas de 789px). A escala acompanha a largura da tela e trava em 1.6.
Quebras de linha da arte usam `<br class="br-d">`, que somem abaixo de 1024px.
