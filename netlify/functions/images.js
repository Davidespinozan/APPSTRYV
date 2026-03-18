exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!UNSPLASH_KEY) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: {} })
    };
  }

  try {
    const { queries } = JSON.parse(event.body || '{}');
    if (!queries || !Array.isArray(queries) || !queries.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'queries array required' }) };
    }

    // Limit to 10 queries per call to stay within rate limits
    const limited = queries.slice(0, 10);

    const results = {};
    const fetches = limited.map(async (q) => {
      const key = q.key || q.query;
      const query = q.query;
      if (!query) return;
      try {
        const url = 'https://api.unsplash.com/search/photos?query=' +
          encodeURIComponent(query) +
          '&per_page=' + (q.count || 8) +
          '&orientation=landscape&content_filter=high';
        const res = await fetch(url, {
          headers: { 'Authorization': 'Client-ID ' + UNSPLASH_KEY }
        });
        if (!res.ok) return;
        const data = await res.json();
        results[key] = (data.results || []).map(photo => ({
          sm: photo.urls.small,    // ~400px wide
          th: photo.urls.thumb     // ~100px wide
        }));
      } catch (e) {
        // Silently skip failed queries
      }
    });

    await Promise.all(fetches);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400'
      },
      body: JSON.stringify({ results })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error' })
    };
  }
};
