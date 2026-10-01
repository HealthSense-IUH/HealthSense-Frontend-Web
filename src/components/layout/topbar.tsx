import { useNavigate } from "react-router-dom"
import {
  LogOut,
  User,
  ChevronDown
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { useAppShell } from "./app-shell-context"
import { DemoRoleSwitcher } from "./demo-role-switcher"
import { LanguageSwitcher } from "./language-switcher"
import { authApi } from "@/services"
import { useAuthStore } from "@/stores/auth-store"
import { AvatarPlaceholder } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Topbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { effectiveRole } = useAppShell()
  const userSession = useAuthStore((state) => state.userSession)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors on logout, proceed with clearing auth state
    } finally {
      clearAuth()
      navigate("/login", { replace: true })
    }
  }

  const userEmail = userSession?.email || "admin@healthsense.io"

  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4"
    >
      <div className="flex-1" />

      {/* Right section: DEV Role Switcher, Notification Bell, User Account Pill */}
      <div className="flex items-center gap-3">

        {/* DEV ONLY: Role Switcher */}
        {import.meta.env.DEV ? <DemoRoleSwitcher /> : null}

        <LanguageSwitcher />

        {/* User Account Menu Pill */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <AvatarPlaceholder
                src={userSession?.avatarUrl}
                name={userSession?.fullName || "Huỳnh Đức Phú"}
                size="sm"
              />
              <div className="flex flex-col text-left text-xs max-w-[130px]">
                <span className="font-bold text-slate-900 truncate text-[13px] leading-tight">
                  {userSession?.fullName || "Huỳnh Đức Phú"}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate font-mono">
                  {effectiveRole}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2 rounded-2xl border-slate-200 shadow-xl bg-white space-y-1">
            <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
              <p className="font-bold text-sm text-slate-900">{userSession?.fullName || "Huỳnh Đức Phú"}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app/general/profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <User className="h-4 w-4 text-primary-600" />
              {t("topbar.profile")}
            </button>

            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-danger-500" />
                {t("topbar.logout")}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
