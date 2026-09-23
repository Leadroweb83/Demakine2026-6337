import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Cog,
  Factory,
  Loader2,
  Mail,
  Search,
  Truck,
  Wrench,
} from "lucide-react";
import { categoryName, products, searchProducts } from "@/lib/content";
import { site } from "@/lib/site";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------- busca no rodapé */

export function FooterSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const q = query.trim();
  const results = q.length > 0 ? searchProducts(q) : products.slice(0, 8);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label className="eyebrow block text-white/45" htmlFor="footer-search">
        Buscar equipamento
      </label>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          id="footer-search"
          value={query}
          onFocus={(e) => {
            setOpen(true);
            setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 60);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={`Buscar entre as ${products.length} máquinas`}
          autoComplete="off"
          className="w-full rounded-full border border-white/15 bg-white/[0.06] py-3.5 pl-11 pr-4 text-[14.5px] text-white outline-none transition-colors placeholder:text-white/40 focus:border-dm-green/70 focus:bg-white/[0.09]"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-white/12 bg-[#08182f] shadow-2xl shadow-black/50">
          <p className="border-b border-white/10 px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-wider text-white/40">
            {q.length > 0 ? `${results.length} resultado(s)` : "Mais procurados"}
          </p>
          {results.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-[14px] text-white/65">
                Não achamos com esse termo. A gente fabrica sob medida, descreva a operação.
              </p>
              <Link
                href="/contato"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-white hover:underline"
              >
                Falar com a engenharia
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="max-h-[46vh] overflow-y-auto">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/produtos/${p.slug}`}
                    onClick={() => {
                      setQuery("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 border-b border-white/8 px-3 py-2.5 transition-colors last:border-0 hover:bg-white/[0.07]"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-11 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-white">
                        {p.name}
                      </span>
                      <span className="block truncate text-[12.5px] text-white/50">
                        {p.tag ?? categoryName(p.category)}
                      </span>
                    </span>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/30" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------- status de horário ao vivo */

/** 0 = domingo. Horário da fábrica em Limeira/SP. */
const HOURS: Record<number, { open: number; close: number } | null> = {
  0: null,
  1: { open: 7.5, close: 17.5 },
  2: { open: 7.5, close: 17.5 },
  3: { open: 7.5, close: 17.5 },
  4: { open: 7.5, close: 17.5 },
  5: { open: 7.5, close: 16.5 },
  6: null,
};

const DAY_LABEL = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function hhmm(decimal: number) {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}h${m === 0 ? "" : String(m).padStart(2, "0")}`;
}

/** Data e hora em America/Sao_Paulo, independente do fuso do visitante. */
function saoPauloNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = map[get("weekday")] ?? 1;
  const hour = Number(get("hour")) + Number(get("minute")) / 60;
  return { day, hour };
}

function status() {
  const { day, hour } = saoPauloNow();
  const today = HOURS[day];

  if (today && hour >= today.open && hour < today.close) {
    return { open: true, text: `Aberto agora · fecha às ${hhmm(today.close)}` };
  }

  if (today && hour < today.open) {
    return { open: false, text: `Fechado · abrimos hoje às ${hhmm(today.open)}` };
  }

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = HOURS[d];
    if (next) {
      const when = i === 1 ? "amanhã" : DAY_LABEL[d];
      return { open: false, text: `Fechado · abrimos ${when} às ${hhmm(next.open)}` };
    }
  }

  return { open: false, text: "Fechado" };
}

export function OpenStatus({ className }: { className?: string }) {
  const [state, setState] = useState(status);

  useEffect(() => {
    const id = setInterval(() => setState(status()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-bold",
          state.open
            ? "bg-dm-green/18 text-[#5fe0a5]"
            : "bg-white/[0.07] text-white/60",
        )}
      >
        <span className="relative flex h-2 w-2">
          {state.open && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5fe0a5] opacity-70" />
          )}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              state.open ? "bg-[#5fe0a5]" : "bg-white/40",
            )}
          />
        </span>
        {state.text}
      </span>
      <span className="flex items-center gap-1.5 text-[12.5px] text-white/40">
        <Clock className="h-3.5 w-3.5" />
        Seg a Qui 07h30 às 17h30 · Sex 07h30 às 16h30
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------- selos */

const badges = [
  { Icon: BadgeCheck, label: "+15 anos de mercado" },
  { Icon: Factory, label: "Fábrica própria" },
  { Icon: Truck, label: "Entrega nacional" },
  { Icon: Wrench, label: "Assistência técnica" },
  { Icon: Cog, label: "Peças de reposição" },
];

export function TrustRow() {
  return (
    <ul className="flex flex-wrap items-center gap-2.5">
      {badges.map(({ Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[12.5px] font-semibold text-white/75"
        >
          <Icon className="h-3.5 w-3.5 text-[#5fe0a5]" />
          {label}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------- newsletter */

export function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await api.newsletter.$post({ json: { email, source: "newsletter-rodape" } });
      if (!res.ok) throw new Error("falha");
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-dm-green/35 bg-dm-green/12 p-5">
        <p className="flex items-start gap-2 text-[15px] font-bold text-white">
          <Check className="mt-1 h-4 w-4 shrink-0 text-[#5fe0a5]" />
          Pronto, você está na lista.
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">
          No próximo envio você recebe uma aplicação real de máquina, com o problema, a solução e o
          que mudou na linha.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5">
      <p className="flex items-start gap-2 text-[15px] font-bold text-white">
        <Mail className="mt-1 h-4 w-4 shrink-0 text-white/60" />
        1 e-mail por mês com aplicação real de máquina
      </p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">
        Sem promoção e sem spam. Só o caso: a carga, o layout, o equipamento e o resultado na linha.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="seu@email.com.br"
          aria-label="Seu e-mail"
          className="w-full rounded-full border border-white/15 bg-[#08182f] px-4 py-3 text-[14.5px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-dm-green/70"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-dm-green px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark disabled:opacity-60"
        >
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Quero receber
        </button>
      </form>
      {state === "error" && (
        <p className="mt-2.5 text-[13px] text-[#ff9a9f]">
          Não conseguimos cadastrar agora. Tente novamente ou fale com a gente pelo WhatsApp.
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------- bloco institucional (SEO local) */

export function LocalBusinessBlock({ cnpj }: { cnpj?: string }) {
  return (
    <div
      itemScope
      itemType="https://schema.org/LocalBusiness"
      className="grid gap-x-8 gap-y-3 text-[13px] leading-relaxed text-white/45 md:grid-cols-3"
    >
      <meta itemProp="image" content={`${site.url}/img/site/logo-blue.png`} />
      <meta itemProp="priceRange" content="$$" />
      <link itemProp="url" href={site.url} />

      <p>
        <span className="block text-[11.5px] font-bold uppercase tracking-wider text-white/35">
          Razão social
        </span>
        <span itemProp="legalName" className="text-white/65">
          {site.legal}
        </span>
        <span className="hidden" itemProp="name">
          {site.name}
        </span>
        {cnpj && (
          <span className="mt-1 block" itemProp="taxID">
            CNPJ {cnpj}
          </span>
        )}
      </p>

      <p itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
        <span className="block text-[11.5px] font-bold uppercase tracking-wider text-white/35">
          Endereço da fábrica
        </span>
        <span itemProp="streetAddress" className="text-white/65">
          Rua Silvino del Pietro, 212 · Jd. Nova Limeira
        </span>
        <span className="mt-0.5 block">
          <span itemProp="addressLocality">Limeira</span> ·{" "}
          <span itemProp="addressRegion">SP</span> ·{" "}
          <span itemProp="postalCode">13486-258</span>
        </span>
        <meta itemProp="addressCountry" content="BR" />
        <a
          href={site.mapsUrl}
          target="_blank"
          rel="noreferrer"
          itemProp="hasMap"
          className="mt-1 inline-block font-semibold text-white/70 hover:text-white hover:underline"
        >
          Ver no Google Maps
        </a>
      </p>

      <p>
        <span className="block text-[11.5px] font-bold uppercase tracking-wider text-white/35">
          Atendimento
        </span>
        <a href={site.phoneHref} itemProp="telephone" className="text-white/65 hover:text-white">
          {site.phone}
        </a>
        <span className="mt-0.5 block">
          <a href={`mailto:${site.email}`} itemProp="email" className="hover:text-white">
            {site.email}
          </a>
        </span>
        <meta itemProp="openingHours" content="Mo-Th 07:30-17:30" />
        <meta itemProp="openingHours" content="Fr 07:30-16:30" />
        <span className="mt-0.5 block">Seg a Qui 07h30 às 17h30 · Sex 07h30 às 16h30</span>
      </p>
    </div>
  );
}

/* -------------------------------------------------- assinatura DEMAKINE na base */

export function BrandWordmark() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const progress = 1 - Math.min(Math.max(rect.top / window.innerHeight, 0), 1);
        setShift(progress);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="dm-wordmark" aria-hidden="true">
      <span
        className="dm-wordmark-text"
        style={{
          transform: `translate3d(${(shift - 0.5) * 3}%, ${(1 - shift) * 14}px, 0)`,
          opacity: 0.1 + shift * 0.16,
        }}
      >
        DEMAKINE
      </span>
    </div>
  );
}
