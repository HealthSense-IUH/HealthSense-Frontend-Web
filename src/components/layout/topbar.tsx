import { useLocation, useNavigate } from "react-router-dom"
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Shield,
  Heart,
} from "lucide-react"

import { useAppShell } from "./app-shell-context"
import { findNavigationItemByPath } from "./nav-config"
import { DemoRoleSwitcher } from "./demo-role-switcher"
import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isCollapsed, toggleSidebar, effectiveRole } = useAppShell()
  const userSession = useAuthStore((state) => state.userSession)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const { item, group } = findNavigationItemByPath(location.pathname)

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

  const userInitials = userSession?.fullName
    ? userSession.fullName.slice(0, 2).toUpperCase()
    : "HS"
  const userEmail = userSession?.email || "admin@healthsense.io"

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] transition-all duration-300`}
    >
      {/* Left section: Collapse Trigger & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>

        <div className="h-5 w-px bg-slate-200/80" />

        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
          {group && (
            <>
              <span className="font-medium text-slate-400 hover:text-slate-600 transition-colors">
                {group.title}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            </>
          )}
          <span className="font-bold text-slate-800 tracking-tight">
            {item?.title || "Overview"}
          </span>
        </nav>
      </div>

      {/* Right section: Global Search, Role Switcher (DEV only), Notifications, User Menu */}
      <div className="flex items-center gap-3">

        <div className="h-5 w-px bg-slate-200/80 mx-1" />

        {/* DEV ONLY: Role Switcher */}
        {import.meta.env.DEV ? <DemoRoleSwitcher /> : null}

        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4 rounded-2xl border-slate-200 shadow-xl bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900">Medical Notifications</h4>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-red-50/60 border border-red-100 flex gap-2.5 items-start">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Critical: Patient AFib Spike</p>
                  <p className="text-slate-500 text-[11px]">Wearable monitor alert for ID #8842</p>
                  <span className="text-[10px] text-red-600 font-medium">2 minutes ago</span>
                </div>
              </div>
              <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex gap-2.5 items-start">
                <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Doctor verification request</p>
                  <p className="text-slate-500 text-[11px]">Dr. Minh submitted license verification.</p>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Account Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <Avatar className="h-8 w-8 border border-slate-200 shadow-xs">
                <AvatarImage src="https://i.pravatar.cc/150?img=47" alt={userEmail} />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left text-xs max-w-[120px]">
                <span className="font-bold text-slate-900 truncate">
                  {userSession?.fullName || "Administrator"}
                </span>
                <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider truncate">
                  {effectiveRole}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2 rounded-2xl border-slate-200 shadow-xl bg-white space-y-1">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="font-bold text-sm text-slate-900">{userSession?.fullName || "System Administrator"}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app/profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <User className="h-4 w-4 text-slate-400" />
              My Profile & Credentials
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Shield className="h-4 w-4 text-slate-400" />
              Security Settings
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Heart className="h-4 w-4 text-slate-400" />
              Healthcare Compliance Status
            </button>

            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                Sign Out of Platform
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
