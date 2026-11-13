"use client";

import { useState } from "react";
import { maps, site } from "@/content/site";
import { Arrow } from "./icons";

/**
 * Mapa de contato. Abre com uma ilustracao leve (nao e um mapa em escala) em
 * que a rota dourada se desenha ate o endereco; o Google Maps so carrega
 * quando o visitante pede, para nao pesar a pagina.
 */
export function MapBlock() {
  const [live, setLive] = useState(false);
  const c = site.contact;
  return (
    <div className="relative mt-20 overflow-hidden border hairline bg-navy" data-reveal>
      <div className="relative aspect-[16/10] sm:aspect-[21/8]">
        {live ? (
          <iframe title={`Mapa: ${c.street}, ${c.city}`} src={maps.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0 grayscale-[0.2]" />
        ) : (
          <svg viewBox="0 0 1200 460" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <g stroke="#c9a078" strokeOpacity="0.13" strokeWidth="1" fill="none">
              {[60, 150, 240, 330, 410].map((y, i) => <path key={y} d={`M0 ${y + i * 6} C 300 ${y - 30}, 700 ${y + 40}, 1200 ${y - 10}`} />)}
              {[120, 290, 460, 640, 810, 980, 1110].map((x, i) => <path key={x} d={`M${x} 0 C ${x + 40} 150, ${x - 30} 300, ${x + 20 + i * 4} 460`} />)}
              <path d="M0 300 C 250 230, 520 330, 760 250 S 1100 150, 1200 190" strokeOpacity="0.28" strokeWidth="5" />
            </g>
            <path data-route pathLength={1} d="M40 420 C 180 400, 230 310, 360 300 S 560 330, 640 255 S 760 150, 880 168" fill="none" stroke="#e8c8a0" strokeWidth="3" strokeLinecap="round" />
            <g data-route-pin>
              <circle cx="880" cy="168" r="22" fill="#e8c8a0" fillOpacity="0.18" />
              <circle cx="880" cy="168" r="8" fill="#e8c8a0" />
            </g>
          </svg>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-5 border-t hairline p-6 lg:px-8">
        <address className="not-italic">
          <p className="font-display text-2xl text-bone">{c.street}</p>
          <p className="text-sm text-mist">{c.city} - {c.state}, {c.zip}</p>
        </address>
        <div className="flex flex-wrap gap-3">
          {!live && <button type="button" onClick={() => setLive(true)} className="btn btn-ghost" data-event="mapa_abrir">Ver no mapa</button>}
          <a href={maps.directions} target="_blank" rel="noopener" className="btn btn-primary" data-event="como_chegar">Como chegar <Arrow /></a>
        </div>
      </div>
    </div>
  );
}
