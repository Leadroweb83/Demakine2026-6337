/**
 * Divisor com a balanca da justica. O desenho se traca e o travessao se
 * equilibra conforme a pessoa rola (ver data-scales em motion-root).
 * Sem JS ou com movimento reduzido ele fica pronto, ja equilibrado.
 */
export function ScalesDivider({ tone = "paper" }: { tone?: "paper" | "bone" }) {
  return (
    <div className={`${tone === "bone" ? "bg-bone" : "bg-paper"} py-10 text-copper-lo lg:py-14`} aria-hidden="true">
      <div data-scales className="wrap flex items-center gap-6 lg:gap-10">
        <span data-scales-line="l" className="h-px flex-1 origin-right bg-copper-lo/40" />
        <svg viewBox="0 0 240 150" className="h-24 w-auto shrink-0 overflow-visible lg:h-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <g data-scales-draw>
            <path pathLength={1} d="M120 30V122" />
            <path pathLength={1} d="M92 134h56M104 134c0-6 4-12 16-12s16 6 16 12" />
            <circle cx="120" cy="26" r="4" />
          </g>
          <g data-scales-beam>
            <path data-scales-draw pathLength={1} d="M36 40h168" />
            <g data-scales-pan="l">
              <path data-scales-draw pathLength={1} d="M36 40 16 92M36 40l20 52M10 92h52c-2 14-12 22-26 22s-24-8-26-22Z" />
            </g>
            <g data-scales-pan="r">
              <path data-scales-draw pathLength={1} d="M204 40l-20 52M204 40l20 52M178 92h52c-2 14-12 22-26 22s-24-8-26-22Z" />
            </g>
          </g>
        </svg>
        <span data-scales-line="r" className="h-px flex-1 origin-left bg-copper-lo/40" />
      </div>
    </div>
  );
}
