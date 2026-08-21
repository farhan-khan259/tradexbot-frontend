import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpFromLine, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { MarketTicker } from "../components/MarketTicker";
import { MarketOverview } from "../components/MarketOverview";
import { CandleChart } from "../components/CandleChart";
import { SentimentGauge, sentimentMeta } from "../components/SentimentGauge";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function SubAccount({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="dashboard-subaccount">
      <div className="dashboard-subaccount__label">
        <span className="dashboard-subaccount__dot" style={{ background: color }} />
        {label}
      </div>
      <div className="dashboard-subaccount__value">{money(value).replace(".00", "")}</div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const balance = Number(user?.balance ?? 0);
  const firstName = user?.full_name?.split(" ")[0] || "Trader";
  const [sentimentValue, setSentimentValue] = useState(18);
  const [sentimentUpdatedAt, setSentimentUpdatedAt] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setSentimentValue((prev) => {
        const next = prev + (Math.random() - 0.5) * 10;
        return Math.max(8, Math.min(92, Math.round(next)));
      });
      setSentimentUpdatedAt(new Date());
    }, 5200);

    return () => window.clearInterval(id);
  }, []);

  const sentiment = sentimentMeta(sentimentValue);
  const updatedAt = sentimentUpdatedAt.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">Wallet</h1>

      <MarketTicker />

      <section className="card dashboard-hero">
        <div className="dashboard-hero__top">
          <div>
            <div className="dashboard-hero__greeting">
              {greeting()} <Sparkles size={14} />
            </div>
            <div className="dashboard-hero__name">{firstName}</div>
          </div>

          <div className="dashboard-hero__status">
            <span className="dashboard-hero__status-dot" />
            <span>Online</span>
          </div>
        </div>

        <div className="dashboard-hero__equity-label">Total Equity</div>
        <div className="dashboard-hero__equity">{money(balance)}</div>
        <div className="dashboard-hero__meta">
          <TrendingUp size={14} />
          <span>Synced across all sub-accounts</span>
        </div>

        <div className="dashboard-subaccounts">
          <SubAccount label="Spot" value={balance} color="#7dddbb" />
          <SubAccount label="Trading" value={0} color="#62e2a0" />
          <SubAccount label="Bot" value={0} color="#c4e8da" />
        </div>

        <div className="dashboard-actions">
          <Link to="/deposit" className="dashboard-action dashboard-action--deposit">
            <ArrowDownToLine size={17} />
            <span>Deposit</span>
          </Link>
          <Link to="/withdraw" className="dashboard-action dashboard-action--withdraw">
            <ArrowUpFromLine size={17} />
            <span>Withdraw</span>
          </Link>
          {balance > 0 ? (
            <Link to="/bot" className="dashboard-action dashboard-action--trade">
              <Activity size={17} />
              <span>Trade</span>
            </Link>
          ) : (
            <button type="button" className="dashboard-action dashboard-action--trade is-disabled" disabled>
              <Activity size={17} />
              <span>Trade</span>
            </button>
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>
            <Activity size={16} />
            <span>Market Overview</span>
          </h2>
          <a href="#live-market">View More -&gt;</a>
        </div>
        <div className="card dashboard-market-card">
          <MarketOverview />
        </div>
      </section>

      <section className="dashboard-section" id="live-market">
        <div className="dashboard-section__header">
          <h2>
            <Activity size={16} />
            <span>Live Market Data</span>
          </h2>
        </div>
        <div className="card dashboard-chart-card">
          <CandleChart />
        </div>
      </section>

      <section className="card dashboard-sentiment-card">
        <div className="dashboard-section__header dashboard-section__header--tight">
          <h2>
            <Activity size={16} />
            <span>Market Sentiment</span>
          </h2>
        </div>

        <div className="dashboard-sentiment-card__gauge">
          <SentimentGauge value={sentimentValue} />
        </div>

        <div className="dashboard-sentiment-card__note">
          {sentiment.note}
        </div>

        <div className="dashboard-sentiment-card__footer">Updated: {updatedAt}</div>
      </section>
    </div>
  );
}
