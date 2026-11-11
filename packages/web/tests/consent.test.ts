import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { EU_REGIONS, adsDataAllowed, consentDefaults, looksLikeEurope, parseChoice, CONSENT_KEY } from "../src/web/lib/consent";
import en from "../src/web/i18n/en.json";
import es from "../src/web/i18n/es.json";
import { privacySections, legalUpdatedAt } from "../src/web/lib/legal";

describe("regra de consentimento (lib/consent.ts)", () => {
  test("sem escolha: negado na Europa (com wait_for_update) e liberado no resto, nessa ordem", () => {
    const [eu, rest] = consentDefaults(null);
    expect(eu!.region).toEqual([...EU_REGIONS]);
    expect(eu!.wait_for_update).toBe(500);
    for (const k of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"] as const) {
      expect(eu![k]).toBe("denied");
      expect(rest![k]).toBe("granted");
    }
    expect(rest!.region).toBeUndefined();
    expect(consentDefaults(null)).toHaveLength(2);
  });
  test("a lista de países da Europa tem os 27 da UE, mais Islândia, Liechtenstein, Noruega, Reino Unido e Suíça", () => {
    expect(EU_REGIONS).toHaveLength(32);
    for (const c of ["DE", "FR", "ES", "PT", "IT", "NL", "IE", "GB", "CH", "NO", "IS", "LI"]) expect(EU_REGIONS).toContain(c as never);
    expect(EU_REGIONS).not.toContain("BR" as never);
    expect(new Set(EU_REGIONS).size).toBe(EU_REGIONS.length);
  });
  test("Só os essenciais nega em qualquer país, e Aceitar todos libera em qualquer país", () => {
    expect(consentDefaults("essential")).toEqual([{ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 }]);
    expect(consentDefaults("all")).toEqual([{ ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }]);
  });
  test("dados de contato para as conversões: nunca de quem recusou; sempre de quem aceitou; de quem não escolheu, só fora da Europa", () => {
    expect(adsDataAllowed("essential", false)).toBe(false);
    expect(adsDataAllowed("essential", true)).toBe(false);
    expect(adsDataAllowed("all", true)).toBe(true);
    expect(adsDataAllowed(null, false)).toBe(true);
    expect(adsDataAllowed(null, true)).toBe(false);
  });
  test("looksLikeEurope pelo fuso do aparelho", () => {
    expect(looksLikeEurope("America/Sao_Paulo")).toBe(false);
    expect(looksLikeEurope("Europe/Lisbon")).toBe(true);
    expect(looksLikeEurope("Europe/Berlin")).toBe(true);
    expect(looksLikeEurope("Atlantic/Reykjavik")).toBe(true);
  });
  test("só 'all' e 'essential' valem como escolha", () => {
    expect(parseChoice("all")).toBe("all");
    expect(parseChoice("essential")).toBe("essential");
    for (const v of [null, undefined, "", "ALL", "true", "granted"]) expect(parseChoice(v as never)).toBeNull();
  });
  test("a chave nova (_v2) zera as recusas antigas", () => {
    expect(CONSENT_KEY).toBe("demakine_cookie_consent_v2");
  });
});

/** Navegador falso: o suficiente para o initGtm rodar e deixar à vista o que ele manda ao Google. */
function fakeBrowser(local: Record<string, string> = {}, session: Record<string, string> = {}, timeZone = "America/Sao_Paulo") {
  const mk = (data: Record<string, string>) => ({
    getItem: (k: string) => (k in data ? data[k]! : null),
    setItem: (k: string, v: string) => void (data[k] = String(v)),
    removeItem: (k: string) => void delete data[k],
  });
  const scripts: string[] = [];
  const win: Record<string, unknown> = { dataLayer: [], localStorage: mk(local), sessionStorage: mk(session), location: { pathname: "/" } };
  const doc = {
    createElement: () => ({ set src(v: string) { scripts.push(v); } }),
    head: { appendChild: () => {} },
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const g = globalThis as Record<string, unknown>;
  g.window = win;
  g.document = doc;
  g.location = win.location;
  g.MutationObserver = class { observe() {} disconnect() {} };
  const OriginalDTF = Intl.DateTimeFormat;
  Intl.DateTimeFormat = (() => ({ resolvedOptions: () => ({ timeZone }) })) as never;
  return { win, local, session, scripts, restore: () => { Intl.DateTimeFormat = OriginalDTF; for (const k of ["window", "document", "location", "MutationObserver"]) delete g[k]; } };
}
const commands = (win: Record<string, unknown>) =>
  (win.dataLayer as ArrayLike<unknown>[]).map((a) => Array.from(a)).filter((a) => a[0] === "consent") as [string, string, Record<string, unknown>][];

/** O gtm.ts guarda estado de módulo (tags já carregadas): cada teste importa uma cópia nova. */
let copy = 0;
const freshGtm = async () => (await import(`../src/web/lib/gtm.ts?copia=${++copy}`)) as typeof import("../src/web/lib/gtm");

describe("initGtm: o que vai ao Google antes de qualquer tag", () => {
  let b: ReturnType<typeof fakeBrowser>;
  afterEach(() => b?.restore());

  test("visitante novo no Brasil: dois defaults (Europa negado, resto liberado) e as tags carregam", async () => {
    b = fakeBrowser();
    const { initGtm } = await freshGtm();
    initGtm();
    const c = commands(b.win);
    expect(c.map((x) => x[1])).toEqual(["default", "default"]);
    expect(c[0]![2].region).toBeDefined();
    expect(c[0]![2].analytics_storage).toBe("denied");
    expect(c[1]![2].analytics_storage).toBe("granted");
    expect(c[1]![2].ad_user_data).toBe("granted");
    expect(b.scripts.some((s) => s.includes("googletagmanager.com/gtm.js"))).toBe(true);
    expect(b.scripts.some((s) => s.includes("gtag/js?id=G-"))).toBe(true);
  });
  test("o consentimento padrão vem antes de config e de qualquer tag", async () => {
    b = fakeBrowser();
    const { initGtm } = await freshGtm();
    initGtm();
    const order = (b.win.dataLayer as ArrayLike<unknown>[]).map((a) => String(Array.from(a)[0]));
    expect(order.indexOf("consent")).toBe(0);
    expect(order.lastIndexOf("consent")).toBeLessThan(order.indexOf("config"));
  });
  test("quem escolheu 'Só os essenciais' continua negado, em qualquer país", async () => {
    b = fakeBrowser({ demakine_cookie_consent_v2: "essential" });
    const { initGtm } = await freshGtm();
    initGtm();
    const c = commands(b.win);
    expect(c).toHaveLength(1);
    expect(c[0]![2].region).toBeUndefined();
    expect(c[0]![2].ad_storage).toBe("denied");
    expect(c[0]![2].analytics_storage).toBe("denied");
  });
  test("quem aceitou tudo fica liberado", async () => {
    b = fakeBrowser({ demakine_cookie_consent_v2: "all" });
    const { initGtm } = await freshGtm();
    initGtm();
    const c = commands(b.win);
    expect(c).toHaveLength(1);
    expect(c[0]![2].ad_user_data).toBe("granted");
  });
  test("a recusa da chave antiga (a do X) não vale mais e a chave antiga é apagada", async () => {
    b = fakeBrowser({ demakine_cookie_consent: "essential" });
    const { initGtm } = await freshGtm();
    initGtm();
    expect(commands(b.win)).toHaveLength(2); // volta ao padrão por país
    expect(b.local.demakine_cookie_consent).toBeUndefined();
  });
  test("escolha de outro valor ou lixo no armazenamento vale como sem escolha", async () => {
    b = fakeBrowser({ demakine_cookie_consent_v2: "talvez" });
    const { initGtm } = await freshGtm();
    initGtm();
    expect(commands(b.win)).toHaveLength(2);
  });
  test("o /admin não é medido", async () => {
    b = fakeBrowser();
    const { initGtm } = await freshGtm();
    (b.win.location as { pathname: string }).pathname = "/admin";
    initGtm();
    expect(b.scripts).toHaveLength(0);
  });
  test("updateConsent sempre avisa o Google, mesmo quando o padrão já era liberado (evita ficar negado por engano)", async () => {
    b = fakeBrowser();
    const { initGtm, updateConsent } = await freshGtm();
    initGtm();
    updateConsent("all");
    updateConsent("essential");
    const updates = commands(b.win).filter((x) => x[1] === "update");
    expect(updates).toHaveLength(2);
    expect(updates[0]![2].analytics_storage).toBe("granted");
    expect(updates[1]![2].analytics_storage).toBe("denied");
  });
});

describe("banner e política", () => {
  const banner = readFileSync("src/web/components/cookie-consent.tsx", "utf8");
  const policy = JSON.stringify(privacySections);
  test("o X só fecha: não grava escolha nem avisa o Google", () => {
    const x = banner.match(/onClick=\{(\w+)\}\s*aria-label="Fechar o aviso de cookies"/)!;
    expect(x[1]).toBe("close");
    const close = banner.match(/const close = \(\) => \{([\s\S]*?)\};/)![1]!;
    expect(close).toContain("dismissBanner()");
    expect(close).not.toMatch(/saveChoice|updateConsent|essential/);
  });
  test("só os dois botões gravam escolha", () => {
    expect(banner.match(/decide\("all"\)/g)).toHaveLength(1);
    expect(banner.match(/decide\("essential"\)/g)).toHaveLength(1);
    expect(banner.match(/saveChoice\(/g)).toHaveLength(1);
  });
  test("o banner não diz mais que os cookies 'só ligam se você aceitar'", () => {
    expect(banner).not.toMatch(/só ligam se você aceitar/);
    expect(banner).toContain("No Brasil eles ficam ligados por padrão");
    expect(banner).toContain("Só os essenciais");
  });
  test("a política não diz mais que os cookies só ligam com aceite, e explica Brasil, Europa e o X", () => {
    expect(policy).not.toMatch(/só são ativados depois que você aceita no banner\. Sem o aceite/);
    expect(policy).not.toMatch(/só com o seu aceite nos cookies/);
    expect(policy).toContain("ficam ligados por padrão");
    expect(policy).toContain("da Europa");
    expect(policy).toContain("Fechar o banner no X não conta como escolha");
    expect(legalUpdatedAt).toBe("11 de novembro de 2026");
  });
  test("os textos novos têm tradução em inglês e espanhol", () => {
    const texts = [
      "Fechar o aviso de cookies",
      "No Brasil eles ficam ligados por padrão",
      "Google, para medição de audiência e de campanhas, nos cookies de medição e anúncios, que você pode desativar a qualquer momento",
      "11 de novembro de 2026",
    ];
    for (const part of texts) {
      const key = Object.keys(en).find((k) => k.includes(part));
      expect(key, part).toBeDefined();
      expect((en as Record<string, string>)[key!]).toBeTruthy();
      expect((es as Record<string, string>)[key!]).toBeTruthy();
    }
    for (const dead of ["Fechar e manter apenas cookies essenciais", "2 de setembro de 2026"]) {
      expect(Object.keys(en)).not.toContain(dead);
    }
  });
});
