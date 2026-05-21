// Vercel serverless proxy — goldprice.org live price + gold-api.com as fallback
// goldprice.org dbXRates/MYR gives live MYR price with prev close for % change
export default async function handler(req, res) {
  try {
    // Try goldprice.org first
    const r = await fetch('https://data-asg.goldprice.org/dbXRates/MYR', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!r.ok) throw new Error('goldprice.org failed');
    const data = await r.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ source: 'goldprice', data });
  } catch (e1) {
    try {
      // Fallback: gold-api.com (USD) + frankfurter MYR rate
      const [goldRes, fxRes] = await Promise.all([
        fetch('https://api.gold-api.com/price/XAU'),
        fetch('https://api.frankfurter.app/latest?from=USD&to=MYR')
      ]);
      const gold = await goldRes.json();
      const fx = await fxRes.json();
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({
        source: 'gold-api',
        data: { priceUSD: gold.price, myrRate: fx.rates.MYR }
      });
    } catch (e2) {
      res.status(500).json({ error: 'All sources failed' });
    }
  }
}
