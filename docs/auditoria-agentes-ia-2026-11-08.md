# Preparação do Funil Comercial para agentes de IA

Data: 08/11/2026. Site avaliado: https://funilcomercial.com/.

## Diagnóstico

A captura anexada registra **63/100, nível 2 — Bot-Aware**. O site estava parcialmente preparado para descoberta, mas a nota superestimava as integrações: arquivos públicos anunciavam endpoints sem implementação.

A conferência HTTP do site publicado mostrou:

- Home sem cabeçalho `Link`; `Accept: text/markdown` ainda retornava HTML.
- `/.well-known/api-catalog` anunciava `/api/openapi.yaml` e `/api/health`, ambos com HTTP 404.
- O cartão MCP anunciava `/mcp`, que retornava HTML da SPA.
- Os metadados OAuth anunciavam autorização, token e registro de agentes cujas URLs também retornavam HTML da SPA.
- Os arquivos de skill e autenticação continham exemplos genéricos.
- Os manifestos ARD e Poppy inexistentes recebiam o fallback HTML com HTTP 200.
- O registro SVCB `_index._agents.funilcomercial.com` não existia. Os nameservers consultados eram `ns1.dns-parking.com` e `ns2.dns-parking.com`.

Esses resultados distinguem descoberta de metadados de capacidade de executar tarefas. A presença de um arquivo não comprova que sua API funciona.

## Melhorias implementadas no projeto

| Item | Alteração |
| --- | --- |
| Descoberta HTTP | Cabeçalhos `Link` apontam para índices e manifestos realmente publicados pelo build. Configuração aplicada no `.htaccess` usado pela Hostinger. |
| Markdown | Conteúdo específico para 26 páginas públicas gerado durante o prerender; acesso por `Accept: text/markdown` ou `/index.md`. |
| Contingência do build | Home, CRM, consultoria e contato têm resumos Markdown estáticos mesmo sem Chromium. As páginas HTML continuam acessíveis nesse cenário. |
| Formatos e cache | Markdown com UTF-8, `Vary: Accept`, tipos JSON corretos e CORS nos manifestos públicos; script WebMCP sem cache imutável. |
| ARD | Catálogo válido em `/.well-known/ai-catalog.json` e `/.well-known/ard.json`, contendo somente documentação e skill reais. |
| Poppy | Manifesto na versão de draft 0.4, anunciando apenas navegação pública. Sem sessões, emissor ou autenticação delegada. |
| Acesso | `auth.md` explica os limites reais. Metadados do site público não anunciam emissor OAuth nem escopos fictícios. |
| Skill | Guia de consulta dos serviços e contatos, com SHA-256 calculado no build. As duas cópias de `llms.txt` usam a mesma fonte. |
| WebMCP | Registro com a assinatura atual e detecção de suporte. A ferramenta consulta canais públicos de contato; não envia mensagens nem confirma agendamentos. |
| Política de conteúdo | `ai-input=yes` permite consultas e respostas por IA; `ai-train=no` foi preservado. Exceções permitem `/crm/` e `/crm/index.md`, antes bloqueados por `/crm/*`. |
| Respostas inexistentes | URLs de descoberta ausentes e declarações retiradas recebem 404 em Apache, evitando falsos resultados positivos pelo HTML da SPA. |
| Adaptadores alternativos | Vercel e Netlify deixam de devolver o índice genérico para qualquer URL. O helper respeita páginas, preferências de formato e respostas comprimidas. Sem deploy nesses provedores. |

Foram retiradas declarações de API pública, servidor OAuth, servidor MCP e assinatura de requisições que o código não implementa. Isso pode reduzir alguns indicadores antes verdes no scanner; a nova configuração descreve a capacidade real do site.

## Limites que permanecem

- **DNS-AID/DNSSEC:** dependem de configuração e validação no provedor DNS, sem conexão disponível nesta tarefa. Não foram criados registros para serviços inexistentes.
- **OAuth e cadastro de agentes:** exigem uma integração real, com consentimento, escopos, registro e revogação. O login atual do CRM continua separado dessa possibilidade.
- **MCP:** exige um servidor, ferramentas e controle de acesso reais. O arquivo de descoberta isolado não oferece essa funcionalidade.
- **Pagamentos por agentes:** x402, MPP, UCP e ACP não foram implementados. A própria captura os considera opcionais, sem efeito na nota deste site.
- **Diretório de cidades:** o componente tenta renderizar 467.964 links (5.571 localidades × 14 nichos × 6 links). Ele foi excluído apenas do prerender para não travar o Chromium e impedir as páginas seguintes. Sua renderização interativa continua pesada e requer um trabalho próprio de paginação ou navegação progressiva.
- **Cobertura Markdown:** páginas programáticas em massa não ganharam automaticamente versões Markdown. As 26 páginas verificadas são as rotas principais elegíveis; quatro têm contingência estática.

## Validação

- 42 testes existentes passaram.
- 6 testes de agentes passaram, incluindo extração do conteúdo, negociação, preservação de JSON/rotas privadas, resposta gzip real e WebMCP opcional.
- Typecheck passou.
- Build Vite passou; o prerender gerou 26 páginas com Markdown e fonte correspondente.
- As 18 verificações de rotas passaram em uma porta de preview isolada.
- 32 verificações HTTP passaram em Apache 2.4.70, tanto com a contingência sem prerender quanto com o artefato compilado. Verificam HTML, Markdown, UTF-8, `Vary`, `Link`, HEAD, recusa `q=0`, JSON, CORS, 404, cache e digest da skill.
- Os catálogos passaram pelos schemas oficiais de AI Catalog e ARD.
- Revisão independente corrigiu fallback de diretórios, charset, cache, compressão e bloqueio do Markdown do CRM no `robots.txt`.

O comando inicial de build foi interrompido durante a limpeza muito lenta de uma árvore antiga de arquivos gerados. A compilação foi repetida com `emptyOutDir: false`, preservando essa árvore local. A geração programática em massa, cujo código não foi alterado, também foi interrompida por custo de I/O. Sua integração com o novo HTML foi verificada em uma cópia temporária com amostra de duas cidades e os 14 nichos, em vez de regenerar integralmente as 77.994 páginas. Portanto, não foi concluído um `npm run check` integral nesta pasta. O processo padrão do projeto permanece com limpeza e geração completas habilitadas.

O servidor Apache temporário foi encerrado. A revisão automática do ambiente rejeitou a exclusão recursiva dos artefatos de teste com a indicação de bloqueio por política, sem motivo específico. Eles permanecem em `C:\Windows\Temp\funil-agent-qa-20261108`, inclusive a geração em massa interrompida. Os arquivos do projeto ficam separados desse diretório.

## Publicação e nova medição

Este relatório registra a validação local anterior à publicação. O projeto publica automaticamente quando a `main` é enviada ao remoto. A conclusão do deploy e uma nova nota de produção exigem conferência posterior no site publicado.

Depois de publicar, validar a hospedagem real:

```powershell
npm run agents:smoke -- https://funilcomercial.com
```

Em seguida, repetir a análise no [Is It Agent Ready](https://isitagentready.com/). A nota nova só pode ser informada após essa medição. A aprovação nesses testes não comprova vendas, tráfego ou posições em respostas de IA.

## Referências técnicas utilizadas

- [Link HTTP — RFC 8288](https://www.rfc-editor.org/rfc/rfc8288)
- [Markdown e charset — RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.html#section-2)
- [Metadados de recursos OAuth — RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)
- [Especificação ARD](https://agenticresourcediscovery.org/spec/)
- [Schema de AI Catalog](https://github.com/ards-project/ard-spec/blob/main/spec/schemas/ai-catalog.schema.json)
- [Poppy — draft 0.4](https://personalagentprotocol.org/docs/0.4/spec)
- [WebMCP — draft atual](https://webmachinelearning.github.io/webmcp/)
- [Content Signals — Cloudflare](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)
