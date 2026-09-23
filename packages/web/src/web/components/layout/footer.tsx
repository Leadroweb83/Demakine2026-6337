import { Link } from "wouter";
import { ArrowRight, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { nav, site, waLink } from "@/lib/site";
import { segmentLps } from "@/lib/segmentos-lp";
import { categories, getProduct } from "@/lib/content";
import {
  BrandWordmark,
  FooterSearch,
  LocalBusinessBlock,
  NewsletterBox,
  OpenStatus,
  TrustRow,
} from "@/components/layout/footer-parts";
import { openCookiePrefs } from "@/components/cookie-consent";

const socials = [
  { href: site.social.instagram, label: "Instagram", Icon: FaInstagram },
  { href: site.social.facebook, label: "Facebook", Icon: FaFacebookF },
  { href: site.social.linkedin, label: "LinkedIn", Icon: FaLinkedinIn },
  { href: site.social.youtube, label: "YouTube", Icon: FaYoutube },
];

/** Lista escolhida pela Demakine; "Máquinas de costura" abre o catálogo filtrado. */
const FOOTER_EQUIPMENT: { slug?: string; label?: string; href?: string }[] = [
  { slug: "esteira-transportadora-para-sacaria" },
  { slug: "esteira-transportadora-para-granel" },
  { slug: "esteira-transportadora-horizontal" },
  { slug: "rosca-transportadora" },
  { slug: "elevador-de-canecas" },
  { slug: "elevador-de-sacaria" },
  { slug: "peneira-para-carvao" },
  { slug: "mini-sistema-de-costura" },
  { label: "Máquinas de Costura", href: "/produtos?cat=empacotamento-e-costura" },
];

export function Footer() {
  const top = FOOTER_EQUIPMENT.flatMap((item) => {
    if (item.href) return [{ key: item.href, label: item.label ?? "", href: item.href }];
    const p = item.slug ? getProduct(item.slug) : undefined;
    return p ? [{ key: p.slug, label: p.name, href: `/produtos/${p.slug}` }] : [];
  });

  return (
    <footer className="relative overflow-hidden bg-dm-blue-deep text-white">
      {/* faixa de decisão */}
      <div className="border-b border-white/10 bg-white/[0.04]">
        <div className="dm-container flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-[22px] font-extrabold leading-tight text-white md:text-[26px]">
              Tem uma carga para movimentar? A gente projeta.
            </p>
            <p className="mt-1.5 text-[15px] text-white/60">
              Fale com um especialista e receba o modelo indicado para a sua linha.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={waLink("Olá! Vim pelo site da Demakine e quero falar com um especialista.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-dm-green px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors hover:border-white/60"
            >
              Pedir orçamento
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="dm-container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div>
            <img
              src="/img/site/logo-white.png"
              alt="Demakine"
              className="h-9 w-auto object-contain"
            />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/65">
              Fabricamos esteiras transportadoras, roscas, elevadores e projetos especiais sob medida
              para a indústria e o agronegócio. Mais de 15 anos movimentando produção.
            </p>
            <div className="mt-6 flex gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="eyebrow text-white/45">Equipamentos</h3>
            <ul className="mt-5 space-y-2.5 text-[15px] text-white/70">
              {top.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/produtos" className="font-semibold text-white hover:underline">
                  Ver catálogo completo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-white/45">Institucional</h3>
            <ul className="mt-5 space-y-2.5 text-[15px] text-white/70">
              {nav.slice(1).map((item) => (
                <li key={item.to}>
                  <Link href={item.to} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cases" className="hover:text-white">
                  Aplicações e cases
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-white">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  Perguntas frequentes
                </Link>
              </li>
              <li>
                <Link href="/trabalhe-conosco" className="hover:text-white">
                  Trabalhe conosco
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-white/45">Segmentos</h3>
            <ul className="mt-5 space-y-2.5 text-[15px] text-white/70">
              {segmentLps.map((s) => (
                <li key={s.slug}>
                  <Link href={`/segmentos/${s.slug}`} className="hover:text-white">
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/agro" className="hover:text-white">
                  Agro e grãos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-white/45">Contato</h3>
            <ul className="mt-5 space-y-4 text-[15px] text-white/70">
              <li className="flex gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0 text-white/40" />
                <span>
                  <a href={site.phoneHref} className="block hover:text-white">
                    {site.phone}
                  </a>
                  <a href={site.mobileHref} className="block hover:text-white">
                    {site.mobile} · WhatsApp
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-white/40" />
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-white/40" />
                <span>
                  <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                    {site.address}
                  </a>
                  <a
                    href={site.mapsDirections}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 flex w-fit items-center gap-1.5 rounded-full bg-dm-green px-4 py-2 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Me leve até lá!
                  </a>
                </span>
              </li>
            </ul>
            <OpenStatus className="mt-5" />
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <TrustRow />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FooterSearch />
          <NewsletterBox />
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[13px] text-white/45">
          {categories.map((c) => (
            <Link key={c.slug} href={`/produtos?cat=${c.slug}`} className="hover:text-white/80">
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-7 border-t border-white/10 pt-7">
          <LocalBusinessBlock cnpj={site.cnpj} />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[13px] text-white/45">
          <Link href="/politica-de-privacidade" className="hover:text-white">
            Política de Privacidade
          </Link>
          <Link href="/termos-de-uso" className="hover:text-white">
            Termos de Uso
          </Link>
          <button
            type="button"
            onClick={openCookiePrefs}
            className="text-left hover:text-white"
          >
            Preferências de cookies
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2 text-[13px] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legal}. Todos os direitos reservados.
          </p>
          <p>Limeira · São Paulo · Brasil</p>
        </div>
      </div>

      <BrandWordmark />
      <div className="pb-20 lg:pb-0" />
    </footer>
  );
}
