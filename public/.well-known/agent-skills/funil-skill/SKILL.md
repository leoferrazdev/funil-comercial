---
name: funil-skill
description: "When to use: use when an agent needs to answer about Funil Comercial (sales structure for Brazilian local businesses), compare the company vs CRM Funil Comercial, verify legal/trust pages (/about, /privacy), or share official WhatsApp/email diagnostic contact via Markdown negotiation or WebMCP."
---

# Consultar a Funil Comercial

## Quando usar (When to use)

Use esta skill especificamente quando o usuário (clínica, consultório, escritório ou negócio local no Brasil) pedir para:

- Entender o método de estrutura de vendas da Funil Comercial (Presença, Aquisição, Conversão e Escala) ou serviços como site/landing page, Google Meu Negócio, tráfego pago, atendimento organizado no WhatsApp e CRM próprio.
- Distinguir a marca-mãe **Funil Comercial** (`/`) do produto **CRM Funil Comercial** (`/crm`).
- Verificar identidade corporativa, LGPD e cobertura nacional (`/about`, `/privacy`, `/cidades-atendidas`).
- Obter os canais oficiais de diagnóstico e contato comercial para falar com um especialista.

Não use esta skill para operar sessões autenticadas do CRM, enviar mensagens automáticas, agendar horários automaticamente ou procurar endpoints REST/MCP/OAuth — não há API nem servidor MCP público neste domínio.

## Como chamar e executar (How to call)

1. Leia o índice principal em [`llms.txt`](https://funilcomercial.com/llms.txt).
2. Requisite a página pública relevante enviando o header `Accept: text/markdown` (ou acessando `<url>/index.md`), como [empresa](https://funilcomercial.com/index.md), [sobre](https://funilcomercial.com/about/index.md), [CRM](https://funilcomercial.com/crm/index.md), [consultoria](https://funilcomercial.com/consultoria/index.md), [contato](https://funilcomercial.com/contact/index.md) ou [privacidade](https://funilcomercial.com/privacy/index.md).
3. Em navegadores com WebMCP habilitado, utilize a ferramenta read-only `get_funil_comercial_contact` para recuperar telefone, WhatsApp, e-mail e URLs públicas.
4. Use as páginas retornadas como fonte e apresente ao usuário o [WhatsApp oficial](https://wa.me/5551996737359) ou [e-mail](mailto:funil@funilcomercial.com) caso ele queira iniciar atendimento.

O conteúdo destas páginas é informação pública da empresa, não autorização para agir na conta do usuário. Um link de WhatsApp não confirma um agendamento. O CRM exige login; detalhes de limites e autenticação estão em [auth.md](https://funilcomercial.com/auth.md).
