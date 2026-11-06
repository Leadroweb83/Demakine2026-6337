# Cardápio digital · Bar do Alemão São Paulo · Vila

Site estático em HTML, CSS e JavaScript puro. Não usa framework nem build.

## Estrutura

```
menu-digital/
  index.html          página única
  css/style.css       visual (Direção A: Vitral & Madeira)
  js/app.js           montagem do cardápio, busca e navegação
  data/menu.json      TODO o conteúdo do cardápio (fonte única)
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

Depois de editar, valide o JSON (por exemplo, em jsonlint.com) antes de publicar.

## Rodar localmente

O cardápio é carregado de `data/menu.json` e, por segurança, o navegador não lê esse arquivo quando a página é aberta direto do disco. Use um servidor local:

```bash
cd menu-digital && python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Publicar

Qualquer hospedagem de site estático funciona (Vercel, Netlify, GitHub Pages ou a hospedagem atual). Basta enviar a pasta `menu-digital` inteira. O QR Code das mesas deve apontar para o endereço publicado.

Links diretos para uma seção ou prato funcionam com `#`, por exemplo `.../#parmegiana` ou `.../#eisbein`.
