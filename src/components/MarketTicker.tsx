import { useEffect, useState } from "react";
import { Bitcoin, Coins, Droplets } from "lucide-react";
import { fetchLiveMarketPrices, MARKET_FALLBACK, type MarketCoin } from "../api/market";

const iconFor = (symbol: string) => {
  if (symbol === "BTC") return <Bitcoin size={12} />;
  if (symbol === "ETH") return <Droplets size={12} />;
  return <Coins size={12} />;
};

export function MarketTicker() {
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

  useEffect(() => {
    const id = window.setInterval(() => {
      setCoins((prev) => [...prev.slice(1), prev[0]]);
    }, 5200);

    return () => window.clearInterval(id);
  }, []);

  const items = [...coins, ...coins, ...coins];

  return (
    <section className="dashboard-ticker card">
      <div className="dashboard-ticker__marquee">
        <div className="dashboard-ticker__track">
          {items.map((coin, index) => (
            <div key={`${coin.symbol}-${index}`} className="dashboard-ticker__coin">
              <div className={`dashboard-ticker__coin-icon dashboard-ticker__coin-icon--${coin.symbol.toLowerCase()}`}>
                {iconFor(coin.symbol)}
              </div>
              <span className="dashboard-ticker__coin-symbol">{coin.symbol}</span>
              <strong>
                ${coin.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
              <span className="dashboard-ticker__coin-change">
                {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <div className="dashboard-ticker__signal" />
      </div>
    </section>
  );
}
