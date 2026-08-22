import { ArrowRight, BarChart3, Bot, CheckCircle2, Play, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroChart } from "../components/HeroChart";
import { MarketingLayout } from "../components/MarketingLayout";
import "./Landing.css";

const highlights = [["24/7", "market intelligence"], ["1 min", "live data cadence"], ["$1", "minimum trade"]];

export function Landing() {
  return <MarketingLayout><main className="landing">
    <section className="landing-hero marketing-container">
      <div className="landing-orb landing-orb--one" /><div className="landing-orb landing-orb--two" />
      <div className="landing-hero__copy">
        <p className="eyebrow"><Sparkles size={15} /> Intelligent investing, beautifully simple</p>
        <h1>Turn market movement into <span>your next move.</span></h1>
        <p className="landing-hero__lead">TradeXBot brings market signals, portfolio clarity, and AI-assisted tools into one focused trading workspace.</p>
        <div className="landing-hero__actions"><Link className="btn" to="/register">Start your journey <ArrowRight size={17} /></Link><Link className="landing-text-link" to="/how-it-works"><Play size={15} fill="currentColor" /> See how it works</Link></div>
        <div className="landing-proof">{highlights.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      </div>
      <div className="landing-terminal" aria-label="Live BTC market preview"><div className="landing-terminal__glow" /><HeroChart /><div className="landing-terminal__trade"><div><span className="status-dot" /> AI signal active</div><strong>+ 12.84%</strong><small>Projected opportunity score</small></div></div>
    </section>
    <section className="landing-trusted marketing-container"><p>BUILT FOR FOCUSED TRADERS</p><div><span>SMART SIGNALS</span><span>LIVE MARKETS</span><span>RISK CONTROLS</span><span>ONE CLEAR VIEW</span></div></section>
    <section className="marketing-section marketing-container landing-intro"><div className="marketing-heading"><p className="eyebrow">A calmer way to trade</p><h2>Everything in view.<br /><span>Nothing in the way.</span></h2></div><p className="marketing-copy">A powerful trading experience does not need to feel complicated. TradeXBot keeps insight, execution and account tracking comfortably close—whether you are checking in from your desk or on the move.</p></section>
    <section className="marketing-container landing-showcase">
      <div className="landing-showcase__panel landing-showcase__panel--wide"><div className="showcase-icon"><TrendingUp size={22} /></div><p className="showcase-label">Market pulse</p><h3>Read the room before you enter it.</h3><p>Watch live price movement, concise market context, and performance data work together in a single flow.</p><div className="mini-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
      <div className="landing-showcase__panel landing-showcase__panel--bot"><div className="bot-orbit"><Bot size={38} /><i /><i /><i /></div><p className="showcase-label">AI assistance</p><h3>Insight that stays on your side.</h3><Link to="/features">Explore AI tools <ArrowRight size={15} /></Link></div>
      <div className="landing-showcase__panel landing-showcase__panel--score"><div className="score-ring"><strong>92</strong><span>signal score</span></div><div><p className="showcase-label">Made for momentum</p><h3>Plan with more confidence.</h3></div></div>
    </section>
    <section className="marketing-section marketing-container landing-steps"><div className="marketing-heading"><p className="eyebrow">From first click to first trade</p><h2>A direct path to <span>better decisions.</span></h2></div><div className="landing-steps__grid">{[["01", "Create your space", "Set up your account in moments and make your dashboard your own."], ["02", "Fund with clarity", "Add funds and follow every transaction from a single, transparent timeline."], ["03", "Trade with intent", "Use live context and powerful tools to keep your next action considered."]].map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p><CheckCircle2 size={18} /></article>)}</div><Link to="/how-it-works" className="landing-text-link">Explore the full process <ArrowRight size={16} /></Link></section>
    <section className="marketing-container landing-cta"><div><p className="eyebrow">Your market, made clearer</p><h2>Step into a more considered way to trade.</h2><p>Open your TradeXBot account and give your decisions a better home.</p></div><Link className="btn" to="/register">Create free account <ArrowRight size={17} /></Link><BarChart3 className="landing-cta__mark" size={130} /></section>
  </main></MarketingLayout>;
}
