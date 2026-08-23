import { Link, useLocation, useNavigate } from "react-router-dom"
import { HeartPulse, ShieldCheck, ArrowRightLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { SidebarContent } from "./sidebar-content"

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isManagement =
    location.pathname.startsWith("/app/management") ||
    location.pathname.startsWith("/app/users") ||
    location.pathname.startsWith("/app/packages") ||
    location.pathname.startsWith("/app/health-records") ||
    location.pathname.startsWith("/app/doctor")

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen w-[92px] flex-col select-none transition-colors duration-300 ${
        isManagement
          ? "border-r border-indigo-900/50 bg-[#110E24] text-indigo-200 shadow-[4px_0_30px_rgba(79,70,229,0.12)]"
          : "border-r border-sky-950/60 bg-[#0B132B] text-slate-300 shadow-[4px_0_30px_rgba(14,165,233,0.12)]"
      }`}
    >
      {/* Dynamic Ambient Top Glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-36 pointer-events-none blur-2xl transition-all duration-500 ${
          isManagement
            ? "bg-gradient-to-b from-indigo-600/30 via-purple-600/15 to-transparent"
            : "bg-gradient-to-b from-sky-500/25 via-cyan-500/10 to-transparent"
        }`}
      />

      {/* Header / Brand with Scope Badge */}
      <div
        className={`relative flex flex-col items-center justify-center py-3.5 border-b z-10 transition-colors ${
          isManagement ? "border-indigo-900/50 bg-indigo-950/30" : "border-sky-950/60 bg-sky-950/20"
        }`}
      >
        <Link
          to={isManagement ? "/app/management" : "/app/dashboard"}
          className="flex flex-col items-center group"
          title={isManagement ? "HealthSense - Phân hệ Quản trị" : "HealthSense - Sức khỏe Người dùng"}
        >
            {isManagement ? (
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
              isManagement
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                : "bg-sky-500/20 text-sky-300 border-sky-400/40"
            }`}
          >
            {isManagement ? "ADMIN" : "MEMBER"}
          </span>
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent z-10 pb-2">
        <SidebarContent />
      </div>

      {/* Footer / Switch Scope Button */}
      <div
        className={`relative border-t p-2 z-10 flex flex-col items-center transition-colors ${
          isManagement ? "border-indigo-900/50 bg-indigo-950/50" : "border-sky-950/60 bg-slate-950/60"
        }`}
      >
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => navigate(isManagement ? "/app/dashboard" : "/app/management")}
                className={`group flex flex-col items-center justify-center w-full py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isManagement
                    ? "bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 hover:text-white border border-sky-500/40 hover:border-sky-400 shadow-xs shadow-sky-500/10"
                    : "bg-indigo-950/50 hover:bg-indigo-900/70 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-400 shadow-xs shadow-indigo-500/10"
                }`}
              >
                <div className="relative mb-0.5">
                  {isManagement ? (
                    <ArrowRightLeft className="h-4 w-4 text-sky-400 group-hover:rotate-180 transition-transform duration-300" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4 text-indigo-400 group-hover:rotate-180 transition-transform duration-300" />
                  )}
                </div>
                <span className="text-[9px] font-bold text-center leading-tight tracking-tight">
                  {isManagement ? "Về Người dùng" : "Sang Quản trị"}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={12}
              className="font-bold bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs py-1.5 px-3 rounded-xl z-50"
            >
              {isManagement
                ? "Chuyển về Bảng theo dõi sức khỏe người dùng (General)"
                : "Chuyển sang Quản trị hệ thống & Bác sĩ (Management)"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}





