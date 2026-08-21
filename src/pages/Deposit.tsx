import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  CheckCircle2,
  Copy,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import { api, apiError } from "../api/client";
import type { Transaction } from "../types";

const MIN_DEPOSIT = 30;
const PRESET_AMOUNTS = [50, 100, 500, 1000, 5000];
const WALLET_ADDRESS = "TFEnwGWNtPo7c5i6X681hnCuLwZhJFvfza";

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const depositDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export function Deposit() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("100");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const amountValue = Number(amount);
  const amountIsValid = Number.isFinite(amountValue) && amountValue >= MIN_DEPOSIT;

  const depositNote = useMemo(() => {
    const base = "USDT TRC20";
    const trimmedReference = reference.trim();
    return trimmedReference ? `${base} | ${trimmedReference}` : "";
  }, [reference]);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const { data } = await api.get<Transaction[]>("/transactions");
      setHistory(data.filter((item) => item.type === "deposit"));
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
      setCopied(true);
    } catch {
      setError("Could not copy the wallet address");
    }
  }

  function onScreenshotChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setScreenshotData(null);
      setScreenshotName("");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Screenshot must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotData(typeof reader.result === "string" ? reader.result : null);
      setScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function submitDeposit() {
    if (!amountIsValid) {
      setError(`Minimum deposit is ${money(MIN_DEPOSIT)}.`);
      return;
    }

    if (!depositNote) {
      setError("Transaction reference or note is required.");
      return;
    }

    if (!screenshotData) {
      setError("Upload the payment screenshot");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api.post("/transactions/deposit", {
        amount: amountValue,
        note: depositNote,
        screenshot_data: screenshotData,
      });
      setReference("");
      setScreenshotData(null);
      setScreenshotName("");
      await loadHistory();
    } catch (err) {
      setError(apiError(err, "Could not submit deposit"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="deposit-page workspace-page workspace-page--deposit">
      <section className="deposit-hero workspace-hero workspace-hero--deposit">
        <div className="deposit-hero__icon">
          <ArrowDownToLine size={24} />
        </div>
        <div>
          <h1>Fund Your Account</h1>
          <p className="muted">Secure crypto deposit with manual admin confirmation after payment is sent.</p>
          <div className="deposit-pill">
            <Shield size={14} />
            <span>USDT TRC20</span>
          </div>
        </div>
      </section>

      <section className="card deposit-card workspace-panel">
        <div className="deposit-steps">
          {[1, 2, 3].map((item) => {
            const isDone = item < step;
            const isActive = item === step;
            return (
              <div key={item} className="deposit-step">
                <div className={`deposit-step__bubble ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                  {isDone ? <Check size={16} /> : item}
                </div>
                <div className={`deposit-step__label ${isActive ? "active" : isDone ? "done" : ""}`}>
                  {item === 1 ? "Amount" : item === 2 ? "Select Crypto" : "Payment"}
                </div>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="deposit-panel">
            <label className="deposit-field">
              <span>Deposit Amount</span>
              <div className="deposit-amount-box">
                <span className="deposit-amount-box__currency">$</span>
                <input
                  className="deposit-amount-box__input"
                  type="number"
                  min={MIN_DEPOSIT}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                />
              </div>
            </label>

            <p className="muted">Minimum deposit: {money(MIN_DEPOSIT)}</p>

            <div className="deposit-presets">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`deposit-preset ${Number(amount) === preset ? "active" : ""}`}
                  onClick={() => setAmount(String(preset))}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {error && <p className="error">{error}</p>}

            <button
              className="btn deposit-action"
              type="button"
              disabled={!amountIsValid}
              onClick={() => {
                setError("");
                setStep(2);
              }}
            >
              {"Continue ->"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="deposit-panel">
            <div className="deposit-summary-row">
              <div className="muted">Deposit amount</div>
              <div className="deposit-summary-row__value">
                {money(amountValue || 0)}
                <button type="button" className="deposit-link-btn" onClick={() => setStep(1)}>
                  change
                </button>
              </div>
            </div>

            <div>
              <h3 className="deposit-section-title">Select Cryptocurrency</h3>
              <button type="button" className="deposit-option-card active">
                <div className="deposit-option-card__icon">U</div>
                <div>
                  <strong>USDT</strong>
                  <div className="muted">Tether</div>
                </div>
              </button>
            </div>

            <div>
              <h3 className="deposit-section-title">Select Network</h3>
              <div className="deposit-network-tag">TRC20</div>
              <p className="muted">Only the TRON network is available for this wallet.</p>
            </div>

            <div className="deposit-warning">
              Send only USDT on the TRC20 network. Sending another token or network can result in lost funds.
            </div>

            <div className="deposit-actions-row">
              <button className="btn deposit-action" type="button" onClick={() => setStep(3)}>
                {"Get Payment Address ->"}
              </button>
              <button className="deposit-back-btn" type="button" onClick={() => setStep(1)}>
                {"<- Back"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="deposit-panel">
            <div className="deposit-pay-header">
              <div className="deposit-pay-header__icon">
                <Wallet size={20} />
              </div>
              <div>
                <h3>USDT / TRC20</h3>
                <p className="muted">Send exactly the amount shown below, then submit your deposit request.</p>
              </div>
            </div>

            <div className="deposit-payment-box">
              <img className="deposit-qr" src="/qr-code.jpeg" alt="USDT TRC20 wallet QR code" />

              <div className="deposit-wallet-label">Wallet address</div>
              <div className="deposit-wallet-address">{WALLET_ADDRESS}</div>

              <button className="btn deposit-action" type="button" onClick={() => void copyAddress()}>
                <Copy size={16} />
                {copied ? "Copied" : "Copy Address"}
              </button>

              <div className="deposit-stats">
                <div className="deposit-stat-card">
                  <div className="deposit-stat-card__label">Send amount</div>
                  <div className="deposit-stat-card__value">{money(amountValue || 0)}</div>
                </div>
                <div className="deposit-stat-card">
                  <div className="deposit-stat-card__label">Network</div>
                  <div className="deposit-stat-card__value">TRC20</div>
                </div>
              </div>
            </div>

            <div className="deposit-success-note">
              <CheckCircle2 size={18} />
              <span>After sending the funds, submit the request below so the admin can verify and approve it.</span>
            </div>

            <label className="deposit-field">
              <span>Transaction reference or note (required)</span>
              <input
                className="input"
                value={reference}
                maxLength={240}
                placeholder="Enter TXID, sender wallet, or any note"
                onChange={(e) => setReference(e.target.value)}
              />
            </label>

            <label className="deposit-field">
              <span>Upload Screenshot</span>
              <div className="deposit-upload-row">
                <label className="btn btn-ghost deposit-upload-btn">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      setError("");
                      onScreenshotChange(event);
                    }}
                  />
                  {screenshotName ? "Replace Screenshot" : "Upload Screenshot"}
                </label>
                <span className="muted deposit-upload-name">
                  {screenshotName || "PNG, JPG, or WEBP up to 2 MB"}
                </span>
              </div>
            </label>

            {error && <p className="error">{error}</p>}

            <div className="deposit-actions-row">
              <button className="btn deposit-action" type="button" disabled={busy} onClick={() => void submitDeposit()}>
                {busy ? "Submitting..." : "I've Sent Payment"}
              </button>
              <button className="deposit-back-btn" type="button" onClick={() => setStep(2)}>
                {"<- Back"}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card deposit-history-card workspace-panel">
        <div className="deposit-history-header">
          <div>
            <h2>Deposit History</h2>
            <p className="muted">Track submitted deposit requests and their approval status.</p>
          </div>
          <button className="deposit-icon-btn" type="button" onClick={() => void loadHistory()} disabled={loadingHistory}>
            <RefreshCw size={16} className={loadingHistory ? "spin" : ""} />
          </button>
        </div>

        {loadingHistory ? (
          <p className="muted">Loading deposit history...</p>
        ) : history.length === 0 ? (
          <p className="muted">No deposit requests yet.</p>
        ) : (
          <div className="deposit-history-list">
            {history.map((item) => (
              <div key={item.id} className="deposit-history-item">
                <div>
                  <div className="deposit-history-item__amount">{money(item.amount)}</div>
                  <div className="muted">{depositDate(item.created_at)}</div>
                  {item.note && <div className="muted deposit-history-item__note">{item.note}</div>}
                  {item.screenshot_data && <div className="muted deposit-history-item__note">Screenshot attached</div>}
                </div>
                <span className={`badge ${item.status}`}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
