import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee-03-utils/marquee";

/*
 * Mural de depoimentos em colunas que sobem e descem.
 * Adaptado do "marquee-03" (21st.dev): os depoimentos chegam por props (avaliações reais do Google),
 * o avatar é a inicial do nome em vez de foto e cada cartão mostra as 5 estrelas e a origem.
 */
export type Review = {
  name: string;
  body: string;
};

const Stars = () => (
  <span className="flex gap-0.5 text-(--color-brand)" role="img" aria-label="5 de 5 estrelas">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
      </svg>
    ))}
  </span>
);

const ReviewCard = ({ name, body, source }: Review & { source: string }) => (
  <Card className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-none">
    <CardContent className="flex flex-col gap-3 p-0">
      <div className="flex flex-row items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold text-foreground"
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col">
          <p className="m-0 text-sm font-medium text-foreground">{name}</p>
          <p className="m-0 text-xs font-medium text-muted-foreground">Avaliação no {source}</p>
        </div>
      </div>
      <Stars />
      <p className="m-0 text-sm leading-relaxed text-foreground">“{body}”</p>
    </CardContent>
  </Card>
);

export default function VerticalMarquee({ reviews, source = "Google" }: { reviews: Review[]; source?: string }) {
  const column = (n: number) => reviews.filter((_, i) => i % 3 === n);
  const cards = (list: Review[]) => list.map((r) => <ReviewCard key={r.name} {...r} source={source} />);

  return (
    <div className="relative flex h-125 w-full flex-row items-center justify-center overflow-hidden">
      <div className="flex h-full w-full flex-row items-center justify-center gap-4">
        <Marquee pauseOnHover vertical className="hidden h-full flex-1 [--duration:38s] sm:flex">
          {cards(column(0))}
        </Marquee>
        <Marquee reverse pauseOnHover vertical className="hidden h-full flex-1 [--duration:46s] sm:flex">
          {cards(column(1))}
        </Marquee>
        <Marquee pauseOnHover vertical className="hidden h-full flex-1 [--duration:42s] lg:flex">
          {cards(column(2))}
        </Marquee>
        <Marquee pauseOnHover vertical repeat={2} className="flex h-full flex-1 [--duration:60s] sm:hidden">
          {cards(reviews)}
        </Marquee>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-background" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-background" />
    </div>
  );
}
