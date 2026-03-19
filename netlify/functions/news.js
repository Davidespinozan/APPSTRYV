exports.handler = async function(event) {
  // ─── SECTIONS: Google News queries (Spanish + English mix) ───
  const sections = [
    {
      queries: [
        'economía dólar inflación tasas interés',
        'deuda crisis financiera recesión banco central',
        'Fed reserva federal tipos interés economía global',
        'banco central europeo BCE política monetaria',
        'devaluación moneda emergentes economía',
        'dollar inflation economy interest rates'
      ],
      label: 'Dinero', icon: '💰'
    },
    {
      queries: [
        'Irán Israel Estados Unidos guerra ataque',
        'geopolítica OTAN China Rusia Irán nuclear',
        'Trump sanciones guerra comercial aranceles',
        'bombardeo misiles conflicto Medio Oriente Ucrania',
        'Corea del Norte Kim Jong Un nuclear',
        'espionaje ciberataque hackeo gobierno',
        'Iran Israel war attack Middle East',
        'Russia Ukraine war NATO',
        'China Taiwan military tension'
      ],
      label: 'Poder', icon: '⚡'
    },
    {
      queries: [
        'inteligencia artificial OpenAI GPT Gemini Claude',
        'Nvidia chips semiconductores regulación IA',
        'AGI artificial intelligence robot automatización',
        'Apple Google Meta Microsoft AI',
        'startup unicornio tecnología Silicon Valley',
        'artificial intelligence regulation OpenAI Anthropic',
        'robotics automation AI jobs',
        'SpaceX Elon Musk Neuralink Tesla'
      ],
      label: 'Tecnología', icon: '🤖'
    },
    {
      queries: [
        'bitcoin BTC criptomonedas ethereum crypto',
        'bitcoin precio halving ETF cripto',
        'Wall Street Nasdaq S&P bolsa acciones',
        'oro petróleo commodities mercados financieros',
        'bitcoin price crypto market',
        'ethereum solana DeFi Web3 NFT',
        'stock market rally crash correction',
        'oil gold commodity prices'
      ],
      label: 'Mercados', icon: '📊'
    },
    {
      queries: [
        'migración visa nómada digital residencia',
        'pasaporte ciudadanía movilidad global expatriado',
        'digital nomad visa remote work abroad',
        'immigration policy border visa reform'
      ],
      label: 'Movilidad', icon: '🌍'
    },
    {
      queries: [
        'Latinoamérica México Colombia Argentina Brasil política',
        'Milei AMLO Petro Lula economía Latam',
        'Venezuela Cuba Nicaragua dictadura Latinoamérica',
        'elecciones Latinoamérica democracia protesta',
        'narcotráfico cartel crimen organizado México Colombia',
        'Chile Perú Ecuador Bolivia crisis política',
        'Brasil Lula economía BRICS Mercosur'
      ],
      label: 'Latam', icon: '🌎'
    }
  ];

  // ─── DIRECT RSS FEEDS (no API key needed) ───
  const directFeeds = [
    // Crypto & Markets
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', section: 'Mercados', icon: '📊', name: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', section: 'Mercados', icon: '📊', name: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', section: 'Mercados', icon: '📊', name: 'Decrypt' },
    { url: 'https://bitcoinmagazine.com/.rss/full/', section: 'Mercados', icon: '📊', name: 'Bitcoin Magazine' },
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^DJI,BTC-USD,GC=F,CL=F&region=US&lang=en-US', section: 'Mercados', icon: '📊', name: 'Yahoo Finance' },
    // Tech / AI
    { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', section: 'Tecnología', icon: '🤖', name: 'Ars Technica' },
    { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', section: 'Tecnología', icon: '🤖', name: 'The Verge' },
    { url: 'https://techcrunch.com/feed/', section: 'Tecnología', icon: '🤖', name: 'TechCrunch' },
    { url: 'https://www.wired.com/feed/rss', section: 'Tecnología', icon: '🤖', name: 'Wired' },
    { url: 'https://feeds.feedburner.com/venturebeat/SZYF', section: 'Tecnología', icon: '🤖', name: 'VentureBeat' },
    // Geopolitics / World — expanded global coverage
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', section: 'Poder', icon: '⚡', name: 'BBC World' },
    { url: 'https://feeds.bbci.co.uk/mundo/rss.xml', section: 'Poder', icon: '⚡', name: 'BBC Mundo' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', section: 'Poder', icon: '⚡', name: 'Al Jazeera' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', section: 'Poder', icon: '⚡', name: 'NYT World' },
    { url: 'https://feeds.washingtonpost.com/rss/world', section: 'Poder', icon: '⚡', name: 'Washington Post' },
    { url: 'https://www.theguardian.com/world/rss', section: 'Poder', icon: '⚡', name: 'The Guardian' },
    { url: 'https://feeds.reuters.com/reuters/worldNews', section: 'Poder', icon: '⚡', name: 'Reuters' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Asia.xml', section: 'Poder', icon: '⚡', name: 'NYT Asia' },
    { url: 'https://www3.nhk.or.jp/nhkworld/en/news/rss.xml', section: 'Poder', icon: '⚡', name: 'NHK World' },
    // Economy / Finance
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', section: 'Dinero', icon: '💰', name: 'NYT Business' },
    { url: 'https://feeds.bloomberg.com/markets/news.rss', section: 'Dinero', icon: '💰', name: 'Bloomberg' },
    { url: 'https://www.investing.com/rss/news.rss', section: 'Dinero', icon: '💰', name: 'Investing.com' },
    { url: 'https://www.theguardian.com/business/rss', section: 'Dinero', icon: '💰', name: 'Guardian Business' },
    // Latam
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/america/portada', section: 'Latam', icon: '🌎', name: 'El País' },
    { url: 'https://rss.dw.com/xml/rss-sp-latinoamerica', section: 'Latam', icon: '🌎', name: 'DW Latam' },
    { url: 'https://www.france24.com/es/am%C3%A9rica-latina/rss', section: 'Latam', icon: '🌎', name: 'France 24' },
  ];

  const urgentPatterns = [
    /bitcoin|btc|crypto|cripto|halving|etf.*bitcoin|bitcoin.*etf/i,
    /iran|irán|israel|estados unidos|ee\.? ?uu\.?|trump|guerra|ataque|bombardeo|misil|hezbol[aá]|hamas|otan/i,
    /openai|gpt|gemini|claude|nvidia|artificial.?intelligence|inteligencia.?artificial|agi/i,
    /china|rusia|taiw[aá]n|ucrania|medio oriente|nuclear|xi.?jinping/i,
    /crisis|última hora|en directo|urgente|sanciones|petróleo|gas|recesi[oó]n/i,
    /milei|amlo|petro|lula|maduro|bukele/i
  ];

  // Max age: 48 hours. Anything older gets discarded.
  const MAX_AGE_HOURS = 48;
  const cutoffTime = Date.now() - (MAX_AGE_HOURS * 3600000);

  const isRecent = (date) => {
    if (!date) return false; // No date = suspicious, treat as old
    const ts = new Date(date).getTime();
    return ts > cutoffTime && ts <= Date.now() + 3600000; // allow 1h future for timezone drift
  };

  const scoreArticle = (title, source, date, sectionLabel) => {
    let score = 0;
    const text = `${title} ${source} ${sectionLabel}`;

    urgentPatterns.forEach((pattern, index) => {
      if (pattern.test(text)) {
        score += 15 - (index * 1.5);
      }
    });

    // Bonus for multiple pattern matches (cross-topic = more important)
    const matchCount = urgentPatterns.filter(p => p.test(text)).length;
    if (matchCount >= 2) score += 8;

    // Recency is the DOMINANT factor (up to 30 points)
    const publishedAt = date ? new Date(date).getTime() : 0;
    if (publishedAt) {
      const ageHours = Math.max(0, (Date.now() - publishedAt) / 3600000);
      // Freshest = 30 pts, 6h = 22, 12h = 15, 24h = 7, 48h = 0
      score += Math.max(0, 30 - (ageHours * 0.625));
    }

    return score;
  };

  // Extract image URL from RSS item XML
  const extractImage = (itemXml) => {
    // media:content url="..."
    const mediaContent = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    if (mediaContent) return mediaContent[1];
    // media:thumbnail url="..."
    const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
    if (mediaThumbnail) return mediaThumbnail[1];
    // enclosure url="..." (image types)
    const enclosure = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i);
    if (enclosure) return enclosure[1];
    // enclosure url (no type check, common in RSS)
    const enclosureAny = itemXml.match(/<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/i);
    if (enclosureAny) return enclosureAny[1];
    // <image><url> inside item
    const imageUrl = itemXml.match(/<image>\s*<url>([^<]+)<\/url>/i);
    if (imageUrl) return imageUrl[1];
    // og:image or img src inside description/content:encoded
    const imgSrc = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgSrc) return imgSrc[1];
    return '';
  };

  const extractLink = (itemXml) => {
    const linkCdata = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i);
    if (linkCdata) return linkCdata[1];
    const linkTag = itemXml.match(/<link>(.*?)<\/link>/i);
    if (linkTag) return linkTag[1];
    const atomLink = itemXml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i);
    if (atomLink) return atomLink[1];
    return '';
  };

  // Parse Google News RSS
  const parseGoogleFeed = (xml, section) => {
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
      const image = extractImage(itemXml);
      const link = extractLink(itemXml);

      if (!title || title.length <= 20) continue;
      if (!isRecent(date)) continue; // HARD CUTOFF: skip old articles

      items.push({
        title,
        source,
        date,
        image,
        link,
        section: section.label,
        icon: section.icon,
        score: scoreArticle(title, source, date, section.label)
      });
    }

    return items;
  };

  // Parse generic RSS/Atom feeds (CoinDesk, Ars Technica, BBC, etc.)
  const parseGenericFeed = (xml, sectionLabel, sectionIcon, feedName) => {
    const items = [];
    // Try RSS <item> first, then Atom <entry>
    const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title[^>]*>(.*?)<\/title>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>|<published>(.*?)<\/published>|<updated>(.*?)<\/updated>/;
    // Extract source from dc:creator or use feed name
    const creatorRegex = /<dc:creator><!\[CDATA\[(.*?)\]\]>|<dc:creator>(.*?)<\/dc:creator>|<author>\s*<name>(.*?)<\/name>/;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1] || match[2];
      const titleMatch = itemXml.match(titleRegex);
      const dateMatch = itemXml.match(pubDateRegex);
      const creatorMatch = itemXml.match(creatorRegex);

      if (!titleMatch) continue;

      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const date = dateMatch ? (dateMatch[1] || dateMatch[2] || dateMatch[3]) : '';
      const image = extractImage(itemXml);
      const link = extractLink(itemXml);
      const source = feedName || (creatorMatch ? (creatorMatch[1] || creatorMatch[2] || creatorMatch[3] || '').trim() : '');

      if (!title || title.length <= 15) continue;
      if (!isRecent(date)) continue; // HARD CUTOFF: skip old articles

      items.push({
        title,
        source,
        date,
        image,
        link,
        section: sectionLabel,
        icon: sectionIcon,
        score: scoreArticle(title, source, date, sectionLabel)
      });
    }

    return items.slice(0, 15); // Max 15 per direct feed
  };

  const fetchWithTimeout = (url, ms = 5000) => {
    return Promise.race([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContextoBot/1.0)' } }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
  };

  try {
    const allArticles = [];

    // ─── 1. Fetch Google News RSS (in parallel per section, Spanish + English) ───
    const googlePromises = sections.flatMap((section) => {
      return section.queries.map(async (query) => {
        try {
          // Detect if query is English
          const isEnglish = /^[a-zA-Z0-9\s.,!?&^$()]+$/.test(query);
          const hl = isEnglish ? 'en-US' : 'es-419';
          const gl = isEnglish ? 'US' : 'MX';
          const ceid = isEnglish ? 'US:en' : 'MX:es-419';
          const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
          const res = await fetchWithTimeout(url);
          const xml = await res.text();
          return parseGoogleFeed(xml, section);
        } catch (e) { return []; }
      });
    });

    // ─── 2. Fetch direct RSS feeds (in parallel) ───
    const directPromises = directFeeds.map(async (feed) => {
      try {
        const res = await fetchWithTimeout(feed.url, 6000);
        const xml = await res.text();
        return parseGenericFeed(xml, feed.section, feed.icon, feed.name);
      } catch (e) { return []; }
    });

    // Wait for all feeds in parallel
    const [googleResults, directResults] = await Promise.all([
      Promise.all(googlePromises),
      Promise.all(directPromises)
    ]);

    // Merge all results
    const rawArticles = [];
    googleResults.forEach(items => rawArticles.push(...items));
    directResults.forEach(items => rawArticles.push(...items));

    // ─── 3. Global dedup + sort by score ───
    const globalSeen = new Set();
    const deduped = [];

    for (const article of rawArticles.sort((a, b) => b.score - a.score)) {
      const key = article.title.toLowerCase().replace(/[^a-záéíóúñü0-9]/g, '').slice(0, 60);
      if (globalSeen.has(key)) continue;
      globalSeen.add(key);
      deduped.push(article);
    }

    // ─── 4. Cap per section (max 20 each) ───
    const sectionCounts = {};
    for (const article of deduped) {
      sectionCounts[article.section] = (sectionCounts[article.section] || 0) + 1;
      if (sectionCounts[article.section] <= 20) {
        allArticles.push(article);
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
