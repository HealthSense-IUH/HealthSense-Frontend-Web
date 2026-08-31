import { Navigate, Outlet } from "react-router-dom"

import { useAuthStore } from "@/stores/auth-store"

export function GuestOnlyRoute() {
  const userSession = useAuthStore((state) => state.userSession)

  if (userSession) {
    return <Navigate to="/app/general/dashboard" replace />
  }

  return <Outlet />
}
