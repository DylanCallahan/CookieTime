export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const key = process.env.POLYGON_KEY; //bopmboclat
  const { symbol, timespan, date } = req.query;

  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timespan}/${date}/${date}?adjusted=true&sort=asc&apiKey=${key}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candle data' });
  }
}