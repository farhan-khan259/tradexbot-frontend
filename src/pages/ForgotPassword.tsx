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
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "1rem", background: "radial-gradient(circle at top, rgba(63,141,117,0.16), transparent 30%), #081311" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, background: "linear-gradient(180deg, rgba(12, 25, 22, 0.98), rgba(10, 18, 17, 0.96))", border: "1px solid rgba(168, 221, 204, 0.2)" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Logo size={44} />
        </div>
        <h2>Forgot password</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Enter your email and we&apos;ll send a one-time password to reset your account.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: "1.2rem" }}>
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
          <button className="btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Sending..." : "Send OTP"}
          </button>
          <p className="muted" style={{ marginTop: "1.2rem", textAlign: "center" }}>
            Remembered it? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
