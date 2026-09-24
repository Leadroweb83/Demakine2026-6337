import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Mapa do Google só depois do clique: o iframe traz uns 80 KB de scripts e cookies do Google, que
 * pesavam na página no celular e rodavam para quem nem ia olhar o mapa. Endereço vem de Dados do site.
 */
export function MapEmbed({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <iframe
        src={site.mapsEmbed}
        title={`Mapa da fábrica Demakine: ${site.address}`}
        referrerPolicy="no-referrer-when-downgrade"
        className={cn("w-full border-0", className)}
      />
    );
  }
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden px-6 text-center",
        dark ? "bg-[#0d2442] text-white" : "bg-dm-surface text-dm-ink",
        className,
      )}
    >
      <div className={cn("absolute inset-0", dark ? "grid-lines opacity-60" : "opacity-60 grid-lines")} aria-hidden="true" />
      <span
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full",
          dark ? "bg-white/10 text-white" : "bg-dm-blue-soft text-dm-blue",
        )}
      >
        <MapPin className="h-6 w-6" />
      </span>
      <p className={cn("relative max-w-sm text-[14.5px] font-semibold", dark ? "text-white/85" : "text-dm-ink/80")}>{site.address}</p>
      <div className="relative flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-dm-blue px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#0d3480]"
        >
          Ver mapa
        </button>
        <a
          href={site.mapsDirections}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide transition-colors",
            dark ? "border-white/25 text-white hover:border-white/60" : "border-dm-line text-dm-ink hover:border-dm-blue/40",
          )}
        >
          <Navigation className="h-3.5 w-3.5" />
          Como chegar
        </a>
      </div>
    </div>
  );
}
