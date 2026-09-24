import { Redirect, Route, Switch } from "wouter";
import { RedirectGate } from "./components/redirect-gate";
import { Provider } from "./components/provider";
import { CompareProvider } from "./components/compare";
import { ScrollProgress, StickyCta } from "./components/sticky-cta";
import { CookieConsent } from "./components/cookie-consent";
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
import Faq from "./pages/faq";
import Ferramentas from "./pages/ferramentas";
import Agro from "./pages/agro";
import Segmento from "./pages/segmento";
import Cases from "./pages/cases";
import CaseStudyPage from "./pages/case";
import Contato from "./pages/contato";
import Vagas from "./pages/vagas";
import Vaga from "./pages/vaga";
import Admin from "./pages/admin";
import Loja from "./pages/loja";
import ExportLanding from "./pages/export";
import { PoliticaDePrivacidade, TermosDeUso } from "./pages/legal";

function NotFound() {
  return (
    <RedirectGate>
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
    </RedirectGate>
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
        <Route path="/faq" component={Faq} />
        <Route path="/ferramentas" component={Ferramentas} />
        <Route path="/agro" component={Agro} />
        <Route path="/segmentos/:slug" component={Segmento} />
        <Route path="/cases" component={Cases} />
        <Route path="/cases/:slug" component={CaseStudyPage} />
        <Route path="/contato" component={Contato} />
        <Route path="/vagas" component={Vagas} />
        <Route path="/vagas/:slug" component={Vaga} />
        <Route path="/trabalhe-conosco">
          <Redirect to="/vagas" replace />
        </Route>
        <Route path="/politica-de-privacidade" component={PoliticaDePrivacidade} />
        <Route path="/termos-de-uso" component={TermosDeUso} />
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
          <Route path="/loja" component={Loja} />
          <Route path="/export" component={ExportLanding} />
          <Route component={Site} />
        </Switch>
        <StickyCta />
      </CompareProvider>
      <CookieConsent />
    </Provider>
  );
}

export default App;
