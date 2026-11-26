import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { HsDoctorStethoscopeIcon, HsShieldCareIcon } from "@/components/icons/health-icons"

import { SidebarAreaToggle } from "./area-switcher"
import { useAppShell } from "./app-shell-context"
import { SidebarContent } from "./sidebar-content"
import { USER_ROLES, getDefaultRouteForRole, roleLabel } from "@/constants"

export function AppSidebar() {
  const { t } = useTranslation()
  const { effectiveRole } = useAppShell()

  const isStaff = effectiveRole !== USER_ROLES.MEMBER
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR
  const homeRoute = getDefaultRouteForRole(effectiveRole)

  // Huy hiệu hẹp dưới logo nên dùng tên vai trò rút gọn
  const roleBadgeLabel = t(`rolesShort.${effectiveRole}`, { defaultValue: effectiveRole })

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[92px] flex-col select-none border-r border-shell-border bg-gradient-to-b from-[#091326] via-[#0c1c3b] to-[#081326] text-shell-foreground shadow-[4px_0_24px_-8px_rgba(9,19,38,0.45)]">
      {/* Logo + vai trò */}
      <div className="flex flex-col items-center justify-center py-3.5 border-b border-shell-border">
        <Link
          to={homeRoute}
          className="flex flex-col items-center group"
          title={`${t("brand.name")} - ${roleLabel(effectiveRole)}`}
        >
          {isStaff ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white shadow-md shadow-primary-500/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              {isDoctor ? <HsDoctorStethoscopeIcon className="h-5 w-5" /> : <HsShieldCareIcon className="h-5 w-5" />}
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 p-1 shadow-md shadow-black/25 ring-1 ring-white/25 group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt={t("brand.name")}
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
          )}
          <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 bg-cyan-400/15 text-cyan-200 border border-cyan-400/30">
            {roleBadgeLabel}
          </span>
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
        <SidebarContent />
      </div>

      {/* Chuyển phân hệ Cá nhân / Quản trị (vai trò có quyền quản trị) */}
      <SidebarAreaToggle />
    </aside>
  )
}
