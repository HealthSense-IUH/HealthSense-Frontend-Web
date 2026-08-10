import { useEffect, useRef } from "react"

import { useAuthStore } from "@/features/auth/auth-store"
import { refreshAccessToken } from "@/lib/axiosClient"

export function AuthBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const userSession = useAuthStore((state) => state.userSession)
  
  const hasAttemptedRefresh = useRef(false)

  useEffect(() => {
    if (accessToken || !userSession || hasAttemptedRefresh.current) {
      return
    }

    hasAttemptedRefresh.current = true
    refreshAccessToken()
  }, [accessToken, userSession])

  return null
}
