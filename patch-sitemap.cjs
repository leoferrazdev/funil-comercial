const fs = require('fs');
let code = fs.readFileSync('scripts/generate-sitemap.mjs', 'utf8');

const replacement = `  // 2. Local Sitemap
  let localUrls = '';
  let localRouteCount = 0;
  
  // Niche Hub Pages
  NICHES.forEach(nicho => {
    localRouteCount += 3;
    localUrls += generateUrlNode(\`/agencia-de-marketing/\${nicho}\`, '0.8', 'weekly');
    localUrls += generateUrlNode(\`/empresa-de-captacao/\${nicho}\`, '0.8', 'weekly');
    localUrls += generateUrlNode(\`/melhor-crm/\${nicho}\`, '0.8', 'weekly');
  });

  TARGET_CITIES.forEach(location => {`;

code = code.replace(
  "  // 2. Local Sitemap\n  let localUrls = '';\n  let localRouteCount = 0;\n  TARGET_CITIES.forEach(location => {",
  replacement
);

fs.writeFileSync('scripts/generate-sitemap.mjs', code);
console.log('generate-sitemap.mjs updated');
