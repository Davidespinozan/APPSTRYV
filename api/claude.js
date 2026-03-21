module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) return res.status(500).json({ error: 'API key no configurada' });

  const { prompt, maxTokens, mode, lang, usecase } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  const fastModel = process.env.CLAUDE_FAST_MODEL || 'claude-haiku-4-5-20251001';
  const qualityModel = process.env.CLAUDE_QUALITY_MODEL || 'claude-sonnet-4-6';
  const model = mode === 'fast' ? fastModel : qualityModel;

  const dateStr = lang === 'en'
    ? new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const takesSystemPrompt = lang === 'en'
    ? 'Respond with valid JSON only. No markdown. No disclaimers. Be direct and specific. Date: ' + dateStr + '.'
    : 'Responde solo con JSON válido. Sin markdown. Sin disclaimers. Directo y específico. Fecha: ' + dateStr + '.';

  const chatSystemPrompt = lang === 'en'
    ? 'You are the context engine behind CONTEXTO. The world is reconfiguring — wars, AI, currencies, power — and most people lack the vocabulary to understand it. Your job is to close that gap. FRAMEWORKS: Money was never neutral (Bretton Woods, petrodollar, de-dollarization). Empires follow cycles (Ray Dalio) — US at ~80 of avg 94. Wars are about resources and monetary control, not ideology. AI is automating intellectual work. Today: ' + dateStr + '. RULES: No disclaimers. No training cutoff mentions. Direct, like talking to a friend. No jargon. English only.'
    : 'Eres el motor de contexto de CONTEXTO. MARCOS: El dinero nunca fue neutral (Bretton Woods, petrodólar). Los imperios siguen ciclos (Ray Dalio). Las guerras son por recursos y control monetario. La IA automatiza trabajo intelectual. Hoy: ' + dateStr + '. REGLAS: Sin disclaimers. Sin mencionar limitaciones. Directo, como hablarle a un amigo. Sin jerga. Español latino.';

  const systemPrompt = usecase === 'takes' ? takesSystemPrompt : chatSystemPrompt;

  try {
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
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Claude function error:', error);
    return res.status(500).json({ error: error.message });
  }
};
