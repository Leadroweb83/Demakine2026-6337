import { useState } from "react";
import { Check, Link2, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Ícones de marca em SVG: lucide não traz logos de redes sociais. */
function IconWhats({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.25.69-1.44 1.33-1.98 1.38-.54.06-1.04.08-1.79-.2-.43-.16-.99-.34-1.71-.66-3.02-1.31-4.99-4.35-5.14-4.55-.15-.2-1.23-1.63-1.23-3.11 0-1.48.78-2.21 1.05-2.51.27-.3.59-.38.79-.38.2 0 .39.002.56.01.18.008.42-.07.66.5.25.6.84 2.05.91 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.35.07.13.07.75-.18 1.44Z" />
    </svg>
  );
}
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.02H7.9v-2.92h2.54v-2.22c0-2.52 1.49-3.91 3.77-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.92h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}
function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function ShareBar({
  title,
  path,
  className,
  compact = false,
}: {
  title: string;
  path: string;
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${site.url}${path}`;
  const text = `${title} - Demakine`;

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      Icon: IconWhats,
      hover: "hover:border-[#25D366]/40 hover:bg-[#25D366]/10 hover:text-[#128C4B]",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: IconFacebook,
      hover: "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: IconLinkedin,
      hover: "hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    },
    {
      label: "E-mail",
      href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Achei que ia te interessar:\n\n${title}\n${url}`)}`,
      Icon: Mail,
      hover: "hover:border-dm-blue/40 hover:bg-dm-blue-soft hover:text-dm-blue",
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <span className="mr-1 text-[13px] font-bold tracking-wide text-dm-gray uppercase">
        {compact ? "Compartilhar" : "Compartilhe este conteúdo"}
      </span>
      {links.map(({ label, href, Icon, hover }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Compartilhar no ${label}`}
          className={cn(
            "flex items-center gap-2 rounded-full border border-dm-line bg-white px-3.5 py-2 text-[13.5px] font-semibold text-dm-ink/75 transition-colors",
            hover,
          )}
        >
          <Icon className="h-4 w-4" />
          <span className={compact ? "sr-only sm:not-sr-only" : ""}>{label}</span>
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-2 rounded-full border border-dm-line bg-white px-3.5 py-2 text-[13.5px] font-semibold text-dm-ink/75 transition-colors hover:border-dm-blue/40 hover:bg-dm-blue-soft hover:text-dm-blue"
      >
        {copied ? <Check className="h-4 w-4 text-dm-green" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Link copiado" : "Copiar link"}
      </button>
    </div>
  );
}
