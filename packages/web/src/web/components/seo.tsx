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

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.legal,
  alternateName: site.name,
  url: site.url,
  logo: `${site.url}/img/site/logo-demakine.webp`,
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
  sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin, site.social.youtube],
};
