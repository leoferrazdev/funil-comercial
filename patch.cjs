const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const ProgrammaticIntentLanding = lazy(() => import("./pages/ProgrammaticIntentLanding"));',
  'const ProgrammaticIntentLanding = lazy(() => import("./pages/ProgrammaticIntentLanding"));\nconst ProgrammaticNicheHub = lazy(() => import("./pages/ProgrammaticNicheHub"));'
);

const routesReplacement = `          <Route path="/agencia-de-marketing/:nicho" element={<ProgrammaticNicheHub />} />
          <Route path="/empresa-de-captacao/:nicho" element={<ProgrammaticNicheHub />} />
          <Route path="/melhor-crm/:nicho" element={<ProgrammaticNicheHub />} />
          <Route path="/agencia-de-marketing/:nicho/:estado/:cidade" element={<ProgrammaticIntentLanding intentType="agencia" />} />`;

code = code.replace(
  '          <Route path="/agencia-de-marketing/:nicho/:estado/:cidade" element={<ProgrammaticIntentLanding intentType="agencia" />} />',
  routesReplacement
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
