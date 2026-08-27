---
title: Fluxo de Pré-qualificação Inbound
date: 2026-08-27
tags:
  - funil-comercial
  - crm
  - whatsapp
  - pré-qualificação
aliases:
  - Roteiro de Pré-qualificação
  - Mensagens Inbound
status: conteúdo aprovado para futuro roadmap
---

# Fluxo de Pré-qualificação Inbound

> [!abstract] Objetivo
> Servir como roteiro de conteúdo para a futura automação de pré-qualificação de novas mensagens recebidas pelo WhatsApp da Funil Comercial.

> [!warning] Escopo atual
> Esta nota documenta somente as mensagens e as regras de conversa. A automação, o armazenamento das respostas e o código ficam para um roadmap posterior.

## Contexto

O fluxo deve receber novos contatos com uma abordagem curta, humana e consultiva. O objetivo é entender o negócio, sua presença pública, a autoridade de decisão da pessoa e o resultado comercial prioritário antes de avançar para um diagnóstico.

O roteiro segue o posicionamento da Funil Comercial como empresa de estrutura de vendas para negócios locais e se relaciona às quatro camadas: [[4. Marketing e Growth/Linha_Editorial_Funil_Comercial|Presença, Aquisição, Conversão e Escala]].

## Fluxo-base de mensagens

### Abertura

> Olá! Obrigado por entrar em contato com a Funil Comercial.
>
> Vou fazer algumas perguntas rápidas para entender o seu negócio e direcionar melhor o diagnóstico. Pode responder uma por vez, combinado?

### 1. Nome do negócio

> Para começar, qual é o nome do negócio que você deseja divulgar?
>
> Se for um profissional autônomo, pode enviar o nome profissional ou comercial.

### 2. Presença pública

> Obrigado! Para eu conhecer a presença atual do negócio, envie os links públicos que você tiver: site, Instagram, Facebook ou Perfil da Empresa no Google/Google Maps.
>
> Se não tiver algum deles, pode escrever “não tenho”.

### 3. Relação com o negócio

> Você é proprietário(a) ou responsável pelas decisões de marketing, divulgação e vendas desse negócio?
>
> Pode responder: proprietário(a), responsável, equipe/agência ou outro.

### 4. Objetivo principal

> Qual é o principal resultado que você deseja alcançar agora?
>
> 1. Atrair mais clientes ou projetos
> 2. Aparecer melhor no Google e ser encontrado
> 3. Organizar o WhatsApp e o acompanhamento dos contatos
> 4. Melhorar a conversão e fechar mais oportunidades
> 5. Outro objetivo

### Encerramento da pré-qualificação

> Obrigado pelas informações. Agora já temos uma visão inicial do seu negócio e do principal objetivo.
>
> Vamos organizar esse cenário para identificar qual parte da estrutura de vendas merece atenção primeiro: Presença, Aquisição, Conversão ou Escala.

## Aplicação ao caso FormaPEC

Quando o lead responder que deseja **atrair mais projetos**, usar a pergunta de aprofundamento abaixo:

> Entendi. Então o foco principal é atrair mais projetos.
>
> Para direcionar melhor o diagnóstico: vocês querem priorizar projetos residenciais, comerciais ou obras corporativas?

Após essa resposta, investigar o perfil de cliente desejado, a origem atual dos contatos e o tipo de projeto com maior interesse comercial.

## Regras de conversa

- Se o lead já informar o nome do negócio, não repetir a primeira pergunta.
- Se o lead já enviar site ou perfis públicos, confirmar o recebimento e não pedir os mesmos links novamente.
- Se responder às quatro perguntas em uma única mensagem, apenas organizar e confirmar os dados.
- Aceitar “não tenho” sem julgamento ou pressão.
- Não exigir CNPJ nas quatro perguntas iniciais; usar esse dado apenas como enriquecimento interno quando necessário.
- Se a pessoa pedir atendimento humano, interromper a pré-qualificação e encaminhar para atendimento.
- Se a pessoa não for responsável pela decisão, identificar quem participa da decisão e qual é a melhor forma de envolver essa pessoa.
- Não apresentar preço, promessa de resultado ou solução fechada antes do diagnóstico.

## Dados esperados após a conversa

- Nome do negócio
- Site e perfis públicos disponíveis
- Relação da pessoa com o negócio
- Objetivo comercial principal
- Segmento ou tipo de projeto prioritário, quando aplicável
- Origem atual dos contatos
- Principal camada suspeita: Presença, Aquisição, Conversão ou Escala

## Roadmap posterior

Quando a automação for implementada, definir separadamente:

- gatilho para iniciar o fluxo;
- estado atual da conversa;
- armazenamento das respostas;
- detecção de respostas já fornecidas;
- pausa por intervenção humana;
- tratamento de “não tenho”, respostas ambíguas e opt-out;
- envio por texto livre ou template conforme o canal WhatsApp ativo;
- encaminhamento para o Inbox após a pré-qualificação.

Ver também: [[01 - Requisitos]], [[02 - Arquitetura e Design]] e [[04 - Roadmap]].
