import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { nav, site } from "@/lib/site";
import { categories, products } from "@/lib/content";

const socials = [
  { href: site.social.instagram, label: "Instagram", Icon: FaInstagram },
  { href: site.social.facebook, label: "Facebook", Icon: FaFacebookF },
  { href: site.social.linkedin, label: "LinkedIn", Icon: FaLinkedinIn },
  { href: site.social.youtube, label: "YouTube", Icon: FaYoutube },
];

export function Footer() {
  const top = products.slice(0, 6);

  return (
    <footer className="bg-dm-blue-deep text-white">
      <div className="dm-container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
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
              {top.map((p) => (
                <li key={p.slug}>
                  <Link href={`/produtos/${p.slug}`} className="hover:text-white">
                    {p.name}
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
                <Link href="/downloads" className="hover:text-white">
                  Downloads
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
                <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {site.address}
                </a>
              </li>
            </ul>
            <p className="mt-5 text-[13px] text-white/45">
              Seg a Qui 07h30–17h30 · Sex 07h30–16h30
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[13px] text-white/45">
          {categories.map((c) => (
            <Link key={c.slug} href={`/produtos?cat=${c.slug}`} className="hover:text-white/80">
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 text-[13px] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legal}. Todos os direitos reservados.
          </p>
          <p>Limeira · São Paulo · Brasil</p>
        </div>
      </div>
    </footer>
  );
}
