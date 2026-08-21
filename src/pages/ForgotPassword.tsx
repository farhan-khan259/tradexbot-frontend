import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiError } from "../api/client";
import { Logo } from "../components/Logo";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(apiError(err, "Could not process request"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--story">
        <Logo size={50} />
        <p className="auth-panel__eyebrow">Account Recovery</p>
        <h1>Reset your password and get back to trading quickly.</h1>
        <p className="muted">
          We will send a one-time code to your email so you can securely set a new password.
        </p>
      </section>

      <section className="card auth-panel auth-panel--form">
        <h2>Forgot password</h2>
        <p className="muted">
          Enter your email and we&apos;ll send a one-time password to reset your account.
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn auth-form__submit" disabled={busy}>
            {busy ? "Sending..." : "Send OTP"}
          </button>
          <p className="muted auth-form__footer">
            Remembered it? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
