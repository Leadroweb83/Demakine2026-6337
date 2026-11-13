"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { integrations } from "@/content/site";

type W = Window & { dataLayer?: unknown[]; clarity?: (...a: unknown[]) => void };
const push = (o: Record<string, unknown>) => ((window as W).dataLayer ??= []).push(o);
const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"];

/**
 * Medicao com consentimento (LGPD):
 * - guarda a origem do visitante (UTM, gclid, fbclid, referrer) para ir junto com o lead;
 * - Consent Mode v2 nasce negado; GTM e Clarity so medem depois do aceite;
 * - envia ao dataLayer: cta_click (botoes com data-event), section_view e generate_lead.
 * Sem GTM nem Clarity configurados, nenhum banner aparece e nada e carregado.
 */
export function Tracking() {
  const { gtmId, clarityId } = integrations;
  const enabled = Boolean(gtmId || clarityId);
  const [choice, setChoice] = useState<"granted" | "denied" | "unset" | null>(null);

  useEffect(() => {
    // Origem do lead: grava so na primeira pagina da sessao
    try {
      if (!sessionStorage.getItem("mg-attr")) {
        const q = new URLSearchParams(location.search);
        const attr: Record<string, string> = { landing: location.pathname };
        if (document.referrer) attr.referrer = document.referrer.slice(0, 300);
        ATTR_KEYS.forEach((k) => { const v = q.get(k); if (v) attr[k] = v.slice(0, 200); });
        sessionStorage.setItem("mg-attr", JSON.stringify(attr));
      }
    } catch {}

    let stored: string | null = null;
    try { stored = localStorage.getItem("mg-consent"); } catch {}
    setChoice(stored === "granted" || stored === "denied" ? stored : "unset");

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-event]");
      if (el) push({ event: "cta_click", cta: el.dataset.event, page: location.pathname });
    };
    document.addEventListener("click", onClick);
    const seen = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !seen.has(en.target.id)) {
          seen.add(en.target.id);
          push({ event: "section_view", section: en.target.id, page: location.pathname });
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => { document.removeEventListener("click", onClick); io.disconnect(); };
  }, []);

  function decide(v: "granted" | "denied") {
    try { localStorage.setItem("mg-consent", v); } catch {}
    setChoice(v);
    push({ event: "consent_update", consent: v });
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("consent", "update", {
      analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v,
    });
  }

  if (!enabled) return null;
  return (
    <>
      <Script id="consent-default" strategy="afterInteractive">{`
        window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
        var c='denied';try{c=localStorage.getItem('mg-consent')==='granted'?'granted':'denied'}catch(e){}
        gtag('consent','default',{analytics_storage:c,ad_storage:c,ad_user_data:c,ad_personalization:c,wait_for_update:500});
        ${gtmId ? `(function(w,d,s,l,i){w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','${gtmId}');` : ""}
      `}</Script>
      {clarityId && choice === "granted" && (
        <Script id="clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityId}");`}</Script>
      )}
      {choice === "unset" && (
        <div role="dialog" aria-label="Privacidade" className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl border border-copper/30 bg-navy p-5 shadow-2xl shadow-black/50 sm:flex sm:items-center sm:gap-6">
          <p className="text-sm text-bone/80">
            Usamos cookies de medição para entender como o site é usado e melhorar o atendimento. Você pode aceitar ou recusar.
          </p>
          <div className="mt-4 flex shrink-0 gap-3 sm:mt-0">
            <button onClick={() => decide("denied")} className="btn btn-ghost !min-h-11 !px-5">Recusar</button>
            <button onClick={() => decide("granted")} className="btn btn-primary !min-h-11 !px-5">Aceitar</button>
          </div>
        </div>
      )}
    </>
  );
}
