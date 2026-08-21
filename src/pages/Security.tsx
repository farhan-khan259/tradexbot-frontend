import { useState } from "react";
import { api, apiError } from "../api/client";

export function Security() {
  const [enabled, setEnabled] = useState(false);
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  async function setup() { try { const { data } = await api.post("/auth/2fa/setup"); setUri(data.provisioning_uri); setMessage("Add this provisioning URI to your authenticator app, then enter the generated code."); } catch (error) { setMessage(apiError(error, "2FA setup failed")); } }
  async function verify() { try { await api.post("/auth/2fa/verify", { code }); setEnabled(true); setUri(""); setMessage("Two-factor authentication enabled."); } catch (error) { setMessage(apiError(error, "Invalid code")); } }
  async function disable() { try { await api.post("/auth/2fa/disable", { code }); setEnabled(false); setMessage("Two-factor authentication disabled."); } catch (error) { setMessage(apiError(error, "Invalid code")); } }

  return (
    <div className="workspace-page workspace-page--security">
      <section className="workspace-hero workspace-hero--security">
        <div>
          <p className="workspace-hero__eyebrow">Protection</p>
          <h1>Security</h1>
          <p className="muted">Manage login protection and verification controls for your account.</p>
        </div>
      </section>

      <section className="card workspace-panel security-panel">
        <div className="security-status-row">
          <p>Two-factor authentication</p>
          <span className={`security-status-pill ${enabled ? "is-enabled" : "is-disabled"}`}>
            {enabled ? "Enabled" : "Not enabled"}
          </span>
        </div>

        {!enabled && (
          <button className="btn" onClick={() => void setup()}>
            Set up TOTP
          </button>
        )}

        {uri && (
          <div className="security-flow">
            <textarea className="input" readOnly value={uri} />
            <input className="input" inputMode="numeric" placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value)} />
            <button className="btn" onClick={() => void verify()}>
              Verify and enable
            </button>
          </div>
        )}

        {enabled && (
          <div className="security-flow">
            <input className="input" inputMode="numeric" placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value)} />
            <button className="btn btn-ghost" onClick={() => void disable()}>
              Disable 2FA
            </button>
          </div>
        )}

        {message && <p className="muted">{message}</p>}
      </section>
    </div>
  );
}