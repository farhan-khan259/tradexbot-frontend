import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { apiError } from "../../api/client";
import { Logo } from "../../components/Logo";

export function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(email, password);
      if (!u) {
        setError("Invalid credentials");
      } else if (!u.is_admin) {
        // Authenticated, but not an admin — don't keep them signed in here.
        logout();
        setError("This account does not have admin access.");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(apiError(err, "Invalid credentials"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "1rem", background: "radial-gradient(circle at top, rgba(63,141,117,0.16), transparent 30%), #081311" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, background: "linear-gradient(180deg, rgba(12, 25, 22, 0.98), rgba(10, 18, 17, 0.96))", border: "1px solid rgba(168, 221, 204, 0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Logo size={40} />
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              padding: "0.25rem 0.6rem", borderRadius: 999, border: "1px solid var(--border)",
              color: "var(--accent)", fontSize: "0.72rem", fontWeight: 700,
            }}
          >
            <ShieldCheck size={13} /> ADMIN
          </span>
        </div>
        <h2>Admin sign in</h2>
        <p className="muted" style={{ marginTop: 0 }}>Restricted area — administrators only.</p>
        <form onSubmit={onSubmit} style={{ marginTop: "1.2rem" }}>
          <label>
            Email
            <input className="input" type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input className="input" type="password" value={password} required
              onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
