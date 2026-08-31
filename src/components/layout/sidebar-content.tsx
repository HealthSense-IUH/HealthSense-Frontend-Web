import { Link, useLocation } from "react-router-dom"
import { generalNavigationGroups, isManagementPath, managementNavigationGroups, type NavigationItem } from "./nav-config"
import { useAppShell } from "./app-shell-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SidebarContent() {
  const location = useLocation()
  const { effectiveRole } = useAppShell()

  const isManagement = isManagementPath(location.pathname)

  const currentGroups = isManagement ? managementNavigationGroups : generalNavigationGroups

  function isItemActive(item: NavigationItem): boolean {
    if (item.exact) {
      return location.pathname === item.href
    }
    return location.pathname.startsWith(item.href) && item.href !== "/"
  }

  return (
    <TooltipProvider delayDuration={150}>
      <nav className="flex-1 space-y-4 px-2 py-3">
        {currentGroups.map((group, groupIdx) => {
          // Filter items by allowedRoles using effectiveRole
          const visibleItems = group.items.filter((item) =>
            item.allowedRoles.includes(effectiveRole)
          )

          if (visibleItems.length === 0) {
            return null
          }

          return (
            <div key={group.id} className="space-y-1.5">
              {groupIdx > 0 && (
                <div
                  className={`my-2.5 w-8 mx-auto border-t transition-colors ${
                    isManagement ? "border-indigo-900/50" : "border-sky-950/60"
                  }`}
                />
              )}

              <div className="space-y-1.5">
                {visibleItems.map((item) => {
                  const active = isItemActive(item)
                  const Icon = item.icon
                  
                  const visibleSubItems = item.subItems?.filter(sub => sub.allowedRoles.includes(effectiveRole)) || []
                  const hasVisibleSubItems = visibleSubItems.length > 0
                  const targetHref = hasVisibleSubItems ? visibleSubItems[0].href : item.href

                  const linkElement = (
                    <Link
                      to={targetHref}
                      className={`group relative flex flex-col items-center justify-center w-full py-2.5 px-1 rounded-2xl transition-all duration-200 ${
                        active
                          ? isManagement
                            ? "bg-gradient-to-b from-indigo-500/35 to-purple-600/25 text-white font-bold border border-indigo-400/60 shadow-[0_0_15px_rgba(129,140,248,0.35)]"
                            : "bg-gradient-to-b from-sky-500/25 to-cyan-500/20 text-white font-bold border border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                          : isManagement
                          ? "text-indigo-200/60 hover:bg-white/[0.08] hover:text-white"
                          : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className="relative">
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors ${
                            active
                              ? isManagement
                                ? "text-indigo-200 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                                : "text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        {item.badge && (
                          <span
                            className={`absolute -top-1 -right-1.5 h-2 w-2 rounded-full ring-2 ${
                              isManagement
                                ? "bg-indigo-400 shadow-[0_0_8px_#818cf8] ring-[#110E24]"
                                : "bg-sky-400 shadow-[0_0_8px_#38bdf8] ring-[#0B132B]"
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[10px] text-center leading-tight mt-1 max-w-[76px] truncate tracking-tight ${
                          active
                            ? "font-bold text-white"
                            : isManagement
                            ? "font-semibold text-indigo-200/70 group-hover:text-white"
                            : "font-semibold text-slate-400 group-hover:text-white"
                        }`}
                      >
                        {item.shortTitle || item.title}
                      </span>
                    </Link>
                  )

                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild className="w-full">
                        {linkElement}
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        className="font-bold bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs py-1.5 px-3 rounded-xl z-50"
                      >
                        {item.title}
                        {item.badge ? ` (${item.badge})` : ""}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}


