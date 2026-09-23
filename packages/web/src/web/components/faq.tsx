import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { FaqItem } from "@/lib/faq";
import { cn } from "@/lib/utils";

export function FaqAccordion({
  items,
  className,
  openFirst = false,
}: {
  items: FaqItem[];
  className?: string;
  openFirst?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(openFirst ? 0 : null);

  return (
    <div className={cn("divide-y divide-dm-line overflow-hidden rounded-2xl border border-dm-line bg-white", className)}>
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-4 px-5 py-4.5 text-left md:px-6 md:py-5"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dm-blue-soft text-dm-blue">
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
              <span className="text-[16px] leading-snug font-bold text-dm-ink">{item.q}</span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 pl-15 text-[15.5px] leading-relaxed text-dm-gray md:px-6 md:pl-16">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
