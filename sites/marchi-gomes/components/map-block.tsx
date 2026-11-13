"use client";

import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import { maps, office, site } from "@/content/site";
import { Arrow } from "./icons";

type Lang = "pt" | "en" | "es";

const text: Record<Lang, { how: string; ask: string; asking: string; youAre: string; km: string; m: string; straight: string; about: string; byCar: string; h: string; min: string; privacy: string; denied: string; unsupported: string; address: string }> = {
  pt: { how: "Como chegar", ask: "Calcular a distância até aqui", asking: "Buscando a sua localização…", youAre: "Você está a", km: "km", m: "m", straight: "em linha reta", about: "cerca de", byCar: "de carro", h: "h", min: "min", privacy: "Sua localização é usada só neste cálculo e não sai do seu aparelho.", denied: "Sem acesso à localização. Use o botão Como chegar para ver a rota.", unsupported: "Este aparelho não informa a localização. Use o botão Como chegar.", address: "Endereço" },
  en: { how: "Get directions", ask: "Calculate the distance to the office", asking: "Finding your location…", youAre: "You are", km: "km", m: "m", straight: "away in a straight line", about: "about", byCar: "by car", h: "h", min: "min", privacy: "Your location is used only for this calculation and never leaves your device.", denied: "Location access denied. Use Get directions to see the route.", unsupported: "This device does not share its location. Use Get directions.", address: "Address" },
  es: { how: "Cómo llegar", ask: "Calcular la distancia hasta aquí", asking: "Buscando su ubicación…", youAre: "Usted está a", km: "km", m: "m", straight: "en línea recta", about: "unos", byCar: "en coche", h: "h", min: "min", privacy: "Su ubicación se usa solo en este cálculo y no sale de su dispositivo.", denied: "Sin acceso a la ubicación. Use Cómo llegar para ver la ruta.", unsupported: "Este dispositivo no informa la ubicación. Use Cómo llegar.", address: "Dirección" },
};

/** Distancia em linha reta entre dois pontos (haversine), em km. */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** Numero que "gira": cada digito rola de 0 ate o valor, em colunas, e para em tempos diferentes. */
function Roller({ value }: { value: string }) {
  const [on, setOn] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <span role="img" aria-label={value} className="inline-flex tabular-nums">
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden="true" className="inline-block h-[1.12em] overflow-hidden align-bottom leading-[1.12]">
            <span
              className="block ease-[cubic-bezier(.16,1,.3,1)] transition-transform"
              style={{ transform: `translateY(-${on || still ? Number(ch) * 10 : 0}%)`, transitionDuration: still ? "0ms" : `${1500 + i * 320}ms` }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="block h-[1.12em]">{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">{ch}</span>
        ),
      )}
    </span>
  );
}

type Dist = { state: "idle" | "asking" | "denied" | "unsupported" } | { state: "done"; km: number };

function Distance({ lang }: { lang: Lang }) {
  const t = text[lang];
  const [d, setD] = useState<Dist>({ state: "idle" });

  function ask() {
    if (!("geolocation" in navigator)) return setD({ state: "unsupported" });
    setD({ state: "asking" });
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "cta_click", cta: "mapa_distancia" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setD({ state: "done", km: haversine(pos.coords.latitude, pos.coords.longitude, office.lat, office.lng) }),
      () => setD({ state: "denied" }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
    );
  }

  if (d.state === "done") {
    const sep = lang === "en" ? "." : ",";
    const dist = d.km < 1 ? { v: String(Math.max(10, Math.round((d.km * 1000) / 10) * 10)), u: t.m } : { v: (d.km < 10 ? d.km.toFixed(1) : String(Math.round(d.km))).replace(".", sep), u: t.km };
    // estimativa de carro: trajeto ~30% maior que a linha reta; velocidade media maior em trechos longos
    const speed = d.km < 8 ? 28 : d.km < 40 ? 48 : 72;
    const mins = Math.max(1, Math.round(((d.km * 1.3) / speed) * 60));
    const time = mins >= 90 ? { h: String(Math.floor(mins / 60)), min: String(mins % 60) } : { h: "", min: String(mins) };
    return (
      <div className="w-full border-t border-copper/20 pt-4" aria-live="polite">
        <p className="font-display text-[1.45rem] leading-snug text-bone">
          {t.youAre} <span className="text-copper-hi"><Roller value={dist.v} /> {dist.u}</span> {t.straight}
        </p>
        <p className="mt-1 text-sm text-mist">
          {t.about}{" "}
          {time.h && (<><Roller value={time.h} /> {t.h} </>)}
          <Roller value={time.min} /> {t.min} {t.byCar}
        </p>
      </div>
    );
  }
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={ask}
        disabled={d.state === "asking"}
        className="inline-flex items-center gap-2 border-b border-copper/50 pb-1 text-left text-sm text-bone/85 transition-colors hover:text-copper-hi disabled:opacity-60"
        data-event="mapa_distancia_botao"
      >
        <LocateFixed className="h-4 w-4 shrink-0 text-copper" strokeWidth={1.5} aria-hidden="true" />
        {d.state === "asking" ? t.asking : t.ask}
      </button>
      <p className="mt-2 text-xs text-mist/80" aria-live="polite">
        {d.state === "denied" ? t.denied : d.state === "unsupported" ? t.unsupported : t.privacy}
      </p>
    </div>
  );
}

/** Marcador da marca: pino dourado com o monograma e um anel que gira devagar. */
function Pin() {
  return (
    <svg viewBox="0 0 64 80" className="h-[4.9rem] w-[3.9rem] [filter:drop-shadow(0_8px_10px_rgb(0_0_0/0.55))]" aria-hidden="true">
      <defs>
        <linearGradient id="pin-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d9b8" />
          <stop offset="0.55" stopColor="#c9a078" />
          <stop offset="1" stopColor="#8f6b47" />
        </linearGradient>
      </defs>
      <path d="M32 79 C32 79 5 51 5 31 A27 27 0 1 1 59 31 C59 51 32 79 32 79 Z" fill="url(#pin-gold)" />
      <circle cx="32" cy="31" r="21.5" fill="#0a1322" />
      <g data-map-seal>
        <circle cx="32" cy="31" r="25" fill="none" stroke="#0a1322" strokeOpacity="0.85" strokeWidth="1.3" strokeDasharray="2.4 3.4" strokeLinecap="round" />
        <circle cx="32" cy="31" r="18.2" fill="none" stroke="#c9a078" strokeOpacity="0.55" strokeWidth="0.8" strokeDasharray="1 3.2" strokeLinecap="round" />
      </g>
      <g fill="#c9a078" transform="translate(20.5 19.5) scale(.36)">
        <rect x="4" y="9" width="3" height="46" />
        <rect x="9.5" y="9" width="7.5" height="46" />
        <polygon points="4,9 23,9 43,36 35,47 17,23 17,9" />
        <polygon points="45,23 60,9 60,55 45,55" />
      </g>
    </svg>
  );
}

/**
 * Mapa de contato: Google Maps visivel direto, com camadas animadas por cima:
 * rota dourada que se desenha, pino com o monograma que cai e quica, pulsos de
 * localizacao, zoom com a rolagem, cartao do endereco que entra de lado, tom
 * azul-noite que some ao passar o mouse e calculo da distancia sob pedido.
 * O iframe e preguicoso: so baixa quando a secao esta perto da tela.
 */
export function MapBlock({ lang = "pt" }: { lang?: Lang }) {
  const c = site.contact;
  const t = text[lang];
  return (
    <div data-map data-clip className="frame map-tone relative mt-20 border hairline bg-navy">
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[21/9]">
        <div data-map-zoom className="absolute inset-0 will-change-transform">
          <iframe
            title={`${t.address}: ${c.street}, ${c.city}`}
            src={maps.embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <div className="map-tint pointer-events-none absolute inset-0 bg-[#0f1b2e]/35 mix-blend-multiply transition-opacity duration-700" />

        {/* rota dourada: ilustrativa (liga o centro da cidade ao escritorio); a rota real fica no botao */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 460" preserveAspectRatio="none" aria-hidden="true">
          <path data-map-route pathLength={1} d="M0 420 C170 410 235 305 365 296 S510 306 600 230" fill="none" stroke="#e8c8a0" strokeOpacity="0.28" strokeWidth="11" strokeLinecap="round" strokeDasharray="1" vectorEffect="non-scaling-stroke" style={{ filter: "blur(5px)" }} />
          <path data-map-route pathLength={1} d="M0 420 C170 410 235 305 365 296 S510 306 600 230" fill="none" stroke="#e8c8a0" strokeWidth="3" strokeLinecap="round" strokeDasharray="1" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* pulsos de localizacao no chao, sob a ponta do pino */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" aria-hidden="true">
          <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 [transform:translate(-50%,-50%)_scaleY(0.46)]">
            {[0, 1, 2].map((i) => (
              <span key={i} data-map-ring className="absolute left-1/2 top-1/2 block h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-copper-hi/80 opacity-0" />
            ))}
          </div>
        </div>

        {/* pino: a ponta fica exatamente no centro do mapa, onde o Google marca o endereco */}
        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+4px)] -translate-x-1/2 -translate-y-full" aria-hidden="true">
          <div data-map-pin>
            <Pin />
          </div>
        </div>
      </div>

      <div
        data-map-card
        className="relative z-10 flex flex-wrap items-center justify-between gap-5 border-t hairline bg-navy p-6 lg:absolute lg:right-6 lg:top-6 lg:w-[22rem] lg:flex-col lg:items-start lg:rounded-2xl lg:border lg:border-copper/25 lg:bg-ink/85 lg:p-6 lg:shadow-[0_24px_44px_-18px_rgb(0_0_0/0.7)] lg:backdrop-blur-md"
      >
        <address className="not-italic">
          <p className="font-display text-2xl leading-snug text-bone">{c.street}</p>
          <p className="mt-1 text-sm text-mist">{c.city} - {c.state}, {c.zip}</p>
        </address>
        <Distance lang={lang} />
        <a href={maps.directions} target="_blank" rel="noopener" className="btn btn-primary" data-event="como_chegar">
          {t.how} <Arrow />
        </a>
      </div>
    </div>
  );
}
