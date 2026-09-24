import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ClipboardCheck } from "lucide-react";
import type { MaintenanceGroup } from "@/lib/product-maintenance";
import { cn } from "@/lib/utils";

const STEP = 0.32;

/**
 * Checklist animado: cada cartão confere os próprios itens em cascata quando
 * entra na tela (no celular os cartões ficam empilhados, então cada um anima
 * na sua vez). O contador soma os checks conforme eles terminam de desenhar.
 */
export function ProductChecklist({ groups }: { groups: MaintenanceGroup[] }) {
  const reduce = useReducedMotion();
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const [done, setDone] = useState(0);
  const count = reduce ? total : done;
  const pct = total ? (count / total) * 100 : 0;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-dm-line">
          <div
            className="h-full rounded-full bg-dm-green transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="shrink-0 text-[13px] font-bold tabular-nums text-dm-ink" aria-live="polite">
          {count === total ? `${total} itens conferidos` : `${count} de ${total} itens`}
        </p>
      </div>

      <div className={cn("mt-6 grid gap-5", groups.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
        {groups.map((g) => (
          <ChecklistCard key={g.period} group={g} reduce={Boolean(reduce)} onCheck={() => setDone((d) => d + 1)} />
        ))}
      </div>
    </div>
  );
}

function ChecklistCard({
  group,
  reduce,
  onCheck,
}: {
  group: MaintenanceGroup;
  reduce: boolean;
  onCheck: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const on = reduce || inView;

  return (
    <div ref={ref} className="h-full rounded-2xl border border-dm-line bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
          <ClipboardCheck className="h-5 w-5" />
        </span>
        <h3 className="text-[17px] font-bold text-dm-ink">{group.period}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {group.items.map((t, i) => {
          const delay = reduce ? 0 : 0.15 + i * STEP;
          return (
            <motion.li
              key={t}
              className="flex gap-3 text-[14.5px] leading-relaxed text-dm-ink/80"
              initial={reduce ? false : { opacity: 0.75, x: -6 }}
              animate={on ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.3, delay }}
            >
              <motion.span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2"
                initial={reduce ? false : { borderColor: "rgba(0,0,0,0.18)", backgroundColor: "rgba(0,0,0,0)" }}
                animate={on ? { borderColor: "#17864f", backgroundColor: "#17864f" } : undefined}
                transition={{ duration: 0.2, delay: delay + 0.1 }}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                  <motion.path
                    d="M3.5 8.5l3 3 6-7"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={on ? { pathLength: 1 } : undefined}
                    transition={{ duration: 0.3, delay: delay + 0.15, ease: "easeOut" }}
                    onAnimationComplete={reduce ? undefined : onCheck}
                  />
                </svg>
              </motion.span>
              <span>{t}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
