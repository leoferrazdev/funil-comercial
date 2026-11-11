import React, { Suspense } from "react";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { SsrJsonLdContext } from "./components/SeoHead";
import LandingPage from "./pages/Landing";
import AboutPage from "./pages/About";
import CrmLandingPage from "./pages/CrmLanding";
import ConsultoriaLanding from "./pages/ConsultoriaLanding";
import ContactPage from "./pages/Contact";
import BrandbookPage from "./pages/Brandbook";
import LocalBusinessWebsiteLanding from "./pages/LocalBusinessWebsiteLanding";
import SalesStructureDiagnosticLanding from "./pages/SalesStructureDiagnosticLanding";
import GoogleBusinessProfileLanding from "./pages/GoogleBusinessProfileLanding";
import PaidTrafficLocalBusinessLanding from "./pages/PaidTrafficLocalBusinessLanding";
import CrmWhatsappLanding from "./pages/CrmWhatsappLanding";
import NutritionistWebsiteLanding from "./pages/NutritionistWebsiteLanding";
import PsychologistWebsiteLanding from "./pages/PsychologistWebsiteLanding";
import CitiesDirectory from "./pages/CitiesDirectory";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import GlossarioIndex from "./pages/GlossarioIndex";
import GlossarioTermo from "./pages/GlossarioTermo";
import LpNutricionistas from "./pages/LpNutricionistas";
import LpPsicologas from "./pages/LpPsicologas";
import LpDentistas from "./pages/LpDentistas";
import LpTerapeutas from "./pages/LpTerapeutas";
import LpMassoterapeutas from "./pages/LpMassoterapeutas";
import LpAdvogados from "./pages/LpAdvogados";
import LpArquitetos from "./pages/LpArquitetos";
import LpContabilidade from "./pages/LpContabilidade";
import LpEstetica from "./pages/LpEstetica";
import ProgrammaticNicheHub from "./pages/ProgrammaticNicheHub";
import { PrivacyPage, TermsPage, DataDeletionPage } from "./pages/LegalPages";

const HOISTED_HEAD_PREFIX_RE =
  /^((?:\s*<title\b[^>]*>[\s\S]*?<\/title>|\s*<meta\b[^>]*\/?>|\s*<link\b[^>]*\/?>)+)/i;

export function render(url: string): {
  html: string;
  headTags: string;
} {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const jsonLdScripts: string[] = [];

  const rawHtml = renderToString(
    <React.StrictMode>
      <HelmetProvider>
        <SsrJsonLdContext.Provider value={jsonLdScripts}>
          <QueryClientProvider client={queryClient}>
            <StaticRouter location={url}>
              <AnnouncementBar />
              <Suspense fallback={<div />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage canonicalUrl="https://funilcomercial.com/about" />} />
                  <Route path="/sobre" element={<AboutPage canonicalUrl="https://funilcomercial.com/sobre" />} />
                  <Route path="/crm" element={<CrmLandingPage />} />
                  <Route path="/consultoria" element={<ConsultoriaLanding />} />
                  <Route path="/contact" element={<ContactPage canonicalUrl="https://funilcomercial.com/contact" />} />
                  <Route path="/contato" element={<ContactPage canonicalUrl="https://funilcomercial.com/contato" />} />
                  <Route path="/brandbook" element={<BrandbookPage />} />
                  <Route path="/site-para-negocios-locais" element={<LocalBusinessWebsiteLanding />} />
                  <Route path="/diagnostico-estrutura-de-vendas" element={<SalesStructureDiagnosticLanding />} />
                  <Route path="/google-meu-negocio" element={<GoogleBusinessProfileLanding />} />
                  <Route path="/trafego-pago-negocios-locais" element={<PaidTrafficLocalBusinessLanding />} />
                  <Route path="/crm-whatsapp-organizado" element={<CrmWhatsappLanding />} />
                  <Route path="/site-para-nutricionistas" element={<NutritionistWebsiteLanding />} />
                  <Route path="/site-para-dentistas" element={<LpDentistas />} />
                  <Route path="/estrutura-de-vendas-para-nutricionistas" element={<LpNutricionistas />} />
                  <Route path="/estrutura-de-vendas-para-psicologas" element={<LpPsicologas />} />
                  <Route path="/estrutura-de-vendas-para-dentistas" element={<LpDentistas />} />
                  <Route path="/estrutura-de-vendas-para-terapeutas" element={<LpTerapeutas />} />
                  <Route path="/estrutura-de-vendas-para-massoterapeutas" element={<LpMassoterapeutas />} />
                  <Route path="/estrutura-de-vendas-para-advogados" element={<LpAdvogados />} />
                  <Route path="/estrutura-de-vendas-para-arquitetos" element={<LpArquitetos />} />
                  <Route path="/estrutura-de-vendas-para-contabilidade" element={<LpContabilidade />} />
                  <Route path="/estrutura-de-vendas-para-estetica" element={<LpEstetica />} />
                  <Route path="/site-para-psicologas" element={<PsychologistWebsiteLanding />} />
                  <Route path="/privacy" element={<PrivacyPage canonicalUrl="https://funilcomercial.com/privacy" />} />
                  <Route path="/privacidade" element={<PrivacyPage canonicalUrl="https://funilcomercial.com/privacidade" />} />
                  <Route path="/termos" element={<TermsPage />} />
                  <Route path="/exclusao-de-dados" element={<DataDeletionPage />} />
                  <Route path="/cidades-atendidas" element={<CitiesDirectory />} />
                  <Route path="/blog" element={<BlogIndex />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/glossario" element={<GlossarioIndex />} />
                  <Route path="/glossario/:slug" element={<GlossarioTermo />} />
                  <Route path="/agencia-de-marketing/:nicho" element={<ProgrammaticNicheHub />} />
                  <Route path="/empresa-de-captacao/:nicho" element={<ProgrammaticNicheHub />} />
                  <Route path="/melhor-crm/:nicho" element={<ProgrammaticNicheHub />} />
                  <Route path="/google-meu-negocio/:nicho" element={<ProgrammaticNicheHub />} />
                </Routes>
              </Suspense>
            </StaticRouter>
          </QueryClientProvider>
        </SsrJsonLdContext.Provider>
      </HelmetProvider>
    </React.StrictMode>,
  );

  const headPrefixMatch = rawHtml.match(HOISTED_HEAD_PREFIX_RE);
  const hoistedHeadTags = headPrefixMatch ? headPrefixMatch[1].trim() : "";
  const html = headPrefixMatch ? rawHtml.slice(headPrefixMatch[1].length) : rawHtml;
  const ldTags = jsonLdScripts.map(
    (payload) => `<script type="application/ld+json" data-seo-jsonld="true">${payload}</script>`,
  );
  const headTags = [hoistedHeadTags, ...ldTags].filter(Boolean).join("\n    ");

  return { html, headTags };
}
