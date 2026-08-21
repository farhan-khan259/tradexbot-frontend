import { useEffect, useState } from "react";
import { api, apiError } from "../../api/client";

interface Audit { id: string; user_id?: string; action: string; result: string; entity?: string; created_at: string; }

export function AdminAudit() {
  const [items, setItems] = useState<Audit[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get<Audit[]>("/admin/audit-logs").then(({ data }) => setItems(data)).catch((err) => setError(apiError(err, "Failed to load audit logs"))); }, []);
  return <div><h1>Audit logs</h1><p className="muted">Sensitive account and trading operations.</p>{error && <p className="error">{error}</p>}<div className="card"><div style={{ overflowX: "auto" }}><table><thead><tr><th>Action</th><th>Result</th><th>User</th><th>Entity</th><th>Time</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.action}</td><td><span className={`badge ${item.result}`}>{item.result}</span></td><td className="muted">{item.user_id ?? "system"}</td><td className="muted">{item.entity ?? "-"}</td><td className="muted">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></div></div>;
}