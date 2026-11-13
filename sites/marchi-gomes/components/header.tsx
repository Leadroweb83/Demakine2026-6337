"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { areas, nav as allNav, site } from "@/content/site";
import { dict, localeMeta, localeOf } from "@/content/i18n";
import { whatsappHref } from "@/lib/site";
import { Logo } from "./logo";
import { WhatsAppIcon } from "./icons";

export function Header({ showArticles = true }: { showArticles?: boolean }) {
  const ptNav = showArticles ? allNav : allNav.filter((i) => i.href !== "/artigos");
  const pathname = usePathname();
  const lang = localeOf(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const t = lang ? dict[lang] : null;
  const home = lang ? `/${lang}` : "/";
  const nav = t
    ? [
        { href: `${home}#areas`, label: t.nav.areas },
        { href: `${home}#servicos`, label: t.nav.services },
        { href: `${home}#escritorio`, label: t.nav.firm },
        { href: `${home}#contato`, label: t.nav.contact },
      ]
    : ptNav;
  const current = lang ?? "pt";
  const langs = (
    <span role="group" className="flex items-center gap-1 text-[0.7rem] tracking-[0.14em]" aria-label="Idioma">
      {(Object.keys(localeMeta) as (keyof typeof localeMeta)[]).map((k) => (
        <a key={k} href={localeMeta[k].href} hrefLang={localeMeta[k].hreflang} aria-current={k === current ? "true" : undefined}
          className={`px-1.5 py-1 ${k === current ? "text-copper-hi" : "text-bone/55 hover:text-bone"}`}>{localeMeta[k].label}</a>
      ))}
    </span>
  );
  return (
    <>
    <header
      data-header
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-500 [&.is-stuck]:border-copper/15 [&.is-stuck]:bg-ink/85 [&.is-stuck]:backdrop-blur-md"
    >
      <div className="wrap flex h-20 items-center justify-between gap-6">
        <Link href={home}>
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-7 whitespace-nowrap xl:flex">
          {nav.filter((item) => !item.href.endsWith("#servicos")).map((item) => (
            <Link key={item.href} href={item.href} className="text-[0.78rem] uppercase tracking-[0.18em] text-bone/75 transition-colors hover:text-copper-hi">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="max-md:hidden">{langs}</span>
          <a href={whatsappHref(t?.contact.waMessage)} className="btn btn-ghost !min-h-11 !px-4 max-sm:!px-3" data-event="whatsapp_header">
            <WhatsAppIcon />
            <span className="max-sm:sr-only">WhatsApp</span>
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-completo"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-copper/40 transition-colors hover:border-copper-hi"
          >
            <span className={`h-px w-5 bg-bone transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-bone transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
    </header>

    {/* Menu em tela cheia. Fica fora do <header> para nao herdar o desfoque do cabecalho. */}
    <div id="menu-completo" data-lenis-prevent className={`menu-overlay fixed inset-0 z-[45] overflow-y-auto bg-navy ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="wrap grid min-h-full gap-12 pb-12 pt-32 lg:grid-cols-[1.5fr_1fr] lg:gap-24 lg:pt-40">
        <nav aria-label="Menu completo">
          <p className="eyebrow menu-item" style={{ "--i": 0 } as React.CSSProperties}>{t ? t.nav.areas : "Áreas de atuação"}</p>
          <ul className="mt-6">
            {t
              ? t.areas.list.map((a, i) => (
                  <li key={a} className="menu-item display py-1 text-[clamp(1.5rem,3.4vw,2.9rem)] text-bone/90" style={{ "--i": i + 1 } as React.CSSProperties}>{a}</li>
                ))
              : areas.map((a, i) => (
                  <li key={a.slug} className="menu-item" style={{ "--i": i + 1 } as React.CSSProperties}>
                    <Link href={`/areas/${a.slug}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="display group flex items-baseline gap-5 py-1 text-[clamp(1.5rem,3.4vw,2.9rem)] text-bone/90 transition-colors hover:text-copper-hi">
                      <span className="font-sans text-xs tracking-[0.2em] text-copper/70">{String(i + 1).padStart(2, "0")}</span>
                      <span className="transition-transform duration-700 ease-out-expo group-hover:translate-x-3">{a.title}</span>
                    </Link>
                  </li>
                ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-10 lg:pt-12">
          <ul>
            {(t ? nav : [...ptNav, { href: "/para-empresas", label: "Para empresas" }, { href: "/primeiro-atendimento", label: "Primeiro atendimento" }, { href: "/glossario", label: "Glossário" }]).map((item, i) => (
              <li key={item.href} className="menu-item border-b border-copper/15" style={{ "--i": i + 4 } as React.CSSProperties}>
                <Link href={item.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="block py-4 text-sm uppercase tracking-[0.2em] text-bone/85 hover:text-copper-hi">{item.label}</Link>
              </li>
            ))}
          </ul>
          <div className="menu-item" style={{ "--i": 12 } as React.CSSProperties}>
            <a href={whatsappHref(t?.contact.waMessage)} tabIndex={open ? 0 : -1} className="btn btn-primary" data-event="whatsapp_menu"><WhatsAppIcon /> WhatsApp</a>
            <address className="mt-8 space-y-1 text-sm not-italic text-bone/65">
              <p>{site.contact.phone}</p>
              <p>{site.contact.street}<br />{site.contact.city} - {site.contact.state}</p>
            </address>
            <div className="mt-6">{langs}</div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
