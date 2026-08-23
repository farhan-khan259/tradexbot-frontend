import { useCallback, useEffect, useRef, useState } from "react";
import { api, apiError } from "../../api/client";

interface Submission { id: string; user_id: string; full_name: string; date_of_birth: string; country: string; address: string; id_type: string; id_number: string; identity_document: string; proof_of_address: string; selfie_document?: string | null; status: string; review_notes?: string; created_at: string; updated_at: string; }
type Document = { label: string; source?: string | null };
const KYC_QUEUE_CACHE_KEY = "tradexbot_admin_kyc_queue";

function readConfirmedQueue(): Submission[] {
  try {
    const saved = sessionStorage.getItem(KYC_QUEUE_CACHE_KEY);
    const items: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(items) ? items as Submission[] : [];
  } catch {
    return [];
  }
}

function saveConfirmedQueue(items: Submission[]) {
  try {
    // Do not put uploaded document images in browser storage. The API remains
    // the source for documents; this cache only prevents the review rows vanishing.
    sessionStorage.setItem(KYC_QUEUE_CACHE_KEY, JSON.stringify(items.map((item) => ({
      ...item,
      identity_document: "",
      proof_of_address: "",
      selfie_document: null,
    }))));
  } catch {
    // A disabled or full browser storage must not affect the review queue.
  }
}

export function AdminKYC() {
  const confirmedItems = useRef<Submission[]>(readConfirmedQueue());
  const [items, setItems] = useState<Submission[]>(() => confirmedItems.current);
  const [error, setError] = useState("");
  const [document, setDocument] = useState<Document | null>(null);
  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Submission[]>("/admin/kyc");

      // KYC submissions are never deleted by this application. Keep the last
      // confirmed queue visible if a polling request unexpectedly returns empty.
      if (data.length === 0 && confirmedItems.current.length > 0) {
        setItems(confirmedItems.current);
        setError("The latest queue refresh returned no submissions. Showing the last confirmed queue.");
        return;
      }

      confirmedItems.current = data;
      saveConfirmedQueue(data);
      setItems(data);
      setError("");
    } catch (err) {
      setError(apiError(err, "Failed to load KYC submissions"));
    }
  }, []);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(interval);
  }, [load]);
  async function review(userId: string, status: string) { try { await api.patch(`/admin/kyc/${userId}`, { status }); void load(); } catch (err) { setError(apiError(err, "Review failed")); } }
  return <div className="admin-kyc-page"><div className="admin-page-heading"><div><p className="workspace-hero__eyebrow">Identity review queue</p><h1>KYC review</h1><p className="muted">Review every submitted detail and document before approving an account.</p></div><span className="admin-kyc-count">{items.length} submission{items.length === 1 ? "" : "s"}</span></div>{error && <p className="error">{error}</p>}<div className="card admin-kyc-table-panel">{items.length === 0 ? <div className="admin-kyc-empty"><p className="muted">No submissions.</p></div> : <div className="admin-kyc-table-wrap"><table className="admin-kyc-table"><thead><tr><th>User</th><th>Personal details</th><th>Address</th><th>Documents</th><th>Status</th><th>Review notes</th><th>Review</th></tr></thead><tbody>{items.map((item) => <tr key={item.user_id}><td><strong>{item.full_name}</strong><span className="admin-kyc-table__meta">{item.user_id}</span><span className="admin-kyc-table__meta">{new Date(item.updated_at || item.created_at).toLocaleString()}</span></td><td><span>{item.country}</span><span className="admin-kyc-table__meta">DOB: {item.date_of_birth}</span><span className="admin-kyc-table__meta">{item.id_type}: {item.id_number}</span></td><td className="admin-kyc-table__address">{item.address}</td><td><div className="admin-kyc-table__documents"><DocumentButton label="Identity front picture" source={item.identity_document} onShow={setDocument} /><DocumentButton label="Identity back picture" source={item.proof_of_address} onShow={setDocument} /><DocumentButton label="Selfie" source={item.selfie_document} onShow={setDocument} /></div></td><td><span className={`badge ${item.status}`}>{item.status.replace("_", " ")}</span></td><td className="admin-kyc-table__address">{item.review_notes || "No review notes"}</td><td><div className="admin-kyc-table__actions"><button className="btn" onClick={() => void review(item.user_id, "verified")} disabled={item.status === "verified"}>Approve</button><button className="btn btn-ghost" onClick={() => void review(item.user_id, "rejected")} disabled={item.status === "rejected"}>Reject</button><button className="btn btn-ghost" onClick={() => void review(item.user_id, "resubmission_required")}>Request resubmission</button></div></td></tr>)}</tbody></table></div>}</div>{document && <div className="admin-document-modal" role="dialog" aria-modal="true" aria-labelledby="document-modal-title" onClick={() => setDocument(null)}><div className="admin-document-modal__card" onClick={(event) => event.stopPropagation()}><div className="admin-document-modal__header"><h2 id="document-modal-title">{document.label}</h2><button className="btn btn-ghost" type="button" onClick={() => setDocument(null)}>Close</button></div>{document.source ? <img src={document.source} alt={document.label} /> : <p className="muted">Document not provided.</p>}</div></div>}</div>;
}

function DocumentButton({ label, source, onShow }: { label: string; source?: string | null; onShow: (document: Document) => void }) {
  return <button className="admin-kyc-document-button" type="button" disabled={!source} onClick={() => onShow({ label, source })}>{source ? "Show" : "Unavailable"}<span>{label}</span></button>;
}
