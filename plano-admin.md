# Painel Administrativo Demakine — Plano v2

Atualizado com suas decisões: um único super admin inicial (você), que cria todo mundo depois; site 100% administrável; área de vagas nova no site e no painel; e 30 ideias extras para você escolher.

---

## 1. Usuários e papéis

### Criação

Crio **um usuário super admin** com o seu e-mail. Ninguém mais nasce cadastrado. Você entra e cria os demais direto no painel (Usuários > Convidar), definindo papel e senha inicial, com troca obrigatória no primeiro acesso.

### O que cada papel vê no painel

| Área do painel | Super admin | Admin | Editor |
|---|---|---|---|
| Dashboard geral | completo | completo | versão de conteúdo (posts, tráfego, pendências) |
| Leads / CRM | tudo | tudo | **não vê** |
| Exportar leads | sim | sim | não |
| Vagas e candidaturas | tudo | tudo | vê vagas, não vê candidatos |
| Produtos do catálogo | tudo | tudo | só leitura |
| Loja (preço e estoque) | tudo | tudo | **não vê** |
| Blog | tudo, publica | tudo, publica | cria e edita, envia para aprovação |
| Cases | tudo, publica | tudo, publica | cria e edita, envia para aprovação |
| Depoimentos e logos | tudo | tudo | cria e edita, envia para aprovação |
| Biblioteca de mídia | tudo | tudo | envia e usa, não apaga arquivo de terceiro |
| Dados do site (telefones, CNPJ, endereço, números da home) | tudo | tudo | **não vê** |
| Páginas institucionais e textos fixos | tudo | tudo | edita texto, não muda estrutura |
| SEO global, redirecionamentos, sitemap | tudo | tudo | só o SEO do próprio post |
| Usuários e papéis | **só ele** | não vê | não vê |
| Integrações, chaves e e-mails de notificação | **só ele** | só leitura | não vê |
| Registro de atividades (quem mudou o quê) | tudo | vê o próprio + do editor | vê o próprio |
| Lixeira e restauração | restaura e apaga definitivo | restaura | não vê |

Resumo em uma linha: **editor cuida do que é publicação e nunca toca em cliente, preço ou configuração; admin toca em tudo do negócio; super admin ainda controla quem entra e as chaves.**

Se quiser um quarto papel **vendedor** (só leads e vagas, nada de conteúdo), é um ajuste pequeno. Diga se entra.

---

## 2. Site 100% administrável

Nada de conteúdo continua preso no código. Vai para o banco e ganha tela de edição:

- **Produtos** (21): nome, slug, descrição, categoria, especificações, fotos (upload, ordenação, foto de capa), documentos, produtos relacionados, ativo/inativo, ordem.
- **Loja**: preço, estoque, disponibilidade, destaque, kits.
- **Blog** (11 posts): texto, capa, categoria, tags, autor, agendamento.
- **Cases** (4): dados reais do cliente, números, fotos, depoimento, autorização.
- **Landing pages de segmento** (5): título, dores, etapas do fluxo, FAQ, produtos ligados.
- **Depoimentos** (29) e **logos de clientes** (45).
- **Projetos especiais** (24).
- **Home**: ordem das seções, textos do hero, números das estatísticas, banners, chamada de destaque.
- **Páginas institucionais**: A Empresa, Assistência Técnica, Downloads, FAQ, Ferramentas, Agro, Contato, Exportação (es/en).
- **Dados do site**: telefones, WhatsApp, e-mails, endereço, CNPJ, horário, redes, aviso de telefone indisponível.
- **Textos legais**: política de privacidade e termos, com data de atualização automática.
- **SEO**: title, description e imagem social de cada página; robots e sitemap gerados do banco.

---

## 3. Área de vagas (nova)

**No site:**
- `/vagas` com a lista de vagas abertas, filtro por área e por tipo (CLT, estágio, temporário) e busca.
- `/vagas/:slug` com descrição, requisitos, o que oferecemos, local e formulário de candidatura com **upload de currículo em PDF** e campos de LinkedIn e pretensão.
- Banco de talentos: quem não achar vaga se cadastra mesmo assim.
- A página Trabalhe Conosco atual passa a puxar as vagas do banco em vez do arquivo.

**No painel:**
- CRUD de vagas: título, área, tipo, local, descrição, requisitos, salário visível ou não, status (aberta, pausada, encerrada), data limite.
- Candidaturas em kanban: recebido, triagem, entrevista, teste, aprovado, reprovado, banco de talentos.
- Currículo baixável, anotações internas, e-mail de resposta em um clique, exportação da lista.
- Contador de candidatos por vaga e tempo médio de preenchimento.

---

## 4. As 30 ideias

Marque os números que quer. Os que não escolher ficam registrados para depois.

### Layout e navegação (1 a 8)

1. **Menu lateral recolhível** com ícones, atalho de teclado e busca global (Ctrl+K) que acha lead, produto, post ou vaga pelo nome.
2. **Modo claro e escuro** com preferência salva por usuário.
3. **Home do painel personalizada por papel**: vendedor abre nos leads dele, editor abre nos rascunhos, admin abre no resumo geral.
4. **Widgets arrastáveis** no dashboard: cada um monta a própria tela com os cartões que interessam.
5. **Barra de ações rápidas** fixa no topo: novo lead, novo post, nova vaga, nova vaga de produto, sem sair da tela atual.
6. **Edição em linha** nas tabelas: clicar na célula e mudar o valor sem abrir a página inteira.
7. **Pré-visualização lado a lado**: enquanto edita um post ou produto, vê exatamente como fica no site, em desktop e celular.
8. **Painel leve de verdade**: carregamento por página, tabelas virtualizadas e cache. O admin atual pesa porque carrega tudo de uma vez.

### Gráficos e relatórios (9 a 17)

9. **Funil de leads** do primeiro contato até fechado, com taxa de queda em cada etapa.
10. **Leads por mês** em barras com comparativo do mesmo mês do ano anterior.
11. **Origem que mais converte**: gráfico por `source` cruzando volume e taxa de ganho, para saber onde investir.
12. **Ranking de produtos mais pedidos** com evolução mês a mês.
13. **Mapa do Brasil por estado** mostrando de onde vêm os leads e onde a Demakine está fraca.
14. **Tempo médio de resposta** por vendedor, com alerta de lead parado há mais de 48 horas.
15. **Desempenho do blog**: posts mais lidos, tempo de leitura, quantos leads vieram de cada post.
16. **Termos mais buscados** dentro do site e da loja, revelando produto que falta no catálogo.
17. **Relatório mensal automático** em PDF com os números do mês, enviado por e-mail no dia 1.

### Leads e vendas (18 a 23)

18. **Kanban de leads** arrastando entre status, com cor por temperatura.
19. **Distribuição automática** de leads entre vendedores por rodízio ou por região.
20. **Modelos de mensagem** de WhatsApp e e-mail prontos, com os dados do lead preenchidos, a um clique.
21. **Lembretes de follow-up** com data e hora, aparecendo na home do painel e no e-mail.
22. **Detecção de lead duplicado** por telefone e e-mail, com opção de mesclar.
23. **Motivo de perda** obrigatório ao marcar perdido, virando um gráfico do que mais faz perder venda.

### Conteúdo e IA (24 a 28)

24. **Assistente de escrita no editor**: gera rascunho, reescreve trecho, ajusta o tom, marca onde entra imagem e diz o que a foto deve mostrar.
25. **SEO e GEO automáticos**: title, meta description, slug, alt das imagens, resumo direto no topo, blocos de pergunta e resposta e JSON-LD, tudo revisável antes de salvar.
26. **Nota de qualidade do post** antes de publicar, com checklist do que falta (imagem sem alt, texto curto demais, sem CTA, sem link interno).
27. **Fila de pautas e calendário editorial** com lembrete quando passar X dias sem post novo.
28. **Descrição de produto por IA** a partir das especificações técnicas, e texto alternativo automático para cada foto enviada.

### Segurança e operação (29 a 30)

29. **Registro de atividades e lixeira**: quem mudou o quê e quando, com desfazer e restauração de item apagado.
30. **Verificação em duas etapas** no login e sessão que expira, com aviso no painel se algo essencial do site estiver faltando (produto sem foto, vaga vencida, CNPJ em branco, post agendado sem capa).

**Status: as 30 estão aprovadas e entram no escopo**, distribuídas nas fases da seção 5.

---

## 4B. Imagens e mídia (o que faltava)

Toda imagem do site passa a ser gerenciada em um só lugar, e não mais como arquivo solto na pasta do código.

**Biblioteca de mídia**
- Grade visual com todas as imagens, busca por nome, filtro por pasta ou produto e a informação de onde cada imagem está sendo usada.
- Pastas por assunto: produtos, cases, blog, clientes, equipe, banners.
- Upload arrastando o arquivo, vários de uma vez, com barra de progresso.
- Aviso antes de apagar quando a imagem está em uso em alguma página.

**Tratamento automático no upload**
- Conversão para WebP e AVIF com JPEG de reserva, sem perda visível.
- Três tamanhos gerados sozinhos (miniatura, médio, grande), entrega do tamanho certo para celular e desktop e carregamento preguiçoso. É o que mais deixa o site rápido.
- Compressão com limite de peso: foto de 8 MB vira algumas centenas de KB.
- Correção de rotação, remoção dos dados de GPS e câmera do arquivo e nome de arquivo limpo com o slug do produto, o que ajuda no SEO de imagem.

**Edição dentro do painel**
- Recorte com proporções prontas (quadrado do card, 16:9 do topo, 4:5 do social), giro, brilho e contraste.
- Ponto focal: você marca o que não pode ser cortado e o site respeita isso em qualquer tela.
- Remoção de fundo em um clique para foto de máquina, gerando PNG limpo para catálogo e proposta.
- Marca d'água opcional com o logo, ligada por pasta.

**Texto alternativo e SEO de imagem**
- Texto alternativo e legenda obrigatórios, com sugestão por IA a partir da foto e do produto.
- Lista no painel das imagens sem texto alternativo.
- Sitemap de imagens e dados estruturados em produto e post.

**Galerias**
- Ordenação arrastando, escolha da foto de capa, marcação de foto 360, par de antes e depois e vídeo do YouTube na mesma galeria.
- Reaproveitamento: a mesma foto serve produto, case e post sem subir de novo.

**Armazenamento**
- Arquivos no Tigris, o mesmo já usado nos anexos de lead, servidos por URL própria.
- Lixeira de mídia com 30 dias antes da exclusão definitiva.

---

## 5. Ordem de execução

1. **Fase 1** — Login, papéis, super admin, gestão de usuários e a nova shell do painel (ideias 1, 3, 8 já entram aqui por serem estrutura).
2. **Fase 2** — CRM de leads, dashboard e exportação.
3. **Fase 3** — Migração de todo o conteúdo para o banco e telas de edição.
4. **Fase 4** — Área de vagas, site e painel.
5. **Fase 5** — Editor de blog com IA (SEO e GEO).
6. **Fase 6** — Notificação de novo lead por e-mail; WhatsApp depende de conta na API oficial do WhatsApp Business.

Cada fase entregue funcionando e testada antes da próxima.

---

## 6. O que preciso de você para a fase 1

1. **Seu e-mail** para o super admin (e o nome que aparece no painel).
2. **Senha inicial** — ou eu gero uma forte e você troca no primeiro acesso.
3. Quer o **quarto papel "vendedor"**?
4. Quais dos **30 números** entram agora.

Pendências antigas que continuam abertas: CNPJ oficial, nome e e-mail do encarregado de dados (DPO), e-mails que recebem o aviso de novo lead, e se existe conta na API oficial do WhatsApp Business.
