#!/usr/bin/env python3
"""Migra os artigos do blog do WordPress atual para o site novo.

Uso: python3 tools/migrar-blog.py <pasta-de-cache>
A pasta de cache recebe os JSON da API (posts1.json, posts2.json..., cats.json) e o <head> de cada artigo
(heads/<slug>.html). Se estiver vazia, o script baixa tudo de novo.

Gera: src/data/blog/<slug>.json (um por artigo), src/data/blog-categorias.json e as imagens em public/img/blog/.
"""
import html, io, json, os, re, sys, subprocess, unicodedata, hashlib
from html.parser import HTMLParser
from PIL import Image

ORIGEM = 'https://www.makingnet.com.br'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = sys.argv[1]
os.makedirs(CACHE + '/heads', exist_ok=True)
os.makedirs(CACHE + '/media', exist_ok=True)


def baixar(url, destino):
    if not os.path.exists(destino) or os.path.getsize(destino) == 0:
        subprocess.run(['curl', '-sSL', '-m', '60', '-A', 'Mozilla/5.0', '-o', destino, url], check=False)
    return os.path.exists(destino) and os.path.getsize(destino) > 0


def slugify(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:70]


def imagem(url, slug, largura=1200):
    """Baixa, converte para WebP e devolve {src, w, h} ou None."""
    url = html.unescape(url)
    if url.startswith('//'):
        url = 'https:' + url
    if url.startswith('/'):
        url = ORIGEM + url
    base = os.path.splitext(os.path.basename(url.split('?')[0]))[0]
    base = re.sub(r'-\d+x\d+$', '', base)
    nome = f'{slug[:40]}-{slugify(base)[:40]}-{hashlib.md5(url.encode()).hexdigest()[:6]}'
    bruto = f'{CACHE}/media/{nome}'
    url = re.sub(r'-\d+x\d+(\.(?:png|jpe?g|webp))$', r'\1', url) if 'wp-content/uploads' in url else url
    if not baixar(url, bruto):
        return None
    try:
        im = Image.open(bruto)
        im = im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA') else im.convert('RGB')
    except Exception:
        return None
    if im.width > largura:
        im = im.resize((largura, round(im.height * largura / im.width)), Image.LANCZOS)
    destino = f'{RAIZ}/public/img/blog/{nome}.webp'
    if not os.path.exists(destino):
        im.save(destino, 'WEBP', quality=76, method=5)
    return {'src': f'/img/blog/{nome}.webp', 'w': im.width, 'h': im.height}


PERMITIDAS = {'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'blockquote', 'table', 'thead', 'tbody',
              'tr', 'td', 'th', 'figure', 'figcaption', 'img', 'br', 'hr', 'mark', 'iframe', 'sup', 'sub', 'code', 'pre'}
TROCAS = {'b': 'strong', 'i': 'em', 'h1': 'h2', 'h5': 'h4', 'h6': 'h4'}
VAZIAS = {'img', 'br', 'hr'}
IGNORAR = {'script', 'style', 'noscript', 'form', 'svg', 'button', 'input', 'select', 'textarea'}


class Limpador(HTMLParser):
    def __init__(self, slug):
        super().__init__(convert_charrefs=True)
        self.slug, self.out, self.pulo, self.schemas, self.buf_ld = slug, [], 0, [], None
        self.links, self.pilha = set(), []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.buf_ld = []
        if tag in IGNORAR:
            self.pulo += 1
            return
        if self.pulo:
            return
        tag = TROCAS.get(tag, tag)
        if tag not in PERMITIDAS:
            return
        attr = ''
        if tag == 'a':
            href = (a.get('href') or '').strip()
            if not href or href.startswith('javascript'):
                self.pilha.append(None)
                return
            href = re.sub(r'^https?://(www\.)?makingnet\.com\.br', '', href) or '/'
            if href.startswith('/wp-content/uploads'):
                arq = os.path.basename(href.split('?')[0])
                if re.search(r'\.(png|jpe?g|webp|gif)$', arq, re.I):
                    r = imagem(href, self.slug)
                    href = r['src'] if r else href
                elif baixar(ORIGEM + href, f'{RAIZ}/public/arquivos/{arq}'):
                    href = f'/arquivos/{arq}'
            externo = href.startswith('http')
            if not externo and href.startswith('/'):
                self.links.add(href.split('#')[0].split('?')[0])
            attr = f' href="{html.escape(href, quote=True)}"' + (' target="_blank" rel="noopener"' if externo else '')
            self.pilha.append('a')
        elif tag == 'img':
            src = a.get('data-src') or a.get('data-lazy-src') or a.get('src') or ''
            if not src or src.startswith('data:'):
                return
            r = imagem(src, self.slug)
            if not r:
                return
            alt = html.escape(a.get('alt') or '', quote=True)
            self.out.append(f'<img src="{r["src"]}" alt="{alt}" width="{r["w"]}" height="{r["h"]}" loading="lazy" decoding="async">')
            return
        elif tag == 'iframe':
            src = a.get('src') or a.get('data-src') or ''
            if 'youtube' not in src and 'vimeo' not in src:
                return
            titulo = html.escape(a.get('title') or 'Vídeo', quote=True)
            self.out.append(f'<div class="video"><iframe src="{html.escape(src, quote=True)}" title="{titulo}" loading="lazy" allowfullscreen></iframe></div>')
            return
        elif tag in ('td', 'th'):
            for k in ('colspan', 'rowspan'):
                if a.get(k, '').isdigit():
                    attr += f' {k}="{a[k]}"'
        elif tag in ('h2', 'h3', 'h4') and a.get('id'):
            attr = f' id="{html.escape(a["id"], quote=True)}"'
        self.out.append(f'<{tag}{attr}>')

    def handle_endtag(self, tag):
        if tag in IGNORAR:
            if tag == 'script' and self.buf_ld is not None:
                try:
                    d = json.loads(''.join(self.buf_ld))
                    for item in (d if isinstance(d, list) else [d]):
                        if isinstance(item, dict) and item.get('@type') in ('FAQPage', 'HowTo'):
                            item.pop('@context', None)
                            self.schemas.append(item)
                except Exception:
                    pass
                self.buf_ld = None
            self.pulo = max(0, self.pulo - 1)
            return
        if self.pulo:
            return
        tag = TROCAS.get(tag, tag)
        if tag == 'a':
            if self.pilha and self.pilha.pop() is None:
                return
        if tag in PERMITIDAS and tag not in VAZIAS and tag != 'iframe':
            self.out.append(f'</{tag}>')

    def handle_data(self, data):
        if self.buf_ld is not None:
            self.buf_ld.append(data)
        if not self.pulo:
            self.out.append(html.escape(data, quote=False))


def limpar(conteudo, slug):
    p = Limpador(slug)
    p.feed(conteudo)
    h = ''.join(p.out)
    h = h.replace('\xa0', ' ')
    for _ in range(3):
        h = re.sub(r'<(p|strong|em|h[234]|li|ul|ol|figure|blockquote|a[^>]*)>\s*</\1>', '', h)
        h = re.sub(r'<(p|strong|em|h[234]|figure)>(\s|<br>)*</\1>', '', h)
    h = re.sub(r'<(h[234])([^>]*)>\s*<strong>(.*?)</strong>\s*</\1>', r'<\1\2>\3</\1>', h, flags=re.S)
    h = re.sub(r'<table>', '<div class="tabela"><table>', h).replace('</table>', '</table></div>')
    h = re.sub(r'\n\s*\n+', '\n', h).strip()
    return h, p.schemas, p.links


def texto(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()


# 1) Dados da API
paginas, n = [], 1
while True:
    f = f'{CACHE}/posts{n}.json'
    if not baixar(f'{ORIGEM}/wp-json/wp/v2/posts?per_page=100&page={n}&_embed=wp:featuredmedia,wp:term,author', f):
        break
    try:
        lote = json.load(open(f))
    except Exception:
        break
    if not isinstance(lote, list) or not lote:
        break
    paginas += lote
    if len(lote) < 100:
        break
    n += 1
baixar(f'{ORIGEM}/wp-json/wp/v2/categories?per_page=100', f'{CACHE}/cats.json')
cats = {c['id']: c for c in json.load(open(f'{CACHE}/cats.json'))}

# 2) Artigos
os.makedirs(f'{RAIZ}/src/data/blog', exist_ok=True)
internos, usados = {}, {}
for q in paginas:
    slug = q['slug']
    cab = f'{CACHE}/heads/{slug}.html'
    baixar(f'{ORIGEM}/blog/{slug}/', cab)
    head = open(cab, encoding='utf-8', errors='replace').read()[:30000]
    t = re.search(r'<title>(.*?)</title>', head, re.S)
    d = re.search(r'<meta name="description" content="(.*?)"', head)
    titulo = html.unescape(re.sub(r'<[^>]+>', '', q['title']['rendered'])).strip()
    corpo, schemas, links = limpar(q['content']['rendered'], slug)
    resumo = texto(q['excerpt']['rendered']).replace(' […]', '…').replace('[…]', '…')
    midia = (q.get('_embedded', {}).get('wp:featuredmedia') or [{}])[0]
    capa = imagem(midia['source_url'], slug) if midia.get('source_url') else None
    if capa:
        capa['alt'] = midia.get('alt_text') or titulo
    autor = ((q.get('_embedded', {}).get('author') or [{}])[0].get('name') or '').strip()
    if autor.lower() in ('', 'admin'):
        autor = 'Making TI e Marketing Digital'
    categorias = [cats[c]['slug'] for c in q.get('categories', []) if c in cats]
    for c in categorias:
        usados[c] = usados.get(c, 0) + 1
    palavras = len(texto(corpo).split())
    post = {
        'slug': slug, 'title': titulo,
        'seoTitle': html.unescape(t.group(1)).strip() if t else f'{titulo} | Making',
        'description': html.unescape(d.group(1)).strip() if d else resumo[:155],
        'excerpt': resumo, 'date': q['date'], 'modified': q['modified'], 'author': autor,
        'categories': categorias, 'cover': capa, 'minutes': max(1, round(palavras / 200)), 'words': palavras,
        'schema': schemas, 'html': corpo,
    }
    json.dump(post, open(f'{RAIZ}/src/data/blog/{slug}.json', 'w'), ensure_ascii=False)
    for l in links:
        internos.setdefault(l, []).append(slug)

json.dump([{'slug': c['slug'], 'name': html.unescape(c['name']), 'description': texto(c.get('description') or ''), 'count': usados.get(c['slug'], 0)}
           for c in sorted(cats.values(), key=lambda c: -usados.get(c['slug'], 0)) if usados.get(c['slug'])],
          open(f'{RAIZ}/src/data/blog-categorias.json', 'w'), ensure_ascii=False, indent=1)
json.dump({k: v[:5] for k, v in sorted(internos.items())}, open(f'{CACHE}/links-internos.json', 'w'), ensure_ascii=False, indent=1)
print(len(paginas), 'artigos;', len(usados), 'categorias;', len(internos), 'destinos internos distintos')
