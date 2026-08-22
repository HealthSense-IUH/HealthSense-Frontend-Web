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
      className="fixed left-0 top-0 z-40 flex h-screen w-[92px] flex-col border-r border-slate-800/80 bg-[#0F172A] text-slate-300 shadow-[4px_0_30px_rgba(0,0,0,0.15)] select-none"
    >
      {/* Dynamic Ambient Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-500/20 via-blue-600/10 to-transparent pointer-events-none blur-xl" />

      {/* Header / Brand */}
      <div className="relative flex h-16 items-center justify-center border-b border-slate-800/80 px-2 z-10">
        <Link
          to={isManagement ? "/app/management" : "/app/dashboard"}
          className="flex items-center justify-center group"
          title="HealthSense - AI Cardiac Platform"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 text-white shadow-md shadow-sky-500/30 group-hover:scale-105 transition-transform duration-200">
            <HeartPulse className="h-5 w-5 text-white animate-pulse drop-shadow-xs" />
          </div>
        </Link>
      </div>

      {/* Navigation Content Area */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent z-10 pb-2">
        <SidebarContent />
      </div>

      {/* Footer / Switch Scope Button */}
      <div className="relative border-t border-slate-800/80 p-2 bg-slate-950/50 z-10 flex flex-col items-center">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => navigate(isManagement ? "/app/dashboard" : "/app/management")}
                className={`group flex flex-col items-center justify-center w-full py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isManagement
                    ? "bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 shadow-xs shadow-sky-500/20"
                    : "bg-white/[0.05] hover:bg-white/[0.1] hover:text-white text-slate-300 border border-white/10 shadow-2xs"
                }`}
              >
                <div className="relative mb-0.5">
                  {isManagement ? (
                    <ArrowRightLeft className="h-4 w-4 text-sky-400 group-hover:rotate-180 transition-transform duration-300" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-sky-400 group-hover:scale-110 transition-transform duration-200" />
                  )}
                </div>
                <span className="text-[9.5px] font-bold text-center leading-tight tracking-tight">
                  {isManagement ? "Người dùng" : "Quản trị"}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={12}
              className="font-bold bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs py-1.5 px-3 rounded-xl z-50"
            >
              {isManagement
                ? "Chuyển về Sức khỏe người dùng (General)"
                : "Chuyển sang Quản trị hệ thống (Management)"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}





