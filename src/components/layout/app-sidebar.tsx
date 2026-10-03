import { Link } from "react-router-dom"
import { ShieldCheck, Stethoscope } from "lucide-react"
import { useTranslation } from "react-i18next"

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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[92px] flex-col select-none border-r border-shell-border bg-shell text-shell-foreground">
      {/* Logo + vai trò */}
      <div className="flex flex-col items-center justify-center py-3.5 border-b border-shell-border">
        <Link
          to={homeRoute}
          className="flex flex-col items-center group"
          title={`${t("brand.name")} - ${roleLabel(effectiveRole)}`}
        >
          {isStaff ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm group-hover:bg-primary-500 transition-colors">
              {isDoctor ? <Stethoscope className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
          ) : (
            <img
              src="/logo.png"
              alt={t("brand.name")}
              className="h-10 w-10 object-contain rounded-xl shrink-0"
            />
          )}
          <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 bg-white/10 text-slate-200">
            {roleBadgeLabel}
          </span>
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
        <SidebarContent />
      </div>
    </aside>
  )
}
