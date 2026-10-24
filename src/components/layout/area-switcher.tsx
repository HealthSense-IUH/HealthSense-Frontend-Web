import { useLocation, useNavigate } from "react-router-dom"
import { LayoutGrid, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getDefaultGeneralRouteForRole, getDefaultRouteForRole, hasManagementArea } from "@/constants"
import { cn } from "@/lib/utils"
import { useAppShell } from "./app-shell-context"
import { isManagementPath } from "./nav-config"

/**
 * Nút chuyển giữa phân hệ Cá nhân (/app/general) và Quản trị (/app/management) trên topbar.
 * Chỉ hiện với vai trò có phân hệ Quản trị; hội viên không thấy.
 */
export function AreaSwitcher() {
  const { t } = useTranslation()
  const { effectiveRole } = useAppShell()
  const location = useLocation()
  const navigate = useNavigate()

  if (!hasManagementArea(effectiveRole)) return null

  const inManagement = isManagementPath(location.pathname)
  const options = [
    { key: "general", active: !inManagement, icon: LayoutGrid, to: getDefaultGeneralRouteForRole(effectiveRole) },
    { key: "management", active: inManagement, icon: ShieldCheck, to: getDefaultRouteForRole(effectiveRole) },
  ] as const

  return (
    <div
      role="group"
      aria-label={t("areaSwitch.label")}
      className="flex items-center rounded-lg border border-slate-200 bg-white/80 p-0.5 shadow-2xs"
    >
      {options.map(({ key, active, icon: Icon, to }) => (
        <button
          key={key}
          type="button"
          aria-pressed={active}
          title={t(`areaSwitch.${key}`)}
          onClick={() => {
            if (!active) navigate(to)
          }}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
            active ? "bg-primary-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t(`areaSwitch.${key}`)}</span>
        </button>
      ))}
    </div>
  )
}
