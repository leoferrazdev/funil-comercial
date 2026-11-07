import { trackWhatsappClick } from "../lib/analytics";
import { Link, useParams } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead, generateLocalBusinessSchema, generateServiceSchema, generateFAQSchema } from "../components/SeoHead";
import { seoNicheData, getDefaultNicheData } from "../lib/seoNicheData";
import { RelatedContent } from "../components/RelatedContent";

const WHATSAPP_NUMBER = "5551992568861";

function formatLocationName(slug?: string) {
  if (!slug) return "";
  const specialCases: Record<string, string> = {
    "sao-paulo": "São Paulo",
    "rio-de-janeiro": "Rio de Janeiro",
    "belo-horizonte": "Belo Horizonte",
    "curitiba": "Curitiba",
    "campinas": "Campinas",
    "sp": "SP",
    "rj": "RJ",
    "mg": "MG",
    "pr": "PR"
  };
  if (specialCases[slug]) return specialCases[slug];
  
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNiche(nicho?: string) {
  if (!nicho) return "negócios locais";
  if (nicho === "psicologas") return "psicólogos";
  if (nicho === "nutricionistas") return "nutricionistas";
  if (nicho === "contadores") return "contadores";
  if (nicho === "fisioterapeutas") return "fisioterapeutas";
  return nicho.split("-").join(" ");
}

interface IntentProps {
  intentType: 'agencia' | 'captacao' | 'crm' | 'gmn';
}

export default function ProgrammaticIntentLanding({ intentType }: IntentProps) {
  const { nicho, estado, cidade } = useParams();
  
  const formattedCidade = formatLocationName(cidade);
  const formattedEstado = formatLocationName(estado);
  const formattedNicho = formatNiche(nicho);
  
  const nicheData = nicho && seoNicheData[nicho] 
    ? seoNicheData[nicho] 
    : getDefaultNicheData(formattedNicho, formattedCidade);

  // Dynamic Intent Mappings
  let title = "";
  let description = "";
  let h1 = <></>;
  let pathPrefix = "";

  if (intentType === 'agencia') {
    title = `Agência de Marketing para ${formattedNicho} em ${formattedCidade} - ${formattedEstado}`;
    description = `A melhor agência de marketing especializado para ${formattedNicho} em ${formattedCidade} (${formattedEstado}). Capture mais clientes com Google Ads, SEO Local e CRM no WhatsApp.`;
    h1 = <>Agência de Marketing Especializada em <span className="text-primary">{formattedNicho}</span> em {formattedCidade}</>;
    pathPrefix = "agencia-de-marketing";
  } else if (intentType === 'captacao') {
    title = `Empresa de Captação de Clientes para ${formattedNicho} em ${formattedCidade} - ${formattedEstado}`;
    description = `Estrutura completa de captação de clientes para ${formattedNicho} em ${formattedCidade} (${formattedEstado}). Acelere o crescimento com tráfego pago e automação de vendas.`;
    h1 = <>Empresa de Captação de Clientes para <span className="text-primary">{formattedNicho}</span> em {formattedCidade}</>;
    pathPrefix = "empresa-de-captacao";
  } else if (intentType === 'crm') {
    title = `O Melhor CRM para ${formattedNicho} em ${formattedCidade} - ${formattedEstado}`;
    description = `Descubra o melhor CRM para ${formattedNicho} em ${formattedCidade} (${formattedEstado}). Organize seus atendimentos via WhatsApp e converta mais leads.`;
    h1 = <>O Melhor CRM integrado ao WhatsApp para <span className="text-primary">{formattedNicho}</span> em {formattedCidade}</>;
    pathPrefix = "melhor-crm";
  } else if (intentType === 'gmn') {
    title = `Google Meu Negócio para ${formattedNicho} em ${formattedCidade} - ${formattedEstado}`;
    description = `Otimização de Perfil da Empresa no Google (Google Meu Negócio) para ${formattedNicho} em ${formattedCidade} (${formattedEstado}). Destaque-se no Google Maps, apresente serviços com clareza e receba mais contatos no WhatsApp.`;
    h1 = <>Otimização de Google Meu Negócio para <span className="text-primary">{formattedNicho}</span> em {formattedCidade}</>;
    pathPrefix = "google-meu-negocio";
  }
  
  let intentLabel = "Marketing e Estrutura de Vendas";
  if (intentType === 'crm') intentLabel = "Funil Comercial CRM";
  if (intentType === 'captacao') intentLabel = "Captação de Clientes";
  if (intentType === 'gmn') intentLabel = "Google Meu Negócio (Perfil da Empresa)";
  
  const whatsappMessage = `Olá! Gostaria de um diagnóstico da solução de ${intentLabel} para ${formattedNicho} em ${formattedCidade} - ${formattedEstado}.`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const gmnBenefits = [
    `Configuração estratégica de categoria principal e secundárias para ${formattedNicho}`,
    `Descrição comercial otimizada para buscas locais em ${formattedCidade}`,
    `Organização de serviços, fotos, horários e botão direto para o WhatsApp`,
    `Orientação prática para conquistar avaliações 5 estrelas e gerar autoridade no Maps`,
    `Alinhamento completo de presença local (pagamento único, sem mensalidade)`
  ];

  const displayedBenefits = intentType === 'gmn'
    ? [...gmnBenefits.slice(0, 3), ...nicheData.benefits.slice(0, 3)]
    : nicheData.benefits;

  const schema: any[] = [
    generateLocalBusinessSchema(),
    generateServiceSchema(
      title,
      description,
      formattedCidade,
      formattedEstado
    )
  ];

  if (nicheData.faqs) {
    const faqSchema = generateFAQSchema(nicheData.faqs);
    if (faqSchema) schema.push(faqSchema);
  }

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <SeoHead 
        title={title}
        description={description}
        canonicalUrl={`https://funilcomercial.com/${pathPrefix}/${nicho}/${estado}/${cidade}`}
        schema={schema}
      />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <a
            href={whatsappLink} onClick={() => { trackWhatsappClick({ origem: "seo_programatico", nicho: nicho || "geral", estado: estado || "br", cidade: cidade || "geral", intent: intentType }); }}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageCircle size={17} />
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10 py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <MapPin size={16} /> Atendendo {formattedCidade} e região
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl">
              {h1}
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
              {intentType === 'gmn'
                ? `Organizamos e otimizamos seu Perfil da Empresa no Google em ${formattedCidade} para transformar buscas no Google e no Maps em ligações, rotas e mensagens no WhatsApp.`
                : `Deixamos a sua agenda lotada e organizamos o seu atendimento comercial, criando um processo de vendas previsível na sua região.`}
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href={whatsappLink} onClick={() => { trackWhatsappClick({ origem: "seo_programatico", nicho: nicho || "geral", estado: estado || "br", cidade: cidade || "geral", intent: intentType }); }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-black text-primary-foreground transition hover:bg-primary/90"
              >
                {intentType === 'gmn' ? 'Solicitar diagnóstico do meu Google' : 'Solicitar orçamento'}
                <ArrowRight size={19} />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-card/20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
             <div className="text-center">
               <h2 className="text-3xl font-black md:text-4xl">
                 {intentType === 'gmn'
                   ? `Por que otimizar o Perfil da Empresa no Google para ${formattedNicho} em ${formattedCidade}?`
                   : nicheData.painPointTitle.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}
               </h2>
               <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
                 {intentType === 'gmn'
                   ? `Quando um cliente pesquisa por ${formattedNicho} em ${formattedCidade}, o Google Maps é a primeira vitrine que ele vê. Um perfil incompleto ou desatualizado faz você perder clientes prontos para comprar para concorrentes mais organizados.`
                   : nicheData.painPointDescription.replace("sua cidade", formattedCidade).replace("sua região", formattedCidade)}
               </p>
             </div>
             
             <div className="mt-16 grid gap-6 md:grid-cols-3">
                {displayedBenefits.map((benefit, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-background/50 p-6 flex gap-4">
                    <CheckCircle2 className="text-primary shrink-0" size={24} />
                    <p className="text-sm md:text-base font-medium">{benefit}</p>
                  </div>
                ))}
             </div>
          </div>
         </section>

        {/* GEO / AI Engine Optimization - Direct Answer Block */}
        <section className="border-t border-white/10 bg-card/15 py-12">
          <div className="mx-auto max-w-4xl px-5 md:px-8 text-center md:text-left">
            <h2 className="text-xl font-bold text-foreground">
              {intentType === 'gmn'
                ? `Como funciona a otimização de Google Meu Negócio para ${formattedNicho} em ${formattedCidade}?`
                : `Como funciona o serviço de ${intentType === 'crm' ? 'CRM comercial' : 'marketing e captação de clientes'} para ${formattedNicho} em ${formattedCidade}?`}
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              {intentType === 'gmn' ? (
                <>
                  A <strong>Funil Comercial</strong> realiza a revisão e otimização completa do Perfil da Empresa no Google (antigo Google Meu Negócio) para {formattedNicho} em {formattedCidade} ({formattedEstado}). Estruturamos categorias corretas, catálogo de serviços, descrição comercial estratégica, fotos, horários e direcionamento direto para o WhatsApp e para o <strong>Funil Comercial CRM</strong>, fortalecendo sua presença local nas buscas e no Google Maps.
                </>
              ) : (
                <>
                  A <strong>Funil Comercial</strong> implementa uma infraestrutura completa de aquisição e gestão de clientes para {formattedNicho} em {formattedCidade} ({formattedEstado}). Atuamos com posicionamento de alta conversão no Google Ads, otimização de perfil no Google Maps (SEO Local) e integração nativa com o <strong>Funil Comercial CRM</strong> via WhatsApp Oficial, garantindo retorno sobre investimento e previsibilidade de caixa.
                </>
              )}
            </p>
          </div>
        </section>
      </main>

      <RelatedContent currentNiche={nicho} currentState={estado} currentCity={cidade} intentType={intentType} />

      <footer className="border-t border-white/10 py-8 text-center flex flex-col gap-4 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Criamos estruturas de vendas para {formattedNicho} no Brasil inteiro.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/google-meu-negocio" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Google Meu Negócio
          </Link>
          <Link to="/blog" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Blog e Estratégias
          </Link>
          <Link to="/cidades-atendidas" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Ver todas as cidades atendidas
          </Link>
        </div>
      </footer>
    </div>
  );
}
