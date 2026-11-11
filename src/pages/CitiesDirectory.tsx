import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { MapPin, Search } from "lucide-react";
import Logo from "../components/Logo";
import { SeoHead } from "../components/SeoHead";
import locationsData from "../lib/seoLocations.json";

export default function CitiesDirectory() {
  const { TARGET_CITIES, NICHES } = locationsData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const activeUf = (searchParams.get("uf") || "").trim().toUpperCase();

  const citiesByState = useMemo(() => {
    const grouped: Record<string, typeof TARGET_CITIES> = {};
    for (const cityObj of TARGET_CITIES) {
      const uf = cityObj.estado.toUpperCase();
      if (!grouped[uf]) grouped[uf] = [];
      grouped[uf].push(cityObj);
    }
    return grouped;
  }, [TARGET_CITIES]);

  const estadosSorted = useMemo(() => Object.keys(citiesByState).sort(), [citiesByState]);

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const isFiltered = Boolean(activeUf && citiesByState[activeUf]) || normalizedQuery.length >= 2;

  const filteredCities = useMemo(() => {
    if (!isFiltered) return [];
    const baseList = activeUf && citiesByState[activeUf] ? citiesByState[activeUf] : TARGET_CITIES;
    if (normalizedQuery.length < 2) {
      return baseList;
    }
    return baseList
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(normalizedQuery) ||
          c.estado.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 120);
  }, [TARGET_CITIES, citiesByState, activeUf, normalizedQuery, isFiltered]);

  const selectUf = (uf: string) => {
    if (!uf) {
      setSearchParams({});
    } else {
      setSearchParams({ uf: uf.toLowerCase() });
    }
  };

  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground font-sans">
      <SeoHead
        title={
          activeUf && citiesByState[activeUf]
            ? `Cidades Atendidas em ${activeUf}`
            : "Cidades Atendidas"
        }
        description={`Confira todas as ${TARGET_CITIES.length} cidades e 27 estados onde a Funil Comercial cria sites profissionais, otimiza o Google Meu Negócio e implanta estruturas de vendas com CRM para negócios locais.`}
        canonicalUrl="https://funilcomercial.com/cidades-atendidas"
      />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link to="/" aria-label="Funil Comercial">
            <Logo iconSize={32} theme="monochrome-white" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/blog" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Blog
            </Link>
            <Link to="/contato" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Contato
            </Link>
            <Link to="/" className="text-sm font-semibold hover:text-primary transition">
              Voltar para o Início
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Cobertura Nacional · {TARGET_CITIES.length} Municípios
            </p>
            <h1 className="text-4xl font-black md:text-5xl lg:text-6xl mb-6">
              Cidades e Regiões Atendidas
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A Funil Comercial desenvolve estruturas de vendas completas — criação de sites de alta conversão,
              otimização de Google Meu Negócio, gestão de tráfego pago e CRM com WhatsApp organizado — para negócios
              locais em todos os {TARGET_CITIES.length} municípios dos 27 estados do Brasil.
            </p>
          </div>

          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Estruturas por Especialidade e Nicho
              </h2>
              <p className="text-sm text-muted-foreground">
                Cada especialidade conta com página dedicada para agência de marketing, captação de clientes, Google Meu Negócio e CRM próprio.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NICHES.map((niche) => (
                <div
                  key={niche.slug}
                  className="rounded-2xl border border-white/10 bg-card/40 p-5"
                >
                  <h3 className="text-lg font-bold text-foreground mb-3">{niche.nome}</h3>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <Link
                      to={`/agencia-de-marketing/${niche.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      • Agência de marketing para {niche.nome}
                    </Link>
                    <Link
                      to={`/empresa-de-captacao/${niche.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      • Empresa de captação para {niche.nome}
                    </Link>
                    <Link
                      to={`/google-meu-negocio/${niche.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      • Google Meu Negócio para {niche.nome}
                    </Link>
                    <Link
                      to={`/melhor-crm/${niche.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      • Melhor CRM para {niche.nome}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Buscar por Estado ou Município
                </h2>
                <p className="text-sm text-muted-foreground">
                  Selecione um estado para visualizar todas as cidades atendidas ou pesquise pelo nome do município.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cidade ou UF (ex: Campinas)"
                  aria-label="Buscar cidade ou estado"
                  className="w-full rounded-xl border border-white/15 bg-card/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectUf("")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  !activeUf
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-white/10 bg-card/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos os estados (27)
              </button>
              {estadosSorted.map((estado) => (
                <Link
                  key={estado}
                  to={`/cidades-atendidas?uf=${estado.toLowerCase()}`}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    activeUf === estado
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/10 bg-card/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {estado} ({citiesByState[estado].length})
                </Link>
              ))}
            </div>

            {isFiltered ? (
              <div>
                <p className="mb-6 text-sm font-semibold text-primary">
                  Exibindo {filteredCities.length} município(s)
                  {activeUf ? ` em ${activeUf}` : ""}
                  {normalizedQuery.length >= 2 ? ` para "${searchTerm.trim()}"` : ""}.
                </p>
                {filteredCities.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-8 text-center text-sm text-muted-foreground">
                    Nenhum município encontrado para esse filtro. Limpe a busca ou escolha outro estado acima.
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCities.map((city) => (
                      <div
                        key={`${city.estado}-${city.cidade}`}
                        className="rounded-2xl border border-white/10 bg-card/30 p-5"
                      >
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <MapPin size={16} className="text-primary shrink-0" />
                          <span>
                            {city.nome} · {city.estado.toUpperCase()}
                          </span>
                        </h3>
                        <div className="flex flex-col gap-1.5 text-xs">
                          <Link
                            to={`/agencia-de-marketing/dentistas/${city.estado}/${city.cidade}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            • Marketing e Estrutura para Dentistas
                          </Link>
                          <Link
                            to={`/agencia-de-marketing/advogados/${city.estado}/${city.cidade}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            • Marketing e Estrutura para Advogados
                          </Link>
                          <Link
                            to={`/agencia-de-marketing/psicologas/${city.estado}/${city.cidade}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            • Marketing e Estrutura para Psicólogas
                          </Link>
                          <Link
                            to={`/google-meu-negocio/clinicas-estetica/${city.estado}/${city.cidade}`.replace("clinicas-estetica", "esteticistas")}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            • Google Meu Negócio para Esteticistas
                          </Link>
                          <Link
                            to={`/local/contadores/${city.estado}/${city.cidade}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            • Estrutura de Vendas para Contadores
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {estadosSorted.map((estado) => {
                  const cities = citiesByState[estado];
                  const highlights = cities.slice(0, 5);
                  return (
                    <section
                      key={estado}
                      className="rounded-2xl border border-white/10 bg-card/30 p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="text-xl font-bold text-primary">
                            Estado: {estado}
                          </h3>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {cities.length} cidades
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {highlights.map((city) => (
                            <li key={`${city.estado}-${city.cidade}`}>
                              <Link
                                to={`/agencia-de-marketing/dentistas/${city.estado}/${city.cidade}`}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                Estrutura de vendas em {city.nome} ({estado})
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        to={`/cidades-atendidas?uf=${estado.toLowerCase()}`}
                        className="mt-5 inline-flex items-center text-xs font-bold text-primary hover:underline"
                      >
                        Ver todas as {cities.length} cidades de {estado} →
                      </Link>
                    </section>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>&copy; {new Date().getFullYear()} Funil Comercial. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/about" className="hover:text-primary transition-colors">Sobre</Link>
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
