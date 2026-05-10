const rateLimit = new Map();
const LIMIT = 10;          // max requests
const WINDOW = 60 * 1000;  // per 60 seconds per IP

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Get requester's IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  // Clean up old entries
  for (const [key, data] of rateLimit.entries()) {
    if (now - data.start > WINDOW) rateLimit.delete(key);
  }

  // Check rate limit
  if (rateLimit.has(ip)) {
    const data = rateLimit.get(ip);
    if (data.count >= LIMIT) {
      return res.status(429).json({ 
        error: 'Too many requests, slow down!' 
      });
    }
    data.count++;
  } else {
    rateLimit.set(ip, { count: 1, start: now });
  }

  // Fetch from Finnhub
  const key = process.env.FINNHUB_KEY;
  const { symbol } = req.query;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}