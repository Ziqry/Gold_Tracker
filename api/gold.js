// Vercel serverless proxy — World Gold Council API via fsapi.gold.org
// Returns [[timestamp_ms, price_usd_per_oz], ...] — reliable, public, always current
export default async function handler(req, res) {
  const days = parseInt(req.query.days) || 30;
  const now = Date.now();
  const from = now - days * 24 * 60 * 60 * 1000;
  const url = `https://fsapi.gold.org/api/goldprice/v11/chart/price/usd/oz/${from},${now}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`WGC API returned ${response.status}`);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
