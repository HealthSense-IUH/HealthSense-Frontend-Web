import { useNavigate } from "react-router-dom"
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AvatarPlaceholder } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getDefaultRouteForRole } from "@/constants"
import { authApi } from "@/services"
import { useAuthStore } from "@/stores/auth-store"

interface UserMenuProps {
  /** Vai trò hiển thị dưới tên (topbar dùng vai trò đang xem, landing dùng vai trò thật) */
  role?: string
  /** Thêm mục "Vào ứng dụng" (dùng ở trang ngoài app như landing) */
  showAppLink?: boolean
}

/** Nút tài khoản: avatar + tên, mở menu Hồ sơ / Đăng xuất. Dùng ở topbar trong app và nav của landing. */
export function UserMenu({ role, showAppLink = false }: UserMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const userSession = useAuthStore((state) => state.userSession)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  if (!userSession) return null

  const displayName = userSession.fullName || userSession.email
  const shownRole = role ?? userSession.role

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất, vẫn xóa phiên ở trình duyệt
    } finally {
      clearAuth()
      navigate("/login", { replace: true })
    }
  }

  const itemClass =
    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
        >
          <AvatarPlaceholder src={userSession.avatarUrl} name={displayName} size="sm" />
          <div className="hidden sm:flex flex-col text-left text-xs max-w-[130px]">
            <span className="font-bold text-slate-900 truncate text-[13px] leading-tight">{displayName}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate font-mono">
              {shownRole}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2 rounded-2xl border-slate-200 shadow-xl bg-white space-y-1">
        <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
          <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{userSession.email}</p>
        </div>

        {showAppLink && (
          <button type="button" onClick={() => navigate(getDefaultRouteForRole(userSession.role))} className={itemClass}>
            <LayoutDashboard className="h-4 w-4 text-primary-600" />
            {t("topbar.openApp")}
          </button>
        )}

        <button type="button" onClick={() => navigate("/app/general/profile")} className={itemClass}>
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
  )
}
