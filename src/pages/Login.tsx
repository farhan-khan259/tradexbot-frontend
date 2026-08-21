import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../api/client";
import { Logo } from "../components/Logo";

export function Login() {
  const { login } = useAuth();
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
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(apiError(err, "Invalid credentials"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "1rem", background: "radial-gradient(circle at top, rgba(63,141,117,0.16), transparent 30%), #081311" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, background: "linear-gradient(180deg, rgba(12, 25, 22, 0.98), rgba(10, 18, 17, 0.96))", border: "1px solid rgba(168, 221, 204, 0.2)" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Logo size={44} />
        </div>
        <h2>Welcome back</h2>
        <p className="muted" style={{ marginTop: 0 }}>Sign in to your TradeXBot account</p>
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
          <div style={{ textAlign: "right", marginBottom: "0.6rem" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.85rem" }}>Forgot password?</Link>
          </div>
          <button className="btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1.2rem", textAlign: "center" }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
