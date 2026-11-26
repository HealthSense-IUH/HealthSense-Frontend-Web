import { Link, useLocation } from "react-router-dom"
import { LayoutGrid, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getDefaultGeneralRouteForRole, getDefaultRouteForRole, hasManagementArea } from "@/constants"
import { cn } from "@/lib/utils"
import { useAppShell } from "./app-shell-context"
import { isManagementPath } from "./nav-config"

/**
 * Nút chuyển giữa phân hệ Cá nhân (/app/general) và Quản trị (/app/management), đặt ở đáy sidebar.
 * Chỉ hiện với vai trò có phân hệ Quản trị; hội viên không thấy. Luôn trỏ sang phân hệ còn lại.
 */
export function SidebarAreaToggle() {
  const { t } = useTranslation()
  const { effectiveRole } = useAppShell()
  const location = useLocation()

  if (!hasManagementArea(effectiveRole)) return null

  const inManagement = isManagementPath(location.pathname)
  const target = inManagement
    ? { key: "general", icon: LayoutGrid, to: getDefaultGeneralRouteForRole(effectiveRole) }
    : { key: "management", icon: ShieldCheck, to: getDefaultRouteForRole(effectiveRole) }
  const Icon = target.icon

  return (
    <div className="shrink-0 border-t border-shell-border px-2 pb-3 pt-2">
      <Link
        to={target.to}
        title={`${t("areaSwitch.label")}: ${t(`areaSwitch.${target.key}`)}`}
        className={cn(
          "group flex w-full flex-col items-center justify-center rounded-xl px-1 py-2.5 transition-colors",
          "text-slate-300/85 hover:bg-white/10 hover:text-white"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-cyan-300 transition-colors group-hover:bg-primary-500/30 group-hover:border-cyan-400/40 group-hover:text-white">
          <Icon className="h-4 w-4" />
        </span>
        <span className="mt-1 max-w-[76px] truncate text-center text-[10px] font-semibold leading-tight tracking-tight">
          {t(`areaSwitch.${target.key}`)}
        </span>
      </Link>
    </div>
  )
}
