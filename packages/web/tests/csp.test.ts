import { describe, expect, test } from "bun:test";
import vercel from "../vercel.json";

/** Política de segurança (CSP) do site, lida do vercel.json, quebrada por diretiva. */
const csp = (() => {
  const rule = vercel.headers.find((h) => h.source === "/(.*)")!;
  const value = rule.headers.find((h) => h.key === "Content-Security-Policy")!.value;
  return new Map(value.split(";").map((d) => d.trim().split(/\s+/)).map(([name, ...hosts]) => [name!, hosts]));
})();
const allows = (directive: string, host: string) => csp.get(directive)!.includes(host);

/**
 * Guia do Google: https://developers.google.com/tag-platform/security/guides/csp
 * Sem estes endereços, o GA4 e as conversões do Google Ads são bloqueados pelo navegador e os dados se perdem.
 */
describe("CSP libera o que o Google Tag Manager, o GA4 e o Google Ads precisam", () => {
  test("GA4: analytics.google.com (sem subdomínio) e google-analytics.com conectam", () => {
    // o wildcard *.analytics.google.com não cobre analytics.google.com: *.google.com cobre
    expect(allows("connect-src", "https://*.google.com")).toBe(true);
    expect(allows("connect-src", "https://*.google-analytics.com")).toBe(true);
    expect(allows("connect-src", "https://*.analytics.google.com")).toBe(true);
    expect(allows("connect-src", "https://*.googletagmanager.com")).toBe(true);
  });
  test("Google Ads: conversões e remarketing (doubleclick, googleadservices, googlesyndication)", () => {
    for (const h of ["https://*.doubleclick.net", "https://www.googleadservices.com", "https://*.googlesyndication.com"]) {
      expect(allows("connect-src", h), h).toBe(true);
    }
    expect(allows("script-src", "https://www.googleadservices.com")).toBe(true);
  });
  test("Google Ads no Brasil usa google.com.br", () => {
    expect(allows("connect-src", "https://*.google.com.br")).toBe(true);
  });
  test("modo de visualização do Tag Manager: badge.css e Tag Assistant", () => {
    expect(allows("style-src", "https://www.googletagmanager.com")).toBe(true);
    expect(allows("style-src", "https://tagmanager.google.com")).toBe(true);
    expect(allows("script-src", "https://tagmanager.google.com")).toBe(true);
    expect(allows("font-src", "https://fonts.gstatic.com")).toBe(true);
    expect(allows("frame-src", "https://*.googletagmanager.com")).toBe(true);
  });
  test("o coletor da Mailbiz conecta", () => {
    expect(allows("connect-src", "https://collector.mailbiz.one")).toBe(true);
  });
  test("imagens do Google (pixels) passam", () => {
    expect(allows("img-src", "https:")).toBe(true);
  });
});

describe("as proteções importantes continuam", () => {
  test("nada de unsafe-eval, objetos, base e quadros de terceiros", () => {
    expect(csp.get("script-src")).not.toContain("'unsafe-eval'");
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("frame-ancestors")).toEqual(["'self'"]);
    expect(csp.get("form-action")).toEqual(["'self'"]);
    expect(csp.get("default-src")).toEqual(["'self'"]);
    expect(csp.has("upgrade-insecure-requests")).toBe(true);
  });
  test("o wildcard largo só vale para conexões e só do Google: nunca em script-src nem em default-src", () => {
    for (const d of ["script-src", "default-src", "style-src", "frame-src"]) {
      expect(csp.get(d)!.includes("https://*.google.com"), d).toBe(false);
      expect(csp.get(d)!.includes("*"), d).toBe(false);
    }
  });
  test("nenhuma diretiva tem host duplicado", () => {
    for (const [name, hosts] of csp) expect(new Set(hosts).size, name).toBe(hosts.length);
  });
});
