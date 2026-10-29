/**
 * Textos do código que não aparecem na página pronta (abas fechadas, mensagens de erro, resultado
 * de calculadora, menu do celular): a conferência do build (I18N_REPORT=1) só vê o que foi desenhado.
 * Este script lê o código e lista os textos candidatos em i18n-extra.json, para somar com --add.
 *
 *   bun vite/i18n-scan.ts
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dir, "..");
const WEB = path.join(ROOT, "src", "web");
/** só em português: painel, loja, vagas e a página de exportação (já é em outro idioma) */
const SKIP = /\/(admin|shop|types|i18n|i18n-jsx|data)\/|pages\/(admin|loja|vaga|vagas|export)\.tsx$|application-form|lib\/(shop|export-lp|api|images|utils|tracking|visits|traffic|ssr-head|runtime-content|i18n)\.ts$|entry-server|main\.tsx$/;

async function files(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

const CLASSY = /^[a-z0-9\s\-_[\]:/.%#()!,&>*=+'"@]+$/; // classes do Tailwind, seletores, caminhos
const looksLikeText = (s: string) =>
  /[A-Za-zÀ-ÿ]{2}/.test(s) &&
  !/^(https?:|\/|#|\.|@)/.test(s) &&
  !/^[a-z0-9_-]+$/i.test(s) && // uma palavra só sem acento nem espaço: chave, id
  !(CLASSY.test(s) && /[-:[]/.test(s));

const found = new Set<string>();
for (const file of await files(WEB)) {
  if (SKIP.test(file)) continue;
  const src = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isTypeNode(node)) return;
    if (ts.isJsxAttribute(node) && /^(className|class|style|href|src|id|key|to|d|viewBox|type|name|role|rel|target|htmlFor)$/.test(node.name.getText())) return;
    if (ts.isCallExpression(node) && /^(cn|clsx|cva|import|require)$/.test(node.expression.getText())) return;
    if (ts.isJsxText(node)) {
      const text = node.text.split("\n").map((l) => l.trim()).filter(Boolean).join(" ");
      if (looksLikeText(text)) found.add(text);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      const isKey = (ts.isPropertyAssignment(parent) && parent.name === node) || ts.isElementAccessExpression(parent) || ts.isCaseClause(parent);
      const text = node.text.trim();
      if (!isKey && looksLikeText(text)) found.add(text);
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
}
await writeFile(path.join(ROOT, "i18n-extra.json"), JSON.stringify([...found], null, 1));
console.log(`[i18n] ${found.size} textos candidatos no código (i18n-extra.json)`);
