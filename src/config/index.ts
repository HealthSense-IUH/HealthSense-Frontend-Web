/**
 * Application Configuration
 * Khoi tao cac thiet lap chay 1 lan khi boot app
 */

function readBooleanEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback
  }

  return value.toLowerCase() === "true"
}

export const env = {
  // Base URL cho HealthSense API Service
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",

  // Moi truong chay
  NODE_ENV: import.meta.env.MODE || "development",

  // Feature flags
  ENABLE_MOCK_DATA: readBooleanEnv(import.meta.env.VITE_ENABLE_MOCK_DATA, false),
}

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
}
