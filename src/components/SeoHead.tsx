import { createContext, useContext, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { brandConfig } from "../lib/branding";

export const SsrJsonLdContext = createContext<string[] | null>(null);

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  image?: string;
  ogType?: string;
  exactTitle?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

export function SeoHead({
  title,
  description,
  keywords,
  canonicalUrl,
  image = "https://funilcomercial.com/logo.png",
  ogType = "website",
  exactTitle = false,
  schema,
  noindex = false,
  breadcrumbs,
}: SeoHeadProps) {
  const defaultTitle = `${brandConfig.name} — Estrutura de Vendas e CRM para Negócios Locais`;
  const finalTitle = title ? (exactTitle ? title : `${title} | ${brandConfig.name}`) : defaultTitle;
  
  const defaultDescription = "Montamos a sua estrutura de vendas. Site, Google, anúncios, WhatsApp e CRM funcionando juntos, de ponta a ponta.";
  const finalDescription = description || defaultDescription;
  
  const finalCanonical = canonicalUrl || "https://funilcomercial.com/";

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  // Combine schemas if both exist
  let finalSchema: any[] = [];
  if (schema) {
    if (Array.isArray(schema)) {
      finalSchema = [...schema];
    } else {
      finalSchema.push(schema);
    }
  }
  if (breadcrumbSchema) {
    finalSchema.push(breadcrumbSchema);
  }

  const schemaJson =
    finalSchema.length > 0
      ? JSON.stringify(finalSchema.length === 1 ? finalSchema[0] : finalSchema)
      : null;
  const ssrJsonLdCollector = useContext(SsrJsonLdContext);
  if (ssrJsonLdCollector && schemaJson && !ssrJsonLdCollector.includes(schemaJson)) {
    ssrJsonLdCollector.push(schemaJson);
  }

  useEffect(() => {
    const head = document.head;
    if (!head) return;
    head
      .querySelectorAll('meta[data-ssr-head="true"], link[data-ssr-head="true"]')
      .forEach((node) => node.remove());
    const managedScripts = head.querySelectorAll('script[type="application/ld+json"]');
    if (!schemaJson) {
      managedScripts.forEach((node) => {
        if (node.getAttribute("data-seo-jsonld") === "true") {
          node.remove();
        }
      });
      return;
    }

    const existingSeoScript = head.querySelector(
      'script[type="application/ld+json"][data-seo-jsonld="true"]',
    ) as HTMLScriptElement | null;
    if (existingSeoScript && existingSeoScript.textContent === schemaJson && managedScripts.length === 1) {
      return;
    }

    managedScripts.forEach((node) => node.remove());
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = schemaJson;
    head.appendChild(script);
  }, [schemaJson]);

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalCanonical} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={finalCanonical} />
    </Helmet>
  );
}

// Helper to generate unified Entity Graph Schema (@graph with Organization, Person, WebSite, Service)
export const generateEntityGraphSchema = () => {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://funilcomercial.com/#website",
        "url": "https://funilcomercial.com",
        "name": brandConfig.name,
        "description": "Estrutura de Vendas para Negócios Locais",
        "publisher": {
          "@id": "https://funilcomercial.com/#organization"
        },
        "inLanguage": "pt-BR"
      },
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": "https://funilcomercial.com/#organization",
        "name": brandConfig.name,
        "legalName": "LEONARDO FERRAZ DA SILVA BRASIL",
        "taxID": "65.993.728/0001-07",
        "url": "https://funilcomercial.com",
        "logo": "https://funilcomercial.com/logo.png",
        "image": "https://funilcomercial.com/logo.png",
        "telephone": "+5551996737359",
        "email": "funil@funilcomercial.com",
        "description": "Montamos a sua estrutura de vendas para negócios locais de ponta a ponta.",
        "knowsAbout": [
          "estrutura de vendas para negócios locais",
          "CRM Funil Comercial",
          "Site / Landing Page",
          "Google Meu Negócio",
          "Tráfego Pago",
          "WhatsApp organizado",
          "Pré-atendimento com IA"
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+5551996737359",
            "email": "funil@funilcomercial.com",
            "contactType": "customer service",
            "areaServed": "BR",
            "availableLanguage": ["Portuguese"]
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rua Liberal, 1329, 12",
          "addressLocality": "Porto Alegre",
          "addressRegion": "RS",
          "postalCode": "91920-680",
          "addressCountry": "BR"
        },
        "founder": {
          "@id": "https://funilcomercial.com/#person"
        },
        "makesOffer": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "CRM Funil Comercial"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Site / Landing Page"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Google Meu Negócio"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Tráfego Pago"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Pré-atendimento com IA"
            }
          }
        ],
        "priceRange": "$$"
      },
      {
        "@type": "Person",
        "@id": "https://funilcomercial.com/#person",
        "name": "Leonardo Brasil",
        "url": "https://funilcomercial.com",
        "jobTitle": "Fundador & Estrategista Comercial",
        "worksFor": {
          "@id": "https://funilcomercial.com/#organization"
        },
        "image": "https://funilcomercial.com/images/leo-avatar.jpg"
      },
      {
        "@type": "Service",
        "@id": "https://funilcomercial.com/#service",
        "name": "Estrutura de Vendas para Negócios Locais",
        "serviceType": "estrutura de vendas para negócios locais",
        "keywords": [
          "estrutura de vendas para negócios locais",
          "CRM Funil Comercial",
          "Site / Landing Page",
          "Google Meu Negócio",
          "Tráfego Pago"
        ],
        "provider": {
          "@id": "https://funilcomercial.com/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "CRM Funil Comercial",
            "url": "https://funilcomercial.com/crm"
          },
          {
            "@type": "Offer",
            "name": "Site / Landing Page",
            "url": "https://funilcomercial.com/site-para-negocios-locais"
          },
          {
            "@type": "Offer",
            "name": "Google Meu Negócio",
            "url": "https://funilcomercial.com/google-meu-negocio"
          },
          {
            "@type": "Offer",
            "name": "Tráfego Pago",
            "url": "https://funilcomercial.com/trafego-pago-negocios-locais"
          }
        ],
        "description": "Implementação completa de infraestrutura comercial: site de alta conversão, tráfego pago (Google & Meta Ads), automação de WhatsApp e CRM de vendas."
      }
    ]
  };
};

// Helper to generate LocalBusiness / Organization Schema
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": brandConfig.name,
    "legalName": "LEONARDO FERRAZ DA SILVA BRASIL",
    "taxID": "65.993.728/0001-07",
    "image": "https://funilcomercial.com/logo.png",
    "logo": "https://funilcomercial.com/logo.png",
    "@id": "https://funilcomercial.com/#organization",
    "url": "https://funilcomercial.com",
    "telephone": "+5551996737359",
    "email": "funil@funilcomercial.com",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+5551996737359",
        "email": "funil@funilcomercial.com",
        "contactType": "customer service",
        "areaServed": "BR",
        "availableLanguage": ["Portuguese"]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua Liberal, 1329, 12",
      "addressLocality": "Porto Alegre",
      "addressRegion": "RS",
      "postalCode": "91920-680",
      "addressCountry": "BR"
    },
    "description": "Montamos a sua estrutura de vendas para negócios locais de ponta a ponta.",
    "priceRange": "$$"
  };
};

// Helper to generate Service Schema
export const generateServiceSchema = (
  serviceName: string, 
  description: string,
  cityName?: string,
  stateName?: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "serviceType": serviceName,
    "provider": {
      "@type": ["Organization", "LocalBusiness"],
      "@id": "https://funilcomercial.com/#organization",
      "name": brandConfig.name,
      "legalName": "LEONARDO FERRAZ DA SILVA BRASIL",
      "url": "https://funilcomercial.com",
      "logo": "https://funilcomercial.com/logo.png",
      "telephone": "+5551996737359",
      "email": "funil@funilcomercial.com",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+5551996737359",
          "email": "funil@funilcomercial.com",
          "contactType": "customer service",
          "areaServed": "BR",
          "availableLanguage": ["Portuguese"]
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rua Liberal, 1329, 12",
        "addressLocality": "Porto Alegre",
        "addressRegion": "RS",
        "postalCode": "91920-680",
        "addressCountry": "BR"
      }
    },
    "areaServed": cityName ? {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": stateName || "Brasil"
      }
    } : {
      "@type": "Country",
      "name": "Brasil"
    },
    "description": description,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Estrutura de Vendas Local",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Site de Alta Conversão & SEO Local"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Tráfego Pago Google Ads & Meta Ads"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Funil Comercial CRM para WhatsApp"
          }
        }
      ]
    }
  };
};

// Helper to generate FAQ Schema
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};
