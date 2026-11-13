// Monitoramento de erros no navegador. So carrega o Sentry quando ha DSN configurado.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  import("@sentry/nextjs").then((Sentry) => Sentry.init({ dsn, tracesSampleRate: 0.1 }));
}
