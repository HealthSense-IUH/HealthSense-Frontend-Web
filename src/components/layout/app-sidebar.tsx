import { Link } from "react-router-dom"
import { Activity, HeartPulse } from "lucide-react"

import { useAppShell } from "./app-shell-context"
import { SidebarContent } from "./sidebar-content"

export function AppSidebar() {
  const { isCollapsed } = useAppShell()

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-[#070D1E] text-slate-200 transition-[width] duration-300 ease-in-out shadow-[4px_0_30px_rgba(0,0,0,0.5)] select-none ${
        isCollapsed ? "w-[76px]" : "w-64"
      }`}
    >
      {/* Dynamic Ambient Glow Behind Sidebar Header */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-rose-600/15 via-red-900/5 to-transparent pointer-events-none blur-xl" />

      {/* Header / Brand */}
      <div className="relative flex h-16 items-center border-b border-white/10 px-4 z-10">
        <Link
          to="/app/dashboard"
          className={`flex items-center gap-3 overflow-hidden font-bold transition-all duration-300 group ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#80091B] via-rose-600 to-[#80091B] text-white shadow-lg shadow-rose-900/50 border border-white/20 group-hover:scale-105 transition-transform duration-200">
            <HeartPulse className="h-5 w-5 text-white animate-pulse drop-shadow-md" />
            <div className="absolute inset-0 rounded-xl bg-rose-400/20 blur-xs" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white font-heading leading-tight uppercase drop-shadow-xs">
                HealthSense
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-rose-400">
                AI Cardiac Platform
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-10">
        <SidebarContent />
      </div>

      {/* Footer / System Health Telemetry Card */}
      <div className="relative border-t border-white/10 p-3 bg-white/[0.02] z-10">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-xs text-slate-300 shadow-lg backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <div className="flex-1 truncate font-medium">
              <span className="text-white font-bold">AI Core: </span>
              <span className="text-emerald-400 font-semibold font-mono text-[11px]">Active (99.99%)</span>
            </div>
            <Activity className="h-3.5 w-3.5 text-rose-400 shrink-0 animate-pulse drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          </div>
        ) : (
          <div className="flex justify-center py-1" title="AI Core: Active (99.99% Operational)">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

