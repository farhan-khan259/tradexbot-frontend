import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, apiError } from "../api/client";
import { Logo } from "../components/Logo";

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = params.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        new_password: password,
        confirm_password: confirm,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const message = apiError(err, "Could not reset password");
      if (message.includes("expired")) {
        setError("This OTP has expired. Please request a new password reset.");
      } else {
        setError(message);
      }
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
        <h2>Reset with OTP</h2>

        {done ? (
          <p style={{ color: "var(--success)" }}>
            Password updated. Redirecting you to sign in...
          </p>
        ) : (
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
            <label>
              OTP code
              <input
                className="input"
                value={otp}
                required
                minLength={4}
                maxLength={12}
                placeholder="Enter the code from your email"
                onChange={(e) => setOtp(e.target.value)}
              />
            </label>
            <label>
              New password
              <input
                className="input"
                type="password"
                value={password}
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label>
              Confirm password
              <input
                className="input"
                type="password"
                value={confirm}
                required
                minLength={8}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={busy}>
              {busy ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <p className="muted" style={{ marginTop: "1.2rem", textAlign: "center" }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
