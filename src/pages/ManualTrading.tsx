import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CandlestickChart,
  ChevronDown,
  Clock3,
  Crosshair,
  DollarSign,
  Minus,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { fetchMarketCandles, type MarketCandle } from "../api/market";
import { api, apiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "./ManualTrading.css";

const PAIRS = [
  { symbol: "BTC", label: "BTC / USDT", name: "Bitcoin", decimals: 2, color: "#f2b84b", seed: 68000 },
  { symbol: "ETH", label: "ETH / USDT", name: "Ethereum", decimals: 2, color: "#8da8ff", seed: 3500 },
  { symbol: "BNB", label: "BNB / USDT", name: "BNB", decimals: 2, color: "#f5d36b", seed: 620 },
  { symbol: "SOL", label: "SOL / USDT", name: "Solana", decimals: 2, color: "#a88cff", seed: 170 },
  { symbol: "XRP", label: "XRP / USDT", name: "XRP", decimals: 4, color: "#71d9c4", seed: 0.62 },
  { symbol: "ADA", label: "ADA / USDT", name: "Cardano", decimals: 4, color: "#75baff", seed: 0.38 },
];

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];
const EXPIRIES = [
  { label: "5 seconds", value: 5 },
  { label: "10 seconds", value: 10 },
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "15 minutes", value: 900 },
  { label: "1 hour", value: 3600 },
];

type Indicator = "sma" | "ema" | "rsi";
type Side = "BUY" | "SELL";
interface Position { id: string; pair: string; side: Side; entry: number; stake: number; expiresAt: number; }

interface ManualPositionResponse {
  id: string;
  pair: string;
  side: Side;
  amount: number;
  entry_price: number;
  expires_at: string;
  balance?: number;
  win?: boolean | null;
  profit_loss?: number;
}

interface TradeResult {
  pair: string;
  win: boolean;
  profitLoss: number;
}

const formatPrice = (value: number, decimals: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

function fallbackCandles(pair: typeof PAIRS[number], timeframe: string): MarketCandle[] {
  const timeframeSeed = timeframe.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  let price = pair.seed;
  return Array.from({ length: 72 }, (_, index) => {
    const wave = Math.sin((index + timeframeSeed) / 4.7) * 0.004;
    const drift = ((index % 9) - 4) * 0.0007;
    const open = price;
    const close = Math.max(pair.seed * 0.72, open * (1 + wave + drift));
    const high = Math.max(open, close) * 1.0025;
    const low = Math.min(open, close) * 0.9975;
    price = close;
    return { time: Date.now() - (72 - index) * 60_000, o: open, h: high, l: low, c: close, v: 35 + (index * 17) % 65 };
  });
}

function movingAverage(values: number[], length: number, exponential = false): Array<number | null> {
  return values.map((_, index) => {
    if (index < length - 1) return null;
    if (!exponential) return values.slice(index - length + 1, index + 1).reduce((sum, value) => sum + value, 0) / length;
    const smoothing = 2 / (length + 1);
    let average = values[index - length + 1];
    for (let cursor = index - length + 2; cursor <= index; cursor += 1) average = values[cursor] * smoothing + average * (1 - smoothing);
    return average;
  });
}

function rsi(values: number[], length = 14): Array<number | null> {
  return values.map((_, index) => {
    if (index < length) return null;
    let gains = 0;
    let losses = 0;
    for (let cursor = index - length + 1; cursor <= index; cursor += 1) {
      const change = values[cursor] - values[cursor - 1];
      if (change >= 0) gains += change; else losses += Math.abs(change);
    }
    return losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));
  });
}

export function ManualTrading() {
  const { updateBalance } = useAuth();
  const [pairSymbol, setPairSymbol] = useState("BTC");
  const [timeframe, setTimeframe] = useState("5m");
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [amount, setAmount] = useState("25");
  const [expiry, setExpiry] = useState(300);
  const [indicators, setIndicators] = useState<Indicator[]>(["sma"]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);
  const settlingPositions = useRef(new Set<string>());
  const [chartStart, setChartStart] = useState(0);
  const [chartVisibleCount, setChartVisibleCount] = useState(50);
  const [dragX, setDragX] = useState<number | null>(null);

  const pair = PAIRS.find((item) => item.symbol === pairSymbol) ?? PAIRS[0];
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const price = last?.c ?? pair.seed;
  const change = previous ? ((price - previous.c) / previous.c) * 100 : 0;
  const closes = candles.map((candle) => candle.c);
  const rsiValues = useMemo(() => rsi(closes), [closes]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchMarketCandles(pair.symbol, timeframe, controller.signal);
        if (mounted) { setCandles(result.length ? result : fallbackCandles(pair, timeframe)); setError(""); }
      } catch (requestError) {
        if (mounted) { setCandles(fallbackCandles(pair, timeframe)); setError(apiError(requestError, "Live feed unavailable. Showing simulated market data.")); }
      } finally { if (mounted) setLoading(false); }
    };
    void load();
    const interval = window.setInterval(load, 15_000);
    return () => { mounted = false; controller.abort(); window.clearInterval(interval); };
  }, [pair.symbol, timeframe]);

  useEffect(() => setChartStart(0), [pair.symbol, timeframe]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCandles((current) => {
        if (!current.length) return current;
        const latest = current[current.length - 1];
        const movement = (Math.random() - 0.47) * 0.0018;
        const close = Math.max(0.000001, latest.c * (1 + movement));
        return [...current.slice(0, -1), {
          ...latest,
          h: Math.max(latest.h, close),
          l: Math.min(latest.l, close),
          c: close,
          v: Math.min(100, latest.v + 1),
        }];
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadPositions = async () => {
      try {
        const { data } = await api.get<{ items: ManualPositionResponse[]; balance: number }>("/manual-trading/positions");
        if (!mounted) return;
        setBalance(data.balance);
        updateBalance(data.balance);
        setPositions(data.items.map((item) => ({ id: item.id, pair: item.pair, side: item.side, entry: item.entry_price, stake: item.amount, expiresAt: new Date(item.expires_at).getTime() })));
      } catch (requestError) {
        if (mounted) setError(apiError(requestError, "Could not load manual positions."));
      }
    };
    void loadPositions();
    const interval = window.setInterval(loadPositions, 15_000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    const expired = positions.filter((position) => position.expiresAt <= now - 2000 && !settlingPositions.current.has(position.id));
    if (!expired.length) return;
    expired.forEach((position) => settlingPositions.current.add(position.id));
    void Promise.all(expired.map(async (position) => {
      try {
        const { data } = await api.post<ManualPositionResponse>(`/manual-trading/positions/${position.id}/settle`);
        if (data.balance !== undefined) {
          setBalance(data.balance);
          updateBalance(data.balance);
        }
        if (data.win !== undefined && data.win !== null) {
          setTradeResult({ pair: position.pair, win: data.win, profitLoss: data.profit_loss ?? 0 });
        }
        return position.id;
      } catch (requestError) {
        if (apiError(requestError) !== "Position has not reached expiry") {
          setError(apiError(requestError, "Could not settle manual position."));
        } else {
          setError("");
        }
        settlingPositions.current.delete(position.id);
        return null;
      }
    })).then((settledIds) => {
      const ids = new Set(settledIds.filter((id): id is string => Boolean(id)));
      if (ids.size) setPositions((current) => current.filter((position) => !ids.has(position.id)));
    });
  }, [now, positions]);

  useEffect(() => {
    if (!tradeResult) return;
    const timeout = window.setTimeout(() => setTradeResult(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [tradeResult]);

  function toggleIndicator(indicator: Indicator) {
    setIndicators((current) => current.includes(indicator) ? current.filter((item) => item !== indicator) : [...current, indicator]);
  }

  function handleChartPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragX(event.clientX);
  }

  function handleChartPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (dragX === null) return;
    const distance = dragX - event.clientX;
    if (Math.abs(distance) < 18) return;
    const step = distance > 0 ? 1 : -1;
    setChartStart((current) => Math.max(0, Math.min(Math.max(candles.length - chartVisibleCount, 0), current + step)));
    setDragX(event.clientX);
  }

  function stopChartDrag(event: React.PointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragX(null);
  }

  async function placeOrder(side: Side) {
    const stake = Number(amount);
    if (!Number.isFinite(stake) || stake < 1) { setError("Enter a stake of at least $1."); return; }
    setSelectedSide(side);
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post<ManualPositionResponse>("/manual-trading/positions", {
        pair: pair.label,
        side,
        amount: stake,
        duration: expiry,
        timeframe,
        entry_price: price,
      });
      setPositions((current) => [...current, { id: data.id, pair: data.pair, side: data.side, entry: data.entry_price, stake: data.amount, expiresAt: new Date(data.expires_at).getTime() }]);
      if (data.balance !== undefined) { setBalance(data.balance); updateBalance(data.balance); }
    } catch (requestError) {
      setError(apiError(requestError, "Could not open manual position."));
    } finally {
      setBusy(false);
    }
  }

  const W = 900;
  const H = 410;
  const chartTop = 24;
  const chartBottom = 330;
  const right = 82;
  const left = 18;
  const visibleCandles = candles.slice(chartStart, chartStart + chartVisibleCount);
  const visibleCloses = visibleCandles.map((candle) => candle.c);
  const visibleMax = Math.max(...visibleCandles.map((candle) => candle.h), price * 1.01);
  const visibleMin = Math.min(...visibleCandles.map((candle) => candle.l), price * 0.99);
  const max = Number.isFinite(visibleMax) ? visibleMax : price * 1.01;
  const min = Number.isFinite(visibleMin) ? visibleMin : price * 0.99;
  const range = max - min || 1;
  const x = (index: number) => left + (index / Math.max(visibleCandles.length - 1, 1)) * (W - left - right);
  const y = (value: number) => chartTop + (1 - (value - min) / range) * (chartBottom - chartTop);
  const slot = (W - left - right) / Math.max(visibleCandles.length, 1);
  const priceTicks = Array.from({ length: 6 }, (_, index) => max - (range / 5) * index);
  const linePath = (values: Array<number | null>) => values.map((value, index) => value === null ? "" : `${index && values[index - 1] !== null ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");

  return (
    <div className="manual-trading workspace-page">
      <section className="workspace-hero manual-trading__hero">
        <div>
          <p className="workspace-hero__eyebrow">AI Free Trader / Manual Trading</p>
          <h1>Trade the market yourself.</h1>
          <p className="muted">Choose a pair, read the live chart, and place a timed buy or sell position.</p>
        </div>
        <div className="manual-trading__connection"><span /> {loading ? "Updating feed" : "Market open"}</div>
      </section>

      <section className="manual-trading__toolbar workspace-panel">
        <div className="manual-trading__pair-picker">
          <label htmlFor="manual-pair">Trading pair</label>
          <div className="manual-trading__select-wrap"><select id="manual-pair" className="input" value={pairSymbol} onChange={(event) => setPairSymbol(event.target.value)}>{PAIRS.map((item) => <option key={item.symbol} value={item.symbol}>{item.label} · {item.name}</option>)}</select><ChevronDown size={16} /></div>
        </div>
        <div className="manual-trading__timeframes" aria-label="Chart timeframe">{TIMEFRAMES.map((item) => <button key={item} type="button" className={item === timeframe ? "is-active" : ""} onClick={() => setTimeframe(item)}>{item}</button>)}</div>
        <div className="manual-trading__toolbar-actions">
          <button type="button" className={`manual-tool ${indicators.includes("sma") ? "is-active" : ""}`} onClick={() => toggleIndicator("sma")}><TrendingUp size={15} /> SMA</button>
          <button type="button" className={`manual-tool ${indicators.includes("ema") ? "is-active" : ""}`} onClick={() => toggleIndicator("ema")}><Activity size={15} /> EMA</button>
          <button type="button" className={`manual-tool ${indicators.includes("rsi") ? "is-active" : ""}`} onClick={() => toggleIndicator("rsi")}><BarChart3 size={15} /> RSI</button>
        </div>
      </section>

      <section className="manual-trading__workspace">
        <div className="manual-trading__chart-card workspace-panel">
          <div className="manual-trading__chart-header">
            <div className="manual-trading__instrument"><span style={{ background: pair.color }}>{pair.symbol.slice(0, 1)}</span><div><strong>{pair.label}</strong><small>{pair.name} · {timeframe} · TradeX live feed</small></div></div>
            <div className="manual-trading__quote"><strong>{formatPrice(price, pair.decimals)}</strong><span className={change >= 0 ? "is-up" : "is-down"}>{change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%</span></div>
          </div>
          <div className="manual-trading__chart-tools"><span><CandlestickChart size={15} /> Candles</span><span><Crosshair size={15} /> Crosshair</span><div className="manual-trading__zoom" aria-label="Chart zoom controls"><button type="button" onClick={() => { setChartVisibleCount((current) => Math.max(20, current - 10)); setChartStart(0); }} disabled={chartVisibleCount <= 20} aria-label="Zoom in"><ZoomIn size={14} /></button><button type="button" onClick={() => { setChartVisibleCount((current) => Math.min(72, current + 10)); setChartStart(0); }} disabled={chartVisibleCount >= 72} aria-label="Zoom out"><ZoomOut size={14} /></button></div><span className="manual-trading__feed"><i /> {error ? "Simulated feed" : "Live feed"}</span></div>
          <div className="manual-trading__chart-scroll">
            <svg viewBox={`0 0 ${W} ${H}`} className="manual-trading__chart" role="img" aria-label={`${pair.label} candlestick chart`} onPointerDown={handleChartPointerDown} onPointerMove={handleChartPointerMove} onPointerUp={stopChartDrag} onPointerCancel={stopChartDrag}>
              <defs><linearGradient id="manual-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pair.color} stopOpacity=".16" /><stop offset="1" stopColor={pair.color} stopOpacity="0" /></linearGradient></defs>
              <rect width={W} height={H} fill="#091b25" />
              {priceTicks.map((tick) => <g key={tick}><line x1={left} x2={W - right} y1={y(tick)} y2={y(tick)} /><text x={W - right + 12} y={y(tick) + 4}>{formatPrice(tick, pair.decimals).replace("$", "")}</text></g>)}
              {Array.from({ length: 8 }, (_, index) => <line key={index} x1={left + ((W - left - right) / 7) * index} x2={left + ((W - left - right) / 7) * index} y1={chartTop} y2={chartBottom} className="manual-trading__vertical-grid" />)}
              {visibleCandles.length > 1 && <path d={`${visibleCandles.map((candle, index) => `${index ? "L" : "M"}${x(index)},${y(candle.c)}`).join(" ")} L${x(visibleCandles.length - 1)},${chartBottom} L${x(0)},${chartBottom} Z`} fill="url(#manual-chart-fill)" />}
              {visibleCandles.map((candle, index) => { const bullish = candle.c >= candle.o; const candleX = x(index); const bodyTop = Math.min(y(candle.o), y(candle.c)); return <g key={candle.time}><line x1={candleX} x2={candleX} y1={y(candle.h)} y2={y(candle.l)} className={bullish ? "is-bull" : "is-bear"} /><rect x={candleX - Math.max(2, slot * .28)} y={bodyTop} width={Math.max(4, slot * .56)} height={Math.max(2, Math.abs(y(candle.o) - y(candle.c)))} className={bullish ? "is-bull-fill" : "is-bear-fill"} /></g>; })}
              {indicators.includes("sma") && <path d={linePath(movingAverage(visibleCloses, 14))} className="manual-indicator manual-indicator--sma" />}
              {indicators.includes("ema") && <path d={linePath(movingAverage(visibleCloses, 21, true))} className="manual-indicator manual-indicator--ema" />}
              <line x1={left} x2={W - right} y1={y(price)} y2={y(price)} className="manual-trading__price-line" /><rect x={W - right + 2} y={y(price) - 10} width="70" height="20" rx="3" className="manual-trading__price-tag" /><text x={W - right + 37} y={y(price) + 4} textAnchor="middle" className="manual-trading__price-text">{formatPrice(price, pair.decimals)}</text>
              <line x1={left} x2={W - right} y1="346" y2="346" className="manual-trading__rsi-divider" />
              <text x={left} y="365" className="manual-trading__rsi-label">RSI (14)</text>{indicators.includes("rsi") && <path d={rsiValues.slice(chartStart, chartStart + 50).map((value, index, values) => value === null ? "" : `${index && values[index - 1] !== null ? "L" : "M"}${x(index)},${350 + (1 - value / 100) * 44}`).join(" ")} className="manual-indicator manual-indicator--rsi" />}
            </svg>
          </div>
          {tradeResult && <div className={`manual-trading__result ${tradeResult.win ? "is-win" : "is-loss"}`} role="status" aria-live="polite">
            <span className="manual-trading__result-mark">{tradeResult.win ? "WIN" : "LOSS"}</span>
            <span><strong>{tradeResult.pair}</strong> settled {tradeResult.win ? "in profit" : "at a loss"}</span>
            <strong>{tradeResult.profitLoss >= 0 ? "+" : "-"}${Math.abs(tradeResult.profitLoss).toFixed(2)}</strong>
          </div>}
          <div className="manual-trading__legend"><span><i className="legend-sma" /> SMA 14</span><span><i className="legend-ema" /> EMA 21</span><span><i className="legend-rsi" /> RSI 14</span><span className="manual-trading__updated"><RefreshCw size={13} /> Updates every 15s</span></div>
        </div>

        <aside className="manual-trading__ticket workspace-panel">
          <div className="manual-trading__ticket-heading"><div><p className="workspace-hero__eyebrow">Order ticket</p><h2>{pair.label}</h2></div><DollarSign size={21} /></div>
          <div className="manual-trading__direction"><button type="button" className={selectedSide === "BUY" ? "is-buy is-selected" : "is-buy"} onClick={() => setSelectedSide("BUY")}><TrendingUp size={17} /> Buy</button><button type="button" className={selectedSide === "SELL" ? "is-sell is-selected" : "is-sell"} onClick={() => setSelectedSide("SELL")}><TrendingDown size={17} /> Sell</button></div>
          <label>Stake amount<div className="manual-trading__amount"><span>$</span><input className="input" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><div><button type="button" onClick={() => setAmount(String(Math.max(1, Number(amount || 0) - 5)))} aria-label="Decrease stake"><Minus size={14} /></button><button type="button" onClick={() => setAmount(String(Number(amount || 0) + 5))} aria-label="Increase stake"><Plus size={14} /></button></div></div></label>
          <label>Position duration<div className="manual-trading__select-wrap"><select className="input" value={expiry} onChange={(event) => setExpiry(Number(event.target.value))}>{EXPIRIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={16} /></div></label>
          <div className="manual-trading__ticket-stats"><div><span>Entry price</span><strong>{formatPrice(price, pair.decimals)}</strong></div><div><span>Available</span><strong>{balance === null ? "--" : formatPrice(balance, 2)}</strong></div></div>
          {error && <p className="manual-trading__error">{error}</p>}
          <button type="button" disabled={busy} className="manual-trading__submit manual-trading__submit--buy" onClick={() => void placeOrder("BUY")}><TrendingUp size={18} /> {busy ? "Opening..." : `Buy ${pair.symbol}`}</button>
          <button type="button" disabled={busy} className="manual-trading__submit manual-trading__submit--sell" onClick={() => void placeOrder("SELL")}><TrendingDown size={18} /> {busy ? "Opening..." : `Sell ${pair.symbol}`}</button>
          <p className="manual-trading__disclaimer"><Clock3 size={14} /> Positions are simulated for practice and settle at expiry.</p>
        </aside>
      </section>

      <section className="manual-trading__positions workspace-panel"><div className="manual-trading__section-heading"><div><p className="workspace-hero__eyebrow">Open positions</p><h2>Active manual trades</h2></div><span>{positions.length} open</span></div>{positions.length === 0 ? <div className="manual-trading__empty"><CandlestickChart size={21} /><p>Your active positions will appear here after you place a trade.</p></div> : <div className="manual-trading__position-list">{positions.map((position) => { const seconds = Math.max(0, Math.ceil((position.expiresAt - now) / 1000)); const positionPair = PAIRS.find((item) => position.pair.startsWith(item.symbol)) ?? pair; return <div className="manual-trading__position" key={position.id}><span className={position.side === "BUY" ? "position-icon is-buy" : "position-icon is-sell"}>{position.side === "BUY" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}</span><div><strong>{position.side} · {position.pair}</strong><small>Entry {formatPrice(position.entry, positionPair.decimals)} · Stake ${position.stake.toFixed(2)}</small></div><time>{seconds > 0 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : "Settling"}</time></div>; })}</div>}</section>
    </div>
  );
}
