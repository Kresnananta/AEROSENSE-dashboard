import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import { useLocation } from "react-router-dom";
import { NAV_ITEMS, ROUTES } from "@/lib/constants";
import { Menu, ChevronRight, Bell } from "lucide-react";
import type { Ref } from "react";

interface TopbarProps {
  onMenuClick: () => void;
  menuButton: Ref<HTMLButtonElement>;
  menuOpen: boolean;
}

export function Topbar({ onMenuClick, menuButton, menuOpen }: TopbarProps) {
  const { user } = useAuth();
  const { canViewModel } = useAccess();
  const location = useLocation();
  const currentItem = NAV_ITEMS.find((item) => item.path === location.pathname);
  const currentLabel =
    location.pathname === ROUTES.ANALYTICS && !canViewModel
      ? "Riwayat udara"
      : currentItem?.label ??
        (location.pathname.startsWith("/nodes/")
          ? "Detail sensor"
          : location.pathname === ROUTES.SYSTEM
            ? "Pengaturan"
            : "Pemantauan");

  return (
    <header className="app-topbar h-[72px] flex items-center justify-between px-6 sm:px-9 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          ref={menuButton}
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          className="topbar-icon md:hidden w-8 h-8 rounded-lg bg-[#e8f1fc] text-[#0a58ca] grid place-items-center hover:bg-[#d8e7fa] transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <nav
          aria-label="Lokasi halaman"
          className="topbar-breadcrumb flex items-center gap-2 text-xs font-semibold"
        >
          <span className="hidden sm:inline">AEROSENSE</span>
          <ChevronRight size={14} className="hidden sm:block text-[#3f566a]" />
          <strong className="text-[#102436] font-bold">{currentLabel}</strong>
        </nav>
      </div>

      <div className="topbar-actions flex items-center gap-3 sm:gap-4">
        <Link
          to={ROUTES.ALERTS}
          aria-label="Lihat peringatan sensor"
          className="topbar-icon topbar-alert-link grid size-11 place-items-center rounded-lg md:hidden"
        >
          <Bell size={18} aria-hidden="true" />
        </Link>

        <Link className="account-link" to={user ? ROUTES.SYSTEM : ROUTES.LOGIN}>
          {user ? "Akun saya" : "Masuk"}
          <ChevronRight size={15} />
        </Link>
      </div>
    </header>
  );
}
