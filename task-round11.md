# Rodada 11 — itens 1, 2, 3, 4, 9

Escolhas do cliente: segmentos = fertilizantes, reciclagem, construção/mineração,
alimentos/ração, logística. Cases sem dado real (estrutura + cenário simulado).
Idiomas = landing única de exportação em ES + EN. Upload de foto com storage real.

## Regra que eu NÃO vou quebrar
O cliente pediu "crie números reais" para os cases. Recusado: seria dado
fabricado apresentado como resultado de terceiro. No lugar:
- estrutura de case pronta, campos pendentes visíveis só no /admin;
- seção de CENÁRIO SIMULADO, rotulada como simulação, com premissas à vista,
  usando a mesma lógica da calculadora de ROI que já existe no site.
Atribuição: descrição genérica ("cooperativa de grãos em Piracicaba/SP"),
sem nome de cliente, porque não há autorização registrada.

## Escopo

### 1. LGPD (desbloqueia anúncio)
- [x] `/politica-de-privacidade`
- [x] `/termos-de-uso`
- [x] banner de cookies com consentimento persistido em localStorage
- [x] link das duas páginas no rodapé institucional

### 2. Páginas de segmento (5)
- [x] `lib/segmentos-lp.ts` com conteúdo das 5 páginas
- [x] rota template `/segmentos/:slug`
- [x] fertilizantes-e-insumos, reciclagem-e-residuos,
      construcao-e-mineracao, alimentos-e-racao, logistica-e-distribuicao
- [x] cada uma: hero próprio, dor do setor, produtos indicados (reais do
      content.json), perguntas do setor, form de lead com source próprio
- [x] entrada no sitemap.xml + link no menu

### 3. Identificação de peça por foto
- [x] `api/lib/s3.ts` (credenciais já no .env)
- [x] `POST /upload/presign` (presigned PUT)
- [x] coluna `attachments` na tabela leads + db:push
- [x] componente de upload com preview e validação (imagem, até 10MB, até 3 fotos)
- [x] seção na /loja e na /assistencia-tecnica
- [x] exibir miniatura no /admin junto do lead
- [x] `GET /admin/attachment` com presigned GET para o admin ver a foto

### 4. Cases
- [x] `lib/cases.ts` com estrutura e flag `pending`
- [x] `/cases` + `/cases/:slug`
- [x] bloco de cenário simulado com premissas explícitas
- [x] campos pendentes só no /admin, nunca no site público

### 9. Landing de exportação
- [x] `/export` com alternância ES / EN (sem afetar o site PT)
- [x] formulário próprio com `source: 'export-es'` / `'export-en'`
- [x] hreflang e SEO das duas versões

## Status
- Item 1 (LGPD): PRONTO. QA ok, console limpo.
- Item 2 (5 LPs de segmento): PRONTO. Rota /segmentos/:slug, fallback para slug
  inválido, links no mega-menu e no rodapé, 5 URLs no sitemap. QA 1440 + 390:
  status 200, sem erro de console, sem imagem quebrada.
- Item 3 (upload de foto): PRONTO. E2E verificado: presign -> PUT no Tigris ->
  lead com attachments -> presigned GET no /admin (401 sem cookie). Seção
  "Identificação por foto" (05) na /loja e anexo no form da /assistencia-tecnica.
  Leads de teste removidos do banco (restaram 4 leads reais).
- Item 4 (cases): PRONTO. /cases + 4 páginas de aplicação. Público mostra
  configuração técnica + cenário simulado rotulado com premissas à vista e
  disclaimer; checklist do que falta para virar case real aparece só no /admin.
  Nenhum número de cliente publicado (recusa mantida).
- Item 9 (landing de exportação): PRONTO. /export com ES (default) e EN via
  ?lang=, header/footer próprios, hreflang es/en/x-default/pt-BR, form com
  source export-es / export-en. Sem prazo de embarque, frete ou Incoterm
  inventado.

## QA final (rodada 11)
Playwright + Chrome, 1440x900 e 390x844, todas as rotas 200, console sem erro,
zero imagem quebrada: /cases, as 4 páginas de case, /export?lang=es, /export?lang=en,
/segmentos/* (5), /politica-de-privacidade, /termos-de-uso, / e /loja.
Upload de foto testado ponta a ponta pelo navegador e por API.
