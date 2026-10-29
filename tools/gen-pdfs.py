"""Gera os PDFs de download do site (checklist de manutenção, tabela de correias,
checklist antes de comprar) a partir de HTML renderizado no Chrome headless."""

import json
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / "packages/web/public"
OUT = PUB / "downloads"
TMP = pathlib.Path("/tmp/dm-pdf")
CHROME = shutil.which("google-chrome") or "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP.mkdir(parents=True, exist_ok=True)
LOGO = (PUB / "img/site/logo-blue.png").as_uri()

BLUE = "#103D94"
RED = "#e4141b"
GREEN = "#17864f"

CSS = f"""
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: 'Montserrat', 'DejaVu Sans', sans-serif; color: #1c1c1c; -webkit-print-color-adjust: exact; }}
.page {{ width: 210mm; height: 297mm; overflow: hidden; padding: 12mm 15mm 16mm; position: relative; page-break-after: always; }}
.page:last-child {{ page-break-after: auto; }}
header {{ display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 3px solid {BLUE}; padding-bottom: 7mm; }}
header img {{ height: 13mm; }}
header .meta {{ text-align: right; font-size: 8.5pt; color: #666; line-height: 1.5; }}
h1 {{ font-size: 19pt; line-height: 1.12; color: {BLUE}; margin-top: 6mm; letter-spacing: -.4px; }}
.eyebrow {{ font-size: 8.5pt; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: {RED}; }}
.lead {{ font-size: 9.8pt; line-height: 1.5; color: #444; margin-top: 3.5mm; max-width: 160mm; }}
h2 {{ font-size: 13pt; color: {BLUE}; margin-top: 9mm; }}
.card {{ border: 1px solid #e3e6ec; border-radius: 3mm; padding: 4.5mm 5mm 4mm; margin-top: 4mm; }}
.card h3 {{ font-size: 10.8pt; color: {BLUE}; }}
.card .sub {{ font-size: 8.5pt; color: #777; margin-top: 1mm; }}
ul.check {{ list-style: none; margin-top: 3mm; }}
ul.check li {{ display: flex; gap: 3mm; font-size: 9.2pt; line-height: 1.45; padding: 1.5mm 0; border-bottom: 1px dashed #e8eaf0; }}
ul.check li:last-child {{ border-bottom: 0; }}
.box {{ width: 4.5mm; height: 4.5mm; border: 1.4px solid {BLUE}; border-radius: 1mm; flex: 0 0 auto; margin-top: .6mm; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 4.5mm; font-size: 9pt; }}
th, td {{ border: 1px solid #e3e6ec; padding: 2.4mm 3mm; text-align: left; vertical-align: top; line-height: 1.45; }}
th {{ background: {BLUE}; color: #fff; font-size: 9pt; text-transform: uppercase; letter-spacing: .5px; }}
tbody tr:nth-child(even) {{ background: #f7f8fb; }}
td strong {{ color: {BLUE}; }}
.note {{ margin-top: 4.5mm; font-size: 8.5pt; color: #666; line-height: 1.6; border-left: 3px solid {RED}; padding-left: 4mm; }}
footer {{ position: absolute; left: 15mm; right: 15mm; bottom: 8mm; display: flex; justify-content: space-between; border-top: 1px solid #e3e6ec; padding-top: 3mm; font-size: 8pt; color: #888; }}
.cta {{ margin-top: 6mm; background: {BLUE}; color: #fff; border-radius: 3mm; padding: 6mm; }}
.cta strong {{ display: block; font-size: 12pt; }}
.cta p {{ font-size: 9.5pt; line-height: 1.6; margin-top: 2mm; color: rgba(255,255,255,.85); }}
.cta .wa {{ display: inline-block; margin-top: 4mm; background: {GREEN}; padding: 3mm 6mm; border-radius: 2mm; font-weight: 800; font-size: 10pt; }}
.grid2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }}
.tip {{ font-size: 9pt; line-height: 1.5; color: #444; margin-top: 2mm; }}
"""

CONTACT = "Demakine Equipamentos Agroindustriais · Limeira/SP · (19) 3033-9397 · (19) 99884-2717 · vendas@demakine.com.br · demakine.com.br"


def header(title_right):
    return f"""<header><img src="{LOGO}" alt="Demakine"><div class="meta">{title_right}</div></header>"""


def footer(page):
    return f"""<footer><span>{CONTACT}</span><span>{page}</span></footer>"""


def shell(pages, title):
    body = "\n".join(pages)
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{body}</body></html>"""


def render(html, name):
    src = TMP / f"{name}.html"
    src.write_text(html, encoding="utf-8")
    out = OUT / f"{name}.pdf"
    subprocess.run(
        [
            CHROME,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={out}",
            src.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    print(out, out.stat().st_size // 1024, "KB")


# ------------------------------------------------------- checklist de manutenção
def maintenance_plan():
    """Lê o plano de manutenção direto do TS para não duplicar conteúdo."""
    ts = (ROOT / "packages/web/src/web/lib/product-content.ts").read_text(encoding="utf-8")
    block = ts.split("export const maintenancePlan")[1]
    plans = []
    for m in re.finditer(r'period:\s*"([^"]+)"\s*,\s*items:\s*\[(.*?)\]', block, re.S):
        items = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(2))
        plans.append((m.group(1), [i.replace('\\"', '"') for i in items]))
    return plans


def pdf_maintenance():
    plans = maintenance_plan()
    assert len(plans) == 3, plans
    cards = ""
    for period, items in plans:
        lis = "".join(f'<li><span class="box"></span><span>{i}</span></li>' for i in items)
        cards += f"""<div class="card"><h3>{period}</h3><ul class="check">{lis}</ul></div>"""

    page = f"""<div class="page">{header("Checklist de manutenção preventiva<br>Esteiras, roscas, elevadores e empacotamento")}
    <p class="eyebrow" style="margin-top:7mm">Manutenção preventiva</p>
    <h1>Manutenção em 5 minutos por dia</h1>
    <p class="lead">A maior parte das paradas de linha que atendemos poderia ter sido vista antes, em uma volta rápida na máquina. Imprima esta folha, pendure perto do equipamento e marque a conferência todo dia.</p>
    {cards}
    <div class="note">Segurança primeiro: faça qualquer inspeção que exija contato com a máquina somente com o equipamento desligado e bloqueado. Lubrificação e troca de peça seguem a orientação do manual do equipamento.</div>
    {footer("Checklist de manutenção · Demakine")}</div>

    <div class="page">{header("Registro de manutenção")}
    <p class="eyebrow" style="margin-top:7mm">Registro</p>
    <h1>Folha de registro</h1>
    <p class="lead">Anotar o que foi feito é o que transforma manutenção em previsibilidade: você passa a saber quando a correia costuma pedir troca e programa a peça antes da safra.</p>
    <table><thead><tr><th style="width:22mm">Data</th><th style="width:32mm">Responsável</th><th>O que foi conferido ou trocado</th><th style="width:34mm">Próxima ação</th></tr></thead><tbody>
    {"".join("<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>" for _ in range(13))}
    </tbody></table>
    <div class="cta"><strong>Precisa de peça de reposição?</strong>
    <p>Correia, roletes, raspador, rolamentos, redutor, motor e itens de costura de sacaria. Mande foto da peça pelo WhatsApp que a cotação sai direto com a assistência técnica.</p>
    <span class="wa">WhatsApp (19) 99884-2717</span></div>
    {footer("Checklist de manutenção · Demakine")}</div>"""
    render(shell([page], "Checklist de manutenção Demakine"), "checklist-manutencao-demakine")


# --------------------------------------------------------- tabela de correias
BELTS = [
    (
        "Lisa (PVC ou borracha)",
        "Sacaria, caixa, pacote, volume fechado e linha de montagem",
        "Superfície contínua, fácil de limpar e de emendar. Padrão para carga que apoia inteira na correia.",
        "Material solto em inclinação acentuada: a carga tende a retornar.",
    ),
    (
        "Taliscada (com travessas)",
        "Grão, fertilizante, resíduo e qualquer material solto em subida",
        "As talíscas seguram a carga e permitem trabalhar inclinado sem retorno de produto.",
        "Linha que exige higienização pesada: as talíscas acumulam resíduo.",
    ),
    (
        "Perfil em V (calha)",
        "Granel fino e seco, como grão, semente, areia e farelo",
        "A correia forma calha e aumenta o volume transportado na mesma largura, com menos perda pela lateral.",
        "Volume fechado, como saco e caixa, que não acomoda na calha.",
    ),
    (
        "PVC sanitária branca",
        "Alimento embalado, hortifruti e ambiente que exige limpeza frequente",
        "Superfície lisa e clara, fácil de higienizar e de inspecionar visualmente.",
        "Material abrasivo e com ponta cortante, que marca a superfície.",
    ),
    (
        "Atóxica para contato direto",
        "Alimento sem embalagem, seleção de fruta e legume",
        "Material adequado ao contato com alimento, para linha de seleção e embalagem.",
        "Carga pesada e abrasiva, que pede correia mais robusta.",
    ),
    (
        "Borracha reforçada",
        "Reciclagem, entulho, brita, carvão e material com aresta viva",
        "Resiste melhor a impacto, corte e abrasão em carga irregular.",
        "Linha de alimento e ambiente que exige superfície clara e sanitária.",
    ),
    (
        "Modular / de grade",
        "Lavagem, drenagem e transporte de fruta com água",
        "Permite drenar líquido e lavar a correia no próprio equipamento.",
        "Granel fino, que passa pelos vãos da grade.",
    ),
]


def pdf_belts():
    rows = "".join(
        f"<tr><td><strong>{n}</strong></td><td>{u}</td><td>{w}</td><td>{a}</td></tr>"
        for n, u, w, a in BELTS
    )
    page = f"""<div class="page">{header("Guia de correias por aplicação<br>Referência para escolha de projeto")}
    <p class="eyebrow" style="margin-top:7mm">Guia de seleção</p>
    <h1>Qual correia usar em cada aplicação</h1>
    <style>table {{ font-size: 7.9pt; margin-top: 4mm; }} th, td {{ padding: 1.7mm 2.4mm; }} .cta {{ margin-top: 4.5mm; padding: 4.5mm; }} .cta strong {{ font-size: 11pt; }} .cta p {{ font-size: 9pt; }} .cta .wa {{ margin-top: 3mm; padding: 2.4mm 5mm; }} .note {{ margin-top: 3.5mm; font-size: 8pt; }} h1 {{ font-size: 18pt; }} .lead {{ font-size: 9.4pt; }}</style>
    <p class="lead">A correia é o item que mais influencia o resultado do transporte e o custo de manutenção. Este guia é qualitativo, para orientar a conversa: a especificação final sai no projeto, depois de conhecer material, umidade, capacidade e inclinação da sua operação.</p>
    <table><thead><tr><th style="width:38mm">Tipo de correia</th><th style="width:48mm">Onde se aplica bem</th><th>Por que funciona</th><th style="width:44mm">Evite quando</th></tr></thead><tbody>{rows}</tbody></table>
    <div class="note">Regra prática: material solto em subida pede talísca; granel fino rende mais em perfil em V; linha de alimento pede correia clara e higienizável; carga com aresta viva pede borracha reforçada. Na dúvida, descreva o material e a gente indica.</div>
    <div class="cta"><strong>Não sabe qual correia pedir?</strong>
    <p>Manda uma foto do material e do local pelo WhatsApp. A gente indica o perfil de correia, a largura e a inclinação de trabalho junto com o orçamento.</p>
    <span class="wa">WhatsApp (19) 99884-2717</span></div>
    {footer("Guia de correias · Demakine")}</div>"""
    render(shell([page], "Guia de correias Demakine"), "tabela-de-correias-demakine")


# ------------------------------------------- checklist antes de comprar esteira
BUY = [
    (
        "1. O material está descrito de verdade",
        [
            "Qual é o produto transportado (grão, sacaria, caixa, resíduo, fruta, areia, carvão)",
            "Umidade do material: seco, úmido ou com risco de empedrar",
            "Granulometria: pó fino, grão, peça grande ou volume fechado",
            "Peso da peça maior que vai passar pela correia",
            "Se o material tem aresta viva, é abrasivo ou corrosivo",
        ],
    ),
    (
        "2. A capacidade foi calculada pelo pico",
        [
            "Volume por hora no pico, não na média do dia",
            "Unidade que você usa: t/h, sacas/h, caixas/min ou volumes/turno",
            "Quantas horas por dia e quantos dias por semana a linha opera",
            "Se existe safra ou temporada que multiplica o volume",
        ],
    ),
    (
        "3. As medidas do local estão conferidas",
        [
            "Distância entre o ponto de alimentação e o ponto de descarga",
            "Altura de descarga e se ela varia (caminhão, moega, silo, mesa)",
            "Altura livre até telhado, viga ou tubulação no ponto de descarga",
            "Espaço para circular e operar em volta do equipamento",
            "Piso firme e nivelado onde os pés vão apoiar",
        ],
    ),
    (
        "4. A inclinação foi validada",
        [
            "Inclinação necessária no local, em graus ou pela altura e distância",
            "Se a inclinação exige correia taliscada para o material não retornar",
            "Se dá para alongar a esteira e trabalhar com menos inclinação",
            "Se a capacidade foi recalculada considerando a inclinação real",
        ],
    ),
    (
        "5. A instalação está preparada",
        [
            "Ponto elétrico pronto, na tensão correta, com disjuntor e aterramento",
            "Confirmação se a rede é trifásica antes da fabricação do motor",
            "Acesso do caminhão até o ponto de montagem: portão, corredor, pé-direito",
            "Equipe e equipamento para descarga no dia da entrega",
        ],
    ),
    (
        "6. O pós-venda foi combinado",
        [
            "Quais peças de desgaste convém manter em estoque antes da safra",
            "Como abrir atendimento de assistência técnica e com quem falar",
            "Rotina de manutenção diária, semanal e mensal repassada à equipe",
            "Documentação de entrega e condições de garantia por escrito na proposta",
        ],
    ),
]


def pdf_buy():
    def render_cards(group):
        out = ""
        for title, items in group:
            lis = "".join(f'<li><span class="box"></span><span>{i}</span></li>' for i in items)
            out += f"""<div class="card"><h3>{title}</h3><ul class="check">{lis}</ul></div>"""
        return out

    parts = [render_cards(BUY[:3]), render_cards(BUY[3:])]

    p1 = f"""<div class="page">{header("Checklist do comprador<br>Antes de comprar uma esteira transportadora")}
    <p class="eyebrow" style="margin-top:7mm">Checklist do comprador</p>
    <h1>Antes de comprar uma esteira transportadora</h1>
    <p class="lead">São 27 conferências, organizadas em 6 blocos, que evitam o retrabalho mais comum: máquina que chega e não encaixa no layout, correia errada para o material ou motor trabalhando no limite. É a mesma lista que a nossa engenharia percorre antes de fechar um projeto.</p>
    {parts[0]}
    {footer("Checklist antes de comprar · Demakine · 1 de 3")}</div>

    <div class="page">{header("Checklist do comprador<br>Antes de comprar uma esteira transportadora")}
    <p class="eyebrow" style="margin-top:7mm">Checklist do comprador</p>
    <h1>Instalação, inclinação e pós-venda</h1>
    <p class="lead">A segunda metade da lista é a que garante que a máquina entra em operação no dia da chegada e continua rodando depois da primeira safra.</p>
    {parts[1]}
    {footer("Checklist antes de comprar · Demakine · 2 de 3")}</div>"""

    # segunda página: erros que custam caro + CTA
    mistakes = [
        (
            "Largura de correia subdimensionada",
            "Escolher pelo preço e não pela carga faz o produto transbordar na lateral e a linha virar limpeza constante. Dimensione pela peça maior e pelo pico de volume.",
        ),
        (
            "Motor trabalhando no limite",
            "Motor apertado esquenta, desarma no meio do turno e leva o redutor junto. Vale sobrar folga de motorização, principalmente em subida e com partidas frequentes.",
        ),
        (
            "Correia errada para o material",
            "Correia lisa em subida forte com material solto devolve carga para o pé da esteira. Material solto em inclinação pede talísca; granel fino rende mais em perfil em V.",
        ),
        (
            "Inclinação decidida sem recalcular",
            "Quanto mais inclinada a esteira, menor a capacidade real. Se a inclinação mudar depois do projeto, capacidade e motorização precisam ser revistas.",
        ),
        (
            "Local não preparado na entrega",
            "Piso irregular desalinha a correia, e ponto elétrico fora da tensão atrasa a partida. Preparar o local antes é o que faz a máquina operar no dia da chegada.",
        ),
        (
            "Peça de desgaste sem previsão",
            "Correia e emenda são consumíveis. Descobrir isso no meio da safra custa muito mais caro que ter a peça na prateleira.",
        ),
    ]
    blocks = "".join(
        f'<div class="card"><h3>{t}</h3><p class="tip">{d}</p></div>' for t, d in mistakes
    )
    p2 = f"""<div class="page">{header("Checklist do comprador<br>Erros que custam caro")}
    <style>.card {{ padding: 3.6mm 4.5mm; margin-top: 3.2mm; }} .card h3 {{ font-size: 10.2pt; }} .tip {{ font-size: 8.5pt; }} .cta {{ margin-top: 5mm; padding: 4.5mm; }} .cta strong {{ font-size: 11pt; }} .cta p {{ font-size: 8.8pt; }} .cta .wa {{ margin-top: 3mm; padding: 2.4mm 5mm; font-size: 9.5pt; }}</style>
    <p class="eyebrow" style="margin-top:7mm">Erros que custam caro</p>
    <h1>O que mais dá problema depois da compra</h1>
    <p class="lead">Nenhum destes erros é caro de evitar no projeto. Todos são caros de corrigir com a máquina instalada e a linha rodando.</p>
    {blocks}
    <div class="cta"><strong>Quer conferir sua escolha com quem fabrica?</strong>
    <p>Fábrica própria em Limeira/SP, com projeto sob medida, entrega em todo o Brasil, assistência técnica e peças de reposição. Descreva sua operação que a gente dimensiona junto.</p>
    <span class="wa">WhatsApp (19) 99884-2717 · vendas@demakine.com.br</span></div>
    {footer("Checklist antes de comprar · Demakine · 3 de 3")}</div>"""

    render(
        shell([p1, p2], "Checklist antes de comprar uma esteira"),
        "checklist-antes-de-comprar-uma-esteira",
    )


# ------------------------------------------- checklist de manutenção por equipamento
def product_maintenance():
    """Lê o plano de cada equipamento do mesmo TS que alimenta o site (via bun)."""
    web = ROOT / "packages/web"
    code = 'const m = await import("./src/web/lib/product-maintenance.ts"); console.log(JSON.stringify(m.productMaintenance))'
    out = subprocess.run(["bun", "-e", code], cwd=web, check=True, capture_output=True, text=True).stdout
    names = {p["slug"]: p["name"] for p in json.loads((web / "src/web/data/content.json").read_text(encoding="utf-8"))["products"]}
    return {slug: (names[slug], plan) for slug, plan in json.loads(out).items()}


def pdf_product_maintenance():
    for slug, (name, m) in product_maintenance().items():
        cards = ""
        for group in m["plan"]:
            lis = "".join(f'<li><span class="box"></span><span>{i}</span></li>' for i in group["items"])
            cards += f"""<div class="card"><h3>{group["period"]}</h3><ul class="check">{lis}</ul></div>"""
        always = "".join(f"<li>{a}</li>" for a in m["always"])
        file = m["checklistPdf"].rsplit("/", 1)[1].removesuffix(".pdf")
        page = f"""<div class="page">{header(f"Checklist de manutenção preventiva<br>{name}")}
        <p class="eyebrow" style="margin-top:7mm">Manutenção preventiva</p>
        <h1>Checklist {"do" if re.match(r"(?i)(elevador|cartrans|carrinho|mini sistema|sistema)", name) else "da"} {name}</h1>
        <p class="lead">{m["intro"]} Imprima esta folha, deixe perto do equipamento e marque cada item conferido.</p>
        {cards}
        <div class="note"><strong>Sempre:</strong><ul style="margin:1.5mm 0 0 4mm">{always}</ul>
        <p style="margin-top:2mm">Baseado no {m["source"][0].lower() + m["source"][1:]}. Em caso de dúvida, fale com a assistência técnica: (19) 99941-4129.</p></div>
        {footer(f"Checklist · {name}")}</div>

        <div class="page">{header(f"Registro de manutenção<br>{name}")}
        <p class="eyebrow" style="margin-top:7mm">Registro</p>
        <h1>Folha de registro</h1>
        <p class="lead">Anotar o que foi feito é o que transforma manutenção em previsibilidade: você passa a saber quando cada peça costuma pedir troca e programa a reposição antes de parar.</p>
        <table><thead><tr><th style="width:22mm">Data</th><th style="width:32mm">Responsável</th><th>O que foi conferido ou trocado</th><th style="width:34mm">Próxima ação</th></tr></thead><tbody>
        {"".join("<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>" for _ in range(13))}
        </tbody></table>
        <div class="cta"><strong>Precisa de peça de reposição?</strong>
        <p>Mande foto da peça pelo WhatsApp que a cotação sai direto com a assistência técnica da Demakine.</p>
        <span class="wa">WhatsApp (19) 99884-2717</span></div>
        {footer(f"Checklist · {name}")}</div>"""
        render(shell([page], f"Checklist de manutenção {name}"), file)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    if "produtos" in sys.argv:
        pdf_product_maintenance()
    else:
        pdf_maintenance()
        pdf_belts()
        pdf_buy()
        pdf_product_maintenance()
