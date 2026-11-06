# Cardápio digital · Bar do Alemão São Paulo · Vila

Site estático em HTML, CSS e JavaScript puro. Não usa framework nem build.

## Estrutura

```
menu-digital/
  index.html          página única
  css/style.css       visual (Direção A: Vitral & Madeira)
  js/app.js           montagem do cardápio, busca e navegação
  data/menu.json      TODO o conteúdo do cardápio (fonte única de pratos e preços)
  data/en.json        traduções para inglês (sem preços)
  tools/gerar-seo.py  gera os dados de SEO a partir do menu.json
  robots.txt          (sitemap.xml é gerado ao informar o domínio)
  assets/
    logo.png, logo.webp, logo-claro.webp
    images/           fotos dos pratos (WebP)
    icons/            favicon e ícone
    fonts/            Fraunces e Inter (hospedadas no próprio site)
  docs/               cardápio validado e prévias de design
```

## Como atualizar o cardápio

Tudo fica em `data/menu.json`. Não é preciso mexer no HTML.

- **Mudar um preço:** procure o prato e altere o número. Use ponto como separador decimal (`99.9` aparece como 99,90).
- **Preço único:** `"preco": 44.9`
- **Vários tamanhos:** `"precos": [["Individual", 99.9], ["Família", 299.9]]`
  - Um terceiro valor mostra quantas pessoas serve: `["Broto", 174.9, "2 pessoas"]`
  - Nas categorias com `"familia": "3 pessoas"`, o rótulo "Família" ganha "· 3 pessoas" automaticamente.
- **Foto:** `"foto": "nome-do-arquivo"`, sem extensão, apontando para `assets/images/nome-do-arquivo.webp`.
- **Etiquetas:** `"tempo": "40 min"` mostra o tempo de preparo, `"info": ["8 unidades"]` cria etiquetas informativas e `"selo"` na categoria aplica um selo a todos os pratos dela.
- **Novo prato:** copie um item da mesma categoria e troque o `id`, que precisa ser único.
- **Busca:** a lista `sinonimos` faz, por exemplo, quem busca "joelho de porco" encontrar o Eisbein.

Depois de editar, valide o JSON (por exemplo, em jsonlint.com) e atualize o SEO:

```bash
python3 tools/gerar-seo.py --dominio https://SEU-DOMINIO
```

## Versão em inglês

- O botão **EN/PT** fica no topo. A escolha é lembrada no aparelho.
- Link direto em inglês: `.../?lang=en` (útil para QR Code em recepção de hotel).
- Para traduzir um prato novo, acrescente em `data/en.json` → `itens` o mesmo `id` do `menu.json`, com `nome` e `descricao`. Sem tradução, o prato aparece em português.
- A busca funciona nos dois idiomas ao mesmo tempo.

## Almoço executivo automático

- De segunda a sexta, das 11h às 15h (horário de São Paulo), o executivo aparece em primeiro lugar com o selo "Disponível agora".
- Fora desse horário, ele vai para o fim do menu e mostra o horário de funcionamento.
- Feriados não são detectados automaticamente (o aviso "exceto feriados" continua no texto).
- Para testar outro horário: `.../?agora=2026-11-09T12:00:00-03:00`.

## SEO local

- `tools/gerar-seo.py` escreve no `index.html` os dados estruturados Schema.org (`Restaurant` + `Menu`) com todas as seções, pratos e preços. Com `--dominio`, também gera canonical, hreflang pt/en, `sitemap.xml` e `robots.txt`.
- Depois de publicar:
  1. Valide em https://search.google.com/test/rich-results
  2. No Google Search Console, adicione o domínio e envie o `sitemap.xml`.
  3. No Perfil da Empresa no Google (Google Meu Negócio): Editar perfil → Cardápio → Link do cardápio → cole o endereço publicado.
  4. Coloque o mesmo link na bio do Instagram @bardoalemaodavila.
- A hospedagem deve servir os arquivos com compressão (gzip ou brotli). Vercel, Netlify e Cloudflare Pages fazem isso automaticamente.

## Rodar localmente

O cardápio é carregado de `data/menu.json` e, por segurança, o navegador não lê esse arquivo quando a página é aberta direto do disco. Use um servidor local:

```bash
cd menu-digital && python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Publicar

Qualquer hospedagem de site estático funciona (Vercel, Netlify, GitHub Pages ou a hospedagem atual). Basta enviar a pasta `menu-digital` inteira. O QR Code das mesas deve apontar para o endereço publicado.

Links diretos para uma seção ou prato funcionam com `#`, por exemplo `.../#parmegiana` ou `.../#eisbein`.
