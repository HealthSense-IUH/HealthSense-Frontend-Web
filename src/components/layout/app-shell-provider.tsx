import { useState, type ReactNode } from "react"

import { useAuthStore } from "@/features/auth/auth-store"
import { USER_ROLES, type UserRole } from "@/types/authentication"
import { AppShellContext } from "./app-shell-context"

export function AppShellProvider({ children }: { children: ReactNode }) {
  const userSession = useAuthStore((state) => state.userSession)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)
  const [demoRole, setDemoRole] = useState<UserRole | null>(null)

  const realRole = userSession?.role || USER_ROLES.SUPER_ADMIN

  const effectiveRole = import.meta.env.DEV && demoRole ? demoRole : realRole

  function toggleSidebar() {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <AppShellContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setIsCollapsed,
        effectiveRole,
        demoRole,
        setDemoRole,
        realRole,
      }}
    >
      {children}
    </AppShellContext.Provider>
  )
}
