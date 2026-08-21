import { FormEvent, useEffect, useState } from "react";
import { api, apiError } from "../../api/client";

interface Notice { id: string; title: string; message: string; type: string; status: string; created_at: string; }

export function AdminNotifications() {
  const [items, setItems] = useState<Notice[]>([]);
  const [form, setForm] = useState({ title: "", message: "", type: "information", priority: "normal" });
  const [error, setError] = useState("");
  const load = () => api.get<Notice[]>("/admin/notifications").then(({ data }) => { setItems(data); setError(""); }).catch((err) => setError(apiError(err, "Failed to load notifications")));
  useEffect(() => { void load(); }, []);
  async function submit(event: FormEvent) { event.preventDefault(); try { await api.post("/admin/notifications", { ...form, status: "published" }); setForm({ title: "", message: "", type: "information", priority: "normal" }); await load(); } catch (err) { setError(apiError(err, "Failed to create notification")); } }
  async function publish(id: string) { await api.patch(`/admin/notifications/${id}/publish`); void load(); }
  return <div><h1>Notifications</h1><form className="card admin-notice-form" onSubmit={submit}><input className="input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><textarea className="input" placeholder="Message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /><div className="admin-notice-selects"><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="information">Information</option><option value="warning">Warning</option><option value="maintenance">Maintenance</option><option value="trading">Trading</option><option value="security">Security</option></select><select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option></select></div><button className="btn">Publish notification</button></form>{error && <p className="error">{error}</p>}<div className="card" style={{ marginTop: "1rem" }}>{items.map((item) => <div className="admin-list-row" key={item.id}><div><strong>{item.title}</strong><p className="muted">{item.message}</p><small className="muted">{item.status} · {item.type}</small></div>{item.status !== "published" && <button className="btn btn-ghost" onClick={() => void publish(item.id)}>Publish</button>}</div>)}</div></div>;
}