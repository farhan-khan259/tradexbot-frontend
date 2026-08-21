import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { api, apiError } from "../api/client";

const empty = { full_name: "", date_of_birth: "", country: "", address: "", id_type: "", id_number: "", identity_document: "", proof_of_address: "", selfie_document: "" };
type KycForm = typeof empty;

export function KYC() {
  const [status, setStatus] = useState("not_verified");
  const [form, setForm] = useState<KycForm>(empty);
  const [message, setMessage] = useState("");
  useEffect(() => { api.get<{ status?: string }>("/kyc").then(({ data }) => setStatus(data.status ?? "not_verified")); }, []);
  const updateFile = (key: keyof KycForm) => (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, [key]: String(reader.result) })); reader.readAsDataURL(file); };
  async function submit(event: FormEvent) { event.preventDefault(); try { await api.post("/kyc", form); setStatus("pending"); setMessage("Submission received for review."); } catch (error) { setMessage(apiError(error, "KYC submission failed")); } }

  return (
    <div className="workspace-page workspace-page--kyc">
      <section className="workspace-hero workspace-hero--kyc">
        <div>
          <p className="workspace-hero__eyebrow">Identity Verification</p>
          <h1>KYC verification</h1>
          <p className="muted">Complete your profile to unlock higher trust and account capabilities.</p>
        </div>
      </section>

      <section className="card workspace-panel kyc-status-card">
        <div className="security-status-row">
          <p>Current verification status</p>
          <span className={`security-status-pill ${status === "verified" ? "is-enabled" : status === "pending" ? "is-pending" : "is-disabled"}`}>
            {status.replace("_", " ")}
          </span>
        </div>
      </section>

      {status === "verified" ? (
        <section className="card workspace-panel">
          <p>Your identity is verified.</p>
        </section>
      ) : (
        <form className="card workspace-panel kyc-form" onSubmit={submit}>
          <div className="workspace-panel__header-row">
            <h2>Personal Details</h2>
            <p className="muted">All fields are required unless marked optional.</p>
          </div>

          <div className="kyc-fields">
            {(["full_name", "date_of_birth", "country", "address", "id_type", "id_number"] as const).map((key) => (
              <label key={key}>
                {key.replace(/_/g, " ")}
                <input
                  className="input"
                  required
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="workspace-panel__header-row">
            <h2>Document Uploads</h2>
          </div>

          <label>
            Identity document
            <input className="input" type="file" required onChange={updateFile("identity_document")} />
          </label>
          <label>
            Proof of address
            <input className="input" type="file" required onChange={updateFile("proof_of_address")} />
          </label>
          <label>
            Selfie / verification document
            <input className="input" type="file" onChange={updateFile("selfie_document")} />
          </label>

          <button className="btn" disabled={status === "pending"}>Submit verification</button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}
    </div>
  );
}