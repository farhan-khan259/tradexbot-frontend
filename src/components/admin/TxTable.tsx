import { Check, X } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "../../types";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

interface Props {
  rows: Transaction[];
  loading?: boolean;
  emptyText?: string;
  onResolve?: (id: string, status: "approved" | "rejected") => void;
  showScreenshotView?: boolean;
}

export function TxTable({
  rows,
  loading,
  emptyText = "Nothing here yet.",
  onResolve,
  showScreenshotView,
}: Props) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  if (loading) return <p className="muted">Loading...</p>;
  if (rows.length === 0) return <p className="muted">{emptyText}</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Details</th>
            <th>Created</th>
            {showScreenshotView && <th>Screenshot</th>}
            {onResolve && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="muted">#{t.id}</td>
              <td>user #{t.user_id}</td>
              <td style={{ fontWeight: 600 }}>{money(t.amount)}</td>
              <td><span className={`badge ${t.status}`}>{t.status}</span></td>
              <td className="muted">
                {[t.account_name, t.network, t.wallet_address, t.note].filter(Boolean).join(" | ") || "—"}
              </td>
              <td className="muted">{new Date(t.created_at).toLocaleString()}</td>
              {showScreenshotView && (
                <td>
                  {t.screenshot_data ? (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.35rem 0.7rem" }}
                      onClick={() => setScreenshotUrl(t.screenshot_data!)}
                    >
                      View
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              )}
              {onResolve && (
                <td>
                  {t.status === "pending" ? (
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        className="btn"
                        style={{ padding: "0.35rem 0.7rem", display: "flex", gap: "0.3rem" }}
                        onClick={() => onResolve(t.id, "approved")}
                      >
                        <Check size={15} /> Approve
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "0.35rem 0.7rem", display: "flex", gap: "0.3rem" }}
                        onClick={() => onResolve(t.id, "rejected")}
                      >
                        <X size={15} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {screenshotUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "grid",
            placeItems: "center",
            padding: "1rem",
            zIndex: 9999,
          }}
          onClick={() => setScreenshotUrl(null)}
        >
          <div
            style={{
              position: "relative",
              width: "min(90vw, 900px)",
              height: "min(90vh, 800px)",
              maxWidth: "100%",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0f172a",
              borderRadius: "0.75rem",
              boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
              overflow: "hidden",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setScreenshotUrl(null)}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                zIndex: 1,
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                padding: "0.5rem 0.75rem",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <img
              src={screenshotUrl}
              alt="Deposit screenshot"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
