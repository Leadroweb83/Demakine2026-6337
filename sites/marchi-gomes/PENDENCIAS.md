# Marchi Gomes Advogados: o que falta para publicar

O site está com `launchReady: false` em `content/site.ts`: robots bloqueia tudo e
as páginas saem com `noindex`. Só virar para `true` depois dos itens abaixo.

## Já preenchido com dados reais
- Nome, cidade (Limeira, SP), fundação (1996), endereço, telefone e WhatsApp
- História, legado do Dr. João Jair Marchi, serviços, áreas e visão de futuro
  (texto do documento "História 2", com um ajuste de digitação: "destaque na região")

## Dados que faltam (preencher em `content/site.ts`)
- [ ] E-mail e horário de atendimento
- [ ] Registro da sociedade na OAB e OAB de cada sócio
- [ ] Mini biografia e foto de Gisele Marchi e de Gabriel Gomes
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
- [ ] Vídeo do hero (`images.heroVideo`, mp4 curto e sem som) e foto de capa
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

## Arquivos de marca
- [ ] Logo em vetor (SVG). O monograma em `components/logo.tsx` é um redesenho provisório
- [x] Hero: `public/img/hero-escritorio.webp` (imagem enviada pelo Leandro)
- [x] Seção O escritório: `public/img/justica.webp` (estátua da Justiça)
- [ ] Fotos reais dos sócios, do escritório e uma por frente de atuação
- [ ] Imagem de compartilhamento (Open Graph 1200x630) e favicon

## Antes do ar
- [ ] Política de Privacidade: minuta em `/politica-de-privacidade`, a aprovar pelos sócios
- [ ] Depoimento identificado sobre o Dr. João Jair Marchi (`legacy.testimonial`)
- [ ] Perfil da Empresa no Google com o mesmo nome, endereço e telefone do site
