"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) import("@sentry/nextjs").then((S) => S.captureException(error));
  }, [error]);
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0a1322", color: "#f3eee5", fontFamily: "Georgia, serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 500 }}>Algo não saiu como esperado.</h1>
          <p style={{ opacity: 0.75 }}>Tente novamente ou fale conosco pelo WhatsApp (19) 98184-3010.</p>
          <button onClick={reset} style={{ marginTop: 24, padding: "14px 28px", borderRadius: 999, border: "1px solid #c9a078", background: "transparent", color: "#f3eee5", cursor: "pointer" }}>Tentar de novo</button>
        </div>
      </body>
    </html>
  );
}
