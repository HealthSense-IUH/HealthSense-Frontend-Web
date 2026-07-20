import { create } from "zustand"

import type { UserSession } from "@/types/authentication"

const USER_SESSION_STORAGE_KEY = "healthsense:user-session"

type AuthState = {
  accessToken: string | null
  userSession: UserSession | null
  setAccessToken: (accessToken: string | null) => void
  setUserSession: (userSession: UserSession | null) => void
  setAuthenticatedSession: (accessToken: string, userSession: UserSession) => void
  clearAuth: () => void
}

function readStoredUserSession() {
  if (typeof window === "undefined") {
    return null
  }

  const rawSession = window.localStorage.getItem(USER_SESSION_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as UserSession
  } catch {
    window.localStorage.removeItem(USER_SESSION_STORAGE_KEY)
    return null
  }
}

function persistUserSession(userSession: UserSession | null) {
  if (typeof window === "undefined") {
    return
  }

  if (userSession) {
    window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(userSession))
    return
  }

  window.localStorage.removeItem(USER_SESSION_STORAGE_KEY)
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userSession: readStoredUserSession(),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUserSession: (userSession) => {
    persistUserSession(userSession)
    set({ userSession })
  },
  setAuthenticatedSession: (accessToken, userSession) => {
    persistUserSession(userSession)
    set({ accessToken, userSession })
  },
  clearAuth: () => {
    persistUserSession(null)
    set({ accessToken: null, userSession: null })
  },
}))
