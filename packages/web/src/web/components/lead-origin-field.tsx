import { useEffect, useState } from "react";
import { sourceLabel } from "@/lib/traffic";
import { visitAttribution } from "@/lib/visits";

/**
 * Campo escondido "Origem do Lead" lido pelo CRM (campo personalizado de mesmo nome).
 * Leva a origem da visita em texto legível: Google, Anúncio Google, Instagram, Direto...
 * Só preenche depois de montar, porque a origem vem do navegador (sessionStorage).
 */
export function LeadOriginField() {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(sourceLabel(visitAttribution()?.source ?? "direto"));
  }, []);
  return <input type="hidden" name="origem_do_lead" id="origem_do_lead" value={origin} readOnly />;
}
