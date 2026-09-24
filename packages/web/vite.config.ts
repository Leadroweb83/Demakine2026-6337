import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"
import path from "path";
import type { Plugin } from "vite";
import honoDevPlugin from "./vite/plugins/hono-dev-plugin";

const root = path.resolve(__dirname, "../..");

/**
 * main.tsx espera o conteúdo do painel antes de importar o app; sem isto o navegador só começaria a
 * baixar o código do site depois dessa resposta. O modulepreload faz os dois downloads correrem juntos.
 */
function preloadApp(): Plugin {
	return {
		name: "demakine-preload-app",
		apply: "build",
		enforce: "post",
		transformIndexHtml(html, ctx) {
			const chunks = Object.values(ctx.bundle ?? {}).filter((c) => c.type === "chunk");
			const app = chunks.find((c) => c.type === "chunk" && c.moduleIds.some((id) => id.endsWith("src/web/app.tsx")));
			if (!app || app.type !== "chunk") return [];
			const entries = new Set(chunks.filter((c) => c.type === "chunk" && c.isEntry).map((c) => c.fileName));
			return [app.fileName, ...app.imports.filter((f) => !entries.has(f))].filter((f) => !html.includes(f)).map((file) => ({
				tag: "link",
				attrs: { rel: "modulepreload", crossorigin: "", href: `/${file}` },
				injectTo: "head" as const,
			}));
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, root, '');
	Object.assign(process.env, env);

	return {
		plugins: [honoDevPlugin(), react(), tailwind(), preloadApp()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src/web"),
			},
		},
		server: {
			allowedHosts: true,
			hmr: { overlay: false, },
			cors: false
		}
	};
});
