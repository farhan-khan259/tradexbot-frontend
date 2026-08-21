import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpFromLine, CircleAlert, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import { api, apiError, getToken } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { MarketTicker } from "../components/MarketTicker";
import { MarketOverview } from "../components/MarketOverview";
import { CandleChart } from "../components/CandleChart";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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
      <div className="dashboard-subaccount__value">{money(value)}</div>
    </div>
  );
}

interface DashboardData {
  bot: { status: string; risk_level: string; exchange_connection: string; market_data_connection: string };
  balance: { total: number; available: number; funded: number; equity: number };
  performance: { today_pl: number; total_pl: number; win_rate: number; trades_today: number };
  risk: { level: string; score: number; recommendation: string };
  open_positions: Array<{ id: string; pair: string; side: string; quantity: number; entry_price: number; stop_loss: number; take_profit: number }>;
}

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "Trader";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await api.get<DashboardData>("/dashboard");
        if (mounted) {
          setData(response.data);
          setError("");
        }
      } catch (err) {
        if (mounted) setError(apiError(err, "Dashboard data is temporarily unavailable."));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    const id = window.setInterval(load, 15_000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/dashboard?token=${encodeURIComponent(token)}`);
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as { type: string; data: DashboardData };
        if (message.type === "dashboard") setData(message.data);
      } catch { /* Ignore malformed stream messages. */ }
    };
    return () => socket.close();
  }, []);

  const balance = data?.balance.total ?? Number(user?.balance ?? 0);
  const todayPL = data?.performance.today_pl ?? 0;
  const totalPL = data?.performance.total_pl ?? 0;
  const plClass = (value: number) => value > 0 ? "is-positive" : value < 0 ? "is-negative" : "";
  const signedMoney = (value: number) => `${value >= 0 ? "+" : "-"}${money(Math.abs(value))}`;

  return (
    <div className="dashboard-page workspace-page workspace-page--dashboard">
      <section className="workspace-hero workspace-hero--dashboard">
        <div>
          <p className="workspace-hero__eyebrow">Performance Overview</p>
          <h1 className="dashboard-page__title">TradeXBot Dashboard</h1>
          <p className="dashboard-page__subtitle">{firstName}, your account and bot activity at a glance.</p>
        </div>
        {data && <div className="dashboard-connection"><span className="dashboard-hero__status-dot" /> Synced</div>}
      </section>

      <section className="workspace-strip">
        <MarketTicker />
      </section>

      {loading && <div className="card dashboard-state"><RefreshCw size={17} className="spin" /> Loading account metrics...</div>}
      {error && <div className="card dashboard-state dashboard-state--error"><CircleAlert size={17} /> {error}</div>}

      <section className="card dashboard-hero workspace-panel">
        <div className="dashboard-hero__top">
          <div>
            <div className="dashboard-hero__greeting">{greeting()}</div>
            <div className="dashboard-hero__name">{firstName}</div>
          </div>

          <div className="dashboard-hero__status">
            <span className="dashboard-hero__status-dot" />
            <span>Online</span>
          </div>
        </div>

        <div className="dashboard-hero__equity-label">Total Balance</div>
        <div className="dashboard-hero__equity">{money(balance)}</div>
        <div className="dashboard-hero__meta">
          <TrendingUp size={14} />
          <span>{data ? `${data.bot.status} · ${data.bot.exchange_connection.toLowerCase()} exchange` : "Account summary"}</span>
        </div>

        <div className="dashboard-subaccounts">
          <SubAccount label="Available" value={data?.balance.available ?? balance} color="#7dddbb" />
          <SubAccount label="Funded" value={data?.balance.funded ?? 0} color="#62e2a0" />
          <SubAccount label="Equity" value={data?.balance.equity ?? balance} color="#c4e8da" />
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

      <section className="dashboard-metric-grid workspace-metrics-grid">
        <div className="card dashboard-metric"><span>Today's P/L</span><strong className={plClass(todayPL)}>{signedMoney(todayPL)}</strong></div>
        <div className="card dashboard-metric"><span>Total P/L</span><strong className={plClass(totalPL)}>{signedMoney(totalPL)}</strong></div>
        <div className="card dashboard-metric"><span>Win Rate</span><strong>{(data?.performance.win_rate ?? 0).toFixed(1)}%</strong></div>
        <div className="card dashboard-metric"><span>Trades Today</span><strong>{data?.performance.trades_today ?? 0}</strong></div>
        <div className="card dashboard-metric dashboard-metric--risk"><span><ShieldCheck size={15} /> AI Risk</span><strong>{data?.risk.level ?? "--"}</strong><small>{data?.risk.score ?? 0}/100 · {data?.risk.recommendation ?? "Waiting for assessment"}</small></div>
      </section>

      <section className="dashboard-section workspace-panel workspace-panel--market">
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

      <section className="dashboard-section workspace-panel workspace-panel--market" id="live-market">
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

      <section className="card dashboard-positions">
        <div className="dashboard-section__header dashboard-section__header--tight"><h2>Open Positions</h2></div>
        {!data?.open_positions?.length ? <p className="muted">No open positions.</p> : <div style={{ overflowX: "auto" }}><table><thead><tr><th>Asset</th><th>Side</th><th>Quantity</th><th>Entry</th><th>Stop loss</th><th>Take profit</th></tr></thead><tbody>{data.open_positions.map((position) => <tr key={position.id}><td>{position.pair}</td><td>{position.side}</td><td>{position.quantity}</td><td>{money(position.entry_price)}</td><td>{money(position.stop_loss)}</td><td>{money(position.take_profit)}</td></tr>)}</tbody></table></div>}
      </section>

      <section className="card dashboard-sentiment-card">
        <div className="dashboard-section__header dashboard-section__header--tight">
          <h2>
            <Activity size={16} />
            <span>Bot Status</span>
          </h2>
        </div>
        <div className="dashboard-sentiment-card__note">● {data?.bot.status ?? "CONNECTING"} · Risk {data?.bot.risk_level ?? "--"}</div>
        <div className="dashboard-sentiment-card__footer">Market data: {data?.bot.market_data_connection ?? "CONNECTING"} · Exchange: {data?.bot.exchange_connection ?? "CONNECTING"}</div>
      </section>
    </div>
  );
}
