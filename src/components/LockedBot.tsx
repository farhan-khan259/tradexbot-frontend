import { CheckCircle2, LockKeyhole, Wallet } from "lucide-react";
import { useState } from "react";
import { api, apiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface LockedBotProps {
  botId: "basic-funded" | "pro-funded" | "basic-bot" | "pro-bot";
  name: string;
  price: number;
  accuracy: number;
  fundedCredit?: number;
}

const dollars = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function LockedBot({ botId, name, price, accuracy, fundedCredit }: LockedBotProps) {
  const { user, updateBalance, updateFundedBalance, updatePurchasedBots } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [purchasedBotIds, setPurchasedBotIds] = useState<string[]>([]);
  const balance = Number(user?.balance ?? 0);

  async function purchase() {
    if (balance < price) {
      setError("Wallet balance is not enough. Go and deposit first.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/bot/purchase", { bot_id: botId });
      updateBalance(data.balance);
      if (botId === "basic-funded" || botId === "pro-funded") {
        updateFundedBalance(botId, data.funded_balance);
      }
      setPurchasedBotIds(data.purchased_bot_ids);
      setPurchased(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="locked-bot" aria-labelledby="locked-bot-title">
      <div className="locked-bot__card">
        <div className="locked-bot__lock"><LockKeyhole size={36} /></div>
        <p className="locked-bot__eyebrow">Bot locked</p>
        <h1 id="locked-bot-title">{name}</h1>
        <div className="locked-bot__price">{dollars(price)}</div>
        <p className="locked-bot__accuracy">{accuracy}% accuracy automated strategy</p>
        {fundedCredit && <p className="locked-bot__funding">Includes <strong>{dollars(fundedCredit)} funded trading capital</strong>, kept separate for funded trades.</p>}
        <div className="locked-bot__wallet"><Wallet size={17} /> Wallet balance: {dollars(balance)}</div>
        <button className="btn btn-primary" type="button" onClick={purchase} disabled={busy}>
          {busy ? "Purchasing…" : `Unlock for ${dollars(price)}`}
        </button>
        {error && <p className="locked-bot__error" role="alert">{error}</p>}
      </div>
      {purchased && (
        <div className="bot-purchase-success" role="dialog" aria-modal="true" aria-labelledby="purchase-success-title">
          <div className="bot-purchase-success__card">
            <CheckCircle2 size={48} />
            <h2 id="purchase-success-title">Congratulations!</h2>
            <p>You have purchased <strong>{name}</strong> successfully.</p>
            <button type="button" className="btn btn-primary" onClick={() => updatePurchasedBots(purchasedBotIds)}>Open bot</button>
          </div>
        </div>
      )}
    </section>
  );
}
