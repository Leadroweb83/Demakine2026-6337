# Marchi Gomes Advogados: o que falta para publicar

O site está com `launchReady: false` em `content/site.ts`: robots bloqueia tudo e
as páginas saem com `noindex`. Só virar para `true` depois dos itens abaixo.

## Dados do escritório (preencher em `content/site.ts`)
- [ ] WhatsApp com DDI (sem ele, os botões levam para o formulário)
- [ ] Telefone, e-mail, endereço completo, horário
- [ ] Registro na OAB (número da sociedade) e nomes/OAB dos sócios
- [ ] Cidade de atuação (entra nos títulos: "Advogado de Direito Tributário em ...")
- [ ] Instagram e LinkedIn
- [ ] Domínio (`NEXT_PUBLIC_SITE_URL`) e destino dos leads (`LEAD_WEBHOOK_URL`)

## Conteúdo a validar com o escritório
- [ ] Temas listados em cada área (`areas[].topics`): são temas típicos, não confirmados
- [ ] Respostas das dúvidas frequentes (`faqs`)
- [ ] Texto "A marca mudou, a essência é a mesma" na seção O escritório
- [ ] Copy revisada para o Provimento 205/2021 da OAB: o hero usa
      "segurança e tranquilidade" no lugar de "resultados", que pode ser lido
      como promessa de resultado

## Arquivos de marca
- [ ] Logo em vetor (SVG). O monograma em `components/logo.tsx` é um redesenho provisório
- [ ] Fotos reais do escritório e dos sócios (slot na seção O escritório)
- [ ] Imagem de compartilhamento (Open Graph 1200x630) e favicon

## Antes do ar
- [ ] Páginas: Política de Privacidade (LGPD) e perfis dos advogados
- [ ] GTM/GA4 e consentimento de cookies (o formulário já dispara `generate_lead`)
- [ ] Perfil da Empresa no Google com o mesmo nome, endereço e telefone do site
