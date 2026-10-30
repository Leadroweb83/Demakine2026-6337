/**
 * Defesa simples contra robô nos formulários públicos: um campo invisível que gente não preenche
 * (`hp`) e um tempo mínimo entre abrir o formulário e enviar (`startedAt`, em milissegundos).
 */
const MIN_FILL_MS = 1500;

export type BotFields = { hp?: unknown; startedAt?: unknown };

/** "trap": robô preencheu o campo invisível (responder como se tivesse dado certo, sem gravar). */
export function botVerdict(b: BotFields): "ok" | "trap" | "fast" {
  if (typeof b.hp === "string" && b.hp.trim()) return "trap";
  const t = Number(b.startedAt);
  // sem hora de abertura ou rápido demais para ser gente digitando: o formulário avisa e a pessoa tenta de novo
  if (!Number.isFinite(t) || Date.now() - t < MIN_FILL_MS) return "fast";
  return "ok";
}
