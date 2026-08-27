const fs = require('fs');
let code = fs.readFileSync('src/pages/LocalCityLanding.tsx', 'utf8');

// 1. Update import
code = code.replace(
  'import { trackEvent } from "../lib/analytics";',
  'import { trackWhatsappClick } from "../lib/analytics";'
);

// 2. Replace the onClick tracking
const oldOnClick = 'onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}';
const newOnClick = 'onClick={(e) => { trackWhatsappClick({ origem: "seo_local", nicho: nicho || "geral", estado: estado || "br", cidade: cidade || "geral" }); }}';

// Replace all occurrences
code = code.split(oldOnClick).join(newOnClick);

fs.writeFileSync('src/pages/LocalCityLanding.tsx', code);
console.log('LocalCityLanding.tsx updated with advanced tracking');
