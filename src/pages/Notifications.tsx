import { useEffect, useState } from "react";
import { api, apiError } from "../api/client";

interface Notice { id: string; title: string; message: string; type: string; created_at: string; read: boolean; }

export function Notifications() {
  const [items, setItems] = useState<Notice[]>([]);
  const [error, setError] = useState("");
  const load = () => api.get<{ items: Notice[] }>("/notifications").then(({ data }) => setItems(data.items)).catch((err) => setError(apiError(err, "Notifications unavailable")));
  useEffect(() => { void load(); }, []);
  async function markRead(id: string) { await api.patch(`/notifications/${id}/read`); setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)); }

  return (
    <div className="workspace-page workspace-page--notifications">
      <section className="workspace-hero workspace-hero--notifications">
        <div>
          <p className="workspace-hero__eyebrow">Activity Center</p>
          <h1>Notifications</h1>
          <p className="muted">Account, security, and trading updates from TradeXBot.</p>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card workspace-panel">
        <div className="workspace-panel__header-row">
          <h2>Recent Alerts</h2>
          <p className="muted">Unread first, newest activity at the top.</p>
        </div>

        <div className="notification-list">
          {items.length === 0 ? (
            <div className="workspace-empty muted">No notifications.</div>
          ) : (
            items.map((item) => (
              <article className={`card notification-item ${item.read ? "is-read" : ""}`} key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small className="muted">{new Date(item.created_at).toLocaleString()} · {item.type}</small>
                </div>
                {!item.read && (
                  <button className="btn btn-ghost" onClick={() => void markRead(item.id)}>
                    Mark read
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}