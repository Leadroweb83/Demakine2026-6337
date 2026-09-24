import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// fontes servidas pelo próprio site: sem esperar o Google Fonts e sem enviar o IP do visitante a terceiros
import "@fontsource-variable/montserrat";
import "@fontsource-variable/dm-sans/opsz.css";
import "@fontsource-variable/dm-sans/opsz-italic.css";
import "@fontsource/anton";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";
import { loadRuntimeContent } from "./lib/runtime-content";

// O conteúdo editado no painel precisa estar pronto antes de o app (e content.ts/site.ts) carregar.
await loadRuntimeContent();
const { default: App } = await import("./app.tsx");

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Router>
				<App />
			</Router>
		</QueryClientProvider>
	</StrictMode>,
);
