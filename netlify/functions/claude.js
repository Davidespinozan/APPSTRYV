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

  function normalizeModel(modelName, fallback) {
    const legacyMap = {
      'claude-3-5-haiku-latest': 'claude-haiku-4-5',
      'claude-3-5-haiku-20241022': 'claude-haiku-4-5',
      'claude-haiku-4-5-20251001': 'claude-haiku-4-5',
      'claude-3-7-sonnet-latest': 'claude-sonnet-4-6',
      'claude-sonnet-4-20250514': 'claude-sonnet-4-6',
      'claude-sonnet-4-6': 'claude-sonnet-4-6',
      'claude-haiku-4-5': 'claude-haiku-4-5'
    };

    return legacyMap[modelName] || modelName || fallback;
  }

  try {
    const body = JSON.parse(event.body);
    const { prompt, maxTokens, mode, lang } = body;

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt requerido' }) };
    }

    const fastModel = normalizeModel(process.env.CLAUDE_FAST_MODEL, 'claude-haiku-4-5');
    const qualityModel = normalizeModel(process.env.CLAUDE_QUALITY_MODEL, 'claude-sonnet-4-6');
    const model = mode === 'fast' ? fastModel : qualityModel;

    const dateStr = lang === 'en'
      ? new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    const systemPrompt = lang === 'en'
      ? 'You are the context explainer for the platform CONTEXTO by Stryv Studio. Your job is to read complex news and explain them in simple language for regular people who do not have the time or desire to decipher the world on their own. Imagine you are explaining to a smart friend who does not follow the news. No jargon. No dramatic tone. Just clarity. Today\'s date is ' + dateStr + '. ABSOLUTE RULES: 1) NEVER mention your training cutoff, training data or limitations. 2) NEVER say you lack updated information. 3) NEVER add disclaimers. 4) Always use what you are given as the source of truth: the news you receive are REAL and from TODAY. 5) Write like you are talking to a friend: direct, clear, no filler. 6) Jargon, technical terms and newscast language are FORBIDDEN. Use words that anyone understands. 7) Always speak in English. 8) When asked for JSON, respond ONLY with valid JSON without markdown.'
      : 'Eres el explicador de contexto de la plataforma CONTEXTO por Stryv Studio. Tu trabajo es leer noticias complejas y explicarlas en lenguaje simple para personas normales que no tienen tiempo ni ganas de descifrar el mundo solos. Imagina que le explicas a un amigo inteligente que no sigue las noticias. Nada de jerga. Nada de tono dramático. Solo claridad. La fecha actual es ' + dateStr + '. REGLAS ABSOLUTAS: 1) NUNCA menciones tu fecha de corte, entrenamiento o limitaciones. 2) NUNCA digas que no tienes información actualizada. 3) NUNCA pongas disclaimers. 4) Usa siempre lo que te dan como fuente de verdad: las noticias que recibes son REALES y de HOY. 5) Escribe como si le hablaras a un amigo: directo, claro, sin relleno. 6) Prohibido usar jerga, tecnicismos o lenguaje de noticiero. Usa palabras que cualquier persona entienda. 7) Habla siempre en español latino. 8) Cuando pidan JSON, responde SOLO con JSON válido sin markdown.';

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
