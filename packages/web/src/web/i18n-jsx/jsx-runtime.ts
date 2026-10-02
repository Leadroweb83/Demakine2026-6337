/**
 * Desenho de elementos com tradução: o mesmo jsx do React, mas os textos passam antes pelo
 * dicionário do idioma (lib/i18n.ts). Em português não faz nada.
 * O Vite usa este arquivo no lugar de "react/jsx-runtime" (vite.config.ts, jsxImportSource).
 */
import * as R from "react/jsx-runtime";
import { localizeProps } from "../lib/i18n";

type Fn = (type: unknown, props: unknown, key?: unknown) => unknown;
const base = R as unknown as { jsx: Fn; jsxs: Fn; Fragment: unknown };

export const Fragment = base.Fragment;
export const jsx: Fn = (type, props, key) => base.jsx(type, localizeProps(type, props as Record<string, unknown>), key);
export const jsxs: Fn = (type, props, key) => base.jsxs(type, localizeProps(type, props as Record<string, unknown>), key);
