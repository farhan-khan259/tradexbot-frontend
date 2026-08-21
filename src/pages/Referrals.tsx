import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { ReferralSummary } from "../types";

const money = (n: number) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Referrals() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<ReferralSummary>("/referrals").then(({ data }) => setSummary(data)).catch(() => {});
  }, []);

  if (!summary) return <p className="muted">Loading…</p>;

  const link = `${window.location.origin}/register?ref=${summary.referral_code}`;

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <h1>Refer & earn</h1>
      <p className="muted">Share your link — earn a bonus for every friend who joins TradeXBot.</p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div className="muted" style={{ fontSize: "0.85rem" }}>Total referrals</div>
          <div className="gradient-text" style={{ fontSize: "1.9rem", fontWeight: 800 }}>
            {summary.total_referrals}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div className="muted" style={{ fontSize: "0.85rem" }}>Bonus earned</div>
          <div className="gradient-text" style={{ fontSize: "1.9rem", fontWeight: 800 }}>
            {money(summary.total_bonus)}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Your referral link</h3>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          <code style={{ flex: 1, minWidth: 240, padding: "0.6rem 0.8rem", background: "#0e231f",
            borderRadius: 8, border: "1px solid var(--border)", overflowX: "auto" }}>
            {link}
          </code>
          <button className="btn" onClick={copy}>{copied ? "Copied!" : "Copy link"}</button>
        </div>

        <h3 style={{ marginTop: "1.5rem" }}>Referred users</h3>
        {summary.referred_users.length === 0 ? (
          <p className="muted">No referrals yet. Share your link to start earning.</p>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Bonus</th></tr></thead>
            <tbody>
              {summary.referred_users.map((u, i) => (
                <tr key={i}>
                  <td>{u.full_name}</td>
                  <td className="muted">{u.email}</td>
                  <td>{money(u.bonus_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
