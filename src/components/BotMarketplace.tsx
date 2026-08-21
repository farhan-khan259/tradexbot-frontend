import { Bot, CheckCircle2, LockKeyhole, Wallet, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useBotAccess } from "../bots/BotAccessContext";
import { api, apiError } from "../api/client";

interface TradingBot {
  id: string;
  name: string;
  price: number;
  path: string;
  description: string;
}

const BOTS: TradingBot[] = [
  { id: "free-trading", name: "Free Trading", price: 0, path: "/bot/free", description: "Start trading with the standard AI engine." },
  { id: "basic-funded", name: "Basic Funded", price: 100, path: "/bot/basic-funded", description: "A focused bot setup for funded trading." },
  { id: "pro-funded", name: "Pro Funded", price: 200, path: "/bot/pro-funded", description: "Advanced controls for funded accounts." },
  { id: "basic-bot", name: "Basic Bot", price: 30, path: "/bot/basic-bot", description: "A flexible AI bot for everyday strategies." },
  { id: "pro-bot", name: "Pro Bot", price: 60, path: "/bot/pro-bot", description: "The full AI bot experience for active traders." },
];

const dollars = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BotMarketplace() {
  const navigate = useNavigate();
  const { user, updateBalance, updateFundedBalance, updatePurchasedBots } = useAuth();
  const { purchasedBots } = useBotAccess();
  const walletBalance = Number(user?.balance ?? 0);
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);
  const [insufficientBot, setInsufficientBot] = useState<TradingBot | null>(null);
  const [purchaseError, setPurchaseError] = useState("");

  function selectBot(bot: TradingBot) {
    const isFreeBot = bot.price === 0;
    const isPurchased = purchasedBots.has(bot.id);
    const isLocked = !isFreeBot && !isPurchased;

    if (isLocked) {
      setSelectedBot(bot);
      return;
    }
    navigate(bot.path);
  }

  const [purchasing, setPurchasing] = useState(false);

  async function purchaseSelectedBot() {
    if (!selectedBot) return;
    if (walletBalance < selectedBot.price) {
      setSelectedBot(null);
      setPurchaseError("Wallet balance is not enough. Go and deposit first.");
      setInsufficientBot(selectedBot);
      return;
    }
    setPurchasing(true);
    try {
      const { data } = await api.post("/bot/purchase", { bot_id: selectedBot.id });
      updateBalance(data.balance);
      if (selectedBot.id === "basic-funded" || selectedBot.id === "pro-funded") {
        updateFundedBalance(selectedBot.id, data.funded_balance);
      }
      updatePurchasedBots(data.purchased_bot_ids);
      setSelectedBot(null);
      navigate(selectedBot.path);
    } catch (err) {
      setSelectedBot(null);
      setPurchaseError(apiError(err));
      setInsufficientBot(selectedBot);
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="bot-marketplace">
      <div className="bot-marketplace__heading">
        <div>
          <p className="bot-marketplace__eyebrow">AI trading tools</p>
          <h1>Bot Marketplace</h1>
          <p>Choose a bot to open its trading workspace.</p>
        </div>
        <div className="bot-marketplace__balance"><Wallet size={18} /> Wallet: {dollars(walletBalance)}</div>
      </div>

      <div className="bot-marketplace__grid">
        {BOTS.map((bot) => {
          const isFreeBot = bot.price === 0;
          const isPurchased = purchasedBots.has(bot.id);
          const isLocked = !isFreeBot && !isPurchased;

          return (
            <button
              key={bot.id}
              type="button"
              className={`bot-marketplace__card ${isLocked ? "is-locked" : ""}`}
              onClick={() => selectBot(bot)}
              aria-label={isLocked ? `Purchase ${bot.name} for ${dollars(bot.price)}` : `Open ${bot.name}`}
            >
              <div className="bot-marketplace__card-icon"><Bot size={23} /></div>
              <div className="bot-marketplace__card-copy">
                <h2>{bot.name}</h2>
                <p>{bot.description}</p>
              </div>
              <div className="bot-marketplace__price">{isFreeBot ? "$0" : dollars(bot.price)}</div>
              {!isFreeBot && isPurchased && <div className="bot-marketplace__unlocked"><CheckCircle2 size={16} /> Purchased</div>}
              {isLocked && (
                <div className="bot-marketplace__locked-overlay absolute inset-0 bg-black/50">
                  <LockKeyhole size={29} />
                  <strong>Locked - ${bot.price}</strong>
                  <span>Click to purchase</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedBot && (
        <div className="bot-marketplace__modal-backdrop" role="presentation">
          <section className="bot-marketplace__modal" role="dialog" aria-modal="true" aria-labelledby="purchase-title">
            <button className="bot-marketplace__modal-close" type="button" onClick={() => setSelectedBot(null)} aria-label="Close purchase dialog"><X size={18} /></button>
            <h2 id="purchase-title">Purchase {selectedBot.name}</h2>
            <p>Price: <strong>{dollars(selectedBot.price)}</strong></p>
            <p>Current Balance: <strong>{dollars(walletBalance)}</strong></p>
            <div className="bot-marketplace__modal-actions">
              <button type="button" className="btn btn-primary" disabled={purchasing} onClick={purchaseSelectedBot}>{purchasing ? "Purchasing…" : "Purchase"}</button>
              <button type="button" className="btn btn-ghost" disabled={purchasing} onClick={() => setSelectedBot(null)}>Cancel</button>
            </div>
          </section>
        </div>
      )}

      {insufficientBot && (
        <div className="bot-marketplace__modal-backdrop" role="presentation">
          <section className="bot-marketplace__modal bot-marketplace__modal--error" role="alertdialog" aria-modal="true" aria-labelledby="balance-error-title">
            <h2 id="balance-error-title">Purchase unavailable</h2>
            <p>{purchaseError || "Wallet balance is not enough. Go and deposit first."}</p>
            <div className="bot-marketplace__modal-actions">
              <button type="button" className="btn btn-primary" onClick={() => setInsufficientBot(null)}>Close</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
