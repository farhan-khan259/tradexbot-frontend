import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Transaction } from "../types";

const money = (n: number) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function Transactions() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Transaction[]>("/transactions")
      .then(({ data }) => setTxns(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="workspace-page workspace-page--transactions">
      <section className="workspace-hero workspace-hero--transactions">
        <div>
          <p className="workspace-hero__eyebrow">Account Ledger</p>
          <h1>Transaction history</h1>
          <p className="muted">All your deposits, withdrawals, and referral bonuses.</p>
        </div>
      </section>

      <section className="card workspace-panel">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : txns.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <div className="workspace-table-wrap">
            <table>
            <thead>
              <tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Note</th><th>Date</th></tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td className="muted">#{t.id}</td>
                  <td style={{ textTransform: "capitalize" }}>{t.type.replace("_", " ")}</td>
                  <td>{money(t.amount)}</td>
                  <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                  <td className="muted">{t.note ?? "—"}</td>
                  <td className="muted">{new Date(t.created_at).toLocaleString()}</td>
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
