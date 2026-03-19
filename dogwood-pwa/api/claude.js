export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

// Simple rate limiter for API proxy
const apiCalls = new Map(); // IP -> { count, windowStart }
const API_MAX_CALLS = 30;          // Max 30 API calls per window
const API_WINDOW_MS = 60 * 60 * 1000; // 1-hour window

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request includes the app PIN (proves the user logged in)
  const appPin = req.headers['x-app-pin'];
  const validPin = process.env.APP_PIN;
  if (!appPin || appPin !== validPin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Rate limiting
  const ip = getClientIP(req);
  const now = Date.now();
  const record = apiCalls.get(ip) || { count: 0, windowStart: now };
  if (now - record.windowStart > API_WINDOW_MS) {
    record.count = 0;
    record.windowStart = now;
  }
  record.count += 1;
  apiCalls.set(ip, record);
  if (record.count > API_MAX_CALLS) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(500).json({ error: 'Failed to reach Anthropic API', details: error.message });
  }
}
