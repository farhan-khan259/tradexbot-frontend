export interface MarketCoin {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const MARKET_ORDER: Array<{ symbol: string; name: string; id: string }> = [
  { symbol: "BTC", name: "Bitcoin", id: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", id: "ethereum" },
  { symbol: "BNB", name: "BNB", id: "binancecoin" },
  { symbol: "SOL", name: "Solana", id: "solana" },
  { symbol: "XRP", name: "XRP", id: "ripple" },
  { symbol: "ADA", name: "Cardano", id: "cardano" },
];

export const MARKET_FALLBACK: MarketCoin[] = [
  { symbol: "BTC", name: "Bitcoin", price: 60123.96, change: -0.46 },
  { symbol: "ETH", name: "Ethereum", price: 1576.67, change: -0.46 },
  { symbol: "BNB", name: "BNB", price: 555.18, change: -1.54 },
  { symbol: "SOL", name: "Solana", price: 71.54, change: -0.5 },
  { symbol: "XRP", name: "XRP", price: 1.05, change: -1.05 },
  { symbol: "ADA", name: "Cardano", price: 0.1448, change: -1.7 },
];

interface CoinGeckoPrice {
  usd?: number;
  usd_24h_change?: number;
}

type CoinGeckoResponse = Record<string, CoinGeckoPrice>;

export async function fetchLiveMarketPrices(signal?: AbortSignal): Promise<MarketCoin[]> {
  const ids = MARKET_ORDER.map((coin) => coin.id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Market API failed: ${response.status}`);
  }

  const json = (await response.json()) as CoinGeckoResponse;
  return MARKET_ORDER.map((coin, index) => {
    const payload = json[coin.id] ?? {};
    const fallback = MARKET_FALLBACK[index];
    const price = typeof payload.usd === "number" ? payload.usd : fallback.price;
    const change = typeof payload.usd_24h_change === "number" ? payload.usd_24h_change : fallback.change;
    return {
      symbol: coin.symbol,
      name: coin.name,
      price,
      change,
    };
  });
}