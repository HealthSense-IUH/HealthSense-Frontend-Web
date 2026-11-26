import { Link, useLocation } from "react-router-dom"
import { allNavigationGroups, isManagementGroup, isManagementPath, type NavigationItem } from "./nav-config"
import { useAppShell } from "./app-shell-context"
import { useNavLabel } from "./use-nav-label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SidebarContent() {
  const location = useLocation()
  const { effectiveRole } = useAppShell()
  const { itemLabel, itemShortLabel } = useNavLabel()

  // Staff có cả hai phân hệ: chỉ hiện nhóm của phân hệ đang đứng, chuyển phân hệ bằng nút trên topbar
  const inManagement = isManagementPath(location.pathname)
  const currentGroups = allNavigationGroups.filter((group) => isManagementGroup(group.id) === inManagement)

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
                <div className="my-2.5 w-8 mx-auto border-t border-shell-border" />
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
                      className={`group relative flex flex-col items-center justify-center w-full py-2.5 px-1 rounded-xl transition-colors ${
                        active
                          ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200/70"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-600" aria-hidden="true" />
                      )}
                      <div className="relative">
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors ${
                            active ? "text-primary-700" : "text-slate-500 group-hover:text-slate-800"
                          }`}
                        />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-shell" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] text-center leading-tight mt-1 max-w-[76px] truncate tracking-tight ${
                          active ? "font-bold text-primary-800" : "font-medium text-slate-600 group-hover:text-slate-900"
                        }`}
                      >
                        {itemShortLabel(item)}
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
                        className="font-semibold bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg z-50"
                      >
                        {itemLabel(item)}
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


