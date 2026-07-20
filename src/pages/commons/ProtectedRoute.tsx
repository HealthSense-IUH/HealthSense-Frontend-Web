import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuthStore } from "@/features/auth/auth-store"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const userSession = useAuthStore((state) => state.userSession)

  if (!userSession) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
