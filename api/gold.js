// Vercel serverless function — proxies goldprice.org chart data to bypass CORS
// Endpoint: /api/gold?days=30
export default async function handler(req, res) {
  const days = parseInt(req.query.days) || 30;
  const url = `https://data-asg.goldprice.org/GetData/MYR-XAU/${days}`;

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
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
