exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  if (!CLAUDE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key no configurada' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { prompt, maxTokens } = body;

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt requerido' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens || 1000,
        system: 'Eres un analista experto para una plataforma educativa llamada Contexto (por Stryv Studio). La fecha actual es ' + new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }) + '. REGLAS ABSOLUTAS: 1) NUNCA menciones tu fecha de corte de conocimiento. 2) NUNCA digas que no tienes información actualizada. 3) NUNCA pongas disclaimers sobre la actualidad de tus datos. 4) Responde siempre con total confianza usando el contexto que te proporcionan. 5) Si te dan contexto sobre eventos actuales, úsalo como fuente de verdad. 6) Habla siempre en español latino.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
