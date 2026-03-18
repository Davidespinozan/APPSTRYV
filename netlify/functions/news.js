exports.handler = async function(event) {
  const topics = [
    { q: 'economía latinoamérica dólar', label: 'Economía' },
    { q: 'geopolítica guerra conflicto mundial', label: 'Geopolítica' },
    { q: 'inteligencia artificial tecnología', label: 'Tecnología' },
    { q: 'bitcoin criptomonedas oro mercados', label: 'Mercados' },
    { q: 'migración visa pasaporte residencia', label: 'Movilidad' }
  ];

  try {
    const allHeadlines = [];

    for (const topic of topics) {
      try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic.q)}&hl=es-419&gl=MX&ceid=MX:es-419&num=5`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContextoBot/1.0)' }
        });
        const xml = await res.text();

        // Parse titles from RSS XML with regex (simple, no dependency)
        const items = [];
        const itemRegex = /<item>[\s\S]*?<\/item>/g;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < 4) {
          const itemXml = match[0];
          const titleMatch = itemXml.match(titleRegex);
          const dateMatch = itemXml.match(pubDateRegex);

          if (titleMatch) {
            const title = (titleMatch[1] || titleMatch[2] || '').trim();
            // Skip if it's just a source name or too short
            if (title && title.length > 15) {
              items.push({
                title: title,
                date: dateMatch ? dateMatch[1] : '',
                category: topic.label
              });
            }
          }
        }

        allHeadlines.push(...items);
      } catch (e) {
        // Skip failed topic, continue with others
      }
    }

    // Build a concise news summary string
    const summary = allHeadlines.map(h =>
      `[${h.category}] ${h.title}`
    ).join('\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=1800' // Cache 30 min
      },
      body: JSON.stringify({
        headlines: allHeadlines,
        summary: summary,
        fetchedAt: new Date().toISOString(),
        count: allHeadlines.length
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message, headlines: [], summary: '' })
    };
  }
};
