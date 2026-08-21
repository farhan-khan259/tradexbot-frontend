import { useEffect, useState } from "react";

function seed(n: number, start = 100): number[] {
  const pts: number[] = [];
  let v = start;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.45) * 7;
    v = Math.max(45, Math.min(155, v));
    pts.push(v);
  }
  return pts;
}

const POINTS = 44;

/** A self-contained, animated "live" area chart mockup (simulated random walk). */
export function HeroChart() {
  const [data, setData] = useState(() => seed(POINTS));

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        let v = prev[prev.length - 1] + (Math.random() - 0.45) * 7;
        v = Math.max(45, Math.min(155, v));
        return [...prev.slice(1), v];
      });
    }, 1100);
    return () => clearInterval(id);
  }, []);

  const W = 560;
  const H = 260;
  const pad = 12;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const x = (i: number) => pad + (i / (data.length - 1)) * (W - 2 * pad);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (H - 2 * pad);

  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const up = last >= first;
  const pctChange = (((last - first) / first) * 100).toFixed(2);
  const price = (62000 + (last - 100) * 180).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="card" style={{ padding: "1.2rem", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>BTC / USDT</div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>1m · live demo</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: "1.3rem" }}>${price}</div>
          <div style={{ color: up ? "var(--success)" : "var(--danger)", fontSize: "0.85rem", fontWeight: 600 }}>
            {up ? "▲" : "▼"} {Math.abs(Number(pctChange))}%
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: "block", height: "auto" }}>
        <defs>
          <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8de5c8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#285d4b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#285d4b" />
            <stop offset="100%" stopColor="#8de5c8" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#heroFill)" style={{ transition: "all 0.6s ease" }} />
        <path
          d={line}
          fill="none"
          stroke="url(#heroStroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "all 0.6s ease" }}
        />
        <circle cx={x(data.length - 1)} cy={y(last)} r={4} fill="#8de5c8" style={{ transition: "all 0.6s ease" }} />
      </svg>
    </div>
  );
}
