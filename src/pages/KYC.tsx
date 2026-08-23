import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { api, apiError } from "../api/client";

const empty = { full_name: "", date_of_birth: "", country: "", address: "", id_type: "", id_number: "", identity_document: "", proof_of_address: "", selfie_document: "" };
type KycForm = typeof empty;

const countryCodes = "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(" ");
const countries = countryCodes
  .map((code) => ({ code, name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code }))
  .sort((left, right) => left.name.localeCompare(right.name));

export function KYC() {
  const [status, setStatus] = useState("not_verified");
  const [form, setForm] = useState<KycForm>(empty);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => { api.get<{ status?: string }>("/kyc").then(({ data }) => setStatus(data.status ?? "not_verified")); }, []);
  const updateFile = (key: keyof KycForm) => (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, [key]: String(reader.result) })); reader.readAsDataURL(file); };
  const requiredFields = [form.full_name, form.date_of_birth, form.country, form.address, form.id_type, form.id_number, form.identity_document, form.proof_of_address, form.selfie_document];
  const formComplete = requiredFields.every((value) => value.trim().length > 0) && /^\d{2}-\d{2}-\d{4}$/.test(form.date_of_birth);
  async function submit(event: FormEvent) { event.preventDefault(); if (!formComplete) return; try { await api.post("/kyc", form); setStatus("pending"); setMessage(""); setShowSuccess(true); } catch (error) { setMessage(apiError(error, "KYC submission failed")); } }

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
            {(["full_name", "date_of_birth", "address"] as const).map((key) => (
              <label key={key}>
                {key.replace(/_/g, " ")}
                <input
                  className="input"
                  required
                  value={form[key]}
                  placeholder={key === "date_of_birth" ? "DD-MM-YYYY" : undefined}
                  maxLength={key === "date_of_birth" ? 10 : undefined}
                  pattern={key === "date_of_birth" ? "\\d{2}-\\d{2}-\\d{4}" : undefined}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                />
              </label>
            ))}
            <label>
              Country
              <select className="input" required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })}>
                <option value="">Select country</option>
                {countries.map((country) => <option key={country.code} value={country.name}>{country.name}</option>)}
              </select>
            </label>
            <label>
              ID type
              <select className="input" required value={form.id_type} onChange={(event) => setForm({ ...form, id_type: event.target.value })}>
                <option value="">Select ID type</option>
                <option value="CNIC">CNIC</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </label>
            <label>
              ID number
              <input className="input" required value={form.id_number} onChange={(event) => setForm({ ...form, id_number: event.target.value })} />
            </label>
          </div>

          <div className="workspace-panel__header-row">
            <h2>Document Uploads</h2>
          </div>

          <label>
            Identity front picture
            <input className="input" type="file" required onChange={updateFile("identity_document")} />
          </label>
          <label>
            Identity back picture
            <input className="input" type="file" required onChange={updateFile("proof_of_address")} />
          </label>
          <label>
            Selfie / verification document
            <input className="input" type="file" required onChange={updateFile("selfie_document")} />
          </label>

          <button className="btn" disabled={status === "pending" || !formComplete}>Submit verification</button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}
      {showSuccess && (
        <div className="kyc-success-modal" role="dialog" aria-modal="true" aria-labelledby="kyc-success-title">
          <div className="kyc-success-modal__card">
            <div className="kyc-success-modal__icon">✓</div>
            <h2 id="kyc-success-title">KYC verification request submitted</h2>
            <p className="muted">Your verification details and documents were sent for review. We will update your status once the review is complete.</p>
            <button className="btn" type="button" onClick={() => setShowSuccess(false)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}