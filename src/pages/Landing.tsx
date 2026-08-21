import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Wallet, Users, LayoutDashboard, Zap, ShieldCheck, Mail, Send } from "lucide-react";
import { Logo } from "../components/Logo";
import { MarketTicker } from "../components/MarketTicker";
import { HeroChart } from "../components/HeroChart";

const features = [
  {
    title: "Real-time markets",
    body: "Live price refresh on a 1-minute cadence so you're always trading on current data.",
    Icon: TrendingUp,
  },
  {
    title: "Simple deposits",
    body: "Fund your account and start in minutes. Track every deposit and withdrawal in one place.",
    Icon: Wallet,
  },
  {
    title: "Refer & earn",
    body: "Share your personal link and earn a bonus for every trader who joins through you.",
    Icon: Users,
  },
  {
    title: "Clear dashboard",
    body: "Balance, activity, and performance at a glance — no clutter, no guesswork.",
    Icon: LayoutDashboard,
  },
];

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#contact", label: "Contact" },
];

const steps = [
  { n: "1", title: "Create your account", body: "Sign up in seconds with just an email." },
  { n: "2", title: "Fund your balance", body: "Add funds and see them reflected once confirmed." },
  { n: "3", title: "Start trading", body: "Trade from $1 and track your journey in real time." },
];

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem", ...style }}>
      {children}
    </section>
  );
}

export function Landing() {
  // The landing page always presents the marketing CTAs (Get started / Sign in),
  // regardless of auth state.
  const primaryTo = "/register";
  const primaryLabel = "Get started free";

  return (
    <div>
      {/* Top nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          background: "rgba(8, 19, 17, 0.7)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem" }}>
          <Logo />
          <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div className="nav-links" style={{ display: "flex", gap: "1.5rem" }}>
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn">Get started</Link>
            </div>
          </nav>
        </Section>
      </header>

      {/* Live market ticker */}
      <div id="markets" style={{ scrollMarginTop: 70 }}>
        <MarketTicker />
      </div>

      {/* Hero */}
      <Section style={{ padding: "4rem 1.5rem 3rem" }}>
        <div
          style={{
            display: "grid",
            gap: "2.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(168, 221, 204, 0.28)",
                background: "rgba(40, 93, 75, 0.16)",
                color: "var(--text)",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              <Zap size={15} color="var(--background)" /> Empowering Your Trading Journey
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
              Trade smarter with <span className="gradient-text">TradeXBot</span>
            </h1>
            <p className="muted" style={{ fontSize: "1.15rem", maxWidth: 520, margin: "1.2rem 0 2rem" }}>
              A clean, fast platform to grow and track your trading — real-time markets,
              transparent transactions, and a dashboard that stays out of your way.
            </p>
            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
              <Link to={primaryTo} className="btn" style={{ fontSize: "1.05rem", padding: "0.85rem 1.6rem" }}>
                {primaryLabel}
              </Link>
              <a href="#features" className="btn btn-ghost" style={{ fontSize: "1.05rem", padding: "0.85rem 1.6rem" }}>
                See features
              </a>
            </div>

            {/* Stat strip */}
            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", marginTop: "2.5rem" }}>
              {[
                ["$1", "Minimum trade"],
                ["1m", "Live price refresh"],
                ["24/7", "Account access"],
              ].map(([big, small]) => (
                <div key={small}>
                  <div className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 800 }}>{big}</div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>{small}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroChart />
        </div>
      </Section>

      {/* About */}
      <Section style={{ padding: "3rem 1.5rem" }}>
        <div id="about" style={{ scrollMarginTop: 70 }} />
        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "2rem" }}>About TradeXBot</h2>
            <p className="muted" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
              TradeXBot is a modern trading platform built to make managing your portfolio simple
              and transparent. From your first deposit to tracking every trade, we focus on a clean
              experience, real-time data, and tools that stay out of your way.
            </p>
            <p className="muted" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
              Our mission is to empower traders of every level with a fast, reliable dashboard and a
              clear view of their activity — no clutter, no guesswork.
            </p>
          </div>
          <div style={{ display: "grid", gap: "1rem" }}>
            {[
              { Icon: ShieldCheck, title: "Secure by design", body: "Your account is protected with token-based authentication and server-side checks." },
              { Icon: TrendingUp, title: "Built for speed", body: "Real-time price updates and a responsive interface on every device." },
              { Icon: Users, title: "Trader-first", body: "A focused dashboard designed around the way you actually trade." },
            ].map((item) => (
              <div key={item.title} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0,
                    background: "rgba(34,211,238,0.12)", border: "1px solid var(--border)", color: "var(--accent)",
                  }}
                >
                  <item.Icon size={20} />
                </div>
                <div>
                  <h3 style={{ marginBottom: "0.2rem" }}>{item.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section style={{ padding: "3rem 1.5rem" }}>
        <div id="features" style={{ scrollMarginTop: 80 }} />
        <h2 style={{ textAlign: "center", fontSize: "2rem" }}>Everything you need to trade</h2>
        <p className="muted" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          Built for clarity and speed.
        </p>
        <div
          style={{
            display: "grid",
            gap: "1.2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {features.map((f) => (
            <div key={f.title} className="card">
              <div
                style={{
                  width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center",
                  background: "rgba(34,211,238,0.12)", border: "1px solid var(--border)",
                  color: "var(--accent)", marginBottom: "0.8rem",
                }}
              >
                <f.Icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section style={{ padding: "3rem 1.5rem" }}>
        <div id="how-it-works" style={{ scrollMarginTop: 70 }} />
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2.5rem" }}>
          Start in three steps
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1.2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {steps.map((s) => (
            <div key={s.n} className="card">
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center",
                  background: "var(--gradient)", color: "#06121f", fontWeight: 800, marginBottom: "0.8rem",
                }}
              >
                {s.n}
              </div>
              <h3>{s.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section style={{ padding: "3rem 1.5rem 4rem" }}>
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            background: "linear-gradient(135deg, rgba(40,93,75,0.26), rgba(168,221,204,0.12))",
          }}
        >
          <h2 style={{ fontSize: "2rem" }}>Ready to begin your trading journey?</h2>
          <p className="muted" style={{ maxWidth: 480, margin: "0.5rem auto 1.8rem" }}>
            Join TradeXBot and take control of your trading today.
          </p>
          <Link to={primaryTo} className="btn" style={{ fontSize: "1.05rem", padding: "0.85rem 1.8rem" }}>
            {primaryLabel}
          </Link>
        </div>
      </Section>

      {/* Contact */}
      <Section style={{ padding: "3rem 1.5rem 4rem" }}>
        <div id="contact" style={{ scrollMarginTop: 70 }} />
        <h2 style={{ textAlign: "center", fontSize: "2rem" }}>Get in touch</h2>
        <p className="muted" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          Have a question? Send us a message and our team will get back to you.
        </p>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "1rem" }}>
            <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0,
                  background: "rgba(34,211,238,0.12)", border: "1px solid var(--border)", color: "var(--accent)",
                }}
              >
                <Mail size={20} />
              </div>
              <div>
                <div className="muted" style={{ fontSize: "0.82rem" }}>Email us</div>
                <a href="mailto:support@tradexbot.com" style={{ fontWeight: 600 }}>support@tradexbot.com</a>
              </div>
            </div>
            <div className="card">
              <h3>Support hours</h3>
              <p className="muted" style={{ margin: 0 }}>
                Our support team is available 24/7. We typically respond within a few hours.
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <Section style={{ padding: "2rem 1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <Logo size={28} />
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Trade smarter with real-time market insights. © {`${new Date().getFullYear()}`} TradeXBot.
          </span>
        </Section>
      </footer>
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo only: no backend contact endpoint — this just acknowledges locally.
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <div className="card">
      {sent ? (
        <p style={{ color: "var(--success)" }}>
          Thanks for reaching out — we'll get back to you soon.
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <label>
            Name
            <input className="input" value={name} required onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input className="input" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Message
            <textarea
              className="input"
              rows={4}
              value={message}
              required
              style={{ resize: "vertical" }}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button className="btn" style={{ width: "100%", display: "flex", gap: "0.5rem" }}>
            <Send size={16} /> Send message
          </button>
        </form>
      )}
    </div>
  );
}
