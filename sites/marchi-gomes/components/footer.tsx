"use client";

import { usePathname } from "next/navigation";
import { dict, localeOf } from "@/content/i18n";
import Image from "next/image";
import Link from "next/link";
import { featuredAreas, nav as allNav, site } from "@/content/site";
import { Logo } from "./logo";

/**
 * Estatua da Justica em pe no canto direito: a base fica no fim da pagina e a
 * parte de cima invade a secao anterior. Decorativa (alt vazio), so de tablet para cima.
 */
function Statue() {
  return (
    <div aria-hidden="true" data-reveal className="pointer-events-none absolute bottom-0 right-[clamp(0.5rem,3.5vw,3.5rem)] z-20 hidden w-[var(--statue-w)] lg:block">
      {/* brilho quente atras e sombra de contato no chao: dao peso e realismo */}
      <div className="absolute inset-x-[-10%] bottom-[8%] top-[18%] bg-[radial-gradient(closest-side,rgb(201_160_120/0.16),transparent)]" />
      <div className="absolute inset-x-[22%] bottom-[-1.1rem] h-9 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.75),transparent)] blur-[6px]" />
      <Image
        src="/img/estatua-justica.webp"
        alt=""
        width={481}
        height={982}
        unoptimized
        className="relative h-auto w-full [filter:drop-shadow(0_26px_30px_rgb(0_0_0/0.55))_drop-shadow(-10px_0_30px_rgb(0_0_0/0.35))_contrast(1.04)_saturate(0.96)]"
      />
    </div>
  );
}

const statueVars = { "--statue-w": "min(380px, calc(240px + 12vw))" } as React.CSSProperties;

export function Footer({ showArticles = true }: { showArticles?: boolean }) {
  const nav = showArticles ? allNav : allNav.filter((i) => i.href !== "/artigos");
  const c = site.contact;
  const lang = localeOf(usePathname());
  if (lang) {
    const t = dict[lang];
    return (
      <footer className="relative border-t hairline bg-ink" style={statueVars}>
        <Statue />
        <div className="wrap flex flex-wrap items-end justify-between gap-10 py-16 lg:pr-[calc(var(--statue-w)*1.06)]! xl:pr-[calc(var(--statue-w)*0.92)]!">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs font-display text-2xl leading-tight text-bone/90">{t.footer.tagline}</p>
          </div>
          <address className="space-y-1 text-sm not-italic text-bone/70">
            <p>{c.street}<br />{c.city} - {c.state}, {c.zip}, Brasil</p>
            <p><a href={`tel:+${c.whatsapp}`}>+55 {c.phone}</a></p>
            <p><a href="/" hrefLang="pt-BR" className="text-copper">{t.footer.ptOnly} →</a></p>
          </address>
        </div>
        <div className="wrap border-t hairline py-6 text-xs text-mist lg:pr-[calc(var(--statue-w)*1.06)]! xl:pr-[calc(var(--statue-w)*0.92)]!">
          <p>© {new Date().getFullYear()} {site.name}. {t.footer.rights}</p>
        </div>
      </footer>
    );
  }
  return (
    <footer className="relative border-t hairline bg-ink" style={statueVars}>
      <Statue />
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] lg:pr-[calc(var(--statue-w)*1.06)]! xl:pr-[calc(var(--statue-w)*0.92)]!">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs font-display text-2xl leading-tight text-bone/90">{site.tagline}</p>
          <address className="mt-6 space-y-1 text-sm not-italic text-bone/70">
            {c.street && <p>{c.street}<br />{c.city} - {c.state}, {c.zip}</p>}
            {c.phone && <p><a href={`tel:+${c.whatsapp}`} className="hover:text-copper-hi">{c.phone}</a></p>}
            {c.email && <p><a href={`mailto:${c.email}`} className="hover:text-copper-hi">{c.email}</a></p>}
          </address>
        </div>
        <nav aria-label="Áreas de atuação">
          <p className="eyebrow mb-4">Áreas de atuação</p>
          <ul className="space-y-2 text-bone/75">
            {featuredAreas.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`} className="hover:text-copper-hi">{a.title}</Link>
              </li>
            ))}
            <li><Link href="/#areas" className="text-copper hover:text-copper-hi">Todas as áreas</Link></li>
          </ul>
        </nav>
        <nav aria-label="Rodapé">
          <p className="eyebrow mb-4">Escritório</p>
          <ul className="space-y-2 text-bone/75">
            {nav.slice(1).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-copper-hi">{n.label}</Link>
              </li>
            ))}
            <li><Link href="/para-empresas" className="hover:text-copper-hi">Para empresas</Link></li>
            <li><Link href="/primeiro-atendimento" className="hover:text-copper-hi">Primeiro atendimento</Link></li>
            <li><Link href="/glossario" className="hover:text-copper-hi">Glossário jurídico</Link></li>
            <li><Link href="/politica-de-privacidade" className="hover:text-copper-hi">Política de privacidade</Link></li>
          </ul>
        </nav>
      </div>
      <p style={{ textWrap: "nowrap" }} className="display overflow-hidden whitespace-nowrap pb-6 text-center text-[clamp(2.4rem,10.8vw,13rem)] uppercase leading-[0.85] text-copper/20" aria-hidden="true" data-reveal>
        Marchi Gomes
      </p>
      <div className="wrap flex flex-col gap-2 border-t hairline py-6 text-xs text-mist md:flex-row md:justify-between md:gap-10 lg:pr-[calc(var(--statue-w)*1.06)]! xl:pr-[calc(var(--statue-w)*0.92)]!">
        <p>
          © {new Date().getFullYear()} {site.name}.{c.oab ? ` ${c.oab}.` : ""}
        </p>
        <p>Conteúdo informativo, em conformidade com o Código de Ética e o Provimento 205/2021 da OAB.</p>
      </div>
    </footer>
  );
}
