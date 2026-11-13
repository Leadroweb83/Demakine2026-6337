# Marchi Gomes Advogados: o que falta para publicar

**Site liberado para o Google** (`launchReady: true` em `content/site.ts`): robots
permite o rastreio, as páginas saem com `index, follow` e o sitemap lista 20 URLs.
Efeitos automáticos: os artigos em rascunho somem do site, a página `/artigos` e o
link do menu só aparecem quando houver artigo publicado (`draft: false`), e os
endereços `.vercel.app` ficam sempre com `noindex` para não duplicar o site.
Para tirar do ar a indexação, volte `launchReady` para `false`.
Os itens abaixo continuam valendo e agora afetam o que o Google vê.

## Já preenchido com dados reais
- Nome, cidade (Limeira, SP), fundação (1996), endereço, telefone e WhatsApp
- História, legado do Dr. João Jair Marchi, serviços, áreas e visão de futuro
  (texto do documento "História 2", com um ajuste de digitação: "destaque na região")

## Dados que faltam (preencher em `content/site.ts`)
- [x] E-mail geral no site: contato@marchigomes.adv.br (o pedido veio como "contao@", tratado como
      erro de digitação; confirmar que a caixa existe)
- [x] Formulário entrega em contato@marchigomes.adv.br (decisão do Leandro). Código pronto e testado
      contra um servidor de e-mail de teste. FALTA configurar na Vercel o usuário e a senha da caixa
      de envio (`SMTP_USER`, `SMTP_PASS`); sem isso o formulário mostra erro. Horário de atendimento
- [x] Seção "Fundadores e diretores", com os cartões de visita: Gisele Marchi (OAB/SP 519070), Gabriel Gomes, Wagner Marchi,
      José Vidotti e Ronaldo Gomes, com os cargos impressos. Só a Gisele tem OAB nos cartões:
      confirmar se mais alguém é advogado antes de apresentá-lo como tal
- [ ] Registro da sociedade na OAB
- [ ] Mini biografia e foto de cada fundador
- [x] Texto "A história do escritório": mantido como enviado, sem citar os cinco fundadores (decisão do Leandro)
- [ ] Foto e, se houver, depoimento identificado sobre o Dr. João Jair Marchi
- [ ] Instagram e LinkedIn
- [ ] Domínio (`NEXT_PUBLIC_SITE_URL`)

## Decisões a confirmar com os sócios
- [x] As quatro frentes em destaque (Família e Sucessões, Patrimônio e Imóveis,
      Contratos, Empresarial e Societário): confirmadas pelo Leandro
- [ ] Resumos das 8 demais áreas (`areas` sem `featured`): textos descritivos escritos
      para o site, a validar
- [ ] Glossário (`content/glossary.ts`): definições gerais, a validar por um advogado
- [ ] Linha do tempo (`timeline`): só 1996 tem data; faltam os anos dos outros marcos
- [ ] Página "Primeiro atendimento": confirmar se o passo a passo reflete a rotina real
- [ ] Números exibidos: anos desde 1996, 12 áreas, 3 frentes de atuação
- [ ] Respostas das dúvidas frequentes (`faqs`)
- [ ] Textos das duas portas de entrada (pessoas e famílias / empresas)
- [ ] Hero usa "orientação rigorosa, atendimento próximo" e evita "resultados"
      (Provimento 205/2021 da OAB)

## Perguntas por área
- [ ] `content/area-faqs.ts`: 3 dúvidas por área (36 no total), respostas gerais
      escritas para o site. Validar por um advogado

## Recursos prontos, esperando dado
- [x] Vídeo do hero: `public/img/hero-video.mp4` (2 MB) e versão vertical para celular (0,8 MB), comprimidos do original de 24 MB. A foto anterior segue em `images.hero` e é usada na página "Para empresas"
- [ ] Cidades vizinhas atendidas (`cities`): cada uma gera `/atuacao/<cidade>`
- [ ] `NEXT_PUBLIC_GSC_VERIFICATION` e `NEXT_PUBLIC_BING_VERIFICATION`: códigos de
      verificação; depois, enviar `/sitemap.xml` nos dois painéis
- [ ] `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFY_EMAIL`: confirmação ao
      lead e aviso ao escritório por e-mail (exige domínio verificado no Resend)

## Idiomas
- [ ] `/en` e `/es` (`content/i18n.ts`): versões resumidas em inglês e espanhol,
      traduzidas a partir do texto institucional. Revisar por falante nativo e
      confirmar se o escritório atende nesses idiomas

## Lançamento no domínio marchigomes.adv.br
- [ ] Hoje o domínio mostra só uma listagem de diretório ("Index of /"), sem site
      anterior: não há URLs antigas para redirecionar
- [ ] Mover o projeto para um repositório próprio (o projeto Vercel está ligado ao
      repositório da Demakine, cuja branch principal não contém este site)
- [ ] Depois disso: adicionar o domínio na Vercel e apontar o DNS
      (A @ 76.76.21.21 e CNAME www cname.vercel-dns.com, ou os valores que a Vercel indicar)
- [ ] Antes de mexer no DNS: conferir se há e-mail no domínio e preservar os registros MX
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (anti-spam) e
      `NEXT_PUBLIC_SENTRY_DSN` (erros)

## Medição de velocidade (Lighthouse local, build de produção)
- Celular: home 94, área 95, escritório 88 em desempenho; LCP 0,8 a 0,9 s; CLS perto de 0
- Desktop: home 100
- SEO aparece como 66 só por causa do `noindex` de pré-lançamento

## Artigos
- [ ] Os 8 artigos em `content/articles.ts` são RASCUNHOS. Precisam de revisão e
      aprovação de um advogado. Enquanto `draft: true`, somem do site no lançamento

## Integrações (ligam ao preencher o `.env`)
- [ ] `LEAD_WEBHOOK_URL`: destino dos leads (CRM, Make, n8n). Já recebe área,
      data preferida e origem (UTM, gclid, fbclid, referrer, página de entrada)
- [ ] `NEXT_PUBLIC_GTM_ID`: Google Tag Manager com Consent Mode v2. Eventos
      prontos: `cta_click`, `section_view`, `generate_lead`
- [ ] `NEXT_PUBLIC_CLARITY_ID`: Microsoft Clarity (só carrega após o aceite)
- [ ] `NEXT_PUBLIC_SCHEDULING_URL`: link do Calendly ou do Google Agenda
- [ ] Sanity: precisa de uma conta/projeto do escritório para ligar o painel

## Conferir nos cartões
- [ ] José Vidotti e Ronaldo Gomes têm o mesmo WhatsApp impresso, +55 (19) 99939-2667.
      Provável erro de digitação em um dos dois
- [ ] Os telefones e e-mails individuais dos cartões NÃO estão publicados no site; o número
      do site é o da Gisele, (19) 98184-3010

## Imagens que aguardam arquivo
- [ ] Foto da estátua com a advogada desfocada (vertical): trocar a imagem da seção "O escritório"
      (`images.firm`). Reenviar como arquivo anexado, o print na conversa não vira arquivo
- [ ] Foto da mão apontando documentos, com pessoas desfocadas (vertical e escura): entra no túnel de
      imagens da home (`tunnel.items` em `content/site.ts`)
- [ ] Foto da estátua com livros e bokeh (3:2): fundo da seção "O futuro" (`images.future`, já preparado,
      com degradê escuro à esquerda). Melhorar (2x, nitidez) ao receber o arquivo

## Arquivos de marca
- [ ] Logo em vetor (SVG). O monograma em `components/logo.tsx` é um redesenho provisório
- [x] Hero: `public/img/hero-escritorio.webp` (imagem enviada pelo Leandro)
- [x] Seção O escritório: `public/img/justica.webp` (estátua da Justiça)
- [x] As sete imagens de banco de imagens enviadas (balança, martelo, notebook, assinatura, aperto de mãos,
      entrega da caneta e revisão de contrato) estão na faixa e nos serviços da home, no painel e na
      página das frentes, no "Primeiro atendimento" e em "Para empresas".
      Licença de uso confirmada pelo Leandro
- [ ] As imagens das 4 frentes, da faixa e do "Primeiro atendimento" eram RECORTES
      das duas imagens enviadas. Trocar por fotos próprias quando houver
- [ ] Hero em alta resolução (o arquivo atual tem 1672 px; ideal 2560 px ou mais)
- [ ] Fotos reais dos sócios, do escritório e do Dr. João Jair Marchi
- [ ] Capas dos artigos (`cover` em `content/articles.ts`)
- [ ] Imagem de compartilhamento (Open Graph 1200x630) e favicon

## Campanhas e presença local
- [ ] GTM: criar o contêiner e informar o ID. Dentro dele entram GA4, pixel da Meta
      e tag do Google Ads. Eventos já enviados pelo site: `generate_lead` (conversão
      principal), `cta_click` com o nome do botão (ex.: `whatsapp_hero`, `como_chegar`)
      e `section_view`
- [ ] Perfil da Empresa no Google, com os mesmos dados do site:
      Marchi Gomes Advogados · R. Valdir Dalfré, 57 - Jardim Porto Real II,
      Limeira - SP, 13485-402 · (19) 98184-3010 · categoria "Escritório de advocacia"
- [ ] Link compartilhável da prévia na Vercel (ou desligar Vercel Authentication)

## Antes do ar
- [ ] Política de Privacidade: minuta em `/politica-de-privacidade`, a aprovar pelos sócios
- [ ] Depoimento identificado sobre o Dr. João Jair Marchi (`legacy.testimonial`)
- [ ] Perfil da Empresa no Google com o mesmo nome, endereço e telefone do site
