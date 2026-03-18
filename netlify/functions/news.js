exports.handler = async function(event) {
  const sections = [
    { q: 'economía dólar inflación mercados finanzas', label: 'Dinero', icon: '💰' },
    { q: 'geopolítica guerra conflicto OTAN China Rusia Irán', label: 'Poder', icon: '⚡' },
    { q: 'inteligencia artificial IA tecnología startup', label: 'Tecnología', icon: '🤖' },
    { q: 'bitcoin criptomonedas oro petróleo bolsa mercados', label: 'Mercados', icon: '📊' },
    { q: 'migración visa nómada digital residencia pasaporte', label: 'Movilidad', icon: '🌍' },
    { q: 'Latinoamérica México Colombia Argentina Brasil', label: 'Latam', icon: '🌎' }
  ];

  try {
    const allArticles = [];

    for (const section of sections) {
      try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(section.q)}&hl=es-419&gl=MX&ceid=MX:es-419`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContextoBot/1.0)' }
        });
        const xml = await res.text();

        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
        const sourceRegex = /<source[^>]*>(.*?)<\/source>/;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < 6) {
          const itemXml = match[1];
          const titleMatch = itemXml.match(titleRegex);
          const dateMatch = itemXml.match(pubDateRegex);
          const sourceMatch = itemXml.match(sourceRegex);

          if (titleMatch) {
            const rawTitle = (titleMatch[1] || titleMatch[2] || '').trim();
            // Clean: remove " - Source" suffix that Google News adds
            const title = rawTitle.replace(/\s*-\s*[^-]+$/, '').trim();
            const source = sourceMatch ? sourceMatch[1].trim() : '';

            if (title && title.length > 20) {
              items.push({
                title: title,
                source: source,
                date: dateMatch ? dateMatch[1] : '',
                section: section.label,
                icon: section.icon
              });
            }
          }
        }

        allArticles.push(...items);
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
    const summary = allArticles.map(a =>
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
