import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seoNicheData, getDefaultNicheData } from '../src/lib/seoNicheData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const LOCATIONS_FILE = path.join(__dirname, '..', 'src', 'lib', 'seoLocations.json');

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

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  
  if (!fs.existsSync(LOCATIONS_FILE)) {
    console.error('❌ seoLocations.json not found.');
    process.exit(1);
  }
  
  const locationsData = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf-8'));
  
  let generatedCount = 0;
  
  for (const { estado, cidade, nome: cityName } of locationsData.TARGET_CITIES) {
    for (const { slug: niche } of locationsData.NICHES) {
        
        // Obter os dados reais exatos que o React vai hidratar!
        const data = seoNicheData[niche] || getDefaultNicheData(niche, cityName);
        
        const title = data.title;
        // Pega a dor do cliente como Meta Descrição e corta em 160 chars
        const description = data.painPointDescription.replace(/\n/g, ' ').substring(0, 160);
        
        // Injetar o schema de LocalBusiness
        const schema = {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": niche,
          "provider": {
            "@type": "LocalBusiness",
            "name": `Funil Comercial - Marketing para ${nichoFormat(niche)} em ${cityName}`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": cityName,
              "addressRegion": estado.toUpperCase(),
              "addressCountry": "BR"
            }
          },
          "areaServed": {
            "@type": "City",
            "name": cityName
          }
        };

        // Preparar o HTML Injetado (Static Shell)
        let html = baseHtml;
        
        // Substituir as tags padrão do Vite
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title} em ${cityName} | Funil Comercial</title>`);
        html = html.replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${description}">`);
        
        // Inserir schema no head
        html = html.replace('</head>', `\n    <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n    </script>\n</head>`);
        
        // Marcar que foi pre-renderizado localmente
        html = html.replace('</head>', '\n    <meta name="prerendered-local-shell" content="true">\n</head>');

        // Injetar H1 Oculto/Invisível ou visível apenas para o Googlebot no body para FCP
        // Isso ajuda imensamente o Googlebot antes do JS carregar
        const h1Skeleton = `<div style="display:none;" id="seo-shell"><h1>${title} em ${cityName} - ${estado.toUpperCase()}</h1><p>${description}</p></div>`;
        const finalHtml = html.replace('<div id="root">', `<div id="root">\n${h1Skeleton}`);

        // A URL é /agencia-de-marketing/:nicho/:estado/:cidade
        const urlSegments = ['agencia-de-marketing', niche, estado.toLowerCase(), cidade.toLowerCase()];
        
        let currentPath = DIST_DIR;
        
        // CORREÇÃO CRÍTICA DO ERRO 403: O servidor (ex: GitHub Pages / Vercel) vê o diretório
        // existindo (porque criamos subpastas), mas sem index.html ele dá 403 Forbidden.
        // Solução: Ao descer na árvore de diretórios, garantimos que CADA nível tenha um index.html
        for (let i = 0; i < urlSegments.length; i++) {
            currentPath = path.join(currentPath, urlSegments[i]);
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath, { recursive: true });
            }
            
            const levelHtmlPath = path.join(currentPath, 'index.html');
            
            // Se for o último nível (a cidade), gravamos o HTML otimizado específico
            if (i === urlSegments.length - 1) {
                fs.writeFileSync(levelHtmlPath, finalHtml);
                generatedCount++;
            } 
            // Para níveis intermediários (ex: /agencia-de-marketing, /advogados, /sp), gravamos um fallback
            else if (!fs.existsSync(levelHtmlPath)) {
                let fallbackHtml = baseHtml;
                // Adicionamos uma tag apenas para sabermos que é um fallback
                fallbackHtml = fallbackHtml.replace('</head>', '\n    <meta name="prerendered-local-fallback" content="true">\n</head>');
                fs.writeFileSync(levelHtmlPath, fallbackHtml);
                // Não incrementamos o count para estes falbacks silenciosos, ou podemos incrementar
            }
        }
    }
  }

  console.log(`✨ Selective Prerendering (Local Shells) Complete! Generated ${generatedCount} programmatic local pages (plus fallbacks).`);
}

function formatSlug(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function nichoFormat(niche: string) {
  return niche.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

run().catch(console.error);
