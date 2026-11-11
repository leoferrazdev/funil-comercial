import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seoNicheData, getDefaultNicheData } from '../src/lib/seoNicheData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const LOCATIONS_FILE = path.join(__dirname, '..', 'src', 'lib', 'seoLocations.json');

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHomeSeoAndRoot(indexHtml: string): string {
  return indexHtml
    .replace(/<!--app-root-start-->[\s\S]*?<!--app-root-end-->/, '<!--app-root-start--><div id="root"></div><!--app-root-end-->')
    .replace(/<meta\b[^>]*\bname=["']prerendered["'][^>]*>\s*/gi, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']keywords["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bproperty=["']og:(url|title|description)["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']twitter:(url|title|description)["'][^>]*>\s*/gi, '')
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
}

async function run() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist folder not found. Run vite build first.');
    process.exit(1);
  }

  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ dist/index.html not found.');
    process.exit(1);
  }

  const baseShellHtml = stripHomeSeoAndRoot(fs.readFileSync(indexHtmlPath, 'utf-8'));

  if (!fs.existsSync(LOCATIONS_FILE)) {
    console.error('❌ seoLocations.json not found.');
    process.exit(1);
  }

  const locationsData = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf-8'));
  let generatedCount = 0;

  for (const { estado, cidade, nome: cityName } of locationsData.TARGET_CITIES) {
    for (const { slug: niche } of locationsData.NICHES) {
      const data = seoNicheData[niche] || getDefaultNicheData(niche, cityName);
      const ufUpper = estado.toUpperCase();
      const nicheLabel = nichoFormat(niche);
      const fullTitle = `${data.title} em ${cityName} (${ufUpper}) | Funil Comercial`;
      const description = data.painPointDescription.replace(/\n/g, ' ').slice(0, 160);
      const canonicalUrl = `https://funilcomercial.com/agencia-de-marketing/${niche}/${estado.toLowerCase()}/${cidade.toLowerCase()}`;

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: `${data.title} para ${nicheLabel}`,
        provider: {
          '@type': ['Organization', 'LocalBusiness'],
          name: `Funil Comercial — Estrutura de Vendas para ${nicheLabel} em ${cityName}`,
          url: 'https://funilcomercial.com',
          telephone: '+5551996737359',
          email: 'funil@funilcomercial.com',
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: '+5551996737359',
              email: 'funil@funilcomercial.com',
              contactType: 'customer service',
              areaServed: 'BR',
              availableLanguage: ['Portuguese'],
            },
          ],
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityName,
            addressRegion: ufUpper,
            addressCountry: 'BR',
          },
        },
        areaServed: {
          '@type': 'City',
          name: cityName,
        },
      };

      const escapedTitle = escapeHtml(fullTitle);
      const escapedDesc = escapeHtml(description);
      const escapedH1 = escapeHtml(`${data.title} em ${cityName} - ${ufUpper}`);

      const headTags = [
        `<title>${escapedTitle}</title>`,
        `<meta data-ssr-head="true" name="description" content="${escapedDesc}" />`,
        `<link data-ssr-head="true" rel="canonical" href="${canonicalUrl}" />`,
        `<meta data-ssr-head="true" property="og:url" content="${canonicalUrl}" />`,
        `<meta data-ssr-head="true" property="og:title" content="${escapedTitle}" />`,
        `<meta data-ssr-head="true" property="og:description" content="${escapedDesc}" />`,
        `<meta data-ssr-head="true" name="twitter:url" content="${canonicalUrl}" />`,
        `<meta data-ssr-head="true" name="twitter:title" content="${escapedTitle}" />`,
        `<meta data-ssr-head="true" name="twitter:description" content="${escapedDesc}" />`,
        `<meta name="prerendered-local-shell" content="true" />`,
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
      ].join('\n    ');

      const visibleBody = `<div id="root" data-ssr-local="true"><main class="min-h-screen bg-background text-foreground px-6 py-16 mx-auto max-w-4xl"><h1 class="text-3xl font-black mb-4">${escapedH1}</h1><p class="mb-4">${escapeHtml(data.painPointDescription)}</p><section class="mb-6"><h2 class="text-xl font-bold mb-2">Estrutura de Vendas Completa em ${escapeHtml(cityName)}</h2><p>A Funil Comercial implanta criação de site de alta conversão, otimização de Google Meu Negócio, gestão de tráfego pago (Google Ads e Meta Ads), organização de atendimento no WhatsApp e CRM próprio para ${escapeHtml(nicheLabel)} em ${escapeHtml(cityName)}, ${ufUpper}.</p></section></main></div>`;

      const finalHtml = baseShellHtml
        .replace('</head>', () => `    ${headTags}\n  </head>`)
        .replace('<!--app-root-start--><div id="root"></div><!--app-root-end-->', () => visibleBody);

      const urlSegments = ['agencia-de-marketing', niche, estado.toLowerCase(), cidade.toLowerCase()];
      let currentPath = DIST_DIR;

      for (let i = 0; i < urlSegments.length; i++) {
        currentPath = path.join(currentPath, urlSegments[i]);
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath, { recursive: true });
        }

        const levelHtmlPath = path.join(currentPath, 'index.html');
        if (i === urlSegments.length - 1) {
          fs.writeFileSync(levelHtmlPath, finalHtml);
          generatedCount++;
        } else if (!fs.existsSync(levelHtmlPath)) {
          const levelRoute = `/${urlSegments.slice(0, i + 1).join('/')}`;
          const fallbackCanonical = `https://funilcomercial.com${levelRoute}`;
          const fallbackHead = [
            `<title>Estrutura de Vendas Local | Funil Comercial</title>`,
            `<meta data-ssr-head="true" name="description" content="Estrutura de vendas para negócios locais em todo o Brasil: site, Google Meu Negócio, tráfego pago e CRM Funil Comercial." />`,
            `<link data-ssr-head="true" rel="canonical" href="${fallbackCanonical}" />`,
            `<meta name="prerendered-local-fallback" content="true" />`,
          ].join('\n    ');
          const fallbackBody = `<div id="root" data-ssr-local="fallback"><main class="min-h-screen bg-background text-foreground px-6 py-16 mx-auto max-w-4xl"><h1 class="text-3xl font-black mb-4">Agência e Estrutura de Vendas para Negócios Locais</h1><p>Atendemos ${escapeHtml(locationsData.TARGET_CITIES.length.toString())} municípios no Brasil com criação de site, Google Meu Negócio, tráfego pago, atendimento no WhatsApp e CRM Funil Comercial. Consulte nossa cobertura completa em Cidades Atendidas ou fale com nossa equipe.</p></main></div>`;
          const fallbackHtml = baseShellHtml
            .replace('</head>', () => `    ${fallbackHead}\n  </head>`)
            .replace('<!--app-root-start--><div id="root"></div><!--app-root-end-->', () => fallbackBody);
          fs.writeFileSync(levelHtmlPath, fallbackHtml);
        }
      }
    }
  }

  console.log(`✨ Selective Prerendering (Local Shells) Complete! Generated ${generatedCount} programmatic local pages (plus fallbacks).`);
}

function nichoFormat(niche: string) {
  return niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

run().catch(console.error);
