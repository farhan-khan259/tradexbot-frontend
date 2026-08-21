import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, ArrowDownToLine, ArrowUpFromLine, Clock, UserPlus, Gift, PiggyBank,
} from "lucide-react";
import { api } from "../../api/client";
import type { AdminStats } from "../../types";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function StatCard({
  label, value, Icon, accent, to,
}: {
  label: string;
  value: string;
  Icon: typeof Users;
  accent?: boolean;
  to?: string;
}) {
  const inner = (
    <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "center", height: "100%" }}>
      <div
        style={{
          width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", flexShrink: 0,
          background: accent ? "var(--gradient)" : "rgba(34,211,238,0.12)",
          color: accent ? "#06121f" : "var(--accent)",
          border: accent ? "none" : "1px solid var(--border)",
        }}
      >
        <Icon size={22} />
      </div>
      <div>
        <div className="muted" style={{ fontSize: "0.82rem" }}>{label}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  );
  return to ? <Link to={to} style={{ color: "inherit" }}>{inner}</Link> : inner;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<AdminStats>("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setError("Failed to load statistics"));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="muted">Loading statistics…</p>;

  const grid = {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  } as const;

  return (
    <div>
      <h1>Admin dashboard</h1>
      <p className="muted">Platform overview and key statistics.</p>

      {/* Headline numbers */}
      <div style={{ ...grid, margin: "1.5rem 0" }}>
        <StatCard label="Total users" value={String(stats.total_users)} Icon={Users} accent to="/admin/users" />
        <StatCard label="Total platform balance" value={money(stats.total_balance)} Icon={PiggyBank} />
        <StatCard label="Total deposited" value={money(stats.deposits_total_amount)} Icon={ArrowDownToLine} to="/admin/deposits" />
        <StatCard label="Total withdrawn" value={money(stats.withdrawals_total_amount)} Icon={ArrowUpFromLine} to="/admin/withdrawals" />
      </div>

      <h3 style={{ marginTop: "2rem" }}>Deposits</h3>
      <div style={{ ...grid, marginTop: "0.8rem" }}>
        <StatCard label="Pending deposits" value={String(stats.deposits_pending_count)} Icon={Clock} to="/admin/deposits" />
        <StatCard label="Approved deposits" value={String(stats.deposits_approved_count)} Icon={ArrowDownToLine} to="/admin/deposits" />
      </div>

      <h3 style={{ marginTop: "2rem" }}>Withdrawals</h3>
      <div style={{ ...grid, marginTop: "0.8rem" }}>
        <StatCard label="Pending withdrawals" value={String(stats.withdrawals_pending_count)} Icon={Clock} to="/admin/withdrawals" />
        <StatCard label="Approved withdrawals" value={String(stats.withdrawals_approved_count)} Icon={ArrowUpFromLine} to="/admin/withdrawals" />
      </div>

      <h3 style={{ marginTop: "2rem" }}>Users & referrals</h3>
      <div style={{ ...grid, marginTop: "0.8rem" }}>
        <StatCard label="Active users" value={String(stats.active_users)} Icon={Users} />
        <StatCard label="Admins" value={String(stats.admin_users)} Icon={Users} />
        <StatCard label="New (7 days)" value={String(stats.new_users_7d)} Icon={UserPlus} />
        <StatCard label="Referral bonuses paid" value={money(stats.referral_bonus_total)} Icon={Gift} />
      </div>
    </div>
  );
}
