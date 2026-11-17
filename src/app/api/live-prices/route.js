import { NextResponse } from 'next/server';
import { INITIAL_STOCKS } from '../../../data/stocks';

export async function GET() {
  try {
    // Only query NGX tickers (NASD tickers start with SD)
    const ngxSymbols = INITIAL_STOCKS.filter((s) => !s.symbol.startsWith('SD')).map(
      (s) => `${s.symbol}.LG`
    );

    const prices = {};
    const batchSize = 25;

    for (let i = 0; i < ngxSymbols.length; i += batchSize) {
      const batch = ngxSymbols.slice(i, i + batchSize).join(',');
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(batch)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const quotes = json?.quoteResponse?.result || [];
      for (const q of quotes) {
        const sym = String(q.symbol || '').replace(/\.LG$/i, '').toUpperCase();
        const price = q.regularMarketPrice ?? q.regularMarketPreviousClose;
        if (sym && typeof price === 'number' && price > 0) {
          prices[sym] = Number(price.toFixed(2));
        }
      }
    }

    return NextResponse.json({
      ok: true,
      count: Object.keys(prices).length,
      prices,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message, prices: {} }, { status: 200 });
  }
}
