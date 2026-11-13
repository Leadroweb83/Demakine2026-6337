import { maps, site } from "@/content/site";
import { Arrow } from "./icons";

/**
 * Mapa de contato: Google Maps visivel direto, com o endereco e o botao de rota.
 * O iframe e preguicoso (loading="lazy"): so baixa quando a secao esta perto da tela.
 */
export function MapBlock() {
  const c = site.contact;
  return (
    <div className="frame relative mt-20 overflow-hidden border hairline bg-navy" data-reveal>
      <div className="relative aspect-[4/3] sm:aspect-[21/8]">
        <iframe
          title={`Mapa: ${c.street}, ${c.city}`}
          src={maps.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 [filter:grayscale(0.25)_contrast(1.04)]"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-5 border-t hairline p-6 lg:px-8">
        <address className="not-italic">
          <p className="font-display text-2xl text-bone">{c.street}</p>
          <p className="text-sm text-mist">{c.city} - {c.state}, {c.zip}</p>
        </address>
        <a href={maps.directions} target="_blank" rel="noopener" className="btn btn-primary" data-event="como_chegar">Como chegar <Arrow /></a>
      </div>
    </div>
  );
}
