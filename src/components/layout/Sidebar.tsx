import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS, ROUTES } from "@/lib/constants";
import { ROLE_LABELS, useAccess } from "@/hooks/useAccess";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown,
  LayoutGrid,
  Map,
  LineChart,
  FileText,
  Bell,
  MessageCircle,
  Radio,
  Leaf,
  ArrowUpRight,
  Settings,
  Settings2,
  UserRound,
} from "lucide-react";
const ICONS: Record<string, React.ElementType> = {
  LayoutGrid,
  Map,
  LineChart,
  FileText,
  Bell,
  MessageCircle,
  Radio,
  Leaf,
  Settings2,
};

const monitoringPaths = [ROUTES.DASHBOARD, ROUTES.ENVIRONMENT, ROUTES.SENSOR_MAP, ROUTES.ALERTS, ROUTES.AEROBOT];
const toolPaths = [ROUTES.ANALYTICS, ROUTES.NODE_MONITORING, ROUTES.MANAGEMENT, ROUTES.ESG_REPORTS];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { canAudit, canViewModel, canManage, role } = useAccess();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      (item.path !== ROUTES.ESG_REPORTS || canAudit) &&
      (item.path !== ROUTES.MANAGEMENT || canManage),
  );
  const toolsActive = toolPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  function links(paths: readonly string[]) {
    return paths.flatMap((path) => visibleItems.filter((item) => item.path === path)).map((item) => {
      const Icon = ICONS[item.icon] || LayoutGrid;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onClose}
          data-destination={item.path}
          className={({ isActive }) => (isActive ? "nav-entry active" : "nav-entry")}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{item.path === ROUTES.ANALYTICS && !canViewModel ? "Riwayat udara" : item.label}</span>
        </NavLink>
      );
    });
  }

  return (
    <aside className="app-sidebar">
      <NavLink
        to={role === "robot" ? ROUTES.ENVIRONMENT : ROUTES.DASHBOARD}
        onClick={onClose}
        className="app-brand"
        aria-label="AEROSENSE — Beranda"
      >
        <img
          className="brand-emblem"
          src="/assets/brand/aerosense-mark.png"
          width="38"
          height="38"
          alt=""
        />
        <span>
          AERO<strong>SENSE</strong>
        </span>
      </NavLink>
      <nav className="app-navigation" aria-label="Navigasi utama">
        <div className="nav-group">{links(monitoringPaths)}</div>
        <details className="nav-tools" open={toolsActive || undefined}>
          <summary>
            Data &amp; perangkat
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <div className="nav-group">{links(toolPaths)}</div>
        </details>
      </nav>
      <div className="sidebar-account">
        <span className="account-avatar">
          <UserRound size={20} />
        </span>
        <div>
          <strong>{ROLE_LABELS[role]}</strong>
          <small>{user ? user.email : "Akses pemantauan publik"}</small>
        </div>
        <NavLink
          to={user ? ROUTES.SYSTEM : ROUTES.LOGIN}
          onClick={onClose}
          aria-label={user ? "Pengaturan akun" : "Masuk"}
          className="account-action"
        >
          {user ? <Settings size={18} /> : <ArrowUpRight size={18} />}
        </NavLink>
      </div>
    </aside>
  );
}
