// In-memory rate limiting for brute force protection
const attempts = new Map(); // IP -> { count, firstAttempt, lockedUntil }

const MAX_ATTEMPTS = 5;       // Max failed attempts before lockout
const WINDOW_MS = 15 * 60 * 1000;  // 15-minute window
const LOCKOUT_MS = 30 * 60 * 1000; // 30-minute lockout after max failures

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         'unknown';
}

function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, data] of attempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS && !data.lockedUntil) {
      attempts.delete(ip);
    }
    if (data.lockedUntil && now > data.lockedUntil) {
      attempts.delete(ip);
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  cleanupOldEntries();

  const ip = getClientIP(req);
  const now = Date.now();
  const record = attempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: null };

  // Check if locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` });
  }

  // Reset if window expired
  if (now - record.firstAttempt > WINDOW_MS) {
    record.count = 0;
    record.firstAttempt = now;
    record.lockedUntil = null;
  }

  const { pin } = req.body;
  const validPin = process.env.APP_PIN;

  if (!validPin) {
    return res.status(500).json({ error: 'PIN not configured' });
  }

  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: 'PIN is required' });
  }

  if (pin === validPin) {
    // Successful login — reset attempts
    attempts.delete(ip);
    return res.status(200).json({ success: true });
  } else {
    // Failed attempt
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
    attempts.set(ip, record);

    const remaining = MAX_ATTEMPTS - record.count;
    if (remaining <= 0) {
      return res.status(429).json({ error: 'Too many failed attempts. Locked out for 30 minutes.' });
    }
    return res.status(401).json({ error: `Invalid PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` });
  }
}
