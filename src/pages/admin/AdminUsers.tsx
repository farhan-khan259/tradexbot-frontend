import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api, apiError } from "../../api/client";
import type { User } from "../../types";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get<User[]>("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(apiError(err, "Failed to load users")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.full_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h1>All users</h1>
      <p className="muted">{users.length} registered account{users.length === 1 ? "" : "s"}.</p>

      <div style={{ margin: "1.2rem 0", maxWidth: 360 }}>
        <input
          className="input"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : users.length === 0 ? (
          <p className="muted">No registered users yet.</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No users match your search.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Balance</th>
                  <th>Referral code</th><th>Role</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="muted">#{u.id}</td>
                    <td>{u.full_name}</td>
                    <td className="muted">{u.email}</td>
                    <td style={{ fontWeight: 600 }}>{money(u.balance)}</td>
                    <td className="muted">{u.referral_code}</td>
                    <td>
                      {u.is_admin ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--accent)" }}>
                          <ShieldCheck size={14} /> Admin
                        </span>
                      ) : (
                        <span className="muted">User</span>
                      )}
                    </td>
                    <td className="muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
