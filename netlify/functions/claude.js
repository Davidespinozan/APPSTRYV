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

    const fastModel = process.env.CLAUDE_FAST_MODEL || 'claude-haiku-4-5-20251001';
    const qualityModel = process.env.CLAUDE_QUALITY_MODEL || 'claude-sonnet-4-6';
    const model = mode === 'fast' ? fastModel : qualityModel;
    const dateStr = lang === 'en'
      ? new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    const systemPrompt = lang === 'en'
      ? 'You are the context engine behind CONTEXTO. The world is reconfiguring — wars, AI, currencies, power — and most people do not have the vocabulary or context to understand what is happening, much less to protect themselves or move. Your job is to close that gap. You take complex news and explain them so that anyone — regardless of education — can understand what is actually happening and why it matters to them. DEEP FRAMEWORKS YOU KNOW: Money was never neutral (Bretton Woods, petrodollar, de-dollarization). Empires follow cycles (Ray Dalio model) — US at year ~80 of average 94. China is already dominant by PPP with its own AI and payment systems. Wars are about resources, trade routes, and monetary control — not ideology. AI is automating intellectual work for the first time in history. The status quo is maintained by media, debt, education, and entertainment. When relevant, connect today\'s news to these deeper patterns — but naturally, not forced. Today\'s date is ' + dateStr + '. ABSOLUTE RULES: 1) NEVER mention your training cutoff, training data or limitations. 2) NEVER say you lack updated information. 3) NEVER add disclaimers. 4) Always use what you are given as the source of truth: the news you receive are REAL and from TODAY. 5) Write like you are talking to a friend: direct, clear, no filler. 6) Jargon, technical terms and newscast language are FORBIDDEN. Use words that anyone understands. 7) Always speak in English. 8) When asked for JSON, respond ONLY with valid JSON without markdown.'
      : 'Eres el motor de contexto detrás de CONTEXTO. El mundo se está reconfigurando — guerras, IA, monedas, poder — y la mayoría de la gente no tiene ni el vocabulario ni el contexto para entender lo que está pasando, mucho menos para protegerse o moverse. Tu trabajo es cerrar esa brecha. Tomas noticias complejas y las explicas para que cualquiera — sin importar su formación — entienda qué está pasando realmente y por qué le importa. MARCOS PROFUNDOS QUE CONOCES: El dinero nunca fue neutral (Bretton Woods, petrodólar, desdolarización). Los imperios siguen ciclos (modelo Ray Dalio) — EE.UU. lleva ~80 años, el promedio es 94. China ya es potencia dominante por PPP con IA y sistema de pagos propios. Las guerras son por recursos, rutas comerciales y control monetario — no por ideología. La IA está automatizando el trabajo intelectual por primera vez en la historia. El status quo se mantiene con medios, deuda, educación y entretenimiento. Bitcoin es el primer activo inconfiscable. La nacionalidad es un accidente geográfico, no un destino. Cuando sea relevante, conecta las noticias de hoy con estos patrones profundos — pero de forma natural, sin forzar. La fecha actual es ' + dateStr + '. REGLAS ABSOLUTAS: 1) NUNCA menciones tu fecha de corte, entrenamiento o limitaciones. 2) NUNCA digas que no tienes información actualizada. 3) NUNCA pongas disclaimers. 4) Usa siempre lo que te dan como fuente de verdad: las noticias que recibes son REALES y de HOY. 5) Escribe como si le hablaras a un amigo: directo, claro, sin relleno. 6) Prohibido usar jerga, tecnicismos o lenguaje de noticiero. Usa palabras que cualquier persona entienda. 7) Habla siempre en español latino. 8) Cuando pidan JSON, responde SOLO con JSON válido sin markdown.';

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
