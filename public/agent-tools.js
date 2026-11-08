// WebMCP é experimental. A ferramenta expõe apenas dados públicos da empresa.
(() => {
  const modelContext = document.modelContext || navigator.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') return;
  const tool = {
    name: 'get_funil_comercial_contact',
    description: 'Consultar os canais públicos da Funil Comercial para falar sobre CRM e estrutura de vendas.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: async () => ({
      content: [{ type: 'text', text: JSON.stringify({
        whatsapp: 'https://wa.me/5551996737359',
        email: 'funil@funilcomercial.com',
        contato: 'https://funilcomercial.com/contato',
        agendamento_confirmado: false,
      }) }],
    }),
  };
  try {
    // Algumas versões retornam Promise, outras retornam undefined.
    Promise.resolve(modelContext.registerTool(tool)).catch(() => {});
  } catch {
    // A indisponibilidade da API experimental não interrompe a navegação.
  }
})();
