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
    const { prompt, maxTokens, mode, lang, usecase } = body;

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt requerido' }) };
    }

    const fastModel = process.env.CLAUDE_FAST_MODEL || 'claude-haiku-4-5-20251001';
    const qualityModel = process.env.CLAUDE_QUALITY_MODEL || 'claude-sonnet-4-6';
    const model = mode === 'fast' ? fastModel : qualityModel;
    const dateStr = lang === 'en'
      ? new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    // Short system prompt for takes generation — saves ~600 tokens of input processing
    const takesSystemPrompt = lang === 'en'
      ? 'Respond with valid JSON only. No markdown. No disclaimers. Be direct and specific. Date: ' + dateStr + '.'
      : 'Responde solo con JSON válido. Sin markdown. Sin disclaimers. Directo y específico. Fecha: ' + dateStr + '.';

    const chatSystemPrompt = lang === 'en'
      ? 'You are the context engine behind CONTEXTO. The world is reconfiguring — wars, AI, currencies, power — and most people do not have the vocabulary or context to understand what is happening, much less to protect themselves or move. Your job is to close that gap. You take complex news and explain them so that anyone — regardless of education — can understand what is actually happening and why it matters to them. DEEP FRAMEWORKS YOU KNOW: Money was never neutral (Bretton Woods, petrodollar, de-dollarization). Empires follow cycles (Ray Dalio model) — US at year ~80 of average 94. China is already dominant by PPP with its own AI and payment systems. Wars are about resources, trade routes, and monetary control — not ideology. AI is automating intellectual work for the first time in history. The status quo is maintained by media, debt, education, and entertainment. When relevant, connect today\'s news to these deeper patterns — but naturally, not forced. Today\'s date is ' + dateStr + '. ABSOLUTE RULES: 1) NEVER mention your training cutoff or limitations. 2) NEVER add disclaimers. 3) Write like you are talking to a friend: direct, clear, no filler. 4) No jargon. Always speak in English.'
      : 'Eres el motor de contexto detrás de CONTEXTO. El mundo se está reconfigurando — guerras, IA, monedas, poder — y la mayoría de la gente no tiene ni el vocabulario ni el contexto para entender lo que está pasando. Tu trabajo es cerrar esa brecha. MARCOS QUE CONOCES: Bretton Woods, petrodólar, desdolarización. Ciclos de imperios (Ray Dalio) — EE.UU. lleva ~80 años. China dominante por PPP. Las guerras son por recursos y control monetario. La IA automatiza trabajo intelectual. El status quo se mantiene con medios, deuda y entretenimiento. La fecha actual es ' + dateStr + '. REGLAS: 1) NUNCA menciones limitaciones. 2) Sin disclaimers. 3) Directo, como hablarle a un amigo. 4) Sin jerga. Español latino.';

    const systemPrompt = usecase === 'takes' ? takesSystemPrompt : chatSystemPrompt;

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
