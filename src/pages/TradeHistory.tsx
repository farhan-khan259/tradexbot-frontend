import { useEffect, useState } from "react";
import { api, apiError } from "../api/client";

interface Trade { id: string; pair: string; amount: number; profit_loss: number; status: string; source: string; opened_at: string; }
const money = (value: number) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function TradeHistory() {
  const [items, setItems] = useState<Trade[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api.get<{ items: Trade[] }>("/trades", { params: { status: status || undefined, search: search || undefined } }).then(({ data }) => setItems(data.items)).catch((err) => setError(apiError(err, "Trade history unavailable"))); }, [status, search]);

  return (
    <div className="workspace-page workspace-page--trades">
      <section className="workspace-hero workspace-hero--trades">
        <div>
          <p className="workspace-hero__eyebrow">Execution Records</p>
          <h1>Trade history</h1>
          <p className="muted">AI orders associated with your account.</p>
        </div>
      </section>

      <section className="card workspace-panel workspace-panel--filters">
        <div className="trade-filters">
          <input className="input" placeholder="Search asset" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card workspace-panel">
        {!items.length ? (
          <p className="workspace-empty muted">No trades found.</p>
        ) : (
          <div className="workspace-table-wrap">
            <table>
              <thead>
                <tr><th>Opened</th><th>Asset</th><th>Source</th><th>Status</th><th>Amount</th><th>Profit/Loss</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="muted">{new Date(item.opened_at).toLocaleString()}</td>
                    <td>{item.pair}</td>
                    <td>{item.source}</td>
                    <td>{item.status}</td>
                    <td>{money(item.amount)}</td>
                    <td className={item.profit_loss >= 0 ? "positive" : "negative"}>{money(item.profit_loss)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}