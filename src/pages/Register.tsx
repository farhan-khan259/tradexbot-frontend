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
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "1rem", background: "radial-gradient(circle at top, rgba(63,141,117,0.16), transparent 30%), #081311" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, background: "linear-gradient(180deg, rgba(12, 25, 22, 0.98), rgba(10, 18, 17, 0.96))", border: "1px solid rgba(168, 221, 204, 0.2)" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Logo size={44} />
        </div>
        <h2>Create your account</h2>
        <p className="muted" style={{ marginTop: 0 }}>Start your trading journey with TradeXBot</p>
        <form onSubmit={onSubmit} style={{ marginTop: "1.2rem" }}>
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
          <button className="btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1.2rem", textAlign: "center" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
