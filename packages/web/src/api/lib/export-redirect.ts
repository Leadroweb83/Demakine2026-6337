/** Destino do endereço antigo da página de exportação (/export, com ou sem barra e ?lang=), ou null para qualquer outro endereço. */
export function exportTarget(url: URL): string | null {
  if (!/^\/export\/?$/.test(url.pathname)) return null;
  const target = new URL(url.searchParams.get("lang") === "en" ? "/en/export" : "/es/exportacion", url.origin);
  for (const [name, value] of url.searchParams) if (name !== "lang") target.searchParams.append(name, value);
  return target.toString();
}
