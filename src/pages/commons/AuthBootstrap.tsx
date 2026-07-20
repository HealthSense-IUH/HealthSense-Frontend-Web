import { useEffect } from "react"

import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"

export function AuthBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const userSession = useAuthStore((state) => state.userSession)
  const setAuthenticatedSession = useAuthStore((state) => state.setAuthenticatedSession)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    if (accessToken || !userSession) {
      return
    }

    let isMounted = true

    authApi
      .refresh()
      .then((response) => {
        if (isMounted) {
          setAuthenticatedSession(response.data.accessToken, response.data.userSession)
        }
      })
      .catch(() => {
        if (isMounted) {
          clearAuth()
        }
      })

    return () => {
      isMounted = false
    }
  }, [accessToken, clearAuth, setAuthenticatedSession, userSession])

  return null
}
