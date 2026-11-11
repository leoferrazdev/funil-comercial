import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CORE_ROUTES } from './core-routes.mjs';
import {
  extractVisibleTextLength,
  htmlToMarkdown,
  validateHeadingHierarchy,
} from './agent-content.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SSR_DIR = path.join(ROOT_DIR, 'dist-ssr');

function extractUniqueSlugs(tsFilePath) {
  if (!fs.existsSync(tsFilePath)) return [];
  const raw = fs.readFileSync(tsFilePath, 'utf-8');
  return [...new Set([...raw.matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1]))];
}

function getAllRoutesToPrerender() {
  const routes = new Set(CORE_ROUTES);

  const blogSlugs = extractUniqueSlugs(path.join(ROOT_DIR, 'src', 'lib', 'blogData.ts'));
  for (const slug of blogSlugs) {
    routes.add(`/blog/${slug}`);
  }

  const glossarioSlugs = extractUniqueSlugs(path.join(ROOT_DIR, 'src', 'lib', 'glossarioData.ts'));
  for (const slug of glossarioSlugs) {
    routes.add(`/glossario/${slug}`);
  }

  const locationsPath = path.join(ROOT_DIR, 'src', 'lib', 'seoLocations.json');
  if (fs.existsSync(locationsPath)) {
    const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));
    for (const niche of locations.NICHES || []) {
      routes.add(`/agencia-de-marketing/${niche.slug}`);
      routes.add(`/empresa-de-captacao/${niche.slug}`);
      routes.add(`/melhor-crm/${niche.slug}`);
      routes.add(`/google-meu-negocio/${niche.slug}`);
    }
  }

  return [...routes];
}

function stripTemplateSeoTags(templateHtml) {
  return templateHtml
    .replace(/<meta\b[^>]*\bname=["']prerendered["'][^>]*>\s*/gi, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']keywords["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bproperty=["']og:(type|url|title|description|image)["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname=["']twitter:(card|url|title|description|image)["'][^>]*>\s*/gi, '')
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
}

function buildHeadInjection(headTags) {
  const markedHeadTags = headTags
    .replace(/<meta\b(?![^>]*data-ssr-head)/gi, '<meta data-ssr-head="true"')
    .replace(/<link\b(?![^>]*data-ssr-head)/gi, '<link data-ssr-head="true"');
  return [markedHeadTags, '<meta name="prerendered" content="true" />']
    .filter(Boolean)
    .join('\n    ');
}

async function prerender() {
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('❌ dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  if (!templateHtml.includes('<!--app-root-start-->')) {
    console.error('❌ Marker <!--app-root-start--> missing in dist/index.html.');
    process.exit(1);
  }

  console.log('⚙️ Building Node SSR bundle (Chromium-free)...');
  await build({
    configFile: path.join(ROOT_DIR, 'vite.config.ts'),
    logLevel: 'silent',
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      emptyOutDir: true,
    },
  });

  try {
    const serverEntryPath = path.join(SSR_DIR, 'entry-server.js');
    if (!fs.existsSync(serverEntryPath)) {
      throw new Error(`SSR entry bundle not found at ${serverEntryPath}`);
    }

    const { render } = await import(pathToFileURL(serverEntryPath).href);
    const routes = getAllRoutesToPrerender();
    console.log(`🚀 Prerendering ${routes.length} routes via React SSR...`);

    const rootMarkerRe = /<!--app-root-start-->[\s\S]*?<!--app-root-end-->/;
    const sampleLogs = new Set(['/', '/blog', '/cidades-atendidas', '/diagnostico-estrutura-de-vendas', '/about', '/contact', '/privacy']);
    const failures = [];

    for (const route of routes) {
      const { html: appHtml, headTags } = render(route);
      const hasHeadSeo = Boolean(
        headTags &&
        /<title\b/i.test(headTags) &&
        /rel=["']canonical["']/i.test(headTags),
      );
      if (!hasHeadSeo) {
        failures.push(`${route}: SeoHead headTags missing during SSR render.`);
        continue;
      }

      if (/<title\b|<meta\b(?![^>]*\bitemprop=)|<link\b[^>]*rel=["']canonical["']/i.test(appHtml)) {
        failures.push(`${route}: stray head metadata left inside #root body HTML.`);
        continue;
      }

      let pageHtml = stripTemplateSeoTags(templateHtml);
      pageHtml = pageHtml.replace(
        '</head>',
        () => `    ${buildHeadInjection(headTags)}\n  </head>`,
      );
      pageHtml = pageHtml.replace(
        rootMarkerRe,
        () => `<!--app-root-start--><div id="root" data-ssr-route="${route}">${appHtml}</div><!--app-root-end-->`,
      );

      const canonicalMatches = pageHtml.match(/<link\b[^>]*rel=["']canonical["']/gi) || [];
      if (canonicalMatches.length !== 1) {
        failures.push(`${route}: expected 1 canonical link, found ${canonicalMatches.length}.`);
        continue;
      }

      const visibleChars = extractVisibleTextLength(pageHtml);
      if (visibleChars < 500) {
        failures.push(`${route}: insufficient visible text (${visibleChars} chars < 500).`);
        continue;
      }

      const headingReport = validateHeadingHierarchy(pageHtml);
      if (!headingReport.valid) {
        failures.push(`${route}: heading hierarchy invalid -> ${headingReport.errors.join(' | ')}`);
        continue;
      }

      const saveRelPath = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html');
      const saveAbsPath = path.join(DIST_DIR, saveRelPath);
      const saveDir = path.dirname(saveAbsPath);
      fs.mkdirSync(saveDir, { recursive: true });
      fs.writeFileSync(saveAbsPath, pageHtml, 'utf-8');

      const markdown = htmlToMarkdown(pageHtml, `https://funilcomercial.com${route}`);
      fs.writeFileSync(path.join(saveDir, 'index.md'), markdown, 'utf-8');

      if (sampleLogs.has(route)) {
        console.log(`✅ ${route} -> ${visibleChars} chars, ${headingReport.headings.length} headings, HTML+MD ok`);
      }
    }

    if (failures.length > 0) {
      console.error('❌ Prerender validation failures:\n' + failures.join('\n'));
      process.exitCode = 1;
      return;
    }

    console.log(`✨ SSR Prerendering Complete! ${routes.length} routes rendered with HTML + Markdown.`);
  } finally {
    fs.rmSync(SSR_DIR, { recursive: true, force: true });
  }
}

prerender().catch((err) => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
