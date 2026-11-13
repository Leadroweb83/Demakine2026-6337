/**
 * Monograma provisorio, redesenhado a partir das pecas enviadas.
 * Trocar pelo vetor oficial (SVG) assim que o cliente enviar.
 */
export function Monogram({ className, assemble }: { className?: string; assemble?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} data-assemble={assemble || undefined} overflow="visible" aria-hidden="true" fill="currentColor">
      <rect x="4" y="9" width="3" height="46" />
      <rect x="9.5" y="9" width="7.5" height="46" />
      <polygon points="4,9 23,9 43,36 35,47 17,23 17,9" />
      <polygon points="45,23 60,9 60,55 45,55" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <Monogram className="h-9 w-9 text-copper" />
      <span className="h-9 w-px bg-copper/50" aria-hidden="true" />
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] font-semibold uppercase tracking-[0.08em] text-bone">
          Marchi Gomes
        </span>
        <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.5em] text-copper">
          Advogados
        </span>
      </span>
    </span>
  );
}
