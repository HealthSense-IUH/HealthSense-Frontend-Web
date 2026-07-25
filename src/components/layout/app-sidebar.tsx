import { Link } from "react-router-dom"
import { Activity, HeartPulse } from "lucide-react"

import { useAppShell } from "./app-shell-context"
import { SidebarContent } from "./sidebar-content"

export function AppSidebar() {
  const { isCollapsed } = useAppShell()

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200/80 bg-white transition-[width] duration-300 ease-in-out shadow-[0_0_15px_rgba(0,0,0,0.02)] ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Header / Brand */}
      <div className="flex h-16 items-center border-b border-slate-200/60 px-4">
        <Link
          to="/app/dashboard"
          className={`flex items-center gap-3 overflow-hidden font-bold transition-all duration-300 ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-sm shadow-blue-500/25">
            <HeartPulse className="h-6 w-6 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                HealthSense
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">
                Healthcare SaaS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <SidebarContent />
      </div>

      {/* Footer / System Health indicator */}
      <div className="border-t border-slate-200/60 p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200/60 p-2.5 text-xs text-slate-600">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <div className="flex-1 truncate font-medium">
              <span className="text-slate-800 font-semibold">Platform: </span>
              Operational
            </div>
            <Activity className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center py-1" title="System Status: Operational">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
