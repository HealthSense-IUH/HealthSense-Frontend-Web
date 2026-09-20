import { Navigate, Outlet, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuthStore } from "@/stores/auth-store"
import { getDefaultRouteForRole } from "@/constants"
import type { UserRole } from "@/types/auth"

type ProtectedRouteProps = {
  /** Không truyền children => dùng làm layout route, render <Outlet /> cho route con */
  children?: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const location = useLocation()
  const userSession = useAuthStore((state) => state.userSession)

  if (!userSession) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = userSession.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      const fallbackTarget = redirectTo ?? getDefaultRouteForRole(userRole)
      return <Navigate to={fallbackTarget} replace />
    }
  }

  return children ?? <Outlet />
}
