/** Quem enxerga cada área do painel. Arquivo puro (sem React) para os testes conferirem a tabela. */
export type Area = "livre" | "config" | "leads" | "conteudo" | "loja" | "vagas" | "usuarios" | "seo-geo";

export function allowed(role: string, area: Area) {
  if (area === "livre") return true;
  // SEO e GEO é só do super admin, nem o admin entra
  if (area === "seo-geo") return role === "super_admin";
  if (role === "super_admin") return true;
  if (role === "admin") return area !== "usuarios";
  if (role === "vendedor") return area === "leads";
  if (role === "editor") return area === "conteudo" || area === "vagas";
  if (role === "rh") return area === "vagas";
  return false;
}
