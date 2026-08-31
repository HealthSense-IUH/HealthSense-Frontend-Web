import { useState, useMemo, useCallback, type ReactNode } from "react"

import { useAuthStore } from "@/stores/auth-store"
import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"
import { AppShellContext } from "./app-shell-context"

export function AppShellProvider({ children }: { children: ReactNode }) {
  const userSession = useAuthStore((state) => state.userSession)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)
  const [demoRole, setDemoRole] = useState<UserRole | null>(null)

  const realRole = userSession?.role || USER_ROLES.MEMBER

  const effectiveRole = import.meta.env.DEV && demoRole ? demoRole : realRole

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const contextValue = useMemo(
    () => ({
      isCollapsed,
      toggleSidebar,
      setIsCollapsed,
      effectiveRole,
      demoRole,
      setDemoRole,
      realRole,
    }),
    [isCollapsed, toggleSidebar, effectiveRole, demoRole, realRole]
  )

  return (
    <AppShellContext.Provider value={contextValue}>
      {children}
    </AppShellContext.Provider>
  )
}
