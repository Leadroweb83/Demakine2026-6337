# Rodada 8

## Feito
- `BtnWhats` criado em `components/kit.tsx`: botão verde (`bg-dm-green` / hover `dm-green-dark`) usado em TODO link de WhatsApp.
- Convertidos para verde: header (desktop + mobile "Pedir orçamento"), hero campeão da home, produto (orçamento, conferir escolha, dúvida de instalação, orçamento de peça), assistência técnica, post do blog, contato, FAQ, agro (2), CtaBand, agro-band, lead-form (sucesso), sticky-cta mobile, downloads (link virou botão), calc-esteira, calc-roi, configurador, quiz, comparador.
- Vermelho continua só em CTAs que NÃO vão para WhatsApp (ex. "Orçamento" do sticky mobile → /contato, "Receber este cálculo").
- Rodapé: removida a silhueta de máquinas (`MachineSilhouette` deletado, import e bloco `.footer-silhouette` do `styles.css` removidos). Mantido o espaçador `pb-20 lg:pb-0` para o sticky mobile.

## QA
- `bun run build` OK.
- Console sem erros em `/`, `/produtos/esteira-transportadora-horizontal`, `/faq`, `/contato`, `/agro` (1440) e `/` (390).
- `POST /api/leads` → 201, `/` e `/faq` → 200.

## Rodada 8b — rodapé novo
- `components/layout/footer-parts.tsx`: `FooterSearch` (21 máquinas, sugestões ao digitar + "mais procurados" no foco, Esc fecha), `OpenStatus` (status ao vivo em America/Sao_Paulo, atualiza a cada 30s), `TrustRow` (5 selos em linha), `NewsletterBox` (POST /api/newsletter), `LocalBusinessBlock` (microdados schema.org/LocalBusiness), `BrandWordmark` (DEMAKINE em Anton recortado na base com parallax no scroll).
- API: nova rota `POST /api/newsletter` (valida e-mail, grava na tabela `leads` com `source: newsletter-rodape`, phone "-"). Testado: 201.
- `styles.css`: bloco `.dm-wordmark` + `prefers-reduced-motion`.
- `site.cnpj` criado vazio: a linha de CNPJ só aparece quando o número oficial for preenchido. Candidato encontrado em consulta pública (mesmo endereço/telefone/e-mail): 28.078.104/0001-38 (Demak Indústria e Comércio de Máquinas Ltda) — PENDENTE de confirmação do cliente.
- QA: build OK, console sem erros em 1440 e 390, `/` 200, newsletter 201.
