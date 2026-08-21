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

export const MARKET_FALLBACK: MarketCoin[] = [];

import { api } from "./client";

export async function fetchLiveMarketPrices(signal?: AbortSignal): Promise<MarketCoin[]> {
  void signal;
  return Promise.all(MARKET_ORDER.map(async (coin) => {
    const { data } = await api.get<{ symbol: string; price: number; change: number }>(`/market/${coin.symbol}`);
    return { symbol: coin.symbol, name: coin.name, price: data.price, change: data.change };
  }));
}

export interface MarketCandle { time: number; o: number; h: number; l: number; c: number; v: number }

export async function fetchMarketCandles(symbol: string, interval: string, signal?: AbortSignal): Promise<MarketCandle[]> {
  void signal;
  const { data } = await api.get<{ candles: MarketCandle[] }>(`/market/${symbol}/candles`, { params: { interval, limit: 80 } });
  return data.candles;
}