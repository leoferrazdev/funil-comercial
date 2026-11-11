import {
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  Globe,
  Layers,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";

const PHONE = "+5551996737359";
const PHONE_LABEL = "+55 (51) 99673-7359";
const WHATSAPP_LINK = `https://wa.me/${PHONE.replace("+", "")}`;

const LAYERS = [
  {
    number: "01",
    name: "Presença",
    icon: Globe,
    summary:
      "Site rápido e Perfil da Empresa no Google estruturados para quem busca pelo serviço na cidade encontrar a empresa com clareza e confiança.",
  },
  {
    number: "02",
    name: "Aquisição",
    icon: Megaphone,
    summary:
      "Campanhas no Google Ads e Meta Ads orientadas a intenção real de compra e páginas locais para captar contatos qualificados.",
  },
  {
    number: "03",
    name: "Conversão",
    icon: Layers,
    summary:
      "CRM Funil Comercial com WhatsApp organizado, funil de vendas visual e acompanhamento de leads e oportunidades em um único painel.",
  },
  {
    number: "04",
    name: "Escala",
    icon: Bot,
    summary:
      "Rotinas comerciais, pré-atendimento com IA, automações e processos para responder rápido mesmo durante os horários de atendimento.",
  },
];

function buildAboutSchema(canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre a Funil Comercial",
    url: canonicalUrl,
    description:
      "Conheça a Funil Comercial, empresa brasileira que implementa estruturas de vendas completas para negócios locais com método em quatro camadas e CRM próprio.",
    mainEntity: {
      "@type": ["Organization", "LocalBusiness"],
      "@id": "https://funilcomercial.com/#organization",
      name: "Funil Comercial",
      legalName: "LEONARDO FERRAZ DA SILVA BRASIL",
      taxID: "65.993.728/0001-07",
      url: "https://funilcomercial.com",
      logo: "https://funilcomercial.com/logo.png",
      telephone: PHONE,
      email: "funil@funilcomercial.com",
      founder: {
        "@type": "Person",
        name: "Leonardo Brasil",
        jobTitle: "Fundador & Estrategista Comercial",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: PHONE,
          email: "funil@funilcomercial.com",
          contactType: "customer service",
          areaServed: "BR",
          availableLanguage: ["Portuguese"],
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Liberal, 1329, 12",
        addressLocality: "Porto Alegre",
        addressRegion: "RS",
        postalCode: "91920-680",
        addressCountry: "BR",
      },
    },
  };
}

export default function About({
  canonicalUrl = "https://funilcomercial.com/about",
}: {
  canonicalUrl?: string;
}) {
  return (
    <div
      data-theme="dark"
      className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30"
    >
      <SeoHead
        title="Sobre a Funil Comercial"
        description="Conheça a Funil Comercial, empresa especializada em estrutura de vendas para negócios locais no Brasil: site, Google, tráfego pago, WhatsApp organizado e CRM próprio."
        canonicalUrl={canonicalUrl}
        schema={buildAboutSchema(canonicalUrl)}
      />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial - início" className="transition-opacity hover:opacity-80">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/crm" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              CRM
            </Link>
            <Link to="/contato" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Voltar ao site
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-white/10 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Sobre a empresa
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.08] tracking-tight md:text-6xl">
              Montamos a estrutura de vendas completa para negócios locais no Brasil.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              A <strong className="text-foreground">Funil Comercial</strong> é uma empresa de
              estruturação comercial voltada para profissionais liberais, clínicas, escritórios,
              autônomos e prestadores de serviços locais. Em vez de entregar peças isoladas,
              integramos site, Google Meu Negócio, tráfego pago, atendimento no WhatsApp e{" "}
              <Link to="/crm" className="text-primary hover:underline font-semibold">
                CRM Funil Comercial
              </Link>{" "}
              em uma única operação orientada a fechamento.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              O <strong className="text-foreground">CRM Funil Comercial</strong> é o nosso software
              proprietário e compõe a camada de Conversão do método. A empresa desenvolve e utiliza
              a própria tecnologia no dia a dia comercial, com atendimento remoto para empresas e
              consultórios em todo o território brasileiro.
            </p>
          </div>
        </section>

        <section className="border-b border-white/10 bg-card/30 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Método Estrutura de Vendas
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Quatro camadas conectadas do primeiro clique ao contrato fechado
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.number}
                    className="rounded-3xl border border-white/10 bg-background p-7"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/15 text-primary">
                        <Icon size={20} />
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">
                        Camada {layer.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{layer.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {layer.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Transparência institucional
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Dados legais, sede e canais verificados
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-card/40 p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-primary shrink-0" />
                  <h3 className="text-lg font-bold">Identificação jurídica</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">Marca:</strong> Funil Comercial
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">Razão social:</strong> LEONARDO FERRAZ DA SILVA BRASIL
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">CNPJ:</strong> 65.993.728/0001-07
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">Fundador:</strong> Leonardo Brasil
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-card/40 p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-primary shrink-0" />
                  <h3 className="text-lg font-bold">Localização e atendimento</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2.5">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>
                      Rua Liberal, 1329, 12 — Tristeza · Porto Alegre, RS · CEP 91920-680 · Brasil
                    </span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail size={16} className="shrink-0 text-primary" />
                    <a href="mailto:funil@funilcomercial.com" className="text-foreground hover:text-primary transition-colors">
                      funil@funilcomercial.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <MessageCircle size={16} className="shrink-0 text-primary" />
                    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                      {PHONE_LABEL}
                    </a>
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold">
                  <Link to="/contato" className="rounded-full border border-white/15 px-4 py-2 hover:border-primary hover:text-primary transition-colors">
                    Página de contato
                  </Link>
                  <Link to="/consultoria" className="rounded-full border border-white/15 px-4 py-2 hover:border-primary hover:text-primary transition-colors">
                    Consultoria comercial
                  </Link>
                  <Link to="/privacidade" className="rounded-full border border-white/15 px-4 py-2 hover:border-primary hover:text-primary transition-colors">
                    Política de Privacidade
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>Funil Comercial é uma marca operada por LEONARDO FERRAZ DA SILVA BRASIL · CNPJ 65.993.728/0001-07</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos</Link>
            <Link to="/exclusao-de-dados" className="hover:text-primary transition-colors">Exclusão de Dados</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
