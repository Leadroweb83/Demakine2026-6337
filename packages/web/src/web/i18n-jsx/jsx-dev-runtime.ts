/** Versão de desenvolvimento de jsx-runtime.ts (o Vite usa jsxDEV no modo dev). */
import * as R from "react/jsx-dev-runtime";
import { localizeProps } from "../lib/i18n";

type Fn = (type: unknown, props: unknown, ...rest: unknown[]) => unknown;
const base = R as unknown as { jsxDEV: Fn; Fragment: unknown };

export const Fragment = base.Fragment;
export const jsxDEV: Fn = (type, props, ...rest) => base.jsxDEV(type, localizeProps(type, props as Record<string, unknown>), ...rest);
