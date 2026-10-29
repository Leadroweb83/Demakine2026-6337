import { createHash } from "node:crypto";
import { and, gte, isNull, lt, notLike, or } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { classifySource, hostOf } from "../../web/lib/traffic";

/**
 * Medição própria de visitas: sem cookie e sem guardar IP. O visitante do dia é um hash de
 * IP + navegador com uma chave que muda a cada dia, então dá para contar pessoas diferentes no dia
 * sem conseguir seguir ninguém de um dia para o outro. Robôs e o painel ficam de fora.
 */
const BOT = /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|vercel|pingdom|uptime|monitor/i;
const SALT = process.env.VISITS_SALT ?? process.env.BETTER_AUTH_SECRET ?? "demakine-visitas";
const OWN_HOST = "demakine.com.br";
/** visitas mais antigas que isso somem na rotina diária */
export const VISITS_KEEP_DAYS = 400;

const clip = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const spDay = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);

function deviceOf(ua: string, width?: number) {
  if (/ipad|tablet/i.test(ua) || (width && width >= 600 && width < 1024 && /android/i.test(ua))) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "celular";
  return "computador";
}

function header(h: Headers, name: string) {
  const v = h.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

type ViewBody = {
  path?: unknown;
  entry?: unknown;
  referrer?: unknown;
  utm?: { source?: unknown; medium?: unknown; campaign?: unknown } | null;
  gclid?: unknown;
  fbclid?: unknown;
  w?: unknown;
};

/** Grava uma página vista. Devolve false quando a visita não conta (robô, painel, lixo). */
export async function recordPageView(headers: Headers, body: ViewBody) {
  const ua = headers.get("user-agent") ?? "";
  const path = clip(body.path, 300);
  if (!ua || BOT.test(ua) || !path || !path.startsWith("/") || path.startsWith("/admin")) return false;
  const ip = (headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "").split(",")[0]!.trim();
  const visitor = createHash("sha256").update(`${SALT}|${spDay()}|${ip}|${ua}`).digest("hex").slice(0, 16);
  const utm = body.utm ?? {};
  const referrer = clip(body.referrer, 500);
  const site = (headers.get("x-forwarded-host") ?? headers.get("host") ?? OWN_HOST).split(":")[0]!.replace(/^www\./, "");
  const source = classifySource({
    referrer,
    utmSource: clip(utm.source, 60),
    utmMedium: clip(utm.medium, 60),
    gclid: body.gclid === true,
    fbclid: body.fbclid === true,
    // o próprio endereço (domínio definitivo ou o de teste) não é origem
    ownHost: site,
  });
  const refHost = hostOf(referrer);
  await db.insert(schema.pageViews).values({
    path,
    visitor,
    source: body.entry === true ? source : "interno",
    referrerHost: refHost && refHost !== site && !refHost.endsWith(OWN_HOST) ? refHost.slice(0, 120) : null,
    utmSource: clip(utm.source, 60),
    utmMedium: clip(utm.medium, 60),
    utmCampaign: clip(utm.campaign, 120),
    device: deviceOf(ua, typeof body.w === "number" ? body.w : undefined),
    country: clip(headers.get("x-vercel-ip-country"), 2),
    region: clip(header(headers, "x-vercel-ip-country-region"), 10),
    city: clip(header(headers, "x-vercel-ip-city"), 80),
    entry: body.entry === true,
  });
  return true;
}

export async function purgeOldVisits() {
  const limit = new Date(Date.now() - VISITS_KEEP_DAYS * 864e5);
  const rows = await db.delete(schema.pageViews).where(lt(schema.pageViews.createdAt, limit)).returning({ id: schema.pageViews.id });
  return rows.length;
}

type Count = { label: string; total: number };
const top = (m: Map<string, number>, n: number): Count[] =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, total]) => ({ label, total }));
const inc = (m: Map<string, number>, k: string | null | undefined, by = 1) => {
  if (!k) return;
  m.set(k, (m.get(k) ?? 0) + by);
};

/** Resumo para a tela Visitas do painel: período atual e o anterior, do mesmo tamanho. */
export async function visitsSummary(days: number) {
  const now = Date.now();
  const start = new Date(now - days * 864e5);
  const prevStart = new Date(now - 2 * days * 864e5);
  const rows = await db
    .select({
      path: schema.pageViews.path,
      visitor: schema.pageViews.visitor,
      source: schema.pageViews.source,
      utmCampaign: schema.pageViews.utmCampaign,
      device: schema.pageViews.device,
      country: schema.pageViews.country,
      region: schema.pageViews.region,
      city: schema.pageViews.city,
      entry: schema.pageViews.entry,
      createdAt: schema.pageViews.createdAt,
    })
    .from(schema.pageViews)
    .where(gte(schema.pageViews.createdAt, prevStart));
  const leadRows = await db
    .select({
      source: schema.leads.trafficSource,
      landing: schema.leads.landingPath,
      campaign: schema.leads.utmCampaign,
      createdAt: schema.leads.createdAt,
    })
    .from(schema.leads)
    // inscrição na newsletter do rodapé também vira linha em leads, mas não é pedido de orçamento
    .where(
      and(
        isNull(schema.leads.deletedAt),
        gte(schema.leads.createdAt, prevStart),
        or(isNull(schema.leads.source), notLike(schema.leads.source, "newsletter%")),
      ),
    );

  const cur = rows.filter((r) => r.createdAt >= start);
  const prev = rows.filter((r) => r.createdAt < start);
  const leadsCur = leadRows.filter((r) => r.createdAt >= start);
  const leadsPrev = leadRows.filter((r) => r.createdAt < start);

  // visitante único = hash do dia; somar os dias é como a medição sem cookie conta pessoas
  const uniques = (list: typeof rows) => new Set(list.map((r) => `${spDay(r.createdAt)}|${r.visitor}`)).size;
  const visits = (list: typeof rows) => list.filter((r) => r.entry).length;

  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = days - 1; i >= 0; i--) byDay.set(spDay(new Date(now - i * 864e5)), { views: 0, visitors: new Set() });
  for (const r of cur) {
    const d = byDay.get(spDay(r.createdAt));
    if (!d) continue;
    d.views++;
    d.visitors.add(r.visitor);
  }

  const pages = new Map<string, number>();
  const pageVisitors = new Map<string, Set<string>>();
  for (const r of cur) {
    inc(pages, r.path);
    if (!pageVisitors.has(r.path)) pageVisitors.set(r.path, new Set());
    pageVisitors.get(r.path)!.add(`${spDay(r.createdAt)}|${r.visitor}`);
  }
  const leadsByLanding = new Map<string, number>();
  for (const l of leadsCur) inc(leadsByLanding, l.landing);

  const entries = cur.filter((r) => r.entry);
  const sources = new Map<string, number>();
  const devices = new Map<string, number>();
  const states = new Map<string, number>();
  const cities = new Map<string, number>();
  const countries = new Map<string, number>();
  const campaigns = new Map<string, number>();
  for (const r of entries) {
    inc(sources, r.source);
    inc(devices, r.device);
    inc(campaigns, r.utmCampaign);
    if (r.country && r.country !== "BR") inc(countries, r.country);
    else if (r.country === "BR") {
      inc(states, r.region?.toUpperCase());
      if (r.city) inc(cities, `${r.city} · ${r.region ?? ""}`.replace(/ · $/, ""));
    }
  }
  const leadsBySource = new Map<string, number>();
  const leadsByCampaign = new Map<string, number>();
  for (const l of leadsCur) {
    inc(leadsBySource, l.source ?? "sem-origem");
    inc(leadsByCampaign, l.campaign);
  }

  const since = new Date(now - 30 * 60e3);
  const withPrev = (a: number, b: number) => ({ value: a, previous: b, delta: b > 0 ? Math.round(((a - b) / b) * 100) : null });

  return {
    days,
    generatedAt: new Date(now).toISOString(),
    live: new Set(rows.filter((r) => r.createdAt >= since).map((r) => r.visitor)).size,
    kpi: {
      visitors: withPrev(uniques(cur), uniques(prev)),
      visits: withPrev(visits(cur), visits(prev)),
      views: withPrev(cur.length, prev.length),
      leads: withPrev(leadsCur.length, leadsPrev.length),
      conversion: {
        value: visits(cur) ? Math.round((leadsCur.length / visits(cur)) * 1000) / 10 : null,
        previous: visits(prev) ? Math.round((leadsPrev.length / visits(prev)) * 1000) / 10 : null,
      },
    },
    byDay: [...byDay.entries()].map(([day, d]) => ({ day, views: d.views, visitors: d.visitors.size })),
    pages: top(pages, 12).map((p) => ({ ...p, visitors: pageVisitors.get(p.label)?.size ?? 0, leads: leadsByLanding.get(p.label) ?? 0 })),
    sources: top(sources, 12).map((s) => ({ ...s, leads: leadsBySource.get(s.label) ?? 0 })),
    leadsWithoutVisit: leadsBySource.get("sem-origem") ?? 0,
    devices: top(devices, 3),
    states: top(states, 27),
    stateUnknown: entries.filter((r) => r.country === "BR" && !r.region).length,
    cities: top(cities, 10),
    countries: top(countries, 8),
    campaigns: top(campaigns, 8).map((c) => ({ ...c, leads: leadsByCampaign.get(c.label) ?? 0 })),
  };
}
