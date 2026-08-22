import { useState, useMemo, useCallback, type ReactNode } from "react"

import { useAuthStore } from "@/features/auth/auth-store"
import { USER_ROLES, type UserRole } from "@/types/authentication"
import { AppShellContext } from "./app-shell-context"

export function AppShellProvider({ children }: { children: ReactNode }) {
  const userSession = useAuthStore((state) => state.userSession)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)
  const [demoRole, setDemoRole] = useState<UserRole | null>(null)

  const realRole = userSession?.role || USER_ROLES.SUPER_ADMIN

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
