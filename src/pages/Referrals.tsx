import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { ReferralSummary } from "../types";

const money = (n: number) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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
    <div className="workspace-page workspace-page--referrals">
      <section className="workspace-hero workspace-hero--referrals">
        <div>
          <p className="workspace-hero__eyebrow">Referral Program</p>
          <h1>Refer & earn</h1>
          <p className="muted">Share your link and earn a bonus for every friend who joins TradeXBot.</p>
        </div>
      </section>

      <section className="workspace-stats-grid">
        <div className="card workspace-stat-card">
          <div className="muted workspace-stat-card__label">Total referrals</div>
          <div className="gradient-text workspace-stat-card__value">
            {summary.total_referrals}
          </div>
        </div>
        <div className="card workspace-stat-card">
          <div className="muted workspace-stat-card__label">Bonus earned</div>
          <div className="gradient-text workspace-stat-card__value">
            {money(summary.total_bonus)}
          </div>
        </div>
      </section>

      <section className="card workspace-panel">
        <h3>Your referral link</h3>
        <div className="referral-link-row">
          <code className="referral-link-row__code">
            {link}
          </code>
          <button className="btn" onClick={copy}>{copied ? "Copied!" : "Copy link"}</button>
        </div>

        <h3 style={{ marginTop: "1.5rem" }}>Referred users</h3>
        {summary.referred_users.length === 0 ? (
          <p className="muted">No referrals yet. Share your link to start earning.</p>
        ) : (
          <div className="workspace-table-wrap">
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
          </div>
        )}
      </section>
    </div>
  );
}
