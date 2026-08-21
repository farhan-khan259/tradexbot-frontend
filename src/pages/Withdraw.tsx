import { useEffect, useState } from "react";
import { ArrowUpFromLine, RefreshCw, Wallet } from "lucide-react";
import { api, apiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Transaction } from "../types";

const MIN_WITHDRAWAL = 100;
const WITHDRAW_PRESETS = [100, 250, 500, 1000];

const money = (n: number) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const requestDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export function Withdraw() {
  const { user, refresh } = useAuth();
  const [accountName, setAccountName] = useState("Wallet");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const accountMinimum = accountName === "Basic Funded" ? 700 : accountName === "Pro Funded" ? 1500 : 0;
  const availableBalance = accountName === "Basic Funded"
    ? Number(user?.basic_funded_balance ?? 0)
    : accountName === "Pro Funded"
      ? Number(user?.pro_funded_balance ?? 0)
      : Number(user?.balance ?? 0);
  const amountValue = Number(amount);
  const amountIsValid =
    Number.isFinite(amountValue) &&
    amountValue >= MIN_WITHDRAWAL &&
    amountValue <= availableBalance;

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const { data } = await api.get<Transaction[]>("/transactions");
      setHistory(data.filter((item) => item.type === "withdrawal"));
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function submitWithdrawal() {
    if (availableBalance < Math.max(MIN_WITHDRAWAL, accountMinimum)) {
      setError(`This account must reach ${money(Math.max(MIN_WITHDRAWAL, accountMinimum))} before requesting a withdrawal.`);
      return;
    }

    if (!amountIsValid) {
      setError(`Withdrawal amount must be between ${money(MIN_WITHDRAWAL)} and ${money(availableBalance)}.`);
      return;
    }

    if (!walletAddress.trim()) {
      setError("Please enter your wallet address.");
      return;
    }
    if (!accountName.trim()) {
      setError("Please select the account name.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api.post("/transactions/withdraw", {
        amount: amountValue,
        account_name: accountName,
        wallet_address: walletAddress.trim(),
        network,
        note: note.trim() || null,
      });
      setAccountName("Wallet");
      setAmount("");
      setWalletAddress("");
      setNote("");
      await refresh();
      await loadHistory();
    } catch (err) {
      setError(apiError(err, "Could not submit withdrawal"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="withdraw-page">
      <section className="withdraw-shell">
        <section className="withdraw-hero">
          <div className="withdraw-hero__icon">
            <ArrowUpFromLine size={24} />
          </div>
          <div className="withdraw-hero__content">
            <div>
              <h1>Withdraw Funds</h1>
              <p className="muted">Transfer your balance to your crypto wallet through a secure withdrawal request.</p>
            </div>
            <div className="withdraw-balance-card">
              <div>
                <div className="withdraw-balance-card__label">Available Balance</div>
                <div className="withdraw-balance-card__value">{money(availableBalance)}</div>
                <div className="muted">USD value ready to withdraw</div>
              </div>
              <div className="withdraw-balance-card__wallet">
                <Wallet size={20} />
              </div>
            </div>
          </div>
        </section>

        {availableBalance < Math.max(MIN_WITHDRAWAL, accountMinimum) && (
          <div className="withdraw-warning">
            This account must reach {money(Math.max(MIN_WITHDRAWAL, accountMinimum))} before a withdrawal can be requested.
          </div>
        )}

        <section className="card withdraw-card">
          <h2>New Withdrawal Request</h2>

          <div className="withdraw-grid">
            <label>
              Account Name
              <select className="input" value={accountName} onChange={(e) => setAccountName(e.target.value)}>
                <option value="Wallet">Wallet</option>
                <option value="Basic Funded">Basic Funded</option>
                <option value="Pro Funded">Pro Funded</option>
              </select>
            </label>

            <label>
              Network
              <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </label>
          </div>

          <label>
            Amount (USD)
            <input
              className="input"
              type="number"
              min={MIN_WITHDRAWAL}
              step="0.01"
              max={availableBalance || undefined}
              value={amount}
              placeholder="0.00"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <div className="withdraw-presets">
            {WITHDRAW_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`withdraw-preset ${Number(amount) === preset ? "active" : ""}`}
                onClick={() => setAmount(String(preset))}
                disabled={preset > availableBalance}
              >
                ${preset}
              </button>
            ))}
          </div>

          <label>
            Wallet Address
            <input
              className="input"
              value={walletAddress}
              placeholder="Enter your wallet address"
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </label>

          <label>
            Note <span className="muted">(optional)</span>
            <input
              className="input"
              value={note}
              maxLength={200}
              placeholder="Memo, beneficiary name, or extra details"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <p className="muted">Basic Funded withdrawals unlock at $700. Pro Funded withdrawals unlock at $1,500. Withdrawals will be received within 24-48 hours.</p>

          {error && <p className="error">{error}</p>}

          <button
            className="btn withdraw-action"
            type="button"
            disabled={busy || availableBalance < Math.max(MIN_WITHDRAWAL, accountMinimum)}
            onClick={() => void submitWithdrawal()}
          >
            {busy ? "Submitting..." : "Withdraw"}
          </button>
        </section>

        <section className="card withdraw-history-card">
          <div className="withdraw-history-header">
            <h2>Withdrawal History</h2>
            <button className="withdraw-icon-btn" type="button" onClick={() => void loadHistory()} disabled={loadingHistory}>
              <RefreshCw size={16} className={loadingHistory ? "spin" : ""} />
            </button>
          </div>

          {loadingHistory ? (
            <p className="muted">Loading withdrawal history...</p>
          ) : history.length === 0 ? (
            <div className="withdraw-empty-state">
              <Wallet size={28} />
              <p className="muted">No withdrawal requests yet.</p>
            </div>
          ) : (
            <div className="withdraw-history-list">
              {history.map((item) => (
                <div key={item.id} className="withdraw-history-item">
                  <div>
                    <div className="withdraw-history-item__amount">{money(item.amount)}</div>
                    <div className="muted">{requestDate(item.created_at)}</div>
                    {item.note && <div className="muted withdraw-history-item__note">{item.note}</div>}
                  </div>
                  <span className={`badge ${item.status}`}>{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
