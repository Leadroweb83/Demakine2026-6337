import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
