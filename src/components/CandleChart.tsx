import { useEffect, useState } from "react";
import {
  BarChart3,
  CandlestickChart,
  Crosshair,
  Move,
  Plus,
  Ruler,
  Settings2,
  Smile,
  TrendingUp,
} from "lucide-react";
import { fetchLiveMarketPrices } from "../api/market";

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

const COUNT = 44;
const TIMEFRAMES = ["1m", "30m", "1h"];

function nextCandle(prevClose: number): Candle {
  const o = prevClose;
  const move = (Math.random() - 0.46) * prevClose * 0.028;
  const c = Math.max(prevClose * 0.92, o + move);
  const h = Math.max(o, c) + Math.random() * prevClose * 0.008;
  const l = Math.min(o, c) - Math.random() * prevClose * 0.008;
  const v = 12 + Math.random() * 88;
  return { o, h, l, c, v };
}

function seed(start = 61500): Candle[] {
  const output: Candle[] = [];
  let prev = start;
  for (let i = 0; i < COUNT; i++) {
    const candle = nextCandle(prev);
    output.push(candle);
    prev = candle.c;
  }
  return output;
}

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export function CandleChart() {
  const [timeframe, setTimeframe] = useState("1h");
  const [data, setData] = useState<Candle[]>(() => seed());

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const syncFromLivePrice = async () => {
      try {
        const live = await fetchLiveMarketPrices(controller.signal);
        const btc = live.find((coin) => coin.symbol === "BTC");
        if (mounted && btc?.price) {
          setData(seed(btc.price));
        }
      } catch {
        // Keep seeded data when the live source is unavailable.
      }
    };

    void syncFromLivePrice();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setData((prev) => [...prev.slice(1), nextCandle(prev[prev.length - 1].c)]);
    }, 1800);

    return () => window.clearInterval(id);
  }, []);

  const W = 760;
  const H = 430;
  const topPad = 22;
  const rightPad = 62;
  const leftPad = 10;
  const bottomPad = 30;
  const volumeHeight = 65;
  const chartBottom = H - bottomPad - volumeHeight;

  const max = Math.max(...data.map((d) => d.h));
  const min = Math.min(...data.map((d) => d.l));
  const range = max - min || 1;
  const y = (v: number) => topPad + (1 - (v - min) / range) * (chartBottom - topPad);
  const slot = (W - rightPad - leftPad) / data.length;
  const bodyW = Math.max(5, slot * 0.58);
  const last = data[data.length - 1];
  const up = last.c >= last.o;

  const gridLevels = 6;
  const priceTicks = Array.from({ length: gridLevels }, (_, i) => max - (range / (gridLevels - 1)) * i);
  const dayLabels = ["24", "25", "26", "27", "28"];
  const toolbar = [Move, TrendingUp, Ruler, Crosshair, BarChart3, CandlestickChart, Smile];

  return (
    <div className="tv-shell">
      <div className="tv-shell__top">
        <div className="tv-shell__pair">Bitcoin (BTC/USD)</div>
        <div className="tv-shell__live">
          <span className="tv-shell__live-dot" />
          <span>Live</span>
        </div>
      </div>

      <div className="tv-toolbar">
        <div className="tv-toolbar__group">
          {TIMEFRAMES.map((item) => (
            <button
              key={item}
              className={`tv-toolbar__pill ${item === timeframe ? "is-active" : ""}`}
              onClick={() => {
                setTimeframe(item);
                setData(seed());
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="tv-toolbar__group">
          <button className="tv-toolbar__icon"><Crosshair size={14} /></button>
          <button className="tv-toolbar__icon"><Settings2 size={14} /></button>
          <button className="tv-toolbar__icon"><TrendingUp size={14} /></button>
          <button className="tv-toolbar__icon"><ChevronCluster /></button>
        </div>

        <div className="tv-toolbar__group tv-toolbar__group--spaced">
          <button className="tv-toolbar__icon"><Plus size={14} /></button>
          <button className="tv-toolbar__icon"><BarChart3 size={14} /></button>
          <button className="tv-toolbar__label">Indicators</button>
        </div>
      </div>

      <div className="tv-body">
        <aside className="tv-sidebar">
          {toolbar.map((Icon, index) => (
            <button key={index} className={`tv-sidebar__tool ${index === 0 ? "is-active" : ""}`}>
              <Icon size={16} />
            </button>
          ))}
        </aside>

        <div className="tv-chart-wrap">
          <div className="tv-chart-head">
            <div className="tv-chart-head__pair">
              <span className="tv-chart-head__coin">B</span>
              <span>Bitcoin / U.S. Dollar · 1h · Bitstamp</span>
              <span className="tv-chart-head__status" />
            </div>
            <div className={`tv-chart-head__ohlc ${up ? "is-up" : "is-down"}`}>
              O{fmt(last.o)} H{fmt(last.h)} L{fmt(last.l)} C{fmt(last.c)} {up ? "+" : "-"}{fmt(Math.abs(last.c - last.o))}
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" className="tv-chart-svg">
            <rect x="0" y="0" width={W} height={H} fill="#0c201c" />

            {priceTicks.map((tick, index) => {
              const yy = topPad + ((chartBottom - topPad) / (gridLevels - 1)) * index;
              return (
                <g key={tick}>
                  <line x1={leftPad} y1={yy} x2={W - rightPad} y2={yy} stroke="rgba(57,95,84,0.55)" strokeWidth="1" />
                  <text x={W - rightPad + 10} y={yy + 4} fill="#9ec6b7" fontSize="11">
                    {fmt(tick)}
                  </text>
                </g>
              );
            })}

            {Array.from({ length: 8 }).map((_, index) => {
              const xx = leftPad + ((W - rightPad - leftPad) / 7) * index;
              return (
                <line
                  key={index}
                  x1={xx}
                  y1={topPad}
                  x2={xx}
                  y2={chartBottom}
                  stroke="rgba(46,78,69,0.42)"
                  strokeWidth="1"
                />
              );
            })}

            {data.map((candle, index) => {
              const cx = leftPad + slot * index + slot / 2;
              const green = candle.c >= candle.o;
              const color = green ? "#66d6af" : "#ff6f82";
              const yO = y(candle.o);
              const yC = y(candle.c);
              const top = Math.min(yO, yC);
              const bodyH = Math.max(3, Math.abs(yC - yO));
              const volHeight = (candle.v / 100) * volumeHeight;
              return (
                <g key={index}>
                  <line x1={cx} x2={cx} y1={y(candle.h)} y2={y(candle.l)} stroke={color} strokeWidth="1.35" />
                  <rect x={cx - bodyW / 2} y={top} width={bodyW} height={bodyH} rx="1" fill={color} />
                  <rect
                    x={cx - bodyW / 2}
                    y={H - bottomPad - volHeight}
                    width={bodyW}
                    height={volHeight}
                    fill={green ? "rgba(102,214,175,0.55)" : "rgba(255,111,130,0.55)"}
                  />
                </g>
              );
            })}

            <line
              x1={leftPad}
              x2={W - rightPad}
              y1={y(last.c)}
              y2={y(last.c)}
              stroke="rgba(255,111,130,0.65)"
              strokeDasharray="2 3"
            />

            <rect x={W - rightPad + 2} y={y(last.c) - 9} width="50" height="18" rx="3" fill="#ff6f82" />
            <text x={W - rightPad + 27} y={y(last.c) + 4} fill="white" fontSize="11" textAnchor="middle">
              {fmt(last.c)}
            </text>

            {dayLabels.map((label, index) => (
              <text
                key={label}
                x={leftPad + 56 + index * ((W - rightPad - 110) / (dayLabels.length - 1))}
                y={H - 8}
                fill="#9ec6b7"
                fontSize="11"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function ChevronCluster() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 4.5L5.5 2L8 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10L8.5 12.5L11 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 7H11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
