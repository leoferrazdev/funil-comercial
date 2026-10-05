import { createClient } from "npm:@supabase/supabase-js";

// CORS Headers for edge functions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Response helpers
const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const SYSTEM_PROMPT = `
Você é o Leonardo, Diretor Estratégico da Funil Comercial.
Sua missão é atender leads B2B que chegam pelo SEO orgânico (ex: advogados, dentistas, nutricionistas) interessados em nossa solução de Captação de Clientes e CRM.

REGRAS DE OURO:
1. Nunca seja robótico. Fale como um brasileiro de alto nível no WhatsApp: use respostas curtas, quebre linhas, evite blocos gigantes de texto.
2. Prove autoridade no nicho da pessoa. Se for um Nutricionista, cite a dificuldade de "vender plano de acompanhamento ao invés de consulta avulsa". Se for Advogado, cite "regras da OAB e captação qualificada".
3. Não dê preços na primeira mensagem. O objetivo é qualificar a dor e o momento do lead.
4. O Call to Action final deve ser SEMPRE puxar para uma reunião de diagnóstico (Call) via Google Meet ou Zoom de 30 minutos.
5. Se o cliente perguntar o preço repetidamente, diga que a implementação depende do cenário atual dele (se precisa de tráfego, CRM, etc) e puxe para a call.

FLUXO DA CONVERSA:
- Saudação rápida + validação da dor do nicho (se ele informou o nicho).
- Pergunta qualificadora curta (ex: "Quantos clientes novos você consegue fechar por mês hoje?").
- Convite para o Diagnóstico Gratuito de 30min quando ele demonstrar interesse.
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validar Payload do Webhook do Supabase
    const payload = await req.json();
    
    // Garantir que seja um insert na tabela inbox_messages
    if (payload.type !== "INSERT" || payload.table !== "inbox_messages") {
      return jsonResponse({ error: "Ignorado. Nao e um insert na inbox_messages." }, 400);
    }

    const newMessage = payload.record;

    // 2. Só responder se a mensagem for de INBOUND (do lead para nós)
    if (newMessage.direction !== "inbound") {
      return jsonResponse({ message: "Mensagem outbound ignorada." });
    }

    // Só processar mensagens de texto
    if (newMessage.message_type !== "text") {
      return jsonResponse({ message: "Apenas mensagens de texto sao suportadas pela IA atualmente." });
    }

    // Inicializar Supabase Client (usando service role para bypass de RLS interno)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Buscar Histórico da Conversa (últimas 10 mensagens)
    const { data: historyData, error: historyError } = await supabase
      .from("inbox_messages")
      .select("direction, message, message_type")
      .eq("owner_id", newMessage.owner_id)
      .eq("telefone", newMessage.telefone)
      .order("created_at", { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    // Formatar histórico para a OpenAI (inverter para ordem cronológica)
    const messagesForAi = historyData
      .reverse()
      .filter((msg) => msg.message_type === "text" && msg.message)
      .map((msg) => ({
        role: msg.direction === "inbound" ? "user" : "assistant",
        content: msg.message,
      }));

    // Se o bot já enviou a última mensagem e o usuário não respondeu, ignorar (safety)
    // Mas neste caso foi ativado por um inbound, então o último é o user.

    // 4. Chamar a OpenAI
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      throw new Error("OPENAI_API_KEY nao configurada no Supabase.");
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${openAiKey}\`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messagesForAi,
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!openAiResponse.ok) {
      const err = await openAiResponse.text();
      throw new Error(\`OpenAI API error: \${err}\`);
    }

    const aiResult = await openAiResponse.json();
    const botReply = aiResult.choices[0].message.content;

    // 5. Enviar a resposta via whatsapp-send (Edge Function interna)
    // Invocar a função whatsapp-send com o token JWT de serviço
    const { data: sendData, error: sendError } = await supabase.functions.invoke("whatsapp-send", {
      body: {
        ownerId: newMessage.owner_id,
        to: newMessage.telefone,
        type: "text",
        text: botReply,
      },
    });

    if (sendError) {
      console.error("Erro ao enviar mensagem via whatsapp-send:", sendError);
      throw sendError;
    }

    return jsonResponse({
      ok: true,
      message: "Resposta da IA enviada com sucesso.",
      botReply,
    });
  } catch (error: any) {
    console.error("Erro no ai-whatsapp-sdr:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});
