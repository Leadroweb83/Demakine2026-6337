#!/usr/bin/env python3
"""
Gera os dados de SEO do cardápio a partir de data/menu.json.

O que faz:
  * escreve no <head> do index.html (entre SEO:INICIO e SEO:FIM) o JSON-LD
    Schema.org Restaurant + Menu com todas as seções, pratos e preços;
  * com --dominio, também escreve canonical, hreflang (pt/en), og:url, og:image
    absolutos e gera robots.txt e sitemap.xml.

Uso (rode sempre que alterar preços ou pratos):
  python3 tools/gerar-seo.py
  python3 tools/gerar-seo.py --dominio https://cardapio.seudominio.com.br
"""
import argparse
import datetime
import html
import json
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
INICIO, FIM = "<!-- SEO:INICIO", "<!-- SEO:FIM -->"


def preco_txt(v):
    return f"{v:.2f}"


def oferta(valor, nome=None):
    o = {"@type": "Offer", "price": preco_txt(valor), "priceCurrency": "BRL"}
    if nome:
        o["name"] = nome
    return o


def item_schema(item, cat, en):
    s = {"@type": "MenuItem", "name": item["nome"]}
    if item.get("descricao"):
        s["description"] = item["descricao"]
    if "preco" in item:
        s["offers"] = oferta(item["preco"])
    elif item.get("precos"):
        ofertas = []
        for p in item["precos"]:
            pessoas = p[2] if len(p) > 2 else (cat.get("familia") if p[0] == "Família" else None)
            ofertas.append(oferta(p[1], p[0] + (f" ({pessoas})" if pessoas else "")))
        s["offers"] = ofertas[0] if len(ofertas) == 1 else ofertas
    t = en.get("itens", {}).get(item["id"], {})
    if t.get("nome") and t["nome"] != item["nome"]:
        s["alternateName"] = t["nome"]
    return s


def menu_schema(menu, en, url_base):
    secoes = []
    for cat in menu["categorias"]:
        sec = {"@type": "MenuSection", "name": cat["nome"]}
        desc = cat.get("nota") or cat.get("eyebrow")
        if desc:
            sec["description"] = desc
        if url_base:
            sec["url"] = f"{url_base}#{cat['id']}"
        if cat.get("foto") and url_base:
            sec["image"] = f"{url_base}assets/images/{cat['foto']}.webp"
        itens = []
        if cat.get("tipo") == "executivo":
            for plano in cat["planos"]:
                for s in plano["secoes"]:
                    for p in s["itens"]:
                        mi = {"@type": "MenuItem", "name": f"Executivo · {p['nome']}",
                              "description": "Entrada + prato principal + sobremesa. " + (p.get("descricao") or ""),
                              "offers": oferta(plano["preco"], "Por pessoa")}
                        mi["description"] = mi["description"].strip()
                        itens.append(mi)
        else:
            for item in cat["itens"]:
                mi = item_schema(item, cat, en)
                if item.get("foto") and url_base:
                    mi["image"] = f"{url_base}assets/images/{item['foto']}.webp"
                itens.append(mi)
        sec["hasMenuItem"] = itens
        secoes.append(sec)
    m = {"@type": "Menu", "name": "Cardápio", "inLanguage": ["pt-BR", "en"], "hasMenuSection": secoes}
    if url_base:
        m["url"] = url_base
    return m


def restaurante_schema(menu, en, url_base):
    r = menu["restaurante"]
    precos = []
    for c in menu["categorias"]:
        for i in c.get("itens", []):
            if "preco" in i:
                precos.append(i["preco"])
            for p in i.get("precos", []):
                precos.append(p[1])
    s = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": f"{r['nome']} · {r['unidade']}",
        "alternateName": ["Bar do Alemão Vila Olímpia", "Bar do Alemão da Vila"],
        "description": "Restaurante e bar da Família Steiner, desde 1902. Parmegiana original de Itu, cozinha alemã (Eisbein, Kassler, salsichões), filé mignon, chopp e coquetéis.",
        "servesCuisine": ["Alemã", "Brasileira", "Parmegiana"],
        "priceRange": f"R$ {min(precos):.0f} a R$ {max(precos):.0f}",
        "currenciesAccepted": "BRL",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Ramos Batista, 147",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "addressCountry": "BR",
        },
        "areaServed": "Vila Olímpia, São Paulo",
        "telephone": "+55-11-93946-0955",
        "sameAs": [f"https://instagram.com/{r['instagram']}"],
        "hasMap": r["mapa"],
        "hasMenu": menu_schema(menu, en, url_base),
    }
    if url_base:
        s["url"] = url_base
        s["image"] = [f"{url_base}assets/images/parmegiana.webp", f"{url_base}assets/logo.png"]
        s["logo"] = f"{url_base}assets/logo.png"
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dominio", help="endereço público do cardápio, ex.: https://cardapio.exemplo.com.br")
    a = ap.parse_args()

    menu = json.loads((RAIZ / "data/menu.json").read_text(encoding="utf-8"))
    en_path = RAIZ / "data/en.json"
    en = json.loads(en_path.read_text(encoding="utf-8")) if en_path.exists() else {}
    base = (a.dominio.rstrip("/") + "/") if a.dominio else None

    ld = json.dumps(restaurante_schema(menu, en, base), ensure_ascii=False, indent=1)
    ld = ld.replace("</", "<\\/")  # segurança dentro de <script>

    linhas = [f"{INICIO} (gerado por tools/gerar-seo.py a partir de data/menu.json; não edite à mão) -->"]
    if base:
        e = html.escape
        linhas += [
            f'  <link rel="canonical" href="{e(base)}">',
            f'  <link rel="alternate" hreflang="pt-BR" href="{e(base)}">',
            f'  <link rel="alternate" hreflang="en" href="{e(base)}?lang=en">',
            f'  <link rel="alternate" hreflang="x-default" href="{e(base)}">',
            f'  <meta property="og:url" content="{e(base)}">',
            f'  <meta property="og:image" content="{e(base)}assets/images/parmegiana.webp">',
        ]
    linhas += ['  <script type="application/ld+json">', ld, "  </script>", "  " + FIM]
    bloco = "\n".join(linhas)

    idx = RAIZ / "index.html"
    doc = idx.read_text(encoding="utf-8")
    novo, n = re.subn(re.escape(INICIO) + r".*?" + re.escape(FIM), lambda _: bloco, doc, flags=re.S)
    if n != 1:
        raise SystemExit("Marcadores SEO:INICIO / SEO:FIM não encontrados no index.html")
    idx.write_text(novo, encoding="utf-8")

    hoje = datetime.date.today().isoformat()
    if base:
        (RAIZ / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
        (RAIZ / "sitemap.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            f"  <url>\n    <loc>{base}</loc>\n    <lastmod>{hoje}</lastmod>\n"
            f'    <xhtml:link rel="alternate" hreflang="pt-BR" href="{base}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="en" href="{base}?lang=en"/>\n  </url>\n'
            f"  <url>\n    <loc>{base}?lang=en</loc>\n    <lastmod>{hoje}</lastmod>\n"
            f'    <xhtml:link rel="alternate" hreflang="pt-BR" href="{base}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="en" href="{base}?lang=en"/>\n  </url>\n'
            "</urlset>\n", encoding="utf-8")
    else:
        (RAIZ / "robots.txt").write_text("User-agent: *\nAllow: /\n", encoding="utf-8")

    n_itens = sum(len(s["hasMenuItem"]) for s in json.loads(ld.replace("<\\/", "</"))["hasMenu"]["hasMenuSection"])
    print(f"SEO gerado: {n_itens} pratos em JSON-LD" + (f", canonical/hreflang/sitemap para {base}" if base else " (sem domínio: rode de novo com --dominio ao publicar)"))


if __name__ == "__main__":
    main()
