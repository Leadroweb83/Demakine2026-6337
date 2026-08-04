import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Send } from "lucide-react";
import { site, waLink } from "@/lib/site";
import { useCompare } from "./compare";

/** Barra de progresso de leitura no topo. */
export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
      <div
        className="scroll-progress h-full bg-dm-red transition-transform duration-150"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}

/** Barra de ação fixa no mobile: orçamento + WhatsApp. */
export function StickyCta() {
  const [show, setShow] = useState(false);
  const [location] = useLocation();
  const { slugs } = useCompare();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // não empilha com a barra do comparador nem com a própria página de contato
  if (!show || slugs.length > 0 || location === "/contato" || location === "/admin") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-dm-line bg-white/95 px-3 pb-14 pt-2.5 backdrop-blur md:hidden">
      <p className="mb-2 text-center text-[11px] text-dm-gray">
        {site.mobile} · resposta em até 1 dia útil
      </p>
      <div className="flex gap-2">
        <Link
          href="/contato"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-dm-red px-4 py-3 text-[12.5px] font-bold uppercase tracking-wide text-white"
        >
          <Send className="h-4 w-4" />
          Orçamento
        </Link>
        <a
          href={waLink("Olá! Vim pelo site da Demakine e quero falar com um especialista.")}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-dm-line px-4 py-3 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
