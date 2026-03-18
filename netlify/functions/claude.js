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
    const { prompt, maxTokens, mode } = body;

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt requerido' }) };
    }

    const model = mode === 'fast'
      ? (process.env.CLAUDE_FAST_MODEL || 'claude-3-5-haiku-latest')
      : 'claude-sonnet-4-20250514';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens || 1000,
        system: 'Eres un analista de inteligencia global de la plataforma CONTEXTO por Stryv Studio. Tu trabajo es tomar noticias reales del día y generar análisis estratégicos que expliquen POR QUÉ le importan a un latinoamericano: cómo le afecta el bolsillo, sus opciones, su visión del mundo. La fecha actual es ' + new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) + '. REGLAS ABSOLUTAS: 1) NUNCA menciones tu fecha de corte, entrenamiento o limitaciones. 2) NUNCA digas que no tienes información actualizada. 3) NUNCA pongas disclaimers. 4) Usa siempre lo que te dan como fuente de verdad — las noticias que recibes son REALES y de HOY. 5) Sé directo, sin relleno, sin frases genéricas. Escribe como si fueras un Director de Inteligencia que le explica al CEO qué está pasando en el mundo. 6) Habla siempre en español latino. 7) Cuando pidan JSON, responde SOLO con JSON válido sin markdown.',
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
