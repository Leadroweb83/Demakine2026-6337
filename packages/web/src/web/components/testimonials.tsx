import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { testimonials } from "@/lib/content";
import type { Testimonial } from "@/lib/content";

function initials(name: string) {
  return name
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const pool = testimonials.slice(0, 12);
const firstColumn = pool.slice(0, 4);
const secondColumn = pool.slice(4, 8);
const thirdColumn = pool.slice(8, 12);

/** Depoimentos reais em três colunas com rolagem infinita vertical. */
export function TestimonialsWall() {
  return (
    <div
      className={cn(
        "mt-10 flex max-h-[640px] justify-center gap-6 overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]",
      )}
    >
      <InfiniteSlider direction="vertical" speed={30} speedOnHover={15}>
        {firstColumn.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </InfiniteSlider>
      <InfiniteSlider className="hidden md:block" direction="vertical" speed={50} speedOnHover={25}>
        {secondColumn.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </InfiniteSlider>
      <InfiniteSlider className="hidden lg:block" direction="vertical" speed={35} speedOnHover={17}>
        {thirdColumn.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </InfiniteSlider>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & { testimonial: Testimonial }) {
  const { text, name, company, city } = testimonial;
  return (
    <figure
      className={cn(
        "w-[320px] max-w-xs rounded-3xl border border-dm-line bg-white p-8 shadow-lg shadow-dm-ink/10 transition-colors duration-300 hover:border-dm-blue/40",
        className,
      )}
      {...props}
    >
      <div className="flex gap-0.5 text-dm-red" aria-label="5 de 5">
        {Array.from({ length: 5 }).map((_, s) => (
          <svg key={s} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
            <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
          </svg>
        ))}
      </div>
      <blockquote className="mt-4 text-[15.5px] leading-relaxed text-dm-ink/85">“{text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar className="size-10 rounded-full">
          <AvatarFallback className="bg-dm-blue/10 text-[13px] font-bold text-dm-blue">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="text-[15px] font-bold not-italic leading-5 tracking-tight text-dm-ink">
            {name}
          </cite>
          <span className="text-[13.5px] leading-5 text-dm-gray">
            {[company, city].filter(Boolean).join(" · ")}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
