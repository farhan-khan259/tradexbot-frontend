import { useEffect, useState } from "react";
import { Bitcoin, Coins, Droplets } from "lucide-react";
import { fetchLiveMarketPrices, MARKET_FALLBACK, type MarketCoin } from "../api/market";

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, {
    minimumFractionDigits: n < 1 ? 4 : 2,
    maximumFractionDigits: n < 1 ? 4 : 2,
  })}`;

const iconFor = (symbol: string) => {
  if (symbol === "BTC") return <Bitcoin size={18} />;
  if (symbol === "ETH") return <Droplets size={18} />;
  if (symbol === "BNB") return <Coins size={18} />;
  if (symbol === "SOL") return <span className="dashboard-coin-mark">S</span>;
  if (symbol === "XRP") return <span className="dashboard-coin-mark">X</span>;
  return <span className="dashboard-coin-mark">A</span>;
};

export function MarketOverview() {
  const [coins, setCoins] = useState<MarketCoin[]>(MARKET_FALLBACK);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const live = await fetchLiveMarketPrices(controller.signal);
        if (mounted) setCoins(live);
      } catch {
        // Keep last known data if live feed is temporarily unavailable.
      }
    };

    void load();
    const id = window.setInterval(load, 30_000);

    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="dashboard-market-list">
      {coins.map((coin, index) => (
        <div key={coin.symbol} className={`dashboard-market-row ${index < coins.length - 1 ? "has-border" : ""}`}>
          <div className={`dashboard-market-row__icon dashboard-market-row__icon--${coin.symbol.toLowerCase()}`}>
            {iconFor(coin.symbol)}
          </div>

          <div className="dashboard-market-row__identity">
            <strong>{coin.name}</strong>
            <span>{coin.symbol}</span>
          </div>

          <div className="dashboard-market-row__value">
            <strong>{fmt(coin.price)}</strong>
            <span className="dashboard-market-row__change">
              {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
