const fs = require('fs');
let code = fs.readFileSync('src/pages/ProgrammaticIntentLanding.tsx', 'utf8');

// 1. Update import
code = code.replace(
  'import { trackEvent } from "../lib/analytics";',
  'import { trackWhatsappClick } from "../lib/analytics";'
);

// 2. Replace the onClick tracking
const oldOnClick = 'onClick={(e) => { trackEvent("whatsapp_click", { method: "whatsapp" }); }}';
const newOnClick = 'onClick={(e) => { trackWhatsappClick({ origem: "seo_programatico", nicho: nicho || "geral", estado: estado || "br", cidade: cidade || "geral", intent: intentType }); }}';

// Replace all occurrences (there are 2)
code = code.split(oldOnClick).join(newOnClick);

fs.writeFileSync('src/pages/ProgrammaticIntentLanding.tsx', code);
console.log('ProgrammaticIntentLanding.tsx updated with advanced tracking');
