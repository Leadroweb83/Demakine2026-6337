import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"
import path from "path";
import honoDevPlugin from "./vite/plugins/hono-dev-plugin";

const root = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
	// NODE_ENV do .env não entra: o modo vem do comando (build = produção), senão o React sai em modo dev
	const { NODE_ENV: _nodeEnv, ...env } = loadEnv(mode, root, '');
	Object.assign(process.env, env);

	return {
		// textos passam pelo dicionário do idioma na hora de desenhar (src/web/i18n-jsx)
		plugins: [honoDevPlugin(), react({ jsxImportSource: "@/i18n-jsx" }), tailwind()],
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
