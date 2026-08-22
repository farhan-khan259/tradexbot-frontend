import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import "./MarketingLayout.css";

const links = [["/home", "Home"], ["/about", "About us"], ["/features", "Features"], ["/how-it-works", "How it works"], ["/contact", "Contact us"]];
export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="marketing-shell"><header className="marketing-header"><div className="marketing-container marketing-header__inner"><Link to="/" aria-label="TradeXBot home"><Logo /></Link><button className="marketing-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button><nav className={menuOpen ? "marketing-nav is-open" : "marketing-nav"}>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}<Link className="marketing-nav__login" to="/login">Sign in</Link><Link className="btn marketing-nav__cta" to="/register">Get started</Link></nav></div></header>{children}<footer className="marketing-footer"><div className="marketing-container marketing-footer__inner"><div><Logo size={28} /><p>Focused tools for a more thoughtful trading journey.</p></div><div className="marketing-footer__links">{links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div><small>© {new Date().getFullYear()} TradeXBot. Market data and outcomes may vary.</small></div></footer></div>;
}
