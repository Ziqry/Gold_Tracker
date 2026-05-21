// Vercel serverless function — proxies goldprice.org live price
// Endpoint: /api/live
export default async function handler(req, res) {
  const url = 'https://data-asg.goldprice.org/dbXRates/MYR';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoldTracker/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`goldprice.org returned ${response.status}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
