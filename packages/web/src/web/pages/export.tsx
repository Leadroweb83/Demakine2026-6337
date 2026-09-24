/**
 * /export — landing única de exportação, em espanhol e inglês.
 * Fica fora do Shell em português: header e footer próprios, no idioma escolhido.
 * O idioma vem de ?lang=es|en (default es) e o toggle troca sem recarregar.
 */
import { useState } from "react";
import { useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Factory,
  Globe,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Seo, organizationJsonLd } from "@/components/seo";
import { LANGUAGE_ALTERNATES } from "@/lib/hreflang";
import { track } from "@/lib/tracking";
import { visitAttribution } from "@/lib/visits";
import { Reveal } from "@/components/reveal";
import { api } from "@/lib/api";
import { getProduct } from "@/lib/content";
import { exportCopy, type ExportLang } from "@/lib/export-lp";
import { site, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const waMsg: Record<ExportLang, string> = {
  es: "Hola! Quiero cotizar un equipo Demakine para exportación.",
  en: "Hello! I would like a quote for Demakine equipment for export.",
};

const formLabels: Record<ExportLang, Record<string, string>> = {
  es: {
    name: "Nombre*",
    company: "Empresa",
    phone: "Teléfono / WhatsApp*",
    email: "E-mail",
    country: "País de destino",
    message: "Material, capacidad por hora, largo y altura necesarios",
    required: "Complete nombre y teléfono.",
    fail: "No fue posible enviar. Escríbanos por WhatsApp.",
    okTitle: "Solicitud recibida",
    okText: "Un especialista de Demakine responde en hasta 1 día hábil.",
    okCta: "Hablar por WhatsApp ahora",
  },
  en: {
    name: "Name*",
    company: "Company",
    phone: "Phone / WhatsApp*",
    email: "E-mail",
    country: "Destination country",
    message: "Material, capacity per hour, required length and height",
    required: "Please fill in name and phone.",
    fail: "Could not send. Please reach us on WhatsApp.",
    okTitle: "Request received",
    okText: "A Demakine specialist replies within 1 business day.",
    okCta: "Talk on WhatsApp now",
  },
};

function ExportForm({ lang }: { lang: ExportLang }) {
  const t = formLabels[lang];
  const c = exportCopy[lang];
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const res = await api.leads.$post({
        json: { ...form, product: "Export inquiry", source: `export-${lang}`, traffic: visitAttribution() },
      });
      if (!res.ok) throw new Error("fail");
      return res.json();
    },
    onSuccess: () => track("generate_lead", { form_source: `export-${lang}`, product: "Export inquiry" }),
    onError: () => setError(t.fail),
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const input =
    "w-full rounded-xl border border-dm-line bg-white px-4 py-3 text-[15px] text-dm-ink outline-none transition-colors placeholder:text-dm-gray/70 focus:border-dm-blue";

  if (send.isSuccess) {
    return (
      <div className="rounded-2xl border border-dm-line bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dm-blue text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="h3 mt-4">{t.okTitle}</h3>
        <p className="mt-2 text-[15px] text-dm-gray">{t.okText}</p>
        <a
          href={waLink(waMsg[lang])}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-full bg-dm-green px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
        >
          {t.okCta}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!form.name.trim() || !form.phone.trim()) {
          setError(t.required);
          return;
        }
        send.mutate();
      }}
      className="rounded-2xl border border-dm-line bg-white p-6 shadow-sm md:p-8"
      lang={c.htmlLang}
    >
      <h3 className="h3">{c.formTitle}</h3>
      <p className="mt-2 text-[15px] text-dm-gray">{c.formSubtitle}</p>

      <div className="mt-6 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={form.name} onChange={set("name")} placeholder={t.name} aria-label={t.name} className={input} />
          <input required value={form.phone} onChange={set("phone")} placeholder={t.phone} aria-label={t.phone} inputMode="tel" className={input} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.company} onChange={set("company")} placeholder={t.company} aria-label={t.company} className={input} />
          <input value={form.city} onChange={set("city")} placeholder={t.country} aria-label={t.country} className={input} />
        </div>
        <input type="email" value={form.email} onChange={set("email")} placeholder={t.email} aria-label={t.email} className={input} />
        <textarea
          value={form.message}
          onChange={set("message")}
          rows={4}
          placeholder={t.message}
          aria-label={t.message}
          className={cn(input, "resize-none")}
        />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-dm-red">{error}</p>}

      <button
        type="submit"
        disabled={send.isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-dm-green px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_12px_30px_rgba(23,134,79,0.28)] transition-colors hover:bg-dm-green-dark disabled:opacity-60"
      >
        {send.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {send.isPending ? "..." : c.formButton}
      </button>
    </form>
  );
}

export default function ExportLanding() {
  // idioma pelo endereço (?lang=en); sem parâmetro, espanhol. useSearch funciona também na pré-renderização
  const search = useSearch();
  const initial: ExportLang = new URLSearchParams(search).get("lang") === "en" ? "en" : "es";
  const [lang, setLang] = useState<ExportLang>(initial);
  const c = exportCopy[lang];

  const switchLang = () => {
    const next: ExportLang = lang === "es" ? "en" : "es";
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={c.seoTitle}
        description={c.seoDescription}
        path={`/export?lang=${lang}`}
        alternates={LANGUAGE_ALTERNATES}
        jsonLd={organizationJsonLd}
        lang={c.htmlLang}
        image="/img/produtos/esteira-transportadora-para-granel/1.webp"
      />

      {/* header próprio */}
      <header className="sticky top-0 z-40 border-b border-dm-line bg-white/95 backdrop-blur">
        <div className="dm-container flex h-16 items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <img src="/img/site/logo-blue.webp" width={293} height={80} alt="Demakine" className="h-8 w-auto object-contain" />
          </a>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={switchLang}
              className="inline-flex items-center gap-2 rounded-full border border-dm-line px-3.5 py-2 text-[12.5px] font-bold text-dm-ink/75 transition-colors hover:border-dm-blue/45 hover:text-dm-blue"
            >
              <Globe className="h-3.5 w-3.5" />
              {c.switchTo}
            </button>
            <a
              href={waLink(waMsg[lang])}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full bg-dm-green px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark sm:inline-flex"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden bg-dm-blue-deep">
        <img
          src="/img/produtos/esteira-transportadora-para-granel/1.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 grid-lines" />
        <div className="dm-container relative grid gap-10 py-16 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow text-white/50">{c.eyebrow}</p>
            <h1 className="h1 mt-3 max-w-2xl text-white">{c.title}</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/70">{c.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#quote"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-dm-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c8121a]"
              >
                {c.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={waLink(waMsg[lang])}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-dm-green px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
              >
                <MessageCircle className="h-4 w-4" />
                {c.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur">
            <p className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wide text-white/55">
              <Factory className="h-4 w-4" />
              {c.factsTitle}
            </p>
            <dl className="mt-4 space-y-3 text-[14.5px]">
              {c.facts.map((f) => (
                <div key={f.label} className="border-b border-white/10 pb-3">
                  <dt className="text-white/50">{f.label}</dt>
                  <dd className="mt-0.5 font-bold text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* linhas */}
      <section className="bg-white py-16 md:py-20">
        <div className="dm-container">
          <h2 className="h2 max-w-2xl">{c.linesTitle}</h2>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">{c.linesText}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.lines.map((line, i) => {
              const product = getProduct(line.slug);
              return (
                <Reveal key={line.name} i={i % 3} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white">
                    {product && (
                      <div className="aspect-[4/3] overflow-hidden bg-dm-surface">
                        <img
                          src={product.images[0]}
                          alt={line.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[17px] font-bold leading-snug text-dm-ink">{line.name}</h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{line.text}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* como trabalhamos */}
      <section className="bg-dm-surface py-16 md:py-20">
        <div className="dm-container">
          <h2 className="h2 max-w-2xl">{c.howTitle}</h2>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">{c.howText}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {c.how.map((h, i) => (
              <Reveal key={h.step} i={i} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
                  <p className="text-[15.5px] font-bold text-dm-ink">{h.step}</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-dm-line bg-white p-6">
              <p className="text-[13px] font-bold uppercase tracking-wide text-dm-gray">
                {c.whyTitle}
              </p>
              <ul className="mt-4 space-y-3 text-[15px] text-dm-ink/85">
                {c.why.map((w) => (
                  <li key={w} className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dm-green" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 rounded-2xl border border-dm-line bg-white p-6">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-dm-blue" />
              <div>
                <p className="text-[13px] font-bold uppercase tracking-wide text-dm-gray">
                  {c.noteTitle}
                </p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{c.note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* formulário */}
      <section id="quote" className="scroll-mt-20 bg-white py-16 md:py-20">
        <div className="dm-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="h2">{c.contactTitle}</h2>
            <p className="mt-3 text-[16px] text-dm-gray">{c.contactText}</p>
            <ul className="mt-7 space-y-4 text-[15px] text-dm-ink/85">
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-dm-blue" />
                <span>
                  <a href={site.phoneHref} className="block hover:text-dm-blue">
                    +55 19 3033-9397
                  </a>
                  <a href={site.mobileHref} className="block hover:text-dm-blue">
                    +55 19 99884-2717 · WhatsApp
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-dm-blue" />
                <a href={`mailto:${site.email}`} className="hover:text-dm-blue">
                  {site.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dm-blue" />
                <span>
                  Rua Silvino del Pietro, 212, Jd. Nova Limeira
                  <br />
                  Limeira, São Paulo, Brasil
                </span>
              </li>
            </ul>
          </div>

          <ExportForm lang={lang} />
        </div>
      </section>

      {/* footer próprio */}
      <footer className="bg-dm-blue-deep py-10 text-white/60">
        <div className="dm-container flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-[15px] font-bold text-white">{site.legal}</p>
            <p className="mt-1 text-[13.5px]">Limeira, São Paulo, Brasil · {site.url}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13.5px]">
            <button type="button" onClick={switchLang} className="hover:text-white">
              {c.switchTo}
            </button>
            <a href="/" className="hover:text-white">
              Site em português
            </a>
            <a href="/politica-de-privacidade" className="hover:text-white">
              Privacy
            </a>
          </div>
        </div>
      </footer>

      <a
        href={waLink(waMsg[lang])}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-dm-green text-white shadow-[0_14px_34px_rgba(23,134,79,0.4)] transition-colors hover:bg-dm-green-dark"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
