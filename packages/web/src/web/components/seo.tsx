import { useEffect } from "react";
import { site } from "@/lib/site";
import { editedDoc } from "@/lib/runtime-content";
import { seoKey } from "@/lib/seo-pages";
import { ssrHead } from "@/lib/ssr-head";
import { shareImage } from "@/lib/images";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** página que não deve ir para o Google (404, loja ainda não lançada) */
  noindex?: boolean;
  /** versões em outros idiomas (hreflang), com endereço completo */
  alternates?: { hreflang: string; href: string }[];
  /** idioma do documento, quando não é pt-BR */
  lang?: string;
  /** imagem principal da página para pré-carregar no HTML (ex.: capa do vídeo da home) */
  preloadImage?: string;
};

type Meta = [attr: "name" | "property", key: string, content: string];

function setMeta(attr: "name" | "property", key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

/** Aviso "não indexar": liga nas páginas marcadas e sai nas demais (o site troca de página sem recarregar). */
function setRobots(noindex: boolean) {
  const tag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!noindex) return tag?.remove();
  if (tag) tag.setAttribute("content", "noindex, follow");
  else setMeta("name", "robots", "noindex, follow");
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/** Páginas-mãe que existem no site (a trilha só passa por elas). */
const PARENTS: Record<string, string> = {
  "/produtos": "Produtos",
  "/blog": "Blog",
  "/cases": "Aplicações e cases",
  "/vagas": "Vagas",
};

/** Trilha "Início > Produtos > Esteira Dalla" em BreadcrumbList, montada pelo endereço e pelo título. */
function breadcrumbJsonLd(path: string, title: string) {
  const clean = path.split("?")[0]!;
  if (clean === "/" || clean.startsWith("/export")) return null;
  const parent = "/" + clean.split("/")[1];
  const items = [{ name: "Início", url: `${site.url}/` }];
  if (parent !== clean && PARENTS[parent]) items.push({ name: PARENTS[parent], url: `${site.url}${parent}` });
  items.push({ name: title.split(" | ")[0]!.trim(), url: `${site.url}${clean}` });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

/** Dados estruturados e hreflang vindos da pré-renderização: o primeiro Seo no navegador assume o lugar deles. */
function dropPrerendered(selector: string) {
  document.head.querySelectorAll(`${selector}[data-ssr]`).forEach((el) => el.remove());
}

export function Seo({
  title: baseTitle,
  description: baseDescription,
  path = "/",
  image,
  type = "website",
  jsonLd,
  noindex = false,
  alternates,
  lang,
  preloadImage,
}: SeoProps) {
  // título e descrição editados no painel (SEO das páginas fixas) valem sobre o padrão da página
  const edited = editedDoc<{ title?: string; description?: string }>("seo", seoKey(path));
  const title = edited?.title?.trim() || baseTitle;
  const description = edited?.description?.trim() || baseDescription;
  const url = `${site.url}${path}`;
  // compartilhamento usa o JPG/PNG original: LinkedIn e outros não mostram WebP
  const ogImage = /^https?:\/\//.test(image ?? "") ? image! : `${site.url}${shareImage(image ?? "/og-image.jpg")}`;
  const meta: Meta[] = [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", url],
    ["property", "og:type", type],
    ["property", "og:image", ogImage],
    ["property", "og:locale", (lang ?? "pt-BR").replace("-", "_")],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", ogImage],
  ];

  // pré-renderização: registra o cabeçalho da página para o HTML gerado no build
  const head = ssrHead();
  if (head) {
    head.title = title;
    for (const [attr, key, content] of meta) head.meta.set(key, { attr, content });
    if (noindex) {
      head.meta.set("robots", { attr: "name", content: "noindex, follow" });
      head.canonical = undefined;
    } else {
      head.meta.delete("robots");
      head.canonical = url;
    }
    if (alternates) head.alternates = alternates;
    if (lang) head.htmlLang = lang;
    if (preloadImage) head.preloadImage = preloadImage;
    if (jsonLd) head.jsonLd.push(jsonLd);
    const crumbs = noindex ? null : breadcrumbJsonLd(path, title);
    if (crumbs) head.jsonLd.push(crumbs);
  }

  useEffect(() => {
    document.title = title;
    for (const [attr, key, content] of meta) setMeta(attr, key, content);
    setRobots(noindex);
    // página fora do Google não aponta canonical (um 404 não pode herdar o endereço da página anterior)
    if (noindex) document.head.querySelector('link[rel="canonical"]')?.remove();
    else setLink("canonical", url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, url, ogImage, type, noindex, lang]);

  const alternatesKey = JSON.stringify(alternates ?? []);
  useEffect(() => {
    dropPrerendered('link[rel="alternate"]');
    document.documentElement.lang = lang ?? "pt-BR";
    const list = JSON.parse(alternatesKey) as { hreflang: string; href: string }[];
    const made = list.map(({ hreflang, href }) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => {
      made.forEach((l) => l.remove());
      document.documentElement.lang = "pt-BR";
    };
  }, [alternatesKey, lang]);

  const crumbsKey = noindex ? "" : JSON.stringify(breadcrumbJsonLd(path, title) ?? "");
  useEffect(() => {
    if (!crumbsKey || crumbsKey === '""') return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = crumbsKey;
    document.head.appendChild(script);
    return () => script.remove();
  }, [crumbsKey]);

  useEffect(() => {
    dropPrerendered('script[type="application/ld+json"]');
    if (!jsonLd) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLd]);

  return null;
}

/** "07h30 às 17h30" -> ["07:30", "17:30"] (horário de Dados do site) */
function hoursRange(text: string) {
  const m = text.match(/(\d{1,2})h(\d{2})?\D+(\d{1,2})h(\d{2})?/);
  if (!m) return null;
  const hhmm = (h: string, min?: string) => `${h.padStart(2, "0")}:${min ?? "00"}`;
  return [hhmm(m[1]!, m[2]), hhmm(m[3]!, m[4])] as const;
}

const monThu = hoursRange(site.hours.monThu);
const fri = hoursRange(site.hours.fri);

/**
 * A empresa: organização e negócio local (fábrica em Limeira), com endereço, telefone e horário.
 * Vai na home; é o que o Google usa para o painel da empresa e para a busca local.
 */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${site.url}/#empresa`,
  name: site.legal,
  alternateName: site.name,
  url: site.url,
  logo: `${site.url}/img/site/logo-demakine.png`,
  image: `${site.url}/og-image.jpg`,
  email: site.email,
  telephone: `+55 ${site.phone.replace(/\D/g, "").replace(/^(\d{2})(\d{4,5})(\d{4})$/, "$1 $2-$3")}`,
  address: {
    "@type": "PostalAddress",
    // endereço de Dados do site: "Rua X, 212, Bairro, Cidade/UF"
    streetAddress: site.address.split(",").slice(0, -1).join(",").trim() || site.address,
    addressLocality: (site.address.split(",").pop() ?? "").split("/")[0]!.trim() || "Limeira",
    addressRegion: (site.address.split("/").pop() ?? "SP").trim().slice(0, 2).toUpperCase(),
    addressCountry: "BR",
  },
  areaServed: { "@type": "Country", name: "Brasil" },
  openingHoursSpecification: [
    monThu && { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: monThu[0], closes: monThu[1] },
    fri && { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: fri[0], closes: fri[1] },
  ].filter(Boolean),
  sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin, site.social.youtube].filter(Boolean),
};

/** O site em si (nome que o Google mostra acima do resultado). */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#site`,
  name: site.name,
  url: site.url,
  inLanguage: "pt-BR",
  publisher: { "@id": `${site.url}/#empresa` },
};
