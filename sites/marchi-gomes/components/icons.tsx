export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 20.5l1.300-4.600A8.500 8.500 0 1 1 8 19.200z" />
      <path d="M9.200 8.200c-.2 2.800 2.700 6.200 6 6.600l1.100-1.500-1.900-1.100-1 .8c-.9-.4-1.800-1.300-2.200-2.200l.8-1-1.100-1.900z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
