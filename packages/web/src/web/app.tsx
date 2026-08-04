import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { CompareProvider } from "./components/compare";
import { ScrollProgress, StickyCta } from "./components/sticky-cta";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import { Shell } from "./components/layout/shell";
import { BtnPrimary, Section } from "./components/kit";
import Home from "./pages/index";
import Produtos from "./pages/produtos";
import Produto from "./pages/produto";
import ProjetosEspeciais from "./pages/projetos-especiais";
import AEmpresa from "./pages/a-empresa";
import Clientes from "./pages/clientes";
import AssistenciaTecnica from "./pages/assistencia-tecnica";
import Blog from "./pages/blog";
import Post from "./pages/post";
import Downloads from "./pages/downloads";
import Ferramentas from "./pages/ferramentas";
import Contato from "./pages/contato";
import TrabalheConosco from "./pages/trabalhe-conosco";
import Admin from "./pages/admin";

function NotFound() {
  return (
    <Section>
      <p className="eyebrow text-dm-blue">Erro 404</p>
      <h1 className="h2 mt-3">Página não encontrada</h1>
      <p className="mt-4 max-w-xl text-[16.5px] text-dm-gray">
        O endereço que você acessou não existe ou foi movido. Veja o catálogo de equipamentos ou fale
        com um especialista.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <BtnPrimary to="/produtos">Ver catálogo</BtnPrimary>
        <BtnPrimary to="/contato" className="bg-dm-blue hover:bg-[#0d3480]">
          Falar com a Demakine
        </BtnPrimary>
      </div>
    </Section>
  );
}

function Site() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/produtos" component={Produtos} />
        <Route path="/produtos/:slug" component={Produto} />
        <Route path="/projetos-especiais" component={ProjetosEspeciais} />
        <Route path="/a-empresa" component={AEmpresa} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/assistencia-tecnica" component={AssistenciaTecnica} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={Post} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/ferramentas" component={Ferramentas} />
        <Route path="/contato" component={Contato} />
        <Route path="/trabalhe-conosco" component={TrabalheConosco} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <Provider>
      <CompareProvider>
        <ScrollProgress />
        <Switch>
          <Route path="/admin" component={Admin} />
          <Route component={Site} />
        </Switch>
        <StickyCta />
      </CompareProvider>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
