import { useEffect, useState } from "react";
import { api, apiError } from "../../api/client";

interface Submission { user_id: string; full_name: string; country: string; status: string; review_notes?: string; }

export function AdminKYC() {
  const [items, setItems] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const load = () => api.get<Submission[]>("/admin/kyc").then(({ data }) => setItems(data)).catch((err) => setError(apiError(err, "Failed to load KYC submissions")));
  useEffect(() => { void load(); }, []);
  async function review(userId: string, status: string) { try { await api.patch(`/admin/kyc/${userId}`, { status }); void load(); } catch (err) { setError(apiError(err, "Review failed")); } }
  return <div><h1>KYC review</h1>{error && <p className="error">{error}</p>}<div className="card">{items.length === 0 ? <p className="muted">No submissions.</p> : items.map((item) => <div className="admin-list-row" key={item.user_id}><div><strong>{item.full_name}</strong><p className="muted">{item.country} · {item.user_id}</p><small className="muted">{item.status}</small></div><div className="admin-actions"><button className="btn" onClick={() => void review(item.user_id, "verified")}>Approve</button><button className="btn btn-ghost" onClick={() => void review(item.user_id, "rejected")}>Reject</button><button className="btn btn-ghost" onClick={() => void review(item.user_id, "resubmission_required")}>Request resubmission</button></div></div>)}</div></div>;
}