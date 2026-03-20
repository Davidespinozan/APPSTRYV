// Cross-device progress sync using Netlify Blobs REST API
// Required env vars: NETLIFY_SITE_ID, NETLIFY_API_TOKEN

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SITE_ID = process.env.NETLIFY_SITE_ID;
  const TOKEN = process.env.NETLIFY_API_TOKEN;

  if (!SITE_ID || !TOKEN) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Sync not configured. Set NETLIFY_SITE_ID and NETLIFY_API_TOKEN.' })
    };
  }

  try {
    const { method, userId, data } = JSON.parse(event.body || '{}');

    if (!userId || typeof userId !== 'string' || userId.length < 8) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid userId required' }) };
    }

    const safeKey = userId.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 64);
    const blobUrl = `https://api.netlify.com/api/v1/sites/${SITE_ID}/blobs/${encodeURIComponent('ctx-' + safeKey)}`;
    const authHeaders = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

    if (method === 'save') {
      if (!data || typeof data !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'data required for save' }) };
      }
      const payload = { ...data, savedAt: new Date().toISOString(), userId: safeKey };
      const res = await fetch(blobUrl, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Blob PUT error:', res.status, errText);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save progress' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, savedAt: payload.savedAt }) };
    }

    if (method === 'load') {
      const res = await fetch(blobUrl, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
      if (res.status === 404) {
        return { statusCode: 200, headers, body: JSON.stringify({ data: null }) };
      }
      if (!res.ok) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load progress' }) };
      }
      const saved = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ data: saved }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'method must be save or load' }) };

  } catch (error) {
    console.error('Sync error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
