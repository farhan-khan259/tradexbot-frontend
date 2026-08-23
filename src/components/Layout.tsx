import { NavLink, useNavigate } from "react-router-dom";
import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  Users,
  Bot,
  Headset,
  LogOut,
  Menu,
  X,
  Bell,
  ScanFace,
  ListChecks,
  ChevronRight,
  CandlestickChart,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/deposit", label: "Deposit", Icon: ArrowDownToLine },
  { to: "/withdraw", label: "Withdraw", Icon: ArrowUpFromLine },
  { to: "/bot", label: "AI Free Trader", Icon: Bot },
  { to: "/manual-trading", label: "Manual Trading", Icon: CandlestickChart },
  { to: "/bot/basic-bot", label: "AI Smart Trader", Icon: Bot },
  { to: "/bot/pro-bot", label: "AI Pro Trader", Icon: Bot },
  { to: "/bot/basic-funded", label: "AI Funded Trader", Icon: Bot },
  { to: "/bot/pro-funded", label: "AI Funded Pro", Icon: Bot },
  { to: "/transactions", label: "Transactions", Icon: Receipt },
  { to: "/trades", label: "Trade history", Icon: ListChecks },
  { to: "/referrals", label: "Referrals", Icon: Users },
  { to: "/notifications", label: "Notifications", Icon: Bell },
  { to: "/kyc", label: "KYC verification", Icon: ScanFace },
];

const customerServiceUrl = "https://t.me/TradeXBotCustomerSupport";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const firstName = user?.full_name?.split(" ")[0] || "Trader";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className={`app-shell app-shell--v2 ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="app-shell__aurora app-shell__aurora--one" aria-hidden="true" />
      <div className="app-shell__aurora app-shell__aurora--two" aria-hidden="true" />
      <aside className={`app-sidebar app-sidebar--v2 ${sidebarOpen ? "is-open" : ""}`}>
        <div className="app-sidebar__top app-sidebar__top--v2">
          <div className="app-sidebar__brand app-sidebar__brand--v2">
            <Logo size={38} />
          </div>
          <button
            type="button"
            className="app-sidebar__toggle app-sidebar__toggle--v2"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className="app-sidebar__intro">
          <p className="app-sidebar__eyebrow">Trading Workspace</p>
          <h2>Welcome, {firstName}</h2>
          <p className="muted">Manage wallet, bots, payouts, and portfolio activity.</p>
        </div>
        <nav className="app-nav" onClick={closeSidebar}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/bot"}
              className={({ isActive }) => `app-nav__link ${isActive ? "is-active" : ""}`}
            >
              <item.Icon size={18} />
              <span>{item.label}</span>
              <ChevronRight className="app-nav__chevron" size={14} />
            </NavLink>
          ))}
          <a
            href={customerServiceUrl}
            target="_blank"
            rel="noreferrer"
            className="app-nav__link"
            title="Contact customer service on Telegram"
          >
            <Headset size={18} />
            <span>Customer Service</span>
            <ChevronRight className="app-nav__chevron" size={14} />
          </a>
        </nav>
        <div className="app-sidebar__footer">
          <div className="muted app-sidebar__email">{user?.email}</div>
          <button
            className="btn-ghost btn app-sidebar__logout"
            onClick={handleLogout}
          >
            <LogOut size={16} /> <span>Log out</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="app-sidebar__backdrop" onClick={closeSidebar} />}
      <main className="app-main app-main--v2" onClick={closeSidebar}>
        <header className="app-topbar">
          <div>
            <p className="app-topbar__eyebrow">Account Center</p>
            <h1>TradeXBot Portal</h1>
          </div>
          <div className="app-topbar__status">
            <span className="app-topbar__dot" />
            <span>Live session</span>
          </div>
        </header>
        <div className="app-content app-content--v2">{children}</div>
      </main>
    </div>
  );
}
