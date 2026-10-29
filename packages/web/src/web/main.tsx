import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider, hydrate } from "@tanstack/react-query";
// fontes servidas pelo próprio site: sem esperar o Google Fonts e sem enviar o IP do visitante a terceiros
import "@fontsource-variable/montserrat";
import "@fontsource-variable/dm-sans/opsz.css";
import "@fontsource-variable/dm-sans/opsz-italic.css";
import "@fontsource/anton";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";
import { loadRuntimeContent, runtimeContent } from "./lib/runtime-content";
import { initTracking } from "./lib/tracking";
import { loadDict, localePrefix, setLocale, splitLocale } from "./lib/i18n";

/**
 * Sem await no nível de cima deste arquivo: as páginas (lazy) importam o React deste mesmo arquivo
 * de entrada, e um await aqui esperando por elas deixaria um esperando o outro para sempre.
 */
async function start() {
	// medição (GTM e Google Ads) só carrega se o visitante já tinha aceitado os cookies
	initTracking();
	// idioma pelo endereço (/en, /es); o dicionário chega junto com o conteúdo do painel
	const { locale, path } = splitLocale(location.pathname);
	// O conteúdo editado no painel precisa estar pronto antes de o app (e content.ts/site.ts) carregar.
	const [dict] = await Promise.all([loadDict(locale).catch(() => ({})), loadRuntimeContent()]);
	// conferência de tradução: /en/...?i18n-debug guarda os textos que passaram sem tradução
	// (no console: __DM_I18N__.misses)
	setLocale(locale, dict, location.search.includes("i18n-debug"));
	const { default: App, preloadRoute, prefetchRoutes } = await import("./app.tsx");
	// código da página atual antes de hidratar (sem ele a hidratação espera o arquivo chegar)
	await preloadRoute(path).catch(() => undefined);

	const queryClient = new QueryClient();
	const boot = window.__DM_SSR__;
	if (boot?.queries) hydrate(queryClient, boot.queries);

	const tree = (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<Router base={localePrefix()}>
					<App />
				</Router>
			</QueryClientProvider>
		</StrictMode>
	);

	const root = document.getElementById("root")!;
	// HTML pré-renderizado com o mesmo conteúdo do painel: só liga os eventos (hidratação).
	// Se o painel mudou depois do build (ou a página é o 404 de um endereço novo), desenha de novo.
	// (a página de erro 404 é gerada em português: num endereço /en ou /es também redesenha)
	if (boot && root.hasChildNodes() && runtimeContent().version === boot.version && (boot.locale ?? "pt") === locale) hydrateRoot(root, tree);
	else createRoot(root).render(tree);
	prefetchRoutes();
}

void start();
