import { lazy, Suspense, useEffect, useRef, type ComponentType } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { track } from "./lib/tracking";
import { RedirectGate } from "./components/redirect-gate";
import { endFirstPaint } from "./components/reveal";
import { Provider } from "./components/provider";
import { CompareProvider } from "./components/compare";
import { ScrollProgress, StickyCta } from "./components/sticky-cta";
import { CookieConsent } from "./components/cookie-consent";
import { Shell } from "./components/layout/shell";
import { BtnPrimary, Section } from "./components/kit";

/**
 * Cada página é um arquivo separado: quem abre a home não baixa o código do blog, das vagas etc.
 * O HTML pré-renderizado já traz o conteúdo; o código da página chega antes de hidratar
 * (preloadRoute em main.tsx) e o das demais é baixado em segundo plano (prefetchRoutes).
 */
type Loader = () => Promise<{ default: ComponentType }>;
const named = (load: () => Promise<Record<string, unknown>>, name: string): Loader => () =>
  load().then((m) => ({ default: m[name] as ComponentType }));

const ROUTES: [pattern: RegExp, load: Loader][] = [
  [/^\/$/, () => import("./pages/index")],
  [/^\/produtos$/, () => import("./pages/produtos")],
  [/^\/produtos\/[^/]+$/, () => import("./pages/produto")],
  [/^\/projetos-especiais$/, () => import("./pages/projetos-especiais")],
  [/^\/a-empresa$/, () => import("./pages/a-empresa")],
  [/^\/clientes$/, () => import("./pages/clientes")],
  [/^\/assistencia-tecnica$/, () => import("./pages/assistencia-tecnica")],
  [/^\/blog$/, () => import("./pages/blog")],
  [/^\/blog\/[^/]+$/, () => import("./pages/post")],
  [/^\/downloads$/, () => import("./pages/downloads")],
  [/^\/faq$/, () => import("./pages/faq")],
  [/^\/ferramentas$/, () => import("./pages/ferramentas")],
  [/^\/agro$/, () => import("./pages/agro")],
  [/^\/segmentos\/[^/]+$/, () => import("./pages/segmento")],
  [/^\/cases$/, () => import("./pages/cases")],
  [/^\/cases\/[^/]+$/, () => import("./pages/case")],
  [/^\/contato$/, () => import("./pages/contato")],
  [/^\/vagas$/, () => import("./pages/vagas")],
  [/^\/vagas\/[^/]+$/, () => import("./pages/vaga")],
  [/^\/export$/, () => import("./pages/export")],
  [/^\/politica-de-privacidade$/, named(() => import("./pages/legal"), "PoliticaDePrivacidade")],
  [/^\/termos-de-uso$/, named(() => import("./pages/legal"), "TermosDeUso")],
];
const page = (i: number) => lazy(ROUTES[i]![1]);

/** Baixa o código da página do endereço (antes de hidratar o HTML pré-renderizado). */
export function preloadRoute(path: string) {
  return ROUTES.find(([re]) => re.test(path))?.[1]() ?? Promise.resolve();
}

/** Depois que a página abriu, baixa as outras sem pressa: a navegação no site continua instantânea. */
export function prefetchRoutes() {
  const run = () => ROUTES.forEach(([, load]) => void load().catch(() => undefined));
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2500);
}

const Home = page(0);
const Produtos = page(1);
const Produto = page(2);
const ProjetosEspeciais = page(3);
const AEmpresa = page(4);
const Clientes = page(5);
const AssistenciaTecnica = page(6);
const Blog = page(7);
const Post = page(8);
const Downloads = page(9);
const Faq = page(10);
const Ferramentas = page(11);
const Agro = page(12);
const Segmento = page(13);
const Cases = page(14);
const CaseStudyPage = page(15);
const Contato = page(16);
const Vagas = page(17);
const Vaga = page(18);
const ExportLanding = page(19);
const PoliticaDePrivacidade = page(20);
const TermosDeUso = page(21);
// painel e loja só baixam quando alguém abre essas páginas: o visitante do site não carrega esse código
const Admin = lazy(() => import("./pages/admin"));
const Loja = lazy(() => import("./pages/loja"));

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
      <Suspense fallback={<div className="min-h-[60vh]" />}>
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
      </Suspense>
    </Shell>
  );
}

function App() {
  // depois do primeiro desenho, seções que entram na tela voltam a animar (ver components/reveal.tsx)
  useEffect(() => endFirstPaint(), []);
  // troca de página dentro do site (sem recarregar) vira page_view_spa no GTM
  const [location] = useLocation();
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    // espera a página nova (carregada sob demanda) trocar o título
    const t = window.setTimeout(() => track("page_view_spa", { page_path: location, page_title: document.title }), 400);
    return () => window.clearTimeout(t);
  }, [location]);
  return (
    <Provider>
      <CompareProvider>
        <ScrollProgress />
        <Switch>
          <Route path="/admin">
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          </Route>
          <Route path="/loja">
            <Suspense fallback={null}>
              <Loja />
            </Suspense>
          </Route>
          <Route path="/export">
            <Suspense fallback={null}>
              <ExportLanding />
            </Suspense>
          </Route>
          <Route component={Site} />
        </Switch>
        <StickyCta />
      </CompareProvider>
      <CookieConsent />
    </Provider>
  );
}

export default App;
