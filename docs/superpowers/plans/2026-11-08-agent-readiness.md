# Preparação do site para agentes de IA

**Objetivo:** corrigir os problemas verificáveis da auditoria de 08/11/2026 na hospedagem atual (Hostinger/Apache), anunciando apenas recursos implementados.

**Arquitetura:** arquivos públicos estáticos e negociação de Markdown por `.htaccess`. Páginas principais têm resumos Markdown de contingência; o prerender substitui esses resumos pelo conteúdo renderizado quando Chromium está disponível. Nenhum acesso ao CRM é concedido por estes arquivos.

- [x] Conferir screenshot, código, hospedagem e endpoints publicados.
- [x] Adicionar `Link`, tipos MIME e CORS para os manifestos públicos; impedir fallback HTML em descoberta inexistente.
- [x] Servir Markdown específico por página por `Accept: text/markdown` e por `/index.md`, preservando HTML e arquivos estáticos.
- [x] Preparar catálogo ARD e descoberta Poppy somente para conteúdo público.
- [x] Corrigir documentação e retirar declarações de OAuth/MCP/assinaturas sem implementação; atualizar a skill pública e seu digest.
- [x] Validar compilação, testes, conteúdo, artefatos e limitações da publicação. Evidências no relatório `docs/auditoria-agentes-ia-2026-11-08.md`.

**Fora do escopo executável:** DNS-AID/DNSSEC requerem acesso ao provedor DNS; OAuth de agentes e MCP requerem serviços reais, consentimento e escopos; pagamentos autônomos exigem uma operação comercial específica. Não criar endpoints fictícios para obter pontos no scanner.

**Publicação:** o push na `main` dispara deploy automático. As alterações ficam locais até a publicação. A nota final só pode ser medida com uma nova auditoria após o deploy.
