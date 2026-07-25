import { createContext, useContext } from "react"
import type { UserRole } from "@/types/authentication"

export interface AppShellContextValue {
  isCollapsed: boolean
  toggleSidebar: () => void
  setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
  effectiveRole: UserRole
  demoRole: UserRole | null
  setDemoRole: (role: UserRole | null) => void
  realRole: UserRole
}

export const AppShellContext = createContext<AppShellContextValue | null>(null)

export function useAppShell(): AppShellContextValue {
  const context = useContext(AppShellContext)
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider")
  }
  return context
}
