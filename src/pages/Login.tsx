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
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password, twoFactorCode || undefined);
      navigate("/dashboard");
    } catch (err) {
      const message = apiError(err, "Invalid credentials");
      setError(message);
      if (message.toLowerCase().includes("two-factor")) setRequiresTwoFactor(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--story">
        <Logo size={50} />
        <p className="auth-panel__eyebrow">Secure Access</p>
        <h1>Welcome back to your trading workspace.</h1>
        <p className="muted">
          Monitor positions, manage funds, and run your AI bot sessions from one place.
        </p>
        <div className="auth-story-grid">
          <article className="auth-story-card">
            <strong>Live data</strong>
            <span>Track market activity with real-time account updates.</span>
          </article>
          <article className="auth-story-card">
            <strong>Protected account</strong>
            <span>Two-factor sign-in and secure request validation.</span>
          </article>
        </div>
      </section>

      <section className="card auth-panel auth-panel--form">
        <h2>Welcome back</h2>
        <p className="muted">Sign in to your TradeXBot account</p>
        <form onSubmit={onSubmit} className="auth-form">
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
          {requiresTwoFactor && <label>Authenticator code<input className="input" inputMode="numeric" autoComplete="one-time-code" value={twoFactorCode} required onChange={(e) => setTwoFactorCode(e.target.value)} /></label>}
          {error && <p className="error">{error}</p>}
          <div className="auth-form__meta">
            <Link to="/forgot-password" style={{ fontSize: "0.85rem" }}>Forgot password?</Link>
          </div>
          <button className="btn auth-form__submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted auth-form__footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
