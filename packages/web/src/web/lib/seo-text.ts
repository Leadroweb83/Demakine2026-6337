/** Título do Google cabe em ~60 caracteres: usa o primeiro sufixo que couber, senão só o título. */
export function fitTitle(title: string, suffixes: string[], max = 60) {
  for (const s of suffixes) if (`${title}${s}`.length <= max) return `${title}${s}`;
  return title;
}

/** Descrição do Google (~155 caracteres): texto limpo, cortado em palavra inteira. */
export function clipDescription(text: string, max = 155) {
  const clean = text
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`]|!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*[-•]\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}
