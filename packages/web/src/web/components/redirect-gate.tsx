import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Seo } from "./seo";

/** Reserva do middleware da Vercel: se o endereço tem redirecionamento cadastrado, vai para o destino. */
function useRedirectFallback() {
  const [location, navigate] = useLocation();
  // HTML pré-renderizado (build) e a primeira hidratação já mostram o conteúdo; a conferência roda depois
  const [checking, setChecking] = useState(() => typeof window !== "undefined" && !window.__DM_SSR__);
  useEffect(() => {
    let alive = true;
    let path = location;
    try {
      path = decodeURI(location);
    } catch {
      /* endereço malformado: compara como veio */
    }
    const key = path
      .toLowerCase()
      .replace(/\/{2,}/g, "/")
      .replace(/(.)\/+$/, "$1");
    // endereço antigo com barra no fim: vai para a versão sem barra (na Vercel, trailingSlash: false faz isso)
    if (key !== path.toLowerCase() && key.length > 1 && path.endsWith("/")) {
      navigate(path.replace(/\/+$/, ""), { replace: true });
      return;
    }
    fetch("/api/redirects")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then(({ items }: { items: { from: string; to: string }[] }) => {
        const hit = items.find((i) => i.from === key);
        if (!alive) return;
        if (!hit) return setChecking(false);
        if (/^https?:\/\//.test(hit.to)) window.location.replace(hit.to);
        else navigate(hit.to, { replace: true });
      })
      .catch(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, [location, navigate]);
  return checking;
}

/** Antes de mostrar "não encontrado", confere se o endereço tem redirecionamento cadastrado no painel. */
export function RedirectGate({ children }: { children: ReactNode }) {
  const checking = useRedirectFallback();
  const [location] = useLocation();
  if (checking) return <div className="min-h-[50vh]" aria-busy="true" />;
  return (
    <>
      <Seo
        title="Página não encontrada | Demakine"
        description="O endereço acessado não existe ou foi movido. Veja o catálogo de equipamentos da Demakine."
        path={location}
        noindex
      />
      {children}
    </>
  );
}
