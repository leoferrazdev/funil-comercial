import { Link, useLocation, useParams } from "react-router";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import locationsData from "../lib/seoLocations.json";
import { seoNicheData } from "../lib/seoNicheData";
import { ArrowRight, MapPin } from "lucide-react";

export default function ProgrammaticNicheHub() {
  const { intentType: paramIntentType, nicho } = useParams();
  const location = useLocation();
  const intentType = paramIntentType || location.pathname.split("/").filter(Boolean)[0] || "agencia-de-marketing";
  
  const { TARGET_CITIES, NICHES } = locationsData;
  const nicheInfo = NICHES.find(n => n.slug === nicho) || { nome: nicho, slug: nicho };
  const nicheContent = seoNicheData[nicho as string] || null;

  // Group cities by state
  const citiesByState = TARGET_CITIES.reduce((acc, cityObj) => {
    const estadoUpper = cityObj.estado.toUpperCase();
    if (!acc[estadoUpper]) acc[estadoUpper] = [];
    acc[estadoUpper].push(cityObj);
    return acc;
  }, {} as Record<string, typeof TARGET_CITIES>);

  const estadosSorted = Object.keys(citiesByState).sort();

  let intentName = "Marketing e Vendas";
  if (intentType === "agencia-de-marketing") intentName = "Agência de Marketing Especializada";
  if (intentType === "empresa-de-captacao") intentName = "Empresa de Captação de Clientes";
  if (intentType === "melhor-crm") intentName = "Melhor CRM";
  if (intentType === "google-meu-negocio") intentName = "Otimização de Google Meu Negócio";

  const title = `${intentName} para ${nicheInfo.nome}`;
  const description = intentType === "google-meu-negocio"
    ? `Otimização de Perfil da Empresa no Google (Google Meu Negócio) para ${nicheInfo.nome} na sua cidade. Apareça no Google Maps e receba mais contatos no WhatsApp.`
    : nicheContent 
      ? nicheContent.heroSubtitle 
      : `Encontre a melhor solução de ${intentName.toLowerCase()} para ${nicheInfo.nome} na sua cidade.`;

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <SeoHead 
        title={`${title} - Funil Comercial`}
        description={description}
        canonicalUrl={`https://funilcomercial.com/${intentType}/${nicho}`}
      />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <Link to="/cidades-atendidas" className="text-sm font-semibold hover:text-primary transition">
            Ver todas as Cidades
          </Link>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-16 text-center">
             <h1 className="text-4xl font-black md:text-5xl lg:text-6xl mb-6">
                {title}
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Atuamos em todo o Brasil. Selecione abaixo o seu estado e cidade para ver como nossa estrutura 
                de {intentType === "google-meu-negocio" ? "posicionamento no Google Maps e Perfil da Empresa" : "captação de vendas"} funciona para <strong>{nicheInfo.nome}</strong> na sua região.
             </p>
          </div>

          <div className="flex flex-col gap-12">
             {estadosSorted.map(estado => (
               <section key={estado}>
                 <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 text-primary flex items-center gap-2">
                    <MapPin size={24} /> Estado: {estado}
                 </h2>
                 <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                   {citiesByState[estado].map(city => (
                      <Link 
                        key={city.cidade} 
                        to={`/${intentType}/${nicho}/${city.estado}/${city.cidade}`}
                        className="group flex items-center justify-between rounded-xl border border-white/10 bg-card/30 p-4 hover:border-primary/50 hover:bg-card/50 transition-all"
                      >
                         <span className="font-semibold text-sm md:text-base">{city.nome}</span>
                         <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                   ))}
                 </div>
               </section>
             ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
