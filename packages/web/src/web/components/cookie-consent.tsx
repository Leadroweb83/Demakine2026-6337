/**
 * Banner de consentimento de cookies (LGPD).
 * Guarda a escolha em localStorage e só libera medição depois do aceite.
 * Reabre pelo link "Preferências de cookies" no rodapé (evento custom).
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Cookie, X } from "lucide-react";
import { applyConsent } from "@/lib/tracking";

const KEY = "demakine_cookie_consent";
export const COOKIE_PREFS_EVENT = "demakine:open-cookie-prefs";

type Choice = "all" | "essential";

export function getCookieConsent(): Choice | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "all" || v === "essential" ? v : null;
}

/** Abre o banner de novo, para o link do rodapé. */
export function openCookiePrefs() {
  window.dispatchEvent(new Event(COOKIE_PREFS_EVENT));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (!getCookieConsent()) {
      const t = window.setTimeout(() => setOpen(true), 900);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(COOKIE_PREFS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_PREFS_EVENT, reopen);
  }, []);

  const decide = (choice: Choice) => {
    window.localStorage.setItem(KEY, choice);
    applyConsent(choice);
    setOpen(false);
  };

  // o painel administrativo nao e site publico: nada de banner por cima do menu
  if (!open || location === "/admin") return null;

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-dm-line bg-white p-5 shadow-[0_24px_60px_rgba(10,31,61,0.22)] sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <button
        type="button"
        onClick={() => decide("essential")}
        aria-label="Fechar e manter apenas cookies essenciais"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-dm-gray transition-colors hover:bg-dm-surface hover:text-dm-ink"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue sm:flex">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="pr-8 text-[16px] font-bold text-dm-ink">
            A gente usa cookies para melhorar o site
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-dm-gray">
            Os essenciais mantêm o site funcionando e não podem ser desativados. Os de medição e
            anúncios (Google) mostram quais equipamentos geram mais procura e medem nossas campanhas, e
            só ligam se você aceitar. Detalhes na{" "}
            <Link
              href="/politica-de-privacidade"
              className="font-semibold text-dm-blue hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => decide("all")}
              className="rounded-full bg-dm-green px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
            >
              Aceitar todos
            </button>
            <button
              type="button"
              onClick={() => decide("essential")}
              className="rounded-full border border-dm-line px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
            >
              Só os essenciais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
