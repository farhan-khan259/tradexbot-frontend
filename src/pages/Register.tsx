import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../api/client";
import { Logo } from "../components/Logo";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState(params.get("ref") ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        referral_code: referral || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(apiError(err, "Could not create account"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--story">
        <Logo size={50} />
        <p className="auth-panel__eyebrow">Create Account</p>
        <h1>Start your professional trading setup in minutes.</h1>
        <p className="muted">
          Build your profile, fund your wallet, and unlock AI bot strategies through one dashboard.
        </p>
        <div className="auth-story-grid">
          <article className="auth-story-card">
            <strong>Fast onboarding</strong>
            <span>Simple registration with referral support built in.</span>
          </article>
          <article className="auth-story-card">
            <strong>Portfolio control</strong>
            <span>Track transactions, profits, and payouts from day one.</span>
          </article>
        </div>
      </section>

      <section className="card auth-panel auth-panel--form">
        <h2>Create your account</h2>
        <p className="muted">Start your trading journey with TradeXBot</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Full name
            <input className="input" value={fullName} required minLength={2}
              onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label>
            Email
            <input className="input" type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Phone number
            <input
              className="input"
              type="tel"
              value={phone}
              placeholder="+1 234 567 8900"
              required
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label>
            Password
            <input className="input" type="password" value={password} required minLength={8}
              onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            Referral code <span className="muted">(optional)</span>
            <input className="input" value={referral}
              onChange={(e) => setReferral(e.target.value.toUpperCase())} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn auth-form__submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="muted auth-form__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
