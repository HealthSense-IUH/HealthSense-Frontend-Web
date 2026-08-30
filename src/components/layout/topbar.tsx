import { useNavigate } from "react-router-dom"
import {
  LogOut,
  User,
  ChevronDown
} from "lucide-react"
import { motion } from "framer-motion"

import { useAppShell } from "./app-shell-context"
import { DemoRoleSwitcher } from "./demo-role-switcher"
import { NotificationBell } from "@/features/notifications/components/notification-bell"
import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"
import { AvatarPlaceholder } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Topbar() {
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
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] transition-all duration-300 relative overflow-hidden"
    >
      {/* Background Subtle Gradient Glow (Lavender to Amber) */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/40 via-sky-50/25 to-amber-50/50 pointer-events-none" />

      {/* Floating Animated Geometric Icons - 5 Core Shape Families with Varied Sizes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* 1. Tilted Square (Medium 20px) - Left 3% */}
        <motion.div
          className="absolute left-[3%] top-3 text-indigo-300/80"
          animate={{
            y: [-3, 3, -3],
            rotate: [0, 12, 0],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.5" />
          </svg>
        </motion.div>

        {/* 2. Triangle + Dot (Small 16px) - Left 11% */}
        <motion.div
          className="absolute left-[11%] top-2 text-indigo-300/85"
          animate={{
            y: [-2, 3, -2],
            rotate: [-4, 6, -4],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,20 2,20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="12" cy="14" r="2" fill="#F59E0B" />
          </svg>
        </motion.div>

        {/* 3. Concentric Circle (Large 24px) - Left 20% */}
        <motion.div
          className="absolute left-[20%] top-3.5"
          animate={{
            y: [3, -3, 3],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full border border-amber-300/90">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/80" />
          </div>
        </motion.div>

        {/* 4. Diamond + Inner Diamond (Medium 20px) - Left 29% */}
        <motion.div
          className="absolute left-[29%] top-4"
          animate={{
            y: [2, -4, 2],
            rotate: [0, -8, 0],
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        >
          <div className="w-5 h-5 border border-amber-300 rounded-[4px] rotate-45 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-indigo-600/70 rounded-[2px]" />
          </div>
        </motion.div>

        {/* 5. Dashed Ring + Arrow (Small 16px) - Left 38% */}
        <motion.div
          className="absolute left-[38%] top-2.5 text-indigo-400/80"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" />
            <polygon points="10,8 16,12 10,16" fill="#F59E0B" />
          </svg>
        </motion.div>

        {/* 6. Triangle + Dot (Large 26px) - Left 47% */}
        <motion.div
          className="absolute left-[47%] top-1.5 text-indigo-300/90"
          animate={{
            y: [-3, 3, -3],
            rotate: [4, -6, 4],
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,20 2,20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="12" cy="14" r="2.2" fill="#F59E0B" />
          </svg>
        </motion.div>

        {/* 7. Tilted Square (Small 14px) - Left 56% */}
        <motion.div
          className="absolute left-[56%] top-4 text-amber-300/90"
          animate={{
            y: [2, -3, 2],
            rotate: [0, -12, 0],
          }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#6366F1" fillOpacity="0.6" />
          </svg>
        </motion.div>

        {/* 8. Concentric Circle (Small 14px) - Left 65% */}
        <motion.div
          className="absolute left-[65%] top-2.5"
          animate={{
            y: [3, -2, 3],
            scale: [1, 1.12, 1],
          }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-indigo-300/90">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
          </div>
        </motion.div>

        {/* 9. Diamond + Inner Diamond (Large 24px) - Left 74% */}
        <motion.div
          className="absolute left-[74%] top-3.5"
          animate={{
            y: [-3, 3, -3],
            rotate: [0, 8, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        >
          <div className="w-6 h-6 border border-amber-300 rounded-[5px] rotate-45 flex items-center justify-center">
            <div className="w-3 h-3 bg-indigo-600/70 rounded-[2px]" />
          </div>
        </motion.div>

        {/* 10. Dashed Ring + Arrow (Medium 22px) - Left 83% */}
        <motion.div
          className="absolute left-[83%] top-2 text-indigo-400/80"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 1 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" />
            <polygon points="10,8 16,12 10,16" fill="#F59E0B" />
          </svg>
        </motion.div>

        {/* Soft Ambient Light Glow Blobs */}
        <motion.div
          className="absolute left-[10%] top-1/2 -translate-y-1/2 w-80 h-12 bg-sky-200/25 rounded-full blur-2xl pointer-events-none"
          animate={{
            x: [-30, 40, -30],
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[50%] top-1/2 -translate-y-1/2 w-80 h-12 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"
          animate={{
            x: [-20, 20, -20],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[15%] top-1/2 -translate-y-1/2 w-80 h-12 bg-amber-200/30 rounded-full blur-2xl pointer-events-none"
          animate={{
            x: [30, -30, 30],
            opacity: [0.25, 0.6, 0.25],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left empty container to push actions to the right */}
      <div className="flex-1 relative z-10" />

      {/* Right section: DEV Role Switcher, Notification Bell, User Account Pill */}
      <div className="flex items-center gap-3 relative z-10">

        {/* DEV ONLY: Role Switcher */}
        {import.meta.env.DEV ? <DemoRoleSwitcher /> : null}

        {/* In-app Notification Bell */}
        <NotificationBell />

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
              onClick={() => navigate("/app/profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <User className="h-4 w-4 text-sky-600" />
              Hồ sơ cá nhân
            </button>

            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                Đăng xuất
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
