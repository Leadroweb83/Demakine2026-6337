/**
 * Botão flutuante de WhatsApp da Mailbiz.
 *
 * Antes vivia como tag no Google Tag Manager. O site não carrega mais nenhuma tag do Google,
 * então o mesmo script (mesmo id de integração) é carregado direto, uma vez, fora do /admin.
 */
const MAILBIZ_SRC = "https://d3eq1zq78ux3cv.cloudfront.net/static/scripts/integration.min.js";
const MAILBIZ_ID = "6aaac8502a6abd79f63ea241";

type MailbizWindow = Window & { MailbizIntegration?: { id: string; ready: number } };

export function initMailbiz() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
  const win = window as MailbizWindow;
  if (win.MailbizIntegration) return;
  win.MailbizIntegration = { id: MAILBIZ_ID, ready: 0 };
  const s = document.createElement("script");
  s.async = true;
  s.src = MAILBIZ_SRC;
  document.head.appendChild(s);
}
