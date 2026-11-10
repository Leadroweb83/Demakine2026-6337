/**
 * Lê uma página escrita pelo Marketing (content/landing/*.md) e devolve os blocos que o site desenha.
 * Roda no conversor (vite/landing-from-md.ts) e nos testes; o site só carrega o resultado (data/landing.json).
 *
 * Formato do arquivo (README-dev.md do Marketing):
 *  - frontmatter entre "---": url, title, description, h1, breadcrumb, itens... (não aparece na página)
 *  - linhas com ">" antes do "# ": notas para o desenvolvedor (imagem, alt, redirects)
 *  - corpo em markdown a partir do "# "
 *  - <!-- JSONLD --> com o schema da página (a trilha e o FAQ o site monta sozinho)
 */

import { plainText } from "./markdown-inline";

export type Block =
  | { t: "p"; md: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: { md: string; sub: string[] }[] }
  | { t: "ol"; items: { md: string; sub: string[] }[] }
  | { t: "check"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "quote"; md: string }
  | { t: "code"; text: string };

export type LandingDoc = {
  slug: string;
  kind: "categoria" | "comercial";
  title: string;
  description: string;
  h1: string;
  breadcrumb: [name: string, url: string][];
  /** slugs dos produtos da categoria, na ordem do Marketing */
  items: string[];
  /** foto principal citada na nota do arquivo (só entra se existir em public/) */
  heroImage?: string;
  /** o que vem depois do botão de orçamento do começo ("resposta em até 1 dia útil") */
  heroNote?: string;
  intro: Block[];
  sections: { title: string; blocks: Block[] }[];
  faq: { q: string; a: string; md: string }[];
  cta: { title: string; blocks: Block[]; contact: string };
  jsonLd: Record<string, unknown>[];
};

export type ParseResult = { doc: LandingDoc; droppedFaq: string[] };

const isCtaLine = (md: string) => /^\*\*\[[^\]]+\]\(\/contato\?[^)]*\)\*\*/.test(md);

function frontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error("arquivo sem frontmatter");
  const meta: Record<string, string> = {};
  for (const line of m[1]!.split("\n")) {
    const k = line.match(/^([a-z0-9_]+):\s*(.*)$/);
    if (k) meta[k[1]!] = k[2]!.trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

const unquote = (v = "") => (v.startsWith('"') ? (JSON.parse(v) as string) : v);

function parseBlocks(lines: string[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  const isBlank = (s: string) => s.trim() === "";
  const startsBlock = (s: string) => /^(#{2,3} |\||- |\d+\. |> |```)/.test(s);

  while (i < lines.length) {
    const line = lines[i]!;
    if (isBlank(line) || /^---+$/.test(line.trim())) {
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push({ t: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) code.push(lines[i++]!);
      i++;
      out.push({ t: "code", text: code.join("\n") });
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.startsWith("|")) {
        const cells = lines[i]!.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      out.push({ t: "table", head: rows[0]!, rows: rows.slice(1) });
      continue;
    }
    if (line.startsWith("> ")) {
      const q: string[] = [];
      while (i < lines.length && lines[i]!.startsWith(">")) q.push(lines[i++]!.replace(/^>\s?/, ""));
      out.push({ t: "quote", md: q.join(" ").trim() });
      continue;
    }
    if (line.startsWith("- [ ] ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("- [ ] ")) items.push(lines[i++]!.slice(6).trim());
      out.push({ t: "check", items });
      continue;
    }
    if (line.startsWith("- ") || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: { md: string; sub: string[] }[] = [];
      while (i < lines.length && (ordered ? /^\d+\. / : /^- (?!\[ \] )/).test(lines[i]!)) {
        const md = lines[i]!.replace(ordered ? /^\d+\. / : /^- /, "").trim();
        i++;
        const sub: string[] = [];
        while (i < lines.length && /^\s+- /.test(lines[i]!)) sub.push(lines[i++]!.replace(/^\s+- /, "").trim());
        items.push({ md, sub });
      }
      out.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && !isBlank(lines[i]!) && !(para.length > 0 && startsBlock(lines[i]!))) para.push(lines[i++]!.trim());
    out.push({ t: "p", md: para.join(" ") });
  }
  return out;
}

export function parseLandingMd(raw: string, opts: { imageExists?: (path: string) => boolean } = {}): ParseResult {
  const [source, jsonPart = ""] = raw.split("<!-- JSONLD -->");
  const { meta, body } = frontmatter(source!);
  const url = meta.url!;
  const slug = url.replace(/^\//, "");

  const lines = body.split("\n");
  const h1At = lines.findIndex((l) => l.startsWith("# "));
  if (h1At < 0) throw new Error(`${slug}: sem título "# "`);
  const notes = lines.slice(0, h1At).filter((l) => l.startsWith(">")).join("\n");
  const heroImage = [...notes.matchAll(/`(\/img\/[^`]+)`/g)].map((m) => m[1]!).find((p) => !opts.imageExists || opts.imageExists(p));

  const bodyH1 = lines[h1At]!.slice(2).trim();
  if (unquote(meta.h1) !== bodyH1) throw new Error(`${slug}: h1 do frontmatter difere do título do corpo`);
  const rest = lines.slice(h1At + 1);
  // corta em "## ": a introdução vem antes do primeiro, cada seção vai até o próximo
  const parts: { title: string; lines: string[] }[] = [{ title: "", lines: [] }];
  for (const l of rest) {
    if (l.startsWith("## ")) parts.push({ title: l.slice(3).trim(), lines: [] });
    else parts[parts.length - 1]!.lines.push(l);
  }

  const introAll = parseBlocks(parts[0]!.lines);
  const ctaAt = introAll.findIndex((b) => b.t === "p" && isCtaLine(b.md));
  const heroNote = ctaAt >= 0 ? (introAll[ctaAt] as { md: string }).md.replace(/^\*\*\[[^\]]+\]\([^)]*\)\*\*\s*·?\s*/, "").trim() : undefined;
  const intro = introAll.filter((_, k) => k !== ctaAt);

  const sections = parts.slice(1).map((p) => ({ title: p.title, blocks: parseBlocks(p.lines) }));
  const last = sections.pop();
  if (!last) throw new Error(`${slug}: sem seção final de orçamento`);
  const ctaLine = last.blocks.find((b): b is Extract<Block, { t: "p" }> => b.t === "p" && isCtaLine(b.md));
  const contact = ctaLine ? ctaLine.md.replace(/^\*\*\[[^\]]+\]\([^)]*\)\*\*\s*·?\s*/, "").trim() : "";
  const cta = { title: last.title, blocks: last.blocks.filter((b) => b !== ctaLine), contact };

  // FAQ: cada "###" da seção "Perguntas frequentes" é uma pergunta; a que ficou com [CONFIRMAR] sai
  const faqAt = sections.findIndex((s) => /^perguntas frequentes/i.test(s.title));
  const faq: LandingDoc["faq"] = [];
  const droppedFaq: string[] = [];
  if (faqAt >= 0) {
    const [faqSection] = sections.splice(faqAt, 1);
    let current: { q: string; md: string[] } | null = null;
    const close = () => {
      if (!current) return;
      const md = current.md.join("\n\n");
      if (md.includes("[CONFIRMAR")) droppedFaq.push(current.q);
      else faq.push({ q: current.q, a: plainText(md), md });
    };
    for (const b of faqSection!.blocks) {
      if (b.t === "h3") {
        close();
        current = { q: b.text, md: [] };
      } else if (b.t === "p" && current) current.md.push(b.md);
    }
    close();
  }

  // schema: a trilha e o FAQ o site monta (o FAQ sai do mesmo texto da página); o resto vem do arquivo
  const jsonText = jsonPart.match(/```json\n([\s\S]*?)\n```/)?.[1];
  const graph = jsonText ? ((JSON.parse(jsonText) as { "@graph": Record<string, unknown>[] })["@graph"] ?? []) : [];
  const jsonLd = graph.filter((n) => n["@type"] !== "BreadcrumbList" && n["@type"] !== "FAQPage");

  return {
    doc: {
      slug,
      kind: meta.tipo === "categoria" ? "categoria" : "comercial",
      title: unquote(meta.title),
      description: unquote(meta.description),
      h1: unquote(meta.h1),
      breadcrumb: JSON.parse(meta.breadcrumb!) as [string, string][],
      items: (meta.itens ?? "").replace(/^\[|\]$/g, "").split(",").map((s) => s.trim()).filter(Boolean),
      ...(heroImage ? { heroImage } : {}),
      ...(heroNote ? { heroNote } : {}),
      intro,
      sections,
      faq,
      cta,
      jsonLd,
    },
    droppedFaq,
  };
}
