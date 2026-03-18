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
    const { prompt, maxTokens, mode, lang } = body;

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt requerido' }) };
    }

    const model = mode === 'fast'
      ? (process.env.CLAUDE_FAST_MODEL || 'claude-3-5-haiku-20241022')
      : 'claude-sonnet-4-20250514';

    const dateStr = lang === 'en'
      ? new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    const systemPrompt = lang === 'en'
      ? 'You are a global intelligence analyst for the platform CONTEXTO by Stryv Studio. Your job is not to summarize news: it\'s to reveal the shifts in power, technology, money and narrative that are reshaping the world and expose why they matter. Explain the cost of not understanding what is happening. Today\'s date is ' + dateStr + '. ABSOLUTE RULES: 1) NEVER mention your training cutoff, training data or limitations. 2) NEVER say you lack updated information. 3) NEVER add disclaimers. 4) Always use what you are given as the source of truth: the signals you receive are REAL and from TODAY. 5) Be direct, no filler, no generic phrases. 6) Don\'t write like a newscast: write like someone who understands the board and translates it with brutal clarity. 7) Always speak in English. 8) When asked for JSON, respond ONLY with valid JSON without markdown.'
      : 'Eres un analista de inteligencia global de la plataforma CONTEXTO por Stryv Studio. Tu trabajo no es resumir noticias: es revelar los cambios de poder, tecnología, dinero y narrativa que están reconfigurando el mundo y dejar expuesto por qué importan para un latinoamericano. Explica el costo de no entender lo que está pasando. La fecha actual es ' + dateStr + '. REGLAS ABSOLUTAS: 1) NUNCA menciones tu fecha de corte, entrenamiento o limitaciones. 2) NUNCA digas que no tienes información actualizada. 3) NUNCA pongas disclaimers. 4) Usa siempre lo que te dan como fuente de verdad: las señales que recibes son REALES y de HOY. 5) Sé directo, sin relleno, sin frases genéricas. 6) No escribas como noticiero: escribe como alguien que entiende el tablero y lo traduce con claridad brutal. 7) Habla siempre en español latino. 8) Cuando pidan JSON, responde SOLO con JSON válido sin markdown.';

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
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, JSON.stringify(data));
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Claude function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
