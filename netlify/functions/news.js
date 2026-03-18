exports.handler = async function(event) {
  const sections = [
    { queries: ['economía dólar inflación mercados finanzas', 'tasas de interés inflación dólar América Latina'], label: 'Dinero', icon: '💰' },
    { queries: ['Irán Israel Estados Unidos guerra', 'geopolítica guerra conflicto OTAN China Rusia Irán', 'ataque bombardeo sanciones Medio Oriente'], label: 'Poder', icon: '⚡' },
    { queries: ['inteligencia artificial IA tecnología startup', 'OpenAI Nvidia chips regulación IA'], label: 'Tecnología', icon: '🤖' },
    { queries: ['bitcoin criptomonedas oro petróleo bolsa mercados', 'Wall Street Nasdaq S&P petróleo oro'], label: 'Mercados', icon: '📊' },
    { queries: ['migración visa nómada digital residencia pasaporte', 'visa residencia ciudadanía movilidad global'], label: 'Movilidad', icon: '🌍' },
    { queries: ['Latinoamérica México Colombia Argentina Brasil', 'Latam economía política México Colombia Argentina Brasil'], label: 'Latam', icon: '🌎' }
  ];

  const urgentPatterns = [
    /iran|irán|israel|estados unidos|ee\.? ?uu\.?|trump|guerra|ataque|bombardeo|misil|hezbol[aá]|hamas|otan/i,
    /crisis|última hora|en directo|urgente|sanciones|petróleo|gas/i,
    /china|rusia|taiw[aá]n|ucrania|medio oriente|nuclear/i
  ];

  const scoreArticle = (title, source, date, sectionLabel) => {
    let score = 0;
    const text = `${title} ${source} ${sectionLabel}`;

    urgentPatterns.forEach((pattern, index) => {
      if (pattern.test(text)) {
        score += 12 - (index * 2);
      }
    });

    const publishedAt = date ? new Date(date).getTime() : 0;
    if (publishedAt) {
      const ageHours = Math.max(0, (Date.now() - publishedAt) / 3600000);
      score += Math.max(0, 12 - Math.min(ageHours, 12));
    }

    return score;
  };

  const parseFeed = (xml, section) => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    const sourceRegex = /<source[^>]*>(.*?)<\/source>/;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(titleRegex);
      const dateMatch = itemXml.match(pubDateRegex);
      const sourceMatch = itemXml.match(sourceRegex);

      if (!titleMatch) continue;

      const rawTitle = (titleMatch[1] || titleMatch[2] || '').trim();
      const title = rawTitle.replace(/\s*-\s*[^-]+$/, '').trim();
      const source = sourceMatch ? sourceMatch[1].trim() : '';
      const date = dateMatch ? dateMatch[1] : '';

      if (!title || title.length <= 20) continue;

      items.push({
        title,
        source,
        date,
        section: section.label,
        icon: section.icon,
        score: scoreArticle(title, source, date, section.label)
      });
    }

    return items;
  };

  try {
    const allArticles = [];

    for (const section of sections) {
      try {
        const sectionResults = [];

        for (const query of section.queries) {
          const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=MX&ceid=MX:es-419`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContextoBot/1.0)' }
          });
          const xml = await res.text();
          sectionResults.push(...parseFeed(xml, section));
        }

        const deduped = [];
        const seen = new Set();

        for (const article of sectionResults.sort((a, b) => b.score - a.score)) {
          const key = article.title.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(article);
          if (deduped.length === 6) break;
        }

        allArticles.push(...deduped);
      } catch (e) {
        // Skip failed section
      }
    }

    // Build structured output
    const bySections = {};
    for (const article of allArticles) {
      if (!bySections[article.section]) {
        bySections[article.section] = { icon: article.icon, articles: [] };
      }
      bySections[article.section].articles.push(article);
    }

    // Build flat summary for Claude context
    const summary = allArticles
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(a =>
      `[${a.section}] ${a.title} (${a.source})`
    ).join('\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=900' // 15 min cache
      },
      body: JSON.stringify({
        sections: bySections,
        articles: allArticles,
        summary: summary,
        fetchedAt: new Date().toISOString(),
        count: allArticles.length
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message, sections: {}, articles: [], summary: '' })
    };
  }
};
