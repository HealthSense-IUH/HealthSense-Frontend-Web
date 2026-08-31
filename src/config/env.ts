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
