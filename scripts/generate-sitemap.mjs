import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://funilcomercial.com';

import { CORE_ROUTES as PUBLIC_ROUTES } from './core-routes.mjs';

const locationsPath = path.join(__dirname, '..', 'src', 'lib', 'seoLocations.json');
const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const TARGET_CITIES = locationsData.TARGET_CITIES;
const NICHES = locationsData.NICHES.map(n => n.slug);

const MAX_URLS_PER_SITEMAP = 40000;

function generateUrlNode(route, priority, freq) {
  return `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function chunkUrls(urls) {
  const chunks = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP));
  }
  return chunks;
}

function writeSitemapFiles(publicDir, prefix, urlNodesArray) {
  const chunks = chunkUrls(urlNodesArray);
  const sitemapFiles = [];
  
  chunks.forEach((chunk, index) => {
    const fileName = chunks.length === 1 ? `${prefix}.xml` : `${prefix}-${index + 1}.xml`;
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${chunk.join('')}\n</urlset>`;
    fs.writeFileSync(path.join(publicDir, fileName), sitemapContent);
    sitemapFiles.push(fileName);
  });
  
  return sitemapFiles;
}

function generateSitemap() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const allSitemapFiles = [];

  // 1. Core Sitemap
  let coreUrls = PUBLIC_ROUTES.map(route => 
    generateUrlNode(route, route === '/' ? '1.0' : '0.8', 'weekly')
  );
  allSitemapFiles.push(...writeSitemapFiles(publicDir, 'sitemap-core', coreUrls));

  // 2. Local Sitemap
  let localUrls = [];
  
  NICHES.forEach(nicho => {
    localUrls.push(generateUrlNode(`/agencia-de-marketing/${nicho}`, '0.8', 'weekly'));
    localUrls.push(generateUrlNode(`/empresa-de-captacao/${nicho}`, '0.8', 'weekly'));
    localUrls.push(generateUrlNode(`/melhor-crm/${nicho}`, '0.8', 'weekly'));
  });

  TARGET_CITIES.forEach(location => {
    NICHES.forEach(nicho => {
      localUrls.push(generateUrlNode(`/local/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly'));
      localUrls.push(generateUrlNode(`/agencia-de-marketing/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly'));
      localUrls.push(generateUrlNode(`/empresa-de-captacao/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly'));
      localUrls.push(generateUrlNode(`/melhor-crm/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly'));
    });
  });
  allSitemapFiles.push(...writeSitemapFiles(publicDir, 'sitemap-local', localUrls));

  // 3. Blog Sitemap
  const blogDataPath = path.join(__dirname, '..', 'src', 'lib', 'blogData.ts');
  let blogUrls = [];
  
  if (fs.existsSync(blogDataPath)) {
    const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
    const blogSlugs = [...blogDataContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
    blogSlugs.forEach(slug => {
      blogUrls.push(generateUrlNode(`/blog/${slug}`, '0.8', 'weekly'));
    });
  }

  TARGET_CITIES.forEach(location => {
    NICHES.forEach(nicho => {
      blogUrls.push(generateUrlNode(`/blog/guia-de-vendas/${nicho}/${location.estado}/${location.cidade}`, '0.7', 'monthly'));
    });
  });
  allSitemapFiles.push(...writeSitemapFiles(publicDir, 'sitemap-blog', blogUrls));

  // 4. Glossary Sitemap
  const glossarioDataPath = path.join(__dirname, '..', 'src', 'lib', 'glossarioData.ts');
  let glossarioUrls = [];
  glossarioUrls.push(generateUrlNode(`/glossario`, '0.8', 'weekly'));
  
  if (fs.existsSync(glossarioDataPath)) {
    const glossarioDataContent = fs.readFileSync(glossarioDataPath, 'utf8');
    const glossarioSlugs = [...glossarioDataContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
    glossarioSlugs.forEach(slug => {
      glossarioUrls.push(generateUrlNode(`/glossario/${slug}`, '0.7', 'monthly'));
    });
  }
  allSitemapFiles.push(...writeSitemapFiles(publicDir, 'sitemap-glossario', glossarioUrls));

  // 5. Sitemap Index
  const sitemapIndexNodes = allSitemapFiles.map(file => `
  <sitemap>
    <loc>${DOMAIN}/${file}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('');
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapIndexNodes}\n</sitemapindex>`;
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
  
  console.log(`✅ Sitemap Index successfully generated at ${path.join(publicDir, 'sitemap.xml')} with ${allSitemapFiles.length} chunk files.`);
  console.log(`🚀 Total Core routes: ${coreUrls.length}`);
  console.log(`🚀 Total Local SEO routes: ${localUrls.length}`);
  console.log(`🚀 Total Blog routes: ${blogUrls.length}`);
  console.log(`🚀 Total Glossario routes: ${glossarioUrls.length}`);
}

generateSitemap();
