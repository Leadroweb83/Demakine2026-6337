"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav as ptNav } from "@/content/site";
import { dict, localeMeta, localeOf } from "@/content/i18n";
import { whatsappHref } from "@/lib/site";
import { Logo } from "./logo";
import { WhatsAppIcon } from "./icons";

export function Header() {
  const lang = localeOf(usePathname());
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
    <header
      data-header
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-500 [&.is-stuck]:border-copper/15 [&.is-stuck]:bg-ink/85 [&.is-stuck]:backdrop-blur-md"
    >
      <div className="wrap flex h-20 items-center justify-between gap-6">
        <Link href={home}>
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-[0.78rem] uppercase tracking-[0.18em] text-bone/75 transition-colors hover:text-copper-hi">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="max-lg:hidden">{langs}</span>
          <a href={whatsappHref(t?.contact.waMessage)} className="btn btn-ghost !min-h-11 !px-4 max-sm:!px-3" data-event="whatsapp_header">
            <WhatsAppIcon />
            <span className="max-sm:sr-only">WhatsApp</span>
          </a>
          <details className="relative lg:hidden">
            <summary aria-label="Menu" className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-copper/40">
              <span className="h-px w-5 bg-bone" />
              <span className="h-px w-5 bg-bone" />
            </summary>
            <nav aria-label="Menu" className="absolute right-0 top-14 w-64 border border-copper/20 bg-navy p-2 shadow-2xl shadow-black/50">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="block px-4 py-3 text-sm uppercase tracking-[0.16em] text-bone/85 hover:text-copper-hi">
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-copper/20 px-3 py-3">{langs}</div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
