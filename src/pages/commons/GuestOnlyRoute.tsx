import { Navigate, Outlet } from "react-router-dom"

import { useAuthStore } from "@/features/auth/auth-store"

export function GuestOnlyRoute() {
  const userSession = useAuthStore((state) => state.userSession)

  if (userSession) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}
