import { Link, useLocation } from "react-router-dom"
import { navigationGroups, type NavigationItem } from "./nav-config"
import { useAppShell } from "./app-shell-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SidebarContent() {
  const location = useLocation()
  const { isCollapsed, effectiveRole } = useAppShell()

  function isItemActive(item: NavigationItem): boolean {
    if (item.exact) {
      return location.pathname === item.href
    }
    return location.pathname.startsWith(item.href) && item.href !== "/"
  }

  return (
    <TooltipProvider delayDuration={150}>
      <nav className="flex-1 space-y-6 px-3 py-4">
        {navigationGroups.map((group) => {
          // Filter items by allowedRoles using effectiveRole
          const visibleItems = group.items.filter((item) =>
            item.allowedRoles.includes(effectiveRole)
          )

          if (visibleItems.length === 0) {
            return null
          }

          return (
            <div key={group.id} className="space-y-1">
              {!isCollapsed ? (
                <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {group.title}
                </h3>
              ) : (
                <div className="my-2 border-t border-slate-200/60 mx-2" />
              )}

              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isItemActive(item)
                  const Icon = item.icon

                  const linkContent = (
                    <Link
                      to={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-xs"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      } ${isCollapsed ? "justify-center px-2" : ""}`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 transition-colors ${
                          active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-800"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.title}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            active
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200/80 text-slate-700 group-hover:bg-slate-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                      )}
                    </Link>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild className="relative">
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8} className="font-medium bg-slate-900 text-white border-slate-800 shadow-xl">
                          {item.title}
                          {item.badge ? ` (${item.badge})` : ""}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return <div key={item.id}>{linkContent}</div>
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
