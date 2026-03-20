exports.handler = async function(event) {
  const lang = ((event.queryStringParameters || {}).lang || 'es').toLowerCase();
  const isES = lang === 'es';

  // ─── SECTIONS: queries filtered by language ───
  const sectionsRaw = [
    {
      queriesES: [
        'últimas noticias mundo política internacional economía global',
        'cumbre diplomacia elecciones comercio internacional sanciones'
      ],
      queriesEN: [
        'world news international politics global economy',
        'climate energy health science breakthrough world news'
      ],
      label: isES ? 'Global' : 'Global', icon: '🌐'
    },
    {
      queriesES: [
        'economía global inflación tasas interés banco central',
        'deuda crisis financiera recesión crecimiento empleo',
        'Fed BCE bancos centrales política monetaria economía'
      ],
      queriesEN: [
        'global economy inflation central bank recession',
        'Fed ECB monetary policy debt employment economy'
      ],
      label: isES ? 'Dinero' : 'Dinero', icon: '💰'
    },
    {
      queriesES: [
        'geopolítica diplomacia conflicto seguridad internacional cumbre',
        'OTAN China Rusia Estados Unidos relaciones internacionales'
      ],
      queriesEN: [
        'international security diplomacy sanctions summit conflict',
        'cyberattack espionage government security global politics'
      ],
      label: isES ? 'Poder' : 'Poder', icon: '⚡'
    },
    {
      queriesES: [
        'inteligencia artificial semiconductores regulación tecnología',
        'Apple Google Meta Microsoft Nvidia chips tecnología'
      ],
      queriesEN: [
        'artificial intelligence chips regulation robotics technology',
        'space telecom cybersecurity technology global industry'
      ],
      label: isES ? 'Tecnología' : 'Tecnología', icon: '🤖'
    },
    {
      queriesES: [
        'Wall Street Nasdaq S&P mercados financieros commodities',
        'oro petróleo gas bonos divisas mercados'
      ],
      queriesEN: [
        'stock market bonds commodities oil gold prices',
        'bitcoin crypto regulation ETF market macro'
      ],
      label: isES ? 'Mercados' : 'Mercados', icon: '📊'
    },
    {
      queriesES: [
        'migración visa nómada digital residencia',
        'pasaporte ciudadanía movilidad global expatriado'
      ],
      queriesEN: [
        'digital nomad visa remote work abroad',
        'immigration policy border visa reform'
      ],
      label: isES ? 'Movilidad' : 'Movilidad', icon: '🌍'
    },
    {
      queriesES: [
        'Latinoamérica política economía elecciones crisis regional',
        'México Colombia Argentina Brasil Chile Perú noticias',
        'Mercosur BRICS Latinoamérica comercio relaciones internacionales'
      ],
      queriesEN: [
        'Latin America politics economy elections diplomacy'
      ],
      label: isES ? 'Latam' : 'Latam', icon: '🌎'
    }
  ];

  const sections = sectionsRaw.map(s => ({
    queries: isES ? s.queriesES : s.queriesEN,
    label: s.label,
    icon: s.icon
  }));

  // ─── DIRECT RSS FEEDS filtered by language ───
  const directFeeds = [
    // Markets / Macro (both)
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', section: 'Mercados', icon: '📊', name: 'CoinDesk', lang: 'en' },
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^DJI,BTC-USD,GC=F,CL=F&region=US&lang=en-US', section: 'Mercados', icon: '📊', name: 'Yahoo Finance', lang: 'en' },
    // Tech / AI (both)
    { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', section: 'Tecnología', icon: '🤖', name: 'Ars Technica', lang: 'en' },
    { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', section: 'Tecnología', icon: '🤖', name: 'The Verge', lang: 'en' },
    { url: 'https://techcrunch.com/feed/', section: 'Tecnología', icon: '🤖', name: 'TechCrunch', lang: 'en' },
    { url: 'https://www.wired.com/feed/rss', section: 'Tecnología', icon: '🤖', name: 'Wired', lang: 'en' },
    { url: 'https://feeds.feedburner.com/venturebeat/SZYF', section: 'Tecnología', icon: '🤖', name: 'VentureBeat', lang: 'en' },
    // Geopolitics — English sources
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', section: 'Poder', icon: '⚡', name: 'BBC World', lang: 'en' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', section: 'Poder', icon: '⚡', name: 'Al Jazeera', lang: 'en' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', section: 'Poder', icon: '⚡', name: 'NYT World', lang: 'en' },
    { url: 'https://feeds.washingtonpost.com/rss/world', section: 'Poder', icon: '⚡', name: 'Washington Post', lang: 'en' },
    { url: 'https://www.theguardian.com/world/rss', section: 'Poder', icon: '⚡', name: 'The Guardian', lang: 'en' },
    { url: 'https://feeds.reuters.com/reuters/worldNews', section: 'Poder', icon: '⚡', name: 'Reuters', lang: 'en' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Asia.xml', section: 'Poder', icon: '⚡', name: 'NYT Asia', lang: 'en' },
    { url: 'https://www3.nhk.or.jp/nhkworld/en/news/rss.xml', section: 'Poder', icon: '⚡', name: 'NHK World', lang: 'en' },
    // Geopolitics — Spanish sources
    { url: 'https://feeds.bbci.co.uk/mundo/rss.xml', section: 'Poder', icon: '⚡', name: 'BBC Mundo', lang: 'es' },
    // Economy — English
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', section: 'Dinero', icon: '💰', name: 'NYT Business', lang: 'en' },
    { url: 'https://feeds.bloomberg.com/markets/news.rss', section: 'Dinero', icon: '💰', name: 'Bloomberg', lang: 'en' },
    { url: 'https://www.investing.com/rss/news.rss', section: 'Dinero', icon: '💰', name: 'Investing.com', lang: 'en' },
    { url: 'https://www.theguardian.com/business/rss', section: 'Dinero', icon: '💰', name: 'Guardian Business', lang: 'en' },
    // Latam — Spanish
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/america/portada', section: 'Latam', icon: '🌎', name: 'El País', lang: 'es' },
    { url: 'https://rss.dw.com/xml/rss-sp-latinoamerica', section: 'Latam', icon: '🌎', name: 'DW Latam', lang: 'es' },
    { url: 'https://www.france24.com/es/am%C3%A9rica-latina/rss', section: 'Latam', icon: '🌎', name: 'France 24 ES', lang: 'es' },
    { url: 'https://cnnespanol.cnn.com/feed/', section: 'Global', icon: '🌐', name: 'CNN Español', lang: 'es' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada', section: 'Dinero', icon: '💰', name: 'El País Economía', lang: 'es' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/en-espa%C3%B1ol.xml', section: 'Global', icon: '🌐', name: 'NYT Español', lang: 'es' },
    { url: 'https://www.swissinfo.ch/spa/rss/topic?id=34831694', section: 'Latam', icon: '🌎', name: 'SWI Español', lang: 'es' },
  ].filter(f => isES ? true : f.lang === 'en');

  const sourceAuthority = [
    [/reuters/i, 18],
    [/associated press|\bap\b/i, 17],
    [/bbc/i, 16],
    [/bloomberg/i, 16],
    [/financial times|\bft\b/i, 15],
    [/new york times|nyt/i, 14],
    [/washington post/i, 14],
    [/the guardian|guardian/i, 13],
    [/al jazeera/i, 13],
    [/nhk/i, 12],
    [/dw|deutsche welle/i, 12],
    [/elpais|el país/i, 11],
    [/ars technica|wired|techcrunch|the verge/i, 10],
    [/yahoo finance|investing\.com/i, 9],
    [/coindesk/i, 7]
  ];

  const significancePatterns = [
    /election|elecci[oó]n|summit|cumbre|sanction|sanci[oó]n|tariff|arancel|ceasefire|alto el fuego|court|tribunal|fallo|impeachment/i,
    /central bank|banco central|fed|bce|rates|tasas|inflation|inflaci[oó]n|recession|recesi[oó]n|debt|deuda|jobs|employment/i,
    /earthquake|terremoto|storm|hurac[aá]n|flood|inundaci[oó]n|wildfire|incendio|outbreak|brote|vaccine|pandemic|health/i,
    /oil|petr[oó]leo|gas|energy|energ[ií]a|chip|semiconductor|ai|ia|cyberattack|ciberataque|trade|comercio/i
  ];

  const nichePatterns = /bitcoin|btc|crypto|cripto|ethereum|solana|nft|defi|web3/i;

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

    // Recency is the dominant factor (up to 42 points)
    const publishedAt = date ? new Date(date).getTime() : 0;
    if (publishedAt) {
      const ageHours = Math.max(0, (Date.now() - publishedAt) / 3600000);
      score += Math.max(0, 42 - (ageHours * 0.875));
    }

    // Source authority matters more than topic obsession.
    for (const [pattern, weight] of sourceAuthority) {
      if (pattern.test(source || '')) {
        score += weight;
        break;
      }
    }

    // Broad significance signals, not specific countries or assets.
    significancePatterns.forEach((pattern) => {
      if (pattern.test(text)) score += 4;
    });

    if (sectionLabel === 'Global') score += 5;
    if (sectionLabel === 'Poder' || sectionLabel === 'Dinero') score += 3;
    if (sectionLabel === 'Tecnología' || sectionLabel === 'Latam') score += 2;

    // Prevent niche crypto headlines from dominating unless they are clearly macro-relevant.
    if (nichePatterns.test(title) && !/etf|regulation|regulaci[oó]n|government|gobierno|bank|banco|market|mercado|crash|ca[ií]da/i.test(title)) {
      score -= 8;
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

  const fetchWithTimeout = (url, ms = 3000) => {
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
        const res = await fetchWithTimeout(feed.url, 3000);
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

    // ─── 4. Cap by section and source to avoid one theme taking over ───
    const sectionCounts = {};
    const sourceCounts = {};
    const sectionLimits = { Global: 12, Poder: 10, Dinero: 10, Tecnología: 8, Mercados: 6, Latam: 6, Movilidad: 4 };
    for (const article of deduped) {
      const sourceKey = (article.source || 'unknown').toLowerCase();
      sectionCounts[article.section] = (sectionCounts[article.section] || 0) + 1;
      sourceCounts[sourceKey] = (sourceCounts[sourceKey] || 0) + 1;
      const sectionLimit = sectionLimits[article.section] || 6;
      if (sectionCounts[article.section] <= sectionLimit && sourceCounts[sourceKey] <= 3) {
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
