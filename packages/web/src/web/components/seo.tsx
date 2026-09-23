import { useEffect } from "react";
import { site } from "@/lib/site";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function setMeta(attr: "name" | "property", key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
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

export function Seo({ title, description, path = "/", image, type = "website", jsonLd }: SeoProps) {
  useEffect(() => {
    const url = `${site.url}${path}`;
    const ogImage = `${site.url}${image ?? "/og-image.png"}`;

    document.title = title;
    setMeta("name", "description", description);
    setLink("canonical", url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
  }, [title, description, path, image, type]);

  useEffect(() => {
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
  logo: `${site.url}/img/site/logo-demakine.png`,
  email: site.email,
  telephone: "+55 19 3033-9397",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Silvino del Pietro, 212, Jd. Nova Limeira",
    addressLocality: "Limeira",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin, site.social.youtube],
};
