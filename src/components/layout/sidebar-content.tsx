import { Link, useLocation } from "react-router-dom"
import { generalNavigationGroups, managementNavigationGroups, type NavigationItem } from "./nav-config"
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

  const isManagement = location.pathname.startsWith("/app/management") ||
    location.pathname.startsWith("/app/users") ||
    location.pathname.startsWith("/app/packages") ||
    location.pathname.startsWith("/app/health-records") ||
    location.pathname.startsWith("/app/doctor")

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
                <div className="my-2.5 w-8 mx-auto border-t border-slate-800" />
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
                          ? "bg-gradient-to-b from-sky-500/25 to-blue-600/20 text-white font-bold border border-sky-400/50 shadow-[0_0_14px_rgba(56,189,248,0.25)]"
                          : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className="relative">
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors ${
                            active ? "text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]" : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] ring-2 ring-[#0F172A]" />
                        )}
                      </div>
                      <span className={`text-[10px] text-center leading-tight mt-1 max-w-[76px] truncate tracking-tight ${active ? "font-bold text-white" : "font-semibold text-slate-400 group-hover:text-white"}`}>
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


