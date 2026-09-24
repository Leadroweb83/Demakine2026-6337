/**
 * /loja — LOJA TÉCNICA Demakine.
 * Identidade blueprint: malha de desenho, códigos de peça em mono, cotas,
 * LED de estoque e compra guiada por situação. Só cores da marca.
 *
 * Atenção: os preços vêm de lib/shop.ts e são de EXEMPLO para o layout.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  FileText,
  MessageCircle,
  Package,
  Plus,
  Receipt,
  Ruler,
  Camera,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { ShopFooter, ShopHeader, ShopTicker } from "@/components/shop/chrome";
import { DataLine, Rail, SpecCard, StockLed, TechLink } from "@/components/shop/cards";
import { site, waLink } from "@/lib/site";
import { testimonials } from "@/lib/content";
import { bestSellers, brl, machineFits, quoteItems, situations } from "@/lib/shop";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------- hero */

function Hero() {
  const hero = "/img/produtos/esteira-transportadora-para-sacaria/1.webp";

  return (
    <section className="relative overflow-hidden border-b border-dm-line bg-white">
      <div className="absolute inset-0 shop-grid" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px bg-dm-line lg:block" />

      <div className="relative dm-container grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
        <div>
          <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
            <span className="text-dm-red">01</span>
            Vitrine técnica
            <span className="h-px w-10 bg-dm-line" />
            Rev. 2026
          </p>

          <h1 className="mt-5 font-display text-[36px] font-extrabold uppercase leading-[0.94] tracking-tight text-dm-ink sm:text-[48px] lg:text-[58px]">
            A peça certa,
            <br />
            <span className="text-dm-blue">com o código certo</span>,
            <br />
            saindo da fábrica.
          </h1>

          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-dm-gray">
            Loja oficial da Demakine em Limeira/SP. Você compra rolete, correia, agulha, linha e
            equipamento de movimentação de quem fabrica a máquina, com nota fiscal e suporte técnico
            no WhatsApp.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#vitrine"
              className="flex items-center gap-2 bg-dm-red px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#c21016]"
            >
              Ver itens em estoque
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={waLink("Olá! Preciso identificar uma peça da minha máquina Demakine.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-dm-green/40 bg-dm-green-soft px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-[#0f6b3f] transition-colors hover:bg-dm-green hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Mandar foto da peça
            </a>
          </div>

          <div className="mt-9 max-w-md">
            <DataLine code="A1" label="Despacho" value="24h nos itens de estoque" />
            <DataLine code="A2" label="Pagamento" value="Pix, cartão 12x e boleto CNPJ" />
            <DataLine code="A3" label="Origem" value="Fabricação própria, Limeira/SP" />
          </div>
        </div>

        {/* prancha de desenho */}
        <div className="relative">
          <div className="relative border border-dm-line bg-dm-surface p-3">
            <div className="shop-mono flex items-center justify-between pb-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-dm-gray">
              <span>DES. ET-SAC-000</span>
              <span className="text-dm-blue">ESC. 1:20</span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-dm-ink">
              <img src={hero} alt="Esteira transportadora para sacaria" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 shop-grid-dark opacity-70" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <span className="shop-scan block" />
              </div>

              {/* cotas */}
              <div className="pointer-events-none absolute bottom-4 left-6 right-6 text-white/85">
                <span className="shop-dim shop-dim-h block h-px w-full bg-current" />
                <span className="shop-mono mt-1.5 block truncate text-center text-[8.5px] font-bold tracking-[0.1em] sm:text-[9.5px] sm:tracking-[0.16em]">
                  COMPRIMENTO SOB MEDIDA
                </span>
              </div>
              <div className="pointer-events-none absolute right-4 top-6 bottom-20 text-white/85">
                <span className="shop-dim shop-dim-v block h-full w-px bg-current" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 divide-x divide-dm-line border-t border-dm-line pt-3 text-center">
              {[
                { k: "+15", v: "anos de fábrica" },
                { k: "21", v: "linhas de produto" },
                { k: "BR", v: "envio nacional" },
              ].map((s) => (
                <div key={s.k} className="px-2">
                  <p className="font-display text-[20px] font-extrabold leading-none text-dm-blue">
                    {s.k}
                  </p>
                  <p className="shop-mono mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-dm-gray">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <span className="shop-mono absolute -left-2 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[9.5px] font-bold uppercase tracking-[0.3em] text-dm-gray lg:block">
            Demakine · loja
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- situações */

const toneMap = {
  red: { bar: "bg-dm-red", text: "text-dm-red", btn: "bg-dm-red hover:bg-[#c21016]" },
  blue: { bar: "bg-dm-blue", text: "text-dm-blue", btn: "bg-dm-blue hover:bg-[#0d3480]" },
  green: { bar: "bg-dm-green", text: "text-dm-green", btn: "bg-dm-green hover:bg-dm-green-dark" },
} as const;

function Situations() {
  return (
    <section className="dm-container py-14 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dm-line pb-4">
        <div>
          <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
            <span className="text-dm-red">02</span>
            Compra por situação
          </p>
          <h2 className="mt-3 font-display text-[26px] font-extrabold uppercase leading-tight text-dm-ink md:text-[34px]">
            O que está acontecendo na sua operação hoje?
          </h2>
        </div>
        <p className="shop-mono max-w-xs text-[11px] leading-relaxed uppercase tracking-[0.1em] text-dm-gray">
          Escolha o cenário e a loja mostra só o que resolve
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {situations.map((s, i) => {
          const t = toneMap[s.tone];
          return (
            <Reveal key={s.slug} i={i}>
              <article className="shop-cut group relative flex h-full flex-col overflow-hidden border border-dm-line bg-white">
                <span className={cn("absolute left-0 top-0 h-full w-1", t.bar)} />
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={s.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-dm-ink/45" />
                  <div className="absolute inset-0 shop-grid-dark opacity-70" />
                  <span className="shop-mono absolute bottom-3 left-5 text-[10px] font-bold tracking-[0.2em] text-white">
                    {s.code}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 pl-6">
                  <h3 className="font-display text-[20px] font-extrabold uppercase leading-tight text-dm-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-dm-gray">{s.text}</p>
                  <a
                    href={
                      s.slug === "parou"
                        ? "#compativel"
                        : s.slug === "safra"
                          ? "#kits"
                          : "#cotacao"
                    }
                    className={cn(
                      "mt-5 flex items-center justify-center gap-2 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors",
                      t.btn,
                    )}
                  >
                    {s.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- vitrine */

const tabs = [
  { key: "todos", label: "Todos" },
  { key: "Costura de sacaria", label: "Costura" },
  { key: "Correias e lonas", label: "Correias" },
  { key: "Peças de reposição", label: "Peças" },
  { key: "Consumíveis", label: "Consumíveis" },
];

function Vitrine({ onAdd }: { onAdd: () => void }) {
  const [tab, setTab] = useState("todos");
  const list = useMemo(
    () => (tab === "todos" ? bestSellers : bestSellers.filter((i) => i.brandLine === tab)),
    [tab],
  );

  return (
    <section id="vitrine" className="scroll-mt-32 border-y border-dm-line bg-dm-surface py-14 lg:py-16">
      <div className="dm-container">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-dm-line pb-4">
          <div>
            <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
              <span className="text-dm-red">03</span>
              Pronta entrega
            </p>
            <h2 className="mt-3 font-display text-[26px] font-extrabold uppercase leading-tight text-dm-ink md:text-[34px]">
              Fecha no site, sai do estoque
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "shop-mono border px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] transition-colors",
                  tab === t.key
                    ? "border-dm-ink bg-dm-ink text-white"
                    : "border-dm-line bg-white text-dm-gray hover:border-dm-blue hover:text-dm-blue",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <Rail label={`${list.length} itens · arraste para o lado`}>
            {list.map((item, i) => (
              <div key={item.slug} className="w-[268px] shrink-0 sm:w-[290px]">
                <SpecCard item={item} index={i} onAdd={onAdd} />
              </div>
            ))}
          </Rail>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- seletor de compatibilidade */

function Compat({ onAdd }: { onAdd: () => void }) {
  const [active, setActive] = useState(machineFits[0]?.slug ?? "");
  const machine = machineFits.find((m) => m.slug === active) ?? machineFits[0];
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (sku: string) =>
    setPicked((p) => (p.includes(sku) ? p.filter((s) => s !== sku) : [...p, sku]));

  const total = (machine?.parts ?? [])
    .filter((p) => picked.includes(p.sku))
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <section id="compativel" className="dm-container scroll-mt-32 py-14 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dm-line pb-4">
        <div>
          <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
            <span className="text-dm-red">04</span>
            Compatibilidade
          </p>
          <h2 className="mt-3 font-display text-[26px] font-extrabold uppercase leading-tight text-dm-ink md:text-[34px]">
            Ache a peça pela sua máquina
          </h2>
        </div>
        <p className="shop-mono max-w-xs text-[11px] leading-relaxed uppercase tracking-[0.1em] text-dm-gray">
          Selecione o equipamento e monte a lista
        </p>
      </div>

      {/* chips de máquina */}
      <div className="mt-7 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {machineFits.map((m) => (
          <button
            key={m.slug}
            type="button"
            onClick={() => {
              setActive(m.slug);
              setPicked([]);
            }}
            className={cn(
              "group flex items-center gap-3 border p-2 text-left transition-colors",
              active === m.slug
                ? "border-dm-blue bg-white shadow-[0_10px_26px_rgba(16,61,148,0.1)]"
                : "border-dm-line bg-white hover:border-dm-blue/50",
            )}
          >
            <span className="relative h-12 w-14 shrink-0 overflow-hidden bg-dm-surface">
              <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              {active === m.slug && <span className="absolute inset-0 bg-dm-blue/20" />}
            </span>
            <span className="min-w-0">
              <span className="shop-mono block text-[9.5px] font-bold tracking-[0.14em] text-dm-red">
                {m.sku}
              </span>
              <span className="block truncate text-[12.5px] font-bold text-dm-ink">{m.name}</span>
            </span>
          </button>
        ))}
      </div>

      {/* tabela de peças */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="border border-dm-line bg-white">
          <div className="shop-mono flex items-center gap-3 border-b border-dm-line bg-dm-surface px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-dm-gray">
            <span className="w-28">Código</span>
            <span className="flex-1">Item compatível</span>
            <span className="hidden w-28 sm:block">Estoque</span>
            <span className="w-20 text-right">Preço</span>
          </div>
          {(machine?.parts ?? []).map((p) => {
            const on = picked.includes(p.sku);
            return (
              <button
                key={p.sku}
                type="button"
                onClick={() => toggle(p.sku)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-dm-line px-4 py-3.5 text-left transition-colors last:border-0",
                  on ? "bg-dm-blue/[0.05]" : "hover:bg-dm-surface",
                )}
              >
                <span className="shop-mono flex w-28 items-center gap-2 whitespace-nowrap text-[11px] font-bold tracking-[0.1em] text-dm-ink">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center border",
                      on ? "border-dm-blue bg-dm-blue text-white" : "border-dm-line text-transparent",
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {p.sku}
                </span>
                <span className="flex-1 text-[13.5px] font-semibold text-dm-ink">{p.name}</span>
                <span className="hidden w-28 sm:block">
                  <StockLed stock={p.stock} />
                </span>
                <span className="w-20 text-right text-[13.5px] font-bold text-dm-ink">
                  {brl(p.price)}
                </span>
              </button>
            );
          })}
        </div>

        {/* resumo */}
        <aside className="border border-dm-line bg-dm-ink p-5 text-white">
          <p className="shop-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            <Ruler className="h-3.5 w-3.5 text-dm-red" />
            Lista de reposição
          </p>
          <p className="mt-4 shop-mono text-[10.5px] uppercase tracking-[0.14em] text-white/50">
            {machine?.name}
          </p>
          <p className="mt-2 font-display text-[32px] font-extrabold leading-none">
            {picked.length ? brl(total) : "R$ 0,00"}
          </p>
          <p className="shop-mono mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-white/45">
            {picked.length} {picked.length === 1 ? "item marcado" : "itens marcados"} · pix com 5%
          </p>

          <button
            type="button"
            disabled={!picked.length}
            onClick={onAdd}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors",
              picked.length
                ? "bg-dm-red text-white hover:bg-[#c21016]"
                : "cursor-not-allowed bg-white/10 text-white/35",
            )}
          >
            <Plus className="h-4 w-4" />
            Jogar no carrinho
          </button>

          <a
            href={waLink(
              `Olá! Tenho uma ${machine?.name ?? "máquina Demakine"} e quero confirmar as peças compatíveis.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 flex w-full items-center justify-center gap-2 bg-dm-green py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-dm-green-dark"
          >
            <MessageCircle className="h-4 w-4" />
            Confirmar com o técnico
          </a>

          <p className="shop-mono mt-4 text-[10px] leading-relaxed uppercase tracking-[0.1em] text-white/35">
            Na dúvida do modelo, manda a foto da placa da máquina no WhatsApp
          </p>
        </aside>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- kits */

const kits = [
  {
    code: "KT.01",
    name: "Kit Safra Sacaria",
    items: ["Costuradeira GK-26", "2 cones de linha 200g", "Cartela de agulhas"],
    price: 1449,
    save: 180,
    image: "/img/produtos/maquina-de-costurar-sacos-gk-26/1.webp",
  },
  {
    code: "KT.02",
    name: "Kit Manutenção de Esteira",
    items: ["Roletes de carga", "Raspador de correia", "Kit de emenda"],
    price: 890,
    save: 150,
    image: "/img/produtos/esteira-transportadora-horizontal/6.webp",
  },
  {
    code: "KT.03",
    name: "Kit Consumível do Mês",
    items: ["4 cones de linha", "Agulhas de reposição", "Óleo lubrificante"],
    price: 189,
    save: 40,
    image: "/img/produtos/linha-fio-para-costura-de-sacaria/1.webp",
  },
];

/* ------------------------------------------------- identificação por foto */

const idSteps = [
  { code: "F1", t: "Tire a foto", d: "Peça na mão, placa de identificação da máquina ou o conjunto montado." },
  { code: "F2", t: "Envie no formulário", d: "Até 3 fotos. A imagem vai direto para a nossa equipe técnica." },
  { code: "F3", t: "Receba a peça certa", d: "O técnico confirma o modelo e responde com a peça e o valor." },
];

function IdentifyPart() {
  return (
    <section
      id="identificar"
      className="relative scroll-mt-32 overflow-hidden border-y border-dm-line bg-white py-14 lg:py-16"
    >
      <div className="absolute inset-0 shop-grid opacity-60" />
      <div className="relative dm-container">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dm-line pb-4">
          <div>
            <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
              <span className="text-dm-red">05</span>
              Identificação por foto
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-[26px] font-extrabold uppercase leading-tight text-dm-ink md:text-[34px]">
              Não sabe o nome da peça? Manda a foto
            </h2>
          </div>
          <p className="shop-mono max-w-xs text-[11px] leading-relaxed uppercase tracking-[0.1em] text-dm-gray">
            Quem atende conhece a máquina por dentro
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="max-w-lg text-[15.5px] leading-relaxed text-dm-gray">
              Rolete, mancal, raspador, agulha de costura: muita peça não tem nome fácil e o código
              some com o tempo. Fotografe o que você tem em mãos e a nossa equipe identifica o item
              correto antes de você comprar errado.
            </p>

            <div className="mt-7 space-y-3">
              {idSteps.map((s, i) => (
                <Reveal key={s.code} i={i}>
                  <div className="flex gap-4 border border-dm-line bg-white p-4">
                    <span className="shop-mono flex h-9 w-9 shrink-0 items-center justify-center border border-dm-line text-[11px] font-bold text-dm-blue">
                      {s.code}
                    </span>
                    <div>
                      <p className="text-[15px] font-bold text-dm-ink">{s.t}</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-dm-gray">{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-3 border border-dm-line bg-dm-surface p-4">
              <Camera className="h-5 w-5 shrink-0 text-dm-blue" />
              <p className="text-[13.5px] leading-relaxed text-dm-gray">
                Pelo celular a câmera abre direto no botão de foto. A imagem é usada apenas para
                atender seu pedido.
              </p>
            </div>
          </div>

          <LeadForm
            source="loja-identificar-peca"
            product="Identificação de peça por foto"
            buttonLabel="Enviar para identificação"
            title="Enviar foto da peça"
            subtitle="Preencha o contato, anexe a foto e a equipe técnica responde com a peça correta."
            photos
            photoLabel="Foto da peça, do conjunto ou da placa da máquina"
            photoHint="Até 3 fotos, 10MB cada. JPG, PNG, WEBP ou HEIC."
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- kits */

function Kits({ onAdd }: { onAdd: () => void }) {
  return (
    <section
      id="kits"
      className="scroll-mt-32 border-y border-dm-line bg-dm-surface py-14 lg:py-16"
    >
      <div className="dm-container">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dm-line pb-4">
          <div>
            <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
              <span className="text-dm-red">06</span>
              Conjuntos fechados
            </p>
            <h2 className="mt-3 font-display text-[26px] font-extrabold uppercase leading-tight text-dm-ink md:text-[34px]">
              Kits que resolvem de uma vez
            </h2>
          </div>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {kits.map((k, i) => (
            <Reveal key={k.name} i={i}>
              <article className="flex h-full flex-col border border-dm-line bg-white">
                <div className="flex items-center justify-between border-b border-dm-line px-4 py-2">
                  <span className="shop-mono text-[10.5px] font-bold tracking-[0.14em] text-dm-ink">
                    {k.code}
                  </span>
                  <span className="shop-mono bg-dm-green-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#0f6b3f]">
                    economize {brl(k.save)}
                  </span>
                </div>
                <div className="flex flex-1 gap-4 p-4">
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-dm-surface">
                    <img src={k.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 shop-grid opacity-70 mix-blend-multiply" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="text-[15.5px] font-bold leading-snug text-dm-ink">{k.name}</h3>
                    <ul className="mt-2.5 space-y-1.5">
                      {k.items.map((it) => (
                        <li
                          key={it}
                          className="flex items-start gap-2 text-[12.5px] leading-snug text-dm-gray"
                        >
                          <Plus className="mt-0.5 h-3 w-3 shrink-0 text-dm-blue" />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-auto pt-3 font-display text-[21px] font-extrabold leading-none text-dm-ink">
                      {brl(k.price)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex items-center justify-center gap-2 bg-dm-red py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#c21016]"
                >
                  <Plus className="h-4 w-4" />
                  Comprar o kit
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- cotação */

function QuoteBand() {
  return (
    <section
      id="cotacao"
      className="relative scroll-mt-32 overflow-hidden bg-dm-blue-deep py-14 text-white lg:py-16"
    >
      <div className="absolute inset-0 shop-grid-dark opacity-70" />
      <div className="relative dm-container">
        <div className="grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/45">
              <span className="text-dm-red">07</span>
              Projeto e ticket alto
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-[26px] font-extrabold uppercase leading-tight md:text-[34px]">
              Equipamento sob medida não tem preço de prateleira
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">
              Esteira, rosca e elevador são dimensionados pela engenharia da fábrica a partir da sua
              capacidade, altura e produto. A cotação sai com desenho e prazo.
            </p>
          </div>
          <a
            href={waLink("Olá! Quero uma cotação de equipamento sob medida.")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-dm-green px-7 py-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-dm-green-dark"
          >
            <MessageCircle className="h-4 w-4" />
            Pedir dimensionamento
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quoteItems.map((item, i) => (
            <Reveal key={item.slug} i={i}>
              <article className="group flex h-full flex-col border border-white/12 bg-white/[0.04]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 shop-grid-dark opacity-70" />
                  <span className="shop-mono absolute left-0 top-3 bg-dm-ink/85 px-2.5 py-1 text-[9.5px] font-bold tracking-[0.14em] text-white">
                    {item.sku}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="shop-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                    {item.brandLine}
                  </p>
                  <h3 className="mt-2 text-[14.5px] font-bold leading-snug">{item.name}</h3>
                  <a
                    href={waLink(`Olá! Quero cotar: ${item.name} (${item.sku}).`)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto flex items-center gap-2 pt-4 text-[11.5px] font-bold uppercase tracking-[0.12em] text-dm-green transition-colors hover:text-white"
                  >
                    Pedir cotação
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-x-10 md:grid-cols-2">
          <DataLine code="B1" label="Dimensionamento" value="Engenharia própria" tone="light" />
          <DataLine code="B2" label="Fabricação" value="Galpão em Limeira/SP" tone="light" />
          <DataLine code="B3" label="Instalação" value="Equipe de campo" tone="light" />
          <DataLine code="B4" label="Pós-venda" value="Peça de reposição na loja" tone="light" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- confiança */

const perks = [
  { icon: Package, code: "P1", t: "Estoque real", d: "Item marcado como pronta entrega despacha em 24h." },
  { icon: Truck, code: "P2", t: "Envio nacional", d: "Transportadora ou retirada na fábrica, em Limeira/SP." },
  { icon: Receipt, code: "P3", t: "Nota fiscal", d: "Emissão em todo pedido, com boleto liberado para CNPJ." },
  { icon: CreditCard, code: "P4", t: "Pix e 12x", d: "5% de desconto no pix e cartão em até 12x sem juros." },
  { icon: Wrench, code: "P5", t: "Suporte técnico", d: "Quem atende conhece a máquina, não é call center." },
  { icon: ShieldCheck, code: "P6", t: "Peça original", d: "Componentes usados na própria linha de fabricação." },
];

function Trust() {
  const picked = testimonials.slice(0, 3);

  return (
    <section className="dm-container py-14 lg:py-16">
      <div className="border-b border-dm-line pb-4">
        <p className="shop-mono flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.22em] text-dm-gray">
          <span className="text-dm-red">08</span>
          Condições e prova
        </p>
        <h2 className="mt-3 font-display text-[26px] font-extrabold uppercase leading-tight text-dm-ink md:text-[34px]">
          Como a loja funciona na prática
        </h2>
      </div>

      <div className="mt-8 grid gap-px border border-dm-line bg-dm-line sm:grid-cols-2 lg:grid-cols-3">
        {perks.map((p) => (
          <div key={p.code} className="flex gap-3.5 bg-white p-5">
            <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-dm-blue" />
            <div>
              <p className="shop-mono text-[9.5px] font-bold tracking-[0.18em] text-dm-red">
                {p.code}
              </p>
              <p className="mt-1 text-[14.5px] font-bold text-dm-ink">{p.t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dm-gray">{p.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {picked.map((t, i) => (
          <Reveal key={t.name} i={i}>
            <figure className="flex h-full flex-col border border-dm-line bg-white p-5">
              <BadgeCheck className="h-5 w-5 text-dm-green" />
              <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-dm-ink">
                {t.text}
              </blockquote>
              <figcaption className="shop-mono mt-4 border-t border-dm-line pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-dm-gray">
                {t.name} · {t.company}
                <span className="mt-1 block text-dm-blue">{t.city}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-6 border border-dm-line bg-dm-surface p-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="shop-mono text-[10px] font-bold uppercase tracking-[0.2em] text-dm-gray">
            Precisa da máquina completa?
          </p>
          <h3 className="mt-2 font-display text-[22px] font-extrabold uppercase leading-tight text-dm-ink">
            O catálogo técnico fica no site da fábrica
          </h3>
          <p className="mt-2.5 text-[14px] leading-relaxed text-dm-gray">
            Ficha técnica, aplicações, casos de projeto e calculadoras de dimensionamento seguem no
            institucional.
          </p>
        </div>
        <div>
          <TechLink href="/produtos" code="L1">
            Catálogo completo de máquinas
          </TechLink>
          <TechLink href="/ferramentas" code="L2">
            Calculadoras de esteira e ROI
          </TechLink>
          <TechLink href="/assistencia-tecnica" code="L3">
            Assistência técnica e manutenção
          </TechLink>
          <TechLink href="/projetos-especiais" code="L4">
            Projetos especiais sob medida
          </TechLink>
        </div>
      </div>

      <div className="shop-mono mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-dm-line pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-dm-gray">
        <span className="flex items-center gap-2 text-dm-ink">
          <FileText className="h-3.5 w-3.5 text-dm-blue" />
          Pagamento
        </span>
        <span>Pix</span>
        <span>Boleto CNPJ</span>
        <span>Cartão 12x</span>
        <span className="ml-auto flex items-center gap-2 text-dm-ink">
          <Link href="/contato" className="hover:text-dm-blue">
            {site.phone}
          </Link>
        </span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- page */

export default function Loja() {
  const [cart, setCart] = useState(0);
  const add = () => setCart((c) => c + 1);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Loja Técnica Demakine | Peças, correias e consumíveis direto da fábrica"
        description="Compre peça de reposição, correia, linha e equipamento de movimentação direto da fábrica Demakine, em Limeira/SP. Pix com desconto, cartão em 12x e boleto para CNPJ."
        path="/loja"
        noindex
      />

      <ShopTicker />
      <ShopHeader cart={cart} />

      <main>
        <Hero />
        <Situations />
        <Vitrine onAdd={add} />
        <Compat onAdd={add} />
        <IdentifyPart />
        <Kits onAdd={add} />
        <QuoteBand />
        <Trust />
      </main>

      <ShopFooter />

      <a
        href={waLink("Olá! Estou na loja técnica da Demakine.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-dm-green text-white shadow-[0_14px_34px_rgba(23,134,79,0.4)] transition-colors hover:bg-dm-green-dark"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
