import { Link } from "react-router-dom"
import { ShieldCheck, Stethoscope } from "lucide-react"

import { useAppShell } from "./app-shell-context"
import { SidebarContent } from "./sidebar-content"
import { USER_ROLES, getDefaultRouteForRole } from "@/constants"

export function AppSidebar() {
  const { effectiveRole } = useAppShell()

  const isStaff = effectiveRole !== USER_ROLES.MEMBER
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR
  const homeRoute = getDefaultRouteForRole(effectiveRole)

  const roleBadgeLabel =
    effectiveRole === USER_ROLES.SUPER_ADMIN
      ? "S-ADMIN"
      : effectiveRole

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen w-[92px] flex-col select-none transition-colors duration-300 ${
        isStaff
          ? "border-r border-indigo-900/50 bg-[#110E24] text-indigo-200 shadow-[4px_0_30px_rgba(79,70,229,0.12)]"
          : "border-r border-sky-950/60 bg-[#0B132B] text-slate-300 shadow-[4px_0_30px_rgba(14,165,233,0.12)]"
      }`}
    >
      {/* Dynamic Ambient Top Glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-36 pointer-events-none blur-2xl transition-all duration-500 ${
          isStaff
            ? "bg-gradient-to-b from-indigo-600/30 via-purple-600/15 to-transparent"
            : "bg-gradient-to-b from-sky-500/25 via-cyan-500/10 to-transparent"
        }`}
      />

      {/* Header / Brand with Role Badge */}
      <div
        className={`relative flex flex-col items-center justify-center py-3.5 border-b z-10 transition-colors ${
          isStaff ? "border-indigo-900/50 bg-indigo-950/30" : "border-sky-950/60 bg-sky-950/20"
        }`}
      >
        <Link
          to={homeRoute}
          className="flex flex-col items-center group"
          title={`HealthSense - ${effectiveRole}`}
        >
          {isDoctor ? (
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md bg-gradient-to-tr from-teal-600 via-cyan-500 to-blue-500 shadow-teal-500/30 group-hover:scale-105 transition-all duration-200">
              <Stethoscope className="h-5 w-5 text-white drop-shadow-xs" />
            </div>
          ) : isStaff ? (
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 shadow-indigo-500/30 group-hover:scale-105 transition-all duration-200">
              <ShieldCheck className="h-5 w-5 text-white animate-pulse drop-shadow-xs" />
            </div>
          ) : (
            <img
              src="/logo.png"
              alt="HealthSense Logo"
              className="h-10 w-10 object-contain rounded-2xl drop-shadow-sm group-hover:scale-105 transition-all duration-200 shrink-0"
            />
          )}
          <span
            className={`text-[8.5px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 border ${
              isStaff
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                : "bg-sky-500/20 text-sky-300 border-sky-400/40"
            }`}
          >
            {roleBadgeLabel}
          </span>
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent z-10 pb-2">
        <SidebarContent />
      </div>
    </aside>
  )
}
