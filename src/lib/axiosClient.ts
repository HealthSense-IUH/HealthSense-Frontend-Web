import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

import { env } from "@/config"
import { useAuthStore } from "@/features/auth/auth-store"
import type { ApiResponse, ErrorResponse } from "@/types/base"
import type { LoginResponse } from "@/types/authentication"

const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

function isAuthEndpoint(url?: string) {
  return Boolean(
    url?.includes("/api/auth/login") ||
      url?.includes("/api/auth/register") ||
      url?.includes("/api/auth/refresh")
  )
}

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post<ApiResponse<LoginResponse>>(`${env.API_BASE_URL}/api/auth/refresh`, undefined, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      const authData = response.data.data
      useAuthStore.getState().setAuthenticatedSession(
        authData.accessToken,
        authData.userSession
      )
      return authData.accessToken
    })
    .catch(() => {
      useAuthStore.getState().clearAuth()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true

      const newToken = await refreshAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      }

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login")
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
