import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuthStore } from "@/features/auth/auth-store"
import type { UserRole } from "@/types/authentication"

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/app/dashboard" }: ProtectedRouteProps) {
  const location = useLocation()
  const userSession = useAuthStore((state) => state.userSession)

  if (!userSession) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = userSession.role
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to={redirectTo} replace />
    }
  }

  return children
}
