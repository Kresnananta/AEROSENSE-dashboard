import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_ITEMS, ROUTES } from '@/lib/constants'
import {
  LayoutGrid,
  Map,
  LineChart,
  FileText,
  Bell,
  MessageCircle,
  Radio,
  ChevronRight,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid,
  Map,
  LineChart,
  FileText,
  Bell,
  MessageCircle,
  Radio,
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <aside className="w-[242px] shrink-0 bg-white border-r border-[#e8eff8] flex flex-col p-[27px_17px_16px] h-screen sticky top-0 z-30 select-none">
      {/* Brand logo & tagline */}
      <NavLink
        to={ROUTES.DASHBOARD}
        onClick={onClose}
        className="flex items-center gap-2.5 mx-2 mb-7 text-inherit no-underline"
      >
        <span
          className="w-10 h-10 shrink-0 rounded-full bg-[#f1f7fd] shadow-[0_7px_18px_rgba(27,117,220,0.17)] bg-no-repeat bg-[length:74px_66px] bg-[-19px_-3px]"
          style={{ backgroundImage: `url('/assets/aerosense-logo.svg')` }}
          aria-hidden="true"
        />
        <div className="leading-tight">
          <span className="text-base font-black tracking-[-0.9px] text-[#59aae8]">
            AERO<span className="text-[#277afa]">SENSE</span>
            <sup className="text-[8px] font-bold text-[#59aae8] ml-0.5">™</sup>
          </span>
          <small className="block text-[7.5px] font-semibold text-[#537496] tracking-[0.3px] uppercase mt-0.5">
            Pantau Udara, Lindungi Warga
          </small>
        </div>
      </NavLink>

      {/* Workspace Picker */}
      <div className="border border-[#e5eef8] p-2.5 rounded-[15px] flex items-center gap-2.5 bg-[#fbfdff] mb-6 shadow-xs">
        <span className="h-[33px] w-[33px] shrink-0 rounded-[10px] bg-[#dceeff] text-[#0674ec] grid place-items-center font-black text-sm">
          A
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block text-[11px] text-[#1b3154] font-bold truncate">
            Kawasan Gresik
          </strong>
          <small className="block text-[10px] text-[#8b9ab0] truncate">
            Ruang kerja demo
          </small>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#9aacbf] shrink-0" />
      </div>

      {/* Navigation Caption */}
      <p className="text-[10px] tracking-[1.7px] font-extrabold text-[#a4b1c5] mb-2.5 ml-3">
        RUANG KERJA
      </p>

      {/* Main Navigation */}
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutGrid

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `h-11 w-full rounded-xl flex items-center gap-3 px-3.5 text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e7f2ff] text-[#0569ed] font-extrabold shadow-2xs'
                    : 'text-[#687b95] font-semibold hover:bg-[#f2f8ff] hover:text-[#056afa] hover:translate-x-0.5'
                }`
              }
            >
              <Icon className="w-[17px] h-[17px] shrink-0 stroke-[2]" />
              <span className="truncate">{item.label}</span>

              {item.badge && item.badgeType === 'count' && (
                <span className="ml-auto rounded-lg px-2 py-0.5 bg-[#fff0ec] text-[#ef704f] text-[10px] font-black">
                  {item.badge}
                </span>
              )}
              {item.badge && item.badgeType === 'pill' && (
                <span className="ml-auto text-[8px] tracking-[0.5px] bg-[#e9f7ff] text-[#008bd0] px-1.5 py-1 rounded-md font-extrabold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Sidebar Bottom (Help Card & User Profile) */}
      <div className="mt-auto pt-4">
        {/* Help card */}
        <div className="p-3.5 bg-gradient-to-br from-[#eaf6ff] to-[#dceeff] border border-[#d8ecff] rounded-2xl relative overflow-hidden mb-4 shadow-2xs">
          <div className="w-[29px] h-[29px] rounded-lg bg-white text-[#007af2] grid place-items-center mb-2 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <strong className="block text-xs font-bold text-[#1b3154] mb-1">
            Udara jadi lebih mudah.
          </strong>
          <p className="text-[10px] leading-relaxed text-[#617993] mb-2.5">
            Lihat data, pahami risiko, lalu ambil langkah yang tepat.
          </p>
          <button
            type="button"
            onClick={() => {
              navigate(ROUTES.AEROBOT)
              onClose?.()
            }}
            className="text-[10px] font-extrabold text-[#086cfb] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Tanya AERO-BOT
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* User profile */}
        <div className="border-t border-[#e5eef8] pt-3.5 px-1 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#d9ecff] border-2 border-white text-[#0470ed] text-[10px] font-black grid place-items-center shadow-2xs">
            AS
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block text-[11px] text-[#1b3154] font-bold truncate">
              Tim AEROSENSE
            </strong>
            <small className="block text-[10px] text-[#8b9ab0] truncate">
              Pratinjau antarmuka
            </small>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate(ROUTES.SYSTEM)
              onClose?.()
            }}
            title="Buka Pengaturan Sistem"
            className="p-1 rounded-md text-[#8c9cb0] hover:text-[#086cfb] hover:bg-[#f2f8ff] transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
