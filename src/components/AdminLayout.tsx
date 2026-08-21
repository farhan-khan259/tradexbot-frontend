import { NavLink, useNavigate } from "react-router-dom";
import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ScanFace,
  FileSearch,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", Icon: Users, end: false },
  { to: "/admin/deposits", label: "Deposits", Icon: ArrowDownToLine, end: false },
  { to: "/admin/withdrawals", label: "Withdrawals", Icon: ArrowUpFromLine, end: false },
  { to: "/admin/notifications", label: "Notifications", Icon: Bell, end: false },
  { to: "/admin/kyc", label: "KYC review", Icon: ScanFace, end: false },
  { to: "/admin/audit", label: "Audit logs", Icon: FileSearch, end: false },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className={`app-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="app-sidebar__top">
          <div className="app-sidebar__brand">
            <Logo />
          </div>
          <button
            type="button"
            className="app-sidebar__toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className="admin-badge">
          <ShieldCheck size={13} /> <span>ADMIN</span>
        </div>
        <nav className="app-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="app-nav__link"
              style={({ isActive }) => ({
                color: isActive ? "#06121f" : "var(--text)",
                background: isActive ? "var(--gradient)" : "transparent",
              })}
            >
              <item.Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar__footer">
          <div className="muted app-sidebar__email">{user?.email}</div>
          <button
            className="btn-ghost btn app-sidebar__logout"
            style={{ display: "flex", gap: "0.5rem" }}
            onClick={handleLogout}
          >
            <LogOut size={16} /> <span>Log out</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="app-sidebar__backdrop" onClick={closeSidebar} />}
      <main className="app-main" onClick={closeSidebar}>
        <div className="app-content app-content--wide">{children}</div>
      </main>
    </div>
  );
}
