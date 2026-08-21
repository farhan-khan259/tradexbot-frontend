import { useCallback, useEffect, useState } from "react";
import { api, apiError } from "../../api/client";
import type { Transaction, TransactionType } from "../../types";
import { TxTable } from "./TxTable";

type Tab = "pending" | "completed";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function TransactionManager({
  type,
  title,
  subtitle,
}: {
  type: TransactionType;
  title: string;
  subtitle: string;
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Transaction[]>("/admin/transactions", {
        params: { type_filter: type },
      });
      setRows(data);
    } catch (err) {
      setError(apiError(err, "Failed to load transactions"));
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(id: string, status: "approved" | "rejected") {
    setError("");
    try {
      await api.post(`/admin/transactions/${id}/resolve`, { status });
      await load();
    } catch (err) {
      setError(apiError(err, "Could not update transaction"));
    }
  }

  const pending = rows.filter((r) => r.status === "pending");
  const completed = rows.filter((r) => r.status !== "pending");
  const shown = tab === "pending" ? pending : completed;

  // Completed amount counts approved only (rejected funds were refunded/never moved).
  const completedAmount = completed
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>

      {error && <p className="error">{error}</p>}

      <div style={{ display: "flex", gap: "0.6rem", margin: "1.2rem 0" }}>
        <button className={tab === "pending" ? "btn" : "btn btn-ghost"} onClick={() => setTab("pending")}>
          Pending ({pending.length})
        </button>
        <button className={tab === "completed" ? "btn" : "btn btn-ghost"} onClick={() => setTab("completed")}>
          Completed ({completed.length})
        </button>
      </div>

      {tab === "completed" && (
        <p className="muted" style={{ marginTop: 0 }}>
          Approved total: <strong style={{ color: "var(--text)" }}>{money(completedAmount)}</strong>
        </p>
      )}

      <div className="card">
        <TxTable
          rows={shown}
          loading={loading}
          emptyText={tab === "pending" ? "No pending requests." : "No completed records yet."}
          onResolve={tab === "pending" ? resolve : undefined}
          showScreenshotView={type === "deposit"}
        />
      </div>
    </div>
  );
}
